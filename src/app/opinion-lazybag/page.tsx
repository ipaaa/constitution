import DecisionFlowchart from '@/components/opinion-lazybag/DecisionFlowchart';

export const metadata = {
  title: '國會職權修法判決解析 | Add C0urt 憲庭加好友',
  description: '以決策流程圖呈現憲法法庭如何審理114年憲判字第1號——理解合議制的論理過程。',
};

export default function OpinionLazybagPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 w-full min-h-screen">
      {/* Header */}
      <div className="mb-10 border-l-4 border-gray-800 pl-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">
            Ruling
          </span>
          <span className="font-serif">國會職權修法判決</span>
        </h1>
        <p className="text-gray-500 font-medium font-serif mt-2 text-lg">
          114年憲判字第1號——法庭如何逐條論理，而非投票表決。
        </p>
      </div>

      <DecisionFlowchart />
    </div>
  );
}
