import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {
  fingerprintPayload,
  fingerprintPublishedRow,
  OPTIONAL_PUBLISHED_FIELDS,
  PUBLISHED_FIELDS,
  SHEET_KEYS,
} from '../scripts/content-fingerprint.mjs';
import { buildTrack2 } from '../scripts/sync-content.mjs';
import { VERIFIED_CASE_REFS } from '../src/data/verified-case-refs.mjs';

// feature 064 的驗收測試。AC 編號指 docs/constitution-features/064-track2-case-ref-stance-columns.md 第七節。
// 本檔的 case_ref／stance 值只用來驗證程式行為，不是任何一篇文章的立場。

const APPROVAL_FIELDS = [
  'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'reject_reason',
];
const TRACK_2 = {
  id: 'd1', category: '討論', title: '討論標題', author: '作者', year: '2026', abstract: '摘要',
  link: 'https://example.test/d1', views: '0012', owl_comment: '短評', owl_depth_comment: '深評',
  vibe: '🔥 公民必讀', sticky: '', full_content: '全文',
};
// 現行 discussions.json 一筆完整記錄的鍵序。字面值，不從程式衍生。
const CURRENT_KEYS = ['id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment', 'owl_depth_comment', 'vibe', 'sticky', 'full_content'];
// 064 design 第三節 3.1 表的「標題輸入（逐字）」。
const CASE_REF_HEADER = 'case_ref （判決字號，限下拉）';
const STANCE_HEADER = 'stance （立場，限下拉）';
const CASE_A = '114年憲判字第1號';
const CASE_B = '113年憲判字第9號';
// 改動前（040 版 content-fingerprint.mjs）對 TRACK_2、序號 1 算出的值。2026-09-29 以 main e98ed02 實跑取得。
const V1_TRACK_2_SEQ_1 = '2ea9aa762a499eb28f7876ddc669bbdb6300609c00891532faf5158a63f198c0';

function approve(record, sequence = 1) {
  const fingerprint = fingerprintPublishedRow(SHEET_KEYS.TRACK_2, record, sequence);
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

/** headers 是試算表標題字串，fields 是對應的記錄鍵。 */
function toCsv(columns, records) {
  return [columns.map(([header]) => header), ...records.map(record => columns.map(([, field]) => record[field] ?? ''))]
    .map(row => row.map(csvCell).join(','))
    .join('\n');
}

const BASE_COLUMNS = [...PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2], ...APPROVAL_FIELDS].map(field => [field, field]);
const WITH_NEW_COLUMNS = [...BASE_COLUMNS, [CASE_REF_HEADER, 'case_ref'], [STANCE_HEADER, 'stance']];

function run(records, columns = WITH_NEW_COLUMNS) {
  const errors = [];
  const result = buildTrack2(toCsv(columns, records), errors);
  return { result, errors, messages: errors.map(error => `${error.key} ${error.message}`).join('\n') };
}

function loadAppsScript() {
  const context = {
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest(_algorithm, payload) {
        return [...createHash('sha256').update(payload, 'utf8').digest()].map(byte => byte > 127 ? byte - 256 : byte);
      },
    },
    SpreadsheetApp: { flush() {} },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('scripts/apps-script/approval-workflow.gs', 'utf8'), context);
  return context;
}

/** 最小的假分頁：grid[r][c] 是第 r+1 列、第 c+1 欄的顯示值。記錄寫入的公式。 */
function fakeSheet(name, grid) {
  const formulas = {};
  return {
    formulas,
    getName: () => name,
    getLastColumn: () => grid[0].length,
    getLastRow: () => grid.length,
    getRange(row, column, rows = 1, columns = 1) {
      return {
        getDisplayValue: () => String(grid[row - 1]?.[column - 1] ?? ''),
        getDisplayValues: () => Array.from({ length: rows }, (_, r) =>
          Array.from({ length: columns }, (_, c) => String(grid[row - 1 + r]?.[column - 1 + c] ?? ''))),
        setFormula(formula) { formulas[`${row},${column}`] = formula; },
      };
    },
  };
}

// ---------------------------------------------------------------------------

test('AC-2 試算表沒有新欄時，040 fixture 的輸出鍵序與現行相同', () => {
  const { result, messages } = run([approve(TRACK_2)], BASE_COLUMNS);
  assert.notEqual(result, null, messages);
  assert.deepEqual(Object.keys(result[0]), CURRENT_KEYS);
});

test('AC-2 新欄已建但空白時，輸出與沒有新欄時逐位元組相同', () => {
  const second = { ...TRACK_2, id: 'd2', title: '第二筆', link: 'https://example.test/d2', full_content: '' };
  const records = [approve(TRACK_2, 1), approve(second, 2)];
  const without = run(records, BASE_COLUMNS);
  const blank = run(records, WITH_NEW_COLUMNS);
  assert.notEqual(without.result, null, without.messages);
  assert.equal(JSON.stringify(blank.result, null, 2), JSON.stringify(without.result, null, 2));
});

test('AC-3 3.1 表的逐字標題，Node 與 Apps Script 都解析成 case_ref、stance，其他欄位不變', () => {
  const record = { ...TRACK_2, case_ref: CASE_A, stance: '支持' };
  const { result, messages } = run([approve(record)]);
  assert.notEqual(result, null, messages);
  assert.equal(result[0].case_ref, CASE_A);
  assert.equal(result[0].stance, '支持');

  const { resolveApprovalHeaders_ } = loadAppsScript();
  const baseHeaders = BASE_COLUMNS.map(([header]) => header);
  const before = resolveApprovalHeaders_(fakeSheet(SHEET_KEYS.TRACK_2, [baseHeaders]));
  const after = resolveApprovalHeaders_(fakeSheet(SHEET_KEYS.TRACK_2, [[...baseHeaders, CASE_REF_HEADER, STANCE_HEADER]]));
  assert.equal(before.case_ref, undefined);
  assert.equal(after.case_ref, baseHeaders.length + 1);
  assert.equal(after.stance, baseHeaders.length + 2);
  const { case_ref: _c, stance: _s, ...rest } = after;
  assert.deepEqual({ ...rest }, { ...before });
});

test('AC-4 白名單以外的 case_ref 讓同步中止，錯誤含 id 與原值；兩個合法值通過', () => {
  for (const bad of ['114年憲判字第9號', 'toString']) {
    const { result, messages } = run([approve({ ...TRACK_2, case_ref: bad, stance: '支持' })]);
    assert.equal(result, null, bad);
    assert.match(messages, /d1/);
    assert.ok(messages.includes(`case_ref「${bad}」不在已查證的判決字號清單內`), messages);
  }
  for (const good of [CASE_A, CASE_B]) {
    const { result, messages } = run([approve({ ...TRACK_2, case_ref: good, stance: '支持' })]);
    assert.notEqual(result, null, messages);
  }
});

test('AC-5 允許清單以外的 stance 讓同步中止；三個合法值通過', () => {
  for (const bad of ['進步派', '贊成']) {
    const { result, messages } = run([approve({ ...TRACK_2, case_ref: CASE_A, stance: bad })]);
    assert.equal(result, null, bad);
    assert.ok(messages.includes(`stance「${bad}」不在允許清單內`), messages);
  }
  for (const good of ['支持', '質疑', '中立分析']) {
    const { result, messages } = run([approve({ ...TRACK_2, case_ref: CASE_A, stance: good })]);
    assert.notEqual(result, null, messages);
    assert.equal(result[0].stance, good);
  }
});

test('AC-6 只填一欄讓同步中止，訊息指名兩欄', () => {
  for (const partial of [{ case_ref: CASE_A }, { stance: '質疑' }]) {
    const { result, messages } = run([approve({ ...TRACK_2, ...partial })]);
    assert.equal(result, null, JSON.stringify(partial));
    assert.match(messages, /d1 case_ref 與 stance 必須同時填寫或同時空白/);
  }
});

test('AC-4／5／6 只檢查已核可的列：草稿列填錯不中止', () => {
  const draft = { ...TRACK_2, id: 'd2', case_ref: 'toString', stance: '進步派' };
  const { result, messages } = run([approve(TRACK_2, 1), draft]);
  assert.notEqual(result, null, messages);
  assert.deepEqual(result.map(record => record.id), ['d1']);
});

test('AC-7(a) 兩欄空白時，指紋與 040 版的固定期望值逐位元組相同', () => {
  assert.equal(fingerprintPublishedRow(SHEET_KEYS.TRACK_2, TRACK_2, 1), V1_TRACK_2_SEQ_1);
  assert.equal(fingerprintPublishedRow(SHEET_KEYS.TRACK_2, { ...TRACK_2, case_ref: '', stance: ' ' }, 1), V1_TRACK_2_SEQ_1);
  assert.doesNotMatch(fingerprintPayload(SHEET_KEYS.TRACK_2, { ...TRACK_2, case_ref: '', stance: '' }, 1), /case_ref|stance/);
});

test('AC-7(b) 填值改變指紋；核可後才填 stance 的列，同步報「與目前發布內容不符」', () => {
  const withBoth = { ...TRACK_2, case_ref: CASE_A, stance: '支持' };
  const filled = fingerprintPublishedRow(SHEET_KEYS.TRACK_2, withBoth, 1);
  assert.notEqual(filled, V1_TRACK_2_SEQ_1);
  assert.notEqual(fingerprintPublishedRow(SHEET_KEYS.TRACK_2, { ...withBoth, stance: '質疑' }, 1), filled);
  assert.notEqual(fingerprintPublishedRow(SHEET_KEYS.TRACK_2, { ...withBoth, case_ref: CASE_B }, 1), filled);
  // 兩欄固定在 13 欄之後、__sequence 之前。
  const fields = JSON.parse(fingerprintPayload(SHEET_KEYS.TRACK_2, withBoth, 1))[2].map(([field]) => field);
  assert.deepEqual(fields.slice(-3), ['case_ref', 'stance', '__sequence']);

  for (const edit of [{ case_ref: CASE_A, stance: '支持' }, { stance: '中立分析' }]) {
    const base = edit.case_ref ? TRACK_2 : { ...TRACK_2, case_ref: CASE_A, stance: '支持' };
    const { result, messages } = run([{ ...approve(base), ...edit }]);
    assert.equal(result, null, JSON.stringify(edit));
    assert.match(messages, /current_fingerprint 與目前發布內容不符/);
  }
});

test('AC-7(c)(d) Node 與 Apps Script 算出相同指紋；舊公式（13 欄＋序號）等於空白值', () => {
  const { CONTENT_FINGERPRINT, approvalFingerprint_ } = loadAppsScript();
  const values = record => PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2].map(field => record[field] ?? '');
  // (d) 舊公式沒有選填參數。
  assert.equal(CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...values(TRACK_2), 1), V1_TRACK_2_SEQ_1);
  // 新公式、兩格空白。
  assert.equal(CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...values(TRACK_2), 1, '', ''), V1_TRACK_2_SEQ_1);
  assert.equal(approvalFingerprint_(SHEET_KEYS.TRACK_2, values(TRACK_2), 1), V1_TRACK_2_SEQ_1);
  // (c) 有值。
  for (const [caseRef, stance] of [[CASE_A, '支持'], [CASE_B, '中立分析'], [` ${CASE_A}\r\n`, '質疑']]) {
    const record = { ...TRACK_2, case_ref: caseRef, stance };
    const node = fingerprintPublishedRow(SHEET_KEYS.TRACK_2, record, 3);
    assert.equal(CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...values(record), 3, caseRef, stance), node);
    assert.equal(approvalFingerprint_(SHEET_KEYS.TRACK_2, values(record), 3, [caseRef, stance]), node);
  }
});

test('AC-7 舊公式配上有人填了立場：試算表指紋與 Node 不符，status 不會是 Approved（fail closed）', () => {
  const { CONTENT_FINGERPRINT, APPROVAL_STATUS } = loadAppsScript();
  const values = PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2].map(field => TRACK_2[field]);
  const sheetValue = CONTENT_FINGERPRINT(SHEET_KEYS.TRACK_2, ...values, 1);
  const node = fingerprintPublishedRow(SHEET_KEYS.TRACK_2, { ...TRACK_2, case_ref: CASE_A, stance: '支持' }, 1);
  assert.notEqual(sheetValue, node);
  // 試算表側核可的是不含立場的值；Node 重算含立場，同步必定中止。
  const approvedWithoutStance = { ...approve(TRACK_2), case_ref: CASE_A, stance: '支持' };
  assert.equal(run([approvedWithoutStance]).result, null);
  assert.equal(APPROVAL_STATUS(node, 'Approved', sheetValue, 'editor-id', '2026-09-03T20:00:00.000Z', sheetValue), 'Needs review');
});

test('AC-7 序號只看 13 欄：只填 case_ref／stance 的列不佔序號', () => {
  const { PUBLISHED_ROW_SEQUENCE } = loadAppsScript();
  const orphan = { case_ref: CASE_A, stance: '支持' };
  const columns = PUBLISHED_FIELDS[SHEET_KEYS.TRACK_2].map(field => [orphan[field] ?? '', TRACK_2[field]]);
  assert.equal(PUBLISHED_ROW_SEQUENCE(...columns), 1);
  const { result, messages } = run([orphan, approve(TRACK_2, 1)]);
  assert.notEqual(result, null, messages);
  assert.deepEqual(result.map(record => record.id), ['d1']);
});

test('AC-7 Apps Script 公式安裝：沒有新欄時公式與舊版逐字相同；有新欄時兩格排在序號之後', () => {
  const context = loadAppsScript();
  const headers = BASE_COLUMNS.map(([header]) => header);
  const row = headers.map(header => TRACK_2[header] ?? '');
  const install = grid => {
    const sheet = fakeSheet(SHEET_KEYS.TRACK_2, grid);
    context.SpreadsheetApp.getActiveSheet = () => sheet;
    context.installApprovalFormulas();
    const fingerprintColumn = headers.indexOf('current_fingerprint') + 1;
    return sheet.formulas[`2,${fingerprintColumn}`];
  };
  const old = install([headers, row]);
  // 040 版 installApprovalFormulas 對同一個 21 欄分頁寫出的第 2 列公式，逐字抄錄（2026-09-29 以 main e98ed02 實跑）。
  assert.equal(old, '=CONTENT_FINGERPRINT("Track 2_discussion",A2,B2,C2,D2,E2,F2,G2,H2,I2,J2,K2,L2,M2,'
    + 'PUBLISHED_ROW_SEQUENCE(A$2:A2,B$2:B2,C$2:C2,D$2:D2,E$2:E2,F$2:F2,G$2:G2,H$2:H2,I$2:I2,J$2:J2,K$2:K2,L$2:L2,M$2:M2))');
  const withBoth = install([[...headers, CASE_REF_HEADER, STANCE_HEADER], [...row, '', '']]);
  assert.equal(withBoth, `${old.slice(0, -1)},V2,W2)`);
  const onlyStance = install([[...headers, STANCE_HEADER], [...row, '']]);
  assert.equal(onlyStance, `${old.slice(0, -1)},"",V2)`);
});

test('AC-7 Apps Script 核可前重算：fingerprintForSheetRow_ 讀新欄，與 Node 相同', () => {
  const { fingerprintForSheetRow_, resolveApprovalHeaders_ } = loadAppsScript();
  const headers = [...BASE_COLUMNS.map(([header]) => header), CASE_REF_HEADER, STANCE_HEADER];
  for (const [caseRef, stance] of [['', ''], [CASE_A, '質疑']]) {
    const record = { ...TRACK_2, case_ref: caseRef, stance };
    const sheet = fakeSheet(SHEET_KEYS.TRACK_2, [headers, WITH_NEW_COLUMNS.map(([, field]) => record[field] ?? '')]);
    const columns = resolveApprovalHeaders_(sheet);
    assert.equal(fingerprintForSheetRow_(sheet, columns, 2), fingerprintPublishedRow(SHEET_KEYS.TRACK_2, record, 1));
  }
});

test('AC-8 兩欄有值時新鍵排在既有鍵之後；沒有 full_content 時排在 sticky 之後', () => {
  const filled = run([approve({ ...TRACK_2, case_ref: CASE_A, stance: '支持' })]);
  assert.deepEqual(Object.keys(filled.result[0]), [...CURRENT_KEYS, 'case_ref', 'stance']);
  const blank = run([approve(TRACK_2)]);
  assert.deepEqual(Object.keys(blank.result[0]), CURRENT_KEYS);
  const short = run([approve({ ...TRACK_2, full_content: '', case_ref: CASE_B, stance: '中立分析' })]);
  assert.deepEqual(Object.keys(short.result[0]).slice(-3), ['sticky', 'case_ref', 'stance']);
});

test('AC-10（離線部分）白名單形狀：兩筆、凍結、source 指向憲法法庭', () => {
  assert.deepEqual(Object.keys(VERIFIED_CASE_REFS), [CASE_B, CASE_A]);
  assert.ok(Object.isFrozen(VERIFIED_CASE_REFS));
  for (const entry of Object.values(VERIFIED_CASE_REFS)) {
    assert.ok(Object.isFrozen(entry));
    assert.match(entry.source, /^https:\/\/cons\.judicial\.gov\.tw\/docdata\.aspx\?fid=38&id=\d+$/);
    assert.match(entry.date, /^\d{3}-\d{2}-\d{2}$/);
  }
  assert.equal(OPTIONAL_PUBLISHED_FIELDS[SHEET_KEYS.TRACK_1], undefined);
});
