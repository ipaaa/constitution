'use client';

import { useState, useMemo } from 'react';
import type { OpinionEntry, DimensionDef } from '@/data/opinions';
import ArgumentTag from './ArgumentTag';

interface OpinionTableProps {
  opinions: OpinionEntry[];
  dimensions: DimensionDef[];
  highlightId: string | null;
  onHover: (id: string | null) => void;
}

type SortKey = 'id' | 'category' | string; // string = dimension id
type SortDir = 'asc' | 'desc';

export default function OpinionTable({ opinions, dimensions, highlightId, onHover }: OpinionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...opinions].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') {
        cmp = a.id.localeCompare(b.id);
      } else if (sortKey === 'category') {
        cmp = (a.category || '').localeCompare(b.category || '');
      } else {
        // Dimension sort by stance numeric value
        const stanceOrder = { 'support': 2, 'lean-support': 1, 'neutral': 0, 'lean-oppose': -1, 'oppose': -2 };
        const aVal = stanceOrder[a.stances[sortKey]] ?? 0;
        const bVal = stanceOrder[b.stances[sortKey]] ?? 0;
        cmp = aVal - bVal;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [opinions, sortKey, sortDir]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th
                scope="col"
                className="text-left py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('id')}
              >
                編號{sortIndicator('id')}
              </th>
              <th
                scope="col"
                className="text-left py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('category')}
              >
                類別{sortIndicator('category')}
              </th>
              <th scope="col" className="text-left py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                論點摘要
              </th>
              {dimensions.map((dim) => (
                <th
                  key={dim.id}
                  scope="col"
                  className="text-left py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:text-gray-700 whitespace-nowrap"
                  onClick={() => toggleSort(dim.id)}
                >
                  {dim.label}{sortIndicator(dim.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((op) => (
              <tr
                key={op.id}
                className={`border-b border-gray-100 transition-colors cursor-pointer
                  ${highlightId === op.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onMouseEnter={() => onHover(op.id)}
                onMouseLeave={() => onHover(null)}
              >
                <td className="py-2.5 px-3 font-mono text-xs text-gray-400">{op.id}</td>
                <td className="py-2.5 px-3 text-xs text-gray-600">{op.category || '—'}</td>
                <td className="py-2.5 px-3 font-serif text-gray-800 max-w-xs">
                  <div className="line-clamp-2">{op.argumentSummary}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{op.rulingRef}</div>
                </td>
                {dimensions.map((dim) => (
                  <td key={dim.id} className="py-2.5 px-3">
                    <ArgumentTag label="" stance={op.stances[dim.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {sorted.map((op) => (
          <div
            key={op.id}
            className={`bg-white border rounded-sm p-4 transition-colors
              ${highlightId === op.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            onTouchStart={() => onHover(op.id)}
            onTouchEnd={() => onHover(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-gray-400">{op.id}</span>
              {op.category && (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                  {op.category}
                </span>
              )}
            </div>
            <p className="text-sm font-serif text-gray-800 leading-relaxed mb-2">
              {op.argumentSummary}
            </p>
            <div className="text-[10px] font-mono text-gray-400 mb-2">{op.rulingRef}</div>
            <div className="flex flex-wrap gap-1.5">
              {dimensions.map((dim) => (
                <ArgumentTag key={dim.id} label={dim.label} stance={op.stances[dim.id]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
