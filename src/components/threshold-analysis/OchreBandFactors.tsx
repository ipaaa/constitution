import {
  BASIS_LABEL,
  RULING_AUTHORITY_LABEL,
  type FactorNote,
} from '@/data/threshold-analysis';

/**
 * 土黃色區起伏的可能因素，以獨立段落交付。
 *
 * **不做圖上箭頭註解。** 註解釘在某個 x 位置，等於宣告該因素造成該處起伏，
 * 而這正是本頁不能自行斷言的因果。因此本元件是圖之外的獨立段落，
 * 且 ThresholdChart 與其子元件一律不得 import FACTORS。見 AC-4。
 *
 * 每一項四欄：事實陳述、依據、不確定的是什麼、誰能拍板。
 * needsRuling 非 null 的項目必須帶可見的待確認標記與拍板者名稱。
 */
interface OchreBandFactorsProps {
  factors: readonly FactorNote[];
}

export default function OchreBandFactors({ factors }: OchreBandFactorsProps) {
  return (
    <section className="mt-10" aria-labelledby="factors-heading">
      <h3 id="factors-heading" className="font-serif text-lg font-bold text-gray-900 mb-1">
        土黃色區的起伏：看得出來的與看不出來的
      </h3>
      <p className="text-sm text-gray-600 font-serif mb-4">
        以下每一項都只是候選。事實陳述的部分可以查證，
        「這個因素是否解釋了那段起伏」則全部未證。帶「待確認」標記的項目，
        要標記中寫明的人拍板之後才能改成結論。
      </p>

      <ul className="space-y-3">
        {factors.map((factor) => (
          <li key={factor.id} className="bg-white border border-gray-200 rounded-sm p-4 md:p-5">
            <div className="flex items-start gap-3 mb-3">
              <p className="font-serif text-sm md:text-base text-gray-900 leading-relaxed flex-1">
                {factor.claim}
              </p>
              {factor.needsRuling !== null && (
                <span className="flex-shrink-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                  待確認
                </span>
              )}
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-100 pt-3">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  依據
                </dt>
                <dd className="font-serif text-xs text-gray-600 leading-relaxed">
                  {BASIS_LABEL[factor.basis]}
                  {factor.basisRef && <span className="block text-gray-500">{factor.basisRef}</span>}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  不確定的是什麼
                </dt>
                <dd className="font-serif text-xs text-gray-600 leading-relaxed">
                  {factor.uncertainty}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  誰能拍板
                </dt>
                <dd className="font-serif text-xs leading-relaxed">
                  {factor.needsRuling === null ? (
                    <span className="text-gray-600">本頁資料即可支持，無須外部拍板</span>
                  ) : (
                    <span className="text-amber-800 font-bold">
                      {RULING_AUTHORITY_LABEL[factor.needsRuling]}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
