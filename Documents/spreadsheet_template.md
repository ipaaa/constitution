# 📊 Google Spreadsheet 範本資料 (Spreadsheet Template Data)

您可以直接根據下方的資料格式建立您的 Google Spreadsheet，或將下方的 CSV 內容儲存為 `.csv` 檔案後匯入。

---

## 📖 分頁 1：Track 1 - 過去 (History)

### 範本表格 (複製到 Excel/Sheets 用)
| id | chapter | content | handwriting | year | title | ruling | image_url |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| h1 | 第六課：民主政治與選舉 | 我國實行民主共和，主權在民。人民有權透過<span class="textbook-highlight">自由、平等的定期選舉</span>，選出中央與地方公職人員。 | 但曾經，國會議員是不用改選的！ | 1990 | 你能親手選出新國會，終結萬年國代。 | 野百合學運・釋字第 261 號・終結中央民意代表無限期延任 | https://images.unsplash.com/photo-1596701192534-77db54be22b9?q=80&w=2070&auto=format&fit=crop |
| h2 | 第十章：基本人權保障 | 憲法第十一條規定人民有言論、講學、著作及出版之自由。國家應給予最大限度之維護。 | 以前說實話可能會被抓去關？ | 1991 | 你不再因為思想不同而被判定為叛亂罪。 | 廢除刑法100條運動・保障和平表達政治異議的自由 | https://images.unsplash.com/photo-1552872673-9b7b99711ebb?q=80&w=2070&auto=format&fit=crop |

### CSV 格式 (匯入用)
```csv
id,chapter,content,handwriting,year,title,ruling,image_url
h1,第六課：民主政治與選舉,"我國實行民主共和，主權在民。人民有權透過<span class=""textbook-highlight"">自由、平等的定期選舉</span>，選出中央與地方公職人員。",但曾經，國會議員是不用改選的！,1990,你能親手選出新國會，終結萬年國代。,野百合學運・釋字第 261 號・終結中央民意代表無限期延任,https://images.unsplash.com/photo-1596701192534-77db54be22b9?q=80&w=2070&auto=format&fit=crop
h2,第十章：基本人權保障 (言論自由),憲法第十一條規定人民有言論、講學、著作及出版之自由。國家應給予最大限度之維護。,以前說實話可能會被抓去關？,1991,你不再因為思想不同而被判定為叛亂罪。,廢除刑法100條運動・保障和平表達政治異議的自由,https://images.unsplash.com/photo-1552872673-9b7b99711ebb?q=80&w=2070&auto=format&fit=crop
```

---

## 📰 分頁 2：Track 2 - 現在 (Present)

### 範本表格 (複製到 Excel/Sheets 用)
| id | category | title | author | year | status | abstract | link | views | owl_comment | vibe |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| d1 | NGO Reports | 國會擴權法案憲法法庭判決評析 | 民間司法改革基金會 | 2024 | Approved | 針對立法院職權行使法修法引發的釋憲案，探討藐視國會罪。 | https://www.jrf.org.tw/ | | 貓頭鷹法官：這題超紅！簡單說就是立法院權力不能大過頭喔！ | 🔥 戰火猛烈 |
| d2 | Scholar Articles | 死刑合憲性審查與「情節最重大之罪」 | 法律白話文運動 | 2024 | Approved | 憲法法庭113年憲判字第8號判決深入解析：死刑雖然合憲。 | https://plainlaw.me/ | | 貓頭鷹：死刑合憲但變得很難判，大法官在玩平衡感呢！ | 💡 腦袋升級 |
| d5 | Reels | 1分鐘看懂114年憲判字第1號！ | 司改會 | 2025 | Approved | 快速了解最新判決的5個重點，不再被複雜的法律用語卡住！ | https://www.facebook.com/reel/1702284921181677 | 45600 | | 📣 白話必讀 |

### CSV 格式 (匯入用)
```csv
id,category,title,author,year,status,abstract,link,views,owl_comment,vibe
d1,NGO Reports,國會擴權法案憲法法庭判決評析,民間司法改革基金會,2024,Approved,針對立法院職權行使法修法引發的釋憲案，探討「藐視國會罪」等核心爭議對權力分立的影響與憲法法庭的核心見解。,https://www.jrf.org.tw/,,貓頭鷹法官：這題超紅！簡單說就是立法院權力不能大過頭喔！,🔥 戰火猛烈
d2,Scholar Articles,死刑合憲性審查與「情節最重大之罪」,法律白話文運動,2024,Approved,憲法法庭113年憲判字第8號判決深入解析：死刑雖然合憲，但實質限縮了適用範圍。這對台灣法制有何深遠影響？,https://plainlaw.me/,,貓頭鷹：死刑合憲但變得很難判，大法官在玩平衡感呢！,💡 腦袋升級
d5,Reels,1分鐘看懂114年憲判字第1號！,司改會,2025,Approved,快速了解最新判決的5個重點，不再被複雜的法律用語卡住！,https://www.facebook.com/reel/1702284921181677,45600,,📣 白話必讀
```

---

## 💡 使用建議
1. **凍結首列**：在 Google Sheets 建議執行「查看 > 凍結 > 1 列」，方便滾動查看。
2. **鎖定 Status 欄位**：您可以將 `status` 欄位設為「資料驗證」下拉選單（值為：Draft, Needs Review, Approved）。
3. **新增 owl_comment**：這是給「貓頭鷹法官」的白話總結。如果您在某列填寫了此欄位，網頁上就會出現可愛的貓頭鷹點評泡泡喔！
4. **圖片網址**：`image_url` 可以直接使用 Unsplash 的連結，或您專案內的靜態路徑。
