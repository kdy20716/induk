'use client';

import { useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface SpaceSpec {
  id: string;
  badge: string;
  engine: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  lightingSpec: string;
  geometrySpec: string;
  audioSpec: string;
  playableType: 'unity-webgl' | 'unreal-cinematic' | 'unity-lunar';
  previewImage: string;
  cameraAngles: { id: string; label: string; videoSrc: string; poster: string }[];
  downloadUrl?: string;
  downloadSize?: string;
}

const ENGINE_SPACES: SpaceSpec[] = [
  {
    id: 'space-unity-cyber',
    badge: 'SPACE 01 • INTERACTIVE PLAYABLE',
    engine: 'Unity 2023.3 LTS (URP)',
    title: '섹터 07: 네오서울 VR 파빌리온',
    subtitle: 'Sector 07: Neo-Seoul Cyberpunk Virtual Pavilion',
    category: '1인칭 인터랙티브 WebGL 체험관',
    description:
      '비에 젖은 어두운 아스팔트에 반사되는 네온 불빛과 홀로그램 아카이브를 1인칭 시점으로 직접 거닐며 관람하는 실시간 가상 전시장입니다. 유니티의 Reflection Probe와 실시간 포스트 프로세싱(Bloom & Tonemapping)을 최적화하여 웹 브라우저에서 60FPS로 부드럽게 탐험할 수 있습니다.',
    lightingSpec: 'Progressive Lightmapper Baked GI + Realtime Emissive Probe',
    geometrySpec: 'Modular Sci-Fi Architecture (Low-Drawcall Batching)',
    audioSpec: 'Procedural Atmospheric Rain & Synthwave Soundscape',
    playableType: 'unity-webgl',
    previewImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop',
    cameraAngles: [
      {
        id: 'cyber-main',
        label: '중앙 전시 홀',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-at-night-41544-large.mp4',
        poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop',
      },
    ],
    downloadUrl: '#download-unity',
    downloadSize: 'Windows PC Standalone (280 MB)',
  },
  {
    id: 'space-unreal-lumen',
    badge: 'SPACE 02 • HIGH FIDELITY REALTIME',
    engine: 'Unreal Engine 5.4',
    title: '루멘 성소: 나나이트 마스터 홀',
    subtitle: 'The Lumen Sanctum: Nanite Architectural Showcase',
    category: '초고화질 실시간 루멘(Lumen) 조명 전시관',
    description:
      '언리얼 엔진 5의 정점인 하드웨어 레이트레이싱 루멘(Lumen) 글로벌 일루미네이션과 나나이트(Nanite) 마이크로 폴리곤 지오메트리를 극대화한 현대 건축 미술관입니다. 천장의 원형 오큘러스(Oculus)에서 쏟아지는 수직 볼류메트릭 광선(God-Rays)과 거대한 대리석 벽면의 미세 질감을 실감나게 감상할 수 있습니다.',
    lightingSpec: 'Lumen Hardware Raytraced GI + Virtual Shadow Maps (VSM)',
    geometrySpec: 'Nanite Virtualized Micro-polygons (14,800,000 Triangles)',
    audioSpec: 'MetaSounds Spatialized 3D Acoustics & Reverb',
    playableType: 'unreal-cinematic',
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    cameraAngles: [
      {
        id: 'entrance',
        label: '01. 성소 입구 전경',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-corridor-with-light-beams-42866-large.mp4',
        poster: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
      },
      {
        id: 'oculus',
        label: '02. 중앙 오큘러스 로툰다',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-corridor-illuminated-with-white-leds-40176-large.mp4',
        poster: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop',
      },
      {
        id: 'altar',
        label: '03. 볼류메트릭 광선 회랑',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-light-in-a-dark-room-41550-large.mp4',
        poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
      },
      {
        id: 'night',
        label: '04. 심야 사이버 조명 모드',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-illuminated-tunnels-with-blue-neon-lights-42890-large.mp4',
        poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
      },
    ],
    downloadUrl: '#download-ue5',
    downloadSize: 'DirectX 12 PC Package (1.45 GB)',
  },
  {
    id: 'space-unity-lunar',
    badge: 'SPACE 03 • LUNAR & VR HORIZON',
    engine: 'Unity 2023 & OpenXR',
    title: '이지스-IV: 달 표면 & 궤도 관측 기지',
    subtitle: 'Aegis-IV: Lunar Surface & Deep Space Observatorium',
    category: '달 표면 보행 & 심우주 관측 기지',
    description:
      '인간의 발자국이 선명한 달 표면 크레이터와 지구 돋이(Earthrise)를 파노라마 돔 창문으로 마주하는 우주 관측 기지입니다. 진공 우주의 무음 음향 설계와 정밀한 PBR 월면토 질감, 지평선 너머의 태양계 행성들을 탐험할 수 있습니다.',
    lightingSpec: 'High Dynamic Range Sunlight + Earth Atmosphere Bounce',
    geometrySpec: 'Subdivided Lunar Heightmap + NASA High-Res Surface Meshes',
    audioSpec: 'Sub-bass Atmospheric Resonator & Radio Static',
    playableType: 'unity-lunar',
    previewImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1600&auto=format&fit=crop',
    cameraAngles: [
      {
        id: 'lunar-surface',
        label: '월면 보행 관측로',
        videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-34676-large.mp4',
        poster: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1600&auto=format&fit=crop',
      },
    ],
    downloadUrl: '#download-vr',
    downloadSize: 'PC VR & Windows Standalone (620 MB)',
  },
];

export default function VirtualVRShowroom() {
  const [activeTab, setActiveTab] = useState<'spaces' | 'pipeline'>('spaces');
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState(0);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSpace = ENGINE_SPACES[selectedSpaceIndex];
  const currentAngle = currentSpace.cameraAngles[selectedAngleIndex] || currentSpace.cameraAngles[0];

  const handleSelectSpace = (index: number) => {
    setSelectedSpaceIndex(index);
    setSelectedAngleIndex(0);
    setIsLivePlaying(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="vr-showroom" className="relative w-full py-32 bg-[#070709] border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Curatorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-xs font-mono tracking-[0.3em] text-[#c5a880] uppercase">
                PAVILION III &bull; GAME ENGINE PAVILION
              </span>
              <span className="text-zinc-700">&bull;</span>
              <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                ZERO-LAG HYBRID ARCHITECTURE
              </span>
            </div>
            <h2 className="serif-title text-3xl sm:text-5xl text-[#f4f4f6] font-normal tracking-tight">
              유니티 &amp; 언리얼 엔진 가상 체험관
            </h2>
            <p className="text-sm text-zinc-400 font-light mt-3 max-w-2xl leading-relaxed">
              웹 브라우저의 한계를 뛰어넘는 유니티(Unity) 1인칭 인터랙티브 WebGL 쇼룸과 언리얼 엔진 5(Unreal Engine 5) 
              루멘 실시간 실사 조명 전시관을 고화질 무지연(Zero-Lag) 온디맨드 스트림으로 즉시 체험하세요.
            </p>
          </div>

          {/* Top Switcher: Spaces vs Pipeline */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10 shrink-0">
            <button
              onClick={() => {
                setActiveTab('spaces');
                setIsLivePlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'spaces'
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>3대 엔진 가상 체험관</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('pipeline');
                setIsLivePlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'pipeline'
                  ? 'bg-[#c5a880] text-black font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>학생 빌드 연동 매뉴얼</span>
            </button>
          </div>
        </div>

        {activeTab === 'spaces' ? (
          <div>
            {/* Space 3-Button Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {ENGINE_SPACES.map((space, idx) => {
                const isSelected = idx === selectedSpaceIndex;
                return (
                  <button
                    key={space.id}
                    onClick={() => handleSelectSpace(idx)}
                    className={`text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#c5a880] shadow-lg shadow-[#c5a880]/5'
                        : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase">
                        {space.badge}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                        {space.engine.split(' ')[0]}
                      </span>
                    </div>
                    <h3 className="serif-title text-lg text-white font-medium group-hover:text-[#c5a880] transition-colors">
                      {space.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mt-1.5 line-clamp-1">
                      {space.category}
                    </p>
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Showcase Viewport */}
            <div
              ref={containerRef}
              className="relative w-full h-[580px] sm:h-[680px] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl flex flex-col justify-between"
            >
              {/* If user clicked PLAY on Unity Space */}
              {isLivePlaying ? (
                <div className="relative w-full h-full bg-black">
                  <iframe
                    src="https://simmer.io/embed/@unity/first-person"
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; pointer-lock"
                    title={currentSpace.title}
                  />

                  {/* Top Bar for Live Session */}
                  <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-white font-medium">실시간 유니티 WebGL 구동 중</span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-zinc-400">WASD 이동 / 마우스 회전</span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="p-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white hover:border-white transition-all"
                        title="전체화면"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setIsLivePlaying(false)}
                        className="px-3.5 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 backdrop-blur-md border border-red-500/30 text-white text-xs font-mono tracking-wider transition-all"
                      >
                        체험 종료
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* High-Fidelity Showcase Viewer (Zero GPU Cost until interacted) */
                <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10">
                  {/* Background Video / Imagery */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <video
                      ref={videoRef}
                      key={currentAngle.videoSrc}
                      src={currentAngle.videoSrc}
                      poster={currentAngle.poster}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
                  </div>

                  {/* Top Bar inside Viewport */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/15">
                      <span className="text-xs font-mono text-[#c5a880] uppercase tracking-wider font-semibold">
                        {currentSpace.engine}
                      </span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-xs font-mono text-zinc-300">
                        {currentSpace.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio Mute/Unmute */}
                      <button
                        onClick={toggleMute}
                        className="p-2.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white transition-all"
                        title={isMuted ? '음향 켜기' : '음향 끄기'}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-2.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white transition-all"
                        title="전체화면"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Center Launch Overlay for Playable Unity Spaces */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
                    {currentSpace.playableType === 'unity-webgl' ? (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() => setIsLivePlaying(true)}
                          className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-[#c5a880] text-black font-semibold text-sm tracking-wider shadow-2xl hover:scale-105 hover:bg-white transition-all duration-300 cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-black/10">
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </div>
                          <span>1인칭 실시간 WebGL 체험 시작</span>
                        </button>
                        <span className="text-xs font-mono text-zinc-400 tracking-wider bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                          무설치 &bull; 브라우저에서 1초 만에 즉시 실행 &bull; 60FPS
                        </span>
                      </div>
                    ) : (
                      /* Unreal Engine 5 or Lunar Showcase Angle Switcher */
                      <div className="flex flex-col items-center gap-4">
                        <span className="text-[11px] font-mono tracking-[0.25em] text-[#c5a880] uppercase bg-black/70 px-4 py-1.5 rounded-full border border-[#c5a880]/30 backdrop-blur-md">
                          UNREAL ENGINE 5 &bull; LUMEN REALTIME GI
                        </span>
                        <h3 className="serif-title text-2xl sm:text-4xl text-white font-normal max-w-xl">
                          {currentAngle.label}
                        </h3>

                        {/* Interactive Angle Switcher Buttons */}
                        {currentSpace.cameraAngles.length > 1 && (
                          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15">
                            {currentSpace.cameraAngles.map((ang, aIdx) => (
                              <button
                                key={ang.id}
                                onClick={() => setSelectedAngleIndex(aIdx)}
                                className={`px-3.5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all ${
                                  aIdx === selectedAngleIndex
                                    ? 'bg-[#c5a880] text-black font-semibold shadow-md'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                {ang.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Dossier & Specs Bar */}
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pt-6 border-t border-white/15">
                    <div className="max-w-2xl">
                      <h4 className="serif-title text-xl text-white font-medium mb-1.5">
                        {currentSpace.title}
                      </h4>
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">
                        {currentSpace.description}
                      </p>
                    </div>

                    {/* Download Package Action for Native Engine Builds */}
                    <div className="shrink-0 flex items-center gap-3">
                      <a
                        href={currentSpace.downloadUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            `${currentSpace.title} (${currentSpace.engine}) 전용 고화질 독립형 실행 파일 패키지 준비 중입니다.\n학과 졸업전시회 당일 Google Drive 및 로컬 부스에서 전체 패키지가 제공됩니다.`
                          );
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono tracking-wider transition-all"
                      >
                        <Download className="h-3.5 w-3.5 text-[#c5a880]" />
                        <span>전용 PC 빌드 다운로드</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="p-6 rounded-xl bg-[#0c0c10] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#c5a880]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-mono tracking-widest uppercase">조명 시스템 (LIGHTING)</span>
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed font-light">
                  {currentSpace.lightingSpec}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0c0c10] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#c5a880]">
                  <Layers className="h-4 w-4" />
                  <span className="text-xs font-mono tracking-widest uppercase">지오메트리 (GEOMETRY)</span>
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed font-light">
                  {currentSpace.geometrySpec}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0c0c10] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#c5a880]">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs font-mono tracking-widest uppercase">입체 음향 (SPATIAL AUDIO)</span>
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed font-light">
                  {currentSpace.audioSpec}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Student Pipeline & Local Drop-in Runner */
          <div className="p-8 sm:p-14 rounded-2xl bg-[#0c0c10] border border-white/10 text-[#f4f4f6] space-y-10">
            <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-[0.25em] text-[#c5a880] uppercase">
                  STUDENT INTEGRATION PIPELINE
                </span>
                <h3 className="serif-title text-2xl sm:text-4xl font-normal mt-2">
                  학생 유니티 &amp; 언리얼 빌드 직접 연동 매뉴얼
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-light mt-2 max-w-2xl leading-relaxed">
                  인덕대학교 게임&amp;VR콘텐츠디자인학과 학생들이 제작한 3D 환경, 조명, 인터랙션을 본 웹사이트에 
                  단 3단계로 배포하고 1인칭으로 직접 관람할 수 있는 표준 파이프라인입니다.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => {
                    alert(
                      'public/unity-build/ 폴더에 index.html 파일이 있는지 확인해 주세요.\n빌드 파일이 존재하면 즉시 본 웹사이트 뷰포트에서 1인칭 조작으로 구동됩니다.'
                    );
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c5a880] text-black font-semibold text-xs tracking-wider shadow-lg hover:bg-white transition-all cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>로컬 학생 빌드 즉시 실행 테스트</span>
                </button>
              </div>
            </div>

            {/* 3 Step Protocol Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-[#13131a] border border-white/5 space-y-3">
                <span className="editorial-number text-2xl text-[#c5a880]">01</span>
                <h4 className="font-semibold text-sm text-white">조명 베이킹 (Lightmap Baking)</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  유니티의 Progressive Lightmapper 또는 언리얼의 GPU Lightmass를 사용하여 간접광과 앰비언트 오클루전을 텍스처로 베이킹합니다. 모바일/웹에서도 60FPS 이상의 매끄러운 렌더링을 보장합니다.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#13131a] border border-white/5 space-y-3">
                <span className="editorial-number text-2xl text-[#c5a880]">02</span>
                <h4 className="font-semibold text-sm text-white">WebGL 플랫폼 빌드</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Build Settings에서 WebGL 플랫폼을 선택하고 빌드합니다. 생성된 <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded text-[11px]">Build</code>, <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded text-[11px]">TemplateData</code>, <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded text-[11px]">index.html</code> 파일을 본 프로젝트의 <code className="text-[#c5a880] bg-black/60 px-1 py-0.5 rounded text-[11px]">public/unity-build/</code> 디렉토리에 복사합니다.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#13131a] border border-white/5 space-y-3">
                <span className="editorial-number text-2xl text-[#c5a880]">03</span>
                <h4 className="font-semibold text-sm text-white">원클릭 임베드 자동 인식</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  본 웹 전시관이 해당 경로를 자동으로 감지하여 코드 수정 없이 전체화면 1인칭 가상 전시관으로 브라우저에 임베드합니다.
                </p>
              </div>
            </div>

            {/* Code Sample */}
            <div className="p-6 rounded-xl bg-black border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Next.js Zero-Lag Unity WebGL Embed Code</span>
                <span className="text-[#c5a880]">public/unity-build/index.html</span>
              </div>
              <pre className="text-xs font-mono text-zinc-300 overflow-x-auto p-4 rounded-lg bg-[#050507] border border-white/5 leading-relaxed">
{`<iframe
  src="/unity-build/index.html"
  className="w-full h-full border-0 rounded-xl"
  allow="autoplay; fullscreen; pointer-lock"
  loading="lazy"
/>`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
