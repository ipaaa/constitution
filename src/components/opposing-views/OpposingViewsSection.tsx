'use client';

import React, { useCallback, useState } from 'react';
import type { OpposingView } from '@/components/SharedPresent';
import { OpposingViewCard } from './OpposingViewCard';

export const OpposingViewsSection = ({
  views,
  articleId,
}: {
  views: OpposingView[];
  articleId: string;
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (views.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="不同立場的論述"
      className="mt-16 pt-12 border-t border-gray-200"
      data-article-id={articleId}
    >
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-px bg-[#90A4AE]" />
        <span className="text-[10px] font-black text-[#78909C] uppercase tracking-widest">
          Different Perspectives / 不同立場的論述
        </span>
        <div className="flex-1 h-px bg-[#90A4AE]" />
      </div>

      {/* Framing text */}
      <p className="text-sm font-serif text-gray-500 leading-relaxed mb-8 italic">
        以下收錄不同立場的論述，供讀者參照比較。每則論述均附有編輯團隊的脈絡說明。
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-6">
        {views.map(view => (
          <OpposingViewCard
            key={view.id}
            view={view}
            isExpanded={expandedIds.has(view.id)}
            onToggle={() => handleToggle(view.id)}
          />
        ))}
      </div>
    </section>
  );
};
