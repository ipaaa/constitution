import { HISTORY_DATA, HistoryEvent } from '@/data/history';
import { BookOpen, Flag, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'milestone': return <Flag className="text-solar" size={24} />;
    case 'conflict': return <ShieldAlert className="text-red-700" size={24} />;
    case 'resolution': return <CheckCircle2 className="text-sage" size={24} />;
    default: return <BookOpen className="text-midnight" size={24} />;
  }
};

const ArchivalCard = ({ event, index }: { event: HistoryEvent, index: number }) => (
  <div className="relative pl-10 md:pl-0">
    {/* Timeline vertical line (Mobile Only) */}
    <div className="md:hidden absolute left-[15px] top-4 bottom-[-3rem] w-0.5 bg-black/10 z-0" />
    
    <div className="bg-pearl rounded-2xl p-6 md:p-10 shadow-md border border-black/10 mb-12 relative z-10 transition-all hover:shadow-xl hover:-translate-y-1 group">
      {/* Decorative Index Number */}
      <div className="absolute -top-5 -right-5 text-8xl font-serif font-black text-black/[0.03] select-none pointer-events-none group-hover:text-black/[0.05] transition-colors">
        {(index + 1).toString().padStart(2, '0')}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/5 z-10">
          <EventIcon type={event.type} />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-500 tracking-widest uppercase font-serif">{event.year}</span>
          <h3 className="text-2xl font-bold text-midnight font-serif">{event.title}</h3>
        </div>
      </div>
      
      <p className="text-gray-700 text-lg leading-relaxed font-serif text-justify relative z-10 mt-6">
        {event.description}
      </p>
    </div>
  </div>
);

export default function PastTrack() {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back Button */}
        <div className="py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-midnight transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> 回到首頁
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 pb-32">
          
          {/* Left Column: Fixed / Sticky (The Theory) */}
          <div className="lg:w-5/12 lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)] flex flex-col justify-center pb-12 lg:pb-0">
            <div className="bg-midnight text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute top-[-50%] right-[-20%] w-[120%] h-[120%] bg-royal-purple rounded-full blur-3xl opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <span className="inline-block bg-solar text-midnight px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
                  Track 1
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 font-serif leading-tight">
                  憲法課本與<br/>現實的距離
                </h1>
                
                <div className="w-12 h-1 bg-solar mb-8" />
                
                <p className="text-lg text-white/80 font-serif leading-relaxed text-justify mb-8">
                  在學校裡，我們學習權力分立與基本人權。但歷史證明，紙上的盾牌並不能自動抵擋真實的子彈。
                </p>
                <p className="text-lg text-white/80 font-serif leading-relaxed text-justify">
                  這條時間軸，帶你走過那些「違憲」與「釋憲」交織的血淚史。憲法的價值，是靠一次又一次的衝突與對話，才逐漸刻劃在台灣的土地上。
                </p>

                <div className="mt-12 flex items-center gap-4 text-solar/80 text-sm font-bold animate-bounce">
                  <span>向下滑動探索歷史</span>
                  <div className="w-px h-8 bg-solar/50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scrolling (The Reality Timeline) */}
          <div className="lg:w-7/12 pt-12 lg:pt-32 relative">
            {/* Desktop Timeline Vertical Line */}
            <div className="hidden md:block absolute left-6 top-40 bottom-0 w-0.5 bg-gradient-to-b from-black/5 via-black/10 to-transparent z-0" />
            
            {HISTORY_DATA.map((event, index) => (
              <ArchivalCard key={event.id} event={event} index={index} />
            ))}
            
            <div className="text-center mt-20 p-8 border-2 border-dashed border-black/10 rounded-2xl text-gray-500 font-serif">
              <BookOpen size={32} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold mb-2">歷史仍在書寫中</p>
              <p>而現在，輪到我們這個世代了。</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
