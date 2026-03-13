import { DISCUSSIONS_DATA, DiscussionItem } from '@/data/discussions';
import { Search, ExternalLink, Play, BookOpen, FileText } from 'lucide-react';

const ScholarCard = ({ item }: { item: DiscussionItem }) => (
  <div className="bg-white rounded-3xl p-7 shadow-sm border-t-4 border-t-midnight border-x border-b border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
    <div className="flex justify-between items-start mb-5">
      <span className="inline-flex items-center gap-1.5 text-midnight text-xs font-bold uppercase tracking-widest">
        <BookOpen size={14} /> 學者觀點
      </span>
      <span className="text-xs font-bold text-gray-400 font-sans">{item.year}</span>
    </div>
    <h3 className="text-2xl font-bold text-midnight mb-2 line-clamp-2 font-serif leading-snug">{item.title}</h3>
    <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">{item.author}</p>
    <div className="w-8 h-0.5 bg-gray-200 mb-4" />
    <p className="text-gray-600 text-[0.95rem] mb-6 flex-grow line-clamp-3 leading-relaxed font-serif text-justify">{item.abstract}</p>
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-midnight font-bold text-sm hover:text-royal-purple transition-colors">
      研讀全文 <ExternalLink size={14} />
    </a>
  </div>
);

const NGOCard = ({ item }: { item: DiscussionItem }) => (
  <div className="bg-sage/5 rounded-3xl p-6 shadow-sm border border-sage/20 hover:border-sage/50 hover:bg-sage/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-sage/10 rounded-bl-full -z-10" />
    <div className="flex justify-between items-center mb-4">
      <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs font-bold text-sage border border-sage/20 shadow-sm">
        <FileText size={14} /> NGO 倡議
      </span>
      <span className="text-xs font-bold text-sage/70">{item.year}</span>
    </div>
    <h3 className="text-xl font-extrabold text-midnight mb-1 line-clamp-2">{item.title}</h3>
    <p className="text-sm font-bold text-sage mb-3">{item.author}</p>
    <p className="text-gray-700 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed bg-white/50 p-3 rounded-xl border border-white/60">{item.abstract}</p>
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-auto block text-center w-full bg-white border border-sage/30 text-sage py-2 rounded-xl font-bold text-sm hover:bg-sage hover:text-white transition-colors">
      查看報告
    </a>
  </div>
);

const ReelCard = ({ item }: { item: DiscussionItem }) => (
  <div className="bg-midnight rounded-3xl p-1 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
    <div className="bg-gradient-to-br from-gray-800 to-black rounded-[22px] flex-grow relative overflow-hidden flex flex-col pt-32 p-5 border border-white/10">
      {/* Play Button Overlay */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-solar rounded-full flex items-center justify-center text-midnight shadow-[0_0_30px_rgba(247,192,74,0.3)] group-hover:scale-110 group-hover:bg-white transition-all z-10">
        <Play fill="currentColor" size={24} className="ml-1" />
      </div>
      
      {/* Backdrop pattern/image placeholder */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-solar/40 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider border border-white/10 uppercase">
            Shorts / Reels
          </span>
          {item.views && (
            <span className="text-xs font-bold text-white/50">{item.views.toLocaleString()} 次觀看</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-snug">{item.title}</h3>
        <p className="text-xs text-white/70 line-clamp-2">{item.abstract}</p>
      </div>
    </div>
    
    <div className="px-5 py-3 flex justify-between items-center">
      <span className="text-xs font-bold text-solar">{item.author}</span>
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors p-1">
        <ExternalLink size={16} />
      </a>
    </div>
  </div>
);

export default function PresentTrack() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-midnight mb-2">Track 2: 現在</h1>
          <p className="text-gray-600 text-lg font-medium">憲法法庭熱搜榜 | 114年憲判字第1號</p>
        </div>
        <div className="flex bg-white rounded-full shadow-sm border border-black/5 p-1.5 w-full md:w-96 transition-all focus-within:ring-2 ring-sage/50">
          <input 
            type="text" 
            placeholder="搜尋關鍵字、法案..." 
            className="flex-grow bg-transparent px-4 outline-none text-gray-700 font-sans"
          />
          <button className="bg-solar text-midnight p-3 rounded-full hover:scale-105 transition-transform shadow-sm">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        
        {/* The Feature Highlight Card (Spans 2 columns) */}
        <div className="md:col-span-2 xl:col-span-2 row-span-2 bg-gradient-to-br from-midnight to-royal-purple rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 opacity-5 text-[12rem] select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">⚖️</div>
          <div>
            <span className="inline-block bg-white/20 text-solar px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md mb-6 shadow-sm border border-white/10">
              Highlight / TL;DR
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-6 font-serif tracking-wide">
              114年憲判字第1號<br/>國會職權修法釋憲案
            </h2>
            <div className="space-y-4 mb-8 text-white/90 font-medium text-[1.05rem]">
              <p className="flex items-start gap-3"><span className="text-solar text-2xl leading-none mt-[-2px]">•</span> <span className="flex-1"><strong>藐視國會罪</strong>：部分違憲，明確性原則與比例原則之衡量。</span></p>
              <p className="flex items-start gap-3"><span className="text-solar text-2xl leading-none mt-[-2px]">•</span> <span className="flex-1"><strong>總統國情報告</strong>：即問即答違憲，總統無出席義務。</span></p>
              <p className="flex items-start gap-3"><span className="text-solar text-2xl leading-none mt-[-2px]">•</span> <span className="flex-1"><strong>人事同意權</strong>：部分違憲，不得以未答復即拒絕審查。</span></p>
            </div>
          </div>
          <a href="#" className="inline-flex items-center justify-center md:justify-start gap-2 text-midnight bg-solar px-6 py-3 rounded-xl font-bold hover:bg-white transition-all mt-4 w-full md:w-fit shadow-md hover:shadow-lg">
            閱讀完整判決解析 <ExternalLink size={18} />
          </a>
        </div>

        {/* Dynamic Data Cards with distinct visual layouts */}
        {DISCUSSIONS_DATA.map((item: DiscussionItem) => {
          if (item.category === 'Scholar Articles') return <ScholarCard key={item.id} item={item} />;
          if (item.category === 'NGO Reports') return <NGOCard key={item.id} item={item} />;
          if (item.category === 'Reels') return <ReelCard key={item.id} item={item} />;
          return null;
        })}

      </div>
    </div>
  );
}
