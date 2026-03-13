import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="glass-header sticky top-0 z-50 w-full transition-all duration-400">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex justify-between items-center">
        <div className="brand flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-extrabold text-midnight tracking-tight">Add C0urt 憲庭加好友</h1>
          </Link>
        </div>
        <nav>
          <ul className="flex gap-2 list-none">
             <li>
              <Link href="/past" className="text-midnight px-5 py-2.5 rounded-full text-[0.95rem] font-semibold transition-all hover:bg-black/5">
                過去: 時光機
              </Link>
            </li>
            <li>
              <Link href="/present" className="bg-midnight text-white px-5 py-2.5 rounded-full text-[0.95rem] font-semibold transition-all shadow-sm">
                現在: 熱搜榜
              </Link>
            </li>
            <li>
              <Link href="/future" className="text-midnight px-5 py-2.5 rounded-full text-[0.95rem] font-semibold transition-all hover:bg-black/5">
                未來: 載入中
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
