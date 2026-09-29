/**
 * 全站內容查核（scripts/content-audit.mjs）的測試。
 *
 * 執行：node --test tests/content-audit.test.mjs
 *
 * 規則的單元案例一律用合成的文字單元，不依賴站上今日的內容。
 * 站上的錯誤修好後，這些測試不會跟著壞；「今日抓到哪些」由 stage report 的實跑輸出記錄。
 * 規格見 docs/constitution-features/systematic-chinese-content-legal-audit.md 的 `## Acceptance criteria`。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const audit = await import(pathToFileURL(path.join(ROOT, 'scripts/content-audit.mjs')).href);
const { extractUnits } = await import(pathToFileURL(path.join(ROOT, 'scripts/content-audit/units.mjs')).href);
const { RULING_THRESHOLD } = await import(pathToFileURL(path.join(ROOT, 'src/data/ruling-threshold.ts')).href);

const authorities = audit.loadAuthorities();
const baseCtx = { ...authorities, documents: [], archived: new Map(), root: ROOT, threshold: RULING_THRESHOLD.voidedFloor, publicPages: [] };

let seq = 0;
/** 合成一個文字單元。extra 可給 key／object／array 模擬物件欄位 */
const unit = (text, extra = {}) => ({ file: 'synthetic.ts', line: ++seq, text, route: 'PR', key: null, object: null, array: null, path: `u${seq}`, ...extra });
const failures = (rule, units, ctx = baseCtx) => audit.RULES.find((r) => r.id === rule).run(units, ctx);

test('AC-1：M 層恰為 M1–M6', () => {
  assert.deepEqual(audit.RULES.map((r) => r.id), ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']);
});

test('AC-1：不與 056／066 的網子重疊——佔位字串、釋字第272號、門檻時態都不觸發 M 層', () => {
  const units = [unit('某學者'), unit('釋字第272號'), unit('目前仍須10人參與評議')];
  assert.deepEqual(audit.runCheck(units, baseCtx), []);
});

test('AC-2：M1 抓不存在的號次，含 063 的歷史錯號與全形、簡寫', () => {
  for (const bad of ['114年憲判字第9號', '114憲判9', '１１４年憲判字第９號', '釋字第814號']) {
    assert.equal(failures('M1', [unit(bad)]).length, 1, bad);
  }
  for (const good of ['114年憲判字第1號', '釋字第 261 號', '釋字第781~783號']) {
    assert.deepEqual(failures('M1', [unit(good)]), [], good);
  }
});

test('AC-2：M1 的上限讀 fixture，不寫死', () => {
  const smaller = { ...baseCtx, interpretations: new Map([[1, '1949-01-06']]), interpretationMax: 1 };
  assert.equal(failures('M1', [unit('釋字第 261 號')], smaller).length, 1);
});

test('AC-3：M2 抓 065 的錯誤型態——同一物件內號次與年份不配', () => {
  const obj = (year, label) => [unit(year, { key: 'year', object: 'o' }), unit(label, { key: 'label', object: 'o' })];
  assert.equal(failures('M2', obj('2024', '114年憲判字第1號')).length, 1);
  assert.deepEqual(failures('M2', obj('2025.12', '114年憲判字第1號')), []);
  assert.deepEqual(failures('M2', obj('2019', '釋字第781~783號')), []);
  // 民國的日期欄同樣認得
  assert.deepEqual(failures('M2', [unit('115-08-14', { key: 'rocDate', object: 'p' }), unit('115 年憲判字第 6 號', { key: 'docket', object: 'p' })]), []);
});

test('AC-3：M2 只看整個值就是號次的欄位——句子裡順帶提到的號次不算', () => {
  // discussions.json d1 的型態：文章標題提到判決，year 是文章發表日
  const units = [
    unit('憲法法庭，歡迎回來——兼評114年憲判字第1號判決', { key: 'title', object: 'd' }),
    unit('2026.1.14', { key: 'year', object: 'd' }),
  ];
  assert.deepEqual(failures('M2', units), []);
});

test('AC-4：M3 的門檻數字須等於 voidedFloor', () => {
  for (const bad of ['至少11人參與評議', '至少8人同意', '十一人門檻']) {
    assert.equal(failures('M3', [unit(bad)]).length, 1, bad);
  }
  assert.deepEqual(failures('M3', [unit('至少10人參與評議、至少9人同意')]), []);
});

test('AC-4：M3 的期望值跟著權威常值走，不寫死 10／9', () => {
  const swapped = { ...baseCtx, threshold: { participants: 11, unconstitutionalityVotes: 8 } };
  assert.deepEqual(failures('M3', [unit('至少11人參與評議、至少8人同意')], swapped), []);
  assert.equal(failures('M3', [unit('至少10人參與評議')], swapped).length, 1);
});

test('AC-4：loadContext 的門檻讀自 src/data/ruling-threshold.ts', async () => {
  const ctx = await audit.loadContext(ROOT);
  assert.equal(ctx.threshold, RULING_THRESHOLD.voidedFloor);
});

test('AC-5：M4 驗日曆日、dateLabel 與陣列順序', () => {
  assert.equal(failures('M4', [unit('2025-02-30', { key: 'date', object: 'a' })]).length, 1);
  const mismatch = [unit('2024-05-18', { key: 'date', object: 'b' }), unit('2024年5月17日', { key: 'dateLabel', object: 'b' })];
  assert.equal(failures('M4', mismatch).length, 1);
  const partial = [unit('2024-11-01', { key: 'date', object: 'c' }), unit('2024年10月底至11月', { key: 'dateLabel', object: 'c' })];
  assert.deepEqual(failures('M4', partial), []);

  const ev = (i, date) => [
    unit(`evt-${i}`, { key: 'id', object: `e${i}`, array: ['T', i] }),
    unit(date, { key: 'date', object: `e${i}`, array: ['T', i] }),
  ];
  const outOfOrder = [...ev(0, '2024-11-01'), ...ev(1, '2024-12-20'), ...ev(2, '2024-10-31')];
  const found = failures('M4', outOfOrder);
  assert.equal(found.length, 1);
  assert.match(found[0][1], /evt-1.*evt-2/);
  assert.deepEqual(failures('M4', [...ev(0, '2024-10-31'), ...ev(1, '2024-11-01'), ...ev(2, '2024-12-20')]), []);
});

test('AC-6：M5 抓同段紀年混用，換算緊鄰時通過', () => {
  assert.deepEqual(failures('M5', [unit('民國 90 年（2001 年）4 月，另見 1952-04-16')]), []);
  assert.equal(failures('M5', [unit('民國 90 年 4 月，另見 1952-04-16')]).length, 1);
  // 號次裡的民國年不算紀年
  assert.deepEqual(failures('M5', [unit('114年憲判字第1號自 2025-12-19 起失其效力')]), []);
});

/** 在暫存目錄建一棵最小的 src/，回傳路徑 */
function tempRoot(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-audit-'));
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}

test('AC-6：.tsx 的段落代入 @/data 的字串，M5 才看得到插值裡的西元日期', async () => {
  const dir = tempRoot({
    'src/data/floor.ts': "export const FULL = '已由 114 年憲判字第 1 號宣告違憲，自公告日 2025-12-19 起失其效力';\n",
    'src/components/Note.tsx': [
      "import { FULL } from '@/data/floor';",
      'export default function Note() {',
      '  return (',
      '    <p>',
      '      114 年 1 月 23 日修法增訂的{FULL}，',
      '      存續期間為 114 年 1 月 23 日至 114 年 12 月 19 日。',
      '    </p>',
      '  );',
      '}',
      '',
    ].join('\n'),
  });
  const units = await extractUnits(dir);
  const para = units.find((u) => u.file === 'src/components/Note.tsx');
  assert.equal(para.line, 5);
  assert.match(para.text, /2025-12-19/);
  assert.equal(failures('M5', [para]).length, 1);
});

test('AC-3：.tsx 內的物件常值也是 M2 的物件——065 的錯誤就在 page.tsx 裡', async () => {
  const dir = tempRoot({
    'src/app/present/page.tsx': [
      'const CourtTimeline = () => {',
      '  const milestones = [',
      "    { year: '2022', label: '憲法法庭正式揭牌' },",
      "    { year: '2024', label: '114年憲判字第1號' },",
      '  ];',
      '  return <div>{milestones.map((m) => m.label)}</div>;',
      '};',
      'export default CourtTimeline;',
      '',
    ].join('\n'),
  });
  const found = failures('M2', await extractUnits(dir));
  assert.deepEqual(found.map(([u]) => `${u.file}:${u.line}`), ['src/app/present/page.tsx:4']);
});

test('AC-7：M6 報封存路徑（含相對路徑），不報從未存在的路徑', () => {
  const dir = tempRoot({
    'docs/constitution-features/_archive/063-x.md': '# 063\n',
    'docs/INDEX.md': ['| 路徑 | 用途 | 狀態 |', '|---|---|---|', '| `docs/health-check/TODO.md` | 待辦 | plan |', '| `docs/old.md` | 舊 | record |', ''].join('\n'),
    'docs/health-check/TODO.md': ['見 docs/constitution-features/063-x.md。', '另見 [056](../constitution-features/063-x.md)。', '新增 docs/content-pipeline/operations.md', ''].join('\n'),
    'docs/old.md': 'docs/constitution-features/063-x.md\n',
    'AGENTS.md': '見 `docs/constitution-features/_archive/063-x.md`\n',
  });
  const found = failures('M6', [], { ...baseCtx, ...audit.loadDocuments(dir) });
  assert.deepEqual(found.map(([u]) => `${u.file}:${u.line}`), ['docs/health-check/TODO.md:1', 'docs/health-check/TODO.md:2']);
});

test('AC-9：H 節列出的檔恰為抽取器回報含中文單元的檔', async () => {
  const units = await extractUnits(ROOT);
  const ctx = await audit.loadContext(ROOT);
  const md = audit.renderReadingList(units, ctx);
  const h = md.slice(md.indexOf('## H '));
  const listed = new Set([...h.matchAll(/^\| \[ \] \| `([^`]+)`/gm)].map((m) => m[1]));
  assert.deepEqual([...listed].sort(), [...audit.readerFiles(units).keys()].sort());
  assert.ok(listed.size > 0);
});

test('fixture：憲判字每年則數不少於 interpretation-dates.json 的同年件數', () => {
  const jud = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures/judgment-dockets.json'), 'utf8'));
  const interp = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures/interpretation-dates.json'), 'utf8'));
  const perYear = new Map();
  for (const [roc] of jud.dockets) perYear.set(roc + 1911, (perYear.get(roc + 1911) ?? 0) + 1);
  for (const [year, count] of interp.judgments) assert.ok((perYear.get(year) ?? 0) >= count, `${year}: ${perYear.get(year)} < ${count}`);
});
