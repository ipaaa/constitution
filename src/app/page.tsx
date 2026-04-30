import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Search, Workflow } from "lucide-react";
import { CRISIS_STATS } from "@/data/future";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA]">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-40 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gray-800 text-white px-2 py-1 text-xs font-bold tracking-widest uppercase">
                官方首頁 / Home
              </span>
              <span className="text-sm font-bold text-gray-500 font-mono tracking-wider">
                {new Date().toISOString().split('T')[0]}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.15] font-serif border-l-[6px] border-gray-900 pl-6">
              別讓你的權利<br />
              <span className="bg-[#FFE082] px-2 pb-1 inline-block mt-3">已讀不回</span>
            </h1>
            
            <p className="text-xl text-gray-600 font-medium max-w-xl leading-relaxed pl-8 border-l border-gray-300">
              將「過去課本裡的民主成就」轉化為「被卡住的現實危機」。降低公民理解憲法法庭價值的門檻，一起守護台灣民主。
            </p>
            
            <div className="flex flex-wrap gap-4 pt-6 pl-8">
              <Link href="/present" className="bg-gray-900 text-white px-8 py-3.5 font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm rounded-sm">
                進入憲庭熱搜榜 <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end z-10 group">
            <div className="absolute inset-0 bg-white border border-gray-200 shadow-sm rounded-sm -z-10 rotate-3 transition-transform group-hover:rotate-6"></div>
            <div className="bg-white border border-gray-200 p-8 shadow-sm rounded-sm relative w-max mx-auto lg:mr-0 z-10 transition-transform group-hover:-translate-y-2">
              <div className="absolute -top-3 left-4 bg-[#D32F2F] text-white px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                Mascot
              </div>
              <Image 
                src="/owl.png" 
                alt="Judge Owl Mascot" 
                width={360} 
                height={360} 
                className="drop-shadow-xl"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* The 3 Core Tracks Overview */}
      <section className="bg-white py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 border-b-2 border-gray-900 pb-4 flex justify-between items-end">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">三大核心軌道</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm hidden md:block">The Core Archives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Track 1 Link */}
            <Link href="/past" className="group bg-white border border-gray-200 p-8 shadow-sm rounded-sm hover:shadow-md transition-shadow flex flex-col items-start h-full">
              <div className="flex justify-between w-full items-start mb-6">
                <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 1</div>
                <div className="w-10 h-10 border border-gray-200 rounded-sm flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                  <Clock className="text-gray-600 group-hover:text-gray-900" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors font-serif">過去：時光機</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">
                憲法課本與現實的衝撞。<br/>看見歷史的強烈情感與權利的重量。
              </p>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:underline mt-auto">
                開始探索 <ArrowRight size={14} />
              </span>
            </Link>

            {/* Track 2 Link */}
            <Link href="/present" className="group bg-white border border-gray-200 p-8 shadow-sm rounded-sm hover:shadow-md transition-shadow flex flex-col items-start h-full border-t-4 border-t-gray-800">
              <div className="flex justify-between w-full items-start mb-6">
                <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 2</div>
                <div className="w-10 h-10 border border-gray-200 rounded-sm flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                  <Search className="text-gray-600 group-hover:text-gray-900" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors font-serif">現在：熱搜榜</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">
                釋憲動態聚合。<br/>專業新聞剪報式儀表板，多元觀點懶人包。
              </p>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:underline mt-auto">
                開始探索 <ArrowRight size={14} />
              </span>
            </Link>

            {/* Track 3 Link */}
            <Link
              href="/future"
              className="group relative bg-gray-900 text-white border border-gray-900 p-8 shadow-sm rounded-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2 transition-all flex flex-col items-start h-full overflow-hidden"
              aria-label={`進入憲庭載入中：${CRISIS_STATS.totalPending} 件案件待審，僅存 ${CRISIS_STATS.activeJustices} 名大法官運作`}
            >
              {/* Ambient red glow to echo /future crisis banner */}
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-[#D32F2F] rounded-full blur-[90px] opacity-25 group-hover:opacity-40 transition-opacity" />

              <div className="relative flex justify-between w-full items-start mb-6">
                <div className="bg-[#D32F2F] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 3</div>
                <div className="w-10 h-10 border border-gray-700 bg-gray-800 rounded-sm flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                  <Workflow className="text-red-400 group-hover:text-red-300" size={20} />
                </div>
              </div>

              {/* Live status pill */}
              <div className="relative flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
                  Constitutional Emergency
                </span>
              </div>

              <h3 className="relative text-2xl font-bold mb-3 text-white group-hover:text-[#FFE082] transition-colors font-serif">未來：憲庭載入中</h3>
              <p className="relative text-gray-400 font-medium leading-relaxed mb-6">
                客觀的系統癱瘓數據。<br/>透視五人極限運作的系統瓶頸，與身分連動。
              </p>

              {/* Live bottleneck mini-preview, sourced from the same dataset as /future */}
              <div className="relative w-full grid grid-cols-2 gap-2 mb-6 border-t border-gray-800 pt-4">
                <div>
                  <div className="font-mono text-2xl font-bold text-white leading-none">
                    {CRISIS_STATS.totalPending}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-medium">件待審案件</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-[#D32F2F] leading-none">
                    {CRISIS_STATS.activeJustices}
                    <span className="text-gray-600 text-lg"> / {CRISIS_STATS.designatedTotal}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-medium">名大法官運作</div>
                </div>
              </div>

              <span className="relative text-sm font-bold text-[#FFE082] flex items-center gap-1 group-hover:underline mt-auto">
                查看癱瘓實況 <ArrowRight size={14} />
              </span>
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
}
