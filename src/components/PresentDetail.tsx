'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Link2, Check, HandHeart, Share2 } from 'lucide-react';
import { VibeTag, type DiscussionItem } from '@/components/SharedPresent';

// --- Empty content CTA -----------------------------------------------------

export const EmptyContentCTA = ({ item }: { item: DiscussionItem }) => (
  <div className="bg-[#fdfaf4] border border-dashed border-[#c9b88a] p-8 md:p-10 rounded-sm">
    <div className="flex flex-col items-center text-center">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 font-mono">
        Awaiting Transcription / Status: Pending
      </span>
      <h3 className="text-xl md:text-2xl font-serif font-black text-gray-900 mb-3 leading-snug">
        完整轉譯尚未收錄
      </h3>
      <p className="text-gray-600 font-serif leading-relaxed max-w-lg mb-8">
        這份檔案的精華已經整理在上方的摘要與貓頭鷹點評。完整內文由「貓頭鷹檔案課」的志工協力轉譯，您可以先前往原始出處閱讀，或加入轉譯行列。
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-sm"
        >
          前往原始出處 <ExternalLink size={16} />
        </a>
        <a
          href={`mailto:volunteer@addcourt.tw?subject=${encodeURIComponent(`協助轉譯：${item.title}`)}&body=${encodeURIComponent(`我想協助轉譯這篇文章（ID：${item.id}）。`)}`}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <HandHeart size={16} /> 我想協助轉譯
        </a>
      </div>
    </div>
  </div>
);

// --- Share actions ---------------------------------------------------------

const getCurrentUrl = (): string => (typeof window === 'undefined' ? '' : window.location.href);

export const ShareActions = ({ title, variant = 'inline' }: { title: string; variant?: 'inline' | 'header' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = getCurrentUrl();
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-secure contexts.
        const el = document.createElement('textarea');
        el.value = url;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  // Share URLs are built at click-time via handlers on the client, avoiding SSR hydration mismatches.
  const handleOpenShare = useCallback(
    (builder: (url: string) => string) => () => {
      const url = getCurrentUrl();
      if (!url) return;
      window.open(builder(url), '_blank', 'noopener,noreferrer');
    },
    []
  );
  const twitterOpen = handleOpenShare(url => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
  const facebookOpen = handleOpenShare(url => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? '已複製連結' : '複製連結'}
          title={copied ? '已複製連結' : '複製連結'}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors opacity-60 hover:opacity-100"
        >
          {copied ? <Check size={18} /> : <Link2 size={18} />}
        </button>
        <button
          type="button"
          onClick={twitterOpen}
          aria-label="分享到 Twitter"
          title="分享到 Twitter"
          className="p-2 hover:bg-gray-800 rounded-full transition-colors opacity-60 hover:opacity-100"
        >
          <Share2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Share this file</span>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-sm text-sm font-bold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <Check size={16} /> 已複製連結
            </>
          ) : (
            <>
              <Link2 size={16} /> 複製連結
            </>
          )}
        </button>
        <button
          type="button"
          onClick={twitterOpen}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-sm text-sm font-bold hover:bg-[#1d9bf0] hover:text-white hover:border-[#1d9bf0] transition-colors shadow-sm"
        >
          <Share2 size={16} /> Twitter
        </button>
        <button
          type="button"
          onClick={facebookOpen}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-sm text-sm font-bold hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-colors shadow-sm"
        >
          <Share2 size={16} /> Facebook
        </button>
      </div>
    </div>
  );
};

// --- Related articles ------------------------------------------------------

const relatedScore = (current: DiscussionItem, candidate: DiscussionItem): number => {
  let score = 0;
  if (candidate.category === current.category) score += 2;
  if (current.vibe && candidate.vibe && candidate.vibe === current.vibe) score += 3;
  return score;
};

export const computeRelated = (
  current: DiscussionItem,
  all: DiscussionItem[],
  limit = 3
): DiscussionItem[] => {
  const scored = all
    .filter(d => d.id !== current.id && d.id !== 'tldr')
    .map(d => ({ item: d, score: relatedScore(current, d) }))
    .filter(s => s.score > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.item.year || '').localeCompare(a.item.year || '');
  });

  return scored.slice(0, limit).map(s => s.item);
};

export const RelatedArticles = ({
  current,
  all,
}: {
  current: DiscussionItem;
  all: DiscussionItem[];
}) => {
  const related = useMemo(() => computeRelated(current, all), [current, all]);
  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 font-mono">
            Related Files
          </span>
          <h3 className="text-2xl md:text-3xl font-serif font-black text-gray-900 tracking-tight">延伸閱讀</h3>
        </div>
        <Link
          href="/present"
          className="hidden md:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
        >
          更多檔案 →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {related.map(item => (
          <Link
            key={item.id}
            href={`/present/${item.id}`}
            className="group block bg-white border border-gray-200 rounded-sm p-5 shadow-sm hover:shadow-md hover:border-gray-400 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <VibeTag vibe={item.vibe} />
              <span className="text-[10px] font-mono text-gray-400 shrink-0 pt-1">{item.year}</span>
            </div>
            <h4 className="font-serif font-bold text-lg text-gray-900 leading-snug line-clamp-3 mb-3 group-hover:underline">
              {item.title}
            </h4>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-[#D32F2F] truncate">{item.author}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 ml-2">
                {item.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
