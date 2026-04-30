'use client';

import { useMemo, useRef } from 'react';
import type { OpinionEntry, DimensionDef } from '@/data/opinions';
import { STANCE_NUMERIC, type StanceValue } from '@/data/opinions';
import OpinionTooltip from './OpinionTooltip';

interface OpinionScatterPlotProps {
  opinions: OpinionEntry[];
  xDim: DimensionDef;
  yDim: DimensionDef;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

const STANCE_ORDER: StanceValue[] = ['oppose', 'lean-oppose', 'neutral', 'lean-support', 'support'];
const PLOT_PADDING = 60;
const PLOT_WIDTH = 560;
const PLOT_HEIGHT = 460;
const INNER_WIDTH = PLOT_WIDTH - PLOT_PADDING * 2;
const INNER_HEIGHT = PLOT_HEIGHT - PLOT_PADDING * 2;

function stanceToPixel(stance: StanceValue, range: number): number {
  const numeric = STANCE_NUMERIC[stance];
  // Map -2..2 to 0..range
  return ((numeric + 2) / 4) * range;
}

export default function OpinionScatterPlot({
  opinions,
  xDim,
  yDim,
  hoveredId,
  onHover,
}: OpinionScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Jitter overlapping dots
  const dots = useMemo(() => {
    const positionMap = new Map<string, number>();
    return opinions.map((op) => {
      const rawX = stanceToPixel(op.stances[xDim.id], INNER_WIDTH);
      const rawY = INNER_HEIGHT - stanceToPixel(op.stances[yDim.id], INNER_HEIGHT);
      const key = `${rawX},${rawY}`;
      const count = positionMap.get(key) || 0;
      positionMap.set(key, count + 1);
      // Jitter in a small spiral pattern
      const angle = count * 2.4; // golden angle
      const radius = count * 6;
      const jitterX = Math.cos(angle) * radius;
      const jitterY = Math.sin(angle) * radius;
      return {
        op,
        cx: PLOT_PADDING + rawX + jitterX,
        cy: PLOT_PADDING + rawY + jitterY,
      };
    });
  }, [opinions, xDim.id, yDim.id]);

  const hoveredDot = dots.find((d) => d.op.id === hoveredId);

  return (
    <div className="relative" ref={containerRef}>
      {/* Scrollable container for mobile */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: PLOT_WIDTH }}>
          <svg
            viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
            className="w-full h-auto"
            style={{ maxHeight: 500 }}
            role="img"
            aria-label={`散布圖：X 軸為${xDim.label}，Y 軸為${yDim.label}，共 ${opinions.length} 個意見論點`}
          >
            {/* Quadrant shading */}
            <rect
              x={PLOT_PADDING}
              y={PLOT_PADDING}
              width={INNER_WIDTH / 2}
              height={INNER_HEIGHT / 2}
              fill="#f59e0b"
              fillOpacity={0.03}
            />
            <rect
              x={PLOT_PADDING + INNER_WIDTH / 2}
              y={PLOT_PADDING}
              width={INNER_WIDTH / 2}
              height={INNER_HEIGHT / 2}
              fill="#6b7280"
              fillOpacity={0.03}
            />
            <rect
              x={PLOT_PADDING}
              y={PLOT_PADDING + INNER_HEIGHT / 2}
              width={INNER_WIDTH / 2}
              height={INNER_HEIGHT / 2}
              fill="#6b7280"
              fillOpacity={0.03}
            />
            <rect
              x={PLOT_PADDING + INNER_WIDTH / 2}
              y={PLOT_PADDING + INNER_HEIGHT / 2}
              width={INNER_WIDTH / 2}
              height={INNER_HEIGHT / 2}
              fill="#3b82f6"
              fillOpacity={0.03}
            />

            {/* Grid lines */}
            {STANCE_ORDER.map((stance, i) => {
              const x = PLOT_PADDING + stanceToPixel(stance, INNER_WIDTH);
              const y = PLOT_PADDING + INNER_HEIGHT - stanceToPixel(stance, INNER_HEIGHT);
              return (
                <g key={stance}>
                  <line
                    x1={x}
                    y1={PLOT_PADDING}
                    x2={x}
                    y2={PLOT_PADDING + INNER_HEIGHT}
                    stroke="#e5e7eb"
                    strokeWidth={stance === 'neutral' ? 1.5 : 0.5}
                    strokeDasharray={stance === 'neutral' ? undefined : '4 3'}
                  />
                  <line
                    x1={PLOT_PADDING}
                    y1={y}
                    x2={PLOT_PADDING + INNER_WIDTH}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={stance === 'neutral' ? 1.5 : 0.5}
                    strokeDasharray={stance === 'neutral' ? undefined : '4 3'}
                  />
                </g>
              );
            })}

            {/* Axis labels */}
            {/* X axis */}
            <text
              x={PLOT_PADDING}
              y={PLOT_HEIGHT - 8}
              textAnchor="start"
              className="text-[10px]"
              fill="#9ca3af"
              fontFamily="sans-serif"
              fontWeight={500}
            >
              {xDim.opposeLabel}
            </text>
            <text
              x={PLOT_PADDING + INNER_WIDTH}
              y={PLOT_HEIGHT - 8}
              textAnchor="end"
              className="text-[10px]"
              fill="#9ca3af"
              fontFamily="sans-serif"
              fontWeight={500}
            >
              {xDim.supportLabel}
            </text>
            <text
              x={PLOT_PADDING + INNER_WIDTH / 2}
              y={PLOT_HEIGHT - 8}
              textAnchor="middle"
              className="text-[11px]"
              fill="#6b7280"
              fontFamily="sans-serif"
              fontWeight={600}
            >
              {xDim.label}
            </text>

            {/* Y axis */}
            <text
              x={12}
              y={PLOT_PADDING + INNER_HEIGHT}
              textAnchor="start"
              className="text-[10px]"
              fill="#9ca3af"
              fontFamily="sans-serif"
              fontWeight={500}
              transform={`rotate(-90, 12, ${PLOT_PADDING + INNER_HEIGHT})`}
            >
              {yDim.opposeLabel}
            </text>
            <text
              x={12}
              y={PLOT_PADDING}
              textAnchor="end"
              className="text-[10px]"
              fill="#9ca3af"
              fontFamily="sans-serif"
              fontWeight={500}
              transform={`rotate(-90, 12, ${PLOT_PADDING})`}
            >
              {yDim.supportLabel}
            </text>
            <text
              x={12}
              y={PLOT_PADDING + INNER_HEIGHT / 2}
              textAnchor="middle"
              className="text-[11px]"
              fill="#6b7280"
              fontFamily="sans-serif"
              fontWeight={600}
              transform={`rotate(-90, 12, ${PLOT_PADDING + INNER_HEIGHT / 2})`}
            >
              {yDim.label}
            </text>

            {/* Opinion dots */}
            {dots.map(({ op, cx, cy }) => (
              <circle
                key={op.id}
                cx={cx}
                cy={cy}
                r={hoveredId === op.id ? 10 : 7}
                fill={hoveredId === op.id ? '#1e40af' : '#3b82f6'}
                fillOpacity={hoveredId === op.id ? 0.9 : 0.7}
                stroke={hoveredId === op.id ? '#1e3a8a' : '#fff'}
                strokeWidth={hoveredId === op.id ? 2.5 : 1.5}
                className="transition-all duration-150 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`意見 ${op.id}: ${op.argumentSummary.slice(0, 30)}...`}
                onMouseEnter={() => onHover(op.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(op.id)}
                onBlur={() => onHover(null)}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Desktop tooltip */}
      {hoveredDot && (
        <OpinionTooltip
          opinion={hoveredDot.op}
          xDim={xDim}
          yDim={yDim}
          style={{
            top: Math.min(hoveredDot.cy - 20, PLOT_HEIGHT - 200),
            left: hoveredDot.cx > PLOT_WIDTH / 2
              ? hoveredDot.cx - 300
              : hoveredDot.cx + 20,
          }}
        />
      )}

      {/* Mobile tooltip (bottom sheet) */}
      {hoveredId && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-bottom">
          {(() => {
            const op = opinions.find((o) => o.id === hoveredId);
            if (!op) return null;
            return (
              <>
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                  {op.rulingRef}
                </div>
                {op.category && (
                  <div className="text-[10px] font-medium text-gray-500 mb-1">{op.category}</div>
                )}
                <p className="text-sm text-gray-800 font-serif leading-relaxed mb-2">
                  {op.argumentSummary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border ${
                    op.stances[xDim.id].includes('support') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    op.stances[xDim.id].includes('oppose') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {xDim.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border ${
                    op.stances[yDim.id].includes('support') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    op.stances[yDim.id].includes('oppose') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {yDim.label}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
