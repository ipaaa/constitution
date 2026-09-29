/**
 * 抓取司法院公開的釋字與憲判字資料，產生 tests/fixtures/interpretation-dates.json。
 *
 * 規格見 docs/constitution-features/012-threshold-case-analysis.md 的 `### R3b`。
 *
 * 三條不可違反的規則：
 *   1. 本程式人工執行。不得進入 npm run build。
 *   2. 本程式不寫 src/data/discussions.json 或 src/data/history.json。
 *      那兩個檔是試算表同步的產物，來源與本程式完全無關。
 *   3. 必須用 Node 的 fetch 或 curl。cons.judicial.gov.tw 的 TLS 憑證缺少
 *      Subject Key Identifier 擴充欄位，Python 的 urllib 會拒絕連線。
 *      這不是本機環境問題，任何用 OpenSSL 預設信任鏈的機器都會失敗。
 *
 * 執行方式：node scripts/fetch-interpretation-counts.mjs
 *
 * 本檔同時匯出抓取函式，供 tests/threshold-analysis.test.mjs 的 THRESHOLD_LIVE=1
 * 分支重跑線上比對（AC-6）。匯入本檔不會觸發抓取。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const LIST_URL = 'https://cons.judicial.gov.tw/judcurrent.aspx?fid=2195';
export const DOC_URL = (id) => `https://cons.judicial.gov.tw/docdata.aspx?fid=100&id=${id}`;
export const JUDGMENT_URL = 'https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38';

export const FIXTURE_PATH = path.join(__dirname, '../tests/fixtures/interpretation-dates.json');

/** 清單頁的錨點格式。id 不可用算式推：釋字第 813 號的 id 是 325335，不符 N + 310181。 */
const LIST_ANCHOR = /title="釋字第(\d+)號"\s+href="\/docdata\.aspx\?fid=100&id=(\d+)"/g;
/** 明細頁的發布日期。已是西元，不需民國年換算。 */
const DOC_DATE = /發布日期：(\d{4}-\d{2}-\d{2})/;
/** 憲判字錨點。民國年 + 1911 = 西元年。 */
const JUDGMENT_ANCHOR = /title="(\d{3})年憲判字第(\d+)號"/g;

async function getText(url, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'constitution-app/threshold-analysis' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw new Error(`抓取失敗：${url} — ${lastError?.message}`);
}

/**
 * 解析清單頁，回傳 [{ number, id }]，依釋字號遞增。
 * 同時檢查有沒有缺號或重複號。
 */
export async function fetchInterpretationIndex() {
  const html = await getText(LIST_URL);
  const byNumber = new Map();
  for (const m of html.matchAll(LIST_ANCHOR)) {
    byNumber.set(Number(m[1]), Number(m[2]));
  }
  const entries = [...byNumber.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, id]) => ({ number, id }));

  if (entries.length === 0) throw new Error('清單頁解析不到任何釋字錨點，來源網站可能已變動');
  const missing = [];
  for (let n = 1; n <= entries[entries.length - 1].number; n++) {
    if (!byNumber.has(n)) missing.push(n);
  }
  if (missing.length > 0) throw new Error(`釋字號缺號：${missing.join(', ')}`);

  return entries;
}

/** 抓單一明細頁的發布日期。 */
export async function fetchPublicationDate(id) {
  const html = await getText(DOC_URL(id));
  const m = html.match(DOC_DATE);
  if (!m) throw new Error(`明細頁找不到發布日期：${DOC_URL(id)}`);
  return m[1];
}

/**
 * 併發抓全部明細頁，回傳 [[釋字號, id, 發布日期]]，依釋字號遞增。
 * onProgress 收到已完成筆數，供 CLI 顯示進度；測試不傳。
 */
export async function fetchAllDates(index, { concurrency = 6, onProgress } = {}) {
  const out = new Array(index.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < index.length) {
      const i = cursor++;
      const { number, id } = index[i];
      out[i] = [number, id, await fetchPublicationDate(id)];
      done++;
      if (onProgress) onProgress(done, index.length);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return out;
}

/**
 * 抓憲判字單頁，回傳 [[西元年, 件數]] 依年遞增。
 * 順帶檢查各年編號自 1 連續無缺號。
 */
export async function fetchJudgmentCounts() {
  const html = await getText(JUDGMENT_URL);
  const byYear = new Map();
  for (const m of html.matchAll(JUDGMENT_ANCHOR)) {
    const year = Number(m[1]) + 1911;
    if (!byYear.has(year)) byYear.set(year, new Set());
    byYear.get(year).add(Number(m[2]));
  }
  if (byYear.size === 0) throw new Error('憲判字頁解析不到任何錨點，來源網站可能已變動');

  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, numbers]) => {
      const max = Math.max(...numbers);
      if (numbers.size !== max) throw new Error(`${year} 年憲判字編號不連續：共 ${numbers.size} 筆，最大號 ${max}`);
      return [year, numbers.size];
    });
}

/** 依發布日期的西元年彙總逐年件數。 */
export function summariseByYear(rows) {
  const byYear = new Map();
  for (const [, , date] of rows) {
    const year = Number(date.slice(0, 4));
    byYear.set(year, (byYear.get(year) ?? 0) + 1);
  }
  return [...byYear.entries()].sort((a, b) => a[0] - b[0]);
}

async function main() {
  process.stdout.write('抓清單頁…\n');
  const index = await fetchInterpretationIndex();
  process.stdout.write(`解析出 ${index.length} 個釋字號，範圍 ${index[0].number}–${index[index.length - 1].number}，無缺號\n`);

  const rows = await fetchAllDates(index, {
    onProgress: (done, total) => {
      if (done % 50 === 0 || done === total) process.stdout.write(`  明細頁 ${done}/${total}\n`);
    },
  });

  process.stdout.write('抓憲判字頁…\n');
  const judgments = await fetchJudgmentCounts();

  const fixture = {
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: { list: LIST_URL, doc: DOC_URL('{id}'), judgment: JUDGMENT_URL },
    /** [釋字號, 明細頁 id, 發布日期]。id 一併存下，讓 AC-6 能核對 813 號的 id 例外仍在。 */
    interpretations: rows,
    /** [西元年, 憲判字件數]。抓取當年尚未結束，該年數字會再變動。 */
    judgments,
  };

  fs.mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
  fs.writeFileSync(FIXTURE_PATH, JSON.stringify(fixture) + '\n');
  process.stdout.write(`已寫入 ${path.relative(process.cwd(), FIXTURE_PATH)}（${rows.length} 筆）\n\n`);

  process.stdout.write('釋字逐年件數：\n');
  for (const [year, count] of summariseByYear(rows)) {
    process.stdout.write(`  ${year}: ${count}\n`);
  }
  process.stdout.write('憲判字逐年件數：\n');
  for (const [year, count] of judgments) {
    process.stdout.write(`  ${year}: ${count}\n`);
  }
}

if (process.argv[1] === __filename) {
  await main();
}
