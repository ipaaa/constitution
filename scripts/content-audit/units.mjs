/**
 * 把站上讀者看得到的文字切成「文字單元」，供 scripts/content-audit.mjs 的規則與清單使用。
 *
 * 規格見 docs/constitution-features/systematic-chinese-content-legal-audit.md 的 `### 五、Component hierarchy`。
 *
 * 三種來源，三種抽法：
 *   1. src/data/**\/*.ts：經 tests/tsx-loader.mjs 動態 import，走訪本模組宣告的匯出值。
 *      樣板字串已在執行期展開。行號由原始碼的 AST 對回。
 *   2. src/data/*.json：以 AST 解析後走訪。**唯讀。** 這兩個檔是試算表同步的產物。
 *   3. src/**\/*.tsx：以 AST 取 JSX 的文字與字串常值。
 *      `{識別字}` 若來自 `@/data/*` 且值為字串或數字，就代入實際值；其餘標成 `⟦⟧`。
 *
 * 每個單元帶：
 *   file   相對於 root 的路徑
 *   line   讀者文字起始的行號
 *   text   單元文字
 *   route  修正途徑。`.json` 為「改試算表」（AGENTS.md 第 2 條），其餘為「PR」
 *   key    若單元是物件欄位的值，為欄位名；否則為 null
 *   object 同一物件內的單元共用同一個值；M2 靠它判斷「同一物件」
 *   array  物件若是陣列元素，為該陣列的識別與索引 [id, index]；M4 靠它判斷順序
 *   path   人看的位置，例如 TIMELINE_EVENTS[8].date
 */
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOLE = '⟦⟧';
export const CJK = /[㐀-鿿]/;

let auditRoot = REPO_ROOT;
await import('../../tests/tsx-loader.mjs');
// tests/tsx-loader.mjs 把 `@/` 綁在本 repo。對另一個 worktree 執行時（AC-3），
// `@/` 必須解析到那一棵樹，否則會讀到本分支的資料模組。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/') && auditRoot !== REPO_ROOT) {
      const base = path.join(auditRoot, 'src', specifier.slice(2));
      for (const f of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
        if (fs.existsSync(f) && fs.statSync(f).isFile()) return { url: pathToFileURL(f).href, format: 'module', shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});

function listFiles(dir, test) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((d) => d.isFile() && test(d.name))
    .map((d) => path.join(d.parentPath ?? d.path, d.name))
    .sort();
}

const lineOf = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

/** 去掉 `as const`、`satisfies`、括號，拿到真正的值節點 */
function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node) || ts.isParenthesizedExpression(node) || ts.isTypeAssertionExpression(node))) {
    node = node.expression;
  }
  return node;
}

function propName(p) {
  const n = p.name;
  if (!n) return null;
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return n.text;
  return null;
}

/** 沿著 path（鍵或索引）往 AST 走，回傳走到的最深節點與是否走完 */
function walkAst(node, segments) {
  let cur = unwrap(node);
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (cur && ts.isArrayLiteralExpression(cur) && typeof seg === 'number' && !cur.elements.some(ts.isSpreadElement)) {
      const next = cur.elements[seg];
      if (!next) return { node: cur, complete: false };
      cur = unwrap(next);
    } else if (cur && ts.isObjectLiteralExpression(cur) && typeof seg === 'string') {
      const prop = cur.properties.find((p) => propName(p) === seg);
      if (!prop) return { node: cur, complete: false };
      cur = unwrap(ts.isPropertyAssignment(prop) ? prop.initializer : prop);
    } else {
      return { node: cur, complete: false };
    }
  }
  return { node: cur, complete: true };
}

/** 一個檔所有字串常值的文字 → 行號，供執行期值對不回 AST 路徑時（例如經 .map 產生）查找 */
function literalLines(sf) {
  const map = new Map();
  (function visit(n) {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (!map.has(n.text)) map.set(n.text, lineOf(sf, n.getStart(sf)));
    }
    ts.forEachChild(n, visit);
  })(sf);
  return map;
}

function routeOf(file) {
  return file.endsWith('.json') ? '改試算表' : 'PR';
}

const fmtPath = (segments) =>
  segments.reduce((s, seg) => (typeof seg === 'number' ? `${s}[${seg}]` : s ? `${s}.${seg}` : seg), '');

/**
 * 走訪一個值，對每個字串或數字葉節點呼叫 emit。
 * 葉節點的 object／array 以「父物件的路徑」為識別，讓 M2、M4 不必回頭看原始結構。
 */
function walkValue(value, segments, emit, seen = new Set()) {
  if (typeof value === 'string' || typeof value === 'number') {
    const parent = segments.slice(0, -1);
    const key = segments[segments.length - 1];
    const idx = parent[parent.length - 1];
    emit({
      segments,
      key: typeof key === 'string' ? key : null,
      object: typeof key === 'string' ? fmtPath(parent) : null,
      array: typeof key === 'string' && typeof idx === 'number' ? [fmtPath(parent.slice(0, -1)), idx] : null,
      value,
    });
    return;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) value.forEach((v, i) => walkValue(v, [...segments, i], emit, seen));
  else for (const [k, v] of Object.entries(value)) walkValue(v, [...segments, k], emit, seen);
}

/** 本模組自己宣告的匯出變數名 → 初始值節點。re-export 不算，避免同一份資料被歸到兩個檔 */
function localExports(sf) {
  const out = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || !st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer) out.set(d.name.text, d.initializer);
    }
  }
  return out;
}

async function dataModuleUnits(root, abs) {
  const file = path.relative(root, abs);
  const sf = ts.createSourceFile(abs, fs.readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true);
  const literals = literalLines(sf);
  const mod = await import(pathToFileURL(abs).href);
  const units = [];
  for (const [name, init] of localExports(sf)) {
    walkValue(mod[name], [name], (leaf) => {
      const { node, complete } = walkAst(init, leaf.segments.slice(1));
      const exact = complete && node && !ts.isTemplateExpression(node) ? node : null;
      const line = exact
        ? lineOf(sf, exact.getStart(sf))
        : (literals.get(String(leaf.value)) ?? lineOf(sf, (node ?? init).getStart(sf)));
      units.push({
        file, line, text: String(leaf.value), route: routeOf(file), key: leaf.key,
        object: leaf.object && `${file}#${leaf.object}`, array: leaf.array && [`${file}#${leaf.array[0]}`, leaf.array[1]],
        path: fmtPath(leaf.segments),
      });
    });
  }
  return units;
}

function jsonUnits(root, abs) {
  const file = path.relative(root, abs);
  const sf = ts.parseJsonText(abs, fs.readFileSync(abs, 'utf8'));
  const units = [];
  (function visit(node, segments) {
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
      const parent = segments.slice(0, -1);
      const key = segments[segments.length - 1];
      const idx = parent[parent.length - 1];
      units.push({
        file, line: lineOf(sf, node.getStart(sf)), text: node.text, route: routeOf(file),
        key: typeof key === 'string' ? key : null,
        object: typeof key === 'string' ? `${file}#${fmtPath(parent)}` : null,
        array: typeof key === 'string' && typeof idx === 'number' ? [`${file}#${fmtPath(parent.slice(0, -1))}`, idx] : null,
        path: fmtPath(segments),
      });
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((e, i) => visit(e, [...segments, i]));
    } else if (ts.isObjectLiteralExpression(node)) {
      for (const p of node.properties) if (ts.isPropertyAssignment(p)) visit(p.initializer, [...segments, propName(p)]);
    }
  })(sf.statements[0].expression, []);
  return units;
}

// ─── .tsx ──────────────────────────────────────────────────────────────

/** 行內元素：文字併入所在段落。其餘元素（含元件）自成段落 */
const INLINE = new Set(['a', 'b', 'strong', 'em', 'i', 'span', 'code', 'abbr', 'mark', 'sup', 'sub', 'small', 'br', 'Link', 'time', 'q', 'cite', 'u', 's']);

/**
 * 模組層級可代入的識別字：`import { X } from '@/data/…'`、
 * `const { a, b } = X`、`const Y = X.prop`。其餘識別字不代入。
 */
async function buildScope(sf, abs, root) {
  const scope = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
    const spec = st.moduleSpecifier.text;
    const target = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(abs), spec) : null;
    if (!target || !path.relative(path.join(root, 'src/data'), target).match(/^[^.]/) || target.endsWith('.json')) continue;
    const named = st.importClause.namedBindings;
    if (!named || !ts.isNamedImports(named)) continue;
    const mod = await import(pathToFileURL(fs.existsSync(`${target}.ts`) ? `${target}.ts` : target).href);
    for (const el of named.elements) scope.set(el.name.text, mod[(el.propertyName ?? el.name).text]);
  }
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      const init = d.initializer && unwrap(d.initializer);
      if (!init) continue;
      const value = evaluate(init, scope);
      if (value === undefined) continue;
      if (ts.isIdentifier(d.name)) scope.set(d.name.text, value);
      else if (ts.isObjectBindingPattern(d.name) && value && typeof value === 'object') {
        for (const el of d.name.elements) {
          if (ts.isIdentifier(el.name)) scope.set(el.name.text, value[el.propertyName?.text ?? el.name.text]);
        }
      }
    }
  }
  return scope;
}

/** 只求字串、數字常值、範圍內識別字與其屬性鏈、樣板字串。求不出來回 undefined */
function evaluate(node, scope) {
  node = unwrap(node);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node)) return scope.get(node.text);
  if (ts.isPropertyAccessExpression(node)) {
    const base = evaluate(node.expression, scope);
    return base != null && typeof base === 'object' ? base[node.name.text] : undefined;
  }
  if (ts.isTemplateExpression(node)) {
    let s = node.head.text;
    for (const span of node.templateSpans) {
      const v = evaluate(span.expression, scope);
      s += (typeof v === 'string' || typeof v === 'number' ? v : HOLE) + span.literal.text;
    }
    return s;
  }
  return undefined;
}

const asText = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v) : HOLE);

/** React 的 JSX 文字空白規則：含換行的空白整段去掉，行與行之間以一個空格相接 */
function jsxText(raw) {
  const lines = raw.split(/\r?\n/);
  return lines
    .map((l, i) => {
      let s = l;
      if (i > 0) s = s.replace(/^\s+/, '');
      if (i < lines.length - 1) s = s.replace(/\s+$/, '');
      return s;
    })
    .filter((s) => s.length > 0)
    .join(' ');
}

function tagName(el) {
  const opening = ts.isJsxElement(el) ? el.openingElement : el;
  return opening.tagName.getText();
}

async function tsxUnits(root, abs) {
  const file = path.relative(root, abs);
  const sf = ts.createSourceFile(abs, fs.readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const scope = await buildScope(sf, abs, root);
  const units = [];
  const consumed = new Set();
  const push = (text, line, extra = {}) =>
    units.push({ file, line, text, route: routeOf(file), key: null, object: null, array: null, path: `L${line}`, ...extra });

  /** 一個元素的子節點依段落切開：文字、`{運算式}`、行內元素累積成一段，遇到區塊元素就斷開 */
  function paragraphs(children) {
    let buf = '';
    let start = null;
    const flush = () => {
      if (CJK.test(buf) && start !== null) push(buf.replace(/\s+/g, ' ').trim(), start);
      buf = '';
      start = null;
    };
    const note = (pos) => {
      if (start === null) start = lineOf(sf, pos);
    };
    (function collect(kids) {
      for (const child of kids) {
        if (ts.isJsxText(child)) {
          const t = jsxText(child.text);
          if (t) {
            note(child.pos + child.text.search(/\S/));
            buf += t;
          }
        } else if (ts.isJsxExpression(child)) {
          if (!child.expression) continue;
          const v = evaluate(child.expression, scope);
          if (v === undefined && !isSimple(child.expression)) {
            // 條件式、.map 等：不併入段落，裡面的字串常值與 JSX 另外抽
            flush();
            continue;
          }
          consumed.add(unwrap(child.expression));
          note(child.expression.getStart(sf));
          buf += asText(v);
        } else if ((ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) && INLINE.has(tagName(child))) {
          if (ts.isJsxElement(child)) collect(child.children);
        } else if (ts.isJsxFragment(child)) {
          collect(child.children);
        } else {
          flush();
        }
      }
    })(children);
    flush();
  }

  const isSimple = (e) => ts.isIdentifier(unwrap(e)) || ts.isPropertyAccessExpression(unwrap(e));

  (function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const isBlock = ts.isJsxFragment(node) || !INLINE.has(tagName(node));
      if (isBlock) paragraphs(node.children);
    }
    ts.forEachChild(node, visit);
  })(sf);

  // 段落以外的字串：屬性值（title、alt、aria-label）、物件常值、區域常數
  (function visit(node) {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) && !consumed.has(node)) {
      if (ts.isImportDeclaration(node.parent) || ts.isExternalModuleReference(node.parent)) return;
      const text = ts.isTemplateExpression(node) ? evaluate(node, scope) : node.text;
      const prop = ts.isPropertyAssignment(node.parent) && node.parent.initializer === node ? node.parent : null;
      const obj = prop && ts.isObjectLiteralExpression(prop.parent) ? prop.parent : null;
      if (!CJK.test(text) && !obj) return;
      const arr = obj && ts.isArrayLiteralExpression(obj.parent) ? obj.parent : null;
      const line = lineOf(sf, node.getStart(sf));
      push(text, line, {
        key: prop ? propName(prop) : null,
        object: obj ? `${file}#${obj.pos}` : null,
        array: arr ? [`${file}#${arr.pos}`, arr.elements.indexOf(obj)] : null,
      });
      if (ts.isTemplateExpression(node)) return;
    }
    if (ts.isNumericLiteral(node) && ts.isPropertyAssignment(node.parent) && ts.isObjectLiteralExpression(node.parent.parent)) {
      const obj = node.parent.parent;
      const arr = ts.isArrayLiteralExpression(obj.parent) ? obj.parent : null;
      push(node.text, lineOf(sf, node.getStart(sf)), {
        key: propName(node.parent),
        object: `${file}#${obj.pos}`,
        array: arr ? [`${file}#${arr.pos}`, arr.elements.indexOf(obj)] : null,
      });
    }
    ts.forEachChild(node, visit);
  })(sf);

  return units;
}

/**
 * 抽出 root 底下全部文字單元。
 * 回傳 { units, files }：files 是被掃過的來源檔（相對路徑），供 H 層與 AC-9 對照。
 */
export async function extractUnits(root = REPO_ROOT) {
  auditRoot = path.resolve(root);
  const src = path.join(auditRoot, 'src');
  const units = [];
  const dataDir = path.join(src, 'data');
  for (const abs of listFiles(dataDir, (n) => n.endsWith('.ts') && !n.endsWith('.d.ts'))) units.push(...(await dataModuleUnits(auditRoot, abs)));
  for (const abs of listFiles(dataDir, (n) => n.endsWith('.json'))) units.push(...jsonUnits(auditRoot, abs));
  for (const abs of listFiles(src, (n) => n.endsWith('.tsx'))) units.push(...(await tsxUnits(auditRoot, abs)));
  return units;
}

export { REPO_ROOT, listFiles };
