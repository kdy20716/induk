import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'Induk Biennale 2026 | 인덕대학교 게임&VR콘텐츠디자인학과 졸업전시회',
  description:
    '인덕대학교 게임&VR콘텐츠디자인학과 2026 졸업전시 아카이브. 디지털 조각(ZBrush), 인터랙티브 가상공간, 건축적 파빌리온 및 학생 작품 도록.',
  keywords: [
    '인덕대학교',
    '게임&VR콘텐츠디자인학과',
    '미술관',
    '졸업전시회',
    '비엔날레',
    'Digital Sculpture',
    'Virtual Architecture',
    'ZBrush',
    'Unity WebGL',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className="bg-[#070709] text-[#f4f4f6] antialiased selection:bg-[#c5a880]/30 selection:text-white"
        suppressHydrationWarning
      >
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
