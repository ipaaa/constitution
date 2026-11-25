#!/usr/bin/env node
// Build docs/content-review/INDEX.md from each article's index.md and src/data/history.json.
// Usage: node scripts/content-review/build-index.mjs
// Layout: 🟦 使用說明 (quote) + 🟥 審閱清單, grouped by decade like the site's /past page.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../../docs/content-review/', import.meta.url));
const rows = JSON.parse(readFileSync(new URL('../../src/data/history.json', import.meta.url), 'utf8'));
const byId = new Map(rows.map((r) => [r.id, r]));
// Share links live in links.local.json (not in git: the repo is public). INDEX.md is git-ignored too.
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
// Sign-off for the current version: the rows of the last 「各節專家簽核」 table.
const signoff = (text, version) => {
  const at = text.lastIndexOf(`### 各節專家簽核（版本 ${version}）`);
  if (at < 0) return '—';
  const table = text.slice(at).split('\n').filter((l) => /^\| [左右]半邊/.test(l));
  if (table.length !== 2) return '—';
  const mark = (l) => (l.includes('✓') ? '✓' : '—');
  return `左 ${mark(table[0])}／右 ${mark(table[1])}`;
};
const clean = (v) => String(v ?? '').trim().replace(/~/g, '～').replace(/\|/g, '｜');
const short = (v, n = 16) => {
  const s = clean(v);
  return [...s].length > n ? [...s].slice(0, n).join('') + '…' : s;
};
const decision = { approve: '已核可', revise: '退回修改', hold: '暫緩', '': '—' };

const articles = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join(dir, d.name, 'index.md')))
  .map((d) => {
    const text = readFileSync(join(dir, d.name, 'index.md'), 'utf8');
    const meta = fm(text);
    const row = byId.get(d.name) ?? { reality: {}, textbook: {} };
    return { slug: d.name, meta, row, sign: signoff(text, meta['review-version']), year: parseInt(row.reality.year, 10) || 0 };
  })
  .sort((a, b) => a.year - b.year || a.slug.localeCompare(b.slug, 'en', { numeric: true }));

const groups = new Map();
for (const a of articles) {
  const decade = Math.floor(a.year / 10) * 10;
  if (!groups.has(decade)) groups.set(decade, []);
  groups.get(decade).push(a);
}

const count = (f) => articles.filter(f).length;
const total = articles.length;
const bothSigned = count((a) => a.sign === '左 ✓／右 ✓');
const approved = count((a) => a.meta['owner-decision'] === 'approve');
const today = new Date().toISOString().slice(0, 10);

const tables = [...groups.entries()]
  .map(([decade, list]) => {
    const lines = list.map((a) => {
      const r = a.row.reality;
      const url = links[a.slug]?.['review-url'];
      const link = url ? `[審閱 v${a.meta['review-version']}](${url})` : '（找不到連結）';
      return `| ${a.slug} | ${clean(r.ruling_id) || clean(r.year)} | ${short(r.title)} | ${a.sign} | ${decision[a.meta['owner-decision'] ?? ''] ?? a.meta['owner-decision']} | ${link} |`;
    });
    return `## ${decade}s（${list.length} 則）

| 列 | 字號 | 標題 | 老師簽核 | 編輯決定 | 審閱頁 |
|---|---|---|---|---|---|
${lines.join('\n')}`;
  })
  .join('\n\n');

const md = `> # 🟦 使用說明
>
> 這是 T1（歷史）全部 ${total} 則的目錄，依年代分組，和網站「過去」頁相同。點「審閱」進入各則，照該頁說明留言。
>
> 「老師簽核」是左、右兩半是否已有登入帳號留下的 \`approved\`；「編輯決定」是責任編輯在各則頁面的決定。這一頁不需要留言。
>
> 更新於 ${today}。

---

# 🟥 審閱清單

| 進度 | 則數 |
|---|---|
| 老師兩半都簽核 | ${bothSigned} / ${total} |
| 編輯已核可 | ${approved} / ${total} |

${tables}
`;
writeFileSync(join(dir, 'INDEX.md'), md);
console.log(`wrote INDEX.md (${total} articles, ${groups.size} decades)`);
