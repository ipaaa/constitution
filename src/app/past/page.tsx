"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import HISTORY_DATA from '@/data/history.json';
import Link from 'next/link';
import { ArrowDown, ChevronDown, Search, X } from 'lucide-react';

type HistoryEntry = (typeof HISTORY_DATA)[number];

interface DecadeGroup {
  decade: number;           // e.g. 1990
  label: string;            // e.g. "1990s"
  entries: HistoryEntry[];
  keywords: string[];       // top 2-3 categories
}

/** Derive decade from a reality.year string. */
const decadeOf = (yearStr: string): number =>
  Math.floor(parseInt(yearStr, 10) / 10) * 10;

/** Group entries by decade, sort ascending, keep internal entries year-ascending. */
const groupByDecade = (entries: readonly HistoryEntry[]): DecadeGroup[] => {
  const byDecade = new Map<number, HistoryEntry[]>();
  for (const e of entries) {
    const d = decadeOf(e.reality.year);
    if (!Number.isFinite(d)) continue;
    const bucket = byDecade.get(d);
    if (bucket) bucket.push(e);
    else byDecade.set(d, [e]);
  }

  return Array.from(byDecade.entries())
    .filter(([, list]) => list.length > 0)
    .sort(([a], [b]) => a - b)
    .map(([decade, list]) => {
      list.sort((a, b) => parseInt(a.reality.year, 10) - parseInt(b.reality.year, 10));
      // Top 2-3 categories by frequency (preserve first-seen order on ties)
      const counts = new Map<string, number>();
      const order: string[] = [];
      for (const entry of list) {
        const cat = entry.category || '憲法起源';
        if (!counts.has(cat)) order.push(cat);
        counts.set(cat, (counts.get(cat) || 0) + 1);
      }
      const keywords = order
        .slice()
        .sort((a, b) => (counts.get(b)! - counts.get(a)!) || order.indexOf(a) - order.indexOf(b))
        .slice(0, 3);
      return { decade, label: `${decade}s`, entries: list, keywords };
    });
};

interface SearchMatch {
  entry: HistoryEntry;
  decade: number;
}

const matchesQuery = (entry: HistoryEntry, q: string): boolean => {
  const fields = [
    entry.reality.year,
    entry.reality.title,
    entry.reality.ruling,
    entry.reality.ruling_id,
    entry.textbook.chapter,
    entry.category || '',
  ];
  return fields.some((f) => f.toLowerCase().includes(q));
};

interface DecadeSectionProps {
  group: DecadeGroup;
  expanded: boolean;
  onToggle: () => void;
  registerEntryRef: (id: string, el: HTMLDivElement | null) => void;
}

/** Per-section scrollytelling container. Observer is scoped to this section only. */
function DecadeSection({ group, expanded, onToggle, registerEntryRef }: DecadeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!expanded) return;
    const section = sectionRef.current;
    if (!section) return;

    const triggers = section.querySelectorAll<HTMLElement>('.vh-trigger');
    if (triggers.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const step = parseInt(e.target.getAttribute('data-step') || '0', 10);
            setActiveIndex(step);
          }
        });
      },
      { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    triggers.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [expanded, group.entries.length]);

  const progressPercentage =
    group.entries.length > 1 ? (activeIndex / (group.entries.length - 1)) * 100 : 0;

  return (
    <section
      ref={sectionRef}
      id={`decade-${group.decade}`}
      className="relative border-t border-black/10 bg-[var(--color-textbook-bg)]"
    >
      {/* Section header (always visible; acts as the collapsible toggle) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`decade-${group.decade}-body`}
        className="w-full text-left px-6 md:px-12 py-8 md:py-10 flex items-center gap-6 hover:bg-black/[0.03] transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <div className="flex-shrink-0 w-20 md:w-28">
          <div className="font-serif font-black text-4xl md:text-5xl text-[var(--color-textbook-text)] leading-none">
            {group.label}
          </div>
          <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mt-2">
            Decade · {group.decade}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block bg-[var(--color-accent-red)] text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded tracking-widest uppercase">
              {group.entries.length} 筆
            </span>
            <span className="text-xs md:text-sm text-gray-500 font-mono truncate">
              {group.entries[0].reality.year}–{group.entries[group.entries.length - 1].reality.year}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.keywords.map((k) => (
              <span
                key={k}
                className="inline-block bg-[#1565C0]/10 text-[#1565C0] text-xs font-bold px-2 py-0.5 rounded border border-[#1565C0]/20"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ChevronDown
            size={28}
            className={`text-gray-600 transition-transform duration-400 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Collapsible body */}
      <div
        id={`decade-${group.decade}-body`}
        className={`decade-body ${expanded ? 'expanded' : 'collapsed'}`}
        aria-hidden={!expanded}
      >
        {/* Scroll container scoped to this decade */}
        <div
          className="relative"
          style={{ height: expanded ? `${group.entries.length * 100}vh` : '0px' }}
        >
          {/* Sticky Viewport */}
          <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel: Textbook */}
            <div className="flex-1 relative bg-[var(--color-textbook-bg)] bg-paper-texture flex items-center justify-center md:border-r border-black/10 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.05)] p-10 md:p-20 z-10">
              {group.entries.map((item, index) => {
                const isActive = index === activeIndex;
                const isExitUp = index < activeIndex;
                const isExitDown = index > activeIndex;
                return (
                  <div
                    key={`left-${item.id}`}
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-center p-8 md:p-20 textbook-item ${isActive ? 'active' : ''} ${isExitUp ? 'exit-up' : ''} ${isExitDown ? 'exit-down' : ''}`}
                  >
                    <div className="max-w-md font-serif">
                      <div className="mb-3">
                        <span className="inline-block bg-[#1565C0]/10 text-[#1565C0] text-xs font-bold px-2 py-0.5 rounded border border-[#1565C0]/20 uppercase tracking-tight">
                          {item.category || '憲法起源'}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] border-b-2 border-[#D3D3D3] pb-4 mb-6">
                        {item.textbook.chapter}
                      </h2>
                      <p
                        className="text-xl leading-[1.8] text-[#3A3A3A] mb-5"
                        dangerouslySetInnerHTML={{ __html: item.textbook.content as string }}
                      />
                      <div className="font-[Caveat] text-[#0D47A1] text-3xl -rotate-3 inline-block mt-3 font-bold">
                        {item.textbook.handwriting}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center Timeline (Desktop Only) */}
            <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-400/30 -translate-x-1/2 z-50 flex-col justify-between py-[20vh]">
              <div
                className="absolute top-0 left-0 w-full bg-[var(--color-accent-red)] transition-all duration-300 ease-out"
                style={{ height: `${progressPercentage}%` }}
              />
              {group.entries.map((item, index) => (
                <div
                  key={`dot-${item.id}`}
                  className={`w-4 h-4 bg-[var(--color-textbook-bg)] border-[3px] border-gray-400/50 rounded-full relative -translate-x-1/2 timeline-node ${index === activeIndex ? 'active' : ''}`}
                >
                  <div className="absolute right-[25px] top-1/2 -translate-y-1/2 font-sans font-black text-lg text-[var(--color-textbook-text)] timeline-label whitespace-nowrap">
                    {item.reality.year}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Panel: Reality */}
            <div className="flex-1 relative bg-[var(--color-reality-bg)] flex items-center justify-center overflow-hidden z-0">
              {group.entries.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={`right-${item.id}`}
                    ref={(el) => registerEntryRef(item.id, el)}
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-center p-8 md:p-20 reality-item ${isActive ? 'active' : ''}`}
                  >
                    <div
                      role="img"
                      aria-label={`${item.reality.title} 背景圖片`}
                      className="absolute inset-0 bg-cover bg-center grayscale-[80%] brightness-40 reality-bg-image z-0"
                      style={{ backgroundImage: `url('${item.reality.bgImage}')` }}
                    />
                    <div className="relative z-10 max-w-lg text-[var(--color-reality-text)] reality-content">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="inline-block bg-[var(--color-accent-red)] text-white text-base md:text-lg font-black py-2 px-4 rounded tracking-widest">
                          {item.reality.year}
                        </span>
                        {item.reality.ruling_id && (
                          <span className="inline-block bg-white text-[var(--color-accent-red)] border-2 border-[var(--color-accent-red)] text-base md:text-lg font-black py-1.5 px-4 rounded tracking-tighter">
                            {item.reality.ruling_id}
                          </span>
                        )}
                      </div>
                      <h3 className="font-sans text-4xl md:text-5xl font-black leading-[1.2] mb-6 tracking-tight">
                        {item.reality.title}
                      </h3>
                      <div className="text-xl md:text-2xl font-bold text-[#AAAAAA] border-l-4 border-[var(--color-accent-red)] pl-4">
                        {item.reality.ruling}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Triggers (scoped to this section) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {group.entries.map((_, index) => (
              <div
                key={`trigger-${index}`}
                className="w-full h-screen vh-trigger"
                data-step={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PastTrack() {
  const groups = useMemo(() => groupByDecade(HISTORY_DATA), []);
  const earliestDecade = groups[0]?.decade;

  const [expandedDecades, setExpandedDecades] = useState<Set<number>>(() =>
    earliestDecade != null ? new Set([earliestDecade]) : new Set()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Track DOM nodes for each entry's right-panel container so we can scroll to them.
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const registerEntryRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) entryRefs.current.set(id, el);
    else entryRefs.current.delete(id);
  }, []);

  const toggleDecade = useCallback((decade: number) => {
    setExpandedDecades((prev) => {
      const next = new Set(prev);
      if (next.has(decade)) next.delete(decade);
      else next.add(decade);
      return next;
    });
  }, []);

  // Search suggestions (max 5) — empty/whitespace query returns none.
  const suggestions: SearchMatch[] = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const results: SearchMatch[] = [];
    for (const g of groups) {
      for (const e of g.entries) {
        if (matchesQuery(e, q)) {
          results.push({ entry: e, decade: g.decade });
          if (results.length >= 5) return results;
        }
      }
    }
    return results;
  }, [searchTerm, groups]);

  // Close suggestions on outside click.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Jump to a matched entry: expand its decade, wait for the collapse transition (~400ms),
  // then smooth-scroll the entry into view and pulse-highlight it for ~1.5s.
  const jumpToEntry = useCallback(
    (match: SearchMatch) => {
      const wasExpanded = expandedDecades.has(match.decade);
      if (!wasExpanded) {
        setExpandedDecades((prev) => new Set(prev).add(match.decade));
      }
      setShowSuggestions(false);

      const scrollAndHighlight = () => {
        const el = entryRefs.current.get(match.entry.id);
        if (!el) return;
        // Use the element's position in the document; offset by navbar (72px) + search (~64px).
        const rect = el.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - 140;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        setHighlightedId(match.entry.id);
        window.setTimeout(() => setHighlightedId(null), 1500);
      };

      // If we just expanded the section, wait for the 400ms max-height transition + a frame.
      if (!wasExpanded) window.setTimeout(scrollAndHighlight, 430);
      else scrollAndHighlight();
    },
    [expandedDecades]
  );

  // Apply pulse class to whichever entry is currently highlighted.
  useEffect(() => {
    if (!highlightedId) return;
    const el = entryRefs.current.get(highlightedId);
    if (!el) return;
    el.classList.add('entry-pulse');
    const timer = window.setTimeout(() => el.classList.remove('entry-pulse'), 1500);
    return () => {
      window.clearTimeout(timer);
      el.classList.remove('entry-pulse');
    };
  }, [highlightedId]);

  return (
    <div className="w-full bg-[var(--color-textbook-bg)] text-[var(--color-textbook-text)] font-sans min-h-screen">
      {/* Intro Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative" aria-label="憲法課本時光機介紹">
        <h1 className="text-5xl md:text-7xl font-black mb-6 font-serif">憲法課本時光機</h1>
        <p className="text-xl md:text-2xl max-w-2xl text-gray-700 leading-relaxed font-serif">
          那些習以為常的權利，不是憑空出現的。<br />讓我們翻開課本，回到當年憲法法庭敲下判決的那一刻。
        </p>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50" aria-hidden="true">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* Sticky Search Bar — sits below the 72px Navbar */}
      <div
        ref={searchRef}
        className="sticky top-[72px] z-40 bg-[var(--color-textbook-bg)]/95 backdrop-blur border-b border-black/10"
      >
        <div className="max-w-5xl mx-auto px-6 py-3 relative">
          <div className="flex items-center gap-2 bg-white rounded-sm shadow-sm border border-gray-300 focus-within:border-gray-500 focus-within:shadow-md transition-all">
            <Search size={18} className="ml-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchTerm.trim().length > 0) setShowSuggestions(true);
              }}
              placeholder="搜尋年份、釋字、主題……"
              className="flex-grow bg-transparent px-2 py-2.5 outline-none text-gray-800 font-sans text-sm"
              aria-label="搜尋歷史釋字"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                }}
                className="mr-2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="清除搜尋"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Suggestion dropdown */}
          {showSuggestions && (
            <div
              id="search-suggestions"
              role="listbox"
              className="absolute left-6 right-6 top-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg overflow-hidden z-50"
            >
              {suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 font-serif">找不到符合的條目。</div>
              ) : (
                <ul>
                  {suggestions.map((m) => (
                    <li key={m.entry.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() => jumpToEntry(m)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-baseline gap-3"
                      >
                        <span className="font-mono text-xs font-bold text-[var(--color-accent-red)] shrink-0 w-12">
                          {m.entry.reality.year}
                        </span>
                        <span className="flex-1 text-sm text-gray-800 truncate font-serif">
                          {m.entry.reality.title}
                        </span>
                        {m.entry.reality.ruling_id && (
                          <span className="font-mono text-[10px] text-gray-500 shrink-0">
                            {m.entry.reality.ruling_id}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decade Sections */}
      <div className="relative">
        {groups.map((g) => (
          <DecadeSection
            key={g.decade}
            group={g}
            expanded={expandedDecades.has(g.decade)}
            onToggle={() => toggleDecade(g.decade)}
            registerEntryRef={registerEntryRef}
          />
        ))}
      </div>

      {/* Outro Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[var(--color-textbook-bg)] border-t border-black/5 relative z-20" aria-label="結語：憲庭載入中">
        <h2 className="text-4xl md:text-6xl font-black mb-6 font-serif">但是現在，憲庭載入中...</h2>
        <p className="text-lg md:text-2xl max-w-3xl text-gray-700 leading-relaxed font-serif mb-12">
          過去捍衛我們權利的最後防線，正因為政治角力面臨癱瘓危機。<br />
          你的日常，即將成為下一個受到影響的戰場。
        </p>
        <Link
          href="/present"
          className="bg-midnight text-white px-10 py-5 rounded-full font-bold text-xl md:text-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          回到 憲庭熱搜榜
        </Link>
      </section>
    </div>
  );
}
