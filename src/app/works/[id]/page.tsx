import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTWORKS, getArtwork, getNeighbours, getRoom } from '@/data/artworks';
import WorkViewer from '@/components/museum/WorkViewer';

export function generateStaticParams() {
  return ARTWORKS.map((w) => ({ id: w.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/works/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const w = getArtwork(id);
  return { title: w ? `${w.title} — Beyond the Frame` : 'Beyond the Frame' };
}

export default async function WorkPage({ params }: PageProps<'/works/[id]'>) {
  const { id } = await params;
  const work = getArtwork(id);
  if (!work) notFound();

  const room = getRoom(work.room);
  const { prev, next } = getNeighbours(work.id);
  const dark = room.tone === 'dark';

  return (
    <main className={dark ? 'bg-night text-white' : 'bg-wall text-ink'}>
      <div className="pt-16">
        <WorkViewer work={work} />
      </div>

      {/* 작품 해설 */}
      <article className="mx-auto grid max-w-[1400px] gap-14 px-6 py-24 md:grid-cols-12 md:px-10 md:py-32">
        <div className="md:col-span-5">
          <Link href={`/#${room.anchor}`} className={`eyebrow ${dark ? 'text-white/45' : 'text-ink/45'} hover:underline`}>
            ← Room {room.no} · {room.name}
          </Link>
          <p className="mt-10 font-display text-lg text-brass">{work.no}</p>
          <h1 className="mt-3 font-serif text-4xl font-light leading-tight md:text-6xl">{work.title}</h1>
          <p className={`mt-3 font-display text-2xl italic ${dark ? 'text-white/50' : 'text-ink/50'}`}>{work.titleEn}</p>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-16">
          <p className={`font-serif text-lg leading-[2] ${dark ? 'text-white/80' : 'text-ink/80'}`}>{work.statement}</p>

          <dl className={`mt-14 divide-y border-y text-sm ${dark ? 'divide-white/10 border-white/10' : 'divide-ink/10 border-ink/10'}`}>
            {[
              ['작가', work.artists.map((a) => `${a.name} — ${a.role}`).join('\n')],
              ['제작 연도', String(work.year)],
              ['매체', work.medium],
              ...(work.dimension ? [['규격', work.dimension]] : []),
              ['사용 도구', work.tools.join(', ')],
              ...(work.experience ? [['조작법', work.experience.controls]] : []),
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] py-4">
                <dt className={dark ? 'text-white/40' : 'text-ink/45'}>{k}</dt>
                <dd className="whitespace-pre-line">{v}</dd>
              </div>
            ))}
          </dl>
          {work.credit && <p className={`mt-6 text-xs ${dark ? 'text-white/30' : 'text-ink/40'}`}>※ {work.credit}</p>}
        </div>
      </article>

      {/* 다음 작품으로 */}
      <nav className={`grid border-t md:grid-cols-2 ${dark ? 'border-white/10' : 'border-ink/10'}`}>
        {[prev, next].map((w, i) =>
          w ? (
            <Link
              key={w.id}
              href={`/works/${w.id}`}
              className={`group px-6 py-14 transition md:px-10 ${i === 1 ? 'md:text-right' : ''} ${
                dark ? 'hover:bg-white/[0.03]' : 'hover:bg-ink/[0.03]'
              }`}
            >
              <p className={`eyebrow ${dark ? 'text-white/40' : 'text-ink/45'}`}>{i === 0 ? '← 이전 작품' : '다음 작품 →'}</p>
              <p className="mt-4 font-serif text-2xl transition group-hover:opacity-70">{w.title}</p>
              <p className={`mt-1 font-display italic ${dark ? 'text-white/40' : 'text-ink/45'}`}>
                {w.no} · {getRoom(w.room).name}
              </p>
            </Link>
          ) : (
            <Link key={i} href="/#visit" className={`px-6 py-14 md:px-10 ${i === 1 ? 'md:text-right' : ''}`}>
              <p className={`eyebrow ${dark ? 'text-white/40' : 'text-ink/45'}`}>{i === 0 ? '입구' : '출구'}</p>
              <p className="mt-4 font-serif text-2xl">{i === 0 ? '전시 처음으로' : '관람 안내'}</p>
            </Link>
          )
        )}
      </nav>
    </main>
  );
}
