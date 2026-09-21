'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ERAS,
  FACTORS,
  YEARS,
  deriveEraStats,
  type ThresholdEra,
} from '@/data/threshold-analysis';
import ThresholdChart, { PAD, SLOT_W, VIEW_H, VIEW_W, xForYear, yForCount } from './ThresholdChart';
import ThresholdTooltip from './ThresholdTooltip';
import EraComparisonStrip from './EraComparisonStrip';
import SeriesBoundaryNote from './SeriesBoundaryNote';
import OchreBandFactors from './OchreBandFactors';

/**
 * 協調者。持有 hoveredYear 與 selectedEraId，資料自 @/data/threshold-analysis import。
 *
 * 桌機用滑鼠 hover 讀逐年數字；行動版放棄逐年 hover，改為點色帶選取時期。
 * 375px 下每個年長條約 3.5px，遠低於可觸控尺寸，硬做會變成誤觸。
 *
 * 斷點以 matchMedia 判斷，初值固定為 false 再於 useEffect 校正，
 * 讓伺服器端與用戶端的第一次渲染一致，不觸發 hydration 警告。
 */
const DESKTOP_QUERY = '(min-width: 768px)';

export default function ThresholdCaseAnalysis() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedEraId, setSelectedEraId] = useState<ThresholdEra['id'] | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const stats = useMemo(() => deriveEraStats(YEARS, ERAS), []);

  const handleHoverYear = useCallback(
    (year: number | null) => {
      if (isDesktop) setHoveredYear(year);
    },
    [isDesktop],
  );

  // 圖上的色帶選取只在行動版有效。桌機用 hover 讀逐年數字，色帶不參與選取。
  const handleChartSelectEra = useCallback(
    (id: ThresholdEra['id'] | null) => {
      if (!isDesktop) setSelectedEraId(id);
    },
    [isDesktop],
  );

  // 斷點切換後把不屬於該版面的狀態算掉，不用 effect 改 state。
  const chartHoveredYear = isDesktop ? hoveredYear : null;
  const chartSelectedEraId = isDesktop ? null : selectedEraId;

  const hovered =
    chartHoveredYear === null ? null : YEARS.find((y) => y.year === chartHoveredYear) ?? null;

  // 該年所屬的時期。換法當年由兩期共用，因此 effectiveTo 那一年算含。
  // 憲判字年份不歸任何門檻時期：釋字序列已終止，那幾年沒有釋字可歸。
  const hoveredEras = useMemo(() => {
    if (!hovered || hovered.series !== 'interpretation') return [];
    return ERAS.filter((era) => {
      const from = Number(era.effectiveFrom.slice(0, 4));
      const to = era.effectiveTo === null ? Infinity : Number(era.effectiveTo.slice(0, 4));
      return hovered.year >= from && hovered.year <= to;
    });
  }, [hovered]);

  // tooltip 的錨點以百分比表示，跟著 SVG 的 viewBox 一起縮放。
  const tooltipPos = hovered
    ? {
        x: ((xForYear(hovered.year) + SLOT_W / 2) / VIEW_W) * 100,
        y: ((PAD.top + yForCount(hovered.count)) / VIEW_H) * 100,
      }
    : null;

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-sm p-4 md:p-6 relative">
        <ThresholdChart
          years={YEARS}
          eras={ERAS}
          stats={stats}
          hoveredYear={chartHoveredYear}
          selectedEraId={chartSelectedEraId}
          onHoverYear={handleHoverYear}
          onSelectEra={handleChartSelectEra}
        />

        {hovered && tooltipPos && (
          <ThresholdTooltip year={hovered} eras={hoveredEras} x={tooltipPos.x} y={tooltipPos.y} />
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[#111827]" aria-hidden="true" />
            釋字（解釋）1949–2021
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[#D32F2F]" aria-hidden="true" />
            憲判字（判決）2022–2026
          </span>
          <span className="hidden md:inline">滑鼠移到長條上看單一年份</span>
          <span className="md:hidden">點色帶選取時期，下方會展開該期逐年件數</span>
        </div>
      </div>

      <EraComparisonStrip
        items={stats}
        selectedEraId={selectedEraId}
        onSelectEra={setSelectedEraId}
      />

      <SeriesBoundaryNote />

      <OchreBandFactors factors={FACTORS} />
    </div>
  );
}
