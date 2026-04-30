'use client';

import React from 'react';
import { JUSTICES, ACTIVE_JUSTICES, CRISIS_STATS } from '@/data/future';

export default function JusticeSeatGrid() {
  const activeCount = ACTIVE_JUSTICES.length;
  const attendingCount = ACTIVE_JUSTICES.filter((j) => !j.absent).length;
  const totalSeats = CRISIS_STATS.designatedTotal;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-serif text-white text-sm font-bold">大法官席次</h4>
        <span className="font-mono text-xs text-gray-400">
          {attendingCount} 出席 / {activeCount} 在任 / {totalSeats} 席
        </span>
      </div>

      {/* 15-seat grid: 5 rows x 3 columns, rectangular cells for full names */}
      <div className="grid grid-cols-3 gap-2">
        {JUSTICES.map((justice) => {
          const isAttending = justice.isActive && !justice.absent;
          const isAbsent = justice.isActive && justice.absent;

          return (
            <div
              key={justice.id}
              className="relative group"
            >
              <div
                className={`w-full rounded-sm flex items-center justify-center py-2 px-1 text-xs font-mono transition-colors ${
                  isAttending
                    ? 'bg-[#D32F2F] text-white'
                    : isAbsent
                      ? 'bg-amber-700/60 text-amber-200 border border-amber-600'
                      : 'bg-gray-800 text-gray-600 border border-gray-700'
                }`}
              >
                {isAttending && (
                  <span className="absolute inset-0 rounded-sm bg-[#D32F2F] animate-pulse opacity-30" />
                )}
                <span className={`relative z-10 ${isAbsent ? 'line-through decoration-amber-400' : ''}`}>
                  {justice.isActive ? justice.name : ''}
                </span>
                {isAbsent && (
                  <span className="relative z-10 ml-1 text-[9px] text-amber-400 font-bold">
                    未出席
                  </span>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-gray-600">
                {justice.name}
                <br />
                {isAttending ? '在任（出席）' : isAbsent ? '在任（未出席）' : '已卸任'}
                {' '}— {justice.termExpiry}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D32F2F]" />
          <span>出席 Attending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-700/60 border border-amber-600" />
          <span>未出席 Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" />
          <span>空缺 Vacant</span>
        </div>
      </div>
    </div>
  );
}
