import { DISCUSSIONS_DATA, DiscussionItem } from '@/data/discussions';
import { Search, ExternalLink, Play } from 'lucide-react';

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
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">學者專欄</div>
        <span className="text-xs font-mono text-gray-400">{item.year}</span>
      </div>
      <h4 className="font-serif font-bold text-2xl mb-3 text-gray-900 line-clamp-2 group-hover:underline">{item.title}</h4>
      <p className="text-sm font-medium text-gray-500 mb-4">{item.author}</p>
      <div className="w-full h-px bg-gray-200 mb-4" />
      <p className="text-gray-600 text-[0.95rem] mb-6 flex-grow line-clamp-3 leading-relaxed font-serif text-justify">{item.abstract}</p>
      <div className="mt-auto pt-4 flex justify-between items-center text-sm font-medium">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:underline w-full justify-center border border-blue-100 bg-blue-50/50 py-2 rounded-sm hover:bg-blue-100">
          研讀全文 <ExternalLink size={14} />
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
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest">NGO 倡議</div>
        <span className="text-xs font-mono text-gray-400">{item.year}</span>
      </div>
      <h4 className="font-sans font-bold text-2xl mb-3 text-gray-900 line-clamp-2 group-hover:underline">{item.title}</h4>
      <p className="text-sm font-medium text-[#D32F2F] mb-4">{item.author}</p>
      <div className="w-full h-px bg-gray-200 mb-4" />
      <p className="text-gray-600 text-[0.95rem] mb-6 flex-grow line-clamp-3 leading-relaxed">{item.abstract}</p>
      <div className="mt-auto pt-4 flex justify-between items-center text-sm font-medium">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center w-full gap-1 border border-gray-200 py-2 rounded-sm hover:bg-white bg-gray-50">
          查看報告 <ExternalLink size={14} />
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
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-black/80 text-white px-2 py-1 text-[10px] font-bold tracking-widest rounded-sm border border-white/10 uppercase">
            Reels
          </span>
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
        <p className="text-xs font-medium text-gray-500 mb-3">{item.author}</p>
        <div className="mt-auto border-t border-gray-800 pt-3 flex justify-between items-center">
          <span className="text-xs text-blue-400 font-medium">前往觀看</span>
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
          <p className="text-gray-500 font-medium font-serif mt-2 text-lg">114年憲判字第1號 及其延伸觀點探討</p>
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
        
        {/* Left Page: Official TL;DR (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
          <div className="bg-[#f8f9fa] border-t-4 border-black border-l border-r border-b border-gray-200 p-8 lg:p-10 shadow-sm relative group flex flex-col justify-between h-full">
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
        </div>

        {/* Right Page: Public Discussions */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12 lg:gap-16 lg:pl-4 xl:pl-8 pb-12">
          
          <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3">
            <h3 className="text-xl font-bold text-gray-900 font-serif tracking-wider">PUBLIC DISCUSSIONS <span className="text-gray-400 font-sans font-normal ml-2">民間迴響</span></h3>
          </div>

          {/* Scholars Section */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span> 學者專欄 (Scholar Perspectives)
              </h4>
              <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">2 Articles</span>
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
              <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">1 Article</span>
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
               <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1 rounded">1 Video</span>
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
