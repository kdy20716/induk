'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRoom, worksInRoom } from '@/data/artworks';
import RoomIntro from './RoomIntro';
import Reveal from './Reveal';
import { preloadModel } from './SculptureStage';

const SculptureStage = dynamic(() => import('./SculptureStage'), { ssr: false });

const room = getRoom('sculpture');
const works = worksInRoom('sculpture');

/**
 * 01 조각실
 * 하나의 조명 무대 위에서 작품을 바꿔가며 감상 — 렌더러는 1개만 사용해 가볍게 유지
 */
export default function SculptureRoom() {
  const [index, setIndex] = useState(0);
  const work = works[index];

  // 다음 작품 미리 불러오기
  useEffect(() => {
    const next = works[(index + 1) % works.length];
    if (next.model) preloadModel(next.model.src);
  }, [index]);

  return (
    <section id={room.anchor} className="relative bg-night">
      <RoomIntro room={room} count={works.length} />

      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 pb-40 md:px-10 lg:grid-cols-12">
        {/* 무대 */}
        <Reveal className="relative h-[70vh] min-h-[480px] overflow-hidden lg:col-span-8 lg:h-[82vh]">
          <SculptureStage model={work.model!} variant="room" />
          <p className="eyebrow pointer-events-none absolute bottom-5 left-5 text-white/35">Drag to rotate</p>
          <p className="pointer-events-none absolute right-6 top-5 font-display text-7xl font-light text-white/10 md:text-8xl">
            {work.no}
          </p>
        </Reveal>

        {/* 벽면 캡션 + 작품 목록 */}
        <div className="flex flex-col justify-between text-white lg:col-span-4">
          <div key={work.id} className="animate-[fadeUp_.9s_cubic-bezier(.2,.7,.1,1)]">
            <p className="eyebrow text-brass">{work.no}</p>
            <h3 className="mt-4 font-serif text-4xl font-light leading-tight">{work.title}</h3>
            <p className="mt-2 font-display text-xl italic text-white/50">{work.titleEn}</p>
            <dl className="mt-8 space-y-1 text-sm text-white/60">
              <div>{work.artists.map((a) => a.name).join(', ')}</div>
              <div>{work.medium}, {work.year}</div>
              {work.dimension && <div className="text-white/40">{work.dimension}</div>}
            </dl>
            <p className="mt-8 font-serif leading-[1.9] text-white/75">{work.statement}</p>
            <Link
              href={`/works/${work.id}`}
              className="group mt-10 inline-flex items-center gap-3 border-b border-white/30 pb-1 text-sm transition hover:border-white"
            >
              작품 자세히 보기
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <ol className="mt-16 border-t border-white/10">
            {works.map((w, i) => (
              <li key={w.id}>
                <button
                  onClick={() => setIndex(i)}
                  className={`flex w-full items-baseline gap-5 border-b border-white/10 py-4 text-left transition-colors ${
                    i === index ? 'text-white' : 'text-white/35 hover:text-white/70'
                  }`}
                >
                  <span className="font-display w-10 text-sm">{w.no}</span>
                  <span className="font-serif">{w.title}</span>
                  <span className={`ml-auto h-px transition-all duration-500 ${i === index ? 'w-8 bg-brass' : 'w-0'}`} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
