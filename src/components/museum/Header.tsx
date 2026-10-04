'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROOMS } from '@/data/artworks';

/**
 * 미술관 헤더
 * - 홈 첫 화면(입구)에서는 완전히 숨김 → 스크롤하면 내려옴
 * - 현재 위치한 전시실을 표시하고, 밝은 회화실에서는 글자색이 반전
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [shown, setShown] = useState(!isHome);
  const [active, setActive] = useState<string | null>(null);
  const [light, setLight] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setShown(true);
      setLight(false);
      return;
    }
    const onScroll = () => {
      const y = window.scrollY;
      setShown(y > window.innerHeight * 0.6);
      // 화면 상단 기준 현재 전시실
      let current: string | null = null;
      let tone: 'dark' | 'light' = 'dark';
      for (const r of ROOMS) {
        const el = document.getElementById(r.anchor);
        if (el && el.getBoundingClientRect().top <= 80) {
          current = r.anchor;
          tone = r.tone;
        }
      }
      const visit = document.getElementById('visit');
      if (visit && visit.getBoundingClientRect().top <= 80) {
        current = 'visit';
        tone = 'light';
      }
      setActive(current);
      setLight(tone === 'light');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const fg = light ? 'text-ink' : 'text-white';
  const muted = light ? 'text-ink/50' : 'text-white/45';
  const bg = light ? 'bg-wall/80' : 'bg-night/70';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] ${
          shown ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${bg} backdrop-blur-md`}
      >
        <div className={`mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 md:px-10 ${fg}`}>
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-display text-xl italic tracking-wide">Beyond the Frame</span>
            <span className={`hidden text-xs sm:inline ${muted}`}>인덕대 게임&VR콘텐츠디자인학과 2026</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {ROOMS.map((r) => (
              <Link
                key={r.id}
                href={`/#${r.anchor}`}
                className={`group flex items-baseline gap-2 text-sm transition-colors ${
                  active === r.anchor ? fg : `${muted} hover:opacity-100`
                }`}
              >
                <span className="font-display text-xs">{r.no}</span>
                <span className="relative">
                  {r.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-500 ${
                      active === r.anchor ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              </Link>
            ))}
            <Link href="/#visit" className={`text-sm ${active === 'visit' ? fg : muted}`}>
              관람 안내
            </Link>
          </nav>

          <button
            onClick={() => setMenu(true)}
            className="eyebrow lg:hidden"
            aria-label="전시실 안내 열기"
          >
            Floor Map
          </button>
        </div>
      </header>

      {/* 모바일 플로어 맵 */}
      <div
        className={`fixed inset-0 z-[60] bg-night text-white transition-opacity duration-500 lg:hidden ${
          menu ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="eyebrow text-white/50">Floor Map</span>
          <button onClick={() => setMenu(false)} className="eyebrow">
            Close
          </button>
        </div>
        <ol className="mt-10 space-y-8 px-6">
          {ROOMS.map((r) => (
            <li key={r.id}>
              <Link href={`/#${r.anchor}`} onClick={() => setMenu(false)} className="flex items-baseline gap-4">
                <span className="font-display text-2xl text-brass">{r.no}</span>
                <span className="font-serif text-3xl">{r.name}</span>
                <span className="font-display text-lg italic text-white/40">{r.nameEn}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/#visit" onClick={() => setMenu(false)} className="font-serif text-3xl">
              관람 안내
            </Link>
          </li>
        </ol>
      </div>
    </>
  );
}
