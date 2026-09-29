import Link from 'next/link';
import ThresholdCaseAnalysis from '@/components/threshold-analysis/ThresholdCaseAnalysis';

export const metadata = {
  title: '門檻與案件量 | Add C0urt 憲庭加好友',
  description:
    '1949 至 2026 年憲法法庭解釋與判決的年度件數，對照四個時期的門檻。門檻時點取自法規公布日，案件計數取自司法院公開資料。',
  openGraph: {
    title: '門檻與案件量 | Add C0urt 憲庭加好友',
    description: '大法官通過一件解釋要多少人同意？門檻改過四次。案件量的曲線長這樣。',
    images: [{ url: '/owl-avatars/owl.png', width: 360, height: 360, alt: 'Add C0urt 貓頭鷹法官吉祥物' }],
  },
};

export default function ThresholdsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 w-full min-h-screen">
      <div className="mb-10 border-l-4 border-gray-800 pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3 flex-wrap">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">
            Data
          </span>
          <span className="font-serif">通過一件解釋，要多少人同意？</span>
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">
          四個時期的門檻，對上 1949 至 2026 年的案件量。
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 mb-8">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">這個頁面在講什麼？</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2 font-serif">
          <p>
            大法官要作成一件解釋，不是過半數就算數。法律規定了「多少人出席」與「多少人同意」。
            這個條件改過幾次，每次都寫在法條裡，有公布日可查。
          </p>
          <p>
            下面這張圖把兩件事放在一起：底層色帶是各時期的門檻，長條是當年實際作成的件數。
            門檻的起訖日一律取自法規公布日，不取自任何人的口述年份。
          </p>
          <p>
            <strong className="text-gray-800">這張圖不宣告因果。</strong>
            它呈現可查證的計數與可查證的公布日，讓你自己看兩者的先後。
            資料看不出來的部分，寫在頁面下半部，一項一項標明。
          </p>
        </div>
      </div>

      <ThresholdCaseAnalysis />

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">資料來源</h2>
        <ul className="text-sm text-gray-600 font-serif space-y-1.5 leading-relaxed">
          <li>
            釋字件數：司法院大法官解釋清單與各號明細頁的「發布日期」，第 1 號至第 813 號，
            共 813 筆，無缺號。
          </li>
          <li>憲判字件數：司法院憲法法庭判決清單，民國 111 年至 115 年。</li>
          <li>
            門檻條文：全國法規資料庫。現行憲法訴訟法與其歷史條文為 pcode A0030159；
            規則期的《司法院大法官會議規則》為另一筆已廢止法規 pcode A0030300，
            取得的是 1952-04-16 修正後的版本。
          </li>
          <li>
            抓取程式：<code className="font-mono text-xs">scripts/fetch-interpretation-counts.mjs</code>
            。人工執行，不進建置流程，也不改內容產線的資料檔。
          </li>
        </ul>
        <p className="text-xs text-gray-400 font-serif leading-relaxed mt-4">
          本頁為編輯團隊以公開資料整理，目的是幫助讀者理解制度變化，非法律意見。
          頁面下半部標記「待確認」的項目尚未經法學背景者確認，不得當成結論引用。
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/past" className="text-sm font-serif underline text-gray-600 hover:text-gray-900">
            回到 憲法課本時光機
          </Link>
          <Link href="/future" className="text-sm font-serif underline text-gray-600 hover:text-gray-900">
            看 大法官席次時間軸
          </Link>
        </div>
      </div>
    </div>
  );
}
