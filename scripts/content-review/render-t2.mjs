#!/usr/bin/env node
// Render one Track 2 row (SSOT sheet, Track 2_discussion + TL;DR tab) into a Spacedock Review page.
// Usage: node scripts/content-review/render-t2.mjs <row-id> [<out-file>]
// Reads the SSOT sheet read-only via sheet.mjs. Never writes the sheet or src/data/.
//
// Layout mirrors the live article page src/app/present/[id]/page.tsx, top to bottom:
//   🟦 使用說明 (quote, no sign-off) → 🟥 審閱內容 with one `##` section per block a teacher judges:
//   出處資訊 (vibe, date, title, author, category, source link), 重點整理 (abstract),
//   貓頭鷹短評 (owl_comment; omitted when empty, as on the site) → 給編輯 (quote).
// 貓頭鷹短評 is tagged `AI 初擬` (captain 2026-11-25, docs/health-check/TODO.md P1-6).
// The `tldr` row renders as the list page's 1-minute summary box instead.
import { writeFileSync } from 'node:fs';
import { loadTrack2, SHEET_NAME, today as readDate, onSite } from './sheet.mjs';

const SITE = 'https://constitution-nine.vercel.app';
const [rowId, outFile] = process.argv.slice(2);
if (!rowId) {
  console.error('usage: render-t2.mjs <row-id> [<out-file>]');
  process.exit(2);
}
const rows = await loadTrack2();
const row = rows.find((r) => r.id === rowId);
if (!row) {
  console.error(`row ${rowId} not found in the Track 2 sheet`);
  process.exit(1);
}
const has = (v) => Boolean(v && String(v).trim());
// Review renders a single `~` pair as strikethrough; use a full-width tilde.
const safe = (v) => (has(v) ? String(v).trim() : '（空白）').replace(/~/g, '～');
const categoryLabel = { 'Scholar Articles': '學者文章', 'NGO Reports': '民間報告', Reels: '影片', 'Official TL;DR': '1 分鐘看懂' };
const cat = categoryLabel[row.category] ?? safe(row.category);
const isTldr = row.id === 'tldr';

// Many hosts (Facebook, YouTube) refuse automated checks, so only a clear 404/410 counts as broken.
async function checkLink(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
    if (res.status === 404 || res.status === 410) return { broken: true, note: `HTTP ${res.status}` };
    return { broken: false };
  } catch {
    return { broken: false };
  }
}
const problems = [];
if (!has(row.link)) problems.push('沒有原始出處連結。');
else if ((await checkLink(row.link)).broken) problems.push('原始出處連結打不開，編輯會處理，不必留言。');
const missing = (isTldr ? [['標題', row.title], ['重點', row.abstract]] : [['標題', row.title], ['作者', row.author], ['日期', row.year], ['重點整理', row.abstract], ['標籤（vibe）', row.vibe]])
  .filter(([, v]) => !has(v)).map(([k]) => k);
if (missing.length) problems.push(`尚未填寫：${missing.join('、')}。編輯會補上，補上後請再看一次。`);

const live = isTldr ? `${SITE}/present#tldr` : `${SITE}/present/${row.id}`;
const sections = isTldr
  ? [
      {
        title: '1 分鐘看懂',
        focus: '標題與每一點的說法正確嗎？讀者會不會誤解？',
        body: `### ${safe(row.title)}\n\n${safe(row.abstract).split(/\r?\n/).filter((l) => l.trim()).map((l) => `- ${l.trim()}`).join('\n')}\n\n出處：[看原始出處](${row.link})`,
      },
    ]
  : [
      {
        title: '出處資訊',
        body: `${has(row.vibe) ? `\`${safe(row.vibe)}\` ` : ''}\`${safe(row.year)}\`\n\n### ${safe(row.title)}\n\n**${safe(row.author)}** · 分類：${cat}\n\n${has(row.link) ? `[看原始出處](${row.link})` : '（沒有原始出處連結）'}`,
      },
      { title: '重點整理', body: `**▍${safe(row.abstract)}**` },
      ...(has(row.owl_comment) ? [{ title: '貓頭鷹短評', body: `{==🦉 ${safe(row.owl_comment)}==} \`AI 初擬\`` }] : []),
    ];

const names = sections.map((s) => `「${s.title}」`).join('、');
const focus = isTldr
  ? '每一點說法對不對、讀者會不會誤解'
  : '出處資訊是否正確、重點整理是否忠於原文、短評是否恰當';
const problemLines = problems.length ? `>\n${problems.map((p) => `> ⚠ ${p}`).join('\n>\n')}\n` : '';
const content = sections.map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');

const md = `> # 🟦 使用說明
>
> 下方「審閱內容」是這則在網站上的樣子，共 ${sections.length} 節：${names}。請看**${focus}**。需要時先點「看原始出處」對照原文。
>
${has(row.owl_comment) ? '> ⚠ **AI 初擬：** 標有 `AI 初擬` 的貓頭鷹短評目前視為 AI 產生、尚未經真人改寫，請特別查證事實與用詞。\n>\n' : ''}> **先登入：** 按頁面上名字卡片的「Sign in」，用自己的帳號登入。**沒登入的留言不算數。**
>
> **怎麼留言：** 選取文字 → 輸入 → 按「Add comment」或「Send」。若出現「Submit」，最後按它送出。
>
> | 情況 | 選取 | 寫 |
> |---|---|---|
> | 沒問題 | 該節的標題 | \`approved\` |
> | 要修改 | 有問題的字 | 建議改法 |
> | 有疑問 | 有疑問的字 | 你的問題 |
>
> 每一節都 \`approved\` 就完成。頁面上的 Approve 按鈕不用按。
>
${onSite('discussions.json', row.id) ? `> [看上線畫面](${live})` : '> 這一則還沒上線，沒有上線畫面可對照。'}
${problemLines}
---

# 🟥 審閱內容｜${row.id} ${cat}

${content}

---

> **給編輯**
>
> 試算表分頁 \`${row.tab ?? 'Track 2_discussion'}\`，列 \`${row.id}\`（第 ${row.sheetRow} 列），試算表狀態 \`${row.status || '空白'}\`。內容直接讀自試算表 ${SHEET_NAME}（${readDate()} 讀取）。修改一律回到試算表。版面對照 \`src/app/present/[id]/page.tsx\`${isTldr ? '（tldr 對照列表頁的「1 分鐘看懂」）' : ''}。
>
> 預覽元素對應的試算表欄位：${isTldr ? '標題 `title`；各點 `abstract`（每行一點）；出處 `link`' : '標籤 `vibe`；日期 `year`；標題 `title`；作者 `author`；分類 `category`；原始出處 `link`；重點整理 `abstract`；貓頭鷹短評 `owl_comment`'}
`;

if (outFile) writeFileSync(outFile, md);
else process.stdout.write(md);
