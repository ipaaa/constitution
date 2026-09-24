// src/data/ruling-threshold.ts
//
// 憲法法庭判決門檻的**唯一定義處**。
//
// 這個模組只放門檻資料與由它推導出的三個句子。任何要敘述「10 人參與評議下限
// 已失效」的地方——不論是 React 元件、時間軸資料還是 quiz 的 explanation——
// 都必須 import 這裡的常數，不得自行手寫一次。
// 手寫過的地方會各自漂移：`063` 修好 `/future` 之後，同一個法律錯誤仍留在
// `/controversy-timeline` 與 `/quiz/*`，就是因為那些文案是各自手寫的副本。
// 見 docs/constitution-features/066-quiz-timeline-voided-quorum-present-tense.md 第五小節。
//
// 為什麼獨立成一個模組，而不是留在 `src/data/future.ts`：
// `controversy-timeline.ts` 原本不 import 任何模組。讓它 import `future.ts`
// 會把 470 行的待審案件資料集拉進 `/controversy-timeline` 的 bundle。
// 本模組只有門檻資料，沒有這個代價，也不 import 任何本地模組（不會構成迴圈）。
//
// `src/data/future.ts` 改為 re-export `RULING_THRESHOLD`，
// 因此既有的 `from '@/data/future'` import 不必改。

/**
 * 憲法法庭判決門檻。
 *
 * 現行有效的規定是憲法訴訟法第 30 條第 1 項，給的是**比例**，不是固定人數：
 * 「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，
 *   大法官現有總額過半數同意。」
 *
 * 114 年 1 月 23 日修正曾增訂第 30 條第 2 項，訂下固定人數下限
 * （參與評議不得低於 10 人、同意違憲宣告不得低於 9 人）。
 * 該項已由 114 年憲判字第 1 號（114-12-19）宣告違憲，自公告日起失其效力。
 *
 * 注意：全國法規資料庫至今仍原樣顯示已失效的第 30 條第 2 至 6 項，不加失效標註。
 * 條文是否有效，權威在憲判主文，不在法規資料庫的顯示。
 *
 * `headcount` 為 null，代表尚未經法學背景者拍板具體人數。
 * **渲染端在 headcount 為 null 時，必須完全不顯示人數，並改敘述 `rule`。**
 * 不得顯示替代字元或推算值。拍板事項見
 * docs/constitution-features/063-required-for-ruling-legal-accuracy.md 第五小節。
 */
export const RULING_THRESHOLD = {
  /** 條文文字轉成的一句話敘述。渲染端的長版文案來源 */
  rule: '判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意',
  /** 短版標籤用。掃讀場景，不超過 12 字 */
  ruleShort: '門檻依現有總額比例計算',
  /** 現行有效條文出處 */
  statute: '憲法訴訟法第 30 條第 1 項',
  /** 已失效的固定人數下限。保留是因為它是報導的主題，不是現行法 */
  voidedFloor: {
    participants: 10,
    unconstitutionalityVotes: 9,
    statute: '憲法訴訟法第 30 條第 2 項',
    voidedOn: '2025-12-19',
    voidedBy: '114 年憲判字第 1 號',
    rulingUrl: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485',
  },
  /** 具體人數。待 L1／L2 拍板前一律為 null */
  headcount: null as number | null,
} as const;

const { voidedFloor } = RULING_THRESHOLD;

/**
 * 已失效的固定人數下限，短版。兩個版本共用同一組欄位，因此「10」永遠與
 * 「違憲」和失效依據出現在同一句裡。不要在別處另寫一次。
 */
export const VOIDED_FLOOR_SHORT =
  `${voidedFloor.statute}的 ${voidedFloor.participants} 人參與評議下限，` +
  `已由 ${voidedFloor.voidedBy}宣告違憲，自 ${voidedFloor.voidedOn} 起失其效力`;

/** 已失效的固定人數下限，完整版。連同違憲宣告同意人數下限一併敘述。 */
export const VOIDED_FLOOR_FULL =
  `${voidedFloor.statute}（參與評議之大法官不得低於 ${voidedFloor.participants} 人、` +
  `作成違憲宣告之同意人數不得低於 ${voidedFloor.unconstitutionalityVotes} 人），` +
  `已由 ${voidedFloor.voidedBy}宣告違憲，自公告日 ${voidedFloor.voidedOn} 起失其效力`;

/**
 * 最短版。設計成可以接在「⋯⋯10 人門檻」這類既有句子後面當補述。
 * 三個版本共用 RULING_THRESHOLD.voidedFloor 的同一組欄位，
 * 因此數字、依據與失效日永遠一致。不要在別處另寫一次。
 */
export const VOIDED_FLOOR_CLAUSE =
  `該下限已由 ${voidedFloor.voidedBy}宣告違憲，自 ${voidedFloor.voidedOn} 起失其效力`;
