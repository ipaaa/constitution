/**
 * 讓 node --test 直接 import 專案的 .ts / .tsx。
 *
 * 專案沒有測試框架，規格也明文「不新增相依」。這支 loader 只用
 * 已在 devDependencies 的 typescript 做轉譯，不裝任何東西。
 *
 * 兩件事：
 *   1. 解析 @/ 別名與無副檔名的相對 import，對齊 tsconfig.json 的 paths。
 *   2. 用 ts.transpileModule 把 .ts / .tsx 轉成 ESM，JSX 走 react-jsx runtime。
 *
 * 只做語法轉譯，不做型別檢查。型別由 npx tsc --noEmit 把關。
 *
 * 匯入本檔會就地註冊 hooks，因此測試檔要先 import 本檔，
 * 再以動態 import() 載入 .ts / .tsx —— 靜態 import 會在本檔執行前就解析失敗。
 */
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXTENSIONS = ['.tsx', '.ts', '/index.tsx', '/index.ts'];

/**
 * 只解析 .ts / .tsx。其餘一律交還給 Node。
 * 早期版本連無副檔名的原檔都接手，結果把 node_modules 裡的 CJS 檔
 * 也標成 ESM，react 因此炸在 `exports is not defined`。
 */
function resolveFile(base) {
  if (/\.tsx?$/.test(base) && fs.existsSync(base)) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let base = null;
    if (specifier.startsWith('@/')) {
      base = path.join(ROOT, 'src', specifier.slice(2));
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      const parent = context.parentURL?.startsWith('file:') ? fileURLToPath(context.parentURL) : null;
      if (parent && !parent.includes(`${path.sep}node_modules${path.sep}`)) {
        base = path.resolve(path.dirname(parent), specifier);
      }
    }
    if (base) {
      const file = resolveFile(base);
      if (file) return { url: pathToFileURL(file).href, format: 'module', shortCircuit: true };
    }

    try {
      return nextResolve(specifier, context);
    } catch (err) {
      // `next` 的 package.json 沒有 exports 欄位，因此 ESM 解析 `next/link` 這種
      // 無副檔名的裸子路徑會失敗（CJS 會自動補 .js，ESM 不會）。
      // 只在 Node 自己解析失敗時才補副檔名，不改變任何本來就能解析的路徑。
      if (/^[^./]/.test(specifier) && !path.extname(specifier)) {
        const withExt = nextResolve(`${specifier}.js`, context);
        if (withExt) return withExt;
      }
      throw err;
    }
  },

  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !/\.tsx?$/.test(url)) return nextLoad(url, context);
    const fileName = fileURLToPath(url);
    const { outputText } = ts.transpileModule(fs.readFileSync(fileName, 'utf8'), {
      fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});
