// Read the SSOT spreadsheet (SSOT_收集區) for review pages. Read-only.
//
// Uses the same published CSV URLs as the site sync (TRACK_1_CSV_URL, TRACK_2_CSV_URL,
// SITE_TLDR_CSV_URL in .env.local). Unlike the sync, it keeps every row that has content,
// whatever its status: rows still at "Needs review" are exactly the ones teachers must see.
// It never writes to the sheet or to src/data/.
//
// Rows come back in the shapes the renderers already use (history.json / discussions.json),
// plus `status` and `sheetRow` (the row number in the sheet, header = row 1).
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const ROOT = new URL('../../', import.meta.url);
const CACHE_MS = 10 * 60 * 1000;

function envUrl(name) {
  const text = readFileSync(new URL('.env.local', ROOT), 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*["']?([^"'\s]+)/);
    if (m && m[1] === name) return m[2];
  }
  throw new Error(`${name} is not set in .env.local`);
}

// RFC 4180: quoted fields may hold commas, quotes ("") and newlines.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Fetch once and reuse for 10 minutes, so rendering 60 pages reads the sheet once.
async function fetchCsv(name) {
  const url = envUrl(name);
  const dir = join(tmpdir(), 'content-review-sheet');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, createHash('sha256').update(url).digest('hex').slice(0, 16) + '.csv');
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < CACHE_MS) return readFileSync(file, 'utf8');
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  writeFileSync(file, text);
  return text;
}

// Header cells look like `content（現有為AI生成）` or `status\n（權限保護）`: keep the field name.
const fieldName = (h) => h.split(/[（(\s]/)[0].trim();

async function records(name) {
  const rows = parseCsv(await fetchCsv(name));
  const header = rows[0].map(fieldName);
  return rows.slice(1).map((cells, i) => {
    const rec = { sheetRow: i + 2 };
    header.forEach((h, j) => { if (h && !(h in rec)) rec[h] = (cells[j] ?? '').replace(/\s+$/, ''); });
    return rec;
  });
}

const has = (v) => Boolean(v && String(v).trim());
// The header id cell is `id(給系統看的編號)` in Track 1.
const idOf = (rec) => (rec.id ?? rec[Object.keys(rec).find((k) => k.startsWith('id'))] ?? '').trim();

export const SHEET_NAME = 'SSOT_收集區';
export const today = () => new Date().toISOString().slice(0, 10);

export async function loadTrack1() {
  const fields = ['category', 'year', 'ruling_id', 'ruling', 'content', 'handwriting', 'title', 'image_url', 'chapter'];
  return (await records('TRACK_1_CSV_URL'))
    .map((rec) => ({ ...rec, id: idOf(rec) }))
    .filter((rec) => rec.id && fields.some((f) => has(rec[f])))
    .map((rec) => ({
      id: rec.id,
      category: rec.category,
      status: rec.status,
      sheetRow: rec.sheetRow,
      textbook: { content: rec.content, handwriting: rec.handwriting, chapter: rec.chapter },
      reality: { year: rec.year, title: rec.title, ruling: rec.ruling, ruling_id: rec.ruling_id, bgImage: rec.image_url },
    }));
}

export async function loadTrack2() {
  const content = ['title', 'author', 'link', 'abstract', 'owl_comment'];
  const rows = (await records('TRACK_2_CSV_URL'))
    .filter((rec) => has(rec.id) && content.some((f) => has(rec[f])))
    .map((rec) => ({
      id: rec.id.trim(),
      category: rec.category,
      title: rec.title,
      author: rec.author,
      year: rec.year,
      link: rec.link,
      abstract: rec.abstract,
      owl_comment: rec.owl_comment,
      vibe: rec.vibe,
      sticky: /^true$/i.test(rec.sticky ?? ''),
      status: rec.status,
      sheetRow: rec.sheetRow,
    }));
  // The 1-minute summary lives in its own tab: order 0 = title and link, order ≥ 1 = points.
  const tldr = (await records('SITE_TLDR_CSV_URL')).filter((rec) => /^\d+$/.test(rec.order ?? ''));
  const head = tldr.find((rec) => rec.order === '0');
  if (head) {
    const points = tldr.filter((rec) => rec.order !== '0').sort((a, b) => +a.order - +b.order);
    rows.push({
      id: 'tldr',
      category: 'Official TL;DR',
      title: head.text,
      author: '憲庭加好友',
      year: '',
      link: head.link,
      abstract: points.map((p) => `**${p.label}**：${p.text}`).join('\n'),
      owl_comment: '',
      vibe: '',
      sticky: false,
      status: [...new Set(tldr.map((r) => r.status))].join('／'),
      sheetRow: `${head.sheetRow}–${Math.max(...tldr.map((r) => r.sheetRow))}`,
      tab: 'TL;DR 分頁',
    });
  }
  return rows;
}

// Is the row on the site today? The site shows what src/data/*.json holds (read-only here).
// The sheet's status column is not reliable for this: the published CSV can show 「載入中…」.
export function onSite(file, id) {
  const rows = JSON.parse(readFileSync(new URL(`src/data/${file}`, ROOT), 'utf8'));
  return rows.some((r) => r.id === id);
}
