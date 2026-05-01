'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Data: Justice opinion spectrum for each provision ─── */

type OpinionType = '多數意見' | '協同意見' | '不同意見' | '部分不同意見';

interface OpinionStance {
  type: OpinionType;
  summary: string;
  justices: string[];
}

interface ProvisionStances {
  id: string;
  title: string;
  stances: OpinionStance[];
}

const OPINION_TYPE_STYLES: Record<OpinionType, string> = {
  '多數意見': 'bg-blue-50 text-blue-800 border-blue-200',
  '協同意見': 'bg-sky-50 text-sky-700 border-sky-200',
  '不同意見': 'bg-slate-50 text-slate-700 border-slate-200',
  '部分不同意見': 'bg-amber-50 text-amber-700 border-amber-200',
};

const OPINION_TYPE_DOT: Record<OpinionType, string> = {
  '多數意見': 'bg-blue-400',
  '協同意見': 'bg-sky-400',
  '不同意見': 'bg-slate-400',
  '部分不同意見': 'bg-amber-400',
};

const PROVISION_STANCES: ProvisionStances[] = [
  {
    id: 'report',
    title: '總統國情報告（即問即答）',
    stances: [
      {
        type: '多數意見',
        summary: '總統國情報告屬禮遇性質，不得以法律強制即問即答，否則混淆行政院對立法院負責的憲法架構。',
        justices: ['許宗力', '蔡烱燉', '黃虹霞', '吳陳鐶', '蔡明誠', '林俊益', '許志雄', '張瓊文', '黃瑞明', '詹森林'],
      },
      {
        type: '協同意見',
        summary: '同意違憲結論，但認為應從「總統制」本質出發論述，而非僅從文義解釋「得」字來推導。',
        justices: ['黃昭元', '謝銘洋'],
      },
      {
        type: '不同意見',
        summary: '國情報告接受詢答並非質詢，係民主課責之體現，不違反權力分立，多數意見過度限縮立法形成空間。',
        justices: ['呂太郎', '楊惠欽'],
      },
    ],
  },
  {
    id: 'hearing',
    title: '聽證調查權',
    stances: [
      {
        type: '多數意見',
        summary: '立法院固有調查權，但對民間人士強制出席之罰鍰規定欠缺比例原則與救濟程序，該部分違憲。',
        justices: ['許宗力', '蔡烱燉', '黃虹霞', '吳陳鐶', '蔡明誠', '林俊益', '許志雄', '張瓊文', '黃瑞明'],
      },
      {
        type: '協同意見',
        summary: '同意結論，但強調問題核心不只是程序瑕疵，而是調查權本身的憲法界限需要更清楚劃定。',
        justices: ['詹森林', '黃昭元'],
      },
      {
        type: '部分不同意見',
        summary: '罰鍰規定雖有瑕疵但可透過合憲性解釋補救，無需直接宣告違憲，應給予立法者修正機會。',
        justices: ['呂太郎', '謝銘洋'],
      },
      {
        type: '不同意見',
        summary: '調查權為國會核心職能，強制出席與罰鍰屬必要配套，多數意見架空了國會監督功能。',
        justices: ['楊惠欽'],
      },
    ],
  },
  {
    id: 'contempt',
    title: '藐視國會罪',
    stances: [
      {
        type: '多數意見',
        summary: '「虛偽陳述」構成要件不明確，違反法律明確性原則，刑事手段未通過比例原則之最後手段性審查。',
        justices: ['許宗力', '蔡烱燉', '黃虹霞', '吳陳鐶', '蔡明誠', '林俊益', '許志雄', '張瓊文', '黃瑞明', '詹森林', '黃昭元'],
      },
      {
        type: '協同意見',
        summary: '同意違憲，但另從言論免責權角度補充——刑罰將對官員答詢產生寒蟬效應，傷害議事品質。',
        justices: ['謝銘洋'],
      },
      {
        type: '不同意見',
        summary: '民主國家國會應有維護議事秩序之制裁手段，虛偽陳述之認定可循司法程序確認，非不可操作。',
        justices: ['呂太郎', '楊惠欽'],
      },
    ],
  },
  {
    id: 'consent',
    title: '人事同意權',
    stances: [
      {
        type: '多數意見',
        summary: '相關條文在三讀時未經實質逐條討論，議事程序存在重大瑕疵，因程序違憲而無效。',
        justices: ['許宗力', '蔡烱燉', '黃虹霞', '吳陳鐶', '蔡明誠', '林俊益', '許志雄', '張瓊文', '黃瑞明', '詹森林'],
      },
      {
        type: '協同意見',
        summary: '除程序瑕疵外，實體內容亦有問題——部分條文實質架空提名機關之人事權，應一併指出。',
        justices: ['黃昭元', '謝銘洋'],
      },
      {
        type: '部分不同意見',
        summary: '議事自律應予尊重，程序瑕疵之認定標準過於嚴格，恐使司法過度介入國會自治領域。',
        justices: ['呂太郎', '楊惠欽'],
      },
    ],
  },
  {
    id: 'investigation',
    title: '調查權界線',
    stances: [
      {
        type: '多數意見',
        summary: '調查權不得擴及偵查中案件，否則侵害司法獨立；行政特權保障行政內部討論空間亦不得任意調閱。',
        justices: ['許宗力', '蔡烱燉', '黃虹霞', '吳陳鐶', '蔡明誠', '林俊益', '許志雄', '張瓊文', '黃瑞明', '詹森林', '黃昭元'],
      },
      {
        type: '協同意見',
        summary: '同意結論，並認為應建立制度性的「特權主張—司法裁決」機制，而非僅宣告界限。',
        justices: ['謝銘洋'],
      },
      {
        type: '不同意見',
        summary: '多數意見對行政特權之保護過度寬泛，將使國會對行政部門之監督形同虛設。',
        justices: ['呂太郎', '楊惠欽'],
      },
    ],
  },
];

/* ─── Components ─── */

function ProvisionCard({ provision }: { provision: ProvisionStances }) {
  const [expanded, setExpanded] = useState(false);

  // On mobile, collapsed by default; on desktop, always show
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="md:hidden w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <h4 className="font-serif font-bold text-gray-900 text-sm">
          {provision.title}
        </h4>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Desktop header (no collapse) */}
      <div className="hidden md:block p-4 pb-0">
        <h4 className="font-serif font-bold text-gray-900 text-sm">
          {provision.title}
        </h4>
      </div>

      {/* Content — collapsible on mobile, always visible on desktop */}
      <div className={`${expanded ? 'block' : 'hidden'} md:block p-4 pt-3 space-y-3`}>
        {provision.stances.map((stance, i) => (
          <div
            key={i}
            className={`border rounded-md p-3 ${OPINION_TYPE_STYLES[stance.type]}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${OPINION_TYPE_DOT[stance.type]}`} />
              <span className="text-xs font-bold">{stance.type}</span>
            </div>
            <p className="text-sm leading-relaxed mb-2">{stance.summary}</p>
            <p className="text-xs opacity-70">
              {stance.justices.join('、')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StanceSpectrum() {
  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        {(Object.keys(OPINION_TYPE_DOT) as OpinionType[]).map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${OPINION_TYPE_DOT[type]}`} />
            {type}
          </span>
        ))}
      </div>

      {/* Provision cards */}
      <div className="space-y-4">
        {PROVISION_STANCES.map((provision) => (
          <ProvisionCard key={provision.id} provision={provision} />
        ))}
      </div>

      {/* Footnote */}
      <p className="text-xs text-gray-400 font-serif leading-relaxed">
        上述分類基於公開之判決書意見書內容整理，旨在呈現法律論證思路之差異，不代表任何政治立場判斷。
        大法官姓名僅供對照意見書原文使用。
      </p>
    </div>
  );
}
