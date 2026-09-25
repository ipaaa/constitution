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

// 本測試逐項的 `html.includes(label)` 有兩個滿足者，見本規格檔 review cycle 7 的 N1。
// N1 尚未取得 FO 授權，因此本輪**不動**這裡。
test('AC-4 OchreBandFactors 為每個待拍板項目渲染待確認標記與拍板者', () => {
  const html = renderToStaticMarkup(createElement(OchreBandFactors, { factors: FACTORS }));
  const needsRuling = FACTORS.filter((f) => f.needsRuling !== null);
  assert.ok(needsRuling.length > 0);

  // 只數徽章，不數段落說明文字裡提到的「待確認」三個字。
  const markers = html.match(/>待確認<\/span>/g) ?? [];
  assert.equal(markers.length, needsRuling.length);

  for (const f of needsRuling) {
    const label = data.RULING_AUTHORITY_LABEL[f.needsRuling];
    assert.ok(html.includes(label), `${f.id} 沒有渲染拍板者 ${label}`);
    assert.ok(html.includes(f.uncertainty), `${f.id} 沒有渲染 uncertainty`);
  }
  // 不必拍板的那一項不得掛待確認標記。
  // 原本寫的是 `settled.length === FACTORS.length - needsRuling.length`。
  // settled 與 needsRuling 是同一個陣列依同一個條件切兩半，這個等式對任何陣列都成立，
  // 改壞任何一項的 needsRuling 它都不會紅。改成指名「哪一項不必拍板」——
  // 規格說只有資料邊界那一項本票可以自己斷言，其餘四項都要外部拍板。
  const settled = FACTORS.filter((f) => f.needsRuling === null);
  assert.deepEqual(settled.map((f) => f.id), ['f5-excluded-cases']);
  assert.equal(needsRuling.length, 4);
  assert.ok(html.includes('無須外部拍板'));
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
  for (const c of rules.caveats) {
    assert.ok(html.includes(c.text), `${c.id} 沒有渲染出來`);
  }
  assert.ok(html.includes('待確認·法學背景審閱者'));
  // 三項限制的具體內容必須看得見，不能只留一句「有但書」。
  assert.ok(html.includes('1952-04-16 修正後的版本'));
  assert.ok(html.includes('79 筆中的 77 筆'));
  assert.ok(html.includes('在中央政府所在地全體大法官'));
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
  // `amendedOn` 這一條有四個滿足者，見本規格檔 review cycle 7 的 N2。
  // N2 尚未取得 FO 授權，因此本輪**不動**這裡。
  const html = renderPage();
  assert.ok(html.includes('釋字第 1、第 2 號'));
  assert.ok(html.includes(RULES_ERA_UNCOVERED.amendedOn));
  assert.ok(html.includes('未取得的原始版規則'));
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

test('c3 站上不得出現換算後的人數', () => {
  const current = eraOf('current');
  // 這三個字串是現行憲訴法自己的用語，人數來自條文原文，不是換算。
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
