'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getRoom, worksInRoom } from '@/data/artworks';
import { withBase } from '@/utils/asset';
import RoomIntro from './RoomIntro';
import Reveal from './Reveal';

const room = getRoom('media');
const works = worksInRoom('media');

/**
 * 03 미디어실 — 블랙박스 상영관
 * 화면에 들어오면 무음 자동 재생, 벗어나면 일시정지. 소리는 관람객이 직접 켬.
 */
export default function MediaRoom() {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const work = works[index];

  useEffect(() => {
    const v = videoRef.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(screenRef.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current!;
    v.load();
    if (visible.current) v.play().catch(() => {});
  }, [index]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <section id={room.anchor} className="grain relative bg-night">
      <RoomIntro room={room} count={works.length} />

      <div className="mx-auto max-w-[1600px] px-6 pb-40 md:px-10">
        {/* 스크린 */}
        <Reveal>
          <div ref={screenRef} className="relative">
            {/* 스크린에서 번져 나오는 빛 */}
            <div className="pointer-events-none absolute -inset-x-[8%] -bottom-24 top-1/3 bg-[radial-gradient(ellipse_at_top,rgba(160,180,255,0.10),transparent_65%)] blur-2xl" />
            <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_40px_120px_-30px_rgba(120,140,255,0.25)]">
              <video
                ref={videoRef}
                src={withBase(work.video!.src)}
                muted={muted}
                playsInline
                loop
                preload="metadata"
                onTimeUpdate={(e) => setTime({ cur: e.currentTarget.currentTime, dur: e.currentTarget.duration || 0 })}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-5 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-16 text-white">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="eyebrow border border-white/25 px-3 py-2 transition hover:border-white"
                >
                  {muted ? 'Sound Off' : 'Sound On'}
                </button>
                <div className="h-px flex-1 bg-white/15">
                  <div className="h-px bg-white/70" style={{ width: `${time.dur ? (time.cur / time.dur) * 100 : 0}%` }} />
                </div>
                <span className="font-display text-sm text-white/60">
                  {fmt(time.cur)} / {fmt(time.dur)}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 상영 정보 + 상영 목록 */}
        <div className="mt-14 grid gap-12 text-white lg:grid-cols-12">
          <div key={work.id} className="lg:col-span-6">
            <p className="eyebrow text-brass">Now Screening · {work.no}</p>
            <h3 className="mt-4 font-serif text-3xl font-light md:text-4xl">{work.title}</h3>
            <p className="mt-2 font-display text-xl italic text-white/50">{work.titleEn}</p>
            <p className="mt-6 max-w-xl font-serif leading-[1.9] text-white/70">{work.statement}</p>
            <p className="mt-6 text-sm text-white/45">
              {work.artists.map((a) => `${a.name} (${a.role})`).join(' · ')}
            </p>
            <Link href={`/works/${work.id}`} className="mt-8 inline-block border-b border-white/30 pb-1 text-sm hover:border-white">
              작품 자세히 보기 →
            </Link>
          </div>

          <ol className="space-y-3 lg:col-span-5 lg:col-start-8">
            {works.map((w, i) => (
              <li key={w.id}>
                <button
                  onClick={() => setIndex(i)}
                  className={`group flex w-full items-center gap-5 p-3 text-left transition ${
                    i === index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden bg-white/5">
                    <video src={`${withBase(w.video!.src)}#t=4`} muted preload="metadata" className="h-full w-full object-cover opacity-70" />
                    {i === index && <span className="absolute left-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
                  </div>
                  <div>
                    <p className="font-display text-sm text-white/40">{w.no}</p>
                    <p className={`font-serif ${i === index ? 'text-white' : 'text-white/60 group-hover:text-white/85'}`}>{w.title}</p>
                    <p className="text-xs text-white/35">{w.medium}</p>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
