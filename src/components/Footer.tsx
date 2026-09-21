'use client';

import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-20 bg-[#050507] border-t border-white/10 text-zinc-500 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="serif-title text-sm text-[#f4f4f6] font-normal uppercase tracking-wider">
            인덕대학교 게임&amp;VR콘텐츠디자인학과
          </p>
          <p className="text-[11px] text-zinc-600 tracking-widest mt-1">
            2026 GRADUATION BIENNALE ARCHIVE &bull; ALL RIGHTS RESERVED
          </p>
        </div>

        <div className="text-zinc-600 text-center md:text-left">
          Curated by the Graduating Class of 2026 &bull; Seoul, Republic of Korea
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 text-zinc-400 hover:text-white hover:border-white transition-colors tracking-widest text-[11px]"
        >
          <span>INDEX TOP</span>
          <ArrowUp className="h-3 w-3" />
        </button>
      </div>
    </footer>
  );
}
