'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { OpposingView } from '@/components/SharedPresent';
import { EditorialAnnotation } from './EditorialAnnotation';

export const OpposingViewCard = ({
  view,
  isExpanded,
  onToggle,
}: {
  view: OpposingView;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const sourceText = [
    view.source.author,
    view.source.affiliation,
    view.source.year,
  ]
    .filter(Boolean)
    .join('，');

  return (
    <div className="bg-[#F5F7FA] border-l-4 border-[#78909C] p-4 md:p-6 rounded-r-sm shadow-sm">
      {/* Stance label */}
      <div className="text-[10px] font-black text-[#607D8B] uppercase tracking-widest mb-2">
        立場觀點
      </div>
      <h4 className="text-base md:text-lg font-serif font-bold text-gray-900 leading-snug mb-2">
        {view.stanceLabel}
      </h4>

      {/* Summary */}
      <p className="text-sm font-serif text-gray-700 leading-relaxed mb-3">
        {view.summary}
      </p>

      {/* Source attribution */}
      <div className="text-xs text-[#78909C] font-medium mb-3">
        {sourceText}
      </div>

      {/* Expand/collapse toggle */}
      {view.fullArgument && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#546E7A] hover:text-[#37474F] uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78909C] rounded-sm px-1 py-0.5"
        >
          {isExpanded ? (
            <>
              收合全文 <ChevronUp size={14} aria-hidden="true" />
            </>
          ) : (
            <>
              展開全文 <ChevronDown size={14} aria-hidden="true" />
            </>
          )}
        </button>
      )}

      {/* Full argument (collapsible) */}
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? '2000px' : '0px' }}
      >
        {view.fullArgument && (
          <div className="pt-4 mt-3 border-t border-[#CFD8DC]">
            <p className="text-sm font-serif text-gray-700 leading-relaxed whitespace-pre-line">
              {view.fullArgument}
            </p>
          </div>
        )}
      </div>

      {/* Editorial annotation */}
      <EditorialAnnotation
        annotation={view.editorialNote}
        sources={view.editorialSources}
      />
    </div>
  );
};
