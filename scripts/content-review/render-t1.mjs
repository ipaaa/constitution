#!/usr/bin/env node
// Render one Track 1 row into a Spacedock Review page.
// Usage: node scripts/content-review/render-t1.mjs <row-id> [<out-file>]
// Reads the SSOT sheet (Track 1_history) read-only via sheet.mjs. Never writes the sheet or src/data/.
//
// Layout (three zones, separated by horizontal rules):
//   1. 使用說明 — H1 inside a quote block (so it renders in the quote's muted color, plus a blue marker): how to review, what to look for, known problems on this page.
//      Not a `##` section, so it needs no sign-off.
//   2. 審閱內容 — top-level H1 with a red marker; mirrors the live card in src/app/past/page.tsx, in the phone order
//      (left panel, then right panel). One `##` section per panel; nothing but site text here.
//   3. 給編輯 — quote block: source snapshot and the sheet column behind each element.
import { writeFileSync } from 'node:fs';
import { loadTrack1, SHEET_NAME, today as readDate, onSite } from './sheet.mjs';

// Live preview deployment (noindex). The past page has no per-entry link; its search box jumps to an entry.
const SITE_PAST_URL = 'https://constitution-nine.vercel.app/past';
const [rowId, outFile] = process.argv.slice(2);
if (!rowId) {
  console.error('usage: render-t1.mjs <row-id> [<out-file>]');
  process.exit(2);
}
const rows = await loadTrack1();
const row = rows.find((r) => r.id === rowId);
if (!row) {
  console.error(`row ${rowId} not found in the Track 1_history sheet`);
  process.exit(1);
}
const t = row.textbook ?? {};
const r = row.reality ?? {};
const has = (v) => Boolean(v && String(v).trim());
const blank = (v) => (has(v) ? String(v).trim() : '（空白）');
// Review renders a single `~` pair as strikethrough; use a full-width tilde.
// The site renders content as HTML; Review shows tags as typed, so drop them.
const safe = (v) => blank(v).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/~/g, '～');
const today = new Date().toISOString().slice(0, 10);
// The sheet marks content, handwriting, title and image_url as 「現有為AI生成」. Assume no human has
// rewritten any of them yet, so every such element carries this tag until the sheet says otherwise.
const AI = '`AI 初擬`';
const ai = (v) => (has(v) ? ` ${AI}` : '');

// Check the background image link so teachers do not have to find a dead link by hand.
async function checkLink(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    return res.ok ? { ok: true } : { ok: false, note: `HTTP ${res.status}` };
  } catch {
    return { ok: null, note: '無法連線檢查' };
  }
}

const problems = [];
const missing = [
  ['分類', row.category], ['年份', r.year], ['解釋字號', r.ruling_id], ['紅線句（事件）', r.ruling],
  ['原則內文', t.content], ['手寫句', t.handwriting], ['大標題', r.title],
].filter(([, v]) => !has(v)).map(([k]) => k);
if (missing.length) problems.push(`尚未填寫：${missing.join('、')}。編輯會補上，補上後請再看一次。`);
// Another row with the same headline (feature 062: h34 and h35). Teachers should propose a distinct one.
const norm = (v) => String(v ?? '').replace(/\s+/g, '');
const twins = has(r.title) ? rows.filter((o) => o.id !== row.id && norm(o.reality?.title) === norm(r.title)).map((o) => o.id) : [];
if (twins.length) problems.push(`大標題與 ${twins.join('、')} 一字不差。請在大標題留言，提出能區分兩則的改法。`);
let image;
if (!has(r.bgImage)) {
  image = '背景圖：（空白）';
  problems.push("右半邊沒有背景圖。");
} else {
  image = `背景圖（網站上會轉成灰階並壓暗）：[打開圖片](${r.bgImage}) ${AI}`;
  const c = await checkLink(r.bgImage);
  if (c.ok === false) problems.push(`背景圖連結打不開（${c.note}），編輯會換圖，不必留言。`);
  if (c.ok === null) problems.push(`產生本頁時背景圖${c.note}，請直接點開確認。`);
}

// Left panel: category badge, optional chapter heading, principle text, handwritten note.
const left = [
  `\`${safe(row.category || '憲法起源')}\``,
  has(t.chapter) ? `### ${safe(t.chapter)}` : null,
  `${safe(t.content)}${ai(t.content)}`,
  // CriticMarkup highlight renders with a blue background on Review Web: the closest to the site's blue handwriting.
  `{==✍ ${safe(t.handwriting)}==}${ai(t.handwriting)}`,
].filter(Boolean).join('\n\n');

// Right panel: background image, year + ruling-id badges, headline, ruling line with red bar.
const right = [
  image,
  [`\`${safe(r.year)}\``, has(r.ruling_id) ? `\`${safe(r.ruling_id)}\`` : null].filter(Boolean).join(' '),
  `### ${safe(r.title)}`,
  has(r.title) ? AI : null,
  `**▍${safe(r.ruling)}**`,
].filter(Boolean).join('\n\n');

const problemLines = problems.length
  ? `>\n${problems.map((p) => `> ⚠ ${p}`).join('\n>\n')}\n`
  : '';

const live = onSite('history.json', row.id);
const searchTerm = has(r.ruling_id) ? safe(r.ruling_id) : safe(r.year);

const md = `> # 🟦 使用說明
>
> 下方「審閱內容」是這則在網站上的樣子，分左、右兩半。請看每一半**說法對不對、讀者會不會誤解**。
>
> **先登入：** 按頁面上名字卡片的「Sign in」，用自己的帳號登入。**沒登入的留言不算數。**
>
> **怎麼留言：** 選取文字 → 輸入 → 按「Add comment」或「Send」。若出現「Submit」，最後按它送出。
>
> | 情況 | 選取 | 寫 |
> |---|---|---|
> | 沒問題 | 該半邊的標題 | \`approved\` |
> | 要修改 | 有問題的字 | 建議改法 |
> | 有疑問 | 有疑問的字 | 你的問題 |
>
> 兩半都 \`approved\` 就完成。頁面上的 Approve 按鈕不用按。
>
> ⚠ **AI 初擬：** 標有 ${AI} 的文字與圖片（原則內文、手寫句、大標題、背景圖）目前由 AI 產生、尚未經真人改寫，請特別查證事實與用詞。
>
${live ? `> [看上線畫面](${SITE_PAST_URL})（在搜尋框輸入「${searchTerm}」）` : '> 這一則還沒上線，沒有上線畫面可對照。'}
${problemLines}
---

# 🟥 審閱內容｜${row.id} ${safe(r.ruling_id)}

## 左半邊｜憲法原則

${left}

## 右半邊｜大法官解釋

${right}

---

> **給編輯**
>
> 試算表分頁 \`Track 1_history\`，列 \`${row.id}\`。第 ${row.sheetRow} 列，試算表狀態 \`${row.status || '空白'}\`。內容直接讀自試算表 ${SHEET_NAME}（${readDate()} 讀取）。修改一律回到試算表。版面對照 \`src/app/past/page.tsx\`。
>
> 預覽元素對應的試算表欄位：
>
> - 左半邊：分類標籤 \`category\`；章節標題 \`textbook.chapter\`（空白則不顯示）；原則內文 \`textbook.content\`；手寫句 \`textbook.handwriting\`
> - 右半邊：背景圖 \`reality.bgImage\`；年份 \`reality.year\`；解釋字號 \`reality.ruling_id\`；大標題 \`reality.title\`；紅線句 \`reality.ruling\`
`;

if (outFile) writeFileSync(outFile, md);
else process.stdout.write(md);
