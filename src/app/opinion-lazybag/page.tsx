import DecisionFlowchart from '@/components/opinion-lazybag/DecisionFlowchart';
import StanceSpectrum from '@/components/opinion-lazybag/StanceSpectrum';

export const metadata = {
  title: '國會職權修法判決解析 | Add C0urt 憲庭加好友',
  description: '以決策流程圖與意見光譜呈現憲法法庭如何審理114年憲判字第1號——理解合議制的論理過程。',
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

      {/* Section 1: Decision Flowchart */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
            法庭怎麼判的
          </h2>
          <p className="text-sm text-gray-600 font-serif">
            憲法法庭是合議制，以下是他們的推理過程。
          </p>
        </div>
        <DecisionFlowchart />
      </section>

      {/* Visual separator */}
      <div className="flex items-center gap-4 my-12">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-mono tracking-wider">
          ◆
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Section 2: Stance Spectrum */}
      <section>
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
            大法官怎麼想的
          </h2>
          <p className="text-sm text-gray-600 font-serif">
            雖然結論一致，但各大法官的思路不同——以下是他們的立場分布。
          </p>
        </div>
        <StanceSpectrum />
      </section>
    </div>
  );
}
