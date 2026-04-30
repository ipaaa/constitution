// src/data/cross-track-links.ts
//
// Cross-track navigation mappings between T1 (Past), T2 (Present), and T3 (Future).
//
// Each entry defines a source item and its related items on other tracks.
// These are curated editorial links — not auto-generated — reflecting thematic
// connections across the "past -> present -> future" narrative arc.

// ---------------------------------------------------------------------------
// T1 (History) -> T2 (Discussion) mappings
// ---------------------------------------------------------------------------
// Key: history entry ID (e.g. "h10")
// Value: array of discussion IDs that discuss or extend the historical ruling

export const HISTORY_TO_DISCUSSIONS: Record<string, string[]> = {
  // 釋字748 同婚 -> 憲法法庭相關討論文章
  h10: ['d1', 'd5'],
  // 野百合・終結萬年國代 -> 權力分立相關文章
  h1: ['d4', 'd6'],
  // 廢除刑法100條・言論自由 -> 言論自由相關討論
  h2: ['d2'],
  // 原住民族權利 -> 相關討論
  h14: ['d1'],
};

// ---------------------------------------------------------------------------
// T2 (Discussion) -> T1 (History) mappings
// ---------------------------------------------------------------------------
// Key: discussion entry ID (e.g. "d1")
// Value: array of history IDs that provide historical context

export const DISCUSSION_TO_HISTORY: Record<string, string[]> = {
  // 憲法法庭歡迎回來 -> 歷史上的權力分立、同婚判決
  d1: ['h1', 'h10'],
  // Judicial Bootstrapping -> 權力分立
  d2: ['h1', 'h2'],
  // 公投複決 -> 權力分立
  d4: ['h1'],
  // 潘朵拉盒子 -> 權力分立、言論自由
  d5: ['h1', 'h2'],
  // 初步評論 -> 權力分立
  d6: ['h1'],
  // 復活戰系列 -> 權力分立
  d7: ['h1'],
  d8: ['h1'],
  d9: ['h1'],
};

// ---------------------------------------------------------------------------
// T2 (Discussion) -> T3 (Future case tags) mappings
// ---------------------------------------------------------------------------
// Key: discussion entry ID
// Value: array of identity tags from T3 that this discussion relates to.
// These are used to link to filtered views of the Future track.

import type { IdentityTag } from './future';

export const DISCUSSION_TO_CASE_TAGS: Record<string, IdentityTag[]> = {
  // 憲法法庭歡迎回來 -> 涉及所有待審案件（憲法法庭運作問題）
  d1: ['刑事被告', '勞工', '性別'],
  // 公投複決 -> 言論自由、集會遊行
  d4: ['言論自由', '集會遊行'],
  // 潘朵拉盒子 -> 刑事被告
  d5: ['刑事被告'],
};

// ---------------------------------------------------------------------------
// T3 (Future cases) -> T1 (History) mappings
// ---------------------------------------------------------------------------
// Key: pending case ID (e.g. "c03")
// Value: array of history IDs that share the same constitutional rights lineage

export const CASE_TO_HISTORY: Record<string, string[]> = {
  // 原住民狩獵槍枝管制 -> 原住民族權利歷史判例
  c03: ['h14'],
  // 原住民保留地開發 -> 原住民族權利
  c07: ['h14'],
  // 傳統領域劃設 -> 原住民族權利
  c13: ['h14'],
  // 死刑存廢 -> 正當法律程序（徐自強案）
  c04: ['h5'],
  // 羈押法通信限制 -> 正當法律程序
  c08: ['h5'],
  // 強制採尿程序 -> 正當法律程序
  c14: ['h5'],
  // 代理孕母 -> 性別平等
  c02: ['h4'],
  // 跨性別身分證 -> 性別平等、同婚判決
  c11: ['h4', 'h10'],
  // 職場性騷擾 -> 性別平等
  c12: ['h4'],
  // 網路言論審查 -> 言論自由
  c16: ['h2'],
  // 公務員政治言論 -> 言論自由
  c17: ['h2'],
  // 集會遊行事前許可制 -> 言論自由
  c25: ['h2'],
  // 移工轉換雇主 -> 遷徙自由
  c06: ['h3'],
  // 新住民配偶面談 -> 遷徙自由、性別平等
  c31: ['h3', 'h4'],
  // 學生相關（少年事件隱私） -> 學生權利
  c22: ['h6'],
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

import HISTORY_DATA from './history.json';
import DISCUSSIONS_DATA from './discussions.json';
import { PENDING_CASES } from './future';
import type { DiscussionItem } from '@/components/SharedPresent';

const typedDiscussions = DISCUSSIONS_DATA as DiscussionItem[];

export interface CrossTrackLink {
  track: 'past' | 'present' | 'future';
  label: string;
  description: string;
  href: string;
}

export function getLinksForHistory(historyId: string): CrossTrackLink[] {
  const links: CrossTrackLink[] = [];
  const discussionIds = HISTORY_TO_DISCUSSIONS[historyId] || [];
  for (const dId of discussionIds) {
    const d = typedDiscussions.find((item) => item.id === dId);
    if (d) {
      links.push({
        track: 'present',
        label: d.title,
        description: d.author,
        href: `/present/${d.id}`,
      });
    }
  }
  return links;
}

export function getLinksForDiscussion(discussionId: string): {
  historyLinks: CrossTrackLink[];
  futureLinks: CrossTrackLink[];
} {
  const historyLinks: CrossTrackLink[] = [];
  const historyIds = DISCUSSION_TO_HISTORY[discussionId] || [];
  for (const hId of historyIds) {
    const h = HISTORY_DATA.find((item) => item.id === hId);
    if (h) {
      historyLinks.push({
        track: 'past',
        label: `${h.reality.ruling_id} ${h.reality.ruling}`,
        description: `${h.reality.year} · ${h.category}`,
        href: '/past',
      });
    }
  }

  const futureLinks: CrossTrackLink[] = [];
  const caseTags = DISCUSSION_TO_CASE_TAGS[discussionId];
  if (caseTags && caseTags.length > 0) {
    const matchingCount = PENDING_CASES.filter((c) =>
      c.tags.some((t) => caseTags.includes(t))
    ).length;
    if (matchingCount > 0) {
      futureLinks.push({
        track: 'future',
        label: `${matchingCount} 件相關待審案件`,
        description: caseTags.join('、'),
        href: '/future',
      });
    }
  }

  return { historyLinks, futureLinks };
}

export function getLinksForCase(caseId: string): CrossTrackLink[] {
  const links: CrossTrackLink[] = [];
  const historyIds = CASE_TO_HISTORY[caseId] || [];
  for (const hId of historyIds) {
    const h = HISTORY_DATA.find((item) => item.id === hId);
    if (h) {
      links.push({
        track: 'past',
        label: `${h.reality.ruling_id}`,
        description: h.reality.ruling,
        href: '/past',
      });
    }
  }
  return links;
}
