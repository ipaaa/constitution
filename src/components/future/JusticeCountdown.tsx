'use client';

import React from 'react';
import { DAYS_UNTIL_CLIFF, TERM_EVENTS, ATTENDING_JUSTICES } from '@/data/future';

export default function JusticeCountdown() {
  const nextCliff = TERM_EVENTS[TERM_EVENTS.length - 1];

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-500">
          Countdown
        </span>
      </div>

      <div className="text-center py-2">
        <div className="font-mono text-4xl md:text-5xl font-bold text-gray-900 mb-1">
          {DAYS_UNTIL_CLIFF}
        </div>
        <div className="text-sm text-gray-500 font-serif">
          天後歸零
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed font-serif">
          {nextCliff.date.slice(0, 7).replace('-', '年')}月，最後 {ATTENDING_JUSTICES.length} 名大法官任期屆滿。届時憲法法庭將
          <strong className="text-[#D32F2F]">無任何成員</strong>。
        </p>
      </div>
    </div>
  );
}
