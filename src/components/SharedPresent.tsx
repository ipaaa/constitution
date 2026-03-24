import React from 'react';

export type DiscussionCategory = 'Scholar Articles' | 'NGO Reports' | 'Reels';

export type DiscussionItem = {
  id: string;
  category: DiscussionCategory;
  title: string;
  author: string;
  year: string;
  abstract: string;
  link: string;
  views?: number;
  owl_comment?: string;
  owl_depth_comment?: string;
  vibe?: string;
  sticky?: boolean;
  full_content?: string;
};

export const VibeTag = ({ vibe }: { vibe?: string }) => {
  if (!vibe) return null;
  
  const getStyle = (text: string) => {
    if (text.includes('🔥')) return 'bg-[#FF4E50] text-white border-[#FF8A8C] shadow-[0_2px_0_0_#b91c1c]';
    if (text.includes('💡')) return 'bg-[#FDB813] text-gray-900 border-[#FFE082] shadow-[0_2px_0_0_#b45309]';
    if (text.includes('⚖️')) return 'bg-[#4A90E2] text-white border-[#8EBAE3] shadow-[0_2px_0_0_#1d4ed8]';
    if (text.includes('📣')) return 'bg-[#E91E63] text-white border-[#F48FB1] shadow-[0_2px_0_0_#880e4f]';
    if (text.includes('⚠️')) return 'bg-[#FF9800] text-white border-[#FFCC80] shadow-[0_2px_0_0_#e65100]';
    return 'bg-gray-900 text-white border-gray-700 shadow-[0_2px_0_0_#000]';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border-b-2 uppercase transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all cursor-default select-none mb-2 ${getStyle(vibe)}`}>
      {vibe}
    </span>
  );
};

export const JudgeOwlComment = ({ comment, isDepth = false }: { comment?: string, isDepth?: boolean }) => {
  if (!comment) return null;
  return (
    <div className={`mt-6 ${isDepth ? 'bg-[#E8F5E9] border-[#4CAF50]' : 'bg-[#FFF9C4] border-[#FBC02D]'} border-l-4 p-4 relative group/owl shadow-sm`}>
      <div className="absolute -top-8 -right-3 transform transition-transform group-hover/owl:scale-110 duration-300">
        <img src="/owl.png" alt="Judge Owl" className="w-14 h-14 object-contain drop-shadow-md" />
      </div>
      <p className="text-sm font-serif text-gray-900 leading-relaxed italic pr-6">
        「{comment}」
      </p>
      <div className={`text-[10px] font-bold ${isDepth ? 'text-[#2E7D32]' : 'text-[#A67C00]'} uppercase tracking-wider mt-2 text-right`}>
        — 貓頭鷹法官．{isDepth ? '深度領航' : '小點評'}
      </div>
    </div>
  );
};
