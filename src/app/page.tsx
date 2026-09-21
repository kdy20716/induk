'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import ShowcaseGallery from '@/components/ShowcaseGallery';
import ExhibitionInfo from '@/components/ExhibitionInfo';
import GuestbookSection from '@/components/GuestbookSection';
import Footer from '@/components/Footer';

// Use Next.js dynamic import with ssr: false for client-only components to prevent hydration / insertBefore errors
const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="relative h-screen w-full bg-[#050507] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 rounded-full border border-white/20 border-t-white animate-spin" />
        <span className="text-[10px] font-mono tracking-[0.35em] text-zinc-500 uppercase">
          ENTERING EXHIBITION ROTUNDA
        </span>
      </div>
    </div>
  ),
});

const VirtualVRShowroom = dynamic(() => import('@/components/VirtualVRShowroom'), {
  ssr: false,
  loading: () => (
    <div className="w-full py-32 bg-[#070709] flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border border-[#c5a880]/30 border-t-[#c5a880] animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#070709] text-[#f4f4f6]">
      {/* Museum Header (Reveals on scroll) */}
      <Navbar />

      {/* Section 1: Hero Rotunda Plinth (Pure 3D Artwork, Zero Text) */}
      <div id="hero-section" className="relative w-full">
        <Hero3D />
      </div>

      {/* Section 2: Pinned Horizontal Scroll Exhibition Catalogue */}
      <div id="showcase-section" className="relative w-full">
        <ShowcaseGallery />
      </div>

      {/* Section 3: Game Engine & VR Interactive Pavilion (Unity & Unreal Engine) */}
      <div id="showroom-section" className="relative w-full">
        <VirtualVRShowroom />
      </div>

      {/* Section 4: Curatorial Notes & Campus Information */}
      <div id="info-section" className="relative w-full">
        <ExhibitionInfo />
      </div>

      {/* Section 5: Signature Ledger & Visitor Registry */}
      <div id="guestbook-section" className="relative w-full">
        <GuestbookSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
