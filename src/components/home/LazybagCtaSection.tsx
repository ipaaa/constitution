import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OPINIONS, DIMENSIONS } from "@/data/opinions";

export default function LazybagCtaSection() {
  return (
    <section className="bg-white py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          href="/opinion-lazybag"
          className="group block bg-gray-50 border border-gray-200 rounded-sm p-8 md:p-10 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: badge + heading + description */}
            <div className="space-y-3">
              <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm w-fit">
                Analysis Tool
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900">
                國會職權修法判決解析
              </h2>
              <p className="text-gray-600 font-medium max-w-lg">
                114年憲判字第1號——看法庭如何逐條論理，以及大法官意見的光譜分佈。
              </p>
            </div>

            {/* Right: stat pills + CTA */}
            <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-sm bg-white border border-gray-200 rounded-sm px-3 py-1">
                  {OPINIONS.length} 則意見分析
                </span>
                <span className="font-mono text-sm bg-white border border-gray-200 rounded-sm px-3 py-1">
                  {DIMENSIONS.length} 個觀察維度
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                看判決推理過程 <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
