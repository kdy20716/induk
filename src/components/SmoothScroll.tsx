'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

let lenis: Lenis | null = null;

/** 다른 컴포넌트에서 부드러운 이동/정지를 제어하기 위한 헬퍼 */
export const smoothScroll = {
  to(target: string | HTMLElement | number, offset = 0) {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.6 });
    else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  },
  stop() {
    lenis?.stop();
  },
  start() {
    lenis?.start();
  },
};

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      anchors: { offset: 0, duration: 1.6 },
    });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // 페이지 이동 시 맨 위에서 시작 (해시가 있으면 해당 위치로)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const t = setTimeout(() => smoothScroll.to(hash), 120);
      return () => clearTimeout(t);
    }
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
