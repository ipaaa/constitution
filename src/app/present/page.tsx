import _DISCUSSIONS_DATA from '@/data/discussions.json';
import { Search, ExternalLink, Play } from 'lucide-react';

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
  vibe?: string;
};

const DISCUSSIONS_DATA = _DISCUSSIONS_DATA as DiscussionItem[];

const VibeTag = ({ vibe }: { vibe?: string }) => {
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

const CourtTimeline = () => {
  const milestones = [
    { year: '1948', label: 'Council Established', detail: '司法院大法官會議成立', status: 'success' },
    { year: '1993', label: 'Procedural Upgrade', detail: '大法官審理案件法正式實施', status: 'success' },
    { year: '2019', label: 'ACT PASSED', detail: '憲法訴訟法三讀通過', status: 'success' },
    { year: '2022', label: 'COURT LAUNCHED', detail: '憲法法庭正式揭牌，改制裁判化', status: 'success' },
    { year: '2024', label: 'JUDGMENT 114-1', detail: '國會職權修法判決宣告', status: 'warning' },
    { year: 'Present', label: 'SYSTEM CRITICAL', detail: '大法官缺額與預算凍結風險', status: 'danger' },
  ];

  return (
    <div className="font-mono text-[11px] uppercase tracking-tighter bg-gray-50 border border-gray-200 p-6 rounded-sm shadow-inner">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="font-bold text-gray-900">System Diagnostics: Judicial Health</span>
      </div>
      <div className="relative pl-4 space-y-8">
        <div className="absolute left-[19px] top-1 bottom-1 w-px bg-gray-300 border-l border-dashed border-gray-400"></div>
        {milestones.map((m, i) => (
          <div key={i} className="relative pl-6 group">
            <div className={`absolute left-[-2px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 
              ${m.status === 'success' ? 'bg-green-500' : m.status === 'warning' ? 'bg-yellow-500' : 'bg-red-600'}`}>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400 font-bold">{m.year}</span>
              <span className="text-gray-900 font-black leading-none mb-1">{m.label}</span>
              <span className="text-[10px] text-gray-500 normal-case font-sans tracking-normal leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                {m.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col gap-2">
         <div className="flex justify-between text-[9px] text-gray-400">
           <span>DB_STATE: ACTIVE</span>
           <span>v4.0.2-LATEST</span>
         </div>
      </div>
    </div>
  );
};

const OfficialTLDR = () => (
  <div className="bg-[#f8f9fa] border-t-4 border-black border-l border-r border-b border-gray-200 p-8 lg:p-10 shadow-sm relative group mb-12">
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-gray-800 text-white px-3 py-1 text-[10px] font-bold tracking-widest rounded-sm uppercase">
          Official TL;DR
        </span>
        <span className="text-sm text-gray-500 font-mono tracking-wider">2024-10-25</span>
      </div>
      <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-8 font-serif text-gray-900 border-l-[6px] border-[#D32F2F] pl-5">
        國會職權修法部分違憲：<br/>
        <span className="bg-[#FFE082] px-1 pb-1">總統無赴立院報告義務</span>
      </h2>
      <div className="space-y-5 mb-8 text-gray-700 font-medium text-[0.95rem] leading-relaxed">
        <p className="flex items-start gap-4 pb-4 border-b border-gray-200 border-dashed">
           <span className="text-[#D32F2F] font-mono mt-1 select-none font-bold">01</span> 
           <span className="flex-1"><strong>藐視國會罪</strong>違憲，不可刑罰。因不符明確性原則與比例原則。</span>
        </p>
        <p className="flex items-start gap-4 pb-4 border-b border-gray-200 border-dashed">
           <span className="text-[#D32F2F] font-mono mt-1 select-none font-bold">02</span> 
           <span className="flex-1"><strong>總統國情報告</strong>即問即答違憲，總統無出席義務。</span>
        </p>
        <p className="flex items-start gap-4">
           <span className="text-[#D32F2F] font-mono mt-1 select-none font-bold">03</span> 
           <span className="flex-1"><strong>聽證調查權</strong>部分合憲，但需符合正當法律程序，確保權力分立。</span>
        </p>
      </div>
    </div>
    <div className="pt-6 border-t border-gray-300 mt-4 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase hidden lg:block">Citation 114-1</span>
      <a href="#" className="inline-flex items-center gap-1.5 text-gray-900 border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-900 hover:text-white transition-colors w-full justify-center lg:w-max rounded-sm shadow-sm">
        閱讀白話文案由 <ExternalLink size={14} />
      </a>
    </div>
  </div>
);

const JudgeOwlComment = ({ comment }: { comment: string }) => {
  if (!comment) return null;
  return (
    <div className="mt-6 bg-[#FFF9C4] border-l-4 border-[#FBC02D] p-4 relative group/owl shadow-sm">
      <div className="absolute -top-8 -right-3 transform transition-transform group-hover/owl:scale-110 duration-300">
        <img src="/owl.png" alt="Judge Owl" className="w-14 h-14 object-contain drop-shadow-md" />
      </div>
      <p className="text-sm font-serif text-gray-900 leading-relaxed italic pr-6 italic">
        「{comment}」
      </p>
      <div className="text-[10px] font-bold text-[#A67C00] uppercase tracking-wider mt-2 text-right">— 貓頭鷹法官．小點評</div>
    </div>
  );
};

const ScholarCard = ({ item }: { item: DiscussionItem }) => {
  const domain = item.link.startsWith('http') ? new URL(item.link).hostname : 'scholar.org';
  return (
  <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
    {/* Masthead */}
    <div className="bg-gray-100 p-2 flex items-center gap-2 border-b border-gray-200">
      <div className="flex gap-1.5 px-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500/20"></div>
      </div>
      <div className="bg-white text-[10px] text-gray-500 font-mono px-3 py-1 flex-grow rounded text-center truncate border border-gray-200 shadow-inner group-hover:text-blue-600 transition-colors">
        {domain}
      </div>
    </div>
    <div className="p-6 bg-[#FDFCF8] flex flex-col flex-grow">
      <div className="mb-2">
        <VibeTag vibe={item.vibe} />
      </div>
      <div className="flex justify-end items-start mb-4">
        <span className="text-xs font-mono text-gray-400">{item.year}</span>
      </div>
      <h4 className="font-serif font-bold text-2xl mb-3 text-gray-900 line-clamp-2 group-hover:underline">{item.title}</h4>
      <p className="text-sm font-medium text-[#D32F2F] mb-4">{item.author}</p>
      <div className="w-full h-px bg-gray-200 mb-4" />
      <p className="text-gray-600 text-[0.95rem] mb-6 flex-grow line-clamp-3 leading-relaxed font-serif text-justify">{item.abstract}</p>
      
      {item.owl_comment && <JudgeOwlComment comment={item.owl_comment} />}
      
      <div className="mt-auto pt-4 flex justify-between items-center text-sm font-medium">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:underline w-full justify-center border border-blue-100 bg-blue-50/50 py-2 rounded-sm hover:bg-blue-100">
          開啟原始連結 <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </div>
  );
};

const NGOCard = ({ item }: { item: DiscussionItem }) => {
  const domain = item.link.startsWith('http') ? new URL(item.link).hostname : 'ngo-report.org';
  return (
  <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
    <div className="bg-gray-100 p-2 flex items-center gap-2 border-b border-gray-200">
      <div className="flex gap-1.5 px-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500/20"></div>
      </div>
      <div className="bg-white text-[10px] text-gray-500 font-mono px-3 py-1 flex-grow rounded text-center truncate border border-gray-200 shadow-inner group-hover:text-blue-600 transition-colors">
        {domain}
      </div>
    </div>
    <div className="p-6 bg-[#FDFCF8] flex flex-col flex-grow border-t-4 border-t-[#D32F2F]">
      <div className="mb-2">
        <VibeTag vibe={item.vibe} />
      </div>
      <div className="flex justify-end items-start mb-4">
        <span className="text-xs font-mono text-gray-400">{item.year}</span>
      </div>
      <h4 className="font-sans font-bold text-2xl mb-3 text-gray-900 line-clamp-2 group-hover:underline">{item.title}</h4>
      <p className="text-sm font-medium text-[#D32F2F] mb-4">{item.author}</p>
      <div className="w-full h-px bg-gray-200 mb-4" />
      <p className="text-gray-600 text-[0.95rem] mb-6 flex-grow line-clamp-3 leading-relaxed">{item.abstract}</p>
      
      {item.owl_comment && <JudgeOwlComment comment={item.owl_comment} />}
      
      <div className="mt-auto pt-4 flex justify-between items-center text-sm font-medium">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center w-full gap-1 border border-gray-200 py-2 rounded-sm hover:bg-white bg-gray-50">
          開啟原始報告 <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </div>
  );
};

const ReelCard = ({ item }: { item: DiscussionItem }) => {
  const domain = item.link.startsWith('http') ? new URL(item.link).hostname : 'youtube.com/shorts';
  return (
  <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col h-full shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
    <div className="bg-black p-2 flex items-center gap-2 border-b border-gray-800">
      <div className="flex gap-1.5 px-2 opacity-50">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-white/10"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-white/10"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-white/10"></div>
      </div>
      <div className="bg-gray-900 text-[10px] text-gray-500 font-mono px-3 py-1 flex-grow rounded text-center truncate border border-gray-800 shadow-inner group-hover:text-blue-400 transition-colors">
        {domain}
      </div>
    </div>
    
    <div className="p-3 bg-gray-900 flex flex-col flex-grow">
      {/* Image / Video frame */}
      <div className="bg-[#0A0A0A] rounded-sm w-full aspect-[4/5] relative overflow-hidden flex flex-col items-center justify-center border border-gray-800">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 group-hover:bg-white transition-transform z-10 cursor-pointer">
          <Play fill="currentColor" size={20} className="ml-1" />
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-black/80 text-white px-2 py-1 text-[10px] font-bold tracking-widest rounded-sm border border-white/10 uppercase w-fit">
            Reels
          </span>
          {item.vibe && (
            <span className="bg-blue-600 text-white px-2 py-0.5 text-[9px] font-bold tracking-tighter rounded-sm w-fit shadow-lg">
              {item.vibe}
            </span>
          )}
        </div>
        {item.views && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-white/50">{item.views.toLocaleString()} 觀看</span>
          </div>
        )}
      </div>
      
      {/* Description below */}
      <div className="pt-4 px-1 flex-grow flex flex-col">
        <h4 className="font-bold text-lg text-gray-100 mb-1 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors cursor-pointer">{item.title}</h4>
        <p className="text-xs font-medium text-[#D32F2F] mb-3">{item.author}</p>
        
        {item.owl_comment && (
          <div className="mb-4 bg-black/60 border-l-2 border-[#FFE082] p-3 rounded-sm relative shadow-inner">
             <p className="text-xs text-[#FFE082] italic leading-snug">🦉: {item.owl_comment}</p>
          </div>
        )}
        
        <div className="mt-auto border-t border-gray-800 pt-3 flex justify-between items-center">
          <span className="text-xs text-blue-400 font-medium">開啟原始影片</span>
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  </div>
  );
};

export default function PresentTrack() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full bg-[#fcfcfc] min-h-screen">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6 pb-6 border-b border-gray-200">
        <div className="border-l-4 border-gray-800 pl-4 w-full md:w-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono select-none">Present</span>
            憲庭熱搜榜
          </h1>
          <p className="text-gray-500 font-medium font-serif mt-2 text-lg">公民必讀的憲政剪貼簿：看專家與民間如何解讀判決</p>
        </div>
        <div className="flex bg-white rounded-sm shadow-sm border border-gray-300 w-full md:w-96 transition-all focus-within:border-gray-500 focus-within:shadow-md">
          <input 
            type="text" 
            placeholder="在檔案庫中搜尋關鍵字、法案..." 
            className="flex-grow bg-transparent px-4 py-3 outline-none text-gray-700 font-sans"
          />
          <button className="text-gray-500 hover:text-gray-900 px-4 hover:bg-gray-50 transition-colors border-l border-gray-200">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Magazine Spread Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start relative">
        
        {/* Left Page: System Diagnostics Timeline (Sticky) */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28">
           <CourtTimeline />
        </div>

        {/* Right Page: Content Flow */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col lg:pl-4 xl:pl-8 pb-12">
          
          {/* Relocated TL;DR */}
          <OfficialTLDR />
          
          <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3 mb-12">
            <h3 className="text-xl font-bold text-gray-900 font-serif tracking-wider">PUBLIC VOICES <span className="text-gray-400 font-sans font-normal ml-2">問題怎麼看</span></h3>
          </div>

          {/* Scholars Section */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span> 學者文章 (Scholar Perspectives)
              </h4>
              <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">
                {DISCUSSIONS_DATA.filter(item => item.category === 'Scholar Articles').length} Articles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {DISCUSSIONS_DATA.filter(item => item.category === 'Scholar Articles').map(item => (
                <ScholarCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* NGOs Section */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D32F2F] rounded-full"></span> NGO 倡議 (NGO Reports)
              </h4>
              <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">
                {DISCUSSIONS_DATA.filter(item => item.category === 'NGO Reports').length} Articles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {DISCUSSIONS_DATA.filter(item => item.category === 'NGO Reports').map(item => (
                <NGOCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Reels Section */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> 影音轉譯 (Reels & Shorts)
              </h4>
               <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">
                 {DISCUSSIONS_DATA.filter(item => item.category === 'Reels').length} Videos
               </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {DISCUSSIONS_DATA.filter(item => item.category === 'Reels').map(item => (
                <ReelCard key={item.id} item={item} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
