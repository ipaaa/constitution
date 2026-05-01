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
      <section className="border-t border-gray-200 py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif border-l-[6px] border-gray-900 pl-6 mb-10">
            專案緣由
          </h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg pl-8 border-l border-gray-300">
            <p>
              對大多數台灣公民來說，憲法法庭是一個遙遠而模糊的存在。它的運作被厚重的法律語言包裹，被政治口水淹沒，被媒體的片段報導切割得支離破碎。然而，這個機構守護的正是每一位公民最根本的權利——當它癱瘓時，受傷的不是政治人物，而是你我。
            </p>
            <p>
              現有的資訊來源不是太學術、就是太黨派、或者太零散。學術論文對一般民眾來說門檻太高；政論節目的討論充滿立場預設；新聞報導往往只抓住爭議的片段，缺乏結構化的脈絡整理。公民需要一個中立、易懂、完整的資訊入口，卻找不到。
            </p>
            <p>
              Add C0urt 憲庭加好友是一個開源的公民科技專案，試圖填補這個空缺。我們將枯燥的法律程序轉化為清晰、可分享、零門檻的資訊。我們不說教、不站隊——我們提供工具，讓公民自己理解、自己判斷、自己行動。
            </p>
            <p>
              這個專案誕生於 g0v 零時政府社群，遵循開源、去中心化的協作模式。從第一行程式碼到每一段白話文解釋，都是志工貢獻的成果。我們相信，降低理解門檻本身就是一種公民行動。
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: 前言/宣言 */}
      <section className="bg-[#f8f6f0] border-t-2 border-b-2 border-gray-300 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-12">
            我們的宣言
          </h2>
          <div className="space-y-10 font-serif text-xl md:text-2xl leading-relaxed text-gray-800">
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">透明</h3>
              <p>
                我們相信每位公民都有權理解守護自身權利的制度，不需要法律學位也能看懂。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">客觀</h3>
              <p>
                我們呈現事實與多元觀點。我們不是任何政黨或意識形態的傳聲筒。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">開源</h3>
              <p>
                我們的程式碼、資料與編輯流程完全公開。任何人都可以驗證、貢獻或分支。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">行動</h3>
              <p>
                理解是第一步。我們打造工具，將意識轉化為公民參與。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">共創</h3>
              <p>
                這不是一個團隊的專案。它屬於每一位貢獻了一行程式碼、一段白話文摘要、或一次社群分享的公民。
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
