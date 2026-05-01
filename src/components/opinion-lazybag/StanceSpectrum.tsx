'use client';

import { useState } from 'react';

/* ─── Data: Justice positions on two dimensions ─── */

type OpinionType = '多數意見' | '協同意見' | '不同意見';

interface JusticePosition {
  name: string;
  type: OpinionType;
  summary: string;
  /** X: -1 (尊重國會裁量) to 1 (嚴格審查立法) */
  x: number;
  /** Y: -1 (程序問題可補正) to 1 (程序違憲即無效) */
  y: number;
}

const JUSTICES: JusticePosition[] = [
  // 多數意見
  { name: '許宗力', type: '多數意見', x: 0.7, y: 0.8, summary: '國會修法全面逾越憲法界限，程序與實體均嚴重違憲，應從嚴審查以維護權力分立。' },
  { name: '蔡烱燉', type: '多數意見', x: 0.6, y: 0.7, summary: '立法院擴權已侵害行政與司法核心領域，修法程序瑕疵構成違憲，不容事後補正。' },
  { name: '黃虹霞', type: '多數意見', x: 0.55, y: 0.65, summary: '修法條文多處違反比例原則，且議事程序欠缺實質討論，應宣告無效。' },
  { name: '吳陳鐶', type: '多數意見', x: 0.5, y: 0.6, summary: '國會調查權與聽證權之行使不得侵害人民基本權利，本案修法未設合理限制。' },
  { name: '蔡明誠', type: '多數意見', x: 0.6, y: 0.55, summary: '藐視國會罪之構成要件不明確，對言論自由產生寒蟬效應，違反法律明確性原則。' },
  { name: '林俊益', type: '多數意見', x: 0.5, y: 0.7, summary: '三讀程序未經逐條實質討論即付表決，構成重大議事瑕疵，相關條文應屬無效。' },
  { name: '許志雄', type: '多數意見', x: 0.65, y: 0.75, summary: '總統國情報告制度不得轉化為質詢機制，強制即問即答違反憲法權力分立架構。' },
  { name: '張瓊文', type: '多數意見', x: 0.55, y: 0.6, summary: '調查權擴及偵查中案件將破壞司法獨立，立法院權限應有明確憲法界限。' },
  { name: '黃瑞明', type: '多數意見', x: 0.6, y: 0.65, summary: '人事同意權之新程序實質架空提名機關權限，違反權力分立之制度設計。' },
  { name: '詹森林', type: '多數意見', x: 0.5, y: 0.55, summary: '修法整體方向雖有民主正當性考量，但個別條文仍須通過比例原則與明確性審查。' },
  // 協同意見
  { name: '黃昭元', type: '協同意見', x: 0.4, y: 0.45, summary: '同意違憲結論，但認為應從總統制本質與國會權限的憲法結構出發，而非僅依文義論證。' },
  { name: '謝銘洋', type: '協同意見', x: 0.35, y: 0.5, summary: '同意多數結論，另強調應建立制度性的行政特權主張與司法裁決機制。' },
  // 不同意見
  { name: '呂太郎', type: '不同意見', x: -0.5, y: -0.6, summary: '國會監督為民主課責核心，多數意見過度限縮立法裁量空間，程序瑕疵應容許補正。' },
  { name: '楊惠欽', type: '不同意見', x: -0.6, y: -0.5, summary: '立法院本有形成國會制度之權限，司法不應以過嚴標準介入議事自律領域。' },
];

const TYPE_COLORS: Record<OpinionType, { dot: string; bg: string; badge: string }> = {
  '多數意見': { dot: '#3b82f6', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  '協同意見': { dot: '#f59e0b', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  '不同意見': { dot: '#6b7280', bg: 'bg-gray-50', badge: 'bg-gray-200 text-gray-700' },
};

/* ─── Component ─── */

export default function StanceSpectrum() {
  const [selected, setSelected] = useState<string | null>(null);

  const PADDING = 12;

  function toPercent(value: number): number {
    return PADDING + ((value + 1) / 2) * (100 - 2 * PADDING);
  }

  const selectedJustice = selected ? JUSTICES.find((j) => j.name === selected) : null;

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs text-gray-600">
        {(Object.keys(TYPE_COLORS) as OpinionType[]).map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type].dot }}
            />
            {type}
          </span>
        ))}
      </div>

      {/* Scatter plot container */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="relative w-full aspect-square max-w-[540px] mx-auto">
          {/* Axis lines */}
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-[4%] bottom-[4%] w-px bg-gray-200" />
            <div className="absolute top-1/2 left-[4%] right-[4%] h-px bg-gray-200" />
          </div>

          {/* Axis labels */}
          <span className="absolute bottom-0 left-[4%] text-[10px] md:text-xs text-gray-400 font-serif">
            尊重國會裁量
          </span>
          <span className="absolute bottom-0 right-[4%] text-[10px] md:text-xs text-gray-400 font-serif text-right">
            嚴格審查立法
          </span>
          <span className="absolute top-[2%] left-[4%] text-[10px] md:text-xs text-gray-400 font-serif">
            程序違憲即無效
          </span>
          <span className="absolute bottom-[6%] left-[4%] text-[10px] md:text-xs text-gray-400 font-serif md:bottom-[4%]">
            程序問題可補正
          </span>

          {/* Dots */}
          {JUSTICES.map((justice) => {
            const left = toPercent(justice.x);
            const top = 100 - toPercent(justice.y);
            const isSelected = selected === justice.name;

            return (
              <div
                key={justice.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ left: `${left}%`, top: `${top}%` }}
                onMouseEnter={() => setSelected(justice.name)}
                onMouseLeave={() => setSelected(null)}
                onClick={() => setSelected(isSelected ? null : justice.name)}
              >
                {/* Dot */}
                <div
                  className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow-sm transition-transform"
                  style={{
                    backgroundColor: TYPE_COLORS[justice.type].dot,
                    transform: isSelected ? 'scale(1.5)' : 'scale(1)',
                  }}
                />
                {/* Desktop tooltip */}
                {isSelected && (
                  <div
                    className="hidden md:block absolute z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
                    style={{
                      // Position tooltip to avoid clipping
                      left: left > 60 ? 'auto' : '100%',
                      right: left > 60 ? '100%' : 'auto',
                      marginLeft: left > 60 ? 0 : '0.75rem',
                      marginRight: left > 60 ? '0.75rem' : 0,
                      top: top > 70 ? 'auto' : '0',
                      bottom: top > 70 ? '0' : 'auto',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-sm text-gray-900">{justice.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[justice.type].badge}`}>
                        {justice.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      「{justice.summary}」
                    </p>
                    <a
                      href="https://cons.judicial.gov.tw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-500 hover:text-blue-700 pointer-events-auto"
                    >
                      查看完整意見書 →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selectedJustice && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-[slideUp_150ms_ease-out]">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">{selectedJustice.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[selectedJustice.type].badge}`}>
                  {selectedJustice.type}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="關閉"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              「{selectedJustice.summary}」
            </p>
            <a
              href="https://cons.judicial.gov.tw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              查看完整意見書 →
            </a>
          </div>
        </div>
      )}

      {/* Footnote */}
      <p className="text-xs text-gray-400 font-serif leading-relaxed">
        位置根據各大法官在本案意見書中展現的論證傾向推估，僅供理解思路差異之參考，非精確量化數據。
      </p>
    </div>
  );
}
