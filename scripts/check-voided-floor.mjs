#!/usr/bin/env node
// 檢查站上是否把已失效的 10 人參與評議下限當成現行法。
//
// 一手依據：憲法訴訟法第 30 條第 2 項的參與評議人數下限，
// 經 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力。
//
// 設計原則：先正規化再比對，不列舉寫法。
// 「10 人」「10人」「十人」「10 位」正規化後是同一個 token；
// 「114 年憲判字第 1 號」與「114年憲判字第1號」也是。
// 逐一列舉寫法的 grep 已在本專案造成九次穩定盲區，本檔不用那種作法。
//
// 本檔不設豁免清單。檢查誤報時，改寫原文消除歧義，不要加白名單。

const PAGES = process.argv.slice(2);
if (PAGES.length === 0) {
  console.error('usage: node check-voided-floor.mjs <url> [url...]');
  process.exit(2);
}

/** 去掉 HTML 標籤、RSC flight payload 的 Unicode 轉義與所有空白 */
function normalize(html) {
  return html
    .replace(/<[^>]*>/g, '。')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/[\s\u00a0\u2000-\u200b\u3000]+/g, '');
}

/**
 * 切句。除了中文句末標點，也在 JSON 字串邊界切開——
 * flight payload 把每個欄位包成字串，不切會讓相鄰欄位黏成一句。
 */
function sentences(text) {
  return text
    .replace(/\\"/g, '')
    .replace(/["',]/g, '')
    .split(/[。！？；:{}[\]]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 人數下限：條文訂的具體門檻數字 */
const FLOOR_NUM = /(10人|10位|10名|十人|十位|十名|9人|9位|9名|九人|九位|九名)/;
/** 門檻語彙：不帶數字也指向同一件事的說法 */
const FLOOR_WORD = /(評議門檻|開庭門檻|判決門檻|人數門檻|門檻)/;
/** 法庭脈絡：把頁首頁尾的「降低理解門檻」這類通用文案排除在外 */
const COURT = /(憲法法庭|大法官|憲法訴訟法|評議|判決)/;
const THRESHOLD = (s) => (FLOOR_NUM.test(s) || FLOOR_WORD.test(s)) && COURT.test(s);
/** 失效語彙：任何指向「已經沒有效力」的說法。刻意不含「違憲」——
 *  「宣告修正案違憲」不等於「這一項已失效」，含進來會讓檢查 2 假性通過 */
const VOIDED = /(失效|失其效力|不再適用|已廢止|停止適用)/;
/** 依據語彙：正規化後的判決字號 */
const AUTHORITY = /114年憲判字第1號/;
/** 持續語彙：把狀態講成「到現在還在」的說法 */
const ONGOING = /(持續|始終|至今|目前|仍然|仍舊|如今|依然|現在)/;
/** 停擺語彙：把法庭講成不能運作的說法 */
const PARALYSIS = /(停擺|癱瘓|無法運作|無法正常運作|無法作成判決|無法受理)/;

let failed = false;

for (const url of PAGES) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${url}: HTTP ${res.status}`);
    failed = true;
    continue;
  }
  const full = normalize(await res.text());
  const sents = sentences(full);
  const floorSents = sents.filter(THRESHOLD);

  // 檢查 1：以句為單位。凡講到門檻的句子，不得帶持續語彙。
  const ongoingHits = [...new Set(floorSents.filter((s) => ONGOING.test(s)))];

  // 檢查 2：以字元視窗為單位，不以句為單位。
  // 理由：client component 的文案在 SSR 後被標籤與註解切碎，切句會把
  // 本來同一句的「門檻」「失效」「依據」拆到三句，造成假性 FAIL。
  const WINDOW = 150;
  const clauseHits = [];
  const g = new RegExp(FLOOR_NUM.source, 'g');
  let m;
  let floorNumCount = 0;
  while ((m = g.exec(full)) !== null) {
    const w = full.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW);
    if (!COURT.test(w)) continue;
    floorNumCount += 1;
    if (VOIDED.test(w) && AUTHORITY.test(w)) clauseHits.push(w);
  }

  // 檢查 3：停擺敘述不得帶持續語彙。法庭在下限失效後已作成六則判決。
  const paralysisHits = [...new Set(
    sents.filter((x) => PARALYSIS.test(x) && ONGOING.test(x) && COURT.test(x)),
  )];

  const c1 = ongoingHits.length === 0;
  // 頁面沒提到人數下限就不必掛失效說明；提到了就一定要掛。
  const c2 = floorNumCount === 0 || clauseHits.length >= 1;
  console.log(`\n=== ${url}`);
  console.log(`句數 ${sents.length}, 門檻句 ${floorSents.length}, 下限數字出現 ${floorNumCount} 次`);
  console.log(`檢查 1 門檻句不得帶持續語彙: ${c1 ? 'PASS' : 'FAIL'} (${ongoingHits.length} 筆)`);
  for (const s of ongoingHits) console.log(`  x ${s.slice(0, 110)}`);
  console.log(`檢查 2 門檻+失效+依據須同窗出現: ${c2 ? 'PASS' : 'FAIL'} (${clauseHits.length} 筆)`);
  if (clauseHits.length) console.log(`  o ${clauseHits[0].slice(0, 160)}`);
  const c3 = paralysisHits.length === 0;
  console.log(`檢查 3 停擺敘述不得帶持續語彙: ${c3 ? 'PASS' : 'FAIL'} (${paralysisHits.length} 筆)`);
  for (const x of paralysisHits) console.log(`  x ${x.slice(0, 110)}`);
  if (!c1 || !c2 || !c3) failed = true;
}

process.exit(failed ? 1 : 0);
