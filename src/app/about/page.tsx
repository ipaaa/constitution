import { Github, FileText, AlertCircle } from "lucide-react";
import ContributorGrid from "@/components/about/ContributorGrid";
import { contributors } from "@/data/contributors";

export const metadata = {
  title: "關於我們 — Add C0urt 憲庭加好友",
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
          關於我們
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
          <div className="space-y-6 text-gray-500 leading-relaxed text-lg pl-8 border-l border-gray-300 italic">
            <p>
              （專案緣由文案撰寫中，請參閱 docs/about-content.md）
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: 工作方法 */}
      {/* SSOT: docs/about-content.md — sync content from there */}
      <section className="bg-[#f8f6f0] border-t-2 border-b-2 border-gray-300 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-12">
            工作方法
          </h2>
          <div className="space-y-10 font-serif text-xl md:text-2xl leading-relaxed text-gray-800">
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">固定開會</h3>
              <p>
                貢獻者定期開會討論進度與方向
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">AI 協作程式</h3>
              <p>
                使用 AI 工具協助程式開發，加速迭代
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">學者專家驗證</h3>
              <p>
                所有內容經法律學者與專家審核確認正確性
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 貢獻者列表 */}
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

      {/* Section 4: Call for Action */}
      <section className="bg-gray-900 text-white py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: Join Us */}
            <div>
              <h2 className="text-3xl font-bold font-serif mb-6">
                一起參與
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                不管你會寫程式、翻譯法律白話文、還是單純分享我們的內容——你都是這個專案的一份子。
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="border border-gray-700 text-gray-300 px-4 py-2 rounded-sm text-sm font-medium">
                  UI/UX 設計師
                </span>
                <span className="border border-gray-700 text-gray-300 px-4 py-2 rounded-sm text-sm font-medium">
                  前端工程師
                </span>
                <span className="border border-gray-700 text-gray-300 px-4 py-2 rounded-sm text-sm font-medium">
                  法律文案 & 資料志工
                </span>
              </div>
            </div>

            {/* Right: Action Links */}
            <div className="space-y-3">
              <a
                href="https://github.com/g0v/Welcome-to-Add-C0urt"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-700 hover:border-white px-6 py-3 rounded-sm transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                <Github size={20} aria-hidden="true" />
                <span>查看原始碼 & Issues</span>
              </a>
              <a
                href="https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-700 hover:border-white px-6 py-3 rounded-sm transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                <FileText size={20} aria-hidden="true" />
                <span>協作共筆</span>
              </a>
              <a
                href="https://github.com/g0v/Welcome-to-Add-C0urt/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-700 hover:border-white px-6 py-3 rounded-sm transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                <AlertCircle size={20} aria-hidden="true" />
                <span>回報錯誤或建議</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
