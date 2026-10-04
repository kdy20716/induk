'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ARTWORKS, EXHIBITION } from '@/data/artworks';

const SculptureStage = dynamic(() => import('./SculptureStage'), { ssr: false });

const HERO = ARTWORKS[0];

/**
 * 입구 (Entrance)
 * - 첫 화면: 글자 없이 어둠 속 스포트라이트 아래의 조각 하나
 * - 스크롤: 화면은 고정된 채 카메라가 천천히 물러나고, 전시 제목이 떠오름
 */
export default function Entrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      progress.current = p;

      // 제목: 35%~65% 구간에서 떠오르고 85% 이후 사라짐
      const tIn = Math.min(1, Math.max(0, (p - 0.32) / 0.3));
      const tOut = Math.min(1, Math.max(0, (p - 0.82) / 0.18));
      if (titleRef.current) {
        titleRef.current.style.opacity = String(tIn * (1 - tOut));
        titleRef.current.style.transform = `translate3d(0, ${(1 - tIn) * 40 - tOut * 30}px, 0)`;
        titleRef.current.style.filter = `blur(${(1 - tIn) * 8}px)`;
      }
      if (cueRef.current) cueRef.current.style.opacity = String(Math.max(0, 1 - p * 6));
      if (veilRef.current) veilRef.current.style.opacity = String(tOut);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={sectionRef} id="entrance" className="relative h-[280vh] bg-night">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <SculptureStage model={HERO.model!} variant="entrance" progressRef={progress} />

        {/* 비네트 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,11,0.85)_100%)]" />

        {/* 전시 제목 — 스크롤해야만 나타남 */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 bottom-[14vh] text-center text-white opacity-0 will-change-transform"
        >
          <p className="eyebrow mb-6 text-white/50">{EXHIBITION.edition}</p>
          <h1 className="font-serif text-5xl font-light tracking-tight md:text-7xl">{EXHIBITION.title}</h1>
          <p className="mt-4 font-display text-2xl italic text-white/60 md:text-3xl">{EXHIBITION.titleEn}</p>
          <p className="mt-10 text-sm text-white/45">{EXHIBITION.dept}</p>
        </div>

        {/* 스크롤 단서: 글자 대신 가는 선 하나 */}
        <div ref={cueRef} className="pointer-events-none absolute bottom-8 left-1/2 h-14 w-px -translate-x-1/2 overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.4s_ease-in-out_infinite] bg-white/70" />
        </div>

        {/* 다음 전시실로 넘어가는 암전 */}
        <div ref={veilRef} className="pointer-events-none absolute inset-0 bg-night opacity-0" />
      </div>

      <style>{`@keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
