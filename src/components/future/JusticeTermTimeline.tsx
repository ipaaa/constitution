'use client';

import React, { useState } from 'react';
import { TERM_EVENTS, REFERENCE_DATE, FAILED_NOMINATIONS, JUSTICES } from '@/data/future';
import JusticeCountdown from './JusticeCountdown';
import JusticeSeatGrid from './JusticeSeatGrid';

/**
 * SVG Line Chart showing justice seat count over time (2024–2032).
 * Drop points show when justices expire; hover reveals names.
 */

// Chart dimensions
const CHART_W = 720;
const CHART_H = 300;
const PAD = { top: 30, right: 30, bottom: 50, left: 50 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

// Time range: 2024-01-01 to 2032-01-01
const T_START = Date.parse('2024-01-01');
const T_END = Date.parse('2032-01-01');
const T_SPAN = T_END - T_START;

// Y range: 0 to 15
const Y_MAX = 15;

function xForDate(iso: string): number {
  const t = Date.parse(iso);
  return PAD.left + ((t - T_START) / T_SPAN) * PLOT_W;
}

function yForCount(count: number): number {
  return PAD.top + PLOT_H - (count / Y_MAX) * PLOT_H;
}

// Build the step-line data points
// Start: before first drop, all 15 active
// Each TERM_EVENT causes a drop
interface DataPoint {
  date: string;
  count: number;
  justicesExpiring: number;
  names: string[];
  label: string;
}

function buildDataPoints(): DataPoint[] {
  const points: DataPoint[] = [];

  // Starting point
  points.push({ date: '2024-01-01', count: 15, justicesExpiring: 0, names: [], label: '' });

  // Before each drop (just before the date)
  let currentCount = 15;
  for (const event of TERM_EVENTS) {
    // Point just before the drop (same count)
    points.push({ date: event.date, count: currentCount, justicesExpiring: 0, names: [], label: '' });

    // Find justices expiring at this date
    const expiringJustices = JUSTICES.filter((j) => j.termExpiry === event.date);
    const names = expiringJustices.map((j) => j.name);

    currentCount = event.justicesRemaining;
    // Point after the drop
    points.push({
      date: event.date,
      count: currentCount,
      justicesExpiring: event.justicesExpiring,
      names,
      label: event.label,
    });
  }

  // End point
  points.push({ date: '2032-01-01', count: currentCount, justicesExpiring: 0, names: [], label: '' });

  return points;
}

// Quorum threshold
const QUORUM = 10;

// Year markers for X axis
const YEAR_MARKS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

export default function JusticeTermTimeline() {
  const [hoveredDrop, setHoveredDrop] = useState<DataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dataPoints = buildDataPoints();

  // Build SVG path for the step line
  const pathParts: string[] = [];
  for (let i = 0; i < dataPoints.length; i++) {
    const p = dataPoints[i];
    const x = xForDate(p.date);
    const y = yForCount(p.count);
    if (i === 0) {
      pathParts.push(`M ${x} ${y}`);
    } else {
      pathParts.push(`L ${x} ${y}`);
    }
  }
  const linePath = pathParts.join(' ');

  // Drop points (where justicesExpiring > 0)
  const dropPoints = dataPoints.filter((p) => p.justicesExpiring > 0);

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="border-l-4 border-[#D32F2F] pl-4 mb-6">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900">
          大法官席次時間軸
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Justice Term Forecast — 未來三年席次變化預測
        </p>
      </div>

      {/* Light container for the line chart */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 md:p-6 mb-4 relative">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y axis grid lines */}
          {[0, 5, 10, 15].map((v) => (
            <g key={`y-${v}`}>
              <line
                x1={PAD.left}
                y1={yForCount(v)}
                x2={PAD.left + PLOT_W}
                y2={yForCount(v)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 10}
                y={yForCount(v) + 4}
                textAnchor="end"
                className="text-[11px] fill-gray-500"
                fontFamily="monospace"
                fontSize="11"
              >
                {v}
              </text>
            </g>
          ))}

          {/* X axis year labels and grid */}
          {YEAR_MARKS.map((year) => {
            const x = xForDate(`${year}-01-01`);
            return (
              <g key={`x-${year}`}>
                <line
                  x1={x}
                  y1={PAD.top}
                  x2={x}
                  y2={PAD.top + PLOT_H}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={PAD.top + PLOT_H + 20}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="11"
                  className="fill-gray-500"
                >
                  {year}
                </text>
              </g>
            );
          })}

          {/* Quorum threshold dashed line */}
          <line
            x1={PAD.left}
            y1={yForCount(QUORUM)}
            x2={PAD.left + PLOT_W}
            y2={yForCount(QUORUM)}
            stroke="#D32F2F"
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={0.5}
          />
          <text
            x={PAD.left + PLOT_W + 5}
            y={yForCount(QUORUM) + 4}
            fontFamily="monospace"
            fontSize="10"
            className="fill-red-500"
            fill="#D32F2F"
          >
            表決門檻
          </text>

          {/* "You are here" vertical line */}
          <line
            x1={xForDate(REFERENCE_DATE)}
            y1={PAD.top}
            x2={xForDate(REFERENCE_DATE)}
            y2={PAD.top + PLOT_H}
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <text
            x={xForDate(REFERENCE_DATE)}
            y={PAD.top - 8}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="9"
            fill="#6b7280"
          >
            TODAY
          </text>

          {/* Step line */}
          <path
            d={linePath}
            fill="none"
            stroke="#D32F2F"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Area fill under line */}
          <path
            d={`${linePath} L ${xForDate('2032-01-01')} ${yForCount(0)} L ${xForDate('2024-01-01')} ${yForCount(0)} Z`}
            fill="#D32F2F"
            opacity={0.06}
          />

          {/* Drop point circles (interactive) */}
          {dropPoints.map((dp) => {
            const cx = xForDate(dp.date);
            const cy = yForCount(dp.count);
            return (
              <g key={`drop-${dp.date}-${dp.count}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="#D32F2F"
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDrop(dp);
                    const svg = e.currentTarget.closest('svg');
                    if (svg) {
                      const rect = svg.getBoundingClientRect();
                      const scaleX = rect.width / CHART_W;
                      const scaleY = rect.height / CHART_H;
                      setTooltipPos({ x: cx * scaleX, y: cy * scaleY });
                    }
                  }}
                  onMouseLeave={() => setHoveredDrop(null)}
                />
                {/* Drop annotation */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#D32F2F"
                >
                  -{dp.justicesExpiring}
                </text>
              </g>
            );
          })}

          {/* Failed nomination markers */}
          {FAILED_NOMINATIONS.map((nom) => {
            const cx = xForDate(nom.date);
            const cy = PAD.top + PLOT_H + 38;
            return (
              <g key={`nom-${nom.date}`}>
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="10"
                  fill="#D32F2F"
                  opacity={0.7}
                >
                  ✕ 提名{nom.nomineesCount}人遭否決
                </text>
              </g>
            );
          })}

          {/* Y axis label */}
          <text
            x={14}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            fontFamily="serif"
            fontSize="11"
            fill="#6b7280"
            transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}
          >
            在任人數
          </text>
        </svg>

        {/* Tooltip (HTML overlay) */}
        {hoveredDrop && (
          <div
            className="absolute z-30 pointer-events-none bg-gray-900 text-white text-xs font-mono rounded px-3 py-2 shadow-lg -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 16 }}
          >
            <div className="font-bold mb-1">
              {hoveredDrop.date} — {hoveredDrop.justicesExpiring} 席屆滿
            </div>
            <div className="text-gray-300">
              {hoveredDrop.names.length > 0
                ? hoveredDrop.names.join('、')
                : hoveredDrop.label}
            </div>
            <div className="text-gray-400 mt-1">剩餘 {hoveredDrop.count} / 15 席</div>
          </div>
        )}

        {/* Bottom label */}
        <div className="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          Justice Seat Count / 大法官席次變化折線圖
        </div>
      </div>

      {/* Countdown + Seat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JusticeCountdown />
        <JusticeSeatGrid />
      </div>
    </section>
  );
}

