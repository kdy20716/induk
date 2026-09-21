'use client';

export default function ExhibitionInfo() {
  return (
    <section id="curatorial-info" className="relative w-full py-32 bg-[#09090c] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-12 mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono tracking-[0.3em] text-[#c5a880] uppercase">
              GENERAL INFORMATION
            </span>
            <span className="text-zinc-700">&bull;</span>
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
              CAMPUS EXHIBITION
            </span>
          </div>

          <h2 className="serif-title text-3xl sm:text-5xl text-[#f4f4f6] font-normal tracking-tight">
            전시 안내 및 학술 큐레이션
          </h2>
        </div>

        {/* 3 Columns Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-3 border-l border-white/10 pl-6">
            <span className="editorial-number text-xs tracking-widest text-[#c5a880]">01 / DATES</span>
            <h3 className="serif-title text-xl text-white font-normal">전시 기간 및 관람 시간</h3>
            <p className="text-xs font-mono text-zinc-300">2026. 10. 28 (수) — 11. 02 (월)</p>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              개관 시간: 매일 10:00 — 18:00 (입장 마감 17:30)<br />
              오프닝 리셉션: 10월 28일 (수) 14:00
            </p>
          </div>

          <div className="space-y-3 border-l border-white/10 pl-6">
            <span className="editorial-number text-xs tracking-widest text-[#c5a880]">02 / LOCATION</span>
            <h3 className="serif-title text-xl text-white font-normal">전시 장소</h3>
            <p className="text-xs font-mono text-zinc-300">인덕대학교 은봉관 B1 아시안홀 &amp; 갤러리</p>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              서울특별시 노원구 초안산로 12 (월계동)<br />
              지하철 1호선 월계역(인덕대학역) 3번 출구 도보 5분
            </p>
          </div>

          <div className="space-y-3 border-l border-white/10 pl-6">
            <span className="editorial-number text-xs tracking-widest text-[#c5a880]">03 / CURATORIAL</span>
            <h3 className="serif-title text-xl text-white font-normal">학과 교육 철학</h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              인덕대학교 게임&amp;VR콘텐츠디자인학과는 가상 조형 예술(ZBrush)과 인터랙티브 엔진 기술(Unreal/Unity)의 융합을 통해 디지털 미디어의 새로운 미학적 지평을 탐구합니다.
            </p>
          </div>
        </div>

        {/* Faculty & Committee Register */}
        <div className="p-8 rounded-xl bg-[#0f0f13] border border-white/5">
          <div className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mb-6">
            ACADEMIC FACULTY &amp; CURATORIAL COMMITTEE
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            <div>
              <span className="text-zinc-600 font-mono block">PROFESSOR</span>
              <p className="text-white font-medium mt-1">김철호 교수</p>
              <span className="text-zinc-500 font-light">Digital Sculpture &amp; Lookdev</span>
            </div>
            <div>
              <span className="text-zinc-600 font-mono block">PROFESSOR</span>
              <p className="text-white font-medium mt-1">이정훈 교수</p>
              <span className="text-zinc-500 font-light">Game Engine &amp; Spatial Art</span>
            </div>
            <div>
              <span className="text-zinc-600 font-mono block">PROFESSOR</span>
              <p className="text-white font-medium mt-1">박민아 교수</p>
              <span className="text-zinc-500 font-light">XR Media &amp; Interaction</span>
            </div>
            <div>
              <span className="text-zinc-600 font-mono block">COMMITTEE HEAD</span>
              <p className="text-[#c5a880] font-medium mt-1">강동현 학생</p>
              <span className="text-zinc-500 font-light">Exhibition Direction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
