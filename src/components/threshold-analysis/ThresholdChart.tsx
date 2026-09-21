import {
  CHART_FIRST_YEAR,
  CHART_LAST_YEAR,
  INTERIM_SEGMENT,
  SERIES_BREAK_DATE,
  type EraStat,
  type ThresholdEra,
  type YearCount,
} from '@/data/threshold-analysis';
import ThresholdBand from './ThresholdBand';
import ThresholdBoundary from './ThresholdBoundary';
import SeriesBreakLine from './SeriesBreakLine';
import ChartAxes from './ChartAxes';

/**
 * 1949–2026 年度案件量長條圖，圖底以色帶標示門檻時期。
 *
 * 三層由下而上：色帶（區間）、長條（年度計數）、分界線（調整點）。
 * 圖本身無狀態，hover 與選取狀態由 ThresholdCaseAnalysis 以 props 傳入。
 *
 * 長條不另抽元件。78 個長條直接 map 出 <rect>，與 JusticeTermTimeline.tsx 一致。
 *
 * **本元件與其子元件（ThresholdBand、ThresholdBoundary、SeriesBreakLine、ChartAxes）
 * 一律不得 import FACTORS。** 因素釘在某個 x 位置等於宣告該因素造成該處起伏，
 * 那是本頁不能自行斷言的因果。因素只出現在 OchreBandFactors 的獨立段落。見 AC-4。
 */

const VIEW_W = 960;
const VIEW_H = 420;
const PAD = { top: 58, right: 20, bottom: 72, left: 52 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

/** x 軸以日期線性對應，讓分界線落在公布日而不是年刻度上。 */
const T_START = Date.parse(`${CHART_FIRST_YEAR}-01-01`);
const T_END = Date.parse(`${CHART_LAST_YEAR + 1}-01-01`);
const T_SPAN = T_END - T_START;

const YEAR_SLOTS = CHART_LAST_YEAR - CHART_FIRST_YEAR + 1;
const SLOT_W = PLOT_W / YEAR_SLOTS;
const BAR_W = SLOT_W * 0.66;

const Y_MAX = 40;
const Y_TICKS = [0, 10, 20, 30, 40] as const;

const SERIES_COLOR: Record<YearCount['series'], string> = {
  interpretation: '#111827',
  judgment: '#D32F2F',
};

/** 日期 → x。落在圖外的日期夾到圖緣（規則期的 1948-09-16 早於 x 軸起點）。 */
function xForDate(iso: string): number {
  const t = Date.parse(iso);
  const clamped = Math.min(Math.max(t, T_START), T_END);
  return PAD.left + ((clamped - T_START) / T_SPAN) * PLOT_W;
}

function xForYear(year: number): number {
  return PAD.left + ((year - CHART_FIRST_YEAR) / YEAR_SLOTS) * PLOT_W;
}

function yForCount(count: number): number {
  return PLOT_H - (count / Y_MAX) * PLOT_H;
}

const CHART_YEARS = Array.from({ length: YEAR_SLOTS }, (_, i) => CHART_FIRST_YEAR + i);

interface ThresholdChartProps {
  years: readonly YearCount[];
  eras: readonly ThresholdEra[];
  /** 每期的年均件數等統計，由 ThresholdCaseAnalysis 以 deriveEraStats 算好傳入。 */
  stats: readonly EraStat[];
  /** 目前 hover 的年份。null 表示無。桌機由滑鼠決定，行動版恆為 null。 */
  hoveredYear: number | null;
  /** 目前選取的時期。行動版點擊色帶時設定；桌機恆為 null。 */
  selectedEraId: ThresholdEra['id'] | null;
  onHoverYear: (year: number | null) => void;
  onSelectEra: (id: ThresholdEra['id'] | null) => void;
}

export default function ThresholdChart({
  years,
  eras,
  stats,
  hoveredYear,
  selectedEraId,
  onHoverYear,
  onSelectEra,
}: ThresholdChartProps) {
  const meanById = new Map(stats.map((s) => [s.era.id, s.meanPerYear]));

  // <desc> 必須帶四期的年均，讓讀螢幕軟體使用者拿到與視覺讀者相同的對比資訊。
  const desc = stats
    .map((s) =>
      s.meanPerYear === null
        ? `${s.era.label}（${s.era.effectiveFrom} 起）無釋字資料`
        : `${s.era.label}（${s.era.effectiveFrom} 起）年均 ${s.meanPerYear.toFixed(1)} 件`,
    )
    .join('；');

  const breakX = xForDate(SERIES_BREAK_DATE);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="threshold-chart-title threshold-chart-desc"
    >
      <title id="threshold-chart-title">
        1949 至 2026 年憲法法庭解釋與判決的年度件數，底層色帶為各時期的表決門檻
      </title>
      <desc id="threshold-chart-desc">
        {`${desc}。釋字序列 1949 至 2021 年共 813 件，2022-01-04 起改作成判決，兩個序列不可相加。`}
      </desc>

      <defs>
        <pattern
          id="threshold-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="#6b7280" strokeWidth="1.5" opacity="0.35" />
        </pattern>
      </defs>

      <g transform={`translate(0, ${PAD.top})`}>
        {/* 1. 底層色帶 */}
        {eras.map((era) => {
          const x = xForDate(era.effectiveFrom);
          const end = era.effectiveTo === null ? PAD.left + PLOT_W : xForDate(era.effectiveTo);
          return (
            <ThresholdBand
              key={era.id}
              era={era}
              meanPerYear={meanById.get(era.id) ?? null}
              x={x}
              width={Math.max(end - x, 0)}
              height={PLOT_H}
              hatched={meanById.get(era.id) === null}
              selected={selectedEraId === era.id}
              dimmed={selectedEraId !== null && selectedEraId !== era.id}
              onSelect={() => onSelectEra(selectedEraId === era.id ? null : era.id)}
            />
          );
        })}

        {/* 2022-01-04 至 2025-01-23 的憲訴法原始門檻。條文已逐字核對，但該段沒有釋字可計。 */}
        <ThresholdBand
          era={INTERIM_SEGMENT}
          meanPerYear={null}
          x={xForDate(INTERIM_SEGMENT.effectiveFrom)}
          width={xForDate(INTERIM_SEGMENT.effectiveTo!) - xForDate(INTERIM_SEGMENT.effectiveFrom)}
          height={PLOT_H}
          hatched
          selected={false}
          dimmed={selectedEraId !== null}
          onSelect={() => onSelectEra(null)}
        />

        {/* 2. 軸與格線 */}
        <ChartAxes
          left={PAD.left}
          width={PLOT_W}
          height={PLOT_H}
          years={CHART_YEARS}
          xForYear={xForYear}
          slotWidth={SLOT_W}
          yForCount={yForCount}
          yTicks={Y_TICKS}
          desktopEvery={3}
          mobileEvery={10}
        />

        {/* 3. 年度長條 */}
        {years.map((y) => {
          const h = (y.count / Y_MAX) * PLOT_H;
          const active = hoveredYear === y.year;
          return (
            <rect
              key={`bar-${y.year}`}
              x={xForYear(y.year) + (SLOT_W - BAR_W) / 2}
              y={yForCount(y.count)}
              width={BAR_W}
              height={h}
              fill={SERIES_COLOR[y.series]}
              opacity={hoveredYear === null || active ? 1 : 0.45}
              stroke={active ? '#111827' : 'none'}
              strokeWidth={active ? 1 : 0}
              onMouseEnter={() => onHoverYear(y.year)}
              onMouseLeave={() => onHoverYear(null)}
            >
              <title>{`${y.year} 年 ${y.count} 件${y.complete ? '' : '（該年尚未結束）'}`}</title>
            </rect>
          );
        })}

        {/* 4. 制度換軌虛線。虛線 vs 實線，與門檻調整點區分。 */}
        <SeriesBreakLine x={breakX} height={PLOT_H} label="解釋制度終止，改為判決" />

        {/* 5. 門檻分界線（實線）。交錯上下排，避免長標籤互相蓋住。 */}
        {eras.map((era, i) => (
          <ThresholdBoundary
            key={`boundary-${era.id}`}
            era={era}
            x={xForDate(era.effectiveFrom)}
            height={PLOT_H}
            labelAnchor={i === eras.length - 1 ? 'end' : 'start'}
            labelRow={i % 2 === 0 ? 'upper' : 'lower'}
          />
        ))}

        {/* 6. 圖右端兩段窄色帶放不下標籤，改用引線註解交代。
            行動版連這段引線都放不下，整組只在桌機顯示；
            該段內容在下方 SeriesBoundaryNote 有完整文字版。 */}
        <g pointerEvents="none" className="hidden md:block">
          <line
            x1={breakX}
            y1={PLOT_H + 26}
            x2={PAD.left + PLOT_W}
            y2={PLOT_H + 26}
            stroke="#6b7280"
            strokeWidth={1}
          />
          <line x1={breakX} y1={PLOT_H + 22} x2={breakX} y2={PLOT_H + 30} stroke="#6b7280" strokeWidth={1} />
          <text
            x={PAD.left + PLOT_W}
            y={PLOT_H + 40}
            textAnchor="end"
            fontFamily="serif"
            fontSize="10"
            fill="#4b5563"
          >
            {INTERIM_SEGMENT.effectiveFrom} {INTERIM_SEGMENT.label}
          </text>
          <text
            x={PAD.left + PLOT_W}
            y={PLOT_H + 53}
            textAnchor="end"
            fontFamily="serif"
            fontSize="10"
            fill="#4b5563"
          >
            {eras[eras.length - 1].effectiveFrom} {eras[eras.length - 1].label}／兩段皆無釋字資料
          </text>
        </g>
      </g>
    </svg>
  );
}

export { xForDate, xForYear, yForCount, SLOT_W, PAD, PLOT_W, PLOT_H, VIEW_W, VIEW_H };
