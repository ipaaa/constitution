'use client';

import React from 'react';
import { PendingCase, TAG_COLORS, IdentityTag } from '@/data/future';

interface CaseCardProps {
  case_: PendingCase;
}

function urgencyLevel(days: number): { label: string; color: string; barWidth: string } {
  if (days >= 700) return { label: '極度延遲', color: 'text-red-600', barWidth: 'w-full' };
  if (days >= 400) return { label: '嚴重延遲', color: 'text-orange-600', barWidth: 'w-3/4' };
  if (days >= 200) return { label: '中度延遲', color: 'text-yellow-600', barWidth: 'w-1/2' };
  return { label: '待審中', color: 'text-gray-500', barWidth: 'w-1/4' };
}

function urgencyBarColor(days: number): string {
  if (days >= 700) return 'bg-red-500';
  if (days >= 400) return 'bg-orange-400';
  if (days >= 200) return 'bg-yellow-400';
  return 'bg-gray-300';
}

const FILING_DATE_FMT = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatFilingDate(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  return FILING_DATE_FMT.format(new Date(ts));
}

export default function CaseCard({ case_ }: CaseCardProps) {
  const urgency = urgencyLevel(case_.daysPending);
  const years = (case_.daysPending / 365).toFixed(1);
  const filedOn = formatFilingDate(case_.filingDate);

  return (
    <div
      className={`bg-white border rounded-sm p-5 transition-all hover:shadow-md group relative overflow-hidden ${
        case_.daysPending >= 700
          ? 'border-red-200 shadow-sm'
          : case_.daysPending >= 400
          ? 'border-orange-200'
          : 'border-gray-200'
      }`}
    >
      {/* Urgency bar at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5">
        <div className={`h-full ${urgencyBarColor(case_.daysPending)} ${urgency.barWidth} transition-all`} />
      </div>

      {/* Topic */}
      <h4 className="font-serif font-bold text-gray-900 text-base leading-tight mb-2 group-hover:text-blue-900 transition-colors">
        {case_.topic}
      </h4>

      {/* Applicant + filing date */}
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm text-gray-500 truncate">{case_.applicant}</p>
        <time
          dateTime={case_.filingDate}
          className="font-mono text-[10px] text-gray-500 whitespace-nowrap"
        >
          申請 {filedOn}
        </time>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {case_.tags.map((tag) => {
          const colors = TAG_COLORS[tag as IdentityTag];
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {tag}
            </span>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-gray-900">{case_.daysPending}</span>
          <span className="text-xs text-gray-400">天 ({years} 年)</span>
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${urgency.color}`}>
          {urgency.label}
        </span>
      </div>
    </div>
  );
}
