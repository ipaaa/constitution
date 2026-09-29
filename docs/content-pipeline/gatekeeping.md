# 內容把關總覽

**狀態**：evergreen
**最後查核**：2026-09-29
**負責人**：captain

這份文件回答一件事：**現在有哪些把關、各擋什麼、擋不到什麼、缺口對應哪張票。**
它是總覽，不是規格。每一段連到正本。步驟與指令的細節以正本為準。

**本文的三條寫作規則**（改這份文件的人必須遵守）：

1. **只寫不會過期的句子。** 寫「已完成 X（日期）」，不寫某件事的進度。票的進度與上線條件用指令產生，見第 7、8 章。
2. **連結的可見文字寫 repo 根目錄起算的 `docs/…` 路徑。** 目標檔被封存時，`scripts/content-audit.mjs` 的規則 M6 會指名本文那一行。
3. **每道防線都寫具體的「擋什麼」與「擋不到什麼」。** 改動推翻其中一句時，review 會要求更新本文。

---

## 1. 內容怎麼到網站

適用於 Track 1、Track 2 與 `site_tldr` 三個分頁的內容。T3 與其他內容見第 6 章。

1. 投稿者在 Google 試算表的發布分頁填寫或修改內容欄。
2. `status` 欄由公式產生，不由人輸入。內容與最後核可時的指紋不同，就顯示 `Needs review`。
3. 責任編輯選取資料列，執行 `Review → 核可選取列`。選單寫入核可者、UTC 時間與內容指紋。拒絕用 `Review → 拒絕選取列`，必須填原因。
4. 有人明確要發布時，工程人員在專用分支手動執行同步。同步只收 `status` 為 `Approved` 的列。
5. 同步獨立重算每一列的指紋，與記錄的三份指紋比對。任一列不符，或任一項前置檢查失敗，整份中止，兩個 JSON 都不寫。
6. 同步通過後開 PR。captain 看 JSON diff 與 Vercel 預覽，同意後合併。
7. 合併後部署。部署不執行同步，只讀 repo 裡已存檔的 JSON。網站帶 `noindex`。
8. 對外發布前要移除 `noindex`。移除前必須通過第 7 章的上線前檢查。

**已核可的列被改過而沒有重新核可**：該列顯示 `Needs review`。下次同步時，該列不會寫進 JSON，網站上會少這一筆。PR 的 JSON diff 會顯示這一筆被刪除。

正本：

- 核可與同步的現行規格：[`docs/content-pipeline/design.md`](design.md) 修訂紀錄〈2026-09-03 — feature 040 repo 實作完成〉
- 操作步驟、錯誤訊息與復原：[`docs/content-pipeline/operations.md`](operations.md)
- 協作者的簡短版：[`docs/project/contributing.md`](../project/contributing.md)〈內容協作〉

## 2. 角色

### 投稿者

- **做什麼**：在三個發布分頁編輯內容欄。
- **不能做什麼**：改不到第 3 章的 A、B、C 三類欄位。2026-09-29 captain 回報以投稿者帳號實測 30 格，與預期相符：三類欄位 27 格被擋，內容欄 3 格可改。
- **被什麼擋**：改了內容，該列退回 `Needs review`，要重新核可才會進網站。
- **擋不到什麼**：整列刪除。試算表的保護範圍沒有擋整列刪除的設定。
- **正本**：[`docs/constitution-features/050-ssot-approval-deployment.md`](../constitution-features/050-ssot-approval-deployment.md) 步驟 6 與 S7-b；[`docs/project/contributing.md`](../project/contributing.md)。

### 學者（法學背景審閱者）

- **做什麼**：編輯試算表時，權限與投稿者相同。另外負責只有法學背景者能做的判斷：
  - 釋字第 272 號的內容是否正確（`docs/health-check/TODO.md` 的 P0-2）。
  - `067` 閱讀清單的 H 層：因果敘述、法律效果的精確度、語氣與立場。
- **被什麼擋**：這些判斷沒有機制。只靠人讀。
- **正本**：[`docs/health-check/TODO.md`](../health-check/TODO.md) P0-2；[`docs/constitution-features/_archive/systematic-chinese-content-legal-audit.md`](../constitution-features/_archive/systematic-chinese-content-legal-audit.md) `## Design` 第二、十節；[`docs/content-audit/2026-09-29-reading-list.md`](../content-audit/2026-09-29-reading-list.md)。

### 責任編輯

- **做什麼**：用 `Review` 選單核可或拒絕。拒絕要寫原因。
- **不能做什麼**：改不到 A、C 兩類欄位。自己改了內容，自己的核可一樣失效，要重新核可。
- **被什麼擋**：帳號必須在 B 類保護範圍的允許名單內。不在名單內時，選單**靜默失敗，沒有錯誤訊息**。按了沒反應，先查允許名單。
- **正本**：[`docs/content-pipeline/operations.md`](operations.md)；[`docs/content-pipeline/approval-permission-probe.md`](approval-permission-probe.md) P1、P7 與〈過程發現〉第二項；`050` 票步驟 7 的〈常見錯誤〉表。

### captain

- **做什麼**：試算表擁有者。設定保護範圍。看 PR 的 JSON diff 與 Vercel 預覽後決定是否合併。在 `056` 簽 G-3、G-4。核准新的常設檢查。
- **不能做什麼**：保護範圍排除不了擁有者。所以**不要手動編輯 `status` 與 `current_fingerprint`**。手打的值會覆蓋公式，該列狀態從此不再更新。還原方式是重跑 `Review → 安裝／更新公式`。
- **正本**：`050` 票步驟 6 的 ⚠️；[`docs/content-pipeline/approval-permission-probe.md`](approval-permission-probe.md)〈過程發現〉第一項。

### 工程人員與 agent

- **做什麼**：有人明確要發布時，在專用分支執行同步，開 PR。
- **不能做什麼**：不手改 `src/data/*.json`。不自行執行 `npm run sync-content`。不讓 AI 生成的內容上線。
- **正本**：[`AGENTS.md`](../../AGENTS.md)「絕對不要做的事」第 1、2、5 條。

## 3. 誰能改試算表的哪些欄：A／B／C 三類

三個發布分頁各設一次。保護範圍不跨分頁繼承。

| 類別 | 欄位 | 誰可改 | 驗證記錄 |
|---|---|---|---|
| A　公式欄 | `status`、`current_fingerprint` | 只有 captain。**但規則是不要改**，見第 2 章 captain 一節 | 投稿者帳號實測被擋（`050` S7-b） |
| B　審核欄 | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`reject_reason` | 只有責任編輯。`Review` 選單以執行者身分寫入這六欄 | 投稿者帳號實測被擋（`050` S7-b）；責任編輯帳號 18 格可改（`050` S7-d） |
| C　標題列 | 三個分頁的第 1 列全列 | 只有 captain。改一個標題，同步會中止，整條產線停擺 | 投稿者帳號實測被擋（`050` S7-b） |

**三項已知限制：**

1. 保護範圍排除不了擁有者。這是 Google 試算表的平台限制。
2. 整列刪除沒有對應的保護設定。
3. `R2:R` 這類開放範圍，Google 試算表存成到第 1000 列。第 1001 列之後不受保護。

正本：[`docs/constitution-features/050-ssot-approval-deployment.md`](../constitution-features/050-ssot-approval-deployment.md) 步驟 6、S7 與〈部署窗口記錄〉第一、二節。`050` 封存後，保護範圍的正本移到 [`docs/content-pipeline/operations.md`](operations.md)。

## 4. 核可版本綁定

- 核可綁定的是**核可當下的內容**，不是這一列。內容改了，核可就失效，要重新核可。
- 責任編輯自己改內容也一樣失效。
- 只改 B 類審核欄，不會讓核可失效。
- Track 2 的指紋含資料列的序號。在 Track 2 插入或刪除一列，其後各列都要重新核可。
- 同步不再只憑 `status = Approved` 放行。`status` 決定一列要不要檢查；被檢查的列，同步自己重算指紋，與 `review_fingerprint`、`approved_fingerprint`、`current_fingerprint` 三份比對。
- 2026-09-29 起，正式試算表套用這套機制（feature `050` 部署窗口 S1–S9）。

正本：[`docs/content-pipeline/design.md`](design.md) 修訂紀錄〈2026-09-03 — feature 040 repo 實作完成〉與〈2026-09-29 — 正式 SSOT 已套用核可版本綁定（feature 050）〉。

## 5. 防線總表

「機械或人工」欄只有三個值：

- `機械`：repo 內有可重跑的腳本或測試。欄內寫它的指令。
- `人工`：靠人判斷，沒有留下可查的記錄。欄內寫由誰做。
- `人工（有記錄）`：靠人執行或判斷，結果寫進指定的記錄。欄內寫由誰做、記在哪裡。

| 防線 | 擋什麼 | 擋不到什麼 | 機械或人工 | 正本 |
|---|---|---|---|---|
| 核可版本綁定（同步端） | 核可後被改過的內容、缺漏或偽造的核可紀錄、指紋不符的列。任一列不符，整份不寫 | 核可者本身看錯的內容。綁定只證明「核可的就是這一版」，不證明這一版正確 | `機械`：`node --test tests/approval-content-version-binding.test.mjs` | [`docs/content-pipeline/design.md`](design.md) 修訂紀錄 2026-09-03 |
| 試算表保護範圍 A／B／C | 投稿者改公式欄、審核欄與標題列 | 擁有者手改公式欄；整列刪除；第 1001 列之後的列 | `人工（有記錄）`：由 captain 設定，Google 試算表執行。repo 內沒有可重跑的檢查。有效性靠 captain 以投稿者帳號做的行為測試，記在 `050` 票 S7 | [`docs/constitution-features/050-ssot-approval-deployment.md`](../constitution-features/050-ssot-approval-deployment.md) 步驟 6 |
| 同步前置檢查 | 缺欄或標題對不上、`status` 值不合法、已核可列的必填欄空白、`id` 重複、核可後 0 筆、5 組已知佔位字串。任一項失敗，整份不寫 | 刪掉少數幾列：同步只在核可後 0 筆時中止，筆數下降時照常寫出。兩列標題相同。內容是 AI 生成或編造的 | `機械`：`node --test tests/approval-content-version-binding.test.mjs`（檢查本身在 `scripts/sync-content.mjs`，只在發布時執行） | [`docs/content-pipeline/operations.md`](operations.md)〈同步〉與〈錯誤與復原〉 |
| PR 的 JSON diff 與預覽審閱 | 同步產生的兩個 JSON 裡看得見的錯：少了一筆、多了測試字串、畫面壞掉 | 不經同步的內容。看起來合理但事實錯誤的內容 | `人工`：由 captain | [`docs/content-pipeline/operations.md`](operations.md)〈同步〉 |
| workflow `verify` 階段的事實查核與佔位掃描 | 走 `constitution-features` workflow 的票，其 diff 裡的事實錯誤與設計文件範例值 | 不走 workflow 的改動。具名的佔位掃描自 2026-09-02 refit（`1eff0e2`）起才寫進 `verify` 的輸出，之前的票沒有這一項 | `人工`：由 verify 階段的 fresh agent | [`docs/constitution-features/README.md`](../constitution-features/README.md) 的 `verify` stage |
| `056` 上線前 gate 的機械項 G-1、G-2、G-5–G-8 | 指定票的結論、佔位字串、釋字第 272 號回到線上、`noindex` 綁定、建置與型別 | 清單以外的內容錯誤 | `機械`：各項指令在 `056` 票第三節〈Gate 執行清單〉 | [`docs/constitution-features/_archive/056-pre-launch-checklist.md`](../constitution-features/_archive/056-pre-launch-checklist.md) 第三節 |
| `056` 上線前 gate 的人工項 G-3、G-4 | Vercel 的實際設定；三項明確接受的風險 | — | `人工（有記錄）`：由 captain，簽字記在 `056` 票的 `### Feedback Cycles` | 同上 |
| `067` 內容查核 M 層 | 號次不存在、號次與年份不配、門檻數值漂移、日期順序倒退、同段紀年混用、文件路徑指向已封存的檔 | 佔位字串與釋字第 272 號（那是 `056` 的 G-5、G-6）。需要理解語意的錯誤 | `機械`：`node scripts/content-audit.mjs check`，全過時離開碼 0 | [`docs/constitution-features/_archive/systematic-chinese-content-legal-audit.md`](../constitution-features/_archive/systematic-chinese-content-legal-audit.md) `## Design` 第三節 |
| `067` 閱讀清單 L 層與 H 層 | 同一事實的互斥說法、號次與案名配對、現在式的法律狀態、因果敘述、法律效果精確度、語氣與立場 | 審閱者沒讀到的段落 | `人工（有記錄）`：由學者（法學背景審閱者），逐項勾選記在 `docs/content-audit/` 的清單 | [`docs/content-audit/2026-09-29-reading-list.md`](../content-audit/2026-09-29-reading-list.md) |
| 已失效門檻的時態檢查（`066`） | 頁面把已失效的 10 人參與評議下限寫成現行法 | 沒有傳給它的路由 | `機械`：`node scripts/check-voided-floor.mjs <url>...`，需先啟動網站 | `scripts/check-voided-floor.mjs` 檔頭 |
| 門檻分析的資料測試（`012`） | 釋字逐年件數與門檻條文被改錯 | `src/data/threshold-analysis.ts` 以外的內容 | `機械`：`node --test tests/threshold-analysis.test.mjs` | `tests/threshold-analysis.test.mjs` |
| `src/app/layout.tsx` 的 `noindex` | 搜尋引擎在對外發布前收錄網站 | 知道網址的人直接瀏覽 | `機械`：`npm run build` 之後 `grep -o '<meta name="robots" content="[^"]*"' .next/server/app/index.html` 印 `noindex, nofollow` | [`docs/health-check/TODO.md`](../health-check/TODO.md) P3-8 |

**這張表沒有 AI 內容偵測。** 沒有任何一道機械防線能判斷一段文字是不是 AI 生成的。

## 6. 三類內容

| 類別 | 範圍 | 把關方式 | 正本 |
|---|---|---|---|
| SSOT 人工內容 | `src/data/history.json`、`src/data/discussions.json`，來自試算表三個發布分頁 | 第 1 至 5 章的全部防線 | [`docs/content-pipeline/design.md`](design.md) |
| T3 生成內容與圖表 | 未來軌，以 `src/data/future.ts` 為主 | 依收集流程由 captain 提供案號、agent 修改、workflow 的 `verify` 查核、captain 看預覽。不經試算表，不經核可版本綁定 | [`docs/content-pipeline/data-collection-guide.md`](data-collection-guide.md) T3 |
| 其餘內容 | 上面兩類以外的一切：寫死在元件裡的中文、其他 `src/data/*.ts` | **不得有 AI 生成的內容。** 明文在 [`AGENTS.md`](../../AGENTS.md)「絕對不要做的事」第 5 條與 [`docs/content-pipeline/design.md`](design.md) 第六節不變式第 7 條 | [`docs/health-check/TODO.md`](../health-check/TODO.md) P1-8 |

**AI 生成的內容能放在哪裡**：只能放在前兩類。也就是經責任編輯核可的試算表內容，或依收集流程收集並經審閱的 T3 內容與圖表。第三類不得有。

**沒有機械檢查。** 資料層沒有來源欄位，無法用程式分辨一段內容是誰寫的。第三類的禁令只靠人守。對應的缺口見第 8 章。

## 7. 上線前檢查

**一、P3-8 的解除條件以下列指令印出。** 條件寫在 `docs/health-check/TODO.md` 的 P3-8。本文不抄條件。在 repo 根目錄執行：

```bash
awk '/^### P3-8/{s=1;next} /^### /{s=0} s && /解除條件/' docs/health-check/TODO.md
```

指令印出的每一條都是移除 `noindex` 的條件。2026-09-21 加入的那一條指向 `056` 的 G-1 至 G-8：八項全數通過才可移除。完整清單與每一項的指令在 [`docs/constitution-features/_archive/056-pre-launch-checklist.md`](../constitution-features/_archive/056-pre-launch-checklist.md) 第三節〈Gate 執行清單〉。

**二、`067` 的 `check`。** captain 於 2026-09-29 決定把 `node scripts/content-audit.mjs check` 綁進 P3-8，施工單是 feature `069`。這一條以 P3-8 的正本為準：它出現在上面指令的輸出裡，才算條件。

**`067` 的閱讀清單（L 層、H 層）不是 P3-8 的條件。** 它是交給學者的人工查核，見第 5 章。

**分工**：`067` 不掃佔位字串，也不管釋字第 272 號。那兩項是 `056` 的 G-5 與 G-6。

## 8. 缺口

| 缺口 | 擋不到時會怎樣 | 對應 |
|---|---|---|
| 整列刪除沒有預防；同步在筆數下降時照常寫出 | 內容從網站靜默消失，只有 PR diff 看得到 | [`docs/constitution-features/043-sync-row-drop-threshold.md`](../constitution-features/043-sync-row-drop-threshold.md) |
| 試算表內容以 HTML 直接渲染，不淨化 | 能編輯試算表的人，就能讓瀏覽器執行任意 HTML | [`docs/constitution-features/042-sanitize-sheet-html.md`](../constitution-features/042-sanitize-sheet-html.md) |
| 改動後頁面是否正常，沒有可重跑的渲染檢查 | 版面或連結壞掉，要靠人發現。這個工具不做 AI 內容偵測 | [`docs/constitution-features/039-render-check-tool.md`](../constitution-features/039-render-check-tool.md) |
| 審定後不該再變的內容（條文引述、案號）沒有凍結機制 | 審定過的內容隨下一次改動被改寫 | [`docs/constitution-features/047-content-freeze.md`](../constitution-features/047-content-freeze.md) |
| 非 SSOT 內容沒有來源標記，無法查核是誰寫的 | 第三類禁令無法用機器檢查 | [`docs/constitution-features/051-content-provenance-marking.md`](../constitution-features/051-content-provenance-marking.md) |
| 非 SSOT 內容逐項要「搬進 SSOT／標注來源凍結／移除」三選一 | 無來源的內容留在網站上 | [`docs/constitution-features/053-p1-8-non-ssot-content-disposition.md`](../constitution-features/053-p1-8-non-ssot-content-disposition.md) |
| `/opinion-lazybag` 具名大法官的立場沒有出處 | 真實人物的法律立場無從查證 | [`docs/constitution-features/049-opinion-lazybag-content-provenance.md`](../constitution-features/049-opinion-lazybag-content-provenance.md) |
| `/about` 的貢獻者名單是佔位資料 | 佔位內容對外顯示 | [`docs/constitution-features/052-contributors-placeholder.md`](../constitution-features/052-contributors-placeholder.md) |
| 兩列標題相同，同步不擋 | 讀者看到兩則看起來一樣的內容 | [`docs/constitution-features/062-h34-h35-duplicate-title.md`](../constitution-features/062-h34-h35-duplicate-title.md) |
| 釋字第 272 號的內容需要法學確認 | 錯誤的法律內容重新上線。`056` 的 G-6 擋它回到 JSON | 無票：`docs/health-check/TODO.md` 的 P0-2 |
| 保護範圍只到第 1000 列 | 第 1001 列之後，投稿者改得動公式欄與審核欄。升級條件：任一分頁接近 1000 列 | 無票：`docs/health-check/TODO.md` 的 P2-13 |
| Apps Script 沒有標題別名表，同步程式有 | 部署後有人改標題字串，Apps Script 可能無聲失效，同步仍通過，兩邊不會互相提醒 | 無票：`docs/health-check/TODO.md` 的 P2-14 |

**票的進度不寫在本文。** 在 repo 根目錄執行下面的指令，每個票號印一行 `status`、`verdict` 與檔案位置：

```bash
for n in 039 042 043 047 049 050 051 052 053 062 067 069; do f=$(grep -l "^id: $n\$" docs/constitution-features/*.md docs/constitution-features/_archive/*.md 2>/dev/null | head -1); if [ -n "$f" ]; then echo "$n $(grep -m1 '^status:' "$f") $(grep -m1 '^verdict:' "$f") $f"; else echo "$n NOT FOUND"; fi; done
```

指令以 frontmatter 的 `id:` 找檔，不靠檔名。
缺口表新增或刪除一列時，同步修改這條指令的票號清單。

## 9. 本文怎麼保持正確

- **票內改到把關**：workflow 的 `review` 階段依實際交付檢查每張票的 `## Documentation impact`。改動推翻本文某一句，而票沒有列入本文，review 會退件。
- **在 repo 外執行的步驟**（正式試算表部署、Vercel 設定）：`review` 階段在呈交最後一道 gate 前重判文件影響，並列舉仍描述該步驟未發生的句子。條款在 [`docs/constitution-features/README.md`](../constitution-features/README.md) 的 `review` stage。
- **連結失效**：本文列在 [`docs/INDEX.md`](../INDEX.md)，狀態 evergreen。`node scripts/content-audit.mjs check` 的 M6 會指名本文指向已封存檔的那一行。

自查指令（repo 根目錄）：

```bash
node scripts/content-audit.mjs check | grep 'gatekeeping.md'   # 應無輸出
```

以及第 8 章的票況指令。

正本：`docs/constitution-features/054-gatekeeping-overview.md` 的 `## Design` 第一節。
