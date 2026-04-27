'use client';

import React, { useState, useMemo } from 'react';
import { PENDING_CASES, CRISIS_STATS, IdentityTag } from '@/data/future';
import RightsCalculator from '@/components/future/RightsCalculator';
import BottleneckFunnel from '@/components/future/BottleneckFunnel';
import CaseCard from '@/components/future/CaseCard';

type SortMode = 'urgency' | 'recent';

export default function FutureTrack() {
  const [activeTags, setActiveTags] = useState<IdentityTag[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('urgency');

  const toggleTag = (tag: IdentityTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredCases = useMemo(() => {
    const cases =
      activeTags.length === 0
        ? PENDING_CASES
        : PENDING_CASES.filter((c) => c.tags.some((tag) => activeTags.includes(tag)));

    return [...cases].sort((a, b) =>
      sortMode === 'urgency' ? b.daysPending - a.daysPending : a.daysPending - b.daysPending
    );
  }, [activeTags, sortMode]);

  const filteredCount = activeTags.length === 0 ? CRISIS_STATS.totalPending : filteredCases.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full min-h-screen">
      {/* Header */}
      <div className="mb-10 border-l-4 border-[#D32F2F] pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">
            Future
          </span>
          <span className="font-serif">憲庭載入中</span>
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">
          系統嚴重癱瘓，您的基本權利正在排隊中。
        </p>
      </div>

      {/* Crisis Banner */}
      <div className="bg-gray-900 text-white p-6 md:p-8 rounded-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D32F2F] rounded-full blur-[120px] opacity-20" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
                Constitutional Emergency
              </span>
            </div>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-3">
            {CRISIS_STATS.designatedTotal} 名大法官，僅存 {CRISIS_STATS.activeJustices} 名運作
          </h2>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            由於立法院未行使新任大法官人事同意權，加上憲法法庭法修正將判決門檻提高至法定總額
            2/3（{CRISIS_STATS.requiredForRuling} 名），目前僅存 {CRISIS_STATS.activeJustices} 名大法官的憲法法庭
            <strong className="text-white">實質上無法做出任何判決</strong>。{CRISIS_STATS.totalPending} 件案件陷入無限等待。
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Calculator */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <RightsCalculator
              activeTags={activeTags}
              onToggleTag={toggleTag}
              filteredCount={filteredCount}
              totalCount={CRISIS_STATS.totalPending}
            />
          </div>
        </div>

        {/* Right: Funnel + Cards */}
        <div className="lg:col-span-8 space-y-8">
          {/* Bottleneck Funnel */}
          <BottleneckFunnel
            filteredCount={filteredCount}
            totalCount={CRISIS_STATS.totalPending}
          />

          {/* Case Cards Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-gray-900 text-xl">
                {activeTags.length === 0 ? '所有待審案件' : '相關待審案件'}
                <span className="text-gray-500 font-mono text-base ml-2">({filteredCases.length})</span>
              </h3>
              <div className="flex gap-1 bg-gray-100 rounded-sm p-0.5">
                <button
                  onClick={() => setSortMode('urgency')}
                  aria-pressed={sortMode === 'urgency'}
                  className={`text-xs px-3 py-1 rounded-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    sortMode === 'urgency'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  最久等待
                </button>
                <button
                  onClick={() => setSortMode('recent')}
                  aria-pressed={sortMode === 'recent'}
                  className={`text-xs px-3 py-1 rounded-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    sortMode === 'recent'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  最近提出
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCases.map((c) => (
                <CaseCard key={c.id} case_={c} />
              ))}
            </div>

            {filteredCases.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-serif">沒有符合條件的案件</p>
                <p className="text-sm mt-2">請嘗試其他身分標籤組合</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      <div id="explain" className="mt-16 scroll-mt-24">
        <div className="border-l-4 border-gray-800 pl-4 mb-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900">為什麼會這樣？</h2>
          <p className="text-gray-500 text-sm mt-1">Understanding the constitutional bottleneck</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-[#D32F2F] rounded-full" />
              立法院人事卡關
            </h3>
            <p className="text-gray-600 leading-relaxed font-serif text-sm">
              原定 {CRISIS_STATS.designatedTotal} 名大法官，由於立法院針對新任大法官人事同意權遲未進行實質審查，
              導致 2024 年 11 月起，有 {CRISIS_STATS.vacantSeats} 名大法官卸任後無法補足。
              目前僅依靠剩餘的 {CRISIS_STATS.activeJustices} 名大法官（因部份案件需迴避）辛苦支撐整個國家的釋憲機制。
            </p>
          </div>
          <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
              憲法法庭法修正
            </h3>
            <p className="text-gray-600 leading-relaxed font-serif text-sm">
              同時，立法院通過修法，將憲法法庭判決門檻由「現有總額」改為「法定總額」的 2/3
              （即至少需 {CRISIS_STATS.requiredForRuling} 名大法官同意）。
              在目前僅存 {CRISIS_STATS.activeJustices} 人的現實下，
              實質上<strong>凍結</strong>了所有正在排隊且需要判決的憲法訴訟案。
            </p>
          </div>
          <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              案件持續積壓
            </h3>
            <p className="text-gray-600 leading-relaxed font-serif text-sm">
              即使在正常編制下，憲法法庭每年處理量約 30~40 件。以目前 {CRISIS_STATS.totalPending} 件待審案件計算，
              即使全員到位也需要數年時間消化。而在 {CRISIS_STATS.activeJustices} 名大法官無法達到判決門檻的情況下，
              案件只進不出，每一天都在加劇人民權利的損害。
            </p>
          </div>
          <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              您的權利正在排隊
            </h3>
            <p className="text-gray-600 leading-relaxed font-serif text-sm">
              每一件待審案都代表一群人的基本權利懸而未決 -- 勞工的退休保障、原住民的文化權、
              被告的正當程序、所有人的言論與隱私。使用上方的「權益計算機」，看看哪些案件與您切身相關，
              感受這場憲政危機如何影響每一個人。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
