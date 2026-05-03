import Image from "next/image";
import ContributorGrid from "@/components/about/ContributorGrid";
import { contributors } from "@/data/contributors";

export const metadata = {
  title: "關於 — Add C0urt 憲庭加好友",
  description: "了解 Add C0urt 專案的緣起、價值觀、貢獻者，以及如何參與。",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Page Header */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16 w-full">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-gray-800 text-white px-2 py-1 text-xs font-bold tracking-widest uppercase">
            About
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif border-l-[6px] border-gray-900 pl-6">
          關於
        </h1>
        <p className="text-lg text-gray-600 font-medium mt-4 pl-8 border-l border-gray-300">
          為什麼我們做這個網站，以及你可以如何參與。
        </p>
      </section>

      {/* Section 1: 專案緣由 */}
      {/* SSOT: docs/about-content.md — sync content from there */}
      <section className="border-t border-gray-200 py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif border-l-[6px] border-gray-900 pl-6 mb-10">
            專案緣由
          </h2>
          <div className="flex gap-6 items-start">
            <div className="space-y-6 text-gray-500 leading-relaxed text-lg pl-8 border-l border-gray-300 italic flex-1">
              <p>
                （專案緣由文案撰寫中，請參閱 docs/about-content.md）
              </p>
            </div>
            <Image
              src="/owl-avatars/codex-owl.png"
              alt="貓頭鷹法官"
              width={140}
              height={140}
              className="hidden md:block w-[96px] md:w-[140px] h-auto flex-shrink-0"
            />
          </div>
        </div>
      </section>

      {/* Section 2: 貢獻者列表 */}
      <section className="border-t border-gray-200 py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
              貢獻者
            </h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-sm">
              {contributors.length} 人
            </span>
          </div>
          <ContributorGrid contributors={contributors} />
        </div>
      </section>
    </div>
  );
}
