'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Artwork } from '@/data/artworks';

const SculptureStage = dynamic(() => import('./SculptureStage'), { ssr: false });
const ExperiencePlayer = dynamic(() => import('./ExperiencePlayer'), { ssr: false });

/** 작품 상세 페이지의 메인 감상 영역 — 작품 종류에 맞춰 3D / 영상 / 이미지 / 체험 */
export default function WorkViewer({ work }: { work: Artwork }) {
  const [playing, setPlaying] = useState(false);
  const [img, setImg] = useState(0);
  const close = useCallback(() => setPlaying(false), []);

  if (work.model) {
    return (
      <div className="relative h-[78vh] min-h-[480px] bg-night">
        <SculptureStage model={work.model} variant="detail" />
        <p className="eyebrow pointer-events-none absolute bottom-6 left-6 text-white/35">Drag to rotate</p>
      </div>
    );
  }

  if (work.video) {
    return (
      <div className="bg-black">
        <video src={work.video.src} controls playsInline className="mx-auto max-h-[82vh] w-full" />
      </div>
    );
  }

  if (work.experience) {
    return (
      <div className="relative flex h-[78vh] min-h-[480px] items-center justify-center overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={work.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <button
          onClick={() => setPlaying(true)}
          className="relative flex items-center gap-3 bg-white px-7 py-4 text-ink transition hover:bg-brass hover:text-white"
        >
          <span className="inline-block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-current" />
          체험관 입장
        </button>
        {playing && <ExperiencePlayer work={work} onClose={close} />}
      </div>
    );
  }

  const images = work.images ?? (work.cover ? [work.cover] : []);
  return (
    <div className="wall-spot px-6 py-16 md:py-24">
      <div className="frame mx-auto max-w-5xl">
        <div className="frame-inner overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={images[img]} src={images[img]} alt={work.title} className="w-full animate-[fadeIn_.8s_ease] object-cover" />
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-10 flex justify-center gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setImg(i)}
              className={`h-16 w-24 overflow-hidden transition ${i === img ? 'ring-1 ring-ink' : 'opacity-50 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
