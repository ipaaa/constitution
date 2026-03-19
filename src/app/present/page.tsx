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
    { year: '1948', label: '司法院大法官會議成立', detail: '標誌著中華民國憲法解釋制度的開啟，確立了由大法官掌理憲法解釋與統一解釋法令之權。', status: 'history' },
    { year: '1993', label: '大法官審理案件法實施', detail: '程序制度化的重要里程碑，細化了審理程序，並在此基礎上誕生了許多影響深遠的解釋。', status: 'history' },
    { year: '2019', label: '憲法訴訟法三讀通過', detail: '從「會議制」轉向「法院制」的法源基礎，將案件審理司法化、裁判化。', status: 'history' },
    { year: '2022', label: '憲法法庭正式揭牌', detail: '裁判化轉型正式啟動，大法官改以「憲法法庭」名義行使職權並公告裁判。', status: 'present' },
    { year: '2024', label: '114年憲判字第1號', detail: '關於國會職權修法之重大判決，確立了權力分立與法律明確性原則的當代界線。', status: 'critical' },
    { year: '未來', label: '憲政體制的韌性考驗', detail: '面臨大法官缺額、預算凍結與程序法修法等爭議，憲法法庭的功能完整性將受挑戰。', status: 'danger' },
  ];

  return (
    <div className="bg-[#f4f1ea] border border-[#d1ccc0] p-6 lg:p-8 rounded-sm shadow-sm relative overflow-hidden">
      {/* Archive Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-8">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">ARCHIVE RECORD / NO. 77</div>
        <h3 className="text-2xl font-serif font-black text-gray-900 leading-tight">憲政大事記</h3>
        <p className="text-xs text-gray-600 mt-2 font-serif italic">Chronicle of the Constitutional Court</p>
      </div>

      <div className="space-y-6 relative">
        {milestones.map((m, i) => (
          <div key={i} className="relative group">
            {/* Folder Tab Aesthetic */}
            <div className="flex items-start">
              <div className={`w-14 shrink-0 font-mono text-sm pt-1 border-r-2 mr-4 text-right pr-4 mb-4 transition-colors
                ${m.status === 'danger' ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-gray-900 text-gray-900'}`}>
                {m.year}
              </div>
              <div className="flex-1 pb-6 relative">
                <h4 className={`text-lg font-serif font-bold leading-tight mb-2 group-hover:text-blue-900 transition-colors
                  ${m.status === 'danger' ? 'text-[#D32F2F]' : 'text-gray-900'}`}>
                  {m.label}
                </h4>
                <p className="text-sm text-gray-600 font-serif leading-relaxed text-justify">
                  {m.detail}
                </p>
                {/* Visual Connector Line */}
                {i < milestones.length - 1 && (
                  <div className="absolute left-[-25px] top-6 bottom-[-20px] w-px bg-gray-300"></div>
                )}
              </div>
            </div>
            {/* Important Stamp for danger status */}
            {m.status === 'danger' && (
              <div className="absolute -top-1 -right-2 rotate-12 border-2 border-[#D32F2F] text-[#D32F2F] px-2 py-1 text-[10px] font-black uppercase tracking-tighter opacity-70 select-none">
                Urgent Record
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Stamp */}
      <div className="mt-8 pt-6 border-t border-[#d1ccc0] flex justify-between items-center opacity-40 grayscale group hover:grayscale-0 transition-all">
        <div className="text-[9px] font-mono leading-none">
          SEC-CAT: CONSTITUTIONAL_EVOLUTION<br/>
          REF: PUBLIC_VOICES_V2
        </div>
        <div className="w-10 h-10 border-2 border-gray-900 rounded-full flex items-center justify-center font-black text-[10px] rotate-[-20deg]">
          ARCH
        </div>
      </div>
    </div>
  );
};

const OfficialTLDR = ({ item }: { item?: DiscussionItem }) => {
  if (!item) return null;

  // Split abstract into rows for the points
  const points = item.abstract.split(/\r?\n/).filter(p => p.trim());

  return (
    <div className="bg-[#f8f9fa] border-t-4 border-black border-l border-r border-b border-gray-200 shadow-sm relative group mb-12 overflow-hidden">
      {/* Hero Illustration */}
      <div className="w-full h-auto overflow-hidden border-b border-gray-200">
        <img 
          src="/tldr-illustration.png" 
          alt="Constitutional Court Status" 
          className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
        />
      </div>

      <div className="p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-gray-800 text-white px-3 py-1 text-[10px] font-bold tracking-widest rounded-sm uppercase">
            Official TL;DR
          </span>
          <span className="text-sm text-gray-500 font-mono tracking-wider">{item.year}</span>
        </div>
        
        <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-8 font-serif text-gray-900 border-l-[6px] border-[#D32F2F] pl-5">
          {item.title}
        </h2>
        
        <div className="space-y-4 md:space-y-5 mb-8 text-gray-700 font-medium text-[0.95rem] leading-relaxed">
          {points.map((point, idx) => (
            <p key={idx} className={`flex items-start gap-4 ${idx < points.length - 1 ? 'pb-4 border-b border-gray-200 border-dashed' : ''}`}>
               <span className="text-[#D32F2F] font-mono mt-1 select-none font-bold">0{idx + 1}</span> 
               <span className="flex-1" dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
            </p>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-300 mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase hidden lg:block">Citation {item.id === 'tldr' ? 'CORE' : item.id}</span>
          <a href={item.link} className="inline-flex items-center gap-1.5 text-gray-900 border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-900 hover:text-white transition-colors w-full justify-center md:w-max rounded-sm shadow-sm">
            閱讀完整分析 <ExternalLink size={14} />
          </a>
        </div>

        {/* Reaction Widget */}
        <ConstitutionalMoodWidget />
      </div>
    </div>
  );
};

const ConstitutionalMoodWidget = () => {
  const moods = [
    { emoji: '🧊', label: '如臨深淵', color: 'hover:bg-blue-50 hover:border-blue-200 text-blue-700' },
    { emoji: '🔥', label: '滿血復活', color: 'hover:bg-red-50 hover:border-red-200 text-red-700' },
    { emoji: '⏳', label: '靜觀其變', color: 'hover:bg-amber-50 hover:border-amber-200 text-amber-700' },
    { emoji: '💡', label: '原來如此', color: 'hover:bg-yellow-50 hover:border-yellow-200 text-yellow-700' },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 text-center">HOW DO YOU FEEL? <span className="text-gray-300 ml-2">看完後您的心情是？</span></p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moods.map((mood, idx) => (
          <button 
            key={idx}
            className={`flex flex-col items-center justify-center p-4 border border-gray-200 bg-white rounded-sm transition-all duration-300 group shadow-sm ${mood.color}`}
          >
            <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">{mood.emoji}</span>
            <span className="text-xs font-bold tracking-tighter">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const NarrativeLoopFooter = () => (
  <div className="mt-20 mb-12 border-t-2 border-gray-900 pt-12">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <a href="/past" className="group block">
        <div className="bg-[#F3EBD1] border-2 border-gray-900 p-8 md:p-12 relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] duration-300 h-full flex flex-col justify-between">
          <div className="relative z-10">
            <span className="inline-block bg-gray-900 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase mb-6">BACK TO THE ORIGIN</span>
            <h4 className="text-3xl md:text-5xl font-serif font-black text-gray-900 mb-4 leading-tight">想知道我們如何<br/>走到這一步？</h4>
            <p className="text-gray-700 font-medium">回顧歷史：看課本上的民主理想，如何經受現實判決的考驗。</p>
          </div>
          <div className="mt-12 flex items-center gap-2 text-gray-900 font-bold uppercase text-sm tracking-widest group-hover:gap-4 transition-all border-b-2 border-gray-900 w-max pb-1">
            進入：歷史與教科書 (TRACK 01) →
          </div>
          {/* Decorative index tab */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-900 text-[#F3EBD1] flex items-center justify-center translate-x-12 -translate-y-12 rotate-45 font-bold text-xl hover:bg-red-700 transition-colors">
            PAST
          </div>
        </div>
      </a>

      <a href="/future" className="group block">
        <div className="bg-white border-2 border-gray-900 p-8 md:p-12 relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] duration-300 h-full flex flex-col justify-between">
          <div className="relative z-10">
            <span className="inline-block bg-red-700 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase mb-6">EXPLORE THE FUTURE</span>
            <h4 className="text-3xl md:text-5xl font-serif font-black text-gray-900 mb-4 leading-tight">想預見接下來<br/>還有哪些考驗？</h4>
            <p className="text-gray-700 font-medium">探索未來：當憲法法庭進入復健期，您的權益正在哪個路口等候？</p>
          </div>
          <div className="mt-12 flex items-center gap-2 text-gray-900 font-bold uppercase text-sm tracking-widest group-hover:gap-4 transition-all border-b-2 border-gray-900 w-max pb-1">
            進入：憲政復健現狀 (TRACK 03) →
          </div>
          {/* Decorative stamp */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-red-700/20 rounded-full flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700">
             <span className="text-red-700/20 font-black text-2xl uppercase tracking-tighter">FUTURE</span>
          </div>
        </div>
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
          <OfficialTLDR item={DISCUSSIONS_DATA.find(item => item.id === 'tldr')} />
          
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

          {/* Narrative Loop Footer */}
          <NarrativeLoopFooter />

        </div>
      </div>
    </div>
  );
}
