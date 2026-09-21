'use client';

import { useEffect, useRef } from 'react';
import { YEARS, type EraStat, type ThresholdEra } from '@/data/threshold-analysis';

/**
 * 時期對照條。本頁量測端值的主要裝置。
 *
 * 讀者要看見的不是「有一張圖」，而是「雙四分之三期年均 6.7 件、雙三分之二期年均 17.3 件」
 * 這個對比，以及「案件量的回升早於門檻變動」這個限制。
 *
 * 倍率由未四捨五入的年均相除後才進位。先進位再相除會讓第二個倍率變成 2.58。
 * 桌機四格橫排，行動版直向堆疊；行動版點一格會展開該期的逐年件數清單，
 * 因為 375px 下每個年長條只有 3.5px 寬，做不了逐年觸控。
 */
interface EraComparisonStripProps {
  /** 每期一個 tile。順序即時間序。 */
  items: readonly EraStat[];
  selectedEraId: ThresholdEra['id'] | null;
  onSelectEra: (id: ThresholdEra['id'] | null) => void;
}

/** 某期涵蓋的年份與件數，供行動版展開後的逐年清單使用。 */
function yearsOfEra(era: ThresholdEra) {
  const from = Number(era.effectiveFrom.slice(0, 4));
  const to = era.effectiveTo === null ? Infinity : Number(era.effectiveTo.slice(0, 4));
  return YEARS.filter((y) => y.series === 'interpretation' && y.year >= from && y.year < to);
}

export default function EraComparisonStrip({
  items,
  selectedEraId,
  onSelectEra,
}: EraComparisonStripProps) {
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 行動版點色帶選取時期後，把對應的 tile 捲進視窗。
  useEffect(() => {
    if (!selectedEraId) return;
    tileRefs.current.get(selectedEraId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedEraId]);

  return (
    <section className="mt-6" aria-labelledby="era-strip-heading">
      <h3 id="era-strip-heading" className="font-serif text-lg font-bold text-gray-900 mb-1">
        四個時期的門檻與案件量
      </h3>
      <p className="text-sm text-gray-600 font-serif mb-4">
        年均件數的分母是各時期與釋字資料範圍（1949-01-06 至 2021-12-24）的交集，
        案件逐筆按發布日歸期，不按年歸期。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const { era } = item;
          const selected = selectedEraId === era.id;
          const unverified = era.evidence === 'unverified';
          return (
            <div
              key={era.id}
              ref={(el) => {
                if (el) tileRefs.current.set(era.id, el);
                else tileRefs.current.delete(era.id);
              }}
              className={`border rounded-sm bg-white transition-colors ${
                selected ? 'border-gray-800 shadow-sm' : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectEra(selected ? null : era.id)}
                aria-expanded={selected}
                aria-controls={`era-years-${era.id}`}
                className="w-full text-left p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: era.colorToken }}
                    aria-hidden="true"
                  />
                  <span className="font-serif font-bold text-gray-900">{era.label}</span>
                </div>

                <div className="font-mono text-[11px] text-gray-500 mb-2">
                  {era.effectiveFrom} — {era.effectiveTo ?? '至今'}
                </div>

                <div className="font-serif text-sm text-gray-700 mb-3">
                  {era.ruleSummary}
                  {unverified && (
                    <span className="ml-1 inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      未確認
                    </span>
                  )}
                </div>

                {item.meanPerYear === null ? (
                  <div className="font-serif text-sm text-gray-500">無釋字資料</div>
                ) : (
                  <>
                    <div className="font-mono text-2xl font-bold text-gray-900 leading-none">
                      {item.meanPerYear.toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-1">件／年</span>
                    </div>
                    <div className="font-mono text-[11px] text-gray-500 mt-1.5">
                      合計 {item.totalCount} 件／{item.yearSpan.toFixed(1)} 年
                    </div>
                    {item.ratioToPrevious !== null && (
                      <div className="font-mono text-xs text-gray-700 mt-1.5">
                        相對前一期 {item.ratioToPrevious.toFixed(2)}×
                      </div>
                    )}
                  </>
                )}

                {era.quotedText && (
                  <div className="mt-3 border-t border-gray-100 pt-2">
                    <div className="font-mono text-[10px] text-gray-400">
                      {era.statute} {era.article}
                    </div>
                    <p className="font-serif text-[11px] text-gray-500 leading-relaxed mt-1">
                      {era.quotedText}
                    </p>
                  </div>
                )}
                {unverified && (
                  <div className="mt-3 border-t border-gray-100 pt-2">
                    <p className="font-serif text-[11px] text-amber-800 leading-relaxed">
                      全國法規資料庫的歷史條文只回溯到 1958-07-21，本期的條文全文不在其中。
                      本頁因此不寫出本期的通過人數。
                    </p>
                  </div>
                )}
              </button>

              {/* 行動版：展開該期逐年件數。桌機靠圖上 hover 取得逐年數字。 */}
              <div id={`era-years-${era.id}`} hidden={!selected} className="px-4 pb-4">
                {yearsOfEra(era).length === 0 ? (
                  <p className="font-serif text-xs text-gray-500">本期沒有釋字可列。</p>
                ) : (
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-1 font-mono text-[11px] text-gray-600 border-t border-gray-100 pt-3">
                    {yearsOfEra(era).map((y) => (
                      <div key={y.year} className="flex justify-between">
                        <dt>{y.year}</dt>
                        <dd className="text-gray-900">{y.count}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/*
        本頁的核心誠實點。資料的時間順序與會議記錄的敘事相反，這一段必須留著。
        讀者若讀成「先放寬門檻才暴增」，本頁就失敗了。
      */}
      <div className="mt-4 border-l-4 border-gray-800 bg-white px-4 py-3">
        <p className="font-serif text-sm text-gray-800 leading-relaxed">
          <strong>先後順序：案件量先回升，門檻才放寬。</strong>
          案件量自 1986 年起回升，到 1992 年已達 22 件。
          門檻放寬的公布日是 1993-02-03。回升在前，門檻變動在後。
        </p>
        <p className="font-serif text-sm text-gray-600 leading-relaxed mt-2">
          這張圖看得出兩者的先後，看不出誰造成誰。
          雙四分之三期的後段（1986-01-01 至 1993-02-02）年均已達 15.8 件，
          接近雙三分之二期的 17.3 件，而該段全程門檻未變。
        </p>
      </div>
    </section>
  );
}
