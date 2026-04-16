import Link from 'next/link';
import { Github, FileText, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-gray-200 bg-white text-gray-500 text-sm mt-auto w-full font-sans relative overflow-hidden">
      <div className="absolute top-0 right-12 w-64 h-64 bg-gray-50 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="col-span-1">
          <div className="w-12 h-1 bg-gray-800 mb-6 rounded-full"></div>
          <h4 className="font-serif font-bold text-gray-900 text-lg mb-3">Add C0urt 憲庭加好友</h4>
          <p className="text-gray-500 leading-relaxed font-medium mb-4 pr-4">
            這是一個開源的公民科技專案，旨在降低理解憲法訴訟與民主制度的門檻。
          </p>
          <p className="font-mono text-xs font-bold text-gray-400">© {new Date().getFullYear()} G0V CONTRIBUTORS</p>
        </div>
        
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-8 md:gap-16 md:justify-end">
          <div>
            <h5 className="font-bold text-gray-900 mb-4 tracking-wider uppercase text-xs">專案資源 (Resources)</h5>
            <ul className="space-y-3 font-medium">
              <li>
                <a href="https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                  <FileText size={16} /> HackMD 協作共筆
                </a>
              </li>
              <li>
                <a href="https://github.com/g0v/Welcome-to-Add-C0urt" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                  <Github size={16} /> GitHub 原始碼
                </a>
              </li>
              <li>
                <a href="https://github.com/g0v/Welcome-to-Add-C0urt/issues/new" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors flex items-center gap-2">
                  <AlertCircle size={16} /> 內容錯誤回報 (Feedback)
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-gray-900 mb-4 tracking-wider uppercase text-xs">快速導覽 (Navigation)</h5>
            <ul className="space-y-3 font-medium">
              <li><Link href="/past" className="hover:text-blue-600 transition-colors">T1. 過去：時光機</Link></li>
              <li><Link href="/present" className="hover:text-blue-600 transition-colors">T2. 現在：熱搜榜</Link></li>
              <li><Link href="/future" className="hover:text-blue-600 transition-colors">T3. 未來：載入中</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
