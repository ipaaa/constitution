import { createHash } from 'node:crypto';

export const SHEET_KEYS = Object.freeze({
  TRACK_1: 'Track 1_history',
  TRACK_2: 'Track 2_discussion',
  SITE_TLDR: 'site_tldr',
});

export const PUBLISHED_FIELDS = Object.freeze({
  [SHEET_KEYS.TRACK_1]: Object.freeze([
    'id', 'category', 'chapter', 'content', 'handwriting', 'year', 'title', 'ruling', 'ruling_id', 'image_url',
  ]),
  [SHEET_KEYS.TRACK_2]: Object.freeze([
    'id', 'category', 'title', 'author', 'year', 'abstract', 'link', 'views', 'owl_comment',
    'owl_depth_comment', 'vibe', 'sticky', 'full_content',
  ]),
});

const INTEGER_PATTERN = /^\d+$/;

export function normalizeText(value) {
  return String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n').trim();
}

function normalizeInteger(value, field) {
  const text = normalizeText(value);
  if (!INTEGER_PATTERN.test(text)) {
    throw new TypeError(`${field} 必須是非負整數，實際為「${text || '空白'}」。`);
  }
  return String(BigInt(text));
}

function normalizeSticky(value) {
  const text = normalizeText(value).toLowerCase();
  if (text === '' || text === 'false') return 'false';
  if (text === 'true') return 'true';
  throw new TypeError(`sticky 必須是 TRUE、FALSE 或空白，實際為「${normalizeText(value)}」。`);
}

function fieldsForRow(sheetKey, record) {
  if (sheetKey === SHEET_KEYS.SITE_TLDR) {
    const order = normalizeInteger(record.order, 'order');
    return order === '0' ? ['order', 'text', 'link'] : ['order', 'label', 'text'];
  }
  const fields = PUBLISHED_FIELDS[sheetKey];
  if (!fields) throw new TypeError(`不支援的分頁「${sheetKey}」。`);
  return fields;
}

function normalizeField(field, value) {
  if (field === 'sticky') return normalizeSticky(value);
  if (field === 'views') {
    const text = normalizeText(value);
    return text === '' ? '' : normalizeInteger(text, field);
  }
  if (field === 'order') return normalizeInteger(value, field);
  return normalizeText(value);
}

export function fingerprintPayload(sheetKey, record, sequence) {
  const projection = fieldsForRow(sheetKey, record).map(field => [field, normalizeField(field, record[field])]);
  if (sheetKey === SHEET_KEYS.TRACK_2) {
    if (!Number.isSafeInteger(sequence) || sequence < 1) {
      throw new TypeError('Track 2 指紋需要從 1 起算的非空資料列序號。');
    }
    projection.push(['__sequence', String(sequence)]);
  }
  return JSON.stringify(['approval-content-v1', sheetKey, projection]);
}

export function fingerprintPublishedRow(sheetKey, record, sequence) {
  return createHash('sha256').update(fingerprintPayload(sheetKey, record, sequence), 'utf8').digest('hex');
}
