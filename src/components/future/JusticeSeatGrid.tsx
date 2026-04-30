'use client';

import React from 'react';
import { JUSTICES, ACTIVE_JUSTICES, CRISIS_STATS } from '@/data/future';

export default function JusticeSeatGrid() {
  const activeCount = ACTIVE_JUSTICES.length;
  const totalSeats = CRISIS_STATS.designatedTotal;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-serif text-white text-sm font-bold">大法官席次</h4>
        <span className="font-mono text-xs text-gray-400">
          {activeCount} / {totalSeats} 在任
        </span>
      </div>

      {/* 15-seat grid: 3 rows x 5 columns */}
      <div className="grid grid-cols-5 gap-2">
        {JUSTICES.map((justice) => (
          <div
            key={justice.id}
            className="relative group"
          >
            <div
              className={`w-full aspect-square rounded-sm flex items-center justify-center text-[9px] font-mono transition-colors ${
                justice.isActive
                  ? 'bg-[#D32F2F] text-white'
                  : 'bg-gray-800 text-gray-600 border border-gray-700'
              }`}
            >
              {justice.isActive && (
                <span className="absolute inset-0 rounded-sm bg-[#D32F2F] animate-pulse opacity-30" />
              )}
              <span className="relative z-10">
                {justice.isActive ? justice.name.charAt(0) : ''}
              </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-gray-600">
              {justice.name}
              <br />
              {justice.isActive ? '在任' : '已卸任'}
              {' '}— {justice.termExpiry}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D32F2F]" />
          <span>在任 Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" />
          <span>空缺 Vacant</span>
        </div>
      </div>
    </div>
  );
}
