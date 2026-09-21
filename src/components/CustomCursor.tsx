'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animId: number;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;

      const target = e.target as HTMLElement | null;
      const hovered = Boolean(
        target?.closest('a') ||
        target?.closest('button') ||
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('[role="button"]') ||
        target?.closest('.cursor-pointer')
      );

      if (hovered !== isHovered) {
        isHovered = hovered;
        if (isHovered) {
          ring.className =
            'fixed top-0 left-0 rounded-full border border-[#c5a880] bg-[#c5a880]/10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ease-out';
        } else {
          ring.className =
            'fixed top-0 left-0 rounded-full border border-white/20 bg-transparent h-6 w-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ease-out';
        }
      }
    };

    const handleMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const updateTrailer = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      ring.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${isHovered ? 1.25 : 1})`;
      animId = requestAnimationFrame(updateTrailer);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(updateTrailer);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Central hairline dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f4f6] pointer-events-none opacity-0 transition-opacity duration-200"
      />
      {/* Outer subtle gallery ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border border-white/20 bg-transparent h-6 w-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 transition-opacity duration-200"
      />
    </div>
  );
}
