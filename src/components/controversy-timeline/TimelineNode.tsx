'use client';

import { useState } from 'react';
import type { TimelineEvent, CategoryDef } from '@/data/controversy-timeline';
import JusticeStanceTooltip from './JusticeStanceTooltip';

interface TimelineNodeProps {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isLeft: boolean;
  categories: CategoryDef[];
}

const CATEGORY_DOT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  teal: 'bg-teal-500',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700',
  red: 'bg-red-50 text-red-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  teal: 'bg-teal-50 text-teal-700',
};

export default function TimelineNode({
  event,
  isExpanded,
  onToggle,
  isLeft,
  categories,
}: TimelineNodeProps) {
  const [showStances, setShowStances] = useState(false);
  const category = categories.find((c) => c.id === event.category);
  const dotColor = CATEGORY_DOT_COLORS[category?.color || 'blue'];
  const badgeColor = CATEGORY_BADGE_COLORS[category?.color || 'blue'];
  const dotSize = event.significance === 'high' ? 'w-4 h-4' : 'w-3 h-3';

  return (
    <div className="relative flex items-start pb-8 md:pb-10">
      {/* Dot on the axis */}
      <div
        className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 z-10 group"
        onMouseEnter={() => event.justiceStances && setShowStances(true)}
        onMouseLeave={() => setShowStances(false)}
        onTouchStart={() => event.justiceStances && setShowStances((v) => !v)}
      >
        <div className={`${dotSize} rounded-full ${dotColor} border-2 border-white shadow-sm ring-2 ring-gray-200 transition-transform duration-200 ${event.justiceStances ? 'cursor-pointer hover:scale-150' : ''}`} />
        {/* Justice stance tooltip */}
        {showStances && event.justiceStances && (
          <JusticeStanceTooltip
            stances={event.justiceStances}
            eventTitle={event.title}
          />
        )}
      </div>

      {/* Card - mobile: always right; desktop: alternate */}
      <div
        className={`
          ml-10 md:ml-0 md:w-[calc(50%-2rem)]
          ${isLeft ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8'}
        `}
      >
        <button
          onClick={() => onToggle(event.id)}
          className="w-full text-left md:text-inherit bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
          aria-expanded={isExpanded}
        >
          {/* Date & category */}
          <div className={`flex flex-wrap items-center gap-2 mb-1.5 ${isLeft ? 'md:justify-end' : ''}`}>
            <span className="text-xs text-gray-400 font-mono">{event.dateLabel}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${badgeColor}`}>
              {category?.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-gray-900 text-base mb-1">
            {event.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {event.summary}
          </p>

          {/* Justice stance indicator */}
          {event.justiceStances && (
            <p className="text-xs text-purple-500 mt-2 font-medium">
              有大法官立場資訊（懸停時間軸節點查看）
            </p>
          )}
        </button>

        {/* Expandable detail */}
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
            <p className="text-sm text-gray-700 leading-relaxed font-serif mb-4">
              {event.detail}
            </p>

            {/* Consequence callout */}
            <div className="bg-white border-l-4 border-amber-400 p-3 rounded-r-sm">
              <p className="text-xs font-bold text-amber-700 mb-0.5">影響</p>
              <p className="text-sm text-gray-700">{event.consequence}</p>
            </div>

            {/* Actors */}
            {event.actors.length > 0 && (
              <div className={`mt-3 flex flex-wrap gap-1.5 ${isLeft ? 'md:justify-end' : ''}`}>
                {event.actors.map((actor) => (
                  <span
                    key={actor}
                    className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            )}

            {/* Justice stances in expanded view */}
            {event.justiceStances && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-bold text-purple-700 mb-2">大法官立場</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.justiceStances.map((js) => (
                    <div key={js.name} className="text-xs bg-white border border-gray-100 rounded p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-gray-800">{js.name}</span>
                        <span className={`px-1 py-0.5 rounded text-[10px] ${
                          js.opinionType === '多數意見' ? 'bg-green-50 text-green-700' :
                          js.opinionType === '協同意見' ? 'bg-blue-50 text-blue-700' :
                          js.opinionType === '不同意見' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {js.opinionType}
                        </span>
                      </div>
                      <p className="text-gray-600">{js.stance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
