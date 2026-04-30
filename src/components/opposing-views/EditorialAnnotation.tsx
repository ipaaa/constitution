import React from 'react';
import type { SourceRef } from '@/components/SharedPresent';

export const EditorialAnnotation = ({
  annotation,
  sources,
}: {
  annotation: string;
  sources?: SourceRef[];
}) => {
  return (
    <div className="bg-[#f8f9fa] border-l-4 border-[#90A4AE] p-4 md:ml-4 ml-0 mt-3 rounded-r-sm">
      <span className="block text-[10px] font-black text-[#607D8B] uppercase tracking-widest mb-2">
        編輯註記
      </span>
      <p className="text-sm font-serif text-gray-700 leading-relaxed">
        {annotation}
      </p>
      {sources && sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sources.map((src, i) =>
            src.url ? (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#546E7A] underline underline-offset-2 hover:text-[#37474F] transition-colors"
              >
                {src.label}
              </a>
            ) : (
              <span key={i} className="text-xs text-[#546E7A]">
                {src.label}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};
