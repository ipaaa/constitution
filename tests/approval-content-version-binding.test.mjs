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
// 逐字抄自 docs/content-pipeline/design.md 的「發布欄位範圍」表。
// 這份清單是設計的複本，不是從 scripts/ 匯入的衍生值：兩端一致地刪掉某個欄位時，
// 下面依這份清單逐欄位驗證的測試就會失敗。改動這份清單前，先改 design.md。
const DESIGN_PROJECTION = Object.freeze({
  track1: Object.freeze(['id', 'category', 'chapter', 'content', 'handwriting', 'year', 'title', 'ruling', 'ruling_id', 'image_url']),
  track2: Object.freeze(['id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment', 'owl_depth_comment', 'vibe', 'sticky', 'full_content']),
  tldrHeading: Object.freeze(['order', 'text', 'link']),
  tldrPoint: Object.freeze(['order', 'label', 'text']),
});
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

test('三個分頁的指紋投影與 design.md 的發布欄位範圍表逐字相同', () => {
  assert.deepEqual([...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_1]], [...DESIGN_PROJECTION.track1]);
  assert.deepEqual([...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2]], [...DESIGN_PROJECTION.track2]);
  const projected = (sheetKey, record, sequence) =>
    JSON.parse(fingerprintPayload(sheetKey, record, sequence))[2].map(([field]) => field);
  assert.deepEqual(projected(SHEET_KEYS.TRACK_1, TRACK_1), [...DESIGN_PROJECTION.track1]);
  assert.deepEqual(projected(SHEET_KEYS.TRACK_2, TRACK_2, 1), [...DESIGN_PROJECTION.track2, '__sequence']);
  assert.deepEqual(projected(SHEET_KEYS.SITE_TLDR, TLDR_HEADING), [...DESIGN_PROJECTION.tldrHeading]);
  assert.deepEqual(projected(SHEET_KEYS.SITE_TLDR, TLDR_POINT), [...DESIGN_PROJECTION.tldrPoint]);
});

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

function loadAppsScript() {
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
  vm.runInContext(fs.readFileSync('scripts/apps-script/approval-workflow.gs', 'utf8'), context);
  return context;
}

/** 依 CONTENT_FINGERPRINT 的固定參數順序組出試算表公式的引數。 */
function gsArgs(sheetKey, record, sequence) {
  if (sheetKey === SHEET_KEYS.SITE_TLDR) return [record.order, record.label ?? '', record.text, record.link ?? ''];
  const values = PUBLISHED_FIELDS[sheetKey].map(field => record[field] ?? '');
  return sheetKey === SHEET_KEYS.TRACK_2 ? [...values, sequence] : values;
}

test('Apps Script 與 Node 對三個分頁產生相同 fingerprint-v1', () => {
  const context = loadAppsScript();
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

test('APPROVAL_STATUS 只對真實曆日的完整紀錄顯示 Approved', () => {
  const { APPROVAL_STATUS } = loadAppsScript();
  const fingerprint = fingerprintPublishedRow(SHEET_KEYS.TRACK_1, TRACK_1);
  const status = approvedAt => APPROVAL_STATUS(fingerprint, 'Approved', fingerprint, 'editor-id', approvedAt, fingerprint);
  assert.equal(status('2026-09-03T20:00:00.000Z'), 'Approved');
  assert.equal(status('2026-09-03T20:00:00Z'), 'Approved');
  for (const invalid of ['2026-02-31T20:00:00.000Z', '2026-04-31T00:00:00Z', '2026-13-01T00:00:00.000Z', '2026-09-03T25:00:00.000Z', '2026-09-03 20:00:00', '']) {
    assert.equal(status(invalid), 'Needs review', invalid);
  }
  assert.equal(APPROVAL_STATUS(fingerprint, 'Approved', fingerprint, '', '2026-09-03T20:00:00.000Z', fingerprint), 'Needs review');
});

test('每個發布欄位都會改變指紋，審核欄位不會', () => {
  for (const [sheetKey, record, sequence, fields] of [
    [SHEET_KEYS.TRACK_1, TRACK_1, undefined, DESIGN_PROJECTION.track1],
    [SHEET_KEYS.TRACK_2, TRACK_2, 1, DESIGN_PROJECTION.track2],
  ]) {
    const baseline = fingerprintPublishedRow(sheetKey, record, sequence);
    for (const field of fields) {
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
    const fields = record.order === '0' ? DESIGN_PROJECTION.tldrHeading : DESIGN_PROJECTION.tldrPoint;
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
    [SHEET_KEYS.TRACK_1, TRACK_1, DESIGN_PROJECTION.track1],
    [SHEET_KEYS.TRACK_2, TRACK_2, DESIGN_PROJECTION.track2],
    [SHEET_KEYS.SITE_TLDR, TLDR_HEADING, DESIGN_PROJECTION.tldrHeading],
    [SHEET_KEYS.SITE_TLDR, TLDR_POINT, DESIGN_PROJECTION.tldrPoint],
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
      // 必須是指紋閘門擋下的，不是既有欄位格式檢查順手擋下的。
      assert.match(result.stderr, /與目前發布內容不符|無法計算內容指紋/);
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

test('核可後逐一修改每個發布欄位，衍生 status 都變成 Needs review', () => {
  const { CONTENT_FINGERPRINT, APPROVAL_STATUS } = loadAppsScript();
  const approvedAt = '2026-09-03T20:00:00.000Z';
  const cases = [
    [SHEET_KEYS.TRACK_1, TRACK_1, DESIGN_PROJECTION.track1, undefined],
    [SHEET_KEYS.TRACK_2, TRACK_2, DESIGN_PROJECTION.track2, 1],
    [SHEET_KEYS.SITE_TLDR, TLDR_HEADING, DESIGN_PROJECTION.tldrHeading, undefined],
    [SHEET_KEYS.SITE_TLDR, TLDR_POINT, DESIGN_PROJECTION.tldrPoint, undefined],
  ];
  for (const [sheetKey, record, fields, sequence] of cases) {
    const snapshot = CONTENT_FINGERPRINT(sheetKey, ...gsArgs(sheetKey, record, sequence));
    assert.match(snapshot, /^[a-f0-9]{64}$/);
    assert.equal(APPROVAL_STATUS(snapshot, 'Approved', snapshot, 'editor-id', approvedAt, snapshot), 'Approved');
    for (const field of fields) {
      const value = field === 'sticky' ? 'true' : field === 'order' ? '9' : `${record[field] || ''}x`;
      const current = CONTENT_FINGERPRINT(sheetKey, ...gsArgs(sheetKey, { ...record, [field]: value }, sequence));
      const label = `${sheetKey}.${record.order ?? record.id}.${field}`;
      assert.notEqual(current, snapshot, label);
      // 核可快照三欄維持原值，只有目前指紋改變。
      assert.equal(APPROVAL_STATUS(current, 'Approved', snapshot, 'editor-id', approvedAt, snapshot), 'Needs review', label);
    }
  }
});

test('放行判斷不依操作者身分：三種 approved_by 都擋下核可後被改的內容', async t => {
  const { CONTENT_FINGERPRINT, APPROVAL_STATUS } = loadAppsScript();
  const snapshot = CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_1, ...gsArgs(SHEET_KEYS.TRACK_1, TRACK_1));
  const edited = { ...TRACK_1, content: '核可之後才改的內容' };
  const current = CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_1, ...gsArgs(SHEET_KEYS.TRACK_1, edited));
  for (const actor of ['contributor-id', 'managing-editor-id', 'editor-id']) {
    await t.test(actor, async () => {
      assert.equal(APPROVAL_STATUS(current, 'Approved', snapshot, actor, '2026-09-03T20:00:00.000Z', snapshot), 'Needs review');
      const record = {
        ...approve(SHEET_KEYS.TRACK_1, TRACK_1), ...edited,
        approved_by: actor, current_fingerprint: current, status: 'Approved',
      };
      const result = await runSync(fixtureCsv({ track1: [record] }));
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /fingerprint|指紋/);
    });
  }
});

test('Track 2 序號與 Apps Script 同語意：只填 reject_reason 的列不佔序號', async () => {
  const retired = { reject_reason: '內容已下架' };
  const approved = approve(SHEET_KEYS.TRACK_2, TRACK_2, 1);
  const { PUBLISHED_ROW_SEQUENCE } = loadAppsScript();
  // 試算表端：d1 之前那列的發布欄位全空，所以 d1 的序號仍是 1。
  const columns = DESIGN_PROJECTION.track2.map(field => [retired[field] ?? '', TRACK_2[field]]);
  assert.equal(PUBLISHED_ROW_SEQUENCE(...columns), 1);
  // Node 端必須算出同一個序號，否則沒有人動過的 d1 會被誤判為需要重新核可。
  const baseline = await runSync(fixtureCsv({ track2: [approved] }));
  assert.equal(baseline.code, 0, baseline.stderr);
  const withRetiredRow = await runSync(fixtureCsv({ track2: [retired, approved] }));
  assert.equal(withRetiredRow.code, 0, withRetiredRow.stderr);
  assert.equal(
    fs.readFileSync(path.join(withRetiredRow.output, 'discussions.json'), 'utf8'),
    fs.readFileSync(path.join(baseline.output, 'discussions.json'), 'utf8'),
  );
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
