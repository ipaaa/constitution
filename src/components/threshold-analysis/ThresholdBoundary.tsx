import type { ThresholdEra } from '@/data/threshold-analysis';

/**
 * 一個門檻調整點：一條垂直實線，線上端掛法規公布日與門檻一句話。
 *
 * 線的 x 由呼叫端依公布日精確定位到月，不吸附到年刻度。
 * 桌機顯示公布日 + 門檻一句話；行動版只留公布年份，一句話移到 EraComparisonStrip。
 *
 * 實線代表門檻調整。2022-01-04 的制度換軌用虛線，由 SeriesBreakLine 畫，兩者必須看得出差別。
 *
 * **本元件不得 import FACTORS。**
 */
interface ThresholdBoundaryProps {
  era: ThresholdEra;
  x: number;
  /** 線的長度。呼叫端以 <g transform="translate(0, plotTop)"> 包起，y 自 0 起算。 */
  height: number;
  /** 標籤朝左或朝右，避免在圖緣被裁切 */
  labelAnchor: 'start' | 'end';
  /** 標籤要掛在上排還是下排。相鄰兩條線交錯排列，避免長標籤互相蓋住。 */
  labelRow: 'upper' | 'lower';
}

export default function ThresholdBoundary({
  era,
  x,
  height,
  labelAnchor,
  labelRow,
}: ThresholdBoundaryProps) {
  // 標籤在 plot 之上，因此 y 為負值（呼叫端已 translate 到 plot 頂端）。
  const dateY = labelRow === 'upper' ? -44 : -20;
  const ruleY = dateY + 13;
  const unverified = era.evidence === 'unverified';

  return (
    <g>
      <line x1={x} y1={-8} x2={x} y2={height} stroke="#111827" strokeWidth={1} />

      {/* 桌機：完整公布日 + 門檻一句話 */}
      <g className="hidden md:block">
        <text
          x={x}
          y={dateY}
          textAnchor={labelAnchor}
          fontFamily="monospace"
          fontSize="10"
          fontWeight="bold"
          fill="#111827"
        >
          {era.effectiveFrom}
        </text>
        <text
          x={x}
          y={ruleY}
          textAnchor={labelAnchor}
          fontFamily="serif"
          fontSize="10"
          fill={unverified ? '#b45309' : '#4b5563'}
        >
          {era.label}：{era.ruleSummary}
        </text>
      </g>

      {/* 行動版：只留線與公布年份。門檻一句話移到下方對照條的 tile 內。
          字級放大到 viewBox 縮到 375px 之後仍讀得到，理由見 ChartText。 */}
      <text
        x={x}
        y={labelRow === 'upper' ? -34 : -6}
        textAnchor={labelAnchor}
        fontFamily="monospace"
        fontSize="26"
        fontWeight="bold"
        fill="#111827"
        className="md:hidden"
      >
        {era.effectiveFrom.slice(0, 4)}
      </text>
    </g>
  );
}
