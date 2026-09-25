/**
 * 解釋門檻與案件數量視覺化的測試。
 *
 * 執行：node --test tests/threshold-analysis.test.mjs
 * 線上比對（AC-6）：THRESHOLD_LIVE=1 node --test tests/threshold-analysis.test.mjs
 *
 * 預設離線。所有數字都自 tests/fixtures/interpretation-dates.json 的 813 筆原始
 * 發布日期重算，再與 src/data/threshold-analysis.ts 的資料比對。
 * fixture 是抓取程式的產物，資料模組是手寫的 —— 兩邊獨立，因此比對有意義。
 *
 * 規格見 docs/constitution-features/012-threshold-case-analysis.md 的 `## Acceptance criteria`。
 */
import './tsx-loader.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const { createElement } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const data = await import('@/data/threshold-analysis');
const { default: ThresholdChart } = await import('@/components/threshold-analysis/ThresholdChart');
const { default: EraComparisonStrip } = await import('@/components/threshold-analysis/EraComparisonStrip');
const { default: OchreBandFactors } = await import('@/components/threshold-analysis/OchreBandFactors');
const { default: ChartAxes } = await import('@/components/threshold-analysis/ChartAxes');
const { default: ThresholdBoundary } = await import('@/components/threshold-analysis/ThresholdBoundary');
const { default: ThresholdTooltip } = await import('@/components/threshold-analysis/ThresholdTooltip');
const { default: ThresholdsPage } = await import('@/app/past/thresholds/page');

/**
 * 整個頁面的渲染輸出，含 page.tsx 的外殼，不只元件子樹。
 *
 * 守衛只渲染元件是一個真實被打穿過的洞：reviewer 把換算後的人數注進頁面外殼，
 * 25 條測試全綠。守衛宣稱保護的是「站上」，涵蓋面就必須是整頁。
 */
const renderPage = () => renderToStaticMarkup(createElement(ThresholdsPage));
const visibleTextOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/**
 * 只在互動後才出現的渲染狀態。
 *
 * `renderPage()` 的 `hoveredYear` 恆為 null，**`ThresholdTooltip` 因此完全不在它的輸出裡**。
 * 「站上不得出現 X」的守衛若只看整頁渲染，浮層就是一塊永遠掃不到的盲區 ——
 * 與 F8 同型，只是這次漏掉的是頁面的一個**狀態**而不是一塊子樹。
 * 浮層渲染的是 `era.ruleSummary`、逐年件數與換法說明，正好是門檻用語最密集的地方。
 *
 * 歸期規則照抄 ThresholdCaseAnalysis 的 hoveredEras：憲判字年份不歸任何釋字門檻時期，
 * 換法當年由兩期共用。照抄是刻意的 —— 守衛要掃的是讀者真的看得到的那些浮層，
 * 不是每一期硬湊給每一年。
 */
const erasForYear = (year) => {
  if (year.series !== 'interpretation') return [];
  return ERAS.filter((era) => {
    const from = Number(era.effectiveFrom.slice(0, 4));
    const to = era.effectiveTo === null ? Infinity : Number(era.effectiveTo.slice(0, 4));
    return year.year >= from && year.year <= to;
  });
};
const renderTooltips = () =>
  YEARS.map((y) =>
    renderToStaticMarkup(
      createElement(ThresholdTooltip, { year: y, eras: erasForYear(y), x: 50, y: 50 }),
    ),
  );

/** 站上讀者看得到的全部 HTML：整頁外殼 ＋ 每一個年份的浮層狀態。 */
const siteHtmlParts = () => [renderPage(), ...renderTooltips()];
const siteVisibleText = () => siteHtmlParts().map(visibleTextOf).join(' ');

const {
  ERAS,
  ERA_SPAN_DAYS,
  ERA_YEAR_SPLITS,
  FACTORS,
  DAYS_PER_YEAR,
  RULES_ERA_UNCOVERED,
  YEARS,
  deriveEraStats,
} = data;

const fixture = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tests/fixtures/interpretation-dates.json'), 'utf8'),
);
/** [釋字號, 明細頁 id, 發布日期] */
const RAW = fixture.interpretations;

const STATS = deriveEraStats(YEARS, ERAS);
const statOf = (id) => STATS.find((s) => s.era.id === id);
const eraOf = (id) => ERAS.find((e) => e.id === id);

/** 三個有第一手條文的時期，逐筆按發布日歸期的區間。 */
const DATA_ERAS = [
  ['rules', '1948-09-16', '1958-07-21'],
  ['three-quarters', '1958-07-21', '1993-02-03'],
  ['two-thirds', '1993-02-03', '2022-01-04'],
];

function countsFromFixtureByEra() {
  const out = {};
  for (const [, , date] of RAW) {
    for (const [id, from, to] of DATA_ERAS) {
      if (date >= from && date < to) out[id] = (out[id] ?? 0) + 1;
    }
  }
  return out;
}

function countsFromFixtureByYear() {
  const out = new Map();
  for (const [, , date] of RAW) {
    const year = Number(date.slice(0, 4));
    out.set(year, (out.get(year) ?? 0) + 1);
  }
  return out;
}

/** 遞迴讀取一個目錄下的全部原始碼。 */
function readSources(relPath) {
  const abs = path.join(ROOT, relPath);
  if (fs.statSync(abs).isFile()) return [[relPath, fs.readFileSync(abs, 'utf8')]];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .flatMap((entry) => readSources(path.join(relPath, entry.name)));
}

const SCANNED_SOURCES = [
  ...readSources('src/app/past/thresholds'),
  ...readSources('src/components/threshold-analysis'),
  ...readSources('src/data/threshold-analysis.ts'),
];

/** 去掉註解，讓「不得 import FACTORS」這類說明文字不會被當成真的引用。 */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const SPEC_PATH = 'docs/constitution-features/012-threshold-case-analysis.md';
const SPEC = fs.readFileSync(path.join(ROOT, SPEC_PATH), 'utf8');

/**
 * 取出規格檔裡某一條 AC 的區塊（自 `**AC-n —` 起，到下一條 AC 的粗體標題為止）。
 *
 * 切在 AC 邊界上是必要的：stage report 會大段引述 AC 的內容，
 * 整檔搜尋會抓到歷史記錄而不是現行條文。
 */
function acBlock(id) {
  const start = SPEC.indexOf(`**${id} — `);
  assert.notEqual(start, -1, `${SPEC_PATH} 找不到 ${id}`);
  const rest = SPEC.slice(start + 3);
  const end = rest.search(/\n\*\*AC-\d+ — /);
  return end === -1 ? rest : rest.slice(0, end);
}

/**
 * 自 AC 區塊裡**行首**的 `前綴：…。` 定義行解析出一份清單。
 *
 * 只認行首是刻意的：AC-1 的括號補述裡另有「原條文記的是「不成立／…」」這種歷史引用，
 * 前綴不同因此不會誤抓。並斷言定義行**恰為一行** —— 不唯一就代表條文有兩份互相矛盾的清單，
 * 那本身就是缺陷，不該讓測試自己挑一份。
 */
function listFromSpec(block, prefix) {
  const hits = [...block.matchAll(new RegExp(`^${prefix}([^。]*)。`, 'gm'))];
  assert.equal(hits.length, 1, `${SPEC_PATH} 的「${prefix}」定義行應恰為 1 行，實際 ${hits.length} 行`);
  return hits[0][1]
    .split(/[／、\n]+/)
    .map((s) => s.replace(/[`\s]/g, ''))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// AC-1 — 四個門檻時點與法規公布日一致，且沒有一處把門檻變動寫成 1987 年
// ---------------------------------------------------------------------------

test('AC-1 四個 effectiveFrom 恰為法規公布日', () => {
  assert.deepEqual(
    ERAS.map((e) => e.effectiveFrom),
    ['1948-09-16', '1958-07-21', '1993-02-03', '2025-01-23'],
  );
});

test('AC-1 primary-source 的四期各有非空 article／quotedText／sourceUrl', () => {
  // 原為三期。2026-09-23 captain 於 verify gate 授權改為四期：
  // 規則期的條文已於 pcode=A0030300 取得第一手依據。這是本票唯一被授權的 AC 變更。
  const primary = ERAS.filter((e) => e.evidence === 'primary-source');
  assert.equal(primary.length, 4);
  assert.equal(ERAS.length, 4);
  for (const era of primary) {
    assert.ok(era.article && era.article.length > 0, `${era.id} 缺 article`);
    assert.ok(era.quotedText && era.quotedText.length > 0, `${era.id} 缺 quotedText`);
    assert.ok(era.sourceUrl && era.sourceUrl.startsWith('https://'), `${era.id} 缺 sourceUrl`);
  }
  // 沒有任何一期還停在 unverified。
  assert.equal(ERAS.filter((e) => e.evidence === 'unverified').length, 0);
});

/**
 * AC-1 的 1987 守衛。
 *
 * 舊版是兩條「1987 與門檻詞彙相距 12 字以內」的正規式。它有兩個洞：
 *   1. 詞彙表只有四個詞。站上唯一同時出現 1987 與門檻主張的那句話用的是
 *      「表決條件」「改低」，剛好都在表外，於是全頁最該被看守的一句反而沒被看守。
 *   2. 就算把詞彙補齊，正規式也只能問「這兩者有沒有靠在一起」，
 *      不能問「靠在一起的時候，講法是不是誠實的」。
 *
 * 誠實的講法長這樣：**歸屬給會議記錄，並當場反駁**。
 * 「會議記錄說 1987 年…；實際的公布日是 1993-02-03，會議的時間順序不成立。」
 * 不誠實的講法是把前半留下、把後半刪掉。舊守衛看不出這個差別，新守衛看得出。
 *
 * 因此改成：把文字切成句段，句段裡同時出現 1987 與門檻詞彙時，
 * **該句段必須同時帶歸屬標記與反駁標記**，否則失敗。
 * 純粹當年份鍵用的 1987（YEARS 的 1987 年 9 件）句段裡沒有門檻詞彙，不受影響。
 *
 * 2026-09-24 captain 一次性授權：「授權修正 Verified by 涵蓋既有寫法變體，不改 AC 要求本身。」
 * AC-1 的要求仍是「頁面沒有把門檻變動寫成 1987 年」，改的只是怎麼查。
 */
const THRESHOLD_TERMS = [
  // 本票收斂後的唯一用詞
  '門檻',
  // 收斂前用過的變體。留著，避免有人改回舊寫法就繞過守衛。
  '表決門檻', '通過條件', '表決條件', '法規變動', '表決標準', '通過標準',
  // 門檻變動的動詞說法
  '降', '放寬', '改低', '調降', '下修', '鬆綁', '提高', '調高', '收緊',
  // 具體門檻數值的說法
  '三分之二', '四分之三', '二分之一', '過半數',
];
/**
 * 歸屬標記：這句話是在轉述誰的說法。
 *
 * 刻意不收「會議的」——反駁子句本身就寫著「會議的時間順序不成立」，
 * 收了它會讓歸屬與反駁兩個條件不獨立：刪掉「會議記錄說」仍能靠反駁子句蒙混過關。
 * 兩個條件必須各自獨立可失敗，否則守衛只剩一半。
 */
const ATTRIBUTION_MARKERS = ['會議記錄', '會議原文', '會議說', '投影片'];
/**
 * 反駁標記：這句話有沒有當場說清楚該說法**不成立**。
 *
 * 原本收了裸日期 `1993-02-03` 與「時間順序」。兩者都不是反駁語意：
 * 一個日期可以出現在任何句子裡，「時間順序」也可以是「時間順序如下」。
 * reviewer 用一句「帶歸屬、含門檻詞彙、只放一個裸日期、完全沒有反駁」的錯誤因果
 * 打穿了守衛。因此改為只收**明確否定該主張**的詞。
 */
const REBUTTAL_MARKERS = ['不成立', '不符', '並非', '站不住', '並不是'];

/** 標籤換成分隔符而非空白——否則相鄰元素的文字會黏成一段，讓不相干的詞混進同一句。 */
const SENTINEL = '\u0000';
const htmlToText = (html) => html.replace(/<[^>]+>/g, SENTINEL);
/** 句段邊界：句號、換行、標籤。 */
const segmentsOf = (text) =>
  text
    .split(/[\u0000\n。]+/)
    .map((seg) => seg.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

/** 回傳所有「同時出現 1987 與門檻詞彙」的句段。 */
function claimShapedSegments(text) {
  return segmentsOf(text).filter(
    (seg) => seg.includes('1987') && THRESHOLD_TERMS.some((t) => seg.includes(t)),
  );
}

test('AC-1 沒有一處把門檻變動寫成 1987 年', () => {
  // 純字串 grep 1987 會恆真失敗：1987 必然是 YEARS 的年份鍵（1987 年 9 件）。
  // 因此查的是「1987 與門檻主張同句」這個形狀，再要求該句必須歸屬且反駁。
  // 掃整頁（含 page.tsx 外殼），不只元件子樹 —— AC-1 宣稱的是「頁面」。
  // 並且掃浮層：整頁渲染的 hoveredYear 恆為 null，ThresholdTooltip 不在它的輸出裡，
  // 而浮層正是門檻用語最密集的地方。字面字串本來就在 SCANNED_SOURCES 裡，
  // 這一段補的是**渲染時才相鄰**的那種組合 —— 分開看都無害，湊在一句就成了主張。
  const scanned = [
    ...SCANNED_SOURCES,
    ...siteHtmlParts().map((html, i) => [i === 0 ? '<rendered page>' : `<rendered tooltip ${i}>`, htmlToText(html)]),
  ];

  let claimShapedCount = 0;
  for (const [file, body] of scanned) {
    for (const seg of claimShapedSegments(body)) {
      claimShapedCount++;
      assert.ok(
        ATTRIBUTION_MARKERS.some((m) => seg.includes(m)),
        `${file} 把 1987 與門檻主張寫在同一句，卻沒有歸屬給會議記錄：「${seg}」`,
      );
      assert.ok(
        REBUTTAL_MARKERS.some((m) => seg.includes(m)),
        `${file} 把 1987 與門檻主張寫在同一句，卻沒有當場反駁：「${seg}」`,
      );
    }
  }

  // 守衛必須真的掃到東西。掃到 0 段代表句段切法或詞彙表壞了，而不是頁面很乾淨。
  assert.ok(claimShapedCount >= 2, `預期至少掃到 2 個受檢句段，實際 ${claimShapedCount}`);
  // 年份鍵本身必須還在，否則上面整組就是空轉。
  assert.equal(YEARS.find((y) => y.year === 1987).count, 9);
  // 年份鍵所在的句段不得被誤判成主張句。
  // 原本這裡是 `segmentsOf(String(1987))`，也就是拿一個硬寫的字串去問守衛，
  // 而那個字串當然沒有門檻詞彙，結果恆為 0。改成問**資料模組裡真正那一行**：
  // 句段切法若壞掉、把 YEARS 那一大塊與某處的門檻詞彙併成一段，這條就會紅。
  const dataSource = SCANNED_SOURCES.find(([f]) => f.endsWith('threshold-analysis.ts'))[1];
  const yearKeySegments = segmentsOf(dataSource).filter((seg) => /year: 1987\b/.test(seg));
  assert.equal(yearKeySegments.length, 1);
  assert.equal(claimShapedSegments(yearKeySegments[0]).length, 0);
});

/**
 * 三份清單的條文與程式碼不得分岔。
 *
 * F11 就是這條分岔：反駁清單在程式碼裡改掉了，AC-1 的條文沒跟著改。
 * review 階段規定 reviewer 以**重現 `Verified by:`** 來驗 AC，照舊條文重現會重建剛關掉的洞。
 * 那一次是靠 reviewer 手工比對三份清單抓到的，躺了一輪；在此之前沒有任何東西守著這件事。
 *
 * 守衛的涵蓋面必須對齊它宣稱的東西 —— 而 AC-1 的守衛宣稱的正是**條文寫的那份清單**。
 * 因此把條文當成期望值、程式碼當成實際值來比。任何一邊單獨改動都會紅。
 */
test('AC-1 條文列的三份清單與程式碼逐項相同', () => {
  const block = acBlock('AC-1');
  const specTerms = listFromSpec(block, '詞彙表擴充為：');
  const specAttribution = listFromSpec(block, '歸屬標記：');
  const specRebuttal = listFromSpec(block, '反駁標記：');

  // 先確認解析到的是真的清單而不是空陣列 —— 解析壞掉時兩邊都空會變成假綠。
  assert.equal(specTerms.length, 20);
  assert.equal(specAttribution.length, 4);
  assert.equal(specRebuttal.length, 5);

  // Set 比對，不依賴排序。（中文字串不得用 sort／uniq 判定：
  // 本機預設 locale 下 BSD sort／uniq 會把不同的中文字串視為相等，而且不報錯。）
  assert.deepEqual(new Set(specTerms), new Set(THRESHOLD_TERMS));
  assert.deepEqual(new Set(specAttribution), new Set(ATTRIBUTION_MARKERS));
  assert.deepEqual(new Set(specRebuttal), new Set(REBUTTAL_MARKERS));
  // 清單內不得有重複項，否則 Set 比對會掩蓋掉數量差異。
  assert.equal(new Set(THRESHOLD_TERMS).size, THRESHOLD_TERMS.length);
  assert.equal(new Set(ATTRIBUTION_MARKERS).size, ATTRIBUTION_MARKERS.length);
  assert.equal(new Set(REBUTTAL_MARKERS).size, REBUTTAL_MARKERS.length);

  // 條文明文寫過「刻意不收」的兩項，不得又被收回去。
  for (const excluded of ['1993-02-03', '時間順序']) {
    assert.equal(REBUTTAL_MARKERS.includes(excluded), false, `反駁標記不得收「${excluded}」`);
  }
  assert.equal(ATTRIBUTION_MARKERS.includes('會議的'), false);
});

test('AC-1 沒有任何時期的起訖日以 1987 開頭', () => {
  for (const era of ERAS) {
    assert.equal(era.effectiveFrom.startsWith('1987'), false);
    assert.equal((era.effectiveTo ?? '').startsWith('1987'), false);
  }
});

// ---------------------------------------------------------------------------
// AC-2 — 每個時期的年均件數等於 813 筆原始日期算出來的值
// ---------------------------------------------------------------------------

test('AC-2 逐年計數與 fixture 相同，合計 813，最大值為 1994 年 37 件', () => {
  const fromFixture = countsFromFixtureByYear();
  const interpretationYears = YEARS.filter((y) => y.series === 'interpretation');

  for (const y of interpretationYears) {
    assert.equal(y.count, fromFixture.get(y.year) ?? 0, `${y.year} 年件數不符`);
  }
  // 反向：fixture 有的年份，資料模組不能漏。
  for (const [year, count] of fromFixture) {
    const entry = interpretationYears.find((y) => y.year === year);
    assert.ok(entry, `資料模組漏了 ${year} 年`);
    assert.equal(entry.count, count);
  }

  const total = interpretationYears.reduce((a, y) => a + y.count, 0);
  assert.equal(total, 813);
  assert.equal(RAW.length, 813);

  const peak = interpretationYears.reduce((m, y) => (y.count > m.count ? y : m));
  assert.equal(peak.year, 1994);
  assert.equal(peak.count, 37);
});

test('AC-2 憲判字逐年件數與 fixture 相同', () => {
  const expected = new Map(fixture.judgments);
  const judgmentYears = YEARS.filter((y) => y.series === 'judgment');
  assert.equal(judgmentYears.length, expected.size);
  for (const y of judgmentYears) {
    assert.equal(y.count, expected.get(y.year), `${y.year} 年憲判字件數不符`);
  }
});

test('AC-2 三期件數為 79／233／501，相加等於 813', () => {
  const expected = countsFromFixtureByEra();
  assert.deepEqual(expected, { rules: 79, 'three-quarters': 233, 'two-thirds': 501 });

  assert.equal(statOf('rules').totalCount, 79);
  assert.equal(statOf('three-quarters').totalCount, 233);
  assert.equal(statOf('two-thirds').totalCount, 501);
  // 原本寫的是 `assert.equal(79 + 233 + 501, 813)` —— 三個字面值相加，不碰程式碼也不碰
  // fixture，永遠成立，改壞任何東西它都不會紅。改成由 STATS 與 fixture 兩邊各自推導再比對。
  const statsTotal = STATS.reduce((a, s) => a + s.totalCount, 0);
  assert.equal(statsTotal, RAW.length);
  assert.equal(statsTotal, Object.values(expected).reduce((a, n) => a + n, 0));
});

test('AC-2 三期年均為 8.3／6.7／17.3，current 期為 null', () => {
  // 分母用設計文件已實算的日數，並與 fixture 的日期邊界對照，確認沒有寫錯。
  const days = (a, b) => (Date.parse(b) - Date.parse(a)) / 86400000;
  assert.equal(ERA_SPAN_DAYS.rules, days('1949-01-06', '1958-07-21'));
  assert.equal(ERA_SPAN_DAYS['three-quarters'], days('1958-07-21', '1993-02-03'));
  assert.equal(ERA_SPAN_DAYS['two-thirds'], days('1993-02-03', '2021-12-25'));
  assert.equal(ERA_SPAN_DAYS.current, null);
  assert.equal(DAYS_PER_YEAR, 365.2425);
  assert.equal(RAW[0][2], '1949-01-06');
  assert.equal(RAW[RAW.length - 1][2], '2021-12-24');

  assert.equal(statOf('rules').meanPerYear.toFixed(1), '8.3');
  assert.equal(statOf('three-quarters').meanPerYear.toFixed(1), '6.7');
  assert.equal(statOf('two-thirds').meanPerYear.toFixed(1), '17.3');
  assert.equal(statOf('current').meanPerYear, null);
});

test('AC-2 EraComparisonStrip 渲染出的倍率為 0.81× 與 2.57×', () => {
  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, { items: STATS, selectedEraId: null, onSelectEra: () => {} }),
  );
  assert.match(html, /0\.81×/);
  assert.match(html, /2\.57×/);
  // 先四捨五入再相除會得到 2.58，那是錯的算序。
  assert.equal(html.includes('2.58×'), false);
});

test('AC-2 邊界年按發布日切分：1993 年 1/20、1958 年 0/2', () => {
  const splitFromFixture = (year, cut) => {
    const inYear = RAW.filter(([, , d]) => d.startsWith(String(year)));
    return [inYear.filter(([, , d]) => d < cut).length, inYear.filter(([, , d]) => d >= cut).length];
  };
  assert.deepEqual(splitFromFixture(1958, '1958-07-21'), [0, 2]);
  assert.deepEqual(splitFromFixture(1993, '1993-02-03'), [1, 20]);

  const split1958 = ERA_YEAR_SPLITS.find((s) => s.year === 1958);
  assert.equal(split1958.changeoverDate, '1958-07-21');
  assert.deepEqual(
    split1958.parts.map((p) => [p.eraId, p.count]),
    [['rules', 0], ['three-quarters', 2]],
  );

  const split1993 = ERA_YEAR_SPLITS.find((s) => s.year === 1993);
  assert.equal(split1993.changeoverDate, '1993-02-03');
  assert.deepEqual(
    split1993.parts.map((p) => [p.eraId, p.count]),
    [['three-quarters', 1], ['two-thirds', 20]],
  );

  // 1993 整年 21 件，不得全部歸給單一時期。
  assert.equal(YEARS.find((y) => y.year === 1993).count, 21);
  assert.equal(split1993.parts.reduce((a, p) => a + p.count, 0), 21);
});

// ---------------------------------------------------------------------------
// AC-4 — 土黃色區的起伏因素以獨立段落交付，且沒有一項被寫成已確立的因果
// ---------------------------------------------------------------------------

test('AC-4 每項因素都交代 basis、basisRef、uncertainty 與拍板者', () => {
  assert.ok(FACTORS.length > 0);
  for (const f of FACTORS) {
    assert.ok(['data', 'statute', 'none'].includes(f.basis), `${f.id} 的 basis 不合法`);
    if (f.basis !== 'none') {
      assert.ok(f.basisRef && f.basisRef.length > 0, `${f.id} 有依據卻沒寫出處`);
    } else {
      assert.notEqual(f.needsRuling, null, `${f.id} 沒有依據卻不必拍板`);
    }
    assert.ok(f.uncertainty && f.uncertainty.length >= 15, `${f.id} 的 uncertainty 太短或空白`);
  }
});

/**
 * 某一項因素自己的渲染區段。`OchreBandFactors` 把每一項因素渲染成一個 `<li>`，
 * 那份 `<ul>` 底下沒有別的 `<li>`（本函式以基數斷言釘住這一點）。
 * 以該項唯一的 `factor.claim` 定位它落在哪一個 `<li>`。
 *
 * **為什麼要切到這個粒度（N1）。** `RULING_AUTHORITY_LABEL` 的值會重複：
 * `f1-1958-drop` 與 `f4-1950-51-zero` 的拍板者都是「法學背景審閱者」，
 * 該字串在整份輸出裡出現 2 次。逐項的 `html.includes(label)` 因此有兩個滿足者。
 * 實測過：只讓 `f1-1958-drop` 不渲染自己的拍板者、徽章與 `uncertainty` 都留著，
 * 舊斷言 28 pass／0 fail 全綠 —— 由 `f4-1950-51-zero` 的拍板者頂替。
 * 徽章基數斷言擋不住那個突變，因為徽章還在。
 * 本測試的名稱寫的是「**每個**待拍板項目」，所以斷言必須逐項釘住產生者。
 */
function factorRegion(html, factor) {
  const starts = [...html.matchAll(/<li[\s>]/g)].map((m) => m.index);
  assert.equal(starts.length, FACTORS.length, '因素清單的 <li> 基數與 FACTORS 不符');
  const at = html.indexOf(factor.claim);
  assert.notEqual(at, -1, `${factor.id} 的 claim 沒有渲染出來`);
  const i = starts.filter((s) => s <= at).length - 1;
  assert.ok(i >= 0, `${factor.id} 的 claim 不在任何 <li> 裡`);
  return html.slice(starts[i], starts[i + 1] ?? html.length);
}

test('AC-4 OchreBandFactors 為每個待拍板項目渲染待確認標記與拍板者', () => {
  const html = renderToStaticMarkup(createElement(OchreBandFactors, { factors: FACTORS }));
  const needsRuling = FACTORS.filter((f) => f.needsRuling !== null);
  assert.ok(needsRuling.length > 0);

  // 只數徽章，不數段落說明文字裡提到的「待確認」三個字。
  const markers = html.match(/>待確認<\/span>/g) ?? [];
  assert.equal(markers.length, needsRuling.length);

  // 每一項都在**自己**的 <li> 裡驗，不看整份輸出。拍板者的值會重複，見 factorRegion。
  for (const f of needsRuling) {
    const region = factorRegion(html, f);
    const label = data.RULING_AUTHORITY_LABEL[f.needsRuling];
    assert.ok(region.includes(label), `${f.id} 沒有渲染拍板者 ${label}`);
    assert.ok(region.includes(f.uncertainty), `${f.id} 沒有渲染 uncertainty`);
    assert.match(region, />待確認<\/span>/, `${f.id} 沒有掛待確認標記`);
  }
  // 不必拍板的那一項不得掛待確認標記。
  // 原本寫的是 `settled.length === FACTORS.length - needsRuling.length`。
  // settled 與 needsRuling 是同一個陣列依同一個條件切兩半，這個等式對任何陣列都成立，
  // 改壞任何一項的 needsRuling 它都不會紅。改成指名「哪一項不必拍板」——
  // 規格說只有資料邊界那一項本票可以自己斷言，其餘四項都要外部拍板。
  const settled = FACTORS.filter((f) => f.needsRuling === null);
  assert.deepEqual(settled.map((f) => f.id), ['f5-excluded-cases']);
  assert.equal(needsRuling.length, 4);
  // 同樣切到那一項自己的區段：「無須外部拍板」要由它本人渲染，而且它不得掛徽章。
  const settledRegion = factorRegion(html, settled[0]);
  assert.ok(settledRegion.includes('無須外部拍板'), `${settled[0].id} 沒有渲染「無須外部拍板」`);
  assert.doesNotMatch(settledRegion, />待確認<\/span>/, `${settled[0].id} 不該掛待確認標記`);
});

/** 一個元件檔以相對路徑 import 的本地元件。 */
function localImportsOf(relFile) {
  const code = stripComments(fs.readFileSync(path.join(ROOT, relFile), 'utf8'));
  const dir = path.dirname(relFile);
  return [...code.matchAll(/from '(\.\/[^']+)'/g)].map((m) => `${path.join(dir, m[1])}.tsx`);
}

/** 自 import 圖遞迴求出一個元件的子元件閉包（含自己）。 */
function subtreeOf(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length > 0) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    stack.push(...localImportsOf(file));
  }
  return seen;
}

/**
 * AC-4 的「不得成為圖上註解」。
 *
 * 原本是一份**寫死的六個檔名清單**。它此刻是對的，但它不會跟著它宣稱的東西走：
 * 宣稱是「ThresholdChart.tsx **及其子元件**」，實際是一份不會自己長大的名單。
 * 新增一個圖的子元件，名單不會知道 —— 與 F4「詞彙表只認幾個寫法」同型，
 * 只是這次被寫死的是檔名而不是詞彙。改為自 import 圖遞迴求閉包，涵蓋面就跟著宣稱走。
 *
 * 另外把 ThresholdTooltip 一併納入：它不是 ThresholdChart 的 import 子節點，
 * 而是 ThresholdCaseAnalysis 疊在圖上的浮層（`absolute z-30`，錨在長條座標上）。
 * 按檔案關係它在名單外，按 AC-4 真正要守的「不得成為圖上註解」它就是圖上註解。
 */
test('AC-4 圖元件與其子元件不 import FACTORS', () => {
  const chartFiles = new Set([
    ...subtreeOf('src/components/threshold-analysis/ThresholdChart.tsx'),
    // 疊在圖上的浮層，按語意屬於「圖上」。
    ...subtreeOf('src/components/threshold-analysis/ThresholdTooltip.tsx'),
  ]);

  // 閉包求解必須真的走到東西。只剩進入點代表 import 解析壞了，而不是圖很乾淨。
  for (const known of [
    'src/components/threshold-analysis/ThresholdChart.tsx',
    'src/components/threshold-analysis/ThresholdBand.tsx',
    'src/components/threshold-analysis/ThresholdBoundary.tsx',
    'src/components/threshold-analysis/SeriesBreakLine.tsx',
    'src/components/threshold-analysis/ChartAxes.tsx',
    'src/components/threshold-analysis/ChartText.tsx',
    'src/components/threshold-analysis/ThresholdTooltip.tsx',
  ]) {
    assert.ok(chartFiles.has(known), `import 閉包沒有走到 ${known}`);
  }

  for (const file of chartFiles) {
    const code = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    assert.equal(/\bFACTORS\b/.test(code), false, `${file} 在程式碼裡提到 FACTORS`);
  }
});

/**
 * 反向守：**哪些檔案可以碰 FACTORS**，指名列出。
 *
 * 上面那條是「這些檔案不准碰」，它的涵蓋面是一個集合，再怎麼推導都只是那個集合。
 * 這一條把問題倒過來問 —— 全部被掃描的原始碼裡，提到 FACTORS 的檔案必須**恰為**這幾個。
 * 新增任何一個檔案並在裡面引用 FACTORS，不論它在不在圖的子樹底下，這條都會紅。
 */
test('AC-4 只有資料模組與協調者可以引用 FACTORS', () => {
  const referencing = SCANNED_SOURCES.filter(([, body]) => /\bFACTORS\b/.test(stripComments(body)))
    .map(([file]) => file);
  assert.deepEqual(
    new Set(referencing),
    new Set([
      // 定義處。
      'src/data/threshold-analysis.ts',
      // 唯一的協調者，把 FACTORS 交給獨立段落 OchreBandFactors。
      'src/components/threshold-analysis/ThresholdCaseAnalysis.tsx',
    ]),
  );
  // 獨立段落自己不 import FACTORS，只收 props —— 這是刻意的，資料流只有一條。
  const ochre = SCANNED_SOURCES.find(([f]) => f.endsWith('OchreBandFactors.tsx'))[1];
  assert.equal(/\bFACTORS\b/.test(stripComments(ochre)), false);
});

// ---------------------------------------------------------------------------
// AC-5 — 現行 10 人 9 人門檻在圖上看得出「沒有釋字資料可用」
// ---------------------------------------------------------------------------

const renderChart = () =>
  renderToStaticMarkup(
    createElement(ThresholdChart, {
      years: YEARS,
      eras: ERAS,
      stats: STATS,
      hoveredYear: null,
      selectedEraId: null,
      onHoverYear: () => {},
      onSelectEra: () => {},
    }),
  );

/**
 * 每一條色帶的 `<title>`（`ThresholdBand.tsx:59`，內容為「{label}（{effectiveFrom} 起）」）。
 * 色帶是連續的兄弟節點，所以這些 `<title>` 是切出「哪一條色帶自己的輸出」的界標。
 */
const BAND_TITLE_RE = /<title>([^<]*（\d{4}-\d{2}-\d{2} 起）)<\/title>/g;
const bandTitles = (chartHtml) => [...chartHtml.matchAll(BAND_TITLE_RE)];

/**
 * 某一條色帶自己的渲染區段：自己的 `<title>` 起，到下一條色帶的 `<title>` 止。
 *
 * **為什麼一定要切到這個粒度。** AC-5 要求的東西在圖的子樹裡各有**兩個以上的產生點**：
 * `fill="url(#threshold-hatch)"` 有兩個發出者（`current` 期的色帶，以及 `INTERIM_SEGMENT`
 * 的色帶 —— 後者的 `hatched` 是硬寫的 `true`）；「年均 6.7 件」有兩個（該期色帶與 `<desc>`）。
 * 「無釋字資料」有三個程式產生點（色帶標籤、`<desc>`、右端引線註解），
 * 目前渲染出兩個 —— 色帶標籤那一個因為 `current` 的色帶太窄而不畫，見下面的 (2)。
 *
 * 裸 `includes()` 只問「這個子樹裡有沒有」，不問「是不是該負責的那一個產生的」。
 * 該負責的那一個壞掉時，斷言由另一個產生點滿足，**假綠**。
 *
 * 三次實測，每一次舊斷言都是 27/27 全綠，本檔的新斷言都轉紅：
 *   1. `ThresholdChart` 傳給 `current` 色帶的 `hatched` 改成 `false` —— 讀者失去斜線網底。
 *   2. `ThresholdBand` 的 `showLabel` 改成 `false` —— 圖上不再顯示年均與期間名稱。
 *   3. 右端引線註解拿掉「／兩段皆無釋字資料」—— 圖上不再寫出 `current` 期沒有資料。
 */
function bandRegion(chartHtml, label) {
  const hits = bandTitles(chartHtml);
  const i = hits.findIndex((m) => m[1].startsWith(`${label}（`));
  assert.notEqual(i, -1, `找不到色帶 <title>：${label}`);
  assert.ok(i + 1 < hits.length, `${label} 是最後一條色帶，區段沒有下界，不得拿它做斷言`);
  return chartHtml.slice(hits[i].index, hits[i + 1].index);
}

/**
 * 圖上**看得見**的文字，也就是 `<text>` 的內容。
 *
 * 刻意排除 `<desc>` 與 `<title>`：那兩者是給讀螢幕軟體的替代文字，不畫在圖上。
 * AC-5 的要求文字寫的是「現行 10 人 9 人門檻**在圖上**看得出『沒有釋字資料可用』」，
 * 而裸 `includes()` 分不出「圖上看得見」與「替代文字裡提到過」。
 */
const visibleChartTexts = (chartHtml) =>
  [...chartHtml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1]);

test('AC-5 current 期無年均，且圖上以斜線網底與文字標明無釋字資料', () => {
  assert.equal(statOf('current').meanPerYear, null);
  assert.equal(statOf('current').totalCount, 0);

  const html = renderChart();
  const current = eraOf('current');

  // 色帶的 <title> 必須照這個順序出現。下面每一條都靠它定位產生者，
  // 順序或數量變了就中止 —— 不讓區段切錯之後還繼續判定。
  assert.deepEqual(
    bandTitles(html).map((m) => m[1]),
    [
      '規則期（1948-09-16 起）',
      '雙四分之三（1958-07-21 起）',
      '雙三分之二（1993-02-03 起）',
      '10 人 9 人（2025-01-23 起）',
      '憲訴法原始門檻（2022-01-04 起）',
    ],
  );

  // 斜線圖樣的定義必須在 <defs> 裡，否則上面那些 fill 引用指向不存在的圖樣。
  const defs = html.match(/<defs>[\s\S]*?<\/defs>/);
  assert.ok(defs, '圖裡沒有 <defs>');
  assert.match(defs[0], /<pattern[^>]*id="threshold-hatch"/);

  // (1) 網底必須畫在 current 期**自己**的色帶上。
  //     整張圖有兩個發出者，只問「整張圖有沒有」時 INTERIM_SEGMENT 那個會頂替。
  assert.match(
    bandRegion(html, current.label),
    /fill="url\(#threshold-hatch\)"/,
    'current 期自己的色帶沒有斜線網底',
  );

  // (2)「無釋字資料」必須由圖上看得見的文字提供，而且要連得回 current 期。
  //     合格的方式有兩種，任一即可 —— 斷言追的是要求，不是某一種實作：
  //       (a) 有一個看得見的 <text> 同時提到 current 期與「無釋字資料」；或
  //       (b)「無釋字資料」出現在 current 期自己的色帶區段裡。
  //     目前成立的是 (a)：圖右下的引線註解寫「2025-01-23 10 人 9 人／兩段皆無釋字資料」。
  //     (b) 目前不成立，而且不是疏漏 —— current 期的色帶只有約 22px 寬，
  //     低於 ThresholdBand 的 MIN_LABEL_WIDTH（72），因此它根本不畫標籤。
  //     日後若色帶變寬而畫出標籤，(b) 會成立，這條照樣通過。
  const namedOnChart = visibleChartTexts(html).filter(
    (t) => t.includes('無釋字資料') && t.includes(current.label) && t.includes(current.effectiveFrom),
  );
  const inOwnBand = bandRegion(html, current.label).includes('無釋字資料');
  assert.ok(
    namedOnChart.length > 0 || inOwnBand,
    '圖上沒有任何看得見的文字把 current 期與「無釋字資料」連在一起（<desc> 不算，它不在圖上）',
  );

  // (3) 兩個有資料期的年均必須畫在**各自**的色帶上，不是只存在於 <desc>。
  //     實測過：把 ThresholdBand 的 showLabel 改成 false，圖上不再顯示年均，舊斷言 27/27 全綠。
  assert.match(bandRegion(html, '雙四分之三'), /年均 6\.7 件/);
  assert.match(bandRegion(html, '雙三分之二'), /年均 17\.3 件/);
});

/**
 * 無障礙描述是**另一個**要求，不是上面那條的替代品。
 *
 * 兩條各自釘住自己的產生者：上面那條只認圖上看得見的元素，這條只認 `<desc>`。
 * 因此兩者不能互相頂替 —— 這正是 AC-5 原本假綠的成因。
 */
test('AC-5 無障礙描述另外帶四期的年均，與圖上的標示各自獨立', () => {
  const desc = renderChart().match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
  assert.ok(desc, '圖裡沒有 <desc>');
  const body = desc[1];
  for (const s of STATS) {
    const expected =
      s.meanPerYear === null
        ? `${s.era.label}（${s.era.effectiveFrom} 起）無釋字資料`
        : `${s.era.label}（${s.era.effectiveFrom} 起）年均 ${s.meanPerYear.toFixed(1)} 件`;
    assert.ok(body.includes(expected), `<desc> 少了 ${s.era.id}：${expected}`);
  }
  // 四期全帶，讀螢幕軟體使用者才拿得到與視覺讀者相同的那份對比。
  assert.equal(STATS.length, 4);
});

test('AC-5 憲判字年份不計入任何時期的年均', () => {
  const withoutJudgments = YEARS.filter((y) => y.series !== 'judgment');
  const statsWithout = deriveEraStats(withoutJudgments, ERAS);
  assert.deepEqual(
    statsWithout.map((s) => [s.era.id, s.totalCount, s.meanPerYear]),
    STATS.map((s) => [s.era.id, s.totalCount, s.meanPerYear]),
  );

  // 把憲判字灌大，統計仍不得改變。
  const inflated = YEARS.map((y) => (y.series === 'judgment' ? { ...y, count: 999 } : y));
  assert.deepEqual(
    deriveEraStats(inflated, ERAS).map((s) => [s.era.id, s.totalCount, s.meanPerYear]),
    STATS.map((s) => [s.era.id, s.totalCount, s.meanPerYear]),
  );
});

// ---------------------------------------------------------------------------
// 行動版／桌機的結構
//
// 這幾條只驗 DOM 結構，不驗視覺。實際的視覺檢查是 Test plan 指定的人工步驟，
// 本機無法執行（見 stage report）。
// ---------------------------------------------------------------------------

/** 取出開頭為 <g class="{cls}"> 的那一段內容。ChartAxes 的兩組刻度都是單層 <g>。 */
function groupBody(html, cls) {
  const m = html.match(new RegExp(`<g class="${cls.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}">([\\s\\S]*?)</g>`));
  assert.ok(m, `找不到 class="${cls}" 的群組`);
  return m[1];
}

test('行動版與桌機各有一套 x 軸年份刻度，數量不同', () => {
  const years = Array.from({ length: 78 }, (_, i) => 1949 + i);
  const html = renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(ChartAxes, {
        left: 52,
        width: 888,
        height: 296,
        years,
        xForYear: (y) => 52 + (y - 1949) * 11.4,
        slotWidth: 11.4,
        yForCount: (c) => 296 - c * 7.4,
        yTicks: [0, 10, 20, 30, 40],
        desktopEvery: 3,
        mobileEvery: 10,
      }),
    ),
  );

  const desktop = groupBody(html, 'hidden md:block');
  const mobile = groupBody(html, 'md:hidden');
  assert.equal((desktop.match(/<text/g) ?? []).length, 26); // 1950–2025 每 3 年
  assert.equal((mobile.match(/<text/g) ?? []).length, 8);   // 1950–2020 每 10 年

  // 行動版的字級必須放大。viewBox 960 在 375px 螢幕上縮到約 0.32 倍，
  // 桌機的 10px 字到手機只剩 3.2px。
  for (const tag of mobile.match(/<text[^>]*>/g) ?? []) {
    const size = Number(tag.match(/font-size="(\d+)"/)[1]);
    assert.ok(size >= 20, `行動版刻度字級 ${size} 太小`);
  }
});

test('門檻分界線：桌機帶門檻一句話，行動版只留公布年份', () => {
  const era = eraOf('three-quarters');
  const html = renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(ThresholdBoundary, {
        era,
        x: 155,
        height: 296,
        labelAnchor: 'start',
        labelRow: 'upper',
      }),
    ),
  );

  const desktop = groupBody(html, 'hidden md:block');
  assert.ok(desktop.includes(era.effectiveFrom));
  assert.ok(desktop.includes(era.ruleSummary));

  const mobileTag = html.match(/<text[^>]*class="md:hidden"[^>]*>(\d{4})<\/text>/);
  assert.ok(mobileTag, '行動版沒有公布年份標籤');
  assert.equal(mobileTag[1], '1958');
  assert.ok(html.includes('font-size="26"'));
  // 行動版不得重複桌機的長句。
  assert.equal(
    html.replace(/<g class="hidden md:block">[\s\S]*?<\/g>/, '').includes(era.ruleSummary),
    false,
  );
});

test('EraComparisonStrip 桌機四格橫排，行動版直向堆疊', () => {
  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, { items: STATS, selectedEraId: null, onSelectEra: () => {} }),
  );
  assert.match(html, /grid-cols-1 md:grid-cols-4/);
});

test('行動版選取某期後展開該期逐年件數清單', () => {
  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, {
      items: STATS,
      selectedEraId: 'two-thirds',
      onSelectEra: () => {},
    }),
  );
  const open = html.match(/<div id="era-years-two-thirds"[^>]*>([\s\S]*?)<\/dl>/);
  assert.ok(open, '選取的時期沒有展開逐年清單');
  // 雙三分之二期的年桶為 1993–2021，共 29 年。
  assert.equal((open[1].match(/<dt>/g) ?? []).length, 29);
  assert.ok(open[1].includes('<dt>1994</dt><dd class="text-gray-900">37</dd>'));

  // 未選取的時期維持收合。
  assert.match(html, /<div id="era-years-rules"[^>]*hidden/);
});

// ---------------------------------------------------------------------------
// D1／D2 — 未確認的處置
// ---------------------------------------------------------------------------

test('D1 規則期已補上一手條文，且網站仍然不寫出 1/2', () => {
  // 條文取自 pcode=A0030300（廢止法規），不是 A0030159。後者的歷史條文只回溯到 1958-07-21。
  const rules = eraOf('rules');
  assert.equal(rules.evidence, 'primary-source');
  assert.equal(rules.article, '第 12 條');
  assert.equal(
    rules.quotedText,
    '大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。',
  );
  assert.ok(rules.sourceUrl.includes('pcode=A0030300'));

  // 「不寫出 1/2」的決定仍然成立，而且已證明是對的：實際條文是三分之二出席＋過半數同意。
  //
  // D1 的處置明文是「不得在**網站**上寫出「1/2」這個數字」。這裡原本只渲染 EraComparisonStrip
  // 一個元件（F12）：把 `1/2` 與「二分之一」兩種寫法注進 page.tsx 的頁面外殼，25 條全綠。
  // 宣稱是站級，涵蓋面就必須是站級 —— 整頁外殼加上只在 hover 才出現的浮層。
  //
  // 寫法也不只兩種。守的是「這個數字」而不是「這串字元」，因此連全形斜線與分數符號一起收。
  // 「過半數」刻意不收：那是條文原文（「過半數之同意」），收了會把正確的引述判成違規。
  const HALF_NOTATIONS = ['1/2', '1／2', '１/２', '１／２', '½', '二分之一'];
  const siteText = siteVisibleText();
  for (const notation of HALF_NOTATIONS) {
    assert.equal(siteText.includes(notation), false, `站上不得寫出「${notation}」`);
  }
  // 掃到的必須是真的頁面文字。渲染壞掉會讓上面整組變成空轉。
  assert.ok(siteText.includes(rules.quotedText), '站上文字裡找不到規則期條文原文');
  assert.ok(siteText.includes('2/3'), '站上文字裡找不到正確的 2/3 寫法');

  // 也不得把限定語改寫成「總額」。
  // 原本這裡還有一條 `/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary) === false`。
  // 那條永遠成立：正規式要求 ruleSummary 裡出現「規則期」，但「規則期」是 label 不是
  // summary，ruleSummary 裡不可能有它，因此 .test() 恆為 false。已移除。
  // 真正要守的語意改由下面兩條承擔，並擴大到整個規則期的渲染輸出 ——
  // c3 說「在中央政府所在地全體大法官」與「總額」「現有總額」不是同一個概念，
  // 那就不只 ruleSummary 一個欄位不能混用。
  assert.equal(rules.ruleSummary.includes('總額'), false);
  assert.ok(rules.ruleSummary.includes('在中央政府所在地全體大法官'));

  // 上面那一行只管 ruleSummary 一個欄位，但它宣稱的是「不只 ruleSummary 一個欄位不能混用」。
  // 規則期在站上呈現什麼，全部來自這個物件的字串欄位 —— label、statute、quotedText、
  // 三項 caveats 的 text 都會渲染出去。因此改成遞迴取出**所有**字串葉節點再逐一檢查：
  // 日後多一個欄位，涵蓋面自動跟上，不必回來補名單。
  const stringLeaves = (value) => {
    if (typeof value === 'string') return [value];
    if (value && typeof value === 'object') return Object.values(value).flatMap(stringLeaves);
    return [];
  };
  const rulesStrings = stringLeaves(rules);
  assert.ok(rulesStrings.includes(rules.quotedText));
  assert.ok(rulesStrings.some((s) => s.includes('不是同一個概念')), 'caveats 沒有被走到');
  for (const s of rulesStrings) {
    // 「總額」只准出現在 c3 那句「與後續法規的『總額』『現有總額』不是同一個概念」，
    // 也就是被引號包住、當成別的法規的用語在講。當成規則期自己的門檻用語就是違規。
    assert.equal(
      /總額[^」]{0,6}(出席|同意|之)/.test(s),
      false,
      `規則期的欄位把「總額」當成自己的門檻用語：「${s}」`,
    );
  }

  const rulesTile = renderToStaticMarkup(
    createElement(EraComparisonStrip, {
      items: STATS.filter((st) => st.era.id === 'rules'),
      selectedEraId: null,
      onSelectEra: () => {},
    }),
  ).replace(/<[^>]+>/g, ' ');
  // 規則期自己的呈現裡，「總額」只能出現在 c3 那句「與後續法規的『總額』…不是同一個概念」，
  // 不能被當成規則期的門檻用語。
  assert.ok(rulesTile.includes('不是同一個概念'));
  assert.equal(/總額[^」]{0,6}(出席|同意|之)/.test(rulesTile), false);
});

/**
 * 規則期三項但書各自的 `<li>`，依陣列順序回傳。
 *
 * `EraComparisonStrip.tsx:152` 的 `caveats.map` 把每一項渲染成一個連續的兄弟 `<li>`，
 * 適用「切兄弟區段」。切兄弟區段的兩項前提在這裡這樣滿足：
 *
 *   1. **釘住界標**：先斷言但書清單的 `<li>` 基數等於 `rules.caveats.length`。
 *   2. **釘住順序**：不能用但書自己的 `text` 定位 —— 摘錄斷言要驗的**就是那份 text 的內容**，
 *      用它定位就是循環論證（內容改了連定位一起改，斷言永遠不會紅，那正是 F16）。
 *      改用**與內容無關**的界標：唯一帶 `needsRuling` 的那一項會渲染待確認徽章，
 *      斷言那個徽章恰好出現一次、而且落在它在陣列裡的序位上。
 *
 * 區段只取但書那個 `<ul>`，不取整份輸出 —— 別處日後長出 `<li>` 不該影響這裡。
 */
function caveatRegions(html) {
  const rules = eraOf('rules');
  const ul = html.match(/這段條文的 \d+ 項限制[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  assert.ok(ul, '找不到但書清單的 <ul>');
  const lis = [...ul[1].matchAll(/<li\b[^>]*>((?:(?!<\/?li\b)[\s\S])*?)<\/li>/g)].map((m) => m[1]);
  assert.equal(lis.length, rules.caveats.length, '但書清單的 <li> 基數與 rules.caveats 不符');

  const BADGE = '待確認·法學背景審閱者';
  const withBadge = lis.filter((t) => t.includes(BADGE));
  assert.equal(withBadge.length, 1, `待確認徽章不是恰好一個，區段可能切錯：${withBadge.length}`);
  assert.equal(
    lis.findIndex((t) => t.includes(BADGE)),
    rules.caveats.findIndex((c) => c.needsRuling !== null),
    '待確認徽章的序位與 rules.caveats 不一致，區段順序對不上',
  );
  return lis;
}

test('D1 規則期的三項限制都存在，且都渲染得出來', () => {
  const rules = eraOf('rules');
  assert.equal(rules.caveats.length, 3);
  for (const c of rules.caveats) {
    assert.ok(c.text.length >= 20, `${c.id} 的但書太短`);
  }
  // 只有「限定語解讀」那一項需要法學拍板，另外兩項是已查證的事實。
  const pending = rules.caveats.filter((c) => c.needsRuling !== null);
  assert.deepEqual(pending.map((c) => c.id), ['c3-scope-wording']);
  assert.equal(pending[0].needsRuling, 'legal-reviewer');

  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, { items: STATS, selectedEraId: null, onSelectEra: () => {} }),
  );

  // 每一項但書切到**它自己**的 <li>，見 caveatRegions()。
  const caveatLis = caveatRegions(html);
  for (const [i, c] of rules.caveats.entries()) {
    assert.ok(caveatLis[i].includes(c.text), `${c.id} 沒有渲染出來`);
  }

  // 三項限制的具體內容必須看得見，不能只留一句「有但書」。
  // **每一條都必須由該項自己的 <li> 提供**（F16）。
  // c1 與 c2 的摘錄在四格 tile 裡各只有 1 個產生點，c3 的有 4 個
  // （`rules.ruleSummary`、`rules.quotedText` 兩處、`caveats[2].text`）。
  // 原本三條都是整份輸出的裸 includes()，c3 那一條因此由別人頂替：
  // 實測把 caveats[2].text 的「在中央政府所在地全體大法官」改寫成「那個限定語」、
  // 其餘三個產生點全部保留 —— 舊斷言 28 pass／0 fail 全綠。
  // 而 c3 是全票唯一需要法學拍板的那一項，它的**逐字原文**就是那個承諾的載體。
  //
  // 摘錄斷言**按 id 取區段，不按序位**。`<li>` 依陣列順序渲染，所以序位由 id 反查而來。
  // 實測過只寫死序位的版本：把 c3 移到陣列第一位（純換順序、內容不變）會誤紅。
  const regionOf = (id) => {
    const i = rules.caveats.findIndex((c) => c.id === id);
    assert.notEqual(i, -1, `但書 ${id} 不存在`);
    return caveatLis[i];
  };
  assert.ok(
    regionOf('c1-amended-version').includes('1952-04-16 修正後的版本'),
    'c1 的具體內容不在它自己的但書裡',
  );
  assert.ok(
    regionOf('c2-coverage-gap').includes('79 筆中的 77 筆'),
    'c2 的具體內容不在它自己的但書裡',
  );
  assert.ok(
    regionOf('c3-scope-wording').includes('在中央政府所在地全體大法官'),
    'c3 的限定語原文不在它自己的但書裡 —— 本頁承諾不解釋這個限定語，逐字原文就是那個承諾的載體',
  );
});

test('D1 規則期 79 筆中有 2 筆不在已引條文之下，且在圖下另作標示', () => {
  // 由 fixture 重算，不吃資料模組的宣告值。
  const inEra = RAW.filter(([, , d]) => d >= '1948-09-16' && d < '1958-07-21');
  const before = inEra.filter(([, , d]) => d < RULES_ERA_UNCOVERED.amendedOn);
  const after = inEra.filter(([, , d]) => d >= RULES_ERA_UNCOVERED.amendedOn);

  assert.equal(inEra.length, RULES_ERA_UNCOVERED.totalCount);
  assert.equal(after.length, RULES_ERA_UNCOVERED.coveredCount);
  assert.deepEqual(before.map(([n]) => n), [...RULES_ERA_UNCOVERED.interpretationNumbers]);
  for (const [, , d] of before) assert.equal(d, RULES_ERA_UNCOVERED.date);
  // 原本寫的是 `before.length + after.length === 79`。before 與 after 是同一個陣列切兩半，
  // 相加必然等於原長度，而原長度上面已經斷言過了，等於斷言 79 === 79。
  // 改成斷言切點之後的第一筆是誰 —— 這是 fixture 的事實，切點改錯就會紅。
  const firstCovered = after[0];
  assert.equal(firstCovered[0], 3);
  assert.equal(firstCovered[2], '1952-05-21');
  assert.ok(before.every(([, , d]) => d < RULES_ERA_UNCOVERED.amendedOn));

  // 圖下的固定註腳必須指名這兩筆，不能只放在 hover 才看得到的 tooltip。
  // 用整頁渲染：註腳日後若被搬到頁面外殼，這條不該因為只看元件而誤紅。
  //
  // 三樣東西必須在**同一個**段落裡，不是散在整頁的任何地方（N2）。
  // `amendedOn`（`1952-04-16`）整頁有四個產生點：本註腳、規則期 tile 的但書清單、
  // `f1-1958-drop` 的 uncertainty、頁尾的來源清單。
  // 實測過：只把註腳裡的日期換成「該次修正」、其餘三處不動，舊斷言 28 pass／0 fail 全綠。
  // 註腳因此沒有寫出是哪一次修正，讀者無從判斷那兩筆為什麼不在條文之下。
  // 另兩個字串（「釋字第 1、第 2 號」與「未取得的原始版規則」）整頁各只有 1 個產生點，
  // 所以用前者定位註腳、再要求另兩樣都在同一段裡，三者就都釘在同一個產生者上。
  const html = renderPage();
  const footnotes = [...html.matchAll(/<p\b[^>]*>((?:(?!<\/?p\b)[\s\S])*?)<\/p>/g)]
    .map((m) => m[1])
    .filter((t) => t.includes('釋字第 1、第 2 號'));
  assert.equal(footnotes.length, 1, '圖下找不到指名那兩筆的註腳，或不只一處');
  const footnote = footnotes[0];
  assert.ok(footnote.includes(RULES_ERA_UNCOVERED.amendedOn), '註腳沒有寫出是哪一次修正');
  assert.ok(footnote.includes('未取得的原始版規則'), '註腳沒有寫出條文版本未取得');
});

test('D2 2022-01-04 至 2025-01-23 的條文已逐字核對，不標未確認', () => {
  const interim = data.INTERIM_SEGMENT;
  assert.equal(interim.effectiveFrom, '2022-01-04');
  assert.equal(interim.effectiveTo, '2025-01-23');
  assert.equal(interim.evidence, 'primary-source');
  assert.equal(
    interim.quotedText,
    '判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。',
  );
  assert.ok(interim.sourceUrl.includes('lnndate=20190104'));
  // 這一段不是 ThresholdEra，四期的 id 不變。
  assert.equal(ERAS.some((e) => e.id === interim.id), false);
});

/**
 * 換算後的人數。c3 明文承諾「本頁不解釋這個限定語，也不把它換算成人數」，
 * 但在此之前沒有任何測試守著這句承諾，只靠人記得。
 *
 * 唯一可以出現人數的地方是現行憲訴法那一期 —— 它的條文原文本來就寫「十人」「九人」。
 * 把那一期自己的字串從頁面文字裡挖掉之後，**整頁不該再剩下任何人數**。
 */
/**
 * 守的是「人數」這個語意，不是「阿拉伯數字接一個『人』字」這個字串形狀。
 *
 * 原本是 `/(?:\d+|[一二三四五六七八九十]+)\s*人/`。它漏掉的寫法都很平常：
 * 「兩人」「廿人」「十位大法官」「九名」「１０人」—— 每一個都是換算後的人數，
 * 每一個都繞得過去。與 F4 同型：宣稱是語意，涵蓋面卻是一份不完整的寫法表。
 * 量詞補到人／位／名，數字補到全形、〇／零、兩、廿、卅。
 */
const HEADCOUNT_RE = /(?:[0-9０-９]+|[零〇一二兩三四五六七八九十廿卅]+)\s*[人位名]/g;

/**
 * 資料模組每一個字串葉節點的 `[欄位路徑, 值]`。
 *
 * 路徑以產生者為根（`current.label`、`three-quarters.ruleSummary`、`factors.0.uncertainty` …），
 * 因為豁免要**按產生者發**，不能按字串值發。見下面的 `HEADCOUNT_EXEMPT_PATHS`。
 */
const dataStringLeaves = (value, path = '') =>
  typeof value === 'string'
    ? [[path, value]]
    : value && typeof value === 'object'
      ? Object.entries(value).flatMap(([k, v]) => dataStringLeaves(v, path ? `${path}.${k}` : k))
      : [];

const DATA_MODULE_PATH = 'src/data/threshold-analysis.ts';

/**
 * 被掃描的資料面，**自模組的匯出枚舉出來，不是一份手寫的根清單**。
 *
 * **為什麼一定要枚舉（F21）。** 上一版寫的是一份手寫的七個根
 * （四期 ＋ `interim` ＋ `uncovered` ＋ `factors`），而模組匯出 18 個執行期的東西。
 * `SERIES_BOUNDARY_NOTES` 不在那七個裡，**而它今天就已經帶人數**。
 * 實測把「規則期的門檻換算後約為 10 人 9 人」寫進 `SERIES_BOUNDARY_NOTES[0].body`
 * （**明確歸給規則期，正是 `c3` 禁止的事**）→ **30 tests／29 pass／0 fail，全綠**；
 * 同一句寫成「約為 11 位大法官」→ 紅。**同一句話，寫成被豁免的那串字就過關。**
 *
 * **這是第三個軸，不是「多重滿足者」那一族**：一個欄位路徑不會有多個產生點，
 * 問題在「**被掃描的面本身是一份名單**」。本票在 F4、F9、M4、F21 上各中一次。
 * 修法照 M4 的前例（AC-4 的「及其子元件」由寫死六個檔名改為自 `import` 遞迴求閉包）：
 * **不要列舉被掃描的面，把它推導出來。**
 */
const dataExportRoots = () => Object.fromEntries(Object.entries(data));

/**
 * 唯一可以帶人數的三個欄位，**以路徑指名**。
 *
 * 這三個是現行憲訴法自己的用語，人數來自條文原文，不是換算。
 * **關鍵是「按路徑」而不是「按字串值」。** 原本的豁免寫法是
 * `for (const a of allowed) residue = residue.split(a).join(' ')`，
 * 那是**全站逐字刪除、不限定產生位置**，所以豁免按字串值發、**有多重施用者**：
 * 實測把「雙四分之三」期的 `ruleSummary` 改成
 * `'總額 3/4 出席，出席人 3/4 同意（10 人 9 人）'` —— 28 pass／0 fail 全綠，
 * 因為「10 人 9 人」正是 `current.label`，被全站豁免。
 * 同一個違規行為，寫成被豁免的那串字就過關，寫成「（約 11 位大法官）」就不過。
 *
 * 路徑的根是匯出名（`ERAS`），序位**由 `id` 反查**而不是寫死 —— 重排 `ERAS` 不該讓它誤紅。
 *
 * **豁免清單刻意是一份清單，而掃描面刻意不是。** 兩者是不同的軸：
 * 掃描面是「要檢查哪些東西」，漏一個就是漏檢（F21）；
 * 豁免是「授權哪一個產生者可以帶人數」，那本來就該逐筆寫明、逐筆可稽核。
 * **但清單不得成為後門**，所以下面的測試對每一筆豁免再加一層限制：
 * 它帶的每一個人數，**必須逐字出自 `current` 期自己那三個欄位**。
 * 加一個路徑進豁免清單，它仍然不能寫「約 11 位大法官」。
 *
 * `SERIES_BOUNDARY_NOTES` 的 `b3-current-no-data.heading` 在清單裡，
 * 因為它用 `current.label` 指稱現行門檻（「現行 10 人 9 人條件落在釋字序列結束之後」）。
 * **那是現行憲訴法自己的用語，不是把規則期的限定語換算成人數。**
 * 這一筆是本輪枚舉掃描面之後才浮出來的 —— 手寫七個根的版本從來沒掃到它。
 */
const headcountExemptPaths = () => {
  const i = ERAS.findIndex((e) => e.id === 'current');
  assert.notEqual(i, -1, 'ERAS 裡沒有 current 期');
  const n = data.SERIES_BOUNDARY_NOTES.findIndex((b) => b.id === 'b3-current-no-data');
  assert.notEqual(n, -1, 'SERIES_BOUNDARY_NOTES 裡沒有 b3-current-no-data');
  return new Set([
    `ERAS.${i}.label`,
    `ERAS.${i}.ruleSummary`,
    `ERAS.${i}.quotedText`,
    `SERIES_BOUNDARY_NOTES.${n}.heading`,
  ]);
};

test('c3 豁免按產生者發，且掃描面自模組匯出枚舉', () => {
  const roots = dataExportRoots();
  const exempt = headcountExemptPaths();

  // 防空轉 1（F21 的根）：枚舉出的根數必須等於原始碼裡的執行期匯出宣告數。
  // 少了這一條，掃描面縮小時整條測試會安靜地變窄 —— 那正是 F21 的成因。
  // 正規式**行首錨定**：`export const`／`export function` 只認宣告，不認文中提及。
  const moduleSrc = fs.readFileSync(path.join(ROOT, DATA_MODULE_PATH), 'utf8');
  const declared = (moduleSrc.match(/^export (?:const|function) /gm) ?? []).length;
  assert.equal(
    Object.keys(roots).length,
    declared,
    `掃描面的根數（${Object.keys(roots).length}）與 ${DATA_MODULE_PATH} 的執行期匯出宣告數（${declared}）不符`,
  );

  const leaves = dataStringLeaves(roots);

  // 防空轉 2：每一個帶中日韓字元的匯出，都必須至少貢獻一個葉節點。
  // 這一條擋的是「遞迴走不進某種容器」—— 根數對了，但走訪漏掉整個子樹。
  const reached = new Set(leaves.map(([p]) => p.split('.')[0]));
  for (const [name, value] of Object.entries(roots)) {
    if (typeof value === 'function') continue;
    if (!/[一-鿿]/.test(JSON.stringify(value) ?? '')) continue;
    assert.ok(reached.has(name), `匯出 ${name} 含中文字串，但掃描沒有走進去`);
  }

  // 防空轉 3：每一筆豁免必須真的存在，而且真的帶人數。
  // 第二層限制：它帶的每一個人數，必須逐字出自 current 期自己那三個欄位。
  // 這一層讓豁免清單無法成為後門 —— 加一個路徑進來，它仍然不能寫「約 11 位大法官」。
  const current = eraOf('current');
  const statuteWording = [current.label, current.ruleSummary, current.quotedText];
  for (const p of exempt) {
    const hit = leaves.find(([path]) => path === p);
    assert.ok(hit, `豁免路徑不存在：${p}`);
    const found = hit[1].match(HEADCOUNT_RE);
    assert.notEqual(found, null, `豁免路徑 ${p} 沒有人數，豁免是空轉的`);
    for (const m of found) {
      assert.ok(
        statuteWording.some((w) => w.includes(m)),
        `豁免路徑 ${p} 帶的「${m}」不出自現行憲訴法自己的用語 —— 豁免不是這樣用的`,
      );
    }
  }

  // 其餘每一個欄位，一律不得帶人數 —— 不論它寫的是哪一串字、在哪一個匯出底下。
  for (const [path, s] of leaves) {
    if (exempt.has(path)) continue;
    const m = s.match(HEADCOUNT_RE);
    assert.equal(
      m,
      null,
      `${path} 帶了換算後的人數：${m} —— 豁免只發給 current 期自己的三個欄位，不發給字串值`,
    );
  }
});

test('c3 站上不得出現換算後的人數', () => {
  const current = eraOf('current');
  // 這三個字串是現行憲訴法自己的用語，人數來自條文原文，不是換算。
  //
  // **這一條的豁免仍然是按字串值發的，而那是刻意的，範圍也已經講明。**
  // 按產生者發的那一半由上一條測試承擔（`HEADCOUNT_EXEMPT_PATHS`，按欄位路徑）。
  // 這一條掃的是**渲染後的整站文字**，包含手寫 JSX 散文 —— 散文引用現行憲訴法自己的
  // 用語（期別名稱、門檻摘要、條文原文）是本頁允許的，所以對散文而言按字串值豁免就是對的。
  // 實測過「完整文字節點才豁免」這個替代設計：**不可行**。`current.label` 在站上有 1 處
  // 是完整文字節點、5 處是較長文字節點的子字串（例：「10 人 9 人（2025-01-23 起）」），
  // 改成只豁免完整節點會讓現況誤紅。
  const allowed = [current.label, current.ruleSummary, current.quotedText];

  // 整站：整頁外殼（只渲染元件的版本被 reviewer 用外殼注入打穿過）
  // ＋ 只在 hover 才出現的浮層（整頁渲染的 hoveredYear 恆為 null，浮層不在它的輸出裡）。
  const siteText = siteVisibleText();
  // 先確認允許清單真的有被用到，否則下面的挖除是空轉。
  for (const a of allowed) assert.ok(siteText.includes(a), `站上找不到允許字串：${a}`);
  // 浮層也必須真的渲染出來，否則多掃的那一段是空的。
  assert.ok(siteText.includes('換法，前後適用不同門檻'), '浮層的換法說明沒有渲染出來');

  let residue = siteText;
  for (const a of allowed) residue = residue.split(a).join(' ');
  assert.deepEqual(
    residue.match(HEADCOUNT_RE),
    null,
    `除了現行憲訴法的條文原文之外，站上不得出現人數：${residue.match(HEADCOUNT_RE)}`,
  );
});

test('c3 規則期的呈現完全沒有人數', () => {
  // 規則期是 c3 真正要守的對象：「在中央政府所在地全體大法官」的解讀未經法學拍板，
  // 不得換算成人數。這一條把範圍縮到規則期自己的 tile，改壞了會直接紅。
  const rulesOnly = STATS.filter((s) => s.era.id === 'rules');
  assert.equal(rulesOnly.length, 1);
  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, {
      items: rulesOnly,
      selectedEraId: null,
      onSelectEra: () => {},
    }),
  );
  const text = html.replace(/<[^>]+>/g, ' ');
  assert.deepEqual(text.match(HEADCOUNT_RE), null);
  // 挖除是有效的：規則期的條文原文確實渲染出來了，不是整塊都沒渲染。
  assert.ok(text.includes('在中央政府所在地全體大法官三分之二以上出席'));
});

// ---------------------------------------------------------------------------
// AC-6 — 線上比對。未設 THRESHOLD_LIVE 時跳過。
// ---------------------------------------------------------------------------

test('AC-6 線上重抓的結果與 fixture 一致', { skip: !process.env.THRESHOLD_LIVE }, async () => {
  const live = await import('../scripts/fetch-interpretation-counts.mjs');

  const index = await live.fetchInterpretationIndex();
  assert.equal(index.length, 813);
  assert.equal(index[0].number, 1);
  assert.equal(index[index.length - 1].number, 813);

  // 釋字第 813 號的 id 不符 N + 310181 通式。這個例外仍必須存在。
  const last = index.find((e) => e.number === 813);
  assert.equal(last.id, 325335);
  assert.notEqual(last.id, 813 + 310181);

  const byNumber = new Map(RAW.map(([n, id, date]) => [n, { id, date }]));
  for (const { number, id } of index) {
    assert.equal(id, byNumber.get(number).id, `釋字第 ${number} 號的 id 變了`);
  }

  const rows = await live.fetchAllDates(index);
  assert.equal(rows.length, 813);
  for (const [number, , date] of rows) {
    assert.equal(date, byNumber.get(number).date, `釋字第 ${number} 號的發布日期變了`);
  }

  const judgments = await live.fetchJudgmentCounts();
  const recorded = new Map(fixture.judgments);
  for (const [year, count] of judgments) {
    // 抓取當年尚未結束，該年數字會再變動，只要不減少即可。
    if (year === Number(fixture.fetchedAt.slice(0, 4))) {
      assert.ok(count >= recorded.get(year), `${year} 年憲判字件數變少了`);
    } else {
      assert.equal(count, recorded.get(year), `${year} 年憲判字件數變了`);
    }
  }
});

// ---------------------------------------------------------------------------
// AC-7 — 本 feature 不動內容產線
//
// **這兩條是 AC-7 的第一批自動守衛。** 在此之前 AC-7 一條自動守衛都沒有
// （reviewer 在 cycle 8 的 C2 機械確認：測試檔完全不提產線兩檔與 `build`），
// 所以它的滿足者是**執行指令的人**，而「施工前後比對 sha256」這句話
// **連「拿同一個檔案算兩次」都能滿足**。那就是 F20 存活八輪的成因。
//
// 條文原本寫「`build` 被塞進抓取程式，即失敗」。reviewer 把抓取程式放進
// **預渲染頁面的模組層**（它在 `build` 期間載入並執行），而條文列的那些檢查
// **逐項全部通過**。下面兩條守的就是那個探測。
// **它們守不到什麼，寫在 AC-7 的 `Verified by:` 裡，不在這裡重複。**
// ---------------------------------------------------------------------------

const ts = (await import('typescript')).default;

/** 遞迴列出一個目錄下的檔案，跳過 `node_modules` 與隱藏目錄。 */
function walkFiles(rel) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) =>
    e.name === 'node_modules' || e.name.startsWith('.')
      ? []
      : e.isDirectory()
        ? walkFiles(path.join(rel, e.name))
        : [path.join(rel, e.name)],
  );
}

/** 會被當成程式執行的副檔名。`.mjs`／`.js` 也算 —— F20 的探測就是 import 一支 `.mjs`。 */
const EXECUTABLE_RE = /\.(tsx?|mjs|cjs|js)$/;
const MODULE_EXTS = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'];
function resolveModule(base) {
  for (const ext of MODULE_EXTS) {
    const candidate = base + ext;
    try {
      if (fs.statSync(path.join(ROOT, candidate)).isFile()) return candidate;
    } catch {
      /* 不存在就試下一個 */
    }
  }
  return null;
}

/** 一個檔案的全部 import／re-export／動態 import 的 module specifier。 */
function moduleSpecifiers(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const sf = ts.createSourceFile(
    rel,
    src,
    ts.ScriptTarget.ES2022,
    true,
    /\.tsx$/.test(rel) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const out = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      out.push({ text: node.moduleSpecifier.text, dynamic: false });
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      out.push({ text: arg && ts.isStringLiteral(arg) ? arg.text : null, dynamic: true });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/**
 * `next build` 會載入並執行的模組閉包。
 *
 * **進入點自檔案系統枚舉，不是一份手寫清單**（F21 的那個軸）：
 * `next.config.ts` 加上 `src/app/` 底下全部的路由檔。
 * 閉包只收 `.ts`／`.tsx` —— `.json` 與 `.css` 是資料，不是會執行的程式。
 */
function buildTimeClosure() {
  const routes = walkFiles('src/app').filter((f) =>
    /\/(page|layout|template|route|error|not-found|global-error)\.tsx?$/.test(f),
  );
  const entries = ['next.config.ts', ...routes];
  for (const e of entries) {
    assert.ok(fs.existsSync(path.join(ROOT, e)), `建置進入點不存在：${e}`);
  }
  assert.ok(routes.length > 0, 'src/app 底下找不到任何路由檔，進入點枚舉壞了');

  const seen = new Set();
  const nonLocal = new Set();
  const dynamic = [];
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!EXECUTABLE_RE.test(file)) continue;
    for (const spec of moduleSpecifiers(file)) {
      if (spec.dynamic) dynamic.push({ file, text: spec.text });
      if (spec.text === null) continue;
      let base = null;
      if (spec.text.startsWith('@/')) base = path.join('src', spec.text.slice(2));
      else if (spec.text.startsWith('./') || spec.text.startsWith('../')) {
        base = path.join(path.dirname(file), spec.text);
      } else {
        nonLocal.add(spec.text);
        continue;
      }
      const resolved = resolveModule(base);
      assert.ok(resolved, `${file} 的 import '${spec.text}' 解析不到檔案`);
      queue.push(resolved);
    }
  }
  return { files: [...seen].filter((f) => EXECUTABLE_RE.test(f)), nonLocal, dynamic };
}

/**
 * 建置期允許出現的非本地 import，**白名單**。
 *
 * **刻意用白名單而不是黑名單。** 黑名單（「不得 import `node:fs`／`child_process`…」）
 * 是一份寫法表，漏一個就放行 —— 那是 F4／F9／F21 同一個形狀，**失效方向是放行**。
 * 白名單漏一個則是**擋下**：新增相依必須有人明白加進來，順便被看見。
 * 規格也明文「不新增相依」，所以這份名單本來就該是封閉的。
 */
const BUILD_IMPORT_ALLOWLIST = new Set([
  'react',
  'react-dom',
  'next',
  'next/link',
  'next/image',
  'next/navigation',
  'next/font/google',
  'lucide-react',
  'tailwindcss',
]);

test('AC-7 建置期載入的模組閉包不得抓取或寫檔', () => {
  const { files, nonLocal, dynamic } = buildTimeClosure();

  // (0) **閉包的邊界**：建置期載入的東西只能是 `next.config.ts` 或 `src/` 底下的檔案。
  //     這一條擋的是 F20 那個探測本身 —— 把 `scripts/` 的抓取程式 import 進預渲染頁面。
  //     第一版的守衛沒有這一條，reviewer 的探測照樣全綠（那支 `.mjs` 被解析到卻沒被檢查）。
  for (const f of files) {
    assert.ok(
      f === 'next.config.ts' || f.startsWith('src/'),
      `建置期閉包載入了 src/ 之外的程式：${f} —— 抓取程式不得進入 build`,
    );
  }

  // 防空轉：閉包必須真的走下去，不是只剩進入點。
  // 指名兩個必須在閉包內的檔案 —— 一個是本票的頁面，一個要走兩層才會到，
  // 所以它同時證明「多層遞迴有效」。
  assert.ok(files.length > 0, '閉包是空的');
  for (const known of ['src/app/past/thresholds/page.tsx', 'src/data/threshold-analysis.ts']) {
    assert.ok(files.includes(known), `建置期閉包沒有走到 ${known}`);
  }

  // (1) 非本地 import 必須全部在白名單內。加一個抓取用的套件就會在這裡紅。
  for (const spec of nonLocal) {
    const bare = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    assert.ok(
      BUILD_IMPORT_ALLOWLIST.has(spec) || BUILD_IMPORT_ALLOWLIST.has(bare),
      `建置期閉包 import 了白名單外的模組：'${spec}' —— 新增相依要先有人明白加進白名單`,
    );
  }

  // (2) 閉包內不得有動態 import。動態 import 的 specifier 可以是算出來的，
  //     靜態掃描看不到它指向哪裡，因此整類不准。
  assert.deepEqual(
    dynamic.map((d) => `${d.file} → ${d.text ?? '<非字面值>'}`),
    [],
    '建置期閉包出現動態 import',
  );

  // (3) 逐檔看頂層語句。頂層語句就是「被 import 時會跑的程式」。
  for (const file of files) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const sf = ts.createSourceFile(
      file,
      src,
      ts.ScriptTarget.ES2022,
      true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const st of sf.statements) {
      // 頂層 await —— 那正是「抓取程式放進模組層」會長出來的東西。
      let topLevelAwait = false;
      const scan = (n) => {
        if (n.kind === ts.SyntaxKind.AwaitExpression) topLevelAwait = true;
        // 不進函式體：函式裡的 await 要等有人呼叫才跑，不在 import 時執行。
        if (!ts.isFunctionLike(n)) ts.forEachChild(n, scan);
      };
      if (!ts.isFunctionLike(st)) ts.forEachChild(st, scan);
      assert.equal(topLevelAwait, false, `${file} 的頂層有 await —— 那會在 build 期間執行`);

      // 頂層的裸運算式。唯一允許的是 "use client" 這類字串指示詞。
      if (ts.isExpressionStatement(st)) {
        assert.ok(
          ts.isStringLiteral(st.expression),
          `${file} 的頂層有會執行的運算式：${st.getText().slice(0, 60)}`,
        );
      }
    }
  }
});

test('AC-7 build 指令與寫出產線檔的程式都不得夾帶內容同步', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  // (1) `build` 必須恰為 `next build`。串一條 `&&` 進去就會在這裡紅。
  assert.equal(pkg.scripts.build, 'next build', 'build 指令不再是單純的 next build');

  // (2) 不得有任何生命週期掛鉤 —— 它們會在 install／build 前後自動執行。
  //     這裡也用白名單：scripts 的鍵必須恰為這五個。
  assert.deepEqual(
    Object.keys(pkg.scripts).sort(),
    ['build', 'dev', 'lint', 'start', 'sync-content'].sort(),
    'package.json 的 scripts 多了或少了項目 —— 生命週期掛鉤會自動執行',
  );

  // (3) 提到 sync-content 的 script 必須恰為 `sync-content` 自己。
  assert.deepEqual(
    Object.entries(pkg.scripts)
      .filter(([, v]) => v.includes('sync-content'))
      .map(([k]) => k),
    ['sync-content'],
    '除了 sync-content 自己，還有別的 script 會跑內容同步',
  );

  // (4) 全 repo 只有 `scripts/sync-content.mjs` 會寫出產線兩檔。
  //     這一條把 cycle 8 的 C1 由人工查證改成自動守衛。
  const WRITE_RE = /\b(writeFileSync|writeFile|createWriteStream|appendFileSync|copyFileSync|renameSync)\s*\(/;
  const PROD_RE = /discussions\.json|history\.json/;
  const scanned = ['src', 'scripts', 'tests'].flatMap(walkFiles).filter((f) => /\.(mjs|js|ts|tsx)$/.test(f));
  assert.ok(scanned.length > 0, '掃描面是空的');
  const writers = scanned.filter((f) => {
    const src = stripComments(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    return WRITE_RE.test(src) && PROD_RE.test(src);
  });
  assert.deepEqual(writers, ['scripts/sync-content.mjs'], '寫出產線兩檔的程式不只同步程式一支');

  // (5) `src/` 底下完全不得有寫檔呼叫。網站的程式不寫檔，這一條擋住整類。
  const srcWriters = walkFiles('src')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => WRITE_RE.test(stripComments(fs.readFileSync(path.join(ROOT, f), 'utf8'))));
  assert.deepEqual(srcWriters, [], 'src/ 底下出現寫檔呼叫');
});

test('AC-7 產線兩檔與 main 逐位元相同', () => {
  // **這一條把條文的「施工前後比對 sha256」由人工步驟改成自動守衛。**
  // 原本那句話的滿足者是執行指令的人，而它**連「拿同一個檔案算兩次」都能滿足** ——
  // 那正是 C2 指出的成因。基準改成 `main`：本票宣稱不動產線，
  // 所以工作樹的這兩檔必須與分支點逐位元相同。
  const baseRef = 'main';
  const resolved = spawnSync('git', ['rev-parse', '--verify', `${baseRef}^{commit}`], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  // 不做「取不到就跳過」—— 靜默跳過就是一個洞。取不到就大聲失敗。
  assert.equal(resolved.status, 0, `解析不到基準 ref ${baseRef}，這條守衛需要它`);

  const PIPELINE_FILES = ['src/data/discussions.json', 'src/data/history.json'];
  for (const rel of PIPELINE_FILES) {
    const base = spawnSync('git', ['show', `${baseRef}:${rel}`], {
      cwd: ROOT,
      encoding: 'buffer',
      maxBuffer: 64 * 1024 * 1024,
    });
    assert.equal(base.status, 0, `${baseRef} 上取不到 ${rel}`);
    const baseHash = crypto.createHash('sha256').update(base.stdout).digest('hex');
    const nowHash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(ROOT, rel)))
      .digest('hex');
    assert.equal(nowHash, baseHash, `${rel} 與 ${baseRef} 不同 —— 本票不得動內容產線`);
  }

  // 防空轉：兩檔都必須真的有內容，否則上面比的是兩個空檔。
  for (const rel of PIPELINE_FILES) {
    const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    assert.ok(Array.isArray(parsed) && parsed.length > 0, `${rel} 解析不出非空陣列`);
  }
});
