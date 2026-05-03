import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LazybagCtaSection from "@/components/home/LazybagCtaSection";
import TrackCards from "@/components/home/TrackCards";
import { Suspense } from "react";

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
              <span className="text-sm font-bold text-gray-600 font-mono tracking-wider">
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
              <Link href="/future" className="bg-gray-900 text-white px-8 py-3.5 font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm rounded-sm">
                查看癱瘓實況 <ArrowRight size={20} />
              </Link>
            </div>
            <div className="pl-8">
              <Link href="/present" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                已知道背景？看各方怎麼說 <ArrowRight size={14} />
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
                src="/owl-avatars/owl.png"
                alt="貓頭鷹法官吉祥物"
                width={360} 
                height={360} 
                className="drop-shadow-xl"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* Controversy Timeline CTA Banner */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/controversy-timeline"
            className="block bg-amber-50 border-l-4 border-amber-400 rounded-r-sm px-6 py-5 md:py-4 my-8 hover:bg-amber-100/80 transition-colors group"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              <div>
                <p className="font-serif font-bold text-gray-900 text-base">
                  不知道發生什麼事？
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  3 分鐘看完憲法法庭從癱瘓到復活的完整故事
                </p>
              </div>
              <span className="text-sm font-bold text-amber-700 flex items-center gap-1 group-hover:underline shrink-0">
                看爭議時序 <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* The 3 Core Tracks Overview */}
      <section className="bg-white py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 border-b-2 border-gray-900 pb-4 flex justify-between items-end">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">三大核心軌道</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm hidden md:block">The Core Archives</p>
          </div>
          <p className="text-sm text-gray-400 mb-8 -mt-10">
            第一次來？建議先看「未來」了解危機，再回頭看「過去」與「現在」
          </p>

          <Suspense fallback={null}>
            <TrackCards />
          </Suspense>
        </div>
      </section>

      {/* Lazybag CTA */}
      <LazybagCtaSection />

    </div>
  );
}
