/**
 * 手寫資料模組。不是同步產物，可以改。
 * 已查證的判決字號。鍵為字號，值為案由、判決日期與一手來源。
 * 新增任何一筆，必須先開啟 source 網址核對案由與判決日期。
 * 同步程式（scripts/sync-content.mjs）與網頁（feature 019）共用這一份。
 *
 * 不接受自由文字 —— 全站已有把 113憲判9 誤標為 114憲判1 的實例。
 * 鍵同時是試算表 `case_ref` 下拉清單的選項，必須逐字相同。
 * 規格見 docs/constitution-features/064-track2-case-ref-stance-columns.md 第三節 3.2。
 */
export const VERIFIED_CASE_REFS = Object.freeze({
  '113年憲判字第9號': Object.freeze({
    caseName: '立法院職權行使法等案',
    date: '113-10-25',
    source: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966',
  }),
  '114年憲判字第1號': Object.freeze({
    caseName: '憲法訴訟法修正案',
    date: '114-12-19',
    source: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485',
  }),
});
