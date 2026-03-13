import { DISCUSSIONS_DATA, DiscussionItem } from '@/data/discussions';
import { Search, ExternalLink, Play, BookOpen, FileText } from 'lucide-react';

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Scholar Articles': return <BookOpen size={16} className="text-midnight" />;
    case 'NGO Reports': return <FileText size={16} className="text-royal-purple" />;
    case 'Reels': return <Play size={16} className="text-solar" />;
    default: return null;
  }
};

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* The Feature Highlight Card (Spans 2 columns) */}
        <div className="md:col-span-2 xl:col-span-2 row-span-2 bg-gradient-to-br from-midnight to-royal-purple rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 opacity-5 text-[10rem] select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">⚖️</div>
          <div>
            <span className="inline-block bg-white/20 text-solar px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md mb-6 shadow-sm">
              Highlight / TL;DR
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              114年憲判字第1號<br/>國會職權修法釋憲案
            </h2>
            <div className="space-y-3 mb-8 text-white/80 font-medium">
              <p className="flex items-start gap-2"><span className="text-solar text-xl leading-none">•</span> <span><strong>藐視國會罪</strong>：部分違憲，明確性原則與比例原則之衡量。</span></p>
              <p className="flex items-start gap-2"><span className="text-solar text-xl leading-none">•</span> <span><strong>總統國情報告</strong>：即問即答違憲，總統無出席義務。</span></p>
              <p className="flex items-start gap-2"><span className="text-solar text-xl leading-none">•</span> <span><strong>人事同意權</strong>：部分違憲，不得以未答復即拒絕審查。</span></p>
            </div>
          </div>
          <a href="#" className="inline-flex items-center gap-2 text-solar font-bold hover:gap-3 transition-all mt-4 w-fit">
            閱讀完整判決解析 <ExternalLink size={18} />
          </a>
        </div>

        {/* Dynamic Data Cards */}
        {DISCUSSIONS_DATA.map((item: DiscussionItem) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1.5 bg-pearl px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-black/5">
                <CategoryIcon category={item.category} />
                {item.category}
              </span>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">{item.year}</span>
            </div>
            
            <h3 className="text-xl font-bold text-midnight mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-sm font-bold text-sage mb-3">{item.author}</p>
            <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{item.abstract}</p>
            
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1.5 text-midnight font-bold text-sm hover:text-solar transition-colors"
            >
              了解更多 <ExternalLink size={14} />
            </a>
          </div>
        ))}

        {/* Missing content placeholder to balance a 4-col grid nicely */}
        <div className="bg-pearl/50 rounded-3xl p-6 border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center text-gray-400 h-full min-h-[200px]">
          <BookOpen size={32} className="mb-3 opacity-20" />
          <p className="font-semibold">Loading more insights...</p>
        </div>

      </div>
    </div>
  );
}
