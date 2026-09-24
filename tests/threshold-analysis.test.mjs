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
const { default: ThresholdCaseAnalysis } = await import('@/components/threshold-analysis/ThresholdCaseAnalysis');

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
/** 反駁標記：這句話有沒有當場說清楚該說法不成立。 */
const REBUTTAL_MARKERS = ['不成立', '1993-02-03', '時間順序'];

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
  const pageHtml = renderToStaticMarkup(createElement(ThresholdCaseAnalysis));
  const scanned = [...SCANNED_SOURCES, ['<rendered page>', htmlToText(pageHtml)]];

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
  const yearKeyOnly = segmentsOf(String(YEARS.find((y) => y.year === 1987).year));
  assert.equal(claimShapedSegments(yearKeyOnly.join('\n')).length, 0);
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
  const settled = FACTORS.filter((f) => f.needsRuling === null);
  assert.equal(settled.length, FACTORS.length - needsRuling.length);
  assert.ok(html.includes('無須外部拍板'));
});

test('AC-4 圖元件與其子元件不 import FACTORS', () => {
  const chartFiles = [
    'src/components/threshold-analysis/ThresholdChart.tsx',
    'src/components/threshold-analysis/ThresholdBand.tsx',
    'src/components/threshold-analysis/ThresholdBoundary.tsx',
    'src/components/threshold-analysis/SeriesBreakLine.tsx',
    'src/components/threshold-analysis/ChartAxes.tsx',
    'src/components/threshold-analysis/ChartText.tsx',
  ];
  for (const file of chartFiles) {
    const code = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    assert.equal(/\bFACTORS\b/.test(code), false, `${file} 在程式碼裡提到 FACTORS`);
  }
});

// ---------------------------------------------------------------------------
// AC-5 — 現行 10 人 9 人門檻在圖上看得出「沒有釋字資料可用」
// ---------------------------------------------------------------------------

test('AC-5 current 期無年均，且圖上以斜線網底與文字標明無釋字資料', () => {
  assert.equal(statOf('current').meanPerYear, null);
  assert.equal(statOf('current').totalCount, 0);

  const html = renderToStaticMarkup(
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
  assert.match(html, /<pattern[^>]*id="threshold-hatch"/);
  assert.match(html, /fill="url\(#threshold-hatch\)"/);
  assert.ok(html.includes('無釋字資料'));
  // <desc> 必須帶四期的年均，讀螢幕軟體才拿得到同一份對比。
  assert.ok(html.includes('年均 6.7 件'));
  assert.ok(html.includes('年均 17.3 件'));
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

  const html = renderToStaticMarkup(
    createElement(EraComparisonStrip, { items: STATS, selectedEraId: null, onSelectEra: () => {} }),
  );
  // 「不寫出 1/2」的決定仍然成立，而且已證明是對的：實際條文是三分之二出席＋過半數同意。
  assert.equal(html.includes('1/2'), false);
  assert.equal(html.includes('二分之一'), false);
  // 也不得把限定語換算成人數或改寫成「總額」。
  assert.equal(/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary), false);
  assert.equal(rules.ruleSummary.includes('總額'), false);
  assert.ok(rules.ruleSummary.includes('在中央政府所在地全體大法官'));
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
  const html = renderToStaticMarkup(createElement(ThresholdCaseAnalysis));
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
const HEADCOUNT_RE = /(?:\d+|[一二三四五六七八九十]+)\s*人/g;

test('c3 站上不得出現換算後的人數', () => {
  const current = eraOf('current');
  // 這三個字串是現行憲訴法自己的用語，人數來自條文原文，不是換算。
  const allowed = [current.label, current.ruleSummary, current.quotedText];

  const pageText = renderToStaticMarkup(createElement(ThresholdCaseAnalysis))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  // 先確認允許清單真的有被用到，否則下面的挖除是空轉。
  for (const a of allowed) assert.ok(pageText.includes(a), `頁面找不到允許字串：${a}`);

  let residue = pageText;
  for (const a of allowed) residue = residue.split(a).join(' ');
  assert.deepEqual(
    residue.match(HEADCOUNT_RE),
    null,
    `除了現行憲訴法的條文原文之外，頁面不得出現人數：${residue.match(HEADCOUNT_RE)}`,
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
