'use client';

import { useState, useCallback } from 'react';
import type { TimelineEvent, CategoryDef, EventCategory } from '@/data/controversy-timeline';
import TimelineCategoryFilter from './TimelineCategoryFilter';
import TimelineNode from './TimelineNode';

interface ControversyTimelineProps {
  events: TimelineEvent[];
  categories: CategoryDef[];
}

export default function ControversyTimeline({ events, categories }: ControversyTimelineProps) {
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(categories.map((c) => c.id))
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleCategory = useCallback((categoryId: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        // Don't allow deselecting all
        if (next.size <= 1) return prev;
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleToggleNode = useCallback((eventId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const filteredEvents = events.filter((e) => activeCategories.has(e.category));

  return (
    <div>
      <TimelineCategoryFilter
        categories={categories}
        activeCategories={activeCategories}
        onToggle={handleToggleCategory}
      />

      {/* Timeline */}
      <div className="relative mt-8">
        {/* Vertical axis line - desktop center, mobile left */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 md:-translate-x-px" />

        <div className="space-y-0">
          {filteredEvents.map((event, index) => (
            <TimelineNode
              key={event.id}
              event={event}
              isExpanded={expandedIds.has(event.id)}
              onToggle={handleToggleNode}
              isLeft={index % 2 === 0}
              categories={categories}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
