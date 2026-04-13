'use client';

import React, { useEffect, useState } from 'react';
import { CRISIS_STATS } from '@/data/future';

interface BottleneckFunnelProps {
  filteredCount: number;
  totalCount: number;
}

interface Particle {
  id: number;
  delay: number;
  duration: number;
  yOffset: number;
}

export default function BottleneckFunnel({ filteredCount, totalCount }: BottleneckFunnelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles for animation
  const particles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    delay: (i * 0.4) % 6,
    duration: 4 + (i % 3),
    yOffset: ((i * 17) % 60) - 30,
  }));

  const ratio = totalCount > 0 ? filteredCount / totalCount : 1;
  const estimatedYears = (filteredCount / CRISIS_STATS.activeJustices * CRISIS_STATS.avgDaysPerCase / 365).toFixed(1);

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-white border border-gray-200 rounded-sm">
          <div className="font-mono text-3xl font-bold text-gray-900">{filteredCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">待審案件</div>
        </div>
        <div className="text-center p-4 bg-white border border-red-200 rounded-sm relative">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <div className="font-mono text-3xl font-bold text-[#D32F2F]">{CRISIS_STATS.activeJustices}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">現存大法官</div>
        </div>
        <div className="text-center p-4 bg-white border border-gray-200 rounded-sm">
          <div className="font-mono text-3xl font-bold text-gray-900">{estimatedYears}<span className="text-lg text-gray-400">年</span></div>
          <div className="text-xs text-gray-500 mt-1 font-medium">預估清理時間</div>
        </div>
      </div>

      {/* SVG Funnel */}
      <div className="relative bg-white border border-gray-200 rounded-sm p-4 overflow-hidden" style={{ height: 240 }}>
        <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Gradient for the wide entry */}
            <linearGradient id="funnelGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#94a3b8" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#D32F2F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Funnel shape - wide on left, narrow bottleneck on right */}
          <path
            d="M 50 10 L 350 70 L 550 70 L 750 10 L 750 190 L 550 130 L 350 130 L 50 190 Z"
            fill="url(#funnelGrad)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Bottleneck zone highlight */}
          <rect x="350" y="70" width="200" height="60" fill="#D32F2F" fillOpacity="0.06" rx="2" />
          <line x1="350" y1="70" x2="350" y2="130" stroke="#D32F2F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          <line x1="550" y1="70" x2="550" y2="130" stroke="#D32F2F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />

          {/* 5 Justice lines in bottleneck */}
          {[82, 91, 100, 109, 118].map((y, i) => (
            <line key={i} x1="360" y1={y} x2="540" y2={y} stroke="#1e293b" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          ))}

          {/* Animated particles flowing through */}
          {mounted && particles.map((p) => (
            <circle
              key={p.id}
              r="3"
              fill={ratio < 0.3 ? '#3b82f6' : '#64748b'}
              opacity="0.6"
            >
              <animateMotion
                dur={`${p.duration}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
                path={`M 80 ${100 + p.yOffset} C 200 ${100 + p.yOffset * 0.5} 300 ${100 + p.yOffset * 0.2} 450 100 S 600 ${100 - p.yOffset * 0.2} 720 ${100 - p.yOffset}`}
              />
            </circle>
          ))}

          {/* Labels */}
          <text x="120" y="105" textAnchor="middle" className="text-[11px]" fill="#64748b" fontFamily="monospace" fontWeight="600">
            {filteredCount} 件排隊中
          </text>
          <text x="450" y="60" textAnchor="middle" className="text-[10px]" fill="#D32F2F" fontFamily="monospace" fontWeight="700">
            BOTTLENECK: 5 JUSTICES
          </text>
          <text x="680" y="105" textAnchor="middle" className="text-[11px]" fill="#64748b" fontFamily="monospace" fontWeight="600">
            已審結
          </text>
        </svg>

        {/* Overlaid explanation */}
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          Case Flow Visualization / Rehabilitation Period
        </div>
      </div>

      {/* Capacity bar */}
      <div className="mt-4 bg-white border border-gray-200 rounded-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">法庭人力容量</span>
          <span className="text-xs font-mono text-[#D32F2F] font-bold">{CRISIS_STATS.activeJustices} / {CRISIS_STATS.designatedTotal}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D32F2F] rounded-full transition-all duration-1000"
            style={{ width: `${(CRISIS_STATS.activeJustices / CRISIS_STATS.designatedTotal) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-gray-400">{CRISIS_STATS.vacantSeats} 席空缺</span>
          <span className="text-[10px] text-gray-400">需 {CRISIS_STATS.requiredForRuling} 人始得判決</span>
        </div>
      </div>
    </div>
  );
}
