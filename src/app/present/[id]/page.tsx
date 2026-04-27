"use client";

import { use } from 'react';
import _DISCUSSIONS_DATA from '@/data/discussions.json';
import { VibeTag, JudgeOwlComment, type DiscussionItem } from '@/components/SharedPresent';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Share2, Printer } from 'lucide-react';
import { getLinksForDiscussion } from '@/data/cross-track-links';
import CrossTrackLinks from '@/components/CrossTrackLinks';

const DISCUSSIONS_DATA = _DISCUSSIONS_DATA as DiscussionItem[];

function CrossTrackSection({ discussionId }: { discussionId: string }) {
  const { historyLinks, futureLinks } = getLinksForDiscussion(discussionId);
  const allLinks = [...historyLinks, ...futureLinks];
  if (allLinks.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-px bg-gray-300" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Cross-Track Navigation / 跨軌道探索
        </span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      {historyLinks.length > 0 && (
        <CrossTrackLinks links={historyLinks} heading="歷史脈絡 — 相關釋憲判例" />
      )}
      {futureLinks.length > 0 && (
        <CrossTrackLinks links={futureLinks} heading="未來影響 — 相關待審案件" />
      )}
    </section>
  );
}

export default function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const item = DISCUSSIONS_DATA.find(d => d.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] p-6 text-center">
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4">檔案未找到</h1>
        <p className="text-gray-600 mb-8 font-serif">抱歉，我們在檔案庫中找不到這份文件 (ID: {id})。</p>
        <Link href="/present" className="bg-gray-900 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
          返回熱搜榜
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/present" className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={20} /> 返回
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">{item.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors opacity-40 hover:opacity-100"><Share2 size={18} /></button>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors opacity-40 hover:opacity-100"><Printer size={18} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        <div className="bg-white border border-gray-200 shadow-sm p-8 md:p-16 rounded-sm relative overflow-hidden">
          {/* Top Metadata */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <VibeTag vibe={item.vibe} />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Archive Record</span>
              <span className="text-xs font-bold text-gray-500 font-mono">REF: {item.id} / {item.year}</span>
            </div>
          </div>

          {/* Title Area */}
          <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-[1.2] mb-6 tracking-tight">
            {item.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-100">
             <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[#D32F2F] font-black text-lg border border-gray-200 shadow-inner">
               {item.author.substring(0, 1)}
             </div>
             <div className="flex flex-col">
               <span className="text-lg font-bold text-gray-900">{item.author}</span>
               <span className="text-xs text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> 分類：{item.category}
               </span>
             </div>
          </div>

          {/* Abstract / Summary Card */}
          <div className="bg-[#f8f9fa] border-l-4 border-gray-900 p-6 md:p-8 mb-12 shadow-inner italic font-serif text-lg leading-relaxed text-gray-700">
             <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 not-italic">Abstract / 內文摘要</span>
             {item.abstract}
          </div>

          {/* Full Content (or Placeholder) */}
          <div className="prose prose-lg prose-serif max-w-none text-gray-800 leading-relaxed text-justify mb-20 font-serif">
             {item.full_content ? (
               <div className="whitespace-pre-wrap">{item.full_content}</div>
             ) : (
               <div className="bg-gray-50 border border-dashed border-gray-300 p-12 rounded-sm text-center">
                  <p className="text-gray-400 font-serif italic mb-4">此檔案的完整轉譯內容正在由貓頭鷹檔案課編寫中...</p>
                  <p className="text-xs text-gray-300 font-mono uppercase tracking-widest">Awaiting Transcription / Status: Pending</p>
               </div>
             )}
          </div>

          {/* Deep Owl Commentary */}
          <section className="mt-20 pt-12 border-t-2 border-gray-900 relative">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arxiv Review</span>
             </div>
             <div className="max-w-2xl mx-auto">
                <JudgeOwlComment comment={item.owl_depth_comment || item.owl_comment} isDepth={true} />
                <div className="mt-4 text-xs text-gray-400 text-center font-serif italic italic pr-4">
                  「別急著走！這裡的深度解析能幫您更有層次地理解這個憲政難題。」
                </div>
             </div>
          </section>

          {/* Cross-Track Navigation */}
          <CrossTrackSection discussionId={item.id} />

          {/* Action Footer */}
          <div className="mt-20 flex flex-col items-center border-t border-gray-100 pt-12">
             <p className="text-sm text-gray-400 font-serif mb-6 italic italic">想對對看與原文的精確度嗎？或者想看更多原始圖表？</p>
             <a 
               href={item.link} 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-[#D32F2F] text-white px-10 py-5 rounded shadow-[0_4px_0_0_#8e1e1e] hover:shadow-[0_2px_0_0_#8e1e1e] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all font-black text-lg flex items-center gap-3 tracking-widest uppercase"
             >
               閱讀原始文件 <ExternalLink size={20} />
             </a>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="mt-12 flex justify-between items-center px-4">
          <Link href="/present" className="text-gray-400 hover:text-gray-900 transition-colors font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
            <ChevronLeft size={14} /> Back Archive
          </Link>
          <div className="text-[10px] text-gray-300 font-mono uppercase tracking-tighter">憲庭加好友 Add C0urt / Present Track</div>
        </div>
      </main>
    </div>
  );
}
