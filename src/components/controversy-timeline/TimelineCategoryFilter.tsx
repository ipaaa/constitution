'use client';

import type { CategoryDef, EventCategory } from '@/data/controversy-timeline';

interface TimelineCategoryFilterProps {
  categories: CategoryDef[];
  activeCategories: Set<EventCategory>;
  onToggle: (id: EventCategory) => void;
}

const COLOR_MAP: Record<string, { active: string; inactive: string }> = {
  blue:   { active: 'bg-blue-100 border-blue-400 text-blue-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
  purple: { active: 'bg-purple-100 border-purple-400 text-purple-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
  red:    { active: 'bg-red-100 border-red-400 text-red-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
  green:  { active: 'bg-green-100 border-green-400 text-green-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
  amber:  { active: 'bg-amber-100 border-amber-400 text-amber-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
  teal:   { active: 'bg-teal-100 border-teal-400 text-teal-800', inactive: 'bg-gray-50 border-gray-200 text-gray-400' },
};

export default function TimelineCategoryFilter({
  categories,
  activeCategories,
  onToggle,
}: TimelineCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = activeCategories.has(cat.id);
        const colors = COLOR_MAP[cat.color] || COLOR_MAP.blue;
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium
              transition-all duration-200 min-h-[44px] md:min-h-0
              ${isActive ? colors.active : colors.inactive}
            `}
            aria-pressed={isActive}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
