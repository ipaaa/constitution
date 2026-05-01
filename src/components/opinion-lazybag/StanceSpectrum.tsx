'use client';

import { useState } from 'react';

/* ─── Data: Justice positions on two dimensions ─── */

type OpinionType = '多數意見' | '協同意見' | '不同意見';

interface JusticePosition {
  name: string;
  type: OpinionType;
  /** X: -1 (尊重國會裁量) to 1 (嚴格審查立法) */
  x: number;
  /** Y: -1 (程序問題可補正) to 1 (程序違憲即無效) */
  y: number;
}

const JUSTICES: JusticePosition[] = [
  // 多數意見 — generally strict review + procedure matters
  { name: '許宗力', type: '多數意見', x: 0.7, y: 0.8 },
  { name: '蔡烱燉', type: '多數意見', x: 0.6, y: 0.7 },
  { name: '黃虹霞', type: '多數意見', x: 0.55, y: 0.65 },
  { name: '吳陳鐶', type: '多數意見', x: 0.5, y: 0.6 },
  { name: '蔡明誠', type: '多數意見', x: 0.6, y: 0.55 },
  { name: '林俊益', type: '多數意見', x: 0.5, y: 0.7 },
  { name: '許志雄', type: '多數意見', x: 0.65, y: 0.75 },
  { name: '張瓊文', type: '多數意見', x: 0.55, y: 0.6 },
  { name: '黃瑞明', type: '多數意見', x: 0.6, y: 0.65 },
  { name: '詹森林', type: '多數意見', x: 0.5, y: 0.55 },
  // 協同意見 — agree on outcome but different reasoning emphasis
  { name: '黃昭元', type: '協同意見', x: 0.4, y: 0.45 },
  { name: '謝銘洋', type: '協同意見', x: 0.35, y: 0.5 },
  // 不同意見 — defer to legislature, procedure is fixable
  { name: '呂太郎', type: '不同意見', x: -0.5, y: -0.6 },
  { name: '楊惠欽', type: '不同意見', x: -0.6, y: -0.5 },
];

const TYPE_COLORS: Record<OpinionType, { dot: string; text: string }> = {
  '多數意見': { dot: '#3b82f6', text: 'text-blue-600' },
  '協同意見': { dot: '#f59e0b', text: 'text-amber-600' },
  '不同意見': { dot: '#6b7280', text: 'text-gray-600' },
};

/* ─── Component ─── */

export default function StanceSpectrum() {
  const [hovered, setHovered] = useState<string | null>(null);

  // Plot area dimensions (relative, rendered via percentage positioning)
  const PADDING = 12; // percent from edges for dots

  function toPercent(value: number): number {
    // Map -1..1 to PADDING..(100-PADDING)
    return PADDING + ((value + 1) / 2) * (100 - 2 * PADDING);
  }

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs text-gray-600">
        {(Object.keys(TYPE_COLORS) as OpinionType[]).map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type].dot }}
            />
            {type}
          </span>
        ))}
      </div>

      {/* Scatter plot container */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="relative w-full aspect-square max-w-[540px] mx-auto">
          {/* Axis lines */}
          <div className="absolute inset-0">
            {/* Vertical center line */}
            <div className="absolute left-1/2 top-[4%] bottom-[4%] w-px bg-gray-200" />
            {/* Horizontal center line */}
            <div className="absolute top-1/2 left-[4%] right-[4%] h-px bg-gray-200" />
          </div>

          {/* Axis labels */}
          {/* X axis */}
          <span className="absolute bottom-0 left-[4%] text-[10px] md:text-xs text-gray-400 font-serif">
            尊重國會裁量
          </span>
          <span className="absolute bottom-0 right-[4%] text-[10px] md:text-xs text-gray-400 font-serif text-right">
            嚴格審查立法
          </span>
          {/* Y axis */}
          <span className="absolute top-[2%] left-[4%] text-[10px] md:text-xs text-gray-400 font-serif">
            程序違憲即無效
          </span>
          <span className="absolute bottom-[6%] left-[4%] text-[10px] md:text-xs text-gray-400 font-serif md:bottom-[4%]">
            程序問題可補正
          </span>

          {/* Dots */}
          {JUSTICES.map((justice) => {
            const left = toPercent(justice.x);
            // Y is inverted: high Y value = top of chart
            const top = 100 - toPercent(justice.y);
            const isHovered = hovered === justice.name;

            return (
              <div
                key={justice.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${left}%`, top: `${top}%` }}
                onMouseEnter={() => setHovered(justice.name)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Dot */}
                <div
                  className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow-sm transition-transform"
                  style={{
                    backgroundColor: TYPE_COLORS[justice.type].dot,
                    transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                  }}
                />
                {/* Name label */}
                <span
                  className={`absolute left-full ml-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] md:text-xs font-medium transition-opacity ${TYPE_COLORS[justice.type].text} ${isHovered ? 'opacity-100' : 'opacity-70 md:opacity-100'}`}
                >
                  {justice.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footnote */}
      <p className="text-xs text-gray-400 font-serif leading-relaxed">
        位置根據各大法官在本案意見書中展現的論證傾向推估，僅供理解思路差異之參考，非精確量化數據。
      </p>
    </div>
  );
}
