import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import vm from 'node:vm';
import {
  fingerprintPayload,
  fingerprintPublishedRow,
  PUBLISHED_FIELDS,
  SHEET_KEYS,
} from '../scripts/content-fingerprint.mjs';

const execFileAsync = promisify(execFile);
const APPROVAL_FIELDS = [
  'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'reject_reason',
];
const TRACK_1 = {
  id: 'h1', category: '歷史', chapter: ' 第一章\r\n第二行 ', content: '內容', handwriting: '筆記',
  year: '1999', title: '標題', ruling: '解釋', ruling_id: '釋字 1', image_url: 'https://example.test/h1.jpg',
};
const TRACK_2 = {
  id: 'd1', category: '討論', title: '討論標題', author: '作者', year: '2026', abstract: '摘要',
  link: 'https://example.test/d1', views: '0012', owl_comment: '短評', owl_depth_comment: '深評',
  vibe: '🔥 公民必讀', sticky: '', full_content: '全文',
};
const TLDR_HEADING = { order: '0', label: '', text: '摘要標題', link: 'https://example.test/tldr' };
const TLDR_POINT = { order: '1', label: '重點', text: '重點內容', link: '' };

function approve(sheetKey, record, sequence) {
  const fingerprint = fingerprintPublishedRow(sheetKey, record, sequence);
  return {
    ...record,
    status: 'Approved', review_decision: 'Approved', review_fingerprint: fingerprint,
    approved_by: 'editor-id', approved_at: '2026-09-03T20:00:00.000Z',
    approved_fingerprint: fingerprint, current_fingerprint: fingerprint, reject_reason: '',
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, records) {
  return [headers, ...records.map(record => headers.map(header => record[header] ?? ''))]
    .map(row => row.map(csvCell).join(','))
    .join('\n');
}

function fixtureCsv(overrides = {}) {
  const track1 = overrides.track1 || [approve(SHEET_KEYS.TRACK_1, TRACK_1)];
  const track2Raw = overrides.track2Raw || [TRACK_2];
  const track2 = overrides.track2 || track2Raw.map((record, index) => approve(SHEET_KEYS.TRACK_2, record, index + 1));
  const siteRaw = overrides.siteRaw || [TLDR_HEADING, TLDR_POINT];
  const site = overrides.site || siteRaw.map(record => approve(SHEET_KEYS.SITE_TLDR, record));
  return {
    '/track1.csv': toCsv([...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_1], ...APPROVAL_FIELDS], track1),
    '/track2.csv': toCsv([...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2], ...APPROVAL_FIELDS], track2),
    '/site.csv': toCsv(['order', 'label', 'text', 'link', ...APPROVAL_FIELDS], site),
  };
}

async function withFixtureServer(fixtures, callback) {
  const server = http.createServer((request, response) => {
    response.writeHead(fixtures[request.url] ? 200 : 404, { 'content-type': 'text/csv; charset=utf-8' });
    response.end(fixtures[request.url] || 'missing');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

async function runSync(fixtures) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'approval-binding-'));
  const output = path.join(root, 'data');
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'history.json'), 'history-before');
  fs.writeFileSync(path.join(output, 'discussions.json'), 'discussions-before');
  let result;
  await withFixtureServer(fixtures, async base => {
    try {
      const child = await execFileAsync(process.execPath, ['scripts/sync-content.mjs'], {
        cwd: path.resolve('.'),
        env: {
          ...process.env,
          TRACK_1_CSV_URL: `${base}/track1.csv`,
          TRACK_2_CSV_URL: `${base}/track2.csv`,
          SITE_TLDR_CSV_URL: `${base}/site.csv`,
          CONTENT_OUTPUT_DIR: output,
        },
      });
      result = { code: 0, ...child };
    } catch (error) {
      result = { code: error.code, stdout: error.stdout, stderr: error.stderr };
    }
  });
  return { ...result, output, root };
}

test('fingerprint-v1 正規化 NFC、換行、trim、sticky、views 與 order', () => {
  const composed = { ...TRACK_2, title: ' café\r\n', sticky: '', views: '0012' };
  const decomposed = { ...TRACK_2, title: 'cafe\u0301\n', sticky: 'FALSE', views: '12' };
  assert.equal(fingerprintPublishedRow(SHEET_KEYS.TRACK_2, composed, 1), fingerprintPublishedRow(SHEET_KEYS.TRACK_2, decomposed, 1));
  assert.equal(
    fingerprintPublishedRow(SHEET_KEYS.SITE_TLDR, { ...TLDR_POINT, order: '001' }),
    fingerprintPublishedRow(SHEET_KEYS.SITE_TLDR, TLDR_POINT),
  );
  assert.match(fingerprintPayload(SHEET_KEYS.TRACK_1, TRACK_1), /^\["approval-content-v1"/);
});

test('Apps Script 與 Node 對三個分頁產生相同 fingerprint-v1', () => {
  const source = fs.readFileSync('scripts/apps-script/approval-workflow.gs', 'utf8');
  const context = {
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest(_algorithm, payload) {
        return [...createHash('sha256').update(payload, 'utf8').digest()].map(byte => byte > 127 ? byte - 256 : byte);
      },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const cases = [
    [SHEET_KEYS.TRACK_1, TRACK_1, PUBLISHED_FIELDS[SHEET_KEYS.TRACK_1].map(field => TRACK_1[field])],
    [SHEET_KEYS.TRACK_2, TRACK_2, [...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2].map(field => TRACK_2[field]), 1]],
    [SHEET_KEYS.SITE_TLDR, TLDR_HEADING, ['0', '', TLDR_HEADING.text, TLDR_HEADING.link]],
    [SHEET_KEYS.SITE_TLDR, TLDR_POINT, ['1', TLDR_POINT.label, TLDR_POINT.text, '']],
  ];
  for (const [sheetKey, record, values] of cases) {
    const sequence = sheetKey === SHEET_KEYS.TRACK_2 ? 1 : undefined;
    assert.equal(context.CONTENT_FINGERPRINT(sheetKey, ...values), fingerprintPublishedRow(sheetKey, record, sequence));
  }
});

test('每個發布欄位都會改變指紋，審核欄位不會', () => {
  for (const [sheetKey, record, sequence] of [
    [SHEET_KEYS.TRACK_1, TRACK_1, undefined],
    [SHEET_KEYS.TRACK_2, TRACK_2, 1],
  ]) {
    const baseline = fingerprintPublishedRow(sheetKey, record, sequence);
    for (const field of PUBLISHED_FIELDS[sheetKey]) {
      const changed = {
        ...record,
        [field]: field === 'sticky' ? 'true' : field === 'views' ? '13' : `${record[field] || ''}x`,
      };
      assert.notEqual(fingerprintPublishedRow(sheetKey, changed, sequence), baseline, `${sheetKey}.${field}`);
    }
    for (const field of APPROVAL_FIELDS) {
      assert.equal(fingerprintPublishedRow(sheetKey, { ...record, [field]: 'tampered' }, sequence), baseline, field);
    }
  }
  for (const record of [TLDR_HEADING, TLDR_POINT]) {
    const fields = record.order === '0' ? ['order', 'text', 'link'] : ['order', 'label', 'text'];
    const baseline = fingerprintPublishedRow(SHEET_KEYS.SITE_TLDR, record);
    for (const field of fields) {
      const value = field === 'order' ? (record.order === '0' ? '2' : '3') : `${record[field]}x`;
      assert.notEqual(fingerprintPublishedRow(SHEET_KEYS.SITE_TLDR, { ...record, [field]: value }), baseline, `site_tldr.${field}`);
    }
  }
});

test('有效核可維持網站 JSON shape，Track 2 保留來源順序', async () => {
  const second = { ...TRACK_2, id: 'd2', title: '第二筆', link: 'https://example.test/d2' };
  const result = await runSync(fixtureCsv({ track2Raw: [second, TRACK_2] }));
  assert.equal(result.code, 0, result.stderr);
  const discussions = JSON.parse(fs.readFileSync(path.join(result.output, 'discussions.json'), 'utf8'));
  assert.deepEqual(discussions.slice(0, 2).map(record => record.id), ['d2', 'd1']);
  assert.deepEqual(Object.keys(discussions[0]), ['id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment', 'owl_depth_comment', 'vibe', 'sticky', 'full_content']);
});

test('核可後逐一修改每個發布欄位都非零退出，且兩個輸出全不寫', async t => {
  const cases = [
    [SHEET_KEYS.TRACK_1, TRACK_1, PUBLISHED_FIELDS[SHEET_KEYS.TRACK_1]],
    [SHEET_KEYS.TRACK_2, TRACK_2, PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2]],
    [SHEET_KEYS.SITE_TLDR, TLDR_HEADING, ['order', 'text', 'link']],
    [SHEET_KEYS.SITE_TLDR, TLDR_POINT, ['order', 'label', 'text']],
  ];
  for (const [sheetKey, record, fields] of cases) {
    for (const field of fields) await t.test(`${sheetKey}.${record.order ?? record.id}.${field}`, async () => {
      const approved = approve(sheetKey, record, sheetKey === SHEET_KEYS.TRACK_2 ? 1 : undefined);
      const value = field === 'sticky' ? 'true' : field === 'order' ? '9' : `${record[field] || ''}x`;
      const changed = { ...approved, [field]: value };
      const overrides = sheetKey === SHEET_KEYS.TRACK_1 ? { track1: [changed] }
        : sheetKey === SHEET_KEYS.TRACK_2 ? { track2: [changed] }
          : { site: record.order === '0' ? [changed, approve(sheetKey, TLDR_POINT)] : [approve(sheetKey, TLDR_HEADING), changed] };
      const result = await runSync(fixtureCsv(overrides));
      assert.notEqual(result.code, 0);
      assert.equal(fs.readFileSync(path.join(result.output, 'history.json'), 'utf8'), 'history-before');
      assert.equal(fs.readFileSync(path.join(result.output, 'discussions.json'), 'utf8'), 'discussions-before');
    });
  }
});

test('缺漏或偽造核可紀錄全部拒絕，只有完整相符紀錄通過', async t => {
  const valid = approve(SHEET_KEYS.TRACK_1, TRACK_1);
  const invalid = [
    ['核可者缺漏', { ...valid, approved_by: '' }],
    ['時間缺漏', { ...valid, approved_at: '' }],
    ['時間格式錯誤', { ...valid, approved_at: '2026-02-31T20:00:00Z' }],
    ['review 指紋缺漏', { ...valid, review_fingerprint: '' }],
    ['approved 指紋缺漏', { ...valid, approved_fingerprint: '' }],
    ['偽造 Approved', { ...valid, review_decision: 'Rejected' }],
    ['錯誤指紋', { ...valid, current_fingerprint: '0'.repeat(64) }],
  ];
  for (const [name, record] of invalid) await t.test(name, async () => {
    const result = await runSync(fixtureCsv({ track1: [record] }));
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /核可|指紋|review_decision|approved_at/);
  });
  const result = await runSync(fixtureCsv());
  assert.equal(result.code, 0, result.stderr);
});

test('Track 2 移動非空列會使舊核可失效；空白列不參與序號', async () => {
  const second = { ...TRACK_2, id: 'd2', title: '第二筆', link: 'https://example.test/d2' };
  const approved = [approve(SHEET_KEYS.TRACK_2, TRACK_2, 1), approve(SHEET_KEYS.TRACK_2, second, 2)];
  const result = await runSync(fixtureCsv({ track2: approved.reverse() }));
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /fingerprint/);
});

test('原子寫入在第二個 rename 失敗時復原第一個檔案', async () => {
  const { writeOutputsAtomically } = await import('../scripts/sync-content.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'approval-atomic-'));
  fs.writeFileSync(path.join(root, 'history.json'), 'old-history');
  fs.writeFileSync(path.join(root, 'discussions.json'), 'old-discussions');
  let calls = 0;
  const injectedFs = Object.assign({}, fs, {
    renameSync(from, to) {
      calls++;
      if (calls === 4) throw new Error('injected second install failure');
      return fs.renameSync(from, to);
    },
  });
  assert.throws(
    () => writeOutputsAtomically(root, { 'history.json': 'new-history', 'discussions.json': 'new-discussions' }, injectedFs),
    /injected/,
  );
  assert.equal(fs.readFileSync(path.join(root, 'history.json'), 'utf8'), 'old-history');
  assert.equal(fs.readFileSync(path.join(root, 'discussions.json'), 'utf8'), 'old-discussions');
});
