'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-all duration-400 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex flex-col md:flex-row justify-between md:items-center gap-2 py-2 md:py-0">
        <div className="flex items-center">
          <Link href="/" className="flex flex-col items-start gap-px group border-l-4 border-[#D32F2F] pl-3 py-1">
            <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight font-serif group-hover:text-blue-700 transition-colors leading-none">Add C0urt 憲庭加好友</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">The Supreme Court Archive</span>
          </Link>
        </div>
        <nav aria-label="主要導覽" className="flex-grow flex justify-center md:justify-end overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <ul className="flex gap-2 sm:gap-6 list-none items-center h-full sm:h-auto">
             <li>
              <Link href="/past" className={`px-3 py-1.5 text-sm font-bold transition-all rounded-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${pathname === '/past' ? 'text-gray-900 border-gray-300 border shadow-sm' : 'text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${pathname === '/past' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>T1</span> 過去：時光機
              </Link>
            </li>
            <li>
              <Link href="/present" className={`px-3 py-1.5 text-sm font-bold transition-all rounded-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${pathname === '/present' ? 'text-gray-900 border-gray-300 border shadow-sm' : 'text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${pathname === '/present' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>T2</span> 現在：熱搜榜
              </Link>
            </li>
            <li>
              <Link href="/future" className={`px-3 py-1.5 text-sm font-bold transition-all rounded-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${pathname === '/future' ? 'text-gray-900 border-gray-300 border shadow-sm' : 'text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${pathname === '/future' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>T3</span> 未來：載入中
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
