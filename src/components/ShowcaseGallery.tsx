'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS_DATA } from '@/data/projectsData';
import { StudentProject } from '@/types';
import ProjectModal from './ProjectModal';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ShowcaseGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const container = containerRef.current;

    // Calculate total scroll distance
    const totalWidth = track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // Main Horizontal Pin Animation
      gsap.to(track, {
        x: () => -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalWidth * 1.25}`,
          pin: true,
          scrub: 1.0, // Buttery smooth 1-second inertia scrub
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update horizontal progress bar
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }
            // Update active index indicator
            const current = Math.min(
              PROJECTS_DATA.length - 1,
              Math.floor(self.progress * PROJECTS_DATA.length)
            );
            setActiveIdx(current);
          },
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="relative w-full bg-[#070709]">
      <section
        id="pinned-showcase"
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-[#070709] border-t border-white/5 select-none"
      >
      {/* Top Curatorial Bar */}
      <div className="absolute top-8 left-8 sm:left-14 right-8 sm:right-14 z-20 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.3em] text-[#c5a880] uppercase">
            GALLERY WING II
          </span>
          <span className="text-zinc-700">&bull;</span>
          <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            CURATORIAL REPERTOIRE
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-zinc-400">
          <span className="text-white font-semibold">
            {String(activeIdx + 1).padStart(2, '0')}
          </span>
          <span className="text-zinc-700">/</span>
          <span>{String(PROJECTS_DATA.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Horizontal Sliding Track (Driven by vertical mouse scroll!) */}
      <div
        ref={trackRef}
        className="flex h-full items-center pl-8 sm:pl-16 pr-24 sm:pr-40 will-change-transform pt-12"
      >
        {PROJECTS_DATA.map((project, idx) => {
          const exhibitNum = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer shrink-0 w-[82vw] sm:w-[68vw] lg:w-[58vw] max-w-5xl mr-16 sm:mr-24 relative flex flex-col justify-center"
            >
              {/* Giant Background Architectural Roman Numeral (Parallax depth) */}
              <div className="pointer-events-none absolute -top-12 -left-6 z-0 serif-title text-[10rem] sm:text-[14rem] font-black text-white/[0.03] select-none leading-none">
                {exhibitNum}
              </div>

              {/* Large Artwork Cinematic Frame */}
              <div className="relative z-10 w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#111116] border border-white/10 group-hover:border-[#c5a880]/60 transition-all duration-700 shadow-2xl">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Corner Label */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="editorial-number text-xs tracking-widest px-3 py-1 rounded bg-black/60 backdrop-blur-md text-[#c5a880] border border-white/10">
                    EXHIBIT {exhibitNum}
                  </span>
                </div>

                {/* Hover Reveal Monograph Prompt */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono tracking-wider text-zinc-300 group-hover:text-white group-hover:border-[#c5a880] transition-all">
                  <span>EXAMINE DOSSIER</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Museum Monograph Caption Below Artwork */}
              <div className="relative z-10 mt-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <div className="text-[11px] font-mono tracking-[0.25em] text-[#c5a880] uppercase mb-1">
                    {project.categoryLabel}
                  </div>
                  <h3 className="serif-title text-2xl sm:text-3xl text-[#f4f4f6] font-normal tracking-wide group-hover:text-[#c5a880] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1 tracking-wider">
                    {project.students.map((s) => s.name).join(', ')} &bull; {project.tools[0]} &bull; 2026
                  </p>
                </div>

                <p className="text-xs text-zinc-400 font-light max-w-sm line-clamp-2 leading-relaxed hidden md:block">
                  {project.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Timeline Indicator & Progress Line */}
      <div className="absolute bottom-8 left-8 sm:left-14 right-8 sm:right-14 z-20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-500">
          <span>SCROLL DOWN TO PROGRESS THROUGH EXHIBITS</span>
          <span className="hidden sm:inline">CLICK ANY WORK TO OPEN COMPLETE MONOGRAPH</span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full w-full bg-[#c5a880] origin-left transition-transform duration-75"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  </div>
  );
}
