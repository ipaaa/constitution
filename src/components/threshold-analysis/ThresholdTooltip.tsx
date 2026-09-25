import {
  ERA_YEAR_SPLITS,
  RULES_ERA_UNCOVERED,
  type ThresholdEra,
  type YearCount,
} from '@/data/threshold-analysis';

/**
 * hover 單一年份時的浮層。桌機限定，行動版改用色帶選取＋逐年清單。
 *
 * 圖是年桶、時期歸屬是日期精確，兩者刻意不同。
 * 1958 與 1993 這兩個跨年換法的年份因此要列出該年的兩個所屬時期與各自件數，
 * 否則讀者會以為整年都適用同一個門檻。
 */
interface ThresholdTooltipProps {
  year: YearCount;
  /** 該年所屬時期。1958、1993 這類跨年換法的年份會有兩個。 */
  eras: readonly ThresholdEra[];
  /** 浮層錨點，以圖寬／圖高的百分比表示，跟著 SVG 一起縮放。 */
  x: number;
  y: number;
}

const SERIES_LABEL: Record<YearCount['series'], string> = {
  interpretation: '釋字（解釋）',
  judgment: '憲判字（判決）',
};

export default function ThresholdTooltip({ year, eras, x, y }: ThresholdTooltipProps) {
  const split = ERA_YEAR_SPLITS.find((s) => s.year === year.year);
  const uncovered = year.year === Number(RULES_ERA_UNCOVERED.date.slice(0, 4));
  const countFor = (eraId: ThresholdEra['id']) =>
    split?.parts.find((p) => p.eraId === eraId)?.count ?? null;

  return (
    <div
      className="absolute z-30 pointer-events-none bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full max-w-[18rem]"
      style={{ left: `${x}%`, top: `${y}%` }}
      role="presentation"
    >
      <div className="font-mono font-bold mb-1">
        {year.year} 年 · {year.count} 件
      </div>
      <div className="text-gray-300 font-serif">{SERIES_LABEL[year.series]}</div>
      {!year.complete && <div className="text-gray-400 font-serif">該年尚未結束，數字還會變動</div>}

      <div className="mt-1.5 border-t border-white/20 pt-1.5 space-y-1 font-serif">
        {eras.map((era) => {
          const part = countFor(era.id);
          return (
            <div key={era.id}>
              <span className="text-gray-100">{era.label}</span>
              {part !== null && <span className="text-gray-300 font-mono">：{part} 件</span>}
              <div className="text-gray-400">{era.ruleSummary}</div>
            </div>
          );
        })}
        {eras.length === 0 && (
          <div className="text-gray-400">
            釋字序列已於 2021-12-24 終止，本年不歸任何釋字門檻時期。
          </div>
        )}
      </div>

      {split && (
        <div className="mt-1.5 border-t border-white/20 pt-1.5 text-gray-300 font-serif">
          本年 {split.changeoverDate} 換法，前後適用不同門檻。圖上長條為全年合計，未依門檻加權。
        </div>
      )}

      {/* 規則期的條文只取得 1952 修正版，這兩筆早於該次修正，不在那份條文之下。 */}
      {uncovered && (
        <div className="mt-1.5 border-t border-white/20 pt-1.5 text-amber-200 font-serif">
          本年的 {RULES_ERA_UNCOVERED.interpretationNumbers.length} 件（釋字第{' '}
          {RULES_ERA_UNCOVERED.interpretationNumbers.join('、第 ')} 號）早於{' '}
          {RULES_ERA_UNCOVERED.amendedOn} 的修正，適用的是本頁未取得的原始版規則。
        </div>
      )}
    </div>
  );
}
