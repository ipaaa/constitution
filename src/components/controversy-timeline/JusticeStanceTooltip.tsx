'use client';

import type { JusticeStance } from '@/data/controversy-timeline';

interface JusticeStanceTooltipProps {
  stances: JusticeStance[];
  eventTitle: string;
}

export default function JusticeStanceTooltip({ stances, eventTitle }: JusticeStanceTooltipProps) {
  return (
    <div className="absolute left-6 top-0 z-50 w-72 bg-white border border-gray-200 rounded shadow-lg p-3 pointer-events-none">
      <p className="text-xs font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1.5">
        {eventTitle} — 大法官立場
      </p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {stances.map((s) => (
          <div key={s.name} className="flex items-start gap-1.5 text-[11px]">
            <span className="font-bold text-gray-700 whitespace-nowrap">{s.name}</span>
            <span className={`shrink-0 px-1 rounded text-[9px] leading-4 ${
              s.opinionType === '多數意見' ? 'bg-green-50 text-green-700' :
              s.opinionType === '協同意見' ? 'bg-blue-50 text-blue-700' :
              s.opinionType === '不同意見' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              {s.opinionType}
            </span>
            <span className="text-gray-500">{s.stance}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
