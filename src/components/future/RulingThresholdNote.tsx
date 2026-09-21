'use client';

import React from 'react';
import { RULING_THRESHOLD, RULINGS_SINCE_FLOOR_VOIDED, LATEST_RULING } from '@/data/future';

/**
 * 全站唯一的判決門檻文案來源。
 *
 * 三個 variant 對應三個使用場景。任何要敘述憲法法庭判決門檻的地方，
 * 都必須用這個元件，不得自行手寫。三處手寫文案曾各自寫出三個不同的錯誤，
 * 這個元件的存在就是為了讓那件事不再發生。
 *
 * `RULING_THRESHOLD.headcount` 為 null 時，一律不顯示任何人數，
 * 也不顯示替代字元。見 `src/data/future.ts` 的 `RULING_THRESHOLD` JSDoc 與
 * docs/constitution-features/063-required-for-ruling-legal-accuracy.md 第五小節。
 */
interface RulingThresholdNoteProps {
  variant: 'lede' | 'card' | 'compact';
  className?: string;
}

const { rule, ruleShort, statute, voidedFloor, headcount } = RULING_THRESHOLD;

/**
 * 已失效的固定人數下限。兩個版本共用同一組欄位，因此「10」永遠與
 * 「違憲」和失效依據出現在同一句裡。不要在別處另寫一次。
 */
const VOIDED_FLOOR_SHORT =
  `${voidedFloor.statute}的 ${voidedFloor.participants} 人參與評議下限，` +
  `已由 ${voidedFloor.voidedBy} 判決違憲，自 ${voidedFloor.voidedOn} 起失其效力`;

const VOIDED_FLOOR_FULL =
  `${voidedFloor.statute}（參與評議之大法官不得低於 ${voidedFloor.participants} 人、` +
  `作成違憲宣告之同意人數不得低於 ${voidedFloor.unconstitutionalityVotes} 人）` +
  `已由 ${voidedFloor.voidedBy} 判決違憲，自公告日 ${voidedFloor.voidedOn} 起失其效力`;

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
        114 年 1 月 23 日修法增訂{VOIDED_FLOOR_FULL}。
        該下限生效期間，憲法法庭在民國 114 年全年只作成一則判決；
        失效後已作成 {RULINGS_SINCE_FLOOR_VOIDED.length} 則判決，
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
