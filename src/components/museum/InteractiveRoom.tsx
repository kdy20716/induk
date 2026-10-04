'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getRoom, worksInRoom, type Artwork } from '@/data/artworks';
import RoomIntro from './RoomIntro';
import Reveal from './Reveal';

const ExperiencePlayer = dynamic(() => import('./ExperiencePlayer'), { ssr: false });

const room = getRoom('interactive');
const works = worksInRoom('interactive');

/**
 * 04 체험관 — 세 개의 문
 * 평소에는 이미지만 보여주고(GPU 0%), 관람객이 문을 열 때만 유니티를 불러옴
 */
export default function InteractiveRoom() {
  const [open, setOpen] = useState<Artwork | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id={room.anchor} className="relative bg-night-soft">
      <RoomIntro room={room} count={works.length} />

      <div className="mx-auto grid max-w-[1600px] gap-6 px-6 pb-40 md:grid-cols-3 md:px-10">
        {works.map((w, i) => (
          <Reveal key={w.id} delay={i * 120}>
            <article className="group relative flex h-[78vh] min-h-[520px] flex-col justify-end overflow-hidden text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={w.cover}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-55 grayscale-[35%] transition-all duration-[1600ms] ease-out group-hover:scale-105 group-hover:opacity-80 group-hover:grayscale-0"
              />
              {/* 문틀 + 문 안쪽에서 새어 나오는 빛 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
              <div className="absolute inset-4 border border-white/10 transition-colors duration-700 group-hover:border-white/30" />

              <div className="relative p-8">
                <p className="eyebrow text-brass">{w.no} · {w.medium.split('·')[0].trim()}</p>
                <h3 className="mt-4 font-serif text-3xl font-light leading-tight">{w.title}</h3>
                <p className="mt-1 font-display text-lg italic text-white/50">{w.titleEn}</p>
                <p className="mt-5 line-clamp-3 font-serif text-sm leading-[1.85] text-white/65">{w.statement}</p>
                <p className="mt-4 text-xs text-white/40">{w.artists.map((a) => a.name).join(', ')}</p>

                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => setOpen(w)}
                    className="flex items-center gap-3 bg-white px-5 py-3 text-sm text-ink transition hover:bg-brass hover:text-white"
                  >
                    <span className="inline-block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current" />
                    체험관 입장
                  </button>
                  <Link href={`/works/${w.id}`} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                    작품 정보
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {open && <ExperiencePlayer work={open} onClose={close} />}
    </section>
  );
}
