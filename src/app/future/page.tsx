'use client';

import React, { useState, useMemo } from 'react';
import { PENDING_CASES, AVAILABLE_TAGS, IdentityTag, computeBacklogStatistics } from '@/data/future';

export default function FutureTrack() {
  const [activeTags, setActiveTags] = useState<IdentityTag[]>([]);

  // Calculate filtered cases
  const filteredCases = useMemo(() => {
    if (activeTags.length === 0) return PENDING_CASES;
    return PENDING_CASES.filter(c =>
      c.tags.some(tag => activeTags.includes(tag))
    );
  }, [activeTags]);

  const toggleTag = (tag: IdentityTag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const stats = useMemo(() => computeBacklogStatistics(filteredCases), [filteredCases]);
  const filteredCount = stats.totalCases;
  // Estimate: average days pending converted to years, doubled due to 5-justice bottleneck
  const estimatedYears = activeTags.length === 0
    ? ((stats.averageDaysPending / 365) * 2).toFixed(1)
    : ((stats.averageDaysPending / 365) * 2).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full bg-[#fcfcfc] min-h-screen">
      
      {/* Header */}
      <div className="mb-12 border-l-4 border-gray-800 pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">Future</span>
          憲庭載入中
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">系統嚴重癱瘓，您的基本權利正在排隊中。</p>
      </div>

      {/* Main Infographic Container */}
      <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-sm rounded-md relative text-gray-800 lg:min-h-[600px] flex flex-col">
        
        {/* Top Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 pb-8 mb-10">
          <span className="font-mono font-bold text-gray-400 text-sm tracking-widest hidden md:inline-block">SYSTEM.FILTER()</span>
          <div className="bg-gray-50 border border-gray-200 px-5 py-3 flex flex-wrap items-center gap-3 rounded-md flex-grow w-full">
            <span className="text-gray-500 text-sm font-medium">權益計算機：選擇與您相關的身分</span>
            
            <div className="flex flex-wrap gap-2 w-full mt-2">
              {AVAILABLE_TAGS.map(tag => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`transition-all border px-4 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 ${
                      isActive 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                    {isActive && <span className="opacity-50 hover:opacity-100">✕</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Objective Infographic (Rehab State) */}
        <div className="flex flex-col lg:flex-row justify-between items-center flex-grow bg-gray-50/50 rounded-lg border border-gray-100 p-8 pt-12 relative overflow-hidden">
          
          {/* Overload Left (The Queue) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end pr-0 lg:pr-12 lg:border-r border-dashed border-gray-300 mb-12 lg:mb-0 z-10">
             <div className="w-full text-center lg:text-right mb-8">
                <div className="font-bold text-gray-800 font-mono text-4xl mb-2">{filteredCount} <span className="text-lg text-gray-500">件</span></div>
                <div className="text-sm font-medium text-gray-500">
                  {activeTags.length === 0 ? '目前滯留憲法法庭待審案' : `包含上述 ${activeTags.join('、')} 權益相關`}
                </div>
             </div>
             
             {/* The Dots Visualization */}
             <div className="flex flex-wrap gap-2 justify-center lg:justify-end max-w-[300px] content-end">
               {/* Show actual mapped dots for filtered, or just a grid for all */}
               {activeTags.length === 0 ? (
                  PENDING_CASES.map((c, i) => (
                    <div
                       key={c.id}
                       className="w-3.5 h-3.5 rounded-full bg-gray-800 cursor-pointer hover:scale-150 transition-transform relative group"
                    >
                      <div className="absolute opacity-0 group-hover:opacity-100 -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-sm whitespace-nowrap shadow-lg transition-opacity pointer-events-none z-50">
                        {c.topic} ({c.daysPending}天)
                      </div>
                    </div>
                  ))
               ) : (
                  filteredCases.map((c) => (
                    <div
                       key={c.id}
                       className="w-4 h-4 rounded-full bg-blue-500 cursor-pointer hover:scale-150 transition-transform relative group"
                    >
                      <div className="absolute opacity-0 group-hover:opacity-100 -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-sm whitespace-nowrap shadow-lg transition-opacity pointer-events-none z-50">
                        {c.topic} ({c.daysPending}天)
                      </div>
                    </div>
                  ))
               )}
             </div>
             <div className="w-full text-center lg:text-right text-xs mt-6 font-mono text-gray-400 uppercase tracking-widest">System Queue Overload</div>
          </div>

          {/* The Bottleneck (Neutral representation) */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center items-center relative py-12 px-4 z-10">
             
             {/* Visual funnel lines to connect them - using SVGs */}
             <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
                {/* SVG connecting Left (Dots) to Center (Lines) */}
                <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M -50 20 C 20 20 20 40 50 40" stroke="#000" strokeWidth="1" fill="none" />
                   <path d="M -50 80 C 20 80 20 60 50 60" stroke="#000" strokeWidth="1" fill="none" />
                </svg>
             </div>

             {/* 5 lines representing 5 justices left */}
             <div className="flex flex-col gap-5 z-10 w-full items-center">
                {Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="h-2 w-24 bg-gray-800 rounded-full"></div>
                ))}
             </div>
             
             <div className="flex flex-col items-center mt-10">
                <div className="bg-white border border-gray-200 px-5 py-2 font-bold text-sm rounded-full text-gray-900 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  僅存 5 名大法官
                </div>
                <div className="text-[10px] text-gray-400 mt-3 font-mono uppercase tracking-widest">Rehabilitation State</div>
             </div>
          </div>

          {/* Resolution Right (Est. Time) */}
           <div className="w-full lg:w-[30%] flex flex-col justify-center items-center lg:items-start pl-0 lg:pl-12 lg:border-l border-dashed border-gray-300 mt-12 lg:mt-0 z-10">
             <div className="text-sm font-medium text-gray-500 mb-3 tracking-wide">
                預估審理時間
             </div>
             <div className="text-5xl lg:text-6xl font-light text-gray-900 mb-8 font-mono">
                {estimatedYears}<span className="text-2xl text-gray-500 ml-2 font-sans">年</span>
             </div>
             <a href="#explain" className="bg-white text-gray-800 border border-gray-300 rounded-sm py-2.5 px-6 text-sm font-bold hover:bg-gray-50 transition-colors w-max shadow-sm hover:shadow active:scale-95 flex items-center gap-2 group">
                 為什麼會這樣？ <span className="text-gray-400 group-hover:translate-y-0.5 transition-transform">↓</span>
             </a>
          </div>

        </div>
      </div>

      {/* Explanation Detail Section (Below the fold) */}
      <div id="explain" className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24">
         <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-3 h-3 bg-[#D32F2F] rounded-full"></div> 立法院人事卡關</h3>
            <p className="text-gray-600 leading-relaxed font-serif">
               原定 15 名大法官，由於立法院針對新任大法官人事同意權遲未進行實質審查，導致 2024 年 11 月起，有 7 名大法官卸任後無法補足。目前僅依靠剩餘的 5 名大法官（因部份案件需迴避）辛苦支撐整個國家的釋憲機制。
            </p>
         </div>
         <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-full"></div> 憲法法庭法修正</h3>
            <p className="text-gray-600 leading-relaxed font-serif">
               同時，立法院通過修法，將憲法法庭判決門檻由「現有總額」改為「法定總額」的 2/3（即至少需 10 名大法官同意）。在目前僅存 5 人的現實下，實質上 **凍結** 了所有正在排隊且需要判決的憲法訴訟案。
            </p>
         </div>
      </div>

    </div>
  );
}
