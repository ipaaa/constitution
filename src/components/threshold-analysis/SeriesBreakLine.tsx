/**
 * 2022-01-04 的制度換軌虛線。
 *
 * 這一天憲法訴訟法施行，不再作成解釋，改作成判決。
 * **這不是門檻調整。** 門檻調整點是實線（ThresholdBoundary），本條刻意畫虛線，
 * 讓讀者看得出兩者是不同性質的事件。
 *
 * **本元件不得 import FACTORS。**
 */
interface SeriesBreakLineProps {
  x: number;
  /** 線的長度。呼叫端已 translate 到 plot 頂端，y 自 0 起算。 */
  height: number;
  label: string;
}

export default function SeriesBreakLine({ x, height, label }: SeriesBreakLineProps) {
  return (
    <g pointerEvents="none">
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#D32F2F"
        strokeWidth={1.25}
        strokeDasharray="5 3"
      />
      {/* 行動版放不下這行字。換軌的說明改由下方 SeriesBoundaryNote 的第二項交代。 */}
      <text
        x={x - 6}
        y={16}
        textAnchor="end"
        fontFamily="serif"
        fontSize="10"
        fill="#D32F2F"
        className="hidden md:block"
      >
        {label}
      </text>
    </g>
  );
}
