import type { StatuteSegment, ThresholdEra } from '@/data/threshold-analysis';
import ChartText from './ChartText';

/**
 * 一條門檻時期的底層色帶，外加色帶內的期間名稱與年均件數。
 *
 * 色帶是區間，不是點。調整點本身由 ThresholdBoundary 畫。
 * 呼叫端以 <g transform="translate(0, plotTop)"> 包起來，因此本元件的 y 一律自 0 起算。
 *
 * **本元件不得 import FACTORS。** 因素釘在 x 位置等於宣告因果，見 AC-4。
 */
interface ThresholdBandProps {
  era: ThresholdEra | StatuteSegment;
  /** 該期的年均件數。無資料期（current、interim）為 null。 */
  meanPerYear: number | null;
  x: number;
  width: number;
  height: number;
  /** true 時填斜線網底，表示該期無釋字資料 */
  hatched: boolean;
  selected: boolean;
  /** 別的色帶被選取時為 true，本條要降到 0.08 讓出視覺焦點 */
  dimmed: boolean;
  onSelect: () => void;
}

/** 色帶窄於這個寬度就放不下標籤，改由圖下方的引線註解交代。 */
const MIN_LABEL_WIDTH = 72;
/** 行動版字級大得多（見 ChartText），需要更寬的色帶才放得下。 */
const MIN_MOBILE_LABEL_WIDTH = 150;

export default function ThresholdBand({
  era,
  meanPerYear,
  x,
  width,
  height,
  hatched,
  selected,
  dimmed,
  onSelect,
}: ThresholdBandProps) {
  const opacity = selected ? 0.32 : dimmed ? 0.08 : 0.18;
  const centre = x + width / 2;
  const showLabel = width >= MIN_LABEL_WIDTH;

  return (
    <g>
      <rect
        x={x}
        y={0}
        width={width}
        height={height}
        fill={era.colorToken}
        opacity={opacity}
        onClick={onSelect}
        className="cursor-pointer"
      >
        <title>{`${era.label}（${era.effectiveFrom} 起）`}</title>
      </rect>

      {hatched && (
        <rect
          x={x}
          y={0}
          width={width}
          height={height}
          fill="url(#threshold-hatch)"
          pointerEvents="none"
        />
      )}

      {showLabel && (
        <g pointerEvents="none">
          {/* 行動版只留期間名稱。年均數字改由下方 EraComparisonStrip 的 tile 交代。 */}
          <ChartText
            x={centre}
            y={height - 26}
            mobileY={height - 20}
            fontSize={12}
            mobileFontSize={width >= MIN_MOBILE_LABEL_WIDTH ? 26 : undefined}
            fill="#374151"
            opacity={dimmed ? 0.4 : 0.9}
          >
            {era.label}
          </ChartText>
          <text
            x={centre}
            y={height - 10}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="11"
            fill="#4b5563"
            opacity={dimmed ? 0.4 : 0.9}
            className="hidden md:block"
          >
            {meanPerYear === null ? '無釋字資料' : `年均 ${meanPerYear.toFixed(1)} 件`}
          </text>
        </g>
      )}
    </g>
  );
}
