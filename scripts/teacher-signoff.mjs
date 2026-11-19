import { fingerprintPublishedRow, fingerprintShortCode, SHEET_KEYS } from './content-fingerprint.mjs';

/**
 * 老師簽核紀錄的同步端判定（feature 076）。
 *
 * 規格見 docs/constitution-features/teacher-review-role-and-signoff.md 第 3.5、3.6 節：
 *   有效 —— status 為 Approved，signoff_by、signoff_ref 非空白，
 *           且 signoff_fingerprint 等於 Node 依目前內容重算的指紋
 *   失效 —— 有任何簽核欄有值，但不符合「有效」
 *   未簽 —— 三個簽核欄都空白
 *
 * 第一期只記錄、不擋：本模組不寫 errors，不排除任何列，三欄也不寫進 history.json。
 * 三欄不參與指紋（content-fingerprint.mjs 的 PUBLISHED_FIELDS 不含它們），加欄不讓既有核可失效。
 */

export const SIGNOFF_FIELDS = Object.freeze(['signoff_by', 'signoff_ref', 'signoff_fingerprint']);

/** 適用分頁。第一期只有 T1（captain 2026-11-17 採用 D-4 預設）。Apps Script 端的 SIGNOFF_SHEETS 必須相同。 */
export const SIGNOFF_SHEETS = Object.freeze([SHEET_KEYS.TRACK_1]);

/** 給 sync-content.mjs 的欄位定義。column: 'optional'：試算表還沒建這三欄時，同步照舊（比照 064 的 case_ref）。 */
export const SIGNOFF_COLUMNS = Object.freeze(SIGNOFF_FIELDS.map(field => Object.freeze({
  field,
  aliases: [field, field.replace('_', ' ')],
  column: 'optional',
  value: 'optional',
})));

function isApproved(record) {
  return (record.status || '').trim().toLowerCase() === 'approved';
}

/**
 * 把每一個 Approved 列放進三類之一，且只放一類。
 * fieldToIndex 是 sync-content.mjs 的標題解析結果，用來判斷三欄是否存在。
 */
export function summarizeSignoffs(records, sheetKey, fieldToIndex) {
  if (!SIGNOFF_SHEETS.includes(sheetKey)) throw new TypeError(`分頁「${sheetKey}」不在簽核適用清單內。`);
  const missing = SIGNOFF_FIELDS.filter(field => !(field in fieldToIndex));
  const summary = { sheetKey, missing, valid: [], invalid: [], unsigned: [] };
  if (missing.length > 0) return summary;

  for (const record of records.filter(isApproved)) {
    const expected = fingerprintPublishedRow(sheetKey, record);
    const by = (record.signoff_by || '').trim();
    const ref = (record.signoff_ref || '').trim();
    const signed = (record.signoff_fingerprint || '').trim();
    const entry = { id: record.id, shortCode: fingerprintShortCode(expected) };
    if (by === '' && ref === '' && signed === '') {
      summary.unsigned.push(entry);
    } else if (by !== '' && ref !== '' && signed === expected) {
      summary.valid.push({ ...entry, by });
    } else {
      const reason = signed !== '' && signed !== expected ? '版本不符' : '欄位不完整';
      summary.invalid.push({ ...entry, by, reason, signedShortCode: fingerprintShortCode(signed) });
    }
  }
  return summary;
}

/** 同步輸出的摘要文字。未簽的列附目前版本短碼，供老師留言與 079 的審閱檔對照。 */
export function formatSignoffSummary(summary) {
  const label = summary.sheetKey === SHEET_KEYS.TRACK_1 ? 'T1' : summary.sheetKey;
  if (summary.missing.length === SIGNOFF_FIELDS.length) {
    return `ℹ️ ${label} 沒有簽核欄，略過老師簽核摘要。`;
  }
  if (summary.missing.length > 0) {
    return `⚠️ ${label} 的簽核欄不齊，缺少 ${summary.missing.join('、')}。略過老師簽核摘要。這不影響發布。`;
  }
  const total = summary.valid.length + summary.invalid.length + summary.unsigned.length;
  const lines = [
    `📝 ${label} 老師簽核摘要（只算 Approved 的 ${total} 列；第一期只記錄，不擋發布）`,
    `   有效 ${summary.valid.length} 列、失效 ${summary.invalid.length} 列、未簽 ${summary.unsigned.length} 列`,
  ];
  for (const row of summary.valid) lines.push(`   有效  ${row.id}  ${row.by}  版本 ${row.shortCode}`);
  for (const row of summary.invalid) {
    const signedAt = row.signedShortCode ? `，簽核版本 ${row.signedShortCode}` : '';
    lines.push(`   失效  ${row.id}  ${row.reason}：目前版本 ${row.shortCode}${signedAt}`);
  }
  for (const row of summary.unsigned) lines.push(`   未簽  ${row.id}  目前版本 ${row.shortCode}`);
  return lines.join('\n');
}
