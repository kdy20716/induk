'use client';

import { useState, useEffect } from 'react';
import { StudentProject } from '@/types';
import { X, ExternalLink } from 'lucide-react';

interface ProjectModalProps {
  project: StudentProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    setActiveImgIdx(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dossier Container */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0d0d10] text-[#f4f4f6] p-8 sm:p-12 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Dossier Header */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono tracking-[0.25em] text-[#c5a880] uppercase">
              EXHIBITION DOSSIER
            </span>
            <span className="text-zinc-700">&bull;</span>
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
              {project.categoryLabel}
            </span>
          </div>

          <h2 className="serif-title text-2xl sm:text-4xl text-white font-normal mb-2">
            {project.title}
          </h2>
          <p className="text-sm font-light text-zinc-400 font-mono tracking-wider">
            {project.subtitle}
          </p>
        </div>

        {/* Gallery Photography */}
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-black mb-4 border border-white/5">
          <img
            src={project.galleryImages[activeImgIdx] || project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnails */}
        {project.galleryImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8">
            {project.galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`relative h-16 w-24 rounded overflow-hidden border transition-all shrink-0 ${
                  activeImgIdx === idx
                    ? 'border-[#c5a880] opacity-100'
                    : 'border-white/10 opacity-50 hover:opacity-90'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Curatorial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-6 border-t border-white/10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-mono tracking-[0.2em] text-[#c5a880] uppercase mb-3">
                ARTIST STATEMENT &amp; WORK MONOGRAPH
              </h3>
              <p className="text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Inventory & Specifications */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase mb-3">
                TECHNICAL ATTRIBUTES &amp; TOOLCHAIN
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {project.specs.polyCount && (
                  <div>
                    <span className="text-zinc-600 block">GEOMETRY / POLYCOUNT</span>
                    <span className="text-zinc-300">{project.specs.polyCount}</span>
                  </div>
                )}
                {project.specs.engine && (
                  <div>
                    <span className="text-zinc-600 block">RENDER ENGINE</span>
                    <span className="text-zinc-300">{project.specs.engine}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-zinc-600 block mb-1">MEDIUM &amp; SOFTWARE</span>
                  <span className="text-zinc-300">{project.tools.join(' • ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creators Register */}
          <div className="p-6 rounded-lg bg-[#121217] border border-white/5 space-y-6 h-fit">
            <h3 className="text-xs font-mono tracking-[0.2em] text-zinc-400 uppercase">
              ARTISTS &amp; CREATORS
            </h3>
            <div className="space-y-4">
              {project.students.map((student, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-white text-sm">{student.name}</div>
                  <div className="text-xs text-zinc-400 font-light">{student.role}</div>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#c5a880]">
                    {student.artstation && (
                      <a
                        href={student.artstation}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        ArtStation <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {student.github && (
                      <a
                        href={student.github}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1 text-zinc-400"
                      >
                        GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  const el = document.getElementById('guestbook');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded border border-white/15 hover:border-[#c5a880] text-xs font-mono tracking-wider text-zinc-300 hover:text-white transition-all text-center"
              >
                SIGN VISITOR REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
