/** fingerprint-v1 與審核選單。只部署到隔離測試表，probe 通過前不得套用正式 SSOT。 */

const APPROVAL_VERSION = 'approval-content-v1';
const APPROVAL_FIELDS = {
  'Track 1_history': ['id', 'category', 'chapter', 'content', 'handwriting', 'year', 'title', 'ruling', 'ruling_id', 'image_url'],
  'Track 2_discussion': ['id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment', 'owl_depth_comment', 'vibe', 'sticky', 'full_content'],
};
const REVIEW_FIELDS = [
  'status', 'review_decision', 'review_fingerprint', 'approved_by', 'approved_at',
  'approved_fingerprint', 'current_fingerprint', 'reject_reason',
];
const WRITABLE_REVIEW_FIELDS = REVIEW_FIELDS.filter(function(field) {
  return field !== 'status' && field !== 'current_fingerprint';
});
const HEADER_SEPARATORS = ' \t(（[［{｛-–—:：/｜|,，';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Review')
    .addItem('安裝／更新公式', 'installApprovalFormulas')
    .addSeparator()
    .addItem('核可選取列', 'approveActiveRows')
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

function approvalFingerprint_(sheetKey, values, sequence) {
  const fields = approvalFieldsFor_(sheetKey, values);
  const sourceFields = sheetKey === 'site_tldr' ? ['order', 'label', 'text', 'link'] : APPROVAL_FIELDS[sheetKey];
  const record = {};
  sourceFields.forEach(function(field, index) { record[field] = values[index]; });
  const projection = fields.map(function(field) {
    return [field, normalizeApprovalField_(field, record[field])];
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

/** 試算表公式：依固定欄位順序傳值。Track 2 最後一個參數必須是非空資料列序號。 */
function CONTENT_FINGERPRINT(sheetKey) {
  const args = Array.prototype.slice.call(arguments, 1);
  const count = APPROVAL_FIELDS[sheetKey] ? APPROVAL_FIELDS[sheetKey].length : 4;
  const values = args.slice(0, count);
  if (values.every(function(value) { return normalizeApprovalText_(value) === ''; })) return '';
  try {
    return approvalFingerprint_(sheetKey, values, sheetKey === 'Track 2_discussion' ? args[count] : undefined);
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
  const approvedTime = normalizeApprovalText_(approvedAt);
  const complete = normalizeApprovalText_(approvedBy) !== '' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(approvedTime)
    && !isNaN(Date.parse(approvedTime));
  return complete && normalizeApprovalText_(reviewFingerprint) === current && normalizeApprovalText_(approvedFingerprint) === current
    ? 'Approved' : 'Needs review';
}

function resolveApprovalHeaders_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const expected = (APPROVAL_FIELDS[sheet.getName()] || ['order', 'label', 'text', 'link']).concat(REVIEW_FIELDS);
  const result = {};
  headers.forEach(function(raw, index) {
    const normalized = normalizeApprovalText_(raw).toLowerCase().replace(/\s+/g, ' ');
    let best = '';
    expected.forEach(function(field) {
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
  if (key === 'Track 2_discussion') {
    sequence = 0;
    for (let candidate = 2; candidate <= row; candidate++) {
      const hasContent = fields.some(function(field) {
        return normalizeApprovalText_(sheet.getRange(candidate, columns[field]).getDisplayValue()) !== '';
      });
      if (hasContent) sequence++;
    }
  }
  return approvalFingerprint_(key, values, sequence);
}

function approveActiveRows() { reviewActiveRows_('Approved', ''); }
function rejectActiveRows(reason) {
  const normalized = normalizeApprovalText_(reason);
  if (normalized === '') throw new Error('拒絕必須填寫退回原因。');
  reviewActiveRows_('Rejected', normalized);
}

function reviewActiveRows_(decision, reason) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  let sheet;
  let columns;
  let snapshots;
  try {
    sheet = SpreadsheetApp.getActiveSheet();
    columns = resolveApprovalHeaders_(sheet);
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
      const old = WRITABLE_REVIEW_FIELDS.map(function(field) { return sheet.getRange(row, columns[field]).getValue(); });
      return { row: row, fingerprint: fingerprint, old: old };
    });
    const now = new Date().toISOString();
    snapshots.forEach(function(item) {
      sheet.getRange(item.row, columns.review_decision).setValue('');
      sheet.getRange(item.row, columns.review_fingerprint).setValue(item.fingerprint);
      sheet.getRange(item.row, columns.reject_reason).setValue(reason);
      if (decision === 'Approved') {
        sheet.getRange(item.row, columns.approved_by).setValue(actor);
        sheet.getRange(item.row, columns.approved_at).setValue(now);
        sheet.getRange(item.row, columns.approved_fingerprint).setValue(item.fingerprint);
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
        WRITABLE_REVIEW_FIELDS.forEach(function(field, index) { sheet.getRange(item.row, columns[field]).setValue(item.old[index]); });
      });
      SpreadsheetApp.flush();
    }
    throw error;
  } finally {
    lock.releaseLock();
  }
}
