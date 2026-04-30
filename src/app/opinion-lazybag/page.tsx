import { OPINIONS, DIMENSIONS } from '@/data/opinions';
import OpinionLazybag from '@/components/opinion-lazybag/OpinionLazybag';

export const metadata = {
  title: '大法官意見懶人包 | Add C0urt 憲庭加好友',
  description: '以論證角度分類不同大法官立場的懶人包，避免以人物或黨派標籤引導偏見。',
};

export default function OpinionLazybagPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full min-h-screen">
      {/* Header */}
      <div className="mb-10 border-l-4 border-gray-800 pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">
            Opinions
          </span>
          <span className="font-serif">大法官意見懶人包</span>
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">
          理解法律論證的光譜，而非評斷誰對誰錯。
        </p>
      </div>

      <OpinionLazybag opinions={OPINIONS} dimensions={DIMENSIONS} />
    </div>
  );
}
