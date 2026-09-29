#!/usr/bin/env node
/**
 * 全站中文內容的法律事實查核。
 *
 * 規格見 docs/constitution-features/systematic-chinese-content-legal-audit.md 的 `## Design（2026-09-29）`。
 * 界線分三層：
 *   M（機器判）：M1–M6。repo 內有權威來源，判準不需要理解語意。`check` 全過時離開碼 0。
 *   L（機器找、人判）：L1–L4。判不了對錯，但能把講同一件事的句子集中。
 *   H（人讀）：逐檔閱讀清單。錯誤沒有可定位的表面特徵。
 *
 * 用法：
 *   node scripts/content-audit.mjs rules                 列出 M 層規則代號
 *   node scripts/content-audit.mjs check [--root DIR]    跑 M 層。有失敗時離開碼 1，無法執行時 2
 *   node scripts/content-audit.mjs reading-list [--root DIR]   輸出 L 層與 H 層的 markdown
 *
 * `--root` 讓本分支的腳本檢查另一棵樹（例如 git 歷史上的 worktree）。
 * 權威 fixture 一律讀本分支的 tests/fixtures/，受檢的內容與門檻常數讀 `--root`。
 *
 * 每條規則只在本檔定義一次。AC 與文件只引用規則代號，不複製型樣（`066` 第九節的規則）。
 * 本檔不設豁免清單。誤報時改寫原文消除歧義，不加白名單（沿用 scripts/check-voided-floor.mjs 的原則）。
 * 本檔不掃佔位字串、不把釋字第272號列為禁用、不管門檻的時態——那些是 `056` 與 `066` 的網子。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { extractUnits, REPO_ROOT, CJK, HOLE, listFiles } from './content-audit/units.mjs';

const __filename = fileURLToPath(import.meta.url);

// ─── 共用：正規化、號次、紀年 ───────────────────────────────────────────

/** 全形轉半形、去空白。「１１４年憲判字第９號」與「114 年憲判字第 9 號」正規化後相同 */
export const norm = (s) => s.normalize('NFKC').replace(/[\s 　]+/g, '');

/** 釋字號，含範圍寫法 781~783。`號` 可省 */
const INTERP = /釋字第(\d+)(?:[~\-–至](\d+))?號?/g;
/** 憲判字號。`憲判` 與 `憲判字` 同義，`年`、`第`、`號` 可省 */
const JUDG = /(?<!\d)(\d{2,3})年?憲判字?第?(\d+)號?/g;

/** 正規化後的文字裡所有號次。範圍逐號展開 */
export function findDockets(text) {
  const t = norm(text);
  const out = [];
  for (const m of t.matchAll(INTERP)) {
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    for (let n = from; n <= to && n - from < 50; n++) out.push({ kind: '釋字', no: n, label: `釋字第${n}號`, raw: m[0] });
  }
  for (const m of t.matchAll(JUDG)) {
    out.push({ kind: '憲判', roc: Number(m[1]), no: Number(m[2]), label: `${m[1]}年憲判字第${m[2]}號`, raw: m[0] });
  }
  return out;
}

const stripDockets = (t) => t.replace(INTERP, '§').replace(JUDG, '§');

const ROC_MAX = new Date().getFullYear() - 1911;
/** 民國年：明標「民國」、後接月份、或 100 以上的三位數。兩位數而無月份（「任期 8 年」「50 年來」）不算 */
const ROC = /(?:民國(\d{1,3})年|(?<![\d.\-/])(\d{2,3})年(?=\d{1,2}月)|(?<![\d.\-/])(1\d\d)年)((?:\d{1,2}月)?(?:\d{1,2}日)?)/g;
/** 西元年：19xx／20xx 後接年、-MM、.MM、/MM，或前有「西元」 */
const AD = /(?:西元)?(?<!\d)((?:19|20)\d\d)(?=年|[-./]\d|\))/g;

/** 一段正規化、去號次後的文字裡的紀年記號。conv 為緊鄰其後、括號內的換算 */
export function yearTokens(text) {
  const t = stripDockets(norm(text));
  const roc = [];
  for (const m of t.matchAll(ROC)) {
    const year = Number(m[1] ?? m[2] ?? m[3]);
    if (year < 1 || year > ROC_MAX) continue;
    const end = m.index + m[0].length;
    const conv = t.slice(end).match(/^\((?:西元)?(\d{4})/);
    roc.push({ year, ad: year + 1911, index: m.index, end, converted: conv ? Number(conv[1]) === year + 1911 : false });
  }
  const ad = [];
  for (const m of t.matchAll(AD)) {
    const year = Number(m[1]);
    // 緊接在民國年之後括號內的，是換算，不算一個獨立的西元年
    if (roc.some((r) => r.converted && m.index > r.end && m.index <= r.end + 3)) continue;
    const conv = t.slice(m.index + m[0].length).match(/^(?:年)?(?:\d{1,2}月)?(?:\d{1,2}日)?\((?:民國)?(\d{1,3})年?/);
    ad.push({ year, index: m.index, converted: conv ? Number(conv[1]) + 1911 === year : false });
  }
  // 緊接在西元年之後括號內的民國年，同理是換算
  const rocOwn = roc.filter((r) => !ad.some((a) => a.converted && r.index > a.index && r.index <= a.index + 16 && t[r.index - 1] === '('));
  return { roc: rocOwn, ad };
}

/** 年份欄位的值 → 西元年。認西元、民國與 115-08-14 這種民國日期。認不出回 null */
function yearOf(value) {
  const t = norm(String(value));
  let m = t.match(/^(?:西元)?((?:19|20)\d\d)(?!\d)/);
  if (m) return Number(m[1]);
  m = t.match(/^(?:民國)?(\d{2,3})(?:年|[-./]\d)/);
  if (m) return Number(m[1]) + 1911;
  return null;
}

/** 完整年月日 → YYYY-MM-DD。認西元與民國；不完整回 null */
function fullDateOf(value) {
  const t = norm(String(value));
  const m = t.match(/^(?:民國)?(\d{2,4})(?:年|-)(\d{1,2})(?:月|-)(\d{1,2})日?$/);
  if (!m) return null;
  const y = m[1].length === 4 ? Number(m[1]) : Number(m[1]) + 1911;
  return `${y}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

const isCalendarDay = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
};

/** 中文數字（一至九十九）或阿拉伯數字 → 數字 */
function toNumber(s) {
  if (/^\d+$/.test(s)) return Number(s);
  const D = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const [tens, ones] = s.includes('十') ? s.split('十') : ['', s];
  return (s.includes('十') ? (tens ? D[tens] : 1) * 10 : 0) + (ones ? D[ones] : 0);
}

const excerpt = (text, max = 60) => (text.length > max ? `${text.slice(0, max)}…` : text);
const at = (u) => `${u.file}:${u.line}`;

// ─── M 層 ─────────────────────────────────────────────────────────────

const N = '(\\d+|[一二兩三四五六七八九十]+)';
const PEOPLE = '[人位名]';
/** 門檻句型。participants 對 voidedFloor.participants，votes 對 voidedFloor.unconstitutionalityVotes */
const THRESHOLD_FORMS = [
  ['participants', new RegExp(`至少${N}${PEOPLE}(?:大法官)?參與評議`, 'g')],
  ['participants', new RegExp(`${N}${PEOPLE}(?:大法官)?參與評議(?:之)?下限`, 'g')],
  ['participants', new RegExp(`${N}${PEOPLE}門檻`, 'g')],
  ['participants', new RegExp(`參與評議之?(?:大法官)?(?:人數)?不得低於${N}${PEOPLE}`, 'g')],
  ['unconstitutionalityVotes', new RegExp(`至少${N}${PEOPLE}(?:大法官)?同意`, 'g')],
  ['unconstitutionalityVotes', new RegExp(`同意人數不得低於${N}${PEOPLE}`, 'g')],
];

const DATE_KEYS = new Set(['year', 'date', 'rocDate', 'dateLabel']);

export const RULES = [
  {
    id: 'M1',
    title: '號次存在：釋字號在 1–813 內，憲判字（年, 號）在 judgment-dockets.json 內',
    run(units, ctx) {
      const out = [];
      for (const u of units) {
        for (const d of findDockets(u.text)) {
          if (d.kind === '釋字' && !ctx.interpretations.has(d.no)) {
            out.push([u, `${d.label} 不存在（fixture 最大號為 ${ctx.interpretationMax}）`]);
          }
          if (d.kind === '憲判' && !ctx.judgments.has(`${d.roc}-${d.no}`)) {
            const max = ctx.judgmentMaxByYear.get(d.roc);
            out.push([u, `${d.label} 不存在（${max ? `${d.roc} 年只到第 ${max} 號` : `fixture 沒有 ${d.roc} 年的憲判字`}）`]);
          }
        }
      }
      return out;
    },
  },
  {
    id: 'M2',
    title: '號次與年份配對：同一物件內，號次欄位與 year／date／rocDate／dateLabel 欄位的年份一致',
    run(units, ctx) {
      const out = [];
      const byObject = new Map();
      for (const u of units) if (u.object) byObject.set(u.object, [...(byObject.get(u.object) ?? []), u]);
      for (const members of byObject.values()) {
        const dated = members.filter((u) => DATE_KEYS.has(u.key) && yearOf(u.text) !== null);
        if (dated.length === 0) continue;
        for (const u of members) {
          // 號次欄位：整個值就是號次（可帶「判決」或【案名】）。句子裡順帶提到的號次不算
          if (DATE_KEYS.has(u.key) || stripDockets(norm(u.text)).replace(/判決|【[^】]*】|\([^)]*\)/g, '').replace(/[§、,與及]/g, '') !== '') continue;
          for (const d of findDockets(u.text)) {
            const date = d.kind === '釋字' ? ctx.interpretations.get(d.no) : ctx.judgments.get(`${d.roc}-${d.no}`)?.date;
            if (!date) continue; // 不存在的號次是 M1 的事
            for (const y of dated) {
              if (yearOf(y.text) !== Number(date.slice(0, 4))) {
                out.push([u, `${d.label} 作成於 ${date}，同一物件的 ${y.key} 為「${y.text}」（${y.file}:${y.line}）`]);
              }
            }
          }
        }
      }
      return out;
    },
  },
  {
    id: 'M3',
    title: '門檻數值：人數門檻句的數字等於 src/data/ruling-threshold.ts 的 voidedFloor',
    run(units, ctx) {
      if (!ctx.threshold) return [[{ file: 'src/data/ruling-threshold.ts', line: 0 }, '權威來源不存在，M3 無法執行']];
      const out = [];
      for (const u of units) {
        const t = norm(u.text);
        for (const [field, re] of THRESHOLD_FORMS) {
          for (const m of t.matchAll(re)) {
            const n = toNumber(m[1]);
            if (n !== ctx.threshold[field]) out.push([u, `「${m[0]}」的 ${n} 不等於 ${field}＝${ctx.threshold[field]}`]);
          }
        }
      }
      return out;
    },
  },
  {
    id: 'M4',
    title: '日期合法與順序：date 為合法日曆日；完整的 dateLabel 等於 date；含 date 的陣列非遞減',
    run(units) {
      const out = [];
      const byObject = new Map();
      const byArray = new Map();
      for (const u of units) {
        if (u.key !== 'date' && u.key !== 'dateLabel' && u.key !== 'id') continue;
        byObject.set(u.object, { ...byObject.get(u.object), [u.key]: u });
      }
      const name = (u) => byObject.get(u.object)?.id?.text ?? u.path;
      for (const { date, dateLabel } of byObject.values()) {
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date.text)) continue;
        if (!isCalendarDay(date.text)) out.push([date, `date「${date.text}」不是合法日曆日`]);
        const full = dateLabel && fullDateOf(dateLabel.text);
        if (full && full !== date.text) out.push([dateLabel, `dateLabel「${dateLabel.text}」與 date「${date.text}」不同`]);
        if (date.array) byArray.set(date.array[0], [...(byArray.get(date.array[0]) ?? []), date]);
      }
      for (const dates of byArray.values()) {
        dates.sort((a, b) => a.array[1] - b.array[1]);
        for (let i = 1; i < dates.length; i++) {
          const [prev, cur] = [dates[i - 1], dates[i]];
          if (cur.text < prev.text) {
            out.push([cur, `陣列順序倒退：${name(prev)}（${prev.text}，:${prev.line}）排在 ${name(cur)}（${cur.text}，:${cur.line}）之前`]);
          }
        }
      }
      return out;
    },
  },
  {
    id: 'M5',
    title: '同段紀年混用：扣除號次後，同一單元兼有民國年與西元年時，一方須緊鄰另一方的括號換算',
    run(units) {
      const out = [];
      for (const u of units) {
        const { roc, ad } = yearTokens(u.text);
        const bareRoc = roc.filter((r) => !r.converted);
        const bareAd = ad.filter((a) => !a.converted);
        if (bareRoc.length && bareAd.length) {
          out.push([u, `民國 ${[...new Set(bareRoc.map((r) => r.year))].join('、')} 年與西元 ${[...new Set(bareAd.map((a) => a.year))].join('、')} 年同段、未換算：「${excerpt(u.text)}」`]);
        }
      }
      return out;
    },
  },
  {
    id: 'M6',
    title: '封存路徑：src/**、AGENTS.md 與 INDEX 標為 evergreen／plan 的文件裡，路徑不存在且同名檔在 _archive/ 下',
    run(units, ctx) {
      const out = [];
      for (const doc of ctx.documents) {
        doc.text.split('\n').forEach((lineText, i) => {
          for (const m of lineText.matchAll(PATH_REF)) {
            const ref = m[1].replace(/[.,;:)]+$/, '');
            const abs = ref.startsWith('docs/') ? path.join(ctx.root, ref) : path.resolve(path.dirname(path.join(ctx.root, doc.file)), ref);
            if (fs.existsSync(abs)) continue;
            const archived = ctx.archived.get(path.basename(ref));
            if (archived) out.push([{ file: doc.file, line: i + 1 }, `${ref} 已封存，現址 ${archived.join('、')}`]);
          }
        });
      }
      return out;
    },
  },
];

/** 文件裡的路徑：docs/ 開頭，或 ./、../ 開頭的相對路徑。純檔名不算（INDEX 的封存表就是純檔名） */
const PATH_REF = /(?<![\w./-])((?:docs\/|\.\.?\/)[\w./-]+\.[a-z]+)/g;

/** 全部 M 層失敗。同一位置、同一訊息只留一筆（同一字串被兩個匯出共用時會各抽一次） */
export function runCheck(units, ctx) {
  const seen = new Set();
  return RULES.flatMap((rule) => rule.run(units, ctx).map(([u, message]) => ({ rule: rule.id, file: u.file, line: u.line, message }))).filter((f) => {
    const key = `${f.rule} ${f.file}:${f.line} ${f.message}`;
    return !seen.has(key) && seen.add(key);
  });
}

// ─── 權威來源與文件 ─────────────────────────────────────────────────────

export function loadAuthorities() {
  const interp = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tests/fixtures/interpretation-dates.json'), 'utf8'));
  const jud = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tests/fixtures/judgment-dockets.json'), 'utf8'));
  const judgments = new Map(jud.dockets.map(([roc, no, date, name]) => [`${roc}-${no}`, { date, name }]));
  const judgmentMaxByYear = new Map();
  for (const [roc, no] of jud.dockets) judgmentMaxByYear.set(roc, Math.max(no, judgmentMaxByYear.get(roc) ?? 0));
  return {
    interpretations: new Map(interp.interpretations.map(([no, , date]) => [no, date])),
    interpretationMax: Math.max(...interp.interpretations.map(([no]) => no)),
    judgments,
    judgmentMaxByYear,
  };
}

/** M6 掃的文件：src/**、AGENTS.md、docs/INDEX.md 表格裡狀態為 evergreen 或 plan 的檔（不含 _archive/） */
export function loadDocuments(root) {
  const files = new Set(listFiles(path.join(root, 'src'), () => true).map((f) => path.relative(root, f)));
  if (fs.existsSync(path.join(root, 'AGENTS.md'))) files.add('AGENTS.md');
  const index = path.join(root, 'docs/INDEX.md');
  if (fs.existsSync(index)) {
    for (const line of fs.readFileSync(index, 'utf8').split('\n')) {
      const cells = line.split('|').map((c) => c.trim());
      const m = cells[1]?.match(/^`([^`]+)`$/);
      if (!m || !['evergreen', 'plan'].includes(cells[3]) || m[1].includes('_archive/')) continue;
      if (fs.existsSync(path.join(root, m[1])) && fs.statSync(path.join(root, m[1])).isFile()) files.add(m[1]);
    }
  }
  const archived = new Map();
  for (const f of listFiles(path.join(root, 'docs'), () => true)) {
    const rel = path.relative(root, f);
    if (!rel.split(path.sep).includes('_archive')) continue;
    archived.set(path.basename(f), [...(archived.get(path.basename(f)) ?? []), rel]);
  }
  const documents = [...files].sort().map((file) => ({ file, text: fs.readFileSync(path.join(root, file), 'utf8') }));
  return { root, documents, archived };
}

export async function loadContext(root = REPO_ROOT) {
  const thresholdFile = path.join(root, 'src/data/ruling-threshold.ts');
  const threshold = fs.existsSync(thresholdFile) ? (await import(pathToFileURL(thresholdFile).href)).RULING_THRESHOLD?.voidedFloor ?? null : null;
  const launch = path.join(root, 'src/data/launch-status.ts');
  const publicPages = fs.existsSync(launch) ? (await import(pathToFileURL(launch).href)).PUBLIC_PAGES ?? [] : [];
  return { ...loadAuthorities(), ...loadDocuments(root), threshold, publicPages };
}

// ─── L 層與 H 層 ──────────────────────────────────────────────────────

/**
 * L1 的事實群。一組 = 一件事實的所有說法。詞彙群命中且含 require 的句子歸入該組。
 * 新增一組的條件同 M 層：要有一個真實的互斥實例（見規格第二節）。
 */
export const FACT_GROUPS = [
  {
    id: 'L1-a',
    fact: '立法院對大法官人事案做了什麼（不審查、否決、杯葛）',
    evidence: 'controversy-timeline.ts 的 evt-09 寫「不審查」，evt-11 寫「投票否決」',
    words: /同意權|提名|否決|不審查|杯葛/,
    require: /大法官/,
  },
];

/** L3 的現在式與法律狀態詞 */
const PRESENT = /目前|至今|迄今|(?<!出)現在|現行|如今|仍|依然|尚未|持續/;
const LEGAL_STATE = /大法官|憲法法庭|法庭|條文|法律|判決|門檻|審查|釋憲|修法|同意權|缺額|在任|待審|違憲|生效|有效/;

/**
 * `066` 的門檻句判準，從 scripts/check-voided-floor.mjs 原檔讀出，不在本檔另寫一次。
 * L3 排除這些句子——它們的時態已由 `066` 的網子守著。讀不到就停下，不靜默退化。
 */
function voidedFloorThreshold() {
  const file = path.join(REPO_ROOT, 'scripts/check-voided-floor.mjs');
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const regexes = {};
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (d.initializer?.kind === ts.SyntaxKind.RegularExpressionLiteral) {
        const lit = d.initializer.text;
        regexes[d.name.text] = new RegExp(lit.slice(1, lit.lastIndexOf('/')), lit.slice(lit.lastIndexOf('/') + 1));
      }
    }
  }
  const { FLOOR_NUM, FLOOR_WORD, COURT } = regexes;
  if (!FLOOR_NUM || !FLOOR_WORD || !COURT) throw new Error('scripts/check-voided-floor.mjs 的 FLOOR_NUM／FLOOR_WORD／COURT 讀不到，L3 無法排除 066 的門檻句');
  return (s) => (FLOOR_NUM.test(s) || FLOOR_WORD.test(s)) && COURT.test(s);
}

const sentencesOf = (u) =>
  u.text
    .split(/(?<=[。！？；])|\n/)
    .map((s) => s.trim())
    .filter((s) => CJK.test(s))
    .map((s) => ({ ...u, sentence: s }));

/** 靜態 import 圖：每個讀者路由用到哪些來源檔。路由 = src/app 下的 page.tsx 加上它上層的 layout.tsx */
function routesByFile(root) {
  const src = path.join(root, 'src');
  const all = listFiles(src, (n) => /\.(tsx?|json)$/.test(n));
  const resolve = (from, spec) => {
    const base = spec.startsWith('@/') ? path.join(src, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null;
    if (!base) return null;
    return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) ?? null;
  };
  const deps = new Map();
  for (const f of all.filter((f) => !f.endsWith('.json'))) {
    const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
    const out = [];
    (function visit(n) {
      // 型別 import 不帶任何讀者文字；動態 import() 則會
      const spec =
        (ts.isImportDeclaration(n) && !n.importClause?.isTypeOnly) || (ts.isExportDeclaration(n) && !n.isTypeOnly)
          ? n.moduleSpecifier
          : ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword
            ? n.arguments[0]
            : null;
      if (spec && ts.isStringLiteral(spec)) {
        const r = resolve(f, spec.text);
        if (r) out.push(r);
      }
      ts.forEachChild(n, visit);
    })(sf);
    deps.set(f, out);
  }
  const result = new Map();
  for (const page of all.filter((f) => path.basename(f) === 'page.tsx')) {
    const dir = path.dirname(path.relative(path.join(src, 'app'), page));
    const route = dir === '.' ? '/' : `/${dir.split(path.sep).join('/')}`;
    const roots = [page];
    for (let d = path.dirname(page); d.startsWith(path.join(src, 'app')); d = path.dirname(d)) {
      if (fs.existsSync(path.join(d, 'layout.tsx'))) roots.push(path.join(d, 'layout.tsx'));
    }
    const seen = new Set();
    const stack = [...roots];
    while (stack.length) {
      const f = stack.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      stack.push(...(deps.get(f) ?? []));
    }
    for (const f of seen) {
      const rel = path.relative(root, f);
      result.set(rel, [...(result.get(rel) ?? []), route]);
    }
  }
  return result;
}

const cjkCount = (s) => (s.match(new RegExp(CJK.source, 'g')) ?? []).length;

/** 每個含讀者中文的檔 → 讀者文字單元。AC-9 以此對照 H 節 */
export function readerFiles(units) {
  const byFile = new Map();
  for (const u of units.filter((u) => CJK.test(u.text))) byFile.set(u.file, [...(byFile.get(u.file) ?? []), u]);
  return byFile;
}

export function renderReadingList(units, ctx, { commit = '(unknown)', date = new Date().toISOString().slice(0, 10) } = {}) {
  const lines = [];
  const w = (s = '') => lines.push(s);
  const reader = units.filter((u) => CJK.test(u.text));
  const sentences = reader.flatMap(sentencesOf);
  const routes = routesByFile(ctx.root);
  const isPublic = (file) => (routes.get(file) ?? []).some((r) => ctx.publicPages.includes(r));

  w(`# 內容查核閱讀清單（${date}）`);
  w();
  w(`產生於 commit \`${commit}\`。重跑：\`node scripts/content-audit.mjs reading-list > <檔名>\`。`);
  w('規格見 `docs/constitution-features/systematic-chinese-content-legal-audit.md`（本票 `067`）。');
  w('M 層（機器判）不在本清單。跑 `node scripts/content-audit.mjs check` 看 M 層結果。');
  w('修正途徑欄：`PR` 表示改原始碼；`改試算表` 表示該檔是試算表同步的產物，不得手改（`AGENTS.md` 第 2 條）。');
  w();

  w('## L1 同一事實的所有敘述');
  w();
  w('同一組內的句子描述同一件事。逐句對照，判斷是否互斥。');
  for (const g of FACT_GROUPS) {
    const hits = sentences.filter((s) => g.words.test(s.sentence) && g.require.test(s.sentence));
    w();
    w(`### ${g.id}：${g.fact}（${hits.length} 句）`);
    w();
    w(`建組依據：${g.evidence}。`);
    w();
    for (const s of hits) w(`- [ ] \`${at(s)}\`（${s.route}）${s.sentence}`);
  }
  w();

  w('## L2 號次與案名');
  w();
  w('每個號次的全部出現處，與官方案名並排。判斷敘述的主題是否就是該號次的案件。');
  w('釋字的官方案名不在 fixture 內，只列出現處。');
  const byDocket = new Map();
  for (const s of sentences) for (const d of findDockets(s.sentence)) {
    const key = d.label;
    const entry = byDocket.get(key) ?? { d, hits: [] };
    if (!entry.hits.some((h) => h.file === s.file && h.line === s.line && h.sentence === s.sentence)) entry.hits.push(s);
    byDocket.set(key, entry);
  }
  const docketOrder = [...byDocket.values()].sort((a, b) => (a.d.kind === b.d.kind ? (a.d.roc ?? 0) - (b.d.roc ?? 0) || a.d.no - b.d.no : a.d.kind === '憲判' ? -1 : 1));
  for (const { d, hits } of docketOrder) {
    const official = d.kind === '憲判' ? ctx.judgments.get(`${d.roc}-${d.no}`) : null;
    const date = d.kind === '釋字' ? ctx.interpretations.get(d.no) : official?.date;
    w();
    w(`### ${d.label}${official ? `【${official.name}】` : ''}${date ? `（${date}）` : '（fixture 無此號，見 M1）'}`);
    w();
    for (const s of hits) w(`- [ ] \`${at(s)}\` ${excerpt(s.sentence, 90)}`);
  }
  w();

  const floor = voidedFloorThreshold();
  const present = sentences.filter((s) => PRESENT.test(s.sentence) && LEGAL_STATE.test(s.sentence) && !floor(norm(s.sentence)));
  w(`## L3 現在式的法律狀態（${present.length} 句）`);
  w();
  w('句中有「目前／至今／仍」等詞，且講的是法律或法庭的狀態。判斷它在今日是否仍為真。');
  w('已排除 `scripts/check-voided-floor.mjs` 的門檻句（`066` 的網子）。');
  w();
  for (const s of present) w(`- [ ] \`${at(s)}\`（${s.route}）${s.sentence}`);
  w();

  w('## L4 全站紀年盤點');
  w();
  w('逐檔列出民國與西元紀年各幾處（已扣除判決字號）。全站用哪一套是編輯決定，待 captain 拍板。');
  w('`M5` 只管同一段內的混用；本表管全站的一致性。');
  w();
  w('| 檔 | 民國 | 西元 | 民國年出現處（行） |');
  w('|---|---|---|---|');
  for (const [file, us] of readerFiles(units)) {
    let roc = 0;
    let ad = 0;
    const rocLines = new Set();
    for (const u of us) {
      const t = yearTokens(u.text);
      roc += t.roc.length;
      ad += t.ad.length;
      if (t.roc.length) rocLines.add(u.line);
    }
    if (roc || ad) w(`| \`${file}\` | ${roc} | ${ad} | ${[...rocLines].sort((a, b) => a - b).join(', ')} |`);
  }
  w();

  const files = [...readerFiles(units)].map(([file, us]) => ({
    file,
    chars: cjkCount([...new Set(us.map((u) => u.text))].join('')),
    holes: us.filter((u) => u.text.includes(HOLE)).length,
    routes: (routes.get(file) ?? []).sort(),
    public: isPublic(file),
    route: us[0].route,
  }));
  files.sort((a, b) => Number(b.public) - Number(a.public) || b.chars - a.chars);
  const total = files.reduce((s, f) => s + f.chars, 0);
  w(`## H 逐檔閱讀清單（${files.length} 檔，約 ${total.toLocaleString('en-US')} 字）`);
  w();
  w('因果敘述（H1）、法律效果的精確度（H2）、語氣與立場（H3）沒有表面特徵可定位，只能逐檔讀。');
  w(`公開頁面（\`PUBLIC_PAGES\`：${ctx.publicPages.join('、')}）用到的檔排在前面。`);
  w(`「⟦⟧」欄是抽取時無法代入的插值數。那些位置的文字機器看不到，M 層也看不到，要讀原始碼。`);
  w();
  w('| 讀完 | 檔 | 字數 | 公開 | 修正途徑 | ⟦⟧ | 用到它的路由 |');
  w('|---|---|---|---|---|---|---|');
  for (const f of files) {
    w(`| [ ] | \`${f.file}\` | ${f.chars} | ${f.public ? '是' : ''} | ${f.route} | ${f.holes || ''} | ${f.routes.join(' ') || '（沒有路由 import 它，讀者目前看不到）'} |`);
  }
  return lines.join('\n') + '\n';
}

// ─── CLI ──────────────────────────────────────────────────────────────

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const rootFlag = rest.indexOf('--root');
  const root = rootFlag >= 0 ? path.resolve(rest[rootFlag + 1]) : REPO_ROOT;

  if (cmd === 'rules') {
    for (const r of RULES) process.stdout.write(`${r.id}\t${r.title}\n`);
    return;
  }
  if (cmd !== 'check' && cmd !== 'reading-list') {
    process.stderr.write('usage: node scripts/content-audit.mjs rules | check [--root DIR] | reading-list [--root DIR]\n');
    process.exit(2);
  }

  const units = await extractUnits(root);
  const ctx = await loadContext(root);

  if (cmd === 'reading-list') {
    let commit = '(unknown)';
    try {
      commit = execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    } catch {}
    process.stdout.write(renderReadingList(units, ctx, { commit }));
    return;
  }

  const findings = runCheck(units, ctx);
  for (const f of findings) process.stdout.write(`${f.rule} ${f.file}:${f.line}  ${f.message}\n`);
  const counts = RULES.map((r) => `${r.id}=${findings.filter((f) => f.rule === r.id).length}`).join(' ');
  process.stdout.write(`\n${findings.length ? 'FAIL' : 'PASS'} ${counts}（${units.length} 個文字單元，${ctx.documents.length} 份文件）\n`);
  if (!ctx.threshold) process.exit(2);
  process.exit(findings.length ? 1 : 0);
}

if (process.argv[1] === __filename) {
  await main();
}
