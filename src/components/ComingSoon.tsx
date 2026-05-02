import Image from 'next/image';
import Link from 'next/link';

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-20 bg-[#F6F8FA]">
      <div className="bg-white border border-gray-200 rounded-sm p-10 md:p-16 shadow-sm max-w-lg w-full text-center">
        <div className="mb-8">
          <Image
            src="/owl.png"
            alt="貓頭鷹法官吉祥物"
            width={160}
            height={160}
            className="mx-auto drop-shadow-lg"
          />
        </div>

        <div className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest inline-block mb-4">
          Coming Soon
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-4">
          即將推出
        </h1>

        <p className="text-gray-500 font-medium leading-relaxed mb-8 font-serif">
          這個頁面正在準備中，我們正在努力讓內容更完善。
          <br />
          請先探索其他已上線的內容！
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors rounded-sm"
        >
          回到首頁
        </Link>
      </div>
    </div>
  );
}
