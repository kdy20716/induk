import type { Metadata } from 'next';
import { Noto_Serif_KR, Noto_Sans_KR, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Header from '@/components/museum/Header';

const serif = Noto_Serif_KR({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  preload: false,
  display: 'swap',
});
const sans = Noto_Sans_KR({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  preload: false,
  display: 'swap',
});
const display = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '경계 너머의 감각 — 인덕대학교 게임&VR콘텐츠디자인학과 2026 졸업전시',
  description:
    '인덕대학교 게임&VR콘텐츠디자인학과 2026 졸업전시 온라인 미술관. 디지털 조각, 컨셉 아트, 영상, 유니티 WebGL 체험 작품을 전시실을 따라 감상하세요.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${serif.variable} ${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SmoothScroll>
          <Header />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
