import Link from 'next/link';
import { EXHIBITION, ROOMS, ARTWORKS } from '@/data/artworks';
import Reveal from './Reveal';

/** 관람 안내 + 출구 */
export default function Visit() {
  const artists = Array.from(new Set(ARTWORKS.flatMap((w) => w.artists.map((a) => a.name)))).sort((a, b) =>
    a.localeCompare(b, 'ko')
  );

  return (
    <section id="visit" className="bg-wall text-ink">
      <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44">
        <Reveal>
          <p className="eyebrow text-ink/45">Visit</p>
          <h2 className="mt-5 font-serif text-5xl font-light md:text-7xl">관람 안내</h2>
        </Reveal>

        <div className="mt-20 grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              {[
                ['기간', EXHIBITION.period],
                ['시간', EXHIBITION.hours],
                ['장소', EXHIBITION.venue],
                ['주소', EXHIBITION.address],
                ['관람료', '무료'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] py-5">
                  <dt className="text-sm text-ink/45">{k}</dt>
                  <dd className="font-serif">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="md:col-span-6 md:col-start-7">
            <p className="eyebrow text-ink/45">Floor Guide</p>
            <ol className="mt-6 space-y-5">
              {ROOMS.map((r) => (
                <li key={r.id}>
                  <Link href={`/#${r.anchor}`} className="group flex items-baseline gap-5">
                    <span className="font-display text-lg text-brass">{r.no}</span>
                    <span className="font-serif text-2xl transition group-hover:translate-x-1">{r.name}</span>
                    <span className="font-display italic text-ink/40">{r.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ol>

            <p className="eyebrow mt-16 text-ink/45">Artists</p>
            <p className="mt-5 font-serif leading-[2] text-ink/70">{artists.join(' · ')}</p>
          </Reveal>
        </div>
      </div>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-4 px-6 py-10 text-sm text-ink/50 md:flex-row md:px-10">
          <p>
            <span className="font-display text-base italic text-ink">Beyond the Frame</span> — {EXHIBITION.dept} {EXHIBITION.edition}
          </p>
          <p className="text-xs">일부 작품 이미지·영상·모델은 공개 라이선스 임시 에셋입니다 (작품 상세 페이지에 출처 표기).</p>
        </div>
      </footer>
    </section>
  );
}
