import ChartText from './ChartText';

/**
 * x 年刻度、y 件數刻度、水平格線。
 *
 * 一年一格，不合併十年。十年合併會把 1957→1958 的落差（9→2）藏進同一個 1950s 桶裡。
 * 0 件年畫成零高度但保留刻度位，所以 years 要含 1950、1951。
 *
 * 桌機每 3 年一個數字刻度，行動版每 10 年一個。兩套刻度都在 DOM 裡，
 * 以 Tailwind 的 md: 斷點切換顯示，避免量測視窗寬度造成 hydration 不一致。
 * 行動版的字級另外放大，理由見 ChartText。
 *
 * **本元件不得 import FACTORS。**
 */
interface ChartAxesProps {
  /** plot 區左緣、寬、高。呼叫端已 translate 到 plot 頂端，y 自 0 起算。 */
  left: number;
  width: number;
  height: number;
  years: readonly number[];
  /** 年份格的左緣 x。 */
  xForYear: (year: number) => number;
  /** 年份格的寬。 */
  slotWidth: number;
  yForCount: (count: number) => number;
  yTicks: readonly number[];
  /** 桌機每幾年標一個數字。 */
  desktopEvery: number;
  /** 行動版每幾年標一個數字。 */
  mobileEvery: number;
}

export default function ChartAxes({
  left,
  width,
  height,
  years,
  xForYear,
  slotWidth,
  yForCount,
  yTicks,
  desktopEvery,
  mobileEvery,
}: ChartAxesProps) {
  const centreOf = (year: number) => xForYear(year) + slotWidth / 2;

  return (
    <g pointerEvents="none">
      {/* y 格線與件數刻度 */}
      {yTicks.map((v) => (
        <g key={`y-${v}`}>
          <line
            x1={left}
            y1={yForCount(v)}
            x2={left + width}
            y2={yForCount(v)}
            stroke={v === 0 ? '#9ca3af' : '#e5e7eb'}
            strokeWidth={1}
          />
          <ChartText
            x={left - 8}
            y={yForCount(v) + 4}
            mobileY={yForCount(v) + 9}
            textAnchor="end"
            fontFamily="monospace"
            fontSize={10}
            mobileFontSize={26}
            fill="#6b7280"
          >
            {String(v)}
          </ChartText>
        </g>
      ))}

      {/* x 短刻度線，每年一個 */}
      {years.map((year) => (
        <line
          key={`tick-${year}`}
          x1={centreOf(year)}
          y1={height}
          x2={centreOf(year)}
          y2={height + 4}
          stroke="#d1d5db"
          strokeWidth={1}
        />
      ))}

      {/* 桌機年份數字：每 desktopEvery 年一個 */}
      <g className="hidden md:block">
        {years
          .filter((year) => year % desktopEvery === 0)
          .map((year) => (
            <text
              key={`xl-d-${year}`}
              x={centreOf(year)}
              y={height + 18}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="10"
              fill="#6b7280"
            >
              {year}
            </text>
          ))}
      </g>

      {/* 行動版年份數字：每 mobileEvery 年一個，字級放大到縮放後仍讀得到 */}
      <g className="md:hidden">
        {years
          .filter((year) => year % mobileEvery === 0)
          .map((year) => (
            <text
              key={`xl-m-${year}`}
              x={centreOf(year)}
              y={height + 30}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="26"
              fill="#6b7280"
            >
              {year}
            </text>
          ))}
      </g>

      {/* y 軸標題 */}
      <g transform={`rotate(-90, ${left - 34}, ${height / 2})`}>
        <ChartText
          x={left - 34}
          y={height / 2}
          textAnchor="middle"
          fontSize={11}
          mobileFontSize={26}
          fill="#6b7280"
        >
          當年件數
        </ChartText>
      </g>
    </g>
  );
}
