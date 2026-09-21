'use client';

import { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Reveal navbar ONLY after scrolling down past 60px
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        scrolled
          ? 'translate-y-0 opacity-100 bg-[#070709]/90 backdrop-blur-xl border-b border-white/10 py-4 shadow-2xl pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
        {/* Museum Identity */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="h-2 w-2 rounded-full bg-[#c5a880]" />
          <div>
            <div className="serif-title text-sm tracking-widest text-[#f4f4f6] uppercase font-medium">
              Induk Biennale 2026
            </div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
              Dept. of Game &amp; VR Design
            </div>
          </div>
        </a>

        {/* Curatorial Sections Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-[0.2em]">
          <a href="#hero" className="text-zinc-400 hover:text-white transition-colors">
            01. ROTUNDA
          </a>
          <a href="#pinned-showcase" className="text-zinc-400 hover:text-white transition-colors">
            02. EXHIBITION
          </a>
          <a href="#vr-showroom" className="text-[#c5a880] hover:text-white transition-colors">
            03. PAVILION
          </a>
          <a href="#curatorial-info" className="text-zinc-400 hover:text-white transition-colors">
            04. CURATORIAL
          </a>
          <a href="#guestbook" className="text-zinc-400 hover:text-white transition-colors">
            05. REGISTRY
          </a>
        </nav>

        {/* Right Docent Audio */}
        <div className="flex items-center gap-4">
          <AudioPlayer />
        </div>
      </div>
    </header>
  );
}
