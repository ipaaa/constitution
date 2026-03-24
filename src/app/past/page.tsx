"use client";

import { useEffect, useState, useRef } from 'react';
import HISTORY_DATA from '@/data/history.json';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export default function PastTrack() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Trigger when the item crosses the middle 10% of viewport
      threshold: 0
    };

    const triggers = document.querySelectorAll('.vh-trigger');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const step = parseInt(entry.target.getAttribute('data-step') || '-1', 10);
          setActiveIndex(step);
        }
      });
    }, observerOptions);

    triggers.forEach(trigger => observer.observe(trigger));

    // Initialize first frame after a small delay
    const timer = setTimeout(() => {
      if (activeIndex === -1) setActiveIndex(0);
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [activeIndex]);

  // Calculate timeline progress
  const progressPercentage = activeIndex >= 0 ? (activeIndex / (HISTORY_DATA.length - 1)) * 100 : 0;

  return (
    <div className="w-full bg-[var(--color-textbook-bg)] text-[var(--color-textbook-text)] font-sans min-h-screen">
      
      {/* Intro Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <h2 className="text-5xl md:text-7xl font-black mb-6 font-serif">憲法課本時光機</h2>
        <p className="text-xl md:text-2xl max-w-2xl text-gray-700 leading-relaxed font-serif">
          那些習以為常的權利，不是憑空出現的。<br/>讓我們翻開課本，回到當年憲法法庭敲下判決的那一刻。
        </p>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* Scroll Container */}
      <div 
        ref={containerRef} 
        className="relative" 
        style={{ height: `${HISTORY_DATA.length * 100}vh` }}
      >
        
        {/* Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Textbook Theory */}
          <div className="flex-1 relative bg-[var(--color-textbook-bg)] bg-paper-texture flex items-center justify-center md:border-r border-black/10 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.05)] p-10 md:p-20 z-10">
            {HISTORY_DATA.map((item, index) => {
              const isActive = index === activeIndex;
              const isExitUp = index < activeIndex;
              const isExitDown = index > activeIndex;
              
              return (
                <div 
                  key={`left-${item.id}`} 
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center p-8 md:p-20 textbook-item ${isActive ? 'active' : ''} ${isExitUp ? 'exit-up' : ''} ${isExitDown ? 'exit-down' : ''}`}
                >
                  <div className="max-w-md font-serif">
                    <div className="mb-3">
                      <span className="inline-block bg-[#1565C0]/10 text-[#1565C0] text-xs font-bold px-2 py-0.5 rounded border border-[#1565C0]/20 uppercase tracking-tight">
                        {item.category || '憲法起源'}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] border-b-2 border-[#D3D3D3] pb-4 mb-6">
                      {item.textbook.chapter}
                    </h2>
                    <p 
                      className="text-xl leading-[1.8] text-[#3A3A3A] mb-5"
                      dangerouslySetInnerHTML={{ __html: item.textbook.content as string }}
                    />
                    <div className="font-[Caveat] text-[#1565C0] text-3xl -rotate-3 inline-block mt-3 font-bold">
                      {item.textbook.handwriting}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Timeline (Desktop Only) */}
          <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-400/30 -translate-x-1/2 z-50 flex-col justify-between py-[20vh]">
            <div 
              className="absolute top-0 left-0 w-full bg-[var(--color-accent-red)] transition-all duration-300 ease-out" 
              style={{ height: `${progressPercentage}%` }}
            />
            
            {HISTORY_DATA.map((item, index) => (
              <div 
                key={`dot-${item.id}`} 
                className={`w-4 h-4 bg-[var(--color-textbook-bg)] border-[3px] border-gray-400/50 rounded-full relative -translate-x-1/2 timeline-node ${index === activeIndex ? 'active' : ''}`}
              >
                <div className="absolute right-[25px] top-1/2 -translate-y-1/2 font-sans font-black text-lg text-[var(--color-textbook-text)] timeline-label whitespace-nowrap">
                  {item.reality.year}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Reality Impact */}
          <div className="flex-1 relative bg-[var(--color-reality-bg)] flex items-center justify-center overflow-hidden z-0">
            {HISTORY_DATA.map((item, index) => {
              const isActive = index === activeIndex;
              
              return (
                <div 
                  key={`right-${item.id}`} 
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center p-8 md:p-20 reality-item ${isActive ? 'active' : ''}`}
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center grayscale-[80%] brightness-40 reality-bg-image z-0"
                    style={{ backgroundImage: `url('${item.reality.bgImage}')` }}
                  />
                  
                  {/* Content Overlay */}
                  <div className="relative z-10 max-w-lg text-[var(--color-reality-text)] reality-content">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="inline-block bg-[var(--color-accent-red)] text-white text-base md:text-lg font-black py-2 px-4 rounded tracking-widest">
                        {item.reality.year}
                      </span>
                      {item.reality.ruling_id && (
                        <span className="inline-block bg-white text-[var(--color-accent-red)] border-2 border-[var(--color-accent-red)] text-base md:text-lg font-black py-1.5 px-4 rounded tracking-tighter">
                          {item.reality.ruling_id}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-4xl md:text-5xl font-black leading-[1.2] mb-6 tracking-tight">
                      {item.reality.title}
                    </h3>
                    <div className="text-xl md:text-2xl font-bold text-[#AAAAAA] border-l-4 border-[var(--color-accent-red)] pl-4">
                      {item.reality.ruling}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Scroll Triggers */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {HISTORY_DATA.map((_, index) => (
            <div 
              key={`trigger-${index}`} 
              className="w-full h-screen vh-trigger" 
              data-step={index} 
            />
          ))}
        </div>

      </div>

      {/* Outro Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[var(--color-textbook-bg)] border-t border-black/5 relative z-20">
        <h2 className="text-4xl md:text-6xl font-black mb-6 font-serif">但是現在，憲庭載入中...</h2>
        <p className="text-lg md:text-2xl max-w-3xl text-gray-700 leading-relaxed font-serif mb-12">
          過去捍衛我們權利的最後防線，正因為政治角力面臨癱瘓危機。<br/>
          你的日常，即將成為下一個受到影響的戰場。
        </p>
        <Link 
          href="/present" 
          className="bg-midnight text-white px-10 py-5 rounded-full font-bold text-xl md:text-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          回到 憲庭熱搜榜
        </Link>
      </section>

    </div>
  );
}
