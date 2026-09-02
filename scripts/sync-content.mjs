import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 內容同步。從 SSOT 試算表的三個分頁讀取，驗證通過後才寫入 src/data/。
 *
 * 規格見 docs/content-pipeline/design.md：
 *   第二節 欄位定義與標題解析規則
 *   第四節 檢查機制
 *   第六節 不變式
 *
 * 兩條不可違反的規則：
 *   1. 驗證失敗即整份中止，一個檔案都不寫。不可以跳過壞的列只寫好的列。（不變式 #3）
 *   2. 部署不執行同步。package.json 的 build 不含本程式。要同步要有人手動執行。（不變式 #1）
 *
 * 執行方式：npm run sync-content
 *
 * 三個環境變數指向 SSOT 試算表的發布 CSV 網址。
 * 網址不寫進 repo —— 那個網址等於整份試算表的公開讀取入口。
 */
const CONFIG = {
  TRACK_1_CSV: process.env.TRACK_1_CSV_URL || '',
  TRACK_2_CSV: process.env.TRACK_2_CSV_URL || '',
  SITE_TLDR_CSV: process.env.SITE_TLDR_CSV_URL || '',
  OUTPUT_DIR: path.join(__dirname, '../src/data'),
};

/**
 * 欄位標題的分隔符。標題可以在欄位名稱後面接中文說明，例如
 * `id (給系統看的編號)`。程式以「最長前綴比對」解析，見 resolveHeader。
 *
 * `_` 不是分隔符。它是欄位名稱的一部分（`ruling_id`）。
 * 把 `_` 當分隔符會讓打錯的 `ruling_di` 被誤認成 `ruling`，那正是要擋的情況。
 */
const HEADER_SEPARATORS = new Set([' ', '\t', '(', '（', '[', '［', '{', '｛', '-', '–', '—', ':', '：', '/', '｜', '|', ',', '，']);

/**
 * vibe 的允許清單。
 *
 * design.md 第七節記載：最終分類清單是內容決定，編輯台尚未決定。
 * 這份清單取自目前已發布的 discussions.json 實際值。
 * 試算表出現清單以外的值時，同步會中止並指名該值 —— 這是刻意的，
 * 讓新分類經過一次人為確認，而不是靜默進入網站。
 * 編輯台決定最終清單後，改這個常數，並同步設定試算表的下拉選單。
 */
const ALLOWED_VIBES = [
  '🔥 公民必讀',
  '🌍 國際視角',
  '💬 正反交鋒',
  '📖 深度解析',
  '📣 懶人入門',
  '🎯 精準短評',
  '🔭 他山之石',
  '💡 腦袋升級',
  '🔥 戰火猛烈',
];

/**
 * 佔位與測試字串。見 AGENTS.md「不要把設計文件裡的範例當成真實內容」。
 * `test test test` 與 `某學者，某大學法律系` 都真的上線過。
 *
 * 不收單獨的 `test`。latest、protest、contest 等正常字詞都含有它，會誤判。
 */
const PLACEHOLDER_PATTERNS = [
  'test test',
  'lorem ipsum',
  '某學者',
  '某大學法律系',
  '快速了解最新判決的5個重點',
];

/**
 * 欄位定義。
 *   column: required —— 試算表必須有這一欄，沒有就中止
 *   value:  required —— 已核可的列，這一欄不可空白
 *
 * `status` 的欄位必須存在，但值可以空白（空白代表尚未核可）。
 * `approved_by`／`approved_at`／`reject_reason` 目前試算表還沒建立。
 * 先列為選填，日後建立時同步不會因為多出欄位而中止。
 */
const TRACK_1_COLUMNS = [
  { field: 'id', aliases: ['id'], column: 'required', value: 'required' },
  { field: 'category', aliases: ['category'], column: 'required', value: 'required' },
  { field: 'year', aliases: ['year'], column: 'required', value: 'required' },
  { field: 'ruling_id', aliases: ['ruling_id', 'ruling id'], column: 'required', value: 'required' },
  { field: 'ruling', aliases: ['ruling'], column: 'required', value: 'required' },
  { field: 'content', aliases: ['content'], column: 'required', value: 'required' },
  { field: 'title', aliases: ['title'], column: 'required', value: 'required' },
  { field: 'status', aliases: ['status'], column: 'required', value: 'optional' },
  { field: 'chapter', aliases: ['chapter'], column: 'optional', value: 'optional' },
  { field: 'handwriting', aliases: ['handwriting'], column: 'optional', value: 'optional' },
  { field: 'image_url', aliases: ['image_url', 'image url'], column: 'optional', value: 'optional' },
  { field: 'approved_by', aliases: ['approved_by', 'approved by'], column: 'optional', value: 'optional' },
  { field: 'approved_at', aliases: ['approved_at', 'approved at'], column: 'optional', value: 'optional' },
  { field: 'reject_reason', aliases: ['reject_reason', 'reject reason'], column: 'optional', value: 'optional' },
];

const TRACK_2_COLUMNS = [
  { field: 'id', aliases: ['id'], column: 'required', value: 'required' },
  { field: 'category', aliases: ['category'], column: 'required', value: 'required' },
  { field: 'title', aliases: ['title'], column: 'required', value: 'required' },
  { field: 'author', aliases: ['author'], column: 'required', value: 'required' },
  { field: 'year', aliases: ['year'], column: 'required', value: 'required' },
  { field: 'link', aliases: ['link'], column: 'required', value: 'required' },
  { field: 'abstract', aliases: ['abstract'], column: 'required', value: 'required' },
  { field: 'vibe', aliases: ['vibe'], column: 'required', value: 'required' },
  { field: 'status', aliases: ['status'], column: 'required', value: 'optional' },
  { field: 'owl_comment', aliases: ['owl comment', 'owl_comment'], column: 'optional', value: 'optional' },
  { field: 'owl_depth_comment', aliases: ['owl depth comment', 'owl_depth_comment'], column: 'optional', value: 'optional' },
  { field: 'views', aliases: ['views'], column: 'optional', value: 'optional' },
  { field: 'sticky', aliases: ['sticky'], column: 'optional', value: 'optional' },
  { field: 'full_content', aliases: ['full content', 'full_content'], column: 'optional', value: 'optional' },
  { field: 'approved_by', aliases: ['approved_by', 'approved by'], column: 'optional', value: 'optional' },
  { field: 'approved_at', aliases: ['approved_at', 'approved at'], column: 'optional', value: 'optional' },
  { field: 'reject_reason', aliases: ['reject_reason', 'reject reason'], column: 'optional', value: 'optional' },
];

const SITE_TLDR_COLUMNS = [
  { field: 'order', aliases: ['order'], column: 'required', value: 'required' },
  { field: 'text', aliases: ['text'], column: 'required', value: 'required' },
  { field: 'status', aliases: ['status'], column: 'required', value: 'optional' },
  // label 只有 order ≥ 1 用得到。order 0 的 label 沒有意義，另行檢查。
  { field: 'label', aliases: ['label'], column: 'required', value: 'optional' },
  // link 只有 order 0 用得到。order 0 的 link 必須是合法網址，另行檢查。
  { field: 'link', aliases: ['link'], column: 'required', value: 'optional' },
];

const TRACK_1 = 'Track 1';
const TRACK_2 = 'Track 2';
const SITE_TLDR = 'site_tldr';
const SETTINGS = '設定';
const GROUP_ORDER = [SETTINGS, TRACK_1, TRACK_2, SITE_TLDR];

/**
 * Robust CSV parser that handles newlines and commas within quotes.
 *
 * 這個掃描迴圈維持原樣。design.md 第二節的實測是用它跑的，換掉就等於實測作廢。
 * 只改了回傳值：原本直接組成以標題字串為鍵的物件，會讓重複標題無聲互相覆蓋。
 * 現在回傳原始列，由 buildColumnMap 負責解析標題並擋下重複。
 */
function parseCSVRows(csv) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (currentField !== '' || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        }
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
      } else {
        currentField += char;
      }
    }
  }

  // Handle last field if file doesn't end with newline
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// 錯誤蒐集
// ---------------------------------------------------------------------------

/**
 * 一次蒐集所有錯誤再一起回報。
 * 遇到第一個錯誤就停，編輯要改三輪才知道有三個問題。
 */
function addError(errors, group, key, message) {
  errors.push({ group, key, message });
}

/** 錯誤訊息裡的值要指得出來，但不能長到把訊息淹掉。 */
function trunc(value, max = 40) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** 一列在錯誤訊息裡叫什麼。有 id 用 id，沒有就用 CSV 的列號。 */
function rowKey(record, keyField = 'id') {
  const value = (record[keyField] || '').trim();
  return value !== '' ? value : `第 ${record.line} 列`;
}

function report(errors) {
  console.error('❌ 驗證失敗，未寫入任何檔案：');
  console.error('');
  const groups = [...new Set(errors.map(e => e.group))]
    .sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
  const width = Math.max(...errors.map(e => e.key.length));
  for (const group of groups) {
    console.error(`  ${group}`);
    for (const error of errors.filter(e => e.group === group)) {
      console.error(`    ${error.key.padEnd(width)}  ${error.message}`);
    }
  }
  console.error('');
  console.error(`共 ${errors.length} 項錯誤。請修正 SSOT 後重試。`);
}

// ---------------------------------------------------------------------------
// 欄位標題解析
// ---------------------------------------------------------------------------

/**
 * 最長前綴比對。design.md 第二節：
 *   1. 去掉頭尾空白、轉小寫
 *   2. 找出「等於欄位名稱」或「以欄位名稱加分隔符開頭」的候選
 *   3. 取最長的（所以 `owl comment` 不會被誤認成 `owl`）
 *   4. 找不到就回傳 null，由呼叫端中止並指名
 */
function resolveHeader(normalizedHeader, columns) {
  let best = null;
  for (const column of columns) {
    for (const alias of column.aliases) {
      const matches =
        normalizedHeader === alias ||
        (normalizedHeader.startsWith(alias) && HEADER_SEPARATORS.has(normalizedHeader[alias.length]));
      if (matches && (best === null || alias.length > best.alias.length)) {
        best = { alias, field: column.field };
      }
    }
  }
  return best;
}

/**
 * 解析標題列，回傳「欄位名稱 → 欄索引」。
 *
 * 三種會中止的情況：
 *   看不懂的標題        —— 取不到值會讓整欄靜默變空（不變式 #5）
 *   兩個標題指向同一欄位 —— 後者覆蓋前者，前者的內容無聲消失
 *   缺少必要欄位        —— 同上
 *
 * 一種不中止：標題空白且整欄都沒有資料。試算表末端常留這種空欄，
 * 它沒有承載任何內容，忽略它不會遺失東西。標題空白但欄內有資料則中止。
 */
function buildColumnMap(rows, columns, group, errors) {
  const headers = rows[0];
  const fieldToIndex = {};
  const headerTextByField = {};
  const errorsBefore = errors.length;

  for (let i = 0; i < headers.length; i++) {
    const raw = headers[i];
    const normalized = raw.trim().toLowerCase().replace(/\s+/g, ' ');

    if (normalized === '') {
      const hasData = rows.slice(1).some(row => (row[i] || '').trim() !== '');
      if (hasData) {
        addError(errors, group, '標題', `第 ${i + 1} 欄沒有標題，但欄內有資料。補上標題，或清空該欄。`);
      }
      continue;
    }

    const resolved = resolveHeader(normalized, columns);
    if (resolved === null) {
      addError(errors, group, '標題', `第 ${i + 1} 欄的標題「${trunc(raw)}」對不到任何預期欄位。檢查是否打錯字。`);
      continue;
    }
    if (resolved.field in fieldToIndex) {
      addError(
        errors,
        group,
        '標題',
        `欄位 ${resolved.field} 有兩欄：第 ${fieldToIndex[resolved.field] + 1} 欄「${trunc(headerTextByField[resolved.field])}」與第 ${i + 1} 欄「${trunc(raw)}」。刪掉多餘的一欄。`,
      );
      continue;
    }

    fieldToIndex[resolved.field] = i;
    headerTextByField[resolved.field] = raw.trim();
  }

  for (const column of columns) {
    if (column.column === 'required' && !(column.field in fieldToIndex)) {
      addError(errors, group, '標題', `缺少必要欄位「${column.field}」。`);
    }
  }

  // 標題有問題時，欄索引不可信。再往下逐列檢查只會產生一堆假錯誤。
  return errors.length === errorsBefore ? fieldToIndex : null;
}

/** 把資料列轉成以欄位名稱為鍵的物件。整列空白的列跳過（試算表末端的空列）。 */
function toRecords(rows, fieldToIndex) {
  return rows
    .slice(1)
    .map((cells, index) => ({ cells, line: index + 2 }))
    .filter(({ cells }) => cells.some(cell => (cell || '').trim() !== ''))
    .map(({ cells, line }) => {
      const record = { line };
      for (const [field, index] of Object.entries(fieldToIndex)) {
        record[field] = (cells[index] || '').trim();
      }
      return record;
    });
}

// ---------------------------------------------------------------------------
// 共通檢查
// ---------------------------------------------------------------------------

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function findPlaceholder(value) {
  const haystack = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.find(pattern => haystack.includes(pattern.toLowerCase())) ?? null;
}

function isApproved(record) {
  return (record.status || '').trim().toLowerCase() === 'approved';
}

/**
 * status 的值檢查對「所有列」執行，不只已核可的列。
 * 把 Approved 打成 Approve 的列會被過濾掉，網站上少一筆而沒有人會發現。
 * 那是靜默失敗，正是本次要擋的東西。
 */
function checkStatusValues(records, group, errors, keyField = 'id') {
  for (const record of records) {
    const status = (record.status || '').trim().toLowerCase();
    if (status !== '' && status !== 'approved' && status !== 'rejected') {
      addError(errors, group, rowKey(record, keyField), `status 必須是 Approved、Rejected 或空白，實際為「${trunc(record.status)}」。`);
    }
  }
}

/**
 * 必填欄位的值檢查只對「已核可的列」執行。
 *
 * 試算表是寫作者的工作區，一定有寫到一半的草稿列。
 * 對草稿列套必填檢查，等於任何人存檔到一半就擋住整份發布，
 * 產線會沒有人敢用。未核可的列進不了網站，它空著不構成風險。
 */
function checkRequiredValues(records, columns, fieldToIndex, group, errors, keyField = 'id') {
  for (const record of records) {
    for (const column of columns) {
      if (column.value !== 'required') continue;
      if (!(column.field in fieldToIndex)) continue;
      if (record[column.field] === '') {
        addError(errors, group, rowKey(record, keyField), `${column.field} 不可為空。`);
      }
    }
  }
}

/** 鍵值不可重複。重複時網站的 find() 只會拿到其中一筆，另一筆等於不存在。 */
function checkUniqueKeys(records, keyField, group, errors) {
  const seen = new Map();
  for (const record of records) {
    const value = record[keyField];
    if (value === '') continue; // 已由 checkRequiredValues 回報
    if (seen.has(value)) {
      addError(errors, group, rowKey(record, keyField), `${keyField} 與第 ${seen.get(value)} 列重複。`);
    } else {
      seen.set(value, record.line);
    }
  }
}

function checkPlaceholders(record, fields, group, errors, keyField = 'id') {
  for (const field of fields) {
    const value = record[field];
    if (!value) continue;
    const hit = findPlaceholder(value);
    if (hit !== null) {
      addError(errors, group, rowKey(record, keyField), `${field} 含有測試字串「${hit}」。`);
    }
  }
}

// ---------------------------------------------------------------------------
// 抓取
// ---------------------------------------------------------------------------

async function fetchCSV(url, group, errors) {
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    addError(errors, group, '抓取', `連不上試算表：${err.message}`);
    return null;
  }
  if (!response.ok) {
    addError(errors, group, '抓取', `試算表回應 HTTP ${response.status}。確認分頁仍是「發布到網路」狀態。`);
    return null;
  }
  const text = await response.text();
  if (/^\s*<(!doctype|html)/i.test(text)) {
    addError(errors, group, '抓取', '回應不是 CSV，是一個 HTML 網頁。網址要用「發布到網路」產生的 CSV 匯出網址。');
    return null;
  }
  return text;
}

// ---------------------------------------------------------------------------
// Track 1 — 歷史軌
// ---------------------------------------------------------------------------

function buildTrack1(csv, errors) {
  const rows = parseCSVRows(csv);
  if (rows.length < 2) {
    addError(errors, TRACK_1, '內容', '試算表沒有資料列。');
    return null;
  }

  const fieldToIndex = buildColumnMap(rows, TRACK_1_COLUMNS, TRACK_1, errors);
  if (fieldToIndex === null) return null;

  const records = toRecords(rows, fieldToIndex);
  checkStatusValues(records, TRACK_1, errors);

  const approved = records.filter(isApproved);
  checkRequiredValues(approved, TRACK_1_COLUMNS, fieldToIndex, TRACK_1, errors);
  checkUniqueKeys(approved, 'id', TRACK_1, errors);

  for (const record of approved) {
    if (record.year !== '' && !/^\d{4}$/.test(record.year)) {
      addError(errors, TRACK_1, rowKey(record), `year 應為 4 位數字，實際為「${trunc(record.year)}」。`);
    }
    if (record.image_url && !isHttpUrl(record.image_url)) {
      addError(errors, TRACK_1, rowKey(record), `image_url 不是合法網址，實際為「${trunc(record.image_url)}」。`);
    }
    checkPlaceholders(record, ['title', 'content', 'ruling', 'handwriting'], TRACK_1, errors);
  }

  if (errors.length > 0) return null;

  return approved
    .map(record => ({
      id: record.id,
      category: record.category,
      textbook: {
        chapter: record.chapter ?? '',
        content: record.content,
        handwriting: record.handwriting ?? '',
      },
      reality: {
        year: record.year,
        title: record.title,
        ruling: record.ruling,
        ruling_id: record.ruling_id,
        bgImage: record.image_url ?? '',
      },
    }))
    .sort((a, b) => parseInt(a.reality.year, 10) - parseInt(b.reality.year, 10));
}

// ---------------------------------------------------------------------------
// Track 2 — 討論軌
// ---------------------------------------------------------------------------

function buildTrack2(csv, errors) {
  const rows = parseCSVRows(csv);
  if (rows.length < 2) {
    addError(errors, TRACK_2, '內容', '試算表沒有資料列。');
    return null;
  }

  const fieldToIndex = buildColumnMap(rows, TRACK_2_COLUMNS, TRACK_2, errors);
  if (fieldToIndex === null) return null;

  const records = toRecords(rows, fieldToIndex);
  checkStatusValues(records, TRACK_2, errors);

  const approved = records.filter(isApproved);
  checkRequiredValues(approved, TRACK_2_COLUMNS, fieldToIndex, TRACK_2, errors);
  checkUniqueKeys(approved, 'id', TRACK_2, errors);

  for (const record of approved) {
    if (record.link !== '' && !isHttpUrl(record.link)) {
      addError(errors, TRACK_2, rowKey(record), `link 不是合法網址，實際為「${trunc(record.link)}」。`);
    }
    if (record.vibe !== '' && !ALLOWED_VIBES.includes(record.vibe)) {
      addError(errors, TRACK_2, rowKey(record), `vibe「${trunc(record.vibe)}」不在允許清單內。允許的值：${ALLOWED_VIBES.join('、')}。`);
    }
    const sticky = (record.sticky || '').toLowerCase();
    if (sticky !== '' && sticky !== 'true' && sticky !== 'false') {
      addError(errors, TRACK_2, rowKey(record), `sticky 必須是 TRUE、FALSE 或空白，實際為「${trunc(record.sticky)}」。`);
    }
    if (record.views && !/^\d+$/.test(record.views)) {
      addError(errors, TRACK_2, rowKey(record), `views 必須是非負整數，實際為「${trunc(record.views)}」。`);
    }
    checkPlaceholders(record, ['title', 'author', 'abstract', 'owl_comment'], TRACK_2, errors);
  }

  if (errors.length > 0) return null;

  // 鍵的順序決定 discussions.json 的欄位順序。維持現有順序，讓 PR 的 diff 只顯示真正的內容差異。
  return approved.map(record => ({
    id: record.id,
    category: record.category,
    title: record.title,
    author: record.author,
    year: record.year,
    abstract: record.abstract,
    link: record.link,
    ...(record.views ? { views: parseInt(record.views, 10) } : {}),
    owl_comment: record.owl_comment ?? '',
    ...(record.owl_depth_comment ? { owl_depth_comment: record.owl_depth_comment } : {}),
    ...(record.vibe ? { vibe: record.vibe } : {}),
    sticky: (record.sticky || '').toLowerCase() === 'true',
    ...(record.full_content ? { full_content: record.full_content } : {}),
  }));
}

// ---------------------------------------------------------------------------
// site_tldr — 網站置頂摘要區塊
// ---------------------------------------------------------------------------

/**
 * 還原成 discussions.json 裡 id 為 tldr 的那一筆。design.md 第二節：
 *   1. 取 status = Approved 的列，依 order 排序
 *   2. order 0 → 這筆的 title 與 link
 *   3. order ≥ 1 → 各列組成 `**{label}**：{text}`，用換行接起來
 *   4. 產出 id: 'tldr'、category: 'Official TL;DR'、author: '憲庭加好友'
 *
 * id 的值不可以改。網站用 DISCUSSIONS_DATA.find(item => item.id === 'tldr') 找它，
 * 而 OfficialTLDR 的第一行是 if (!item) return null —— 找不到不會報錯，整個區塊直接消失。
 */
function buildSiteTldr(csv, errors) {
  const rows = parseCSVRows(csv);
  if (rows.length < 2) {
    addError(errors, SITE_TLDR, '內容', '試算表沒有資料列。');
    return null;
  }

  const fieldToIndex = buildColumnMap(rows, SITE_TLDR_COLUMNS, SITE_TLDR, errors);
  if (fieldToIndex === null) return null;

  const records = toRecords(rows, fieldToIndex);
  checkStatusValues(records, SITE_TLDR, errors, 'order');

  const approved = records.filter(isApproved);
  checkRequiredValues(approved, SITE_TLDR_COLUMNS, fieldToIndex, SITE_TLDR, errors, 'order');

  for (const record of approved) {
    if (record.order !== '' && !/^\d+$/.test(record.order)) {
      addError(errors, SITE_TLDR, rowKey(record, 'order'), `order 必須是非負整數，實際為「${trunc(record.order)}」。`);
    }
    checkPlaceholders(record, ['label', 'text'], SITE_TLDR, errors, 'order');
  }
  checkUniqueKeys(approved, 'order', SITE_TLDR, errors);

  const heading = approved.find(record => record.order === '0');
  if (heading === undefined) {
    const unapproved = records.find(record => record.order === '0');
    if (unapproved === undefined) {
      addError(errors, SITE_TLDR, 'order 0', '缺少 order 0 的列。那一列是摘要區塊的標題與出處連結。');
    } else {
      // 只收 Approved 的話，空白會讓標題和連結被濾掉，摘要區塊會變成沒有抬頭、點不出去。
      addError(errors, SITE_TLDR, 'order 0', `order 0 的 status 必須是 Approved，實際為「${trunc(unapproved.status) || '空白'}」。`);
    }
  } else if (!isHttpUrl(heading.link)) {
    addError(errors, SITE_TLDR, 'order 0', `link 不是合法網址，實際為「${trunc(heading.link) || '空白'}」。`);
  }

  const points = approved
    .filter(record => record.order !== '' && record.order !== '0' && /^\d+$/.test(record.order))
    .sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));

  if (points.length === 0) {
    addError(errors, SITE_TLDR, '內容', 'order ≥ 1 沒有任何一列通過核可。摘要區塊會沒有內容。');
  }
  for (const record of points) {
    if (record.label === '') {
      addError(errors, SITE_TLDR, rowKey(record, 'order'), 'label 不可為空。它是這個重點的小標。');
    }
  }

  if (errors.length > 0) return null;

  return {
    id: 'tldr',
    category: 'Official TL;DR',
    title: heading.text,
    author: '憲庭加好友',
    year: '',
    abstract: points.map(record => `**${record.label}**：${record.text}`).join('\n'),
    link: heading.link,
    owl_comment: '',
    sticky: false,
  };
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Starting Content Sync...');

  const errors = [];

  const sources = [
    { group: TRACK_1, name: 'TRACK_1_CSV_URL', url: CONFIG.TRACK_1_CSV },
    { group: TRACK_2, name: 'TRACK_2_CSV_URL', url: CONFIG.TRACK_2_CSV },
    { group: SITE_TLDR, name: 'SITE_TLDR_CSV_URL', url: CONFIG.SITE_TLDR_CSV },
  ];
  for (const source of sources) {
    if (source.url === '') {
      addError(errors, SETTINGS, source.name, `環境變數未設定。同步需要 ${source.group} 分頁的發布 CSV 網址。`);
    }
  }
  if (errors.length > 0) return abort(errors);

  console.log('⏳ 讀取試算表…');
  const [csv1, csv2, csv3] = await Promise.all(sources.map(source => fetchCSV(source.url, source.group, errors)));
  if (errors.length > 0) return abort(errors);

  console.log('⏳ 檢查資料…');
  const history = buildTrack1(csv1, errors);
  const discussions = buildTrack2(csv2, errors);
  const tldr = buildSiteTldr(csv3, errors);
  if (errors.length > 0) return abort(errors);

  // 全部通過才寫。序列化完成後才動硬碟，避免寫到一半失敗留下半份檔案。
  const historyJSON = JSON.stringify(history, null, 2);
  const discussionsJSON = JSON.stringify([...discussions, tldr], null, 2);

  fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'history.json'), historyJSON);
  fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'discussions.json'), discussionsJSON);

  console.log(`✅ 檢查通過，已寫入 src/data/history.json（${history.length} 筆）`);
  console.log(`✅ 檢查通過，已寫入 src/data/discussions.json（${discussions.length + 1} 筆，含 tldr）`);
  console.log('🏁 同步完成。下一步：檢查 git diff，開 PR，讓編輯台看過預覽再合併。');
}

function abort(errors) {
  report(errors);
  process.exitCode = 1;
}

main();
