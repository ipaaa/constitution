'use client';

import React from 'react';
import { RULINGS_SINCE_FLOOR_VOIDED, LATEST_RULING } from '@/data/future';
import {
  RULING_THRESHOLD,
  VOIDED_FLOOR_SHORT,
  VOIDED_FLOOR_FULL,
} from '@/data/ruling-threshold';

/**
 * 全站唯一的判決門檻文案來源。
 *
 * 三個 variant 對應三個使用場景。任何要敘述憲法法庭判決門檻的地方，
 * 都必須用這個元件，不得自行手寫。三處手寫文案曾各自寫出三個不同的錯誤，
 * 這個元件的存在就是為了讓那件事不再發生。
 *
 * `RULING_THRESHOLD.headcount` 為 null 時，一律不顯示任何人數，
 * 也不顯示替代字元。見 `src/data/ruling-threshold.ts` 的 `RULING_THRESHOLD` JSDoc 與
 * docs/constitution-features/063-required-for-ruling-legal-accuracy.md 第五小節。
 */
interface RulingThresholdNoteProps {
  variant: 'lede' | 'card' | 'compact';
  className?: string;
}

const { rule, ruleShort, statute, voidedFloor, headcount } = RULING_THRESHOLD;

// 兩個失效句改由 `@/data/ruling-threshold` 提供，本檔不再自行組。
// 資料檔（時間軸、quiz）無法渲染 React 元件，需要的是字串而非元件，
// 因此句子的定義處必須在資料層。見 066 票第五小節。

export default function RulingThresholdNote({ variant, className }: RulingThresholdNoteProps) {
  if (variant === 'compact') {
    return (
      <span
        className={className ?? 'text-[10px] text-gray-500'}
        title={`${statute}：${rule}`}
        aria-label={`${statute}：${rule}`}
      >
        {ruleShort}
      </span>
    );
  }

  if (variant === 'lede') {
    // 導言只帶一句。完整敘述在 variant="card"。
    // 加長會讓導言在 375px 寬超過六行，違反設計的響應約束。
    return <span className={className}>{VOIDED_FLOOR_SHORT}。</span>;
  }

  // variant === 'card'
  return (
    <div className={className ?? 'space-y-3'}>
      <p className="text-gray-600 leading-relaxed font-serif text-sm">
        114 年 1 月 23 日修法增訂的{VOIDED_FLOOR_FULL}，
        存續期間為 114 年 1 月 23 日至 114 年 12 月 19 日。
        該期間內憲法法庭只作成一則判決，就是宣告這一項違憲的 {voidedFloor.voidedBy}本身；
        該判決並未適用這一項作為自己的程序規範——理由【41】載明它
        「既嚴重妨礙本庭行使憲法職權⋯⋯自不得作為本件判決的程序規範」，
        【43】改依第 30 條第 1 項定評議及評決門檻。
        失效後憲法法庭已作成 {RULINGS_SINCE_FLOOR_VOIDED.length} 則判決，
        最近一則為 {LATEST_RULING.docket}（{LATEST_RULING.dateLabel}）。
      </p>
      <p className="text-gray-600 leading-relaxed font-serif text-sm">
        現行有效的門檻是{statute}，給的是比例而非固定人數：{rule}。
        {headcount === null
          ? '換算成具體人數須經法學確認，本站不列。'
          : `依現有總額計算為 ${headcount} 人。`}
        {' '}
        <a
          href={voidedFloor.rulingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-900"
        >
          {voidedFloor.voidedBy}判決全文
        </a>
      </p>
    </div>
  );
}
