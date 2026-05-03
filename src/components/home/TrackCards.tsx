'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, Search, Workflow } from 'lucide-react';
import { PUBLIC_PAGES } from '@/data/launch-status';
import { CRISIS_STATS } from '@/data/future';

function isPageLaunched(path: string, isPublicMode: boolean): boolean {
  if (!isPublicMode) return true;
  return PUBLIC_PAGES.includes(path);
}

export default function TrackCards() {
  const searchParams = useSearchParams();
  const isPublicMode = searchParams.get('public') === 'true' ||
    process.env.NEXT_PUBLIC_PUBLIC_MODE === 'true';

  const pastLaunched = isPageLaunched('/past', isPublicMode);
  const presentLaunched = isPageLaunched('/present', isPublicMode);
  const futureLaunched = isPageLaunched('/future', isPublicMode);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Track 1 */}
      {pastLaunched ? (
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
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-sm flex flex-col items-start h-full opacity-60">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="bg-gray-400 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 1</div>
            <div className="w-10 h-10 border border-gray-200 rounded-sm flex items-center justify-center">
              <Clock className="text-gray-400" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-400 font-serif">過去：時光機</h3>
          <p className="text-gray-400 font-medium leading-relaxed mb-8 flex-grow">
            憲法課本與現實的衝撞。<br/>看見歷史的強烈情感與權利的重量。
          </p>
          <span className="text-sm font-bold text-gray-400 mt-auto">即將開放</span>
        </div>
      )}

      {/* Track 2 */}
      {presentLaunched ? (
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
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-sm flex flex-col items-start h-full opacity-60 border-t-4 border-t-gray-400">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="bg-gray-400 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 2</div>
            <div className="w-10 h-10 border border-gray-200 rounded-sm flex items-center justify-center">
              <Search className="text-gray-400" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-400 font-serif">現在：熱搜榜</h3>
          <p className="text-gray-400 font-medium leading-relaxed mb-8 flex-grow">
            釋憲動態聚合。<br/>專業新聞剪報式儀表板，多元觀點懶人包。
          </p>
          <span className="text-sm font-bold text-gray-400 mt-auto">即將開放</span>
        </div>
      )}

      {/* Track 3 */}
      {futureLaunched ? (
        <Link
          href="/future"
          className="group relative bg-gray-900 text-white border border-gray-900 p-8 shadow-sm rounded-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2 transition-all flex flex-col items-start h-full overflow-hidden"
          aria-label={`進入憲庭載入中：${CRISIS_STATS.totalPending} 件案件待審，僅存 ${CRISIS_STATS.activeJustices} 名大法官運作（三名不參與評議會）`}
        >
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-[#D32F2F] rounded-full blur-[90px] opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative flex justify-between w-full items-start mb-6">
            <div className="bg-[#D32F2F] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 3</div>
            <div className="w-10 h-10 border border-gray-700 bg-gray-800 rounded-sm flex items-center justify-center group-hover:bg-gray-700 transition-colors">
              <Workflow className="text-red-400 group-hover:text-red-300" size={20} />
            </div>
          </div>
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
      ) : (
        <div className="relative bg-gray-700 text-white border border-gray-700 p-8 rounded-sm flex flex-col items-start h-full overflow-hidden opacity-60">
          <div className="relative flex justify-between w-full items-start mb-6">
            <div className="bg-gray-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Track 3</div>
            <div className="w-10 h-10 border border-gray-600 bg-gray-600 rounded-sm flex items-center justify-center">
              <Workflow className="text-gray-400" size={20} />
            </div>
          </div>
          <h3 className="relative text-2xl font-bold mb-3 text-gray-400 font-serif">未來：憲庭載入中</h3>
          <p className="relative text-gray-500 font-medium leading-relaxed mb-8 flex-grow">
            客觀的系統癱瘓數據。<br/>透視五人極限運作的系統瓶頸，與身分連動。
          </p>
          <span className="text-sm font-bold text-gray-400 mt-auto">即將開放</span>
        </div>
      )}

    </div>
  );
}
