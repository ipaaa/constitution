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
  OPTIONAL_PUBLISHED_FIELDS,
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
  // 選填發布欄位：有值才計入指紋（feature 064）。
  track2Optional: Object.freeze(['case_ref', 'stance']),
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

test('Track 2 選填發布欄位與 design.md 的發布欄位範圍表逐字相同，Node 與 Apps Script 兩端都是', () => {
  assert.deepEqual([...OPTIONAL_PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2]], [...DESIGN_PROJECTION.track2Optional]);
  const gsOptional = vm.runInContext('OPTIONAL_APPROVAL_FIELDS', loadAppsScript());
  assert.deepEqual(Object.keys(gsOptional), [SHEET_KEYS.TRACK_2]);
  assert.deepEqual([...gsOptional[SHEET_KEYS.TRACK_2]], [...DESIGN_PROJECTION.track2Optional]);
  // 每個選填欄位有值時都進投影，排在 13 欄之後、__sequence 之前。
  const filled = Object.fromEntries(DESIGN_PROJECTION.track2Optional.map(field => [field, `${field}-value`]));
  const fields = JSON.parse(fingerprintPayload(SHEET_KEYS.TRACK_2, { ...TRACK_2, ...filled }, 1))[2].map(([field]) => field);
  assert.deepEqual(fields, [...DESIGN_PROJECTION.track2, ...DESIGN_PROJECTION.track2Optional, '__sequence']);
  // Apps Script 端逐欄：填一個選填欄位就改變指紋，且與 Node 相同。
  const { CONTENT_FINGERPRINT } = loadAppsScript();
  const blank = CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...gsArgs(SHEET_KEYS.TRACK_2, TRACK_2, 1));
  DESIGN_PROJECTION.track2Optional.forEach((field, index) => {
    const optionalArgs = DESIGN_PROJECTION.track2Optional.map((_, i) => (i === index ? 'x' : ''));
    const gs = CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...gsArgs(SHEET_KEYS.TRACK_2, TRACK_2, 1), ...optionalArgs);
    assert.notEqual(gs, blank, field);
    assert.equal(gs, fingerprintPublishedRow(SHEET_KEYS.TRACK_2, { ...TRACK_2, [field]: 'x' }, 1), field);
  });
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

// ---------------------------------------------------------------------------
// 070：未算完快照的重抓，與入口判斷
// ---------------------------------------------------------------------------

/** 路徑 → 回應陣列。第 n 次請求回應第 min(n, 長度) 個元素。counts 記錄每個路徑的請求次數。 */
async function withSequenceServer(sequences, callback) {
  const counts = {};
  const server = http.createServer((request, response) => {
    counts[request.url] = (counts[request.url] || 0) + 1;
    const responses = sequences[request.url];
    const body = responses ? responses[Math.min(counts[request.url], responses.length) - 1] : undefined;
    response.writeHead(body === undefined ? 404 : 200, { 'content-type': 'text/csv; charset=utf-8' });
    response.end(body ?? 'missing');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    return { counts, value: await callback(`http://127.0.0.1:${port}`) };
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

async function execSync(script, env) {
  try {
    const child = await execFileAsync(process.execPath, [script], {
      cwd: path.resolve('.'),
      env: { ...process.env, CONTENT_SYNC_RETRY_DELAY_SCALE: '0', ...env },
    });
    return { code: 0, ...child };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

/** 同 runSync，但每個路徑可以依請求次數換回應，並回報請求次數。 */
async function runSequencedSync(sequences, { script = 'scripts/sync-content.mjs', env = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'approval-retry-'));
  const output = path.join(root, 'data');
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'history.json'), 'history-before');
  fs.writeFileSync(path.join(output, 'discussions.json'), 'discussions-before');
  const { counts, value } = await withSequenceServer(sequences, base => execSync(script, {
    TRACK_1_CSV_URL: `${base}/track1.csv`,
    TRACK_2_CSV_URL: `${base}/track2.csv`,
    SITE_TLDR_CSV_URL: `${base}/site.csv`,
    CONTENT_OUTPUT_DIR: output,
    ...env,
  }));
  const read = name => fs.readFileSync(path.join(output, name), 'utf8');
  return { ...value, counts, history: read('history.json'), discussions: read('discussions.json') };
}

/** 每個路徑都只有一種回應，除非 overrides 指定該路徑的回應序列。 */
function sequenced(base, overrides = {}) {
  return Object.fromEntries(Object.entries(base).map(([url, csv]) => [url, overrides[url] || [csv]]));
}

const SECOND = { ...TRACK_2, id: 'd2', title: '第二筆', link: 'https://example.test/d2' };
const approvedTrack2 = (records = [TRACK_2, SECOND]) => records.map((record, index) => approve(SHEET_KEYS.TRACK_2, record, index + 1));
/** Risk evidence 實測到的形狀：兩個衍生欄同時是未算完值，其餘格子不變。 */
const pendingRow = (record, value = '載入中…') => ({ ...record, status: value, current_fingerprint: value });

const NORMAL = fixtureCsv({ track2: approvedTrack2() });
const [N1, N2] = approvedTrack2();
const PENDING_TRACK2 = fixtureCsv({ track2: [N1, pendingRow(N2)] })['/track2.csv'];

function lastLine(text) {
  return text.trimEnd().split('\n').at(-1);
}

function assertNotWritten(result) {
  assert.equal(result.history, 'history-before');
  assert.equal(result.discussions, 'discussions-before');
}

test('AC-1 未算完快照兩次後成功，輸出與一次成功逐位元組相同', async () => {
  const baseline = await runSequencedSync(sequenced(NORMAL));
  assert.equal(baseline.code, 0, baseline.stderr);
  const flaky = await runSequencedSync(sequenced(NORMAL, {
    '/track2.csv': [PENDING_TRACK2, PENDING_TRACK2, NORMAL['/track2.csv']],
  }));
  assert.equal(flaky.code, 0, flaky.stderr);
  assert.equal(flaky.discussions, baseline.discussions);
  assert.equal(flaky.history, baseline.history);
  assert.deepEqual(flaky.counts, { '/track1.csv': 1, '/track2.csv': 3, '/site.csv': 1 });
  assert.match(flaky.stdout, /✅ Track 2 第 3 次抓到算完的發布版。/);
  assert.ok(flaky.stdout.includes('⏳ Track 2 的發布版還沒算完：1 列的 status／current_fingerprint 顯示「載入中…」。10 秒後重抓（第 2／8 次）。'), flaky.stdout);
});

test('AC-2 未算完快照用盡時 exit 1、請求恰 8 次、訊息可辨識、零寫入', async () => {
  const result = await runSequencedSync(sequenced(NORMAL, { '/track2.csv': [PENDING_TRACK2] }));
  assert.equal(result.code, 1);
  assert.equal(result.counts['/track2.csv'], 8);
  assert.match(result.stderr, /快照/);
  assert.match(result.stderr, /發布版連續 8 次都還沒算完：1 列的 status／current_fingerprint 顯示「載入中…」/);
  assert.match(lastLine(result.stderr), /不是內容錯誤/);
  assert.doesNotMatch(result.stderr, /status 必須是/);
  assert.doesNotMatch(result.stderr, /與目前發布內容不符/);
  assertNotWritten(result);
});

// 核可後才改的 abstract；三份指紋仍是核可當時的值。
const MISMATCHED = [{ ...N1, abstract: '核可之後才改的摘要' }, N2];

test('AC-3 算完的快照內容不符時只抓一次並整份中止', async () => {
  const result = await runSequencedSync(sequenced(fixtureCsv({ track2: MISMATCHED })));
  assert.equal(result.code, 1);
  assert.equal(result.counts['/track2.csv'], 1);
  assert.match(result.stderr, /與目前發布內容不符。需要重新核可。/);
  assert.match(lastLine(result.stderr), /請修正 SSOT 後重試。$/);
  assertNotWritten(result);
});

test('AC-4 重抓後取得的快照仍須通過完整驗證', async () => {
  const settled = fixtureCsv({ track2: MISMATCHED })['/track2.csv'];
  const pending = fixtureCsv({ track2: [MISMATCHED[0], pendingRow(MISMATCHED[1])] })['/track2.csv'];
  const result = await runSequencedSync(sequenced(NORMAL, { '/track2.csv': [pending, settled] }));
  assert.equal(result.code, 1);
  assert.equal(result.counts['/track2.csv'], 2);
  assert.match(result.stderr, /與目前發布內容不符/);
  assert.doesNotMatch(result.stderr, /發布版連續/);
  assertNotWritten(result);
});

test('AC-5 未算完快照與後續快照內容投影不同時中止', async () => {
  const edited = fixtureCsv({ track2: approvedTrack2([TRACK_2, { ...SECOND, title: '重抓期間改過的標題' }]) })['/track2.csv'];
  const result = await runSequencedSync(sequenced(NORMAL, { '/track2.csv': [PENDING_TRACK2, edited] }));
  assert.equal(result.code, 1);
  assert.match(result.stderr, /重抓期間發布內容改變了（第 1 次與第 2 次不同）/);
  assert.match(lastLine(result.stderr), /不是內容錯誤/);
  assertNotWritten(result);
});

test('AC-6 #NAME? 與載入中…同樣處理；內容欄裡的「載入中…」不觸發重抓', async t => {
  await t.test('(a) site_tldr 的 status 為 #NAME?', async () => {
    const site = [approve(SHEET_KEYS.SITE_TLDR, TLDR_HEADING), approve(SHEET_KEYS.SITE_TLDR, TLDR_POINT)];
    const nameError = fixtureCsv({ track2: approvedTrack2(), site: site.map(record => ({ ...record, status: '#NAME?' })) })['/site.csv'];
    const result = await runSequencedSync(sequenced(NORMAL, { '/site.csv': [nameError, nameError, NORMAL['/site.csv']] }));
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.counts['/site.csv'], 3);
    assert.match(result.stdout, /site_tldr 的發布版還沒算完：2 列的 status 顯示「#NAME\?」/);
  });
  await t.test('(b) abstract 內容就是「載入中…」', async () => {
    const result = await runSequencedSync(sequenced(fixtureCsv({ track2: approvedTrack2([{ ...TRACK_2, abstract: '載入中…' }, SECOND]) })));
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.counts['/track2.csv'], 1);
    assert.match(result.discussions, /"abstract": "載入中…"/);
  });
});

test('AC-7(a) 驗證本身沒有放寬：未算完快照直接交給 buildTrack2 仍被擋下', async () => {
  const { buildTrack2 } = await import('../scripts/sync-content.mjs');
  const errors = [];
  assert.equal(buildTrack2(PENDING_TRACK2, errors), null);
  assert.ok(errors.some(error => error.message === 'status 必須是 Approved、Rejected、Needs review 或空白，實際為「載入中…」。'), JSON.stringify(errors));
});

test('fetchSettledCSV 依規格的間隔等待，網路錯誤不重抓', async () => {
  const { fetchSettledCSV } = await import('../scripts/sync-content.mjs');
  const waits = [];
  const io = {
    fetch: async () => new Response(PENDING_TRACK2),
    sleep: async ms => { waits.push(ms); },
    log: () => {},
    delayScale: 1,
  };
  const errors = [];
  assert.equal(await fetchSettledCSV({ group: 'Track 2', url: 'x' }, errors, io), null);
  assert.deepEqual(waits, [10, 10, 20, 30, 45, 60, 90].map(seconds => seconds * 1000));
  assert.deepEqual(errors.map(error => error.key), ['快照']);

  let calls = 0;
  const offline = { ...io, fetch: async () => { calls++; throw new Error('offline'); } };
  const networkErrors = [];
  assert.equal(await fetchSettledCSV({ group: 'Track 2', url: 'x' }, networkErrors, offline), null);
  assert.equal(calls, 1);
  assert.deepEqual(networkErrors.map(error => error.key), ['抓取']);
});

test('AC-9 入口判斷在路徑不一致時不可以 exit 0 而什麼都不做', async t => {
  // os.tmpdir() 在 macOS 是 /var/…，本身就是 /private/var/… 的符號連結；目錄連結本身涵蓋其他平台。
  // 連結指向 repo 的 scripts/，不複製檔案：本程式日後新增的相對 import 仍解析得到。
  // 輸出一律寫到 CONTENT_OUTPUT_DIR 的暫存目錄，不碰 src/data。
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-entry-'));
  const link = path.join(root, 'linked');
  fs.symlinkSync(path.resolve('scripts'), link, 'dir');
  const viaLink = path.join(link, 'sync-content.mjs');

  await t.test('(a) 經符號連結執行時正常同步', async () => {
    const direct = await runSequencedSync(sequenced(NORMAL));
    const linked = await runSequencedSync(sequenced(NORMAL), { script: viaLink });
    assert.equal(linked.code, 0, linked.stderr);
    assert.match(linked.stdout, /🚀 Starting Content Sync\.\.\./);
    assert.equal(linked.discussions, direct.discussions);
    assert.equal(linked.history, direct.history);
  });

  await t.test('(b) 經符號連結執行時，環境變數未設定仍然失敗', async () => {
    const result = await execSync(viaLink, { TRACK_1_CSV_URL: '', TRACK_2_CSV_URL: '', SITE_TLDR_CSV_URL: '' });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /環境變數未設定/);
  });

  await t.test('(c) 檔名相同、真實路徑不同 → mismatch，子程序 exit 1', async () => {
    const { resolveEntry } = await import('../scripts/sync-content.mjs');
    const realpath = file => file.replace('/alias/', '/real/');
    assert.equal(resolveEntry('/alias/scripts/sync-content.mjs', '/real/scripts/sync-content.mjs', realpath), 'run');
    assert.equal(resolveEntry('/a/sync-content.mjs', '/b/sync-content.mjs', realpath), 'mismatch');
    assert.equal(resolveEntry('/a/other.mjs', '/b/sync-content.mjs', realpath), 'import');
    assert.equal(resolveEntry(undefined, '/b/sync-content.mjs', realpath), 'import');
    assert.equal(resolveEntry('/a/sync-content.mjs', '/b/sync-content.mjs', () => { throw new Error('ENOENT'); }), 'mismatch');

    // 另一個也叫 sync-content.mjs 的檔案匯入本程式：argv[1] 的檔名相同，真實路徑不同。
    const impostorDir = path.join(root, 'impostor');
    fs.mkdirSync(impostorDir);
    const impostor = path.join(impostorDir, 'sync-content.mjs');
    fs.writeFileSync(impostor, `import ${JSON.stringify(path.resolve('scripts/sync-content.mjs'))};\n`);
    const result = await execSync(impostor, {});
    assert.equal(result.code, 1);
    assert.match(result.stderr, /⛔ 入口判斷失敗/);
    assert.doesNotMatch(result.stdout, /Starting Content Sync/);
  });

  await t.test('(d) 別的檔案匯入本程式時不觸發同步', async () => {
    const importer = path.join(root, 'importer.mjs');
    fs.writeFileSync(importer, `import ${JSON.stringify(path.resolve('scripts/sync-content.mjs'))};\n`);
    const result = await execSync(importer, {});
    assert.equal(result.code, 0, result.stderr);
    assert.doesNotMatch(result.stdout, /Starting Content Sync/);
    assert.equal(result.stderr, '');
  });
});
