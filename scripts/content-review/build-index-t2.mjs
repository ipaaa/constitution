#!/usr/bin/env node
// Build docs/content-review/INDEX-T2.md for Track 2 from the SSOT sheet (Track 2_discussion + TL;DR tab).
// Usage: node scripts/content-review/build-index-t2.mjs
// Layout: 🟦 使用說明 (quote) + 🟥 審閱清單, grouped by the site's categories.
// Share links come from links.local.json; INDEX-T2.md is git-ignored (the repo is public).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../../docs/content-review/', import.meta.url));
import { loadTrack2 } from './sheet.mjs';
const rows = await loadTrack2();
const linksFile = join(dir, 'links.local.json');
const links = existsSync(linksFile) ? JSON.parse(readFileSync(linksFile, 'utf8')) : {};

const fm = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0 || line.startsWith(' ')) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"')) v = JSON.parse(v);
    out[line.slice(0, i).trim()] = v;
  }
  return out;
};
// Sign-off for the current version: ✓ rows over all rows of the last 「各節專家簽核」 table.
const signoff = (text, version) => {
  const at = text.lastIndexOf(`### 各節專家簽核（版本 ${version}）`);
  if (at < 0) return { done: 0, total: 0 };
  const lines = text.slice(at).split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| 節') && !l.startsWith('|---'));
  return { done: lines.filter((l) => l.includes('✓')).length, total: lines.length };
};
const clean = (v) => String(v ?? '').trim().replace(/~/g, '～').replace(/\|/g, '｜');
const short = (v, n = 18) => {
  const s = clean(v);
  return [...s].length > n ? [...s].slice(0, n).join('') + '…' : s;
};
const decision = { approve: '已核可', revise: '退回修改', hold: '暫緩', '': '—' };
const groups = [
  ['Official TL;DR', '1 分鐘看懂'],
  ['NGO Reports', '民間報告'],
  ['Scholar Articles', '學者文章'],
  ['Reels', '影片'],
];

const articles = rows
  .filter((r) => existsSync(join(dir, r.id, 'index.md')))
  .map((r) => {
    const text = readFileSync(join(dir, r.id, 'index.md'), 'utf8');
    const meta = fm(text);
    return { r, meta, sign: signoff(text, meta['review-version']) };
  });
const total = articles.length;
const fullySigned = articles.filter((a) => a.sign.total > 0 && a.sign.done === a.sign.total).length;
const approved = articles.filter((a) => a.meta['owner-decision'] === 'approve').length;
const today = new Date().toISOString().slice(0, 10);

const tables = groups
  .map(([key, label]) => {
    const list = articles.filter((a) => a.r.category === key);
    if (!list.length) return null;
    const lines = list.map((a) => {
      const url = links[a.r.id]?.['review-url'];
      const link = url ? `[審閱 v${a.meta['review-version']}](${url})` : '（找不到連結）';
      return `| ${a.r.id} | ${short(a.r.title)} | ${clean(a.r.author)} | ${a.sign.done}／${a.sign.total} 節 | ${decision[a.meta['owner-decision'] ?? ''] ?? a.meta['owner-decision']} | ${link} |`;
    });
    return `## ${label}（${list.length} 則）

| 列 | 標題 | 作者 | 老師簽核 | 編輯決定 | 審閱頁 |
|---|---|---|---|---|---|
${lines.join('\n')}`;
  })
  .filter(Boolean)
  .join('\n\n');

const md = `> # 🟦 使用說明
>
> 這是 T2（現在）全部 ${total} 則的目錄，依網站分類分組。點「審閱」進入各則，照該頁說明留言。
>
> 「老師簽核」是已有登入帳號 \`approved\` 的節數；「編輯決定」是責任編輯在各則頁面的決定。這一頁不需要留言。
>
> 更新於 ${today}。

---

# 🟥 審閱清單

| 進度 | 則數 |
|---|---|
| 老師每節都簽核 | ${fullySigned} / ${total} |
| 編輯已核可 | ${approved} / ${total} |

${tables}
`;
writeFileSync(join(dir, 'INDEX-T2.md'), md);
console.log(`wrote INDEX-T2.md (${total} articles)`);
