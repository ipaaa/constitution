'use client';

import React from 'react';
import { TERM_EVENTS, REFERENCE_DATE } from '@/data/future';
import JusticeCountdown from './JusticeCountdown';
import JusticeSeatGrid from './JusticeSeatGrid';

/**
 * Timeline events with pixel positioning data for the visualization.
 * Spans 2023-01 to 2029-01 (6 years = 100% width).
 */
const TIMELINE_START = Date.parse('2023-01-01');
const TIMELINE_END = Date.parse('2029-01-01');
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

function pct(isoDate: string): number {
  const t = Date.parse(isoDate);
  return Math.max(0, Math.min(100, ((t - TIMELINE_START) / TIMELINE_SPAN) * 100));
}

const YEAR_MARKERS = [2023, 2024, 2025, 2026, 2027, 2028, 2029];

const REFERENCE_PCT = pct(REFERENCE_DATE);

export default function JusticeTermTimeline() {
  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="border-l-4 border-[#D32F2F] pl-4 mb-6">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900">
          大法官席次時間軸
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Justice Term Forecast — 未來三年席次變化預測
        </p>
      </div>

      {/* Dark container for the timeline visualization */}
      <div className="bg-gray-900 rounded-sm p-4 md:p-6 mb-4">
        {/* Horizontal Timeline — Desktop */}
        <div className="hidden md:block">
          <div className="relative h-40">
            {/* Year grid lines and labels */}
            {YEAR_MARKERS.map((year) => {
              const x = pct(`${year}-01-01`);
              return (
                <div key={year} className="absolute top-0 bottom-0" style={{ left: `${x}%` }}>
                  <div className="w-px h-full bg-gray-800" />
                  <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-[10px] text-gray-300">
                    {year}
                  </span>
                </div>
              );
            })}

            {/* Main axis line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-700" />

            {/* "YOU ARE HERE" marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: `${REFERENCE_PCT}%` }}
            >
              <div className="w-3 h-3 bg-white rounded-full border-2 border-white -translate-x-1/2" />
              <div className="absolute -top-7 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-white text-gray-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  You are here
                </span>
              </div>
            </div>

            {/* Term events */}
            {TERM_EVENTS.map((event, i) => {
              const x = pct(event.date);
              const isPast = Date.parse(event.date) < Date.parse(REFERENCE_DATE);
              const isFinalCliff = i === TERM_EVENTS.length - 1;

              return (
                <div
                  key={event.date}
                  className="absolute top-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${x}%` }}
                >
                  {/* Event marker */}
                  <div
                    className={`w-4 h-4 rounded-full -translate-x-1/2 border-2 ${
                      isPast
                        ? 'bg-gray-700 border-gray-600'
                        : isFinalCliff
                          ? 'bg-[#D32F2F] border-red-400 animate-pulse'
                          : 'bg-amber-500 border-amber-400'
                    }`}
                  />
                  {/* Event label — alternate above/below */}
                  <div
                    className={`absolute -translate-x-1/2 whitespace-nowrap ${
                      i % 2 === 0 ? 'top-5' : '-top-12'
                    }`}
                  >
                    <div className={`text-[10px] font-mono font-bold ${
                      isPast ? 'text-gray-500' : isFinalCliff ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      -{event.justicesExpiring} 席
                    </div>
                    <div className={`text-[9px] font-mono ${
                      isPast ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {event.label}
                    </div>
                    <div className={`text-[9px] font-mono ${
                      isPast ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      剩 {event.justicesRemaining} 人
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Danger zone: from last active date to end */}
            {(() => {
              const cliffPct = pct(TERM_EVENTS[TERM_EVENTS.length - 1].date);
              return (
                <div
                  className="absolute top-0 bottom-0 bg-[#D32F2F] opacity-[0.06] rounded-r-sm"
                  style={{ left: `${cliffPct}%`, right: 0 }}
                />
              );
            })()}

            {/* Dashed line after cliff */}
            {(() => {
              const cliffPct = pct(TERM_EVENTS[TERM_EVENTS.length - 1].date);
              return (
                <div
                  className="absolute top-1/2 h-px border-t border-dashed border-gray-700"
                  style={{ left: `${cliffPct}%`, right: 0 }}
                />
              );
            })()}
          </div>

          {/* Bottom label */}
          <div className="mt-8 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Justice Term Timeline / 大法官任期時間軸
          </div>
        </div>

        {/* Vertical Timeline — Mobile */}
        <div className="block md:hidden">
          <div className="relative ml-4 border-l border-gray-700 pl-6 space-y-6 py-2">
            {TERM_EVENTS.map((event, i) => {
              const isPast = Date.parse(event.date) < Date.parse(REFERENCE_DATE);
              const isFinalCliff = i === TERM_EVENTS.length - 1;
              const isBeforeRef = isPast;
              const showRefMarker =
                i < TERM_EVENTS.length - 1 &&
                Date.parse(TERM_EVENTS[i].date) < Date.parse(REFERENCE_DATE) &&
                Date.parse(TERM_EVENTS[i + 1].date) >= Date.parse(REFERENCE_DATE);

              return (
                <React.Fragment key={event.date}>
                  <div className="relative">
                    {/* Dot on the timeline axis */}
                    <div
                      className={`absolute -left-[calc(1.5rem+0.5rem+1px)] w-3 h-3 rounded-full border-2 ${
                        isPast
                          ? 'bg-gray-700 border-gray-600'
                          : isFinalCliff
                            ? 'bg-[#D32F2F] border-red-400 animate-pulse'
                            : 'bg-amber-500 border-amber-400'
                      }`}
                    />
                    <div className={`text-xs font-mono ${isPast ? 'text-gray-500' : isFinalCliff ? 'text-red-400' : 'text-gray-300'}`}>
                      {event.date.slice(0, 7)}
                    </div>
                    <div className={`text-sm font-serif font-bold mt-0.5 ${
                      isPast ? 'text-gray-500' : isFinalCliff ? 'text-red-400' : 'text-white'
                    }`}>
                      {event.label} — {event.justicesExpiring} 席屆滿
                    </div>
                    <div className="text-xs text-gray-300 font-mono mt-0.5">
                      剩餘 {event.justicesRemaining} / 15 席
                    </div>
                  </div>

                  {/* "YOU ARE HERE" marker inserted between past and future events */}
                  {showRefMarker && (
                    <div className="relative">
                      <div className="absolute -left-[calc(1.5rem+0.5rem+1px)] w-3 h-3 rounded-full bg-white border-2 border-white" />
                      <div className="bg-white text-gray-900 text-[10px] font-mono font-bold px-2 py-1 rounded-sm inline-block uppercase tracking-wider">
                        You are here — {REFERENCE_DATE}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Countdown + Seat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JusticeCountdown />
        <JusticeSeatGrid />
      </div>
    </section>
  );
}
