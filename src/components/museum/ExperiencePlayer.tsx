'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Artwork, UnityBuild } from '@/data/artworks';
import { smoothScroll } from '@/components/SmoothScroll';
import { withBase } from '@/utils/asset';

/* ════════════════════════ Unity WebGL 플레이어 ════════════════════════ */

type UnityInstance = { Quit: () => Promise<void>; SetFullscreen: (v: 0 | 1) => void };
declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (p: number) => void
    ) => Promise<UnityInstance>;
  }
}

const loadedScripts = new Map<string, Promise<void>>();
function loadScript(src: string) {
  if (!loadedScripts.has(src)) {
    loadedScripts.set(
      src,
      new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => res();
        s.onerror = () => {
          loadedScripts.delete(src);
          rej(new Error('loader'));
        };
        document.body.appendChild(s);
      })
    );
  }
  return loadedScripts.get(src)!;
}

function UnityPlayer({ build, onError }: { build: UnityBuild; onError: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const instance = useRef<UnityInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    const base = `${withBase(build.folder)}/Build/${build.file}`;
    const ext = build.ext ?? '';
    loadScript(`${base}.loader.js`)
      .then(() =>
        window.createUnityInstance!(
          canvasRef.current!,
          {
            dataUrl: `${base}.data${ext}`,
            frameworkUrl: `${base}.framework.js${ext}`,
            codeUrl: `${base}.wasm${ext}`,
            streamingAssetsUrl: `${withBase(build.folder)}/StreamingAssets`,
            companyName: 'Induk University',
            productName: build.file,
            productVersion: '1.0',
            devicePixelRatio: Math.min(window.devicePixelRatio, 1.5),
          },
          (p) => !cancelled && setProgress(p)
        )
      )
      .then((inst) => {
        if (cancelled) inst.Quit();
        else instance.current = inst;
      })
      .catch(() => !cancelled && onError());

    return () => {
      cancelled = true;
      instance.current?.Quit().catch(() => {});
      instance.current = null;
    };
  }, [build, onError]);

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={canvasRef} id="unity-canvas" tabIndex={-1} className="h-full w-full outline-none" />
      {progress < 1 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-white">
          <p className="eyebrow text-white/50">Loading Unity WebGL</p>
          <div className="h-px w-64 bg-white/15">
            <div className="h-px bg-white transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="font-display text-sm text-white/40">{Math.round(progress * 100)}%</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════ 360° 미리보기 ════════════════════════ */

function PanoViewer({ src, type }: { src: string; type: 'image' | 'video' }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);

    let video: HTMLVideoElement | null = null;
    let texture: THREE.Texture;
    if (type === 'video') {
      video = document.createElement('video');
      video.src = withBase(src);
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
      texture = new THREE.VideoTexture(video);
    } else {
      texture = new THREE.TextureLoader().load(withBase(src));
    }
    texture.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.SphereGeometry(500, 64, 40);
    geo.scale(-1, 1, 1);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture }));
    scene.add(mesh);

    let lon = 0;
    let lat = 0;
    let tLon = 0;
    let tLat = 0;
    let down = false;
    let sx = 0;
    let sy = 0;
    let idle = true;
    const onDown = (e: PointerEvent) => {
      down = true;
      idle = false;
      sx = e.clientX;
      sy = e.clientY;
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      tLon -= (e.clientX - sx) * 0.12;
      tLat += (e.clientY - sy) * 0.12;
      sx = e.clientX;
      sy = e.clientY;
    };
    const onUp = () => (down = false);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.03, 35, 90);
      camera.updateProjectionMatrix();
    };
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('wheel', onWheel, { passive: false });

    const resize = () => {
      renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
      camera.aspect = wrap.clientWidth / wrap.clientHeight;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (idle) tLon += 0.03;
      tLat = THREE.MathUtils.clamp(tLat, -80, 80);
      lon += (tLon - lon) * 0.1;
      lat += (tLat - lat) * 0.1;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('wheel', onWheel);
      video?.pause();
      texture.dispose();
      geo.dispose();
      renderer.dispose();
    };
  }, [src, type]);

  return (
    <div ref={wrapRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* ════════════════════════ 체험 오버레이 ════════════════════════ */

type Mode = 'checking' | 'unity' | 'iframe' | 'pano' | 'none';

export default function ExperiencePlayer({ work, onClose }: { work: Artwork; onClose: () => void }) {
  const exp = work.experience!;
  const [mode, setMode] = useState<Mode>('checking');
  const rootRef = useRef<HTMLDivElement>(null);
  const fallback: Mode = exp.iframeUrl ? 'iframe' : exp.pano ? 'pano' : 'none';

  // 빌드 파일이 실제로 있는지 확인 → 없으면 외부 URL / 360° 미리보기로 대체
  useEffect(() => {
    let alive = true;
    if (!exp.unity) {
      setMode(fallback);
      return;
    }
    fetch(`${withBase(exp.unity.folder)}/Build/${exp.unity.file}.loader.js`, { method: 'HEAD' })
      .then((r) => alive && setMode(r.ok ? 'unity' : fallback))
      .catch(() => alive && setMode(fallback));
    return () => {
      alive = false;
    };
  }, [exp, fallback]);

  // 열려 있는 동안 페이지 스크롤 정지 + ESC 닫기
  useEffect(() => {
    smoothScroll.stop();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.pointerLockElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      smoothScroll.start();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen().catch(() => {});
  };

  return (
    <div ref={rootRef} className="fixed inset-0 z-[70] flex flex-col bg-black text-white animate-[fadeIn_.6s_ease]" data-lenis-prevent>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-baseline gap-4 overflow-hidden">
          <span className="font-display text-sm text-brass">{work.no}</span>
          <span className="truncate font-serif">{work.title}</span>
          <span className="hidden text-xs text-white/40 md:inline">{exp.controls}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fullscreen} className="eyebrow border border-white/20 px-3 py-2 hover:border-white">
            Fullscreen
          </button>
          <button onClick={onClose} className="eyebrow border border-white/20 px-3 py-2 hover:border-white">
            Exit
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {mode === 'checking' && <div className="absolute inset-0 flex items-center justify-center text-white/40">…</div>}
        {mode === 'unity' && <UnityPlayer build={exp.unity!} onError={() => setMode(fallback)} />}
        {mode === 'iframe' && (
          <iframe src={exp.iframeUrl} className="h-full w-full border-0" allow="autoplay; fullscreen; pointer-lock; gamepad; xr-spatial-tracking" />
        )}
        {mode === 'pano' && (
          <>
            <PanoViewer src={exp.pano!.src} type={exp.pano!.type} />
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 text-center text-xs text-white/70 backdrop-blur">
              360° 미리보기 · 드래그로 둘러보기 · 휠로 확대
              {exp.unity && <span className="block text-white/40">유니티 빌드를 {exp.unity.folder}/ 에 넣으면 실제 체험으로 바뀝니다</span>}
            </div>
          </>
        )}
        {mode === 'none' && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="font-serif text-2xl">체험 빌드 준비 중입니다</p>
            <p className="text-sm text-white/50">
              전시 기간 중 현장 부스에서 체험하실 수 있습니다.
              {exp.unity && <span className="mt-1 block text-white/35">빌드 위치: public{exp.unity.folder}/Build/</span>}
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
