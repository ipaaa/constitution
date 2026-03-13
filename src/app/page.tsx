import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Search, Workflow } from "lucide-react";

export default function Home() {
  return (
    <div className="relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-royal-purple/5 to-transparent -z-10" />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold text-midnight leading-[1.1] tracking-tight">
              別讓你的權利<br />
              <span className="text-solar drop-shadow-sm">已讀不回</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-xl leading-relaxed">
              將「過去課本裡的民主成就」轉化為「被卡住的現實危機」。降低公民理解憲法法庭價值的門檻，一起守護台灣民主。
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/present" className="bg-midnight text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-royal-purple transition-all hover:-translate-y-1 flex items-center gap-2">
                進入憲庭熱搜榜 <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end z-10">
            {/* Soft backdrop blur shape behind mascot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sage/20 rounded-full blur-3xl" />
            
            <Image 
              src="/owl.png" 
              alt="Judge Owl Mascot" 
              width={400} 
              height={400} 
              className="relative z-10 drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
              priority
            />
          </div>

        </div>
      </section>

      {/* The 3 Core Tracks Overview */}
      <section className="bg-white py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-midnight mb-4">三大核心軌道 (Core Tracks)</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">循序漸進理解憲法與生活的關聯</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <Link href="/past" className="group block bg-pearl rounded-3xl p-8 border border-black/5 hover:bg-midnight hover:text-white transition-all duration-500">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-white/10">
                <Clock className="text-midnight group-hover:text-solar" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Track 1: 過去</h3>
              <p className="text-gray-600 group-hover:text-white/80 font-medium leading-relaxed">
                憲法課本時光機。<br/>從歷史的強烈情感，看見權利得來不易。
              </p>
            </Link>

            <Link href="/present" className="group block bg-pearl rounded-3xl p-8 border border-sage/30 shadow-sm hover:bg-sage hover:text-white transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-solar text-midnight text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
                ⭐ 開發中焦點
              </div>
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-white/20">
                <Search className="text-sage group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Track 2: 現在</h3>
              <p className="text-gray-600 group-hover:text-white/90 font-medium leading-relaxed">
                憲庭熱搜榜。<br/>去焦慮的結構化儀表板，掌握最新釋憲動態。
              </p>
            </Link>

            <Link href="/future" className="group block bg-pearl rounded-3xl p-8 border border-black/5 hover:bg-royal-purple hover:text-white transition-all duration-500">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-white/10">
                <Workflow className="text-royal-purple group-hover:text-solar" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Track 3: 未來</h3>
              <p className="text-gray-600 group-hover:text-white/80 font-medium leading-relaxed">
                憲庭載入中。<br/>透視五人極限運作的系統瓶頸，與你的真實身分連動。
              </p>
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
}
