import { TIMELINE_EVENTS, CATEGORIES } from '@/data/controversy-timeline';
import ControversyTimeline from '@/components/controversy-timeline/ControversyTimeline';

export const metadata = {
  title: '憲法法庭爭議時序懶人包 | Add C0urt 憲庭加好友',
  description: '以互動式時間軸呈現2024至2026年間，立法院與憲法法庭的憲政爭議完整始末。白話文解說，讓每個人都能看懂。',
};

export default function ControversyTimelinePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 w-full min-h-screen">
      {/* Header */}
      <div className="mb-10 border-l-4 border-gray-800 pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">
            Timeline
          </span>
          <span className="font-serif">憲法法庭爭議時序懶人包</span>
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">
          從國會擴權到憲法法庭回歸——完整回顧2024至2026年的憲政風暴。
        </p>
      </div>

      {/* Intro */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 mb-10">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">
          這個頁面在講什麼？
        </h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2 font-serif">
          <p>
            2024年起，台灣經歷了一場圍繞國會權力與憲法法庭的重大憲政爭議。立法院多數通過擴權法案，
            憲法法庭宣告違憲，隨後國會反過來試圖癱瘓憲法法庭——這場對抗最終在2026年初以一個里程碑判決收場。
          </p>
          <p>
            以下時間軸以白話文整理了整個爭議的15個關鍵時間點。點擊任一事件可展開完整說明。
            你也可以使用上方的分類標籤來篩選特定類型的事件。
          </p>
        </div>
      </div>

      <ControversyTimeline events={TIMELINE_EVENTS} categories={CATEGORIES} />

      {/* Footer attribution */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-400 font-serif leading-relaxed">
          本頁內容參考張娟芬〈
          <a
            href="https://www.mirrormedia.mg/external/dailycolumn_39929"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            憲法法庭，歡迎回來——兼評114年憲判字第1號判決
          </a>
          〉（鏡週刊，2026年1月14日）及公開資料整理而成。時間軸為編輯團隊以白話文改寫，
          目的是幫助讀者理解事件脈絡，非法律意見。
        </p>
      </div>
    </div>
  );
}
