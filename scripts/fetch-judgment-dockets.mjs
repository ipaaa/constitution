/**
 * 抓取司法院公開的憲判字清單，產生 tests/fixtures/judgment-dockets.json。
 *
 * 規格見 docs/constitution-features/systematic-chinese-content-legal-audit.md 的 `### 六、Data requirements`。
 * 這份 fixture 是 scripts/content-audit.mjs 的 M1（號次存在）與 M2（號次與年份配對）的權威來源。
 *
 * 三條不可違反的規則：
 *   1. 本程式人工執行。不得進入 npm run build。
 *   2. 本程式只寫 tests/fixtures/judgment-dockets.json。
 *      不寫 src/data/，也不改 tests/fixtures/interpretation-dates.json（`012` 的網子）。
 *   3. 抓不到網路就失敗。不得憑記憶手打任何一筆。
 *
 * 執行方式：node scripts/fetch-judgment-dockets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JUDGMENT_URL } from './fetch-interpretation-counts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FIXTURE_PATH = path.join(__dirname, '../tests/fixtures/judgment-dockets.json');
const PAGE_URL = (page) => `${JUDGMENT_URL}&page=${page}&tab=1`;

/** 清單頁的一列：判決日期，接著判決字號與【案名】，連結帶 docdata 的 id */
const ROW =
  /<span>判決日期<\/span>\s*<div class="cont">\s*(\d{4}-\d{2}-\d{2})\s*<\/div>(?:(?!判決日期)[\s\S])*?<div class="cont" title="(\d{3})年憲判字第(\d+)號【([^】]+)】"><a[^>]*docdata\.aspx\?fid=38&id=(\d+)/g;
/** 分頁列的「最後頁」 */
const LAST_PAGE = /page=(\d+)&amp;tab=1">最後頁/;

async function getText(url, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'constitution-app/content-audit' } });
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
 * 逐頁抓清單，回傳 [[民國年, 號, 判決日期, 官方案名, docdata id]]，依年、號遞增。
 * 順帶檢查各年編號自 1 連續無缺號，與日期是合法日曆日。
 */
export async function fetchJudgmentDockets() {
  const first = await getText(PAGE_URL(1));
  const last = Number(first.match(LAST_PAGE)?.[1] ?? 1);
  const pages = [first];
  for (let p = 2; p <= last; p++) pages.push(await getText(PAGE_URL(p)));

  const byKey = new Map();
  for (const html of pages) {
    for (const m of html.matchAll(ROW)) {
      const [, date, roc, no, name, id] = m;
      byKey.set(`${roc}-${no}`, [Number(roc), Number(no), date, name, Number(id)]);
    }
  }
  if (byKey.size === 0) throw new Error('憲判字清單解析不到任何一列，來源網站可能已變動');

  const rows = [...byKey.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const byYear = new Map();
  for (const [roc, no, date] of rows) {
    if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new Error(`${roc} 年憲判字第 ${no} 號的日期不合法：${date}`);
    byYear.set(roc, [...(byYear.get(roc) ?? []), no]);
  }
  for (const [roc, numbers] of byYear) {
    if (numbers.length !== Math.max(...numbers)) {
      throw new Error(`${roc} 年憲判字編號不連續：共 ${numbers.length} 筆，最大號 ${Math.max(...numbers)}`);
    }
  }
  return rows;
}

async function main() {
  const dockets = await fetchJudgmentDockets();
  const fixture = {
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: JUDGMENT_URL,
    /** [民國年, 號, 判決日期, 官方案名, docdata id] */
    dockets,
  };
  fs.mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
  fs.writeFileSync(FIXTURE_PATH, JSON.stringify(fixture) + '\n');
  process.stdout.write(`已寫入 ${path.relative(process.cwd(), FIXTURE_PATH)}（${dockets.length} 筆）\n`);
  const counts = new Map();
  for (const [roc] of dockets) counts.set(roc, (counts.get(roc) ?? 0) + 1);
  for (const [roc, n] of counts) process.stdout.write(`  ${roc} 年（${roc + 1911}）: ${n}\n`);
}

if (process.argv[1] === __filename) {
  await main();
}
