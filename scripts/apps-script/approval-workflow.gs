/** fingerprint-v1 與審核選單。只部署到隔離測試表，probe 通過前不得套用正式 SSOT。 */

const APPROVAL_VERSION = 'approval-content-v1';
const APPROVAL_FIELDS = {
  'Track 1_history': ['id', 'category', 'chapter', 'content', 'handwriting', 'year', 'title', 'ruling', 'ruling_id', 'image_url'],
  'Track 2_discussion': ['id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment', 'owl_depth_comment', 'vibe', 'sticky', 'full_content'],
};
/** 選填發布欄位：有值才計入指紋，空白時指紋不變。不參與序號。欄位不存在時不中止。 */
const OPTIONAL_APPROVAL_FIELDS = {
  'Track 2_discussion': ['case_ref', 'stance'],
};
const REVIEW_FIELDS = [
  'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'reject_reason',
];
const WRITABLE_REVIEW_FIELDS = REVIEW_FIELDS.filter(function(field) {
  return field !== 'status' && field !== 'current_fingerprint';
});
const HEADER_SEPARATORS = ' \t(（[［{｛-–—:：/｜|,，';
/**
 * 老師簽核三欄（feature 076）。B 類，只由選單寫入。不參與指紋，也不是公式欄。
 * 適用分頁與 scripts/teacher-signoff.mjs 的 SIGNOFF_SHEETS 必須相同。第一期只有 T1。
 */
const SIGNOFF_FIELDS = ['signoff_by', 'signoff_ref', 'signoff_fingerprint'];
const SIGNOFF_SHEETS = ['Track 1_history'];
/** 版本短碼長度。與 scripts/content-fingerprint.mjs 的 SHORT_CODE_LENGTH 相同。 */
const SIGNOFF_SHORT_CODE_LENGTH = 8;
/** 指令碼屬性：老師代稱清單，一行一個。由 captain 設定，不寫進 repo。 */
const TEACHER_LABELS_PROPERTY = 'TEACHER_SIGNOFF_LABELS';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Review')
    .addItem('安裝／更新公式', 'installApprovalFormulas')
    .addSeparator()
    .addItem('核可選取列', 'approveActiveRows')
    .addItem('核可選取列（附老師簽核）', 'approveActiveRowsWithSignoff')
    .addItem('拒絕選取列', 'promptRejectActiveRows')
    .addToUi();
}

function normalizeApprovalText_(value) {
  return String(value == null ? '' : value).normalize('NFC').replace(/\r\n?/g, '\n').trim();
}

function normalizeApprovalInteger_(value, field) {
  const text = normalizeApprovalText_(value);
  if (!/^\d+$/.test(text)) throw new Error(field + ' 必須是非負整數。');
  return text.replace(/^0+(?=\d)/, '');
}

/** ISO 8601 UTC，且必須是真實曆日。Date 會把 2026-02-31 進位成 3-03，往返比對即拒絕。 */
function isApprovalIsoUtc_(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return false;
  return parsed.toISOString() === (value.indexOf('.') >= 0 ? value : value.replace('Z', '.000Z'));
}

function normalizeApprovalField_(field, value) {
  if (field === 'sticky') {
    const text = normalizeApprovalText_(value).toLowerCase();
    if (text === '' || text === 'false') return 'false';
    if (text === 'true') return 'true';
    throw new Error('sticky 必須是 TRUE、FALSE 或空白。');
  }
  if (field === 'views') {
    const text = normalizeApprovalText_(value);
    return text === '' ? '' : normalizeApprovalInteger_(text, field);
  }
  if (field === 'order') return normalizeApprovalInteger_(value, field);
  return normalizeApprovalText_(value);
}

function approvalFieldsFor_(sheetKey, values) {
  if (sheetKey === 'site_tldr') {
    return normalizeApprovalInteger_(values[0], 'order') === '0'
      ? ['order', 'text', 'link'] : ['order', 'label', 'text'];
  }
  if (!APPROVAL_FIELDS[sheetKey]) throw new Error('不支援的分頁「' + sheetKey + '」。');
  return APPROVAL_FIELDS[sheetKey];
}

function approvalFingerprint_(sheetKey, values, sequence, optionalValues) {
  const fields = approvalFieldsFor_(sheetKey, values);
  const sourceFields = sheetKey === 'site_tldr' ? ['order', 'label', 'text', 'link'] : APPROVAL_FIELDS[sheetKey];
  const record = {};
  sourceFields.forEach(function(field, index) { record[field] = values[index]; });
  const projection = fields.map(function(field) {
    return [field, normalizeApprovalField_(field, record[field])];
  });
  (OPTIONAL_APPROVAL_FIELDS[sheetKey] || []).forEach(function(field, index) {
    const value = normalizeApprovalText_(optionalValues ? optionalValues[index] : '');
    if (value !== '') projection.push([field, value]);
  });
  if (sheetKey === 'Track 2_discussion') {
    const normalizedSequence = normalizeApprovalInteger_(sequence, 'sequence');
    if (normalizedSequence === '0') throw new Error('Track 2 序號必須從 1 起算。');
    projection.push(['__sequence', normalizedSequence]);
  }
  const payload = JSON.stringify([APPROVAL_VERSION, sheetKey, projection]);
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload, Utilities.Charset.UTF_8)
    .map(function(byte) { return ('0' + ((byte + 256) % 256).toString(16)).slice(-2); })
    .join('');
}

/**
 * 試算表公式：依固定欄位順序傳值。Track 2 在發布欄位之後接非空資料列序號，再接選填欄位。
 * 選填欄位排在序號之後：舊公式沒有這幾個參數，視為空白，算出與舊版相同的指紋。
 */
function CONTENT_FINGERPRINT(sheetKey) {
  const args = Array.prototype.slice.call(arguments, 1);
  const count = APPROVAL_FIELDS[sheetKey] ? APPROVAL_FIELDS[sheetKey].length : 4;
  const values = args.slice(0, count);
  if (values.every(function(value) { return normalizeApprovalText_(value) === ''; })) return '';
  try {
    return approvalFingerprint_(sheetKey, values, sheetKey === 'Track 2_discussion' ? args[count] : undefined, args.slice(count + 1));
  } catch (error) {
    return '#FINGERPRINT! ' + error.message;
  }
}

/** 試算表公式：計算到目前列為止，有任一發布欄位非空的列數。 */
function PUBLISHED_ROW_SEQUENCE() {
  const columns = Array.prototype.slice.call(arguments);
  const height = Math.max.apply(null, columns.map(function(column) { return Array.isArray(column) ? column.length : 1; }));
  let count = 0;
  for (let row = 0; row < height; row++) {
    if (columns.some(function(column) {
      const value = Array.isArray(column) ? (Array.isArray(column[row]) ? column[row][0] : column[row]) : column;
      return normalizeApprovalText_(value) !== '';
    })) count++;
  }
  return count;
}

/** 試算表公式：任何缺漏、未知決定或指紋不一致都不顯示 Approved。 */
function APPROVAL_STATUS(currentFingerprint, decision, reviewFingerprint, approvedBy, approvedAt, approvedFingerprint) {
  const current = normalizeApprovalText_(currentFingerprint);
  if (current === '') return '';
  if (!/^[a-f0-9]{64}$/.test(current)) return 'Needs review';
  const normalizedDecision = normalizeApprovalText_(decision);
  if (normalizedDecision === 'Rejected' && normalizeApprovalText_(reviewFingerprint) === current) return 'Rejected';
  if (normalizedDecision !== 'Approved') return 'Needs review';
  const complete = normalizeApprovalText_(approvedBy) !== '' && isApprovalIsoUtc_(normalizeApprovalText_(approvedAt));
  return complete && normalizeApprovalText_(reviewFingerprint) === current && normalizeApprovalText_(approvedFingerprint) === current
    ? 'Approved' : 'Needs review';
}

function resolveApprovalHeaders_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const expected = (APPROVAL_FIELDS[sheet.getName()] || ['order', 'label', 'text', 'link']).concat(REVIEW_FIELDS);
  const optional = (OPTIONAL_APPROVAL_FIELDS[sheet.getName()] || [])
    .concat(SIGNOFF_SHEETS.indexOf(sheet.getName()) >= 0 ? SIGNOFF_FIELDS : []);
  const result = {};
  headers.forEach(function(raw, index) {
    const normalized = normalizeApprovalText_(raw).toLowerCase().replace(/\s+/g, ' ');
    let best = '';
    expected.concat(optional).forEach(function(field) {
      if ((normalized === field || (normalized.indexOf(field) === 0 && HEADER_SEPARATORS.indexOf(normalized.charAt(field.length)) >= 0)) && field.length > best.length) best = field;
    });
    if (best) {
      if (result[best] != null) throw new Error('欄位「' + best + '」重複。');
      result[best] = index + 1;
    }
  });
  expected.forEach(function(field) { if (result[field] == null) throw new Error('缺少欄位「' + field + '」。'); });
  return result;
}

function columnA1_(column) {
  let label = '';
  while (column > 0) {
    column--;
    label = String.fromCharCode(65 + column % 26) + label;
    column = Math.floor(column / 26);
  }
  return label;
}

function installApprovalFormulas() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const key = sheet.getName();
  if (key !== 'Track 1_history' && key !== 'Track 2_discussion' && key !== 'site_tldr') throw new Error('這個分頁不支援核可公式。');
  const columns = resolveApprovalHeaders_(sheet);
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const fields = key === 'site_tldr' ? ['order', 'label', 'text', 'link'] : APPROVAL_FIELDS[key];
  for (let row = 2; row <= lastRow; row++) {
    const refs = fields.map(function(field) { return columnA1_(columns[field]) + row; });
    let args = refs;
    if (key === 'Track 2_discussion') {
      const ranges = fields.map(function(field) { const col = columnA1_(columns[field]); return col + '$2:' + col + row; });
      args = refs.concat('PUBLISHED_ROW_SEQUENCE(' + ranges.join(',') + ')');
      // 選填欄位都還沒建時，公式與舊版逐字相同。只建了一欄時，另一欄以空字串占位。
      const optional = OPTIONAL_APPROVAL_FIELDS[key];
      if (optional.some(function(field) { return columns[field] != null; })) {
        args = args.concat(optional.map(function(field) { return columns[field] != null ? columnA1_(columns[field]) + row : '""'; }));
      }
    }
    sheet.getRange(row, columns.current_fingerprint).setFormula('=CONTENT_FINGERPRINT("' + key + '",' + args.join(',') + ')');
    sheet.getRange(row, columns.status).setFormula('=APPROVAL_STATUS(' + [
      'current_fingerprint', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at', 'approved_fingerprint',
    ].map(function(field) { return columnA1_(columns[field]) + row; }).join(',') + ')');
  }
  SpreadsheetApp.flush();
}

function promptRejectActiveRows() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('拒絕選取列', '輸入退回原因：', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() === ui.Button.OK) rejectActiveRows(response.getResponseText());
}

function fingerprintForSheetRow_(sheet, columns, row) {
  const key = sheet.getName();
  const fields = key === 'site_tldr' ? ['order', 'label', 'text', 'link'] : APPROVAL_FIELDS[key];
  const values = fields.map(function(field) { return sheet.getRange(row, columns[field]).getDisplayValue(); });
  let sequence;
  let optionalValues;
  if (key === 'Track 2_discussion') {
    optionalValues = OPTIONAL_APPROVAL_FIELDS[key].map(function(field) {
      return columns[field] != null ? sheet.getRange(row, columns[field]).getDisplayValue() : '';
    });
    sequence = 0;
    for (let candidate = 2; candidate <= row; candidate++) {
      const hasContent = fields.some(function(field) {
        return normalizeApprovalText_(sheet.getRange(candidate, columns[field]).getDisplayValue()) !== '';
      });
      if (hasContent) sequence++;
    }
  }
  return approvalFingerprint_(key, values, sequence, optionalValues);
}

function approveActiveRows() { reviewActiveRows_('Approved', ''); }

/**
 * 責任編輯代老師核可（feature 076 第 3.3 節）。先檢查欄位，再依序問代稱、留言連結、id 短碼清單。
 * 任一項不符就中止，此時還沒有寫入任何格。短碼比對在鎖定後、對快照執行。
 */
function approveActiveRowsWithSignoff() {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (SIGNOFF_SHEETS.indexOf(sheet.getName()) < 0) throw new Error('這個分頁不支援老師簽核。適用分頁：' + SIGNOFF_SHEETS.join('、') + '。');
  requireSignoffColumns_(resolveApprovalHeaders_(sheet));
  const labels = normalizeApprovalText_(PropertiesService.getScriptProperties().getProperty(TEACHER_LABELS_PROPERTY))
    .split('\n').map(normalizeApprovalText_).filter(function(label) { return label !== ''; });
  if (labels.length === 0) throw new Error('指令碼屬性 ' + TEACHER_LABELS_PROPERTY + ' 尚未設定老師代稱。');
  const ui = SpreadsheetApp.getUi();
  const label = promptSignoff_(ui, '輸入老師代稱：');
  if (label == null) return;
  if (labels.indexOf(label) < 0) throw new Error('老師代稱「' + label + '」不在清單內。');
  const ref = promptSignoff_(ui, '貼上老師那則留言的連結：');
  if (ref == null) return;
  if (!/^https?:\/\/\S+$/.test(ref)) throw new Error('留言連結必須是 http 或 https 開頭的網址，不可空白。');
  const list = promptSignoff_(ui, '貼上「id 短碼」清單，一列一行，例如 h5 1a2b3c4d：');
  if (list == null) return;
  reviewActiveRows_('Approved', '', { label: label, ref: ref, codes: parseSignoffCodes_(list) });
}

/** 回傳輸入文字；按取消時回傳 null。 */
function promptSignoff_(ui, message) {
  const response = ui.prompt('核可選取列（附老師簽核）', message, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return null;
  return normalizeApprovalText_(response.getResponseText());
}

function requireSignoffColumns_(columns) {
  SIGNOFF_FIELDS.forEach(function(field) {
    if (columns[field] == null) throw new Error('缺少簽核欄位「' + field + '」。請先依 operations.md 建欄。');
  });
}

/** 「id 短碼」清單轉成 id → 短碼。同一 id 出現兩次就中止。 */
function parseSignoffCodes_(text) {
  const codes = {};
  normalizeApprovalText_(text).split('\n').forEach(function(line, index) {
    const parts = normalizeApprovalText_(line).split(/[\s,，]+/).filter(function(part) { return part !== ''; });
    if (parts.length === 0) return;
    if (parts.length !== 2) throw new Error('短碼清單第 ' + (index + 1) + ' 行格式不符，應為「id 短碼」：' + line);
    if (Object.prototype.hasOwnProperty.call(codes, parts[0])) throw new Error('短碼清單中 id「' + parts[0] + '」出現兩次。');
    codes[parts[0]] = parts[1].toLowerCase();
  });
  return codes;
}

/** 選取的每一列都必須在清單中恰好出現一次，短碼等於該列指紋前 8 字元；清單不可有選取範圍外的 id。 */
function checkSignoffCodes_(snapshots, codes) {
  const seen = {};
  snapshots.forEach(function(item) {
    if (!Object.prototype.hasOwnProperty.call(codes, item.id)) throw new Error('第 ' + item.row + ' 列（id ' + item.id + '）不在短碼清單中。');
    const expected = item.fingerprint.slice(0, SIGNOFF_SHORT_CODE_LENGTH);
    if (codes[item.id] !== expected) {
      throw new Error('第 ' + item.row + ' 列（id ' + item.id + '）的短碼不符：清單為 ' + codes[item.id] + '，目前版本為 ' + expected + '。');
    }
    seen[item.id] = true;
  });
  Object.keys(codes).forEach(function(id) {
    if (!seen[id]) throw new Error('短碼清單中的 id「' + id + '」不在選取範圍內。');
  });
}
function rejectActiveRows(reason) {
  const normalized = normalizeApprovalText_(reason);
  if (normalized === '') throw new Error('拒絕必須填寫退回原因。');
  reviewActiveRows_('Rejected', normalized);
}

/**
 * signoff 只有「核可選取列（附老師簽核）」會傳入。適用分頁上，不附老師的核可會清空三個簽核欄；
 * 拒絕不碰簽核欄。快照與復原範圍是 WRITABLE_REVIEW_FIELDS 加上存在的簽核欄。
 */
function reviewActiveRows_(decision, reason, signoff) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  let sheet;
  let columns;
  let snapshots;
  let restoreFields = WRITABLE_REVIEW_FIELDS;
  try {
    sheet = SpreadsheetApp.getActiveSheet();
    columns = resolveApprovalHeaders_(sheet);
    if (signoff) requireSignoffColumns_(columns);
    const signoffFields = SIGNOFF_SHEETS.indexOf(sheet.getName()) >= 0
      ? SIGNOFF_FIELDS.filter(function(field) { return columns[field] != null; }) : [];
    restoreFields = WRITABLE_REVIEW_FIELDS.concat(signoffFields);
    const range = sheet.getActiveRange();
    const rows = Array.from({ length: range.getNumRows() }, function(_, index) { return range.getRow() + index; });
    if (rows.some(function(row) { return row < 2; })) throw new Error('不可核可標題列。');
    const actor = normalizeApprovalText_(Session.getActiveUser().getEmail());
    if (actor === '') throw new Error('無法取得核可者身分。請確認 Apps Script 授權設定。');
    snapshots = rows.map(function(row) {
      const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const fingerprint = normalizeApprovalText_(values[columns.current_fingerprint - 1]);
      if (!/^[a-f0-9]{64}$/.test(fingerprint)) throw new Error('第 ' + row + ' 列沒有可核可的 current_fingerprint。');
      if (fingerprintForSheetRow_(sheet, columns, row) !== fingerprint) throw new Error('第 ' + row + ' 列的指紋公式與發布內容不符。');
      const old = restoreFields.map(function(field) { return sheet.getRange(row, columns[field]).getValue(); });
      return { row: row, id: normalizeApprovalText_(values[columns.id - 1]), fingerprint: fingerprint, old: old };
    });
    if (signoff) checkSignoffCodes_(snapshots, signoff.codes);
    const now = new Date().toISOString();
    snapshots.forEach(function(item) {
      sheet.getRange(item.row, columns.review_decision).setValue('');
      sheet.getRange(item.row, columns.review_fingerprint).setValue(item.fingerprint);
      sheet.getRange(item.row, columns.reject_reason).setValue(reason);
      if (decision === 'Approved') {
        sheet.getRange(item.row, columns.approved_by).setValue(actor);
        sheet.getRange(item.row, columns.approved_at).setValue(now);
        sheet.getRange(item.row, columns.approved_fingerprint).setValue(item.fingerprint);
        signoffFields.forEach(function(field) { sheet.getRange(item.row, columns[field]).setValue(''); });
        if (signoff) {
          sheet.getRange(item.row, columns.signoff_by).setValue(signoff.label);
          sheet.getRange(item.row, columns.signoff_ref).setValue(signoff.ref);
          sheet.getRange(item.row, columns.signoff_fingerprint).setValue(item.fingerprint);
        }
      }
    });
    SpreadsheetApp.flush();
    const changed = snapshots.some(function(item) {
      return normalizeApprovalText_(sheet.getRange(item.row, columns.current_fingerprint).getDisplayValue()) !== item.fingerprint;
    });
    if (changed) throw new Error('審核期間內容已變更。所有審核欄位已復原。');
    snapshots.forEach(function(item) { sheet.getRange(item.row, columns.review_decision).setValue(decision); });
    SpreadsheetApp.flush();
    const expectedStatus = decision === 'Approved' ? 'Approved' : 'Rejected';
    if (snapshots.some(function(item) { return sheet.getRange(item.row, columns.status).getDisplayValue() !== expectedStatus; })) {
      throw new Error('狀態公式未產生 ' + expectedStatus + '。所有審核欄位已復原。');
    }
  } catch (error) {
    if (snapshots) {
      snapshots.forEach(function(item) {
        restoreFields.forEach(function(field, index) { sheet.getRange(item.row, columns[field]).setValue(item.old[index]); });
      });
      SpreadsheetApp.flush();
    }
    throw error;
  } finally {
    lock.releaseLock();
  }
}
