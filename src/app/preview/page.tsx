import React from 'react';

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 gap-16 font-sans">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-3xl font-bold mb-2">視覺風格演進預覽 (Tri-Track Aesthetic)</h1>
        <p className="text-gray-600 mb-4">這只是一個「風格對比預覽頁」，讓您可以一次比較三種風格。<br/><b>真實的網站依然會是三個獨立的 Tab (過去、現在、未來)！</b></p>
      </div>

      {/* Track 1: Past */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-gray-800 text-white px-2 py-1 text-sm rounded">Track 1</span> 
          過去 (沉重歷史 / 課本與現實)
        </h2>
        <div className="flex h-[350px] shadow-lg rounded-sm overflow-hidden border border-gray-200">
          {/* Textbook */}
          <div className="w-1/2 p-8 bg-[var(--color-textbook-bg)] relative border-r border-gray-300 flex flex-col justify-center">
             <h3 className="font-serif text-2xl font-bold text-[#3A3A3A] mb-4 border-b border-gray-400 pb-2">第十章：基本人權</h3>
             <p className="font-serif text-lg leading-relaxed text-[#3a3a3a]">
               人民有集會結社之自由。<span className="bg-[#FFE082] px-1 font-bold">保障和平表達</span>的權利。
             </p>
             <div className="font-[Caveat] text-[#1565C0] text-2xl -rotate-6 mt-6 font-bold">以前上街頭會先被當罪犯？</div>
          </div>
          {/* Reality */}
          <div className="w-1/2 p-8 bg-[#0F0F0F] text-white flex flex-col justify-center relative">
             <div className="bg-[#D32F2F] text-white text-sm font-bold px-3 py-1 w-max mb-4 rounded-sm">1998</div>
             <h3 className="font-sans text-3xl font-bold mb-4 leading-tight shadow-black drop-shadow-md">你走上街頭抗議<br/>不必先被當成罪犯。</h3>
             <p className="text-gray-400 border-l-2 border-[#D32F2F] pl-4 text-sm mt-4">釋字第 445 號・確立集會遊行是受憲法保障的基本權利</p>
          </div>
        </div>
      </section>

      {/* Track 2: Present */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-gray-800 text-white px-2 py-1 text-sm rounded">Track 2</span> 
          現在 (乾淨新聞聚合 / 剪報檔案)
        </h2>
        <div className="bg-[#F6F8FA] p-8 rounded-md border border-gray-200 shadow-inner flex gap-6">
           {/* Main Highlight */}
           <div className="w-2/3 bg-white border border-gray-200 p-8 shadow-sm rounded-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-800 text-white px-2 py-1 text-xs font-medium tracking-wide rounded-sm">焦點判決</span>
                <span className="text-sm text-gray-400 font-mono">2024-10-25</span>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-6 leading-tight text-gray-900 border-l-4 border-gray-300 pl-4">國會職權修法部分違憲：<br/><span className="bg-[#FFE082] px-1">總統無赴立院報告義務</span></h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-3 font-medium text-lg flex-grow">
                <li>藐視國會罪違憲，不可刑罰。</li>
                <li>聽證調查權部分合憲，但需符合正當程序。</li>
              </ul>
              <div className="w-full text-right mt-6 pt-4 border-t border-gray-100">
                <span className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer transition-colors">閱讀完整白話文案由 →</span>
              </div>
           </div>
           {/* Sidebar clips */}
           <div className="w-1/3 flex flex-col gap-6">
              <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-sm flex-1 hover:shadow-md transition-shadow flex flex-col">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">學者專欄</div>
                <h4 className="font-serif font-bold text-xl mb-3 text-gray-900 line-clamp-2">權力分立的底線在哪？釋判字第一號評析</h4>
                <p className="text-sm text-gray-500 mt-auto">黃丞儀 / 中研院法律所</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-sm flex-1 hover:shadow-md transition-shadow flex flex-col border-t-4 border-t-[#D32F2F]">
                <div className="text-xs font-bold text-[#D32F2F] uppercase tracking-wider mb-2">NGO 倡議</div>
                <h4 className="font-sans font-bold text-xl mb-3 text-gray-900 line-clamp-2">判決過後的國會下一步，公民還能做什麼</h4>
                <p className="text-sm text-gray-500 mt-auto">民間司改會</p>
              </div>
           </div>
        </div>
      </section>

      {/* Track 3: Future */}
      <section className="w-full max-w-5xl pb-24">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-gray-800 text-white px-2 py-1 text-sm rounded">Track 3</span> 
          未來 (客觀系統圖表 / 復健狀態)
        </h2>
        <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-md relative text-gray-800">
           {/* Top Filter Bar */}
           <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
              <span className="font-mono font-bold text-gray-400 text-sm tracking-widest">SYSTEM.FILTER</span>
              <div className="bg-gray-50 border border-gray-200 px-4 py-2 flex items-center gap-3 rounded-full flex-grow max-w-lg">
                 <span className="text-gray-500 text-sm">身分標籤：</span>
                 <span className="bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">勞工 <span className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</span></span>
                 <span className="text-blue-500 text-sm cursor-pointer hover:underline">+ 加入條件</span>
              </div>
           </div>

           {/* Objective Infographic (Rehab State) */}
           <div className="flex justify-between items-center h-[280px] px-8 bg-gray-50 rounded-lg border border-gray-100">
              {/* Overload Left */}
              <div className="w-1/3 flex flex-wrap gap-2 content-center justify-end pr-8 h-full">
                 <div className="w-full text-right mb-4">
                    <div className="font-bold text-gray-800 font-mono text-xl">124 件待審案</div>
                    <div className="text-sm text-gray-500">包含 3 件勞工權益相關</div>
                 </div>
                 {/* Lots of neutral dots */}
                 {Array.from({length: 48}).map((_, i) => (
                   <div key={i} className={`w-3 h-3 rounded-full ${i % 16 === 0 ? 'bg-gray-800 scale-110' : 'bg-gray-300'}`}></div>
                 ))}
              </div>

              {/* The Bottleneck (Neutral representation) */}
              <div className="w-1/3 h-full flex flex-col justify-center items-center relative py-8 px-4 border-l border-r border-dashed border-gray-300">
                 {/* 5 lines representing 5 justices left */}
                 <div className="flex flex-col gap-4 z-10 w-full items-center">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="h-2 w-24 bg-blue-500 rounded-full opacity-80"></div>
                    ))}
                 </div>
                 <div className="flex flex-col items-center mt-6">
                    <div className="bg-white border border-gray-200 px-4 py-1.5 font-medium text-sm rounded-full text-blue-700 shadow-sm">僅存 5 名大法官</div>
                    <div className="text-xs text-gray-400 mt-2 font-mono uppercase tracking-widest">Rehabilitation</div>
                 </div>
              </div>

              {/* Resolution Right */}
               <div className="w-1/4 flex flex-col justify-center pl-8 h-full">
                 <div className="text-sm font-medium text-gray-500 mb-2">
                    預估審理時間
                 </div>
                 <div className="text-5xl font-light text-gray-900 mb-6">
                    1.5<span className="text-2xl text-gray-500 ml-1">年</span>
                 </div>
                 <button className="bg-gray-900 text-white rounded-full py-2 px-6 text-sm font-medium hover:bg-gray-800 transition-colors w-max shadow-sm">
                     了解原因
                 </button>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
