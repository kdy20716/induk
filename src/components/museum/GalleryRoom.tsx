'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getRoom, worksInRoom } from '@/data/artworks';
import RoomIntro from './RoomIntro';

const room = getRoom('gallery');
const works = worksInRoom('gallery');

/**
 * 02 회화실 — 하얀 회랑
 * 세로로 스크롤하면 화면은 멈춘 채 벽을 따라 옆으로 걸어감 (CSS sticky + transform)
 */
export default function GalleryRoom() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const track = trackRef.current!;
    const outer = outerRef.current!;
    let distance = 0;
    let target = 0;
    let x = 0;
    let raf = 0;

    const measure = () => {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      setHeight(distance + window.innerHeight);
    };
    const onScroll = () => {
      const top = outer.getBoundingClientRect().top;
      const p = distance ? Math.min(1, Math.max(0, -top / distance)) : 0;
      target = p * distance;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setCurrent(Math.min(works.length - 1, Math.round(p * (works.length - 1))));
    };
    // 관성 있는 이동
    const tick = () => {
      x += (target - x) * 0.12;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    measure();
    onScroll();
    tick();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(track);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section id={room.anchor} className="relative bg-wall">
      <RoomIntro room={room} count={works.length} />

      <div ref={outerRef} style={{ height: height ?? '300vh' }} className="relative">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          {/* 바닥 걸레받이 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9vh] bg-wall-deep" />
          <div className="pointer-events-none absolute inset-x-0 bottom-[9vh] h-px bg-ink/10" />

          <div ref={trackRef} className="relative flex h-full items-center gap-[12vw] pl-[10vw] pr-[18vw] will-change-transform">
            {works.map((w, i) => (
              <Link
                key={w.id}
                href={`/works/${w.id}`}
                className="wall-spot group relative flex h-full shrink-0 flex-col items-center justify-center px-[6vw]"
              >
                <div
                  className={`frame transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:-translate-y-2 ${
                    i % 3 === 1 ? 'w-[min(46vw,560px)]' : 'w-[min(58vw,760px)]'
                  }`}
                >
                  <div className={`frame-inner overflow-hidden ${i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.cover}
                      alt={w.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </div>

                {/* 벽면 캡션 */}
                <div className="absolute bottom-[13vh] right-[2vw] w-56 text-ink">
                  <p className="font-display text-sm text-ink/45">{w.no}</p>
                  <p className="mt-1 font-serif text-base">{w.title}</p>
                  <p className="font-display text-sm italic text-ink/55">{w.titleEn}</p>
                  <p className="mt-2 text-xs text-ink/50">
                    {w.artists.map((a) => a.name).join(', ')} · {w.year}
                  </p>
                  <p className="text-xs text-ink/40">{w.medium}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* 진행 표시 */}
          <div className="absolute left-6 right-6 top-24 flex items-center gap-6 text-ink md:left-10 md:right-10">
            <span className="font-display text-sm">
              {String(current + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
            </span>
            <div className="h-px flex-1 bg-ink/10">
              <div ref={barRef} className="h-px origin-left scale-x-0 bg-ink/60" />
            </div>
            <span className="eyebrow hidden text-ink/40 md:inline">Scroll to walk</span>
          </div>
        </div>
      </div>
      <div className="h-24" />
    </section>
  );
}
