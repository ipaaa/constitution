'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Data: 5 contested provisions from 114年憲判字第1號 ─── */

interface Provision {
  id: string;
  title: string;
  category: '權力分立' | '程序瑕疵' | '人民權利';
  whatPassed: string;
  reasoning: string[];
  ruling: '違憲' | '部分違憲' | '合憲';
  rulingDetail: string;
}

const PROVISIONS: Provision[] = [
  {
    id: 'report',
    title: '總統國情報告（即問即答）',
    category: '權力分立',
    whatPassed: '要求總統赴立法院進行國情報告時，須接受立委即時提問並當場答覆。',
    reasoning: [
      '憲法僅規定總統「得」至立法院報告國情，未賦予立法院強制總統到場義務。',
      '即問即答機制實質上形成「質詢」效果，逾越憲法對行政院與立法院之問責架構。',
      '總統非由立法院選出，不對立法院負責——若需逐條答覆質疑，將混淆責任政治之歸屬。',
    ],
    ruling: '違憲',
    rulingDetail: '強制即問即答部分違反權力分立原則，總統赴國情報告屬憲法禮遇性質，不得以法律加諸義務。',
  },
  {
    id: 'hearing',
    title: '聽證調查權',
    category: '權力分立',
    whatPassed: '賦予立法院得對政府官員及民間人士進行聽證調查，拒絕出席可處罰鍰。',
    reasoning: [
      '立法院固有輔助立法之調查權，但行使方式不得侵害司法權及行政特權。',
      '對民間人士強制聽證涉及人民基本權利之限制，須有明確法律要件與救濟途徑。',
      '本次修法之程序要件與處罰規定過於空泛，欠缺比例原則之審查機制。',
    ],
    ruling: '部分違憲',
    rulingDetail: '調查權本身合憲，但強制民間人士出席及罰鍰規定因欠缺比例原則與救濟程序而違憲。',
  },
  {
    id: 'contempt',
    title: '藐視國會罪',
    category: '人民權利',
    whatPassed: '增設藐視國會罪，官員於質詢或聽證時為虛偽陳述者，處刑事罰。',
    reasoning: [
      '刑事處罰涉及人身自由之限制，為最嚴厲之國家制裁手段，須符合最後手段性。',
      '「虛偽陳述」之構成要件定義模糊，對被質詢人產生寒蟬效應，影響言論自由。',
      '現行法制已有偽證罪等規範，新增藐視罪之必要性未獲充分論證。',
    ],
    ruling: '違憲',
    rulingDetail: '構成要件不明確、違反法律明確性原則，且未能通過比例原則之審查。',
  },
  {
    id: 'consent',
    title: '人事同意權',
    category: '程序瑕疵',
    whatPassed: '修改人事同意權行使程序，增設被提名人答詢義務與資格審查新要件。',
    reasoning: [
      '人事同意權為立法院之憲法職權，立法裁量空間較大。',
      '惟程序設計不得實質架空提名機關之人事權，變相由立法院主導人選。',
      '本修法部分條文之審查程序在三讀時存在重大議事瑕疵，未經實質討論。',
    ],
    ruling: '部分違憲',
    rulingDetail: '基於議事程序重大瑕疵（未經實質逐條討論即付表決），相關條文因程序違憲而無效。',
  },
  {
    id: 'investigation',
    title: '調查權界線',
    category: '權力分立',
    whatPassed: '擴大立法院調查權範圍，得向政府機關調閱包含偵查中案件之文件。',
    reasoning: [
      '立法院調查權為輔助性權力，範圍限於與立法有重大關聯之事項。',
      '偵查中案件涉及司法獨立與偵查不公開原則，立法院不得逕行調閱。',
      '行政特權（Executive Privilege）保障行政內部決策過程之自由討論空間。',
    ],
    ruling: '違憲',
    rulingDetail: '調查權不得無限擴張至偵查中案件，違反司法獨立原則及權力分立之核心領域。',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  '權力分立': 'bg-blue-50 text-blue-700 border-blue-200',
  '程序瑕疵': 'bg-amber-50 text-amber-700 border-amber-200',
  '人民權利': 'bg-rose-50 text-rose-700 border-rose-200',
};

const RULING_COLORS: Record<string, string> = {
  '違憲': 'bg-red-100 text-red-800 border-red-300',
  '部分違憲': 'bg-amber-100 text-amber-800 border-amber-300',
  '合憲': 'bg-green-100 text-green-800 border-green-300',
};

/* ─── Component ─── */

function FlowNode({ provision }: { provision: Provision }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Connector line (visible on desktop between nodes) */}
      <div className="hidden md:block absolute left-1/2 -top-6 w-px h-6 bg-gray-300" />

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-serif font-bold text-gray-900 text-base">
                {provision.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[provision.category]}`}>
                {provision.category}
              </span>
            </div>
            {/* What was passed */}
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-700">修法內容：</span>
              {provision.whatPassed}
            </p>
          </div>
          {/* Ruling badge + expand icon */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-bold px-3 py-1 rounded border ${RULING_COLORS[provision.ruling]}`}>
              {provision.ruling}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded reasoning */}
      {expanded && (
        <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4 pb-2 space-y-4">
          {/* Reasoning steps */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              法庭的推論過程
            </p>
            <ol className="space-y-2">
              {provision.reasoning.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-mono">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {/* Conclusion */}
          <div className={`p-3 rounded border ${RULING_COLORS[provision.ruling]}`}>
            <p className="text-sm font-medium">
              <span className="font-bold">結論：</span>
              {provision.rulingDetail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecisionFlowchart() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">
          如何閱讀這張圖
        </h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2 font-serif">
          <p>
            憲法法庭是<strong>合議制</strong>——大法官們透過法律論證的反覆辯論形成結論，而非像立法院那樣各自按照立場投票。
          </p>
          <p>
            下方的流程圖呈現法庭如何審理國會職權修法案中的五大爭議條文。
            點擊每個節點可展開法庭的推論過程：他們問了什麼問題、用了什麼標準、最終如何得出結論。
          </p>
        </div>
      </div>

      {/* Starting point */}
      <div className="flex justify-center">
        <div className="bg-gray-800 text-white px-6 py-3 rounded-lg text-center">
          <p className="font-serif font-bold text-sm">起點</p>
          <p className="text-xs text-gray-300 mt-1">立法院通過了這些修法 → 大法官受理審查</p>
        </div>
      </div>

      {/* Flow arrow */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-gray-300" />
      </div>

      {/* Branch label */}
      <div className="flex justify-center">
        <div className="bg-gray-100 border border-gray-200 px-4 py-2 rounded text-center">
          <p className="text-sm text-gray-600 font-serif">
            逐條審查：法庭怎麼看每一條修法？
          </p>
        </div>
      </div>

      {/* Flow arrow */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-gray-300" />
      </div>

      {/* Provision nodes */}
      <div className="space-y-4 md:space-y-6">
        {PROVISIONS.map((provision) => (
          <FlowNode key={provision.id} provision={provision} />
        ))}
      </div>

      {/* Summary endpoint */}
      <div className="flex justify-center mt-8">
        <div className="w-px h-8 bg-gray-300" />
      </div>
      <div className="flex justify-center">
        <div className="bg-gray-50 border border-gray-200 px-6 py-4 rounded-lg text-center max-w-md">
          <p className="font-serif font-bold text-gray-900 text-sm mb-1">
            判決結論
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            五項爭議條文中，多數因違反權力分立、比例原則或議事程序瑕疵而被宣告違憲或部分違憲。
            這是法庭逐條論理後的合議結果，非單純多數決。
          </p>
        </div>
      </div>
    </div>
  );
}
