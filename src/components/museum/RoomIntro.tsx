import Reveal from './Reveal';
import type { Room } from '@/data/artworks';

/** 전시실 입구 사인 — 번호, 이름, 서문 */
export default function RoomIntro({ room, count }: { room: Room; count: number }) {
  const dark = room.tone === 'dark';
  return (
    <div className={`mx-auto max-w-[1600px] px-6 pb-16 pt-32 md:px-10 md:pt-44 ${dark ? 'text-white' : 'text-ink'}`}>
      <div className="grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className={`eyebrow ${dark ? 'text-white/40' : 'text-ink/45'}`}>Room {room.no}</p>
          <h2 className="mt-5 flex items-baseline gap-5">
            <span className="font-serif text-5xl font-light md:text-7xl">{room.name}</span>
          </h2>
          <p className={`mt-3 font-display text-2xl italic ${dark ? 'text-white/45' : 'text-ink/45'}`}>{room.nameEn}</p>
        </Reveal>
        <Reveal delay={150} className="md:col-span-5 md:col-start-8 md:pt-10">
          <p className={`font-serif text-lg leading-[1.9] ${dark ? 'text-white/70' : 'text-ink/75'}`}>{room.intro}</p>
          <p className={`eyebrow mt-8 ${dark ? 'text-white/35' : 'text-ink/40'}`}>{String(count).padStart(2, '0')} Works</p>
        </Reveal>
      </div>
      <div className={`mt-20 h-px w-full ${dark ? 'bg-white/10' : 'bg-ink/10'}`} />
    </div>
  );
}
