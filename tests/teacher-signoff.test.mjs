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
  fingerprintPublishedRow,
  fingerprintShortCode,
  PUBLISHED_FIELDS,
  SHEET_KEYS,
  SHORT_CODE_LENGTH,
} from '../scripts/content-fingerprint.mjs';
import { formatSignoffSummary, SIGNOFF_FIELDS, SIGNOFF_SHEETS, summarizeSignoffs } from '../scripts/teacher-signoff.mjs';

// feature 076 的驗收測試。040 的綁定測試另檔，本檔不改它。
// 老師代稱一律用「老師甲」這類代號，不寫真實人名或帳號（AC-10）。

const execFileAsync = promisify(execFile);
const T1 = SHEET_KEYS.TRACK_1;
const REVIEW_FIELDS = [
  'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'reject_reason',
];
const WRITABLE_REVIEW_FIELDS = REVIEW_FIELDS.filter(field => field !== 'status' && field !== 'current_fingerprint');
const ROW = {
  id: 'h1', category: '歷史', chapter: '第一章', content: '內容', handwriting: '筆記',
  year: '1999', title: '標題', ruling: '解釋', ruling_id: '釋字 1', image_url: 'https://example.test/h1.jpg',
};
const COMMENT_LINK = 'https://docs.google.com/spreadsheets/d/fixture/edit?disco=AAAA';

function approve(record, signoff = {}) {
  const fingerprint = fingerprintPublishedRow(T1, record);
  return {
    ...record,
    status: 'Approved', review_decision: 'Approved', review_fingerprint: fingerprint,
    approved_by: 'editor-id', approved_at: '2026-11-17T08:00:00.000Z',
    approved_fingerprint: fingerprint, current_fingerprint: fingerprint, reject_reason: '',
    signoff_by: '', signoff_ref: '', signoff_fingerprint: '',
    ...signoff,
  };
}

function signedBy(label, record) {
  return { signoff_by: label, signoff_ref: COMMENT_LINK, signoff_fingerprint: fingerprintPublishedRow(T1, record) };
}

const ALL_COLUMNS = { signoff_by: 0, signoff_ref: 1, signoff_fingerprint: 2 };

// ---------------------------------------------------------------------------
// 同步端判定（AC-2、AC-3）
// ---------------------------------------------------------------------------

test('AC-2 四列夾具：每個 Approved 列恰好落入有效、失效、未簽之一，並印出代稱與短碼', () => {
  const valid = approve({ ...ROW, id: 'h1' }, signedBy('老師甲', { ...ROW, id: 'h1' }));
  // 簽核後內容被改、又被重新核可（例如擁有者手打核可欄）：簽核的指紋還是舊版本。
  const old = { ...ROW, id: 'h2' };
  const edited = approve({ ...old, content: '改過的內容' }, signedBy('老師乙', old));
  const cleared = approve({ ...ROW, id: 'h3' }); // 不附老師的核可已清空三欄
  const never = approve({ ...ROW, id: 'h4' });
  const pending = { ...approve({ ...ROW, id: 'h5' }), status: 'Needs review' };
  const summary = summarizeSignoffs([valid, edited, cleared, never, pending], T1, ALL_COLUMNS);

  assert.deepEqual(summary.valid.map(row => [row.id, row.by, row.shortCode]), [['h1', '老師甲', fingerprintShortCode(valid.current_fingerprint)]]);
  assert.deepEqual(summary.invalid.map(row => [row.id, row.reason]), [['h2', '版本不符']]);
  assert.deepEqual(summary.unsigned.map(row => row.id), ['h3', 'h4']);

  const text = formatSignoffSummary(summary);
  assert.match(text, /有效 1 列、失效 1 列、未簽 2 列/);
  assert.match(text, new RegExp(`有效  h1  老師甲  版本 ${fingerprintShortCode(valid.current_fingerprint)}`));
  assert.match(text, new RegExp(`未簽  h4  目前版本 ${fingerprintShortCode(never.current_fingerprint)}`));
  assert.doesNotMatch(text, /h5/, 'Needs review 的列不進摘要');
});

test('AC-2 簽核欄不完整（有指紋、沒有代稱或連結）判為失效，不判為有效', () => {
  const noRef = approve(ROW, { ...signedBy('老師甲', ROW), signoff_ref: '' });
  const noBy = approve(ROW, { ...signedBy('老師甲', ROW), signoff_by: '' });
  for (const record of [noRef, noBy]) {
    const summary = summarizeSignoffs([record], T1, ALL_COLUMNS);
    assert.deepEqual(summary.invalid.map(row => row.reason), ['欄位不完整']);
    assert.equal(summary.valid.length, 0);
  }
});

test('AC-3 T1 每一個發布欄位改動後，簽核判為失效（版本不符）', () => {
  for (const field of PUBLISHED_FIELDS[T1]) {
    const changed = { ...ROW, [field]: `${ROW[field]}改` };
    const record = approve(changed, signedBy('老師甲', ROW));
    const summary = summarizeSignoffs([record], T1, ALL_COLUMNS);
    assert.deepEqual(summary.invalid.map(row => row.reason), ['版本不符'], field);
  }
});

test('只改簽核欄不改變指紋：三欄不在發布欄位內', () => {
  const base = fingerprintPublishedRow(T1, ROW);
  assert.equal(fingerprintPublishedRow(T1, { ...ROW, signoff_by: '老師甲', signoff_ref: COMMENT_LINK, signoff_fingerprint: 'x' }), base);
  for (const field of SIGNOFF_FIELDS) assert.ok(!PUBLISHED_FIELDS[T1].includes(field));
});

test('缺欄時不判定：全缺印一行說明，缺一部分指名缺哪幾欄', () => {
  const none = summarizeSignoffs([approve(ROW)], T1, {});
  assert.match(formatSignoffSummary(none), /T1 沒有簽核欄/);
  const partial = summarizeSignoffs([approve(ROW)], T1, { signoff_by: 0 });
  assert.match(formatSignoffSummary(partial), /缺少 signoff_ref、signoff_fingerprint/);
  assert.throws(() => summarizeSignoffs([], SHEET_KEYS.TRACK_2, ALL_COLUMNS), /不在簽核適用清單內/);
});

// ---------------------------------------------------------------------------
// 同步整體行為（AC-4、AC-7、AC-8）
// ---------------------------------------------------------------------------

const TRACK_2_ROW = {
  id: 'd1', category: '討論', title: '討論標題', author: '作者', year: '2026', abstract: '摘要',
  link: 'https://example.test/d1', views: '12', owl_comment: '短評', owl_depth_comment: '', vibe: '🔥 公民必讀', sticky: '', full_content: '',
};
const TLDR = [
  { order: '0', label: '', text: '摘要標題', link: 'https://example.test/tldr' },
  { order: '1', label: '重點', text: '重點內容', link: '' },
];

function approveOther(sheetKey, record, sequence) {
  const fingerprint = fingerprintPublishedRow(sheetKey, record, sequence);
  return {
    ...record, status: 'Approved', review_decision: 'Approved', review_fingerprint: fingerprint,
    approved_by: 'editor-id', approved_at: '2026-11-17T08:00:00.000Z',
    approved_fingerprint: fingerprint, current_fingerprint: fingerprint, reject_reason: '',
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, records) {
  return [headers.map(([label]) => label), ...records.map(record => headers.map(([, field]) => record[field] ?? ''))]
    .map(row => row.map(csvCell).join(','))
    .join('\n');
}

const SIGNOFF_HEADERS = [['signoff_by （簽核老師）', 'signoff_by'], ['signoff_ref （留言連結）', 'signoff_ref'], ['signoff_fingerprint （簽核版本）', 'signoff_fingerprint']];

function fixtures(track1, signoffHeaders) {
  const plain = fields => fields.map(field => [field, field]);
  return {
    '/track1.csv': toCsv([...plain(PUBLISHED_FIELDS[T1]), ...plain(['status']), ...plain(REVIEW_FIELDS.slice(1, 7)), ...signoffHeaders, ['reject_reason', 'reject_reason']], track1),
    '/track2.csv': toCsv(plain([...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2], ...REVIEW_FIELDS]), [approveOther(SHEET_KEYS.TRACK_2, TRACK_2_ROW, 1)]),
    '/site.csv': toCsv(plain(['order', 'label', 'text', 'link', ...REVIEW_FIELDS]), TLDR.map(row => approveOther(SHEET_KEYS.SITE_TLDR, row))),
  };
}

async function runSync(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'teacher-signoff-'));
  const output = path.join(root, 'data');
  const server = http.createServer((request, response) => {
    response.writeHead(files[request.url] ? 200 : 404, { 'content-type': 'text/csv; charset=utf-8' });
    response.end(files[request.url] || 'missing');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
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
    const history = fs.readFileSync(path.join(output, 'history.json'));
    return { code: 0, stdout: child.stdout, history, sha256: createHash('sha256').update(history).digest('hex') };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

const SIGNED = { ...ROW, id: 'h1' };
const UNSIGNED = { ...ROW, id: 'h2', year: '2001' };
const STALE_SOURCE = { ...ROW, id: 'h3', year: '2005' };
const STALE = { ...STALE_SOURCE, title: '改過的標題' };

test('AC-4／AC-7／AC-8 有無三個簽核欄，history.json 位元組相同；未簽與失效的列照常發布', async () => {
  const rows = [approve(SIGNED, signedBy('老師甲', SIGNED)), approve(UNSIGNED), approve(STALE, signedBy('老師乙', STALE_SOURCE))];
  const withColumns = await runSync(fixtures(rows, SIGNOFF_HEADERS));
  const without = await runSync(fixtures(rows, []));

  assert.equal(withColumns.code, 0, withColumns.stderr);
  assert.equal(without.code, 0, without.stderr);
  assert.equal(withColumns.sha256, without.sha256);

  const history = JSON.parse(withColumns.history);
  assert.deepEqual(history.map(item => item.id), ['h1', 'h2', 'h3'], '未簽與失效的列都在 history.json');
  assert.doesNotMatch(withColumns.history.toString(), /signoff|老師甲/, '三欄不寫進 JSON');

  assert.match(withColumns.stdout, /有效 1 列、失效 1 列、未簽 1 列/);
  assert.match(withColumns.stdout, /有效  h1  老師甲/);
  assert.match(without.stdout, /T1 沒有簽核欄，略過老師簽核摘要/);
});

test('簽核欄有值不影響 040 的核可檢查：內容改了但核可未更新的列仍讓同步中止', async () => {
  const tampered = { ...approve(SIGNED, signedBy('老師甲', SIGNED)), content: '核可後偷改' };
  const result = await runSync(fixtures([tampered], SIGNOFF_HEADERS));
  assert.equal(result.code, 1);
  assert.match(result.stderr, /與目前發布內容不符/);
});

// ---------------------------------------------------------------------------
// Apps Script 選單（AC-5、AC-6、AC-11 的一部分）
// ---------------------------------------------------------------------------

const GS_TRACK_1_FIELDS = PUBLISHED_FIELDS[T1];

/**
 * 假的試算表。只模擬本選單用到的 API。
 * current_fingerprint 與 status 兩欄依公式即時計算，與正式表的公式欄相同。
 */
function createSheet(context, { name = T1, headers, rows }) {
  const grid = [headers.slice(), ...rows.map(row => headers.map(header => row[header.split(' ')[0]] ?? ''))];
  const indexOf = field => headers.findIndex(header => header.split(' ')[0] === field);
  const display = (r, c) => {
    const field = headers[c].split(' ')[0];
    const row = grid[r];
    if (r > 0 && field === 'current_fingerprint') {
      return context.CONTENT_FINGERPRINT(name, ...GS_TRACK_1_FIELDS.map(f => row[indexOf(f)]));
    }
    if (r > 0 && field === 'status') {
      return context.APPROVAL_STATUS(display(r, indexOf('current_fingerprint')),
        ...['review_decision', 'review_fingerprint', 'approved_by', 'approved_at', 'approved_fingerprint'].map(f => row[indexOf(f)]));
    }
    return String(row[c] ?? '');
  };
  const cell = (row, column) => ({
    getValue: () => grid[row - 1][column - 1],
    getDisplayValue: () => display(row - 1, column - 1),
    setValue: value => { grid[row - 1][column - 1] = value; },
  });
  const sheet = {
    grid,
    selection: { row: 2, count: rows.length },
    getName: () => name,
    getLastColumn: () => headers.length,
    getLastRow: () => grid.length,
    getActiveRange: () => ({ getRow: () => sheet.selection.row, getNumRows: () => sheet.selection.count }),
    getRange(row, column, numRows, numColumns) {
      if (numRows === undefined) return cell(row, column);
      return { getDisplayValues: () => [Array.from({ length: numColumns }, (_, i) => display(row - 1, column - 1 + i))] };
    },
    value: (row, field) => grid[row - 1][indexOf(field)],
    set: (row, field, value) => { grid[row - 1][indexOf(field)] = value; },
  };
  return sheet;
}

function loadAppsScript({ labels = '老師甲\n老師乙' } = {}) {
  const state = { prompts: [], sheet: null, onFlush: null };
  const context = {
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest(_algorithm, payload) {
        return [...createHash('sha256').update(payload, 'utf8').digest()].map(byte => byte > 127 ? byte - 256 : byte);
      },
    },
    SpreadsheetApp: {
      getActiveSheet: () => state.sheet,
      flush: () => { if (state.onFlush) state.onFlush(); },
      getUi: () => ({
        ButtonSet: { OK_CANCEL: 'OK_CANCEL' },
        Button: { OK: 'OK', CANCEL: 'CANCEL' },
        prompt: () => {
          const next = state.prompts.shift();
          return { getSelectedButton: () => (next === null ? 'CANCEL' : 'OK'), getResponseText: () => next ?? '' };
        },
      }),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => (key === 'TEACHER_SIGNOFF_LABELS' ? labels : null) }) },
    Session: { getActiveUser: () => ({ getEmail: () => 'editor-id' }) },
    LockService: { getDocumentLock: () => ({ waitLock() {}, releaseLock() {} }) },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('scripts/apps-script/approval-workflow.gs', 'utf8'), context);
  return { context, state };
}

const SHEET_HEADERS = [
  ...GS_TRACK_1_FIELDS, 'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'signoff_by （簽核老師）', 'signoff_ref （留言連結）', 'signoff_fingerprint （簽核版本）', 'reject_reason',
];
const GUARDED = [...WRITABLE_REVIEW_FIELDS, ...SIGNOFF_FIELDS];
const ROW_A = { ...ROW, id: 'h1' };
const ROW_B = { ...ROW, id: 'h2', title: '第二列' };
const code = record => fingerprintShortCode(fingerprintPublishedRow(T1, record));

function setup(options = {}) {
  const loaded = loadAppsScript(options);
  // 兩列先帶著舊的審核與簽核值，用來確認失敗時逐格復原。
  const old = { review_decision: 'Rejected', review_fingerprint: 'old', reject_reason: '舊原因', signoff_by: '舊老師', signoff_ref: 'https://old.test', signoff_fingerprint: 'old' };
  loaded.state.sheet = createSheet(loaded.context, {
    headers: options.headers || SHEET_HEADERS,
    rows: [{ ...ROW_A, ...old }, { ...ROW_B, ...old }],
  });
  return loaded;
}

function guardedValues(sheet) {
  return [2, 3].map(row => GUARDED.filter(field => sheet.grid[0].some(h => h.split(' ')[0] === field)).map(field => sheet.value(row, field)));
}

test('附老師簽核：兩列同批寫入六個審核欄與三個簽核欄，status 變成 Approved', () => {
  const { context, state } = setup();
  state.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2  ${code(ROW_B).toUpperCase()}`];
  context.approveActiveRowsWithSignoff();
  for (const [row, record] of [[2, ROW_A], [3, ROW_B]]) {
    const fingerprint = fingerprintPublishedRow(T1, record);
    assert.equal(state.sheet.getRange(row, SHEET_HEADERS.indexOf('status') + 1).getDisplayValue(), 'Approved');
    assert.equal(state.sheet.value(row, 'signoff_by'), '老師甲');
    assert.equal(state.sheet.value(row, 'signoff_ref'), COMMENT_LINK);
    assert.equal(state.sheet.value(row, 'signoff_fingerprint'), fingerprint);
    assert.equal(state.sheet.value(row, 'approved_fingerprint'), fingerprint);
    assert.equal(state.sheet.value(row, 'reject_reason'), '');
  }
});

const FAILURES = [
  ['代稱不在清單', s => { s.prompts = ['老師丙', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`]; }, /老師代稱「老師丙」不在清單內/],
  ['留言連結空白', s => { s.prompts = ['老師甲', '', `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`]; }, /留言連結必須是/],
  ['短碼不符', s => { s.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_A)}`]; }, /第 3 列（id h2）的短碼不符/],
  ['選取列在清單中缺漏', s => { s.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}`]; }, /第 3 列（id h2）不在短碼清單中/],
  ['選取列在清單中重複', s => { s.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}\nh1 ${code(ROW_A)}`]; }, /id「h1」出現兩次/],
  ['清單有選取範圍外的 id', s => { s.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}\nh9 00000000`]; }, /id「h9」不在選取範圍內/],
  ['寫入後重讀指紋改變', s => {
    s.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`];
    s.onFlush = () => { s.onFlush = null; s.sheet.set(3, 'content', '審核期間被改'); };
  }, /審核期間內容已變更/],
];

for (const [name, arrange, message] of FAILURES) {
  test(`AC-5 ${name}：中止，九個欄位全部回到執行前的值`, () => {
    const { context, state } = setup();
    const before = guardedValues(state.sheet);
    arrange(state);
    assert.throws(() => context.approveActiveRowsWithSignoff(), message);
    if (name === '寫入後重讀指紋改變') state.sheet.set(3, 'content', ROW_B.content);
    assert.deepEqual(guardedValues(state.sheet), before);
  });
}

test('AC-5 缺任一簽核欄：選單在詢問前中止，訊息指名該欄', () => {
  for (const missing of SIGNOFF_FIELDS) {
    const headers = SHEET_HEADERS.filter(header => header.split(' ')[0] !== missing);
    const { context, state } = setup({ headers });
    const before = guardedValues(state.sheet);
    state.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`];
    assert.throws(() => context.approveActiveRowsWithSignoff(), new RegExp(`缺少簽核欄位「${missing}」`));
    assert.equal(state.prompts.length, 3, '還沒跳出任何對話框');
    assert.deepEqual(guardedValues(state.sheet), before);
  }
});

test('不適用的分頁、未設定代稱清單、按取消：都不寫入', () => {
  const { context, state } = setup();
  state.sheet.getName = () => SHEET_KEYS.TRACK_2;
  assert.throws(() => context.approveActiveRowsWithSignoff(), /不支援老師簽核/);

  const empty = setup({ labels: '' });
  assert.throws(() => empty.context.approveActiveRowsWithSignoff(), /尚未設定老師代稱/);

  const cancelled = setup();
  const before = guardedValues(cancelled.state.sheet);
  cancelled.state.prompts = ['老師甲', null];
  cancelled.context.approveActiveRowsWithSignoff();
  assert.deepEqual(guardedValues(cancelled.state.sheet), before);
});

test('代稱清單可用換行、逗號或頓號分隔：指令碼屬性的輸入框只有一行', () => {
  for (const labels of ['老師甲\n老師乙', '老師甲, 老師乙', '老師甲、老師乙']) {
    const { context, state } = setup({ labels });
    state.prompts = ['老師乙', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`];
    context.approveActiveRowsWithSignoff();
    assert.equal(state.sheet.value(2, 'signoff_by'), '老師乙', labels);
  }
});

test('短碼清單可寫成一行、以 ; 或 ； 分隔兩列：對話框可能只有一行', () => {
  for (const separator of ['; ', '；']) {
    const { context, state } = setup();
    state.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}${separator}h2 ${code(ROW_B)}`];
    context.approveActiveRowsWithSignoff();
    for (const [row, record] of [[2, ROW_A], [3, ROW_B]]) {
      assert.equal(state.sheet.value(row, 'signoff_fingerprint'), fingerprintPublishedRow(T1, record), separator);
    }
  }
});

test('AC-6 先附簽核核可，再不附老師核可：三個簽核欄清空，status 仍 Approved', () => {
  const { context, state } = setup();
  state.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`];
  context.approveActiveRowsWithSignoff();
  context.approveActiveRows();
  for (const row of [2, 3]) {
    for (const field of SIGNOFF_FIELDS) assert.equal(state.sheet.value(row, field), '', `${row} ${field}`);
    assert.equal(state.sheet.getRange(row, SHEET_HEADERS.indexOf('status') + 1).getDisplayValue(), 'Approved');
  }
});

test('AC-6 先附簽核核可，再拒絕：三個簽核欄不變，status 為 Rejected', () => {
  const { context, state } = setup();
  state.prompts = ['老師甲', COMMENT_LINK, `h1 ${code(ROW_A)}\nh2 ${code(ROW_B)}`];
  context.approveActiveRowsWithSignoff();
  const signed = [2, 3].map(row => SIGNOFF_FIELDS.map(field => state.sheet.value(row, field)));
  context.rejectActiveRows('需要修改');
  assert.deepEqual([2, 3].map(row => SIGNOFF_FIELDS.map(field => state.sheet.value(row, field))), signed);
  assert.equal(state.sheet.getRange(2, SHEET_HEADERS.indexOf('status') + 1).getDisplayValue(), 'Rejected');
});

test('不附老師的核可在任一步失敗時，連同被清空的簽核欄一起復原', () => {
  const { context, state } = setup();
  const before = guardedValues(state.sheet);
  state.onFlush = () => { state.onFlush = null; state.sheet.set(2, 'content', '審核期間被改'); };
  assert.throws(() => context.approveActiveRows(), /審核期間內容已變更/);
  state.sheet.set(2, 'content', ROW_A.content);
  assert.deepEqual(guardedValues(state.sheet), before);
});

test('還沒建簽核欄的分頁，既有「核可選取列」照常運作', () => {
  const headers = SHEET_HEADERS.filter(header => !SIGNOFF_FIELDS.includes(header.split(' ')[0]));
  const { context, state } = setup({ headers });
  context.approveActiveRows();
  assert.equal(state.sheet.getRange(2, headers.indexOf('status') + 1).getDisplayValue(), 'Approved');
});

test('Apps Script 與 Node 的簽核常數相同：三個欄位、適用分頁、短碼長度', () => {
  const { context } = loadAppsScript();
  assert.deepEqual([...vm.runInContext('SIGNOFF_FIELDS', context)], [...SIGNOFF_FIELDS]);
  assert.deepEqual([...vm.runInContext('SIGNOFF_SHEETS', context)], [...SIGNOFF_SHEETS]);
  assert.equal(vm.runInContext('SIGNOFF_SHORT_CODE_LENGTH', context), SHORT_CODE_LENGTH);
  assert.equal(SHORT_CODE_LENGTH, 8);
});

test('onOpen 的 Review 選單多一個「核可選取列（附老師簽核）」，其餘三項不變', () => {
  const { context } = loadAppsScript();
  const items = [];
  const menu = { addItem: (label, fn) => { items.push([label, fn]); return menu; }, addSeparator: () => menu, addToUi: () => {} };
  context.SpreadsheetApp.getUi = () => ({ createMenu: () => menu });
  context.onOpen();
  assert.deepEqual(items, [
    ['安裝／更新公式', 'installApprovalFormulas'],
    ['核可選取列', 'approveActiveRows'],
    ['核可選取列（附老師簽核）', 'approveActiveRowsWithSignoff'],
    ['拒絕選取列', 'promptRejectActiveRows'],
  ]);
});
