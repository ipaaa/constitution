/* eslint-disable @typescript-eslint/no-require-imports */
// 渲染檢查工具。驗證用，不參與 build。
// 本檔是 CommonJS 腳本，需要在執行期動態解析模組，故整檔關閉 no-require-imports。
//
// 用 Next 內建的 swc 轉譯 src 下的 .ts/.tsx，替換 next/link、next/image、
// lucide-react 三個模組，再用 react-dom/server 把頁面渲染成靜態 HTML，
// 然後數指定字串出現幾次。
//
// 為什麼不用 dev server 取代：`next dev` 回傳的 HTML 只含 layout。
// 頁面內容在 Suspense 邊界後面串流，curl 拿不到，無法用來計數。
//
// 用法：
//   node scripts/render-check.cjs <repo-root> <out.json>
//       渲染全部頁面，把計數寫成 JSON。
//   node scripts/render-check.cjs <repo-root> <out.json> --assert-no-cross-track
//       另外斷言：跨軌道連結計數全為 0、渲染無例外。不符則 exit 1。
//
// `--assert-no-cross-track` 不檢查內容數量（歷史條目數、待審案件數等）。
// 那些數字會隨試算表同步變動，寫死會造成假警報。

const fs = require('fs');
const path = require('path');
const Module = require('module');

const ROOT = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3]);
const ASSERT_NO_CROSS_TRACK = process.argv.includes('--assert-no-cross-track');
const SRC = path.join(ROOT, 'src');

const { transformSync } = require(path.join(ROOT, 'node_modules/next/dist/build/swc'));
const React = require(path.join(ROOT, 'node_modules/react'));
const { jsx } = require(path.join(ROOT, 'node_modules/react/jsx-runtime'));
const { renderToStaticMarkup } = require(path.join(ROOT, 'node_modules/react-dom/server'));

// --- stub modules -----------------------------------------------------------

function LinkStub(props) {
  const { href, children, ...rest } = props;
  return jsx('a', { href: typeof href === 'string' ? href : String(href), ...rest, children });
}
// next/image 專有的 props 不能傳給 <img>，逐一濾掉。
const NEXT_IMAGE_ONLY_PROPS = ['fill', 'priority', 'quality', 'loader', 'placeholder', 'blurDataURL'];
function ImageStub(props) {
  const rest = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'src' || key === 'alt' || NEXT_IMAGE_ONLY_PROPS.includes(key)) continue;
    rest[key] = value;
  }
  return jsx('img', { src: typeof props.src === 'string' ? props.src : '', alt: props.alt || '', ...rest });
}
const lucideStub = new Proxy(
  {},
  {
    get(_t, name) {
      if (name === '__esModule') return true;
      if (name === 'default') return undefined;
      return function Icon() {
        return jsx('svg', { 'data-icon': String(name) });
      };
    },
    has() {
      return true;
    },
  }
);

const STUBS = new Map([
  ['next/link', LinkStub],
  ['next/image', ImageStub],
  ['lucide-react', lucideStub],
]);

// --- module hooks -----------------------------------------------------------

const STUB_PREFIX = '\0stub:';
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (STUBS.has(request)) return STUB_PREFIX + request;
  if (request.startsWith('@/')) {
    const base = path.join(SRC, request.slice(2));
    for (const ext of ['', '.tsx', '.ts', '.json', '/index.tsx', '/index.ts']) {
      if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) {
        return base + ext;
      }
    }
    throw new Error('cannot resolve alias ' + request);
  }
  // bare package requests from transpiled app files resolve against the repo root
  if (!request.startsWith('.') && !path.isAbsolute(request)) {
    try {
      return origResolve.call(this, request, parent, ...rest);
    } catch {
      return require.resolve(request, { paths: [path.join(ROOT, 'node_modules')] });
    }
  }
  return origResolve.call(this, request, parent, ...rest);
};

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (STUBS.has(request)) return STUBS.get(request);
  return origLoad.call(this, request, parent, isMain);
};

function compileTS(module_, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { code } = transformSync(source, {
    filename,
    jsc: {
      parser: { syntax: 'typescript', tsx: filename.endsWith('.tsx') },
      target: 'es2022',
      transform: { react: { runtime: 'automatic' } },
    },
    module: { type: 'commonjs' },
    sourceMaps: false,
  });
  module_._compile(code, filename);
}
Module._extensions['.ts'] = compileTS;
Module._extensions['.tsx'] = compileTS;
Module._extensions['.css'] = function (module_) {
  module_.exports = {};
};

// --- render helpers ---------------------------------------------------------

function loadDefault(rel) {
  const m = require(path.join(ROOT, rel));
  return m && m.__esModule ? m.default : m;
}

// React's `use()` reads a fulfilled thenable synchronously, which keeps
// renderToStaticMarkup from suspending on Next's async `params`.
function fulfilled(value) {
  return { status: 'fulfilled', value, then(cb) { cb(value); } };
}

function count(html, needle) {
  let n = 0;
  let i = 0;
  for (;;) {
    const at = html.indexOf(needle, i);
    if (at === -1) return n;
    n += 1;
    i = at + needle.length;
  }
}

const result = { pages: {}, errors: [] };

function render(label, fn) {
  try {
    return renderToStaticMarkup(fn());
  } catch (err) {
    result.errors.push(`${label}: ${err && err.stack ? err.stack.split('\n')[0] : err}`);
    return '';
  }
}

// /past
{
  const Past = loadDefault('src/app/past/page.tsx');
  const html = render('/past', () => React.createElement(Past));
  result.pages['/past'] = {
    rendered: html.length > 0,
    'textbook-item': count(html, 'textbook-item'),
    'reality-item': count(html, 'reality-item'),
    'reality-content': count(html, 'reality-content'),
    'vh-trigger': count(html, 'vh-trigger'),
    crossTrackHeading: count(html, 'Related — 跨軌道連結'),
    crossTrackBadgeT1: count(html, 'T1 過去'),
    crossTrackBadgeT2: count(html, 'T2 現在'),
    crossTrackBadgeT3: count(html, 'T3 未來'),
    htmlLength: html.length,
  };
}

// /future
{
  const Future = loadDefault('src/app/future/page.tsx');
  const html = render('/future', () => React.createElement(Future));
  result.pages['/future'] = {
    rendered: html.length > 0,
    caseCards: count(html, '申請 '),
    crossTrackHeading: count(html, '歷史脈絡'),
    crossTrackBadgeT1: count(html, '>T1<'),
    htmlLength: html.length,
  };
}

// /present (list page — carries #tldr and the discussion cards)
{
  const Present = loadDefault('src/app/present/page.tsx');
  const html = render('/present', () => React.createElement(Present));
  result.pages['/present'] = {
    rendered: html.length > 0,
    tldrAnchor: count(html, 'id="tldr"'),
    articleLinks: count(html, 'href="/present/'),
    crossTrackHeading: count(html, '跨軌道探索'),
    htmlLength: html.length,
  };
}

// /present/[id] — every discussion id
{
  const Detail = loadDefault('src/app/present/[id]/page.tsx');
  const discussions = require(path.join(SRC, 'data/discussions.json'));
  const perId = {};
  for (const d of discussions) {
    const html = render(`/present/${d.id}`, () =>
      React.createElement(Detail, { params: fulfilled({ id: d.id }) })
    );
    perId[d.id] = {
      rendered: html.length > 0,
      crossTrackSection: count(html, '跨軌道探索'),
      crossTrackHistoryHeading: count(html, '歷史脈絡 — 相關釋憲判例'),
      crossTrackFutureHeading: count(html, '未來影響 — 相關待審案件'),
      owlDepth: count(html, '貓頭鷹深度解析'),
      opposingViews: count(html, 'opposing-view'),
      relatedArticles: count(html, 'href="/present/'),
      htmlLength: html.length,
    };
  }
  result.pages['/present/[id]'] = perId;
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log('errors:', result.errors.length);
for (const e of result.errors) console.log('  ' + e);
console.log('wrote', OUT);

if (ASSERT_NO_CROSS_TRACK) {
  const failures = [];
  if (result.errors.length > 0) {
    failures.push(`渲染拋出 ${result.errors.length} 個例外`);
  }
  const walk = (prefix, node) => {
    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === 'object') {
        walk(`${prefix}.${key}`, value);
      } else if (/crossTrack/i.test(key) && value !== 0) {
        failures.push(`${prefix}.${key} = ${value}，應為 0`);
      } else if (key === 'rendered' && value !== true) {
        failures.push(`${prefix} 未渲染出內容`);
      }
    }
  };
  walk('', result.pages);

  if (failures.length > 0) {
    console.error('FAIL — 仍有跨軌道連結殘留：');
    for (const f of failures) console.error('  ' + f);
    process.exit(1);
  }
  console.log('PASS — 跨軌道連結計數全為 0，所有頁面渲染成功且無例外。');
}
