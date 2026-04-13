'use client';

import React from 'react';
import { AVAILABLE_TAGS, TAG_COLORS, IdentityTag } from '@/data/future';

interface RightsCalculatorProps {
  activeTags: IdentityTag[];
  onToggleTag: (tag: IdentityTag) => void;
  filteredCount: number;
  totalCount: number;
}

export default function RightsCalculator({
  activeTags,
  onToggleTag,
  filteredCount,
  totalCount,
}: RightsCalculatorProps) {
  const hasFilter = activeTags.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          Rights.filter()
        </div>
        <div className="flex-grow h-px bg-gray-100" />
        {hasFilter && (
          <button
            onClick={() => activeTags.forEach((t) => onToggleTag(t))}
            className="text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            清除全部
          </button>
        )}
      </div>

      <h3 className="font-serif font-bold text-gray-900 text-lg mb-1">
        權益計算機
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        選擇與您相關的身分，查看哪些待審案件影響您的權利。
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {AVAILABLE_TAGS.map((tag) => {
          const isActive = activeTags.includes(tag);
          const colors = TAG_COLORS[tag];
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`transition-all border px-3.5 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 ${
                isActive
                  ? `${colors.bg} ${colors.border} ${colors.text} shadow-sm`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full transition-colors ${isActive ? colors.dot : 'bg-gray-300'}`} />
              {tag}
            </button>
          );
        })}
      </div>

      {/* Result summary */}
      <div className={`border-t border-gray-100 pt-4 transition-all ${hasFilter ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-gray-900">{filteredCount}</span>
          <span className="text-sm text-gray-500">/ {totalCount} 件案件與您相關</span>
        </div>
        {hasFilter && (
          <p className="text-xs text-gray-400 mt-1">
            包含 {activeTags.join('、')} 相關權益
          </p>
        )}
      </div>
    </div>
  );
}
