'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { ModelSpec } from '@/data/artworks';
import { withBase } from '@/utils/asset';

/* ───────────── 모델 캐시: 같은 GLB는 한 번만 다운로드/파싱 ───────────── */
const cache = new Map<string, Promise<GLTF>>();
const loader = new GLTFLoader();
function loadModel(src: string) {
  const resolved = withBase(src);
  if (!cache.has(resolved)) cache.set(resolved, loader.loadAsync(resolved));
  return cache.get(resolved)!;
}
export function preloadModel(src: string) {
  loadModel(src).catch(() => cache.delete(withBase(src)));
}

const MATERIALS: Record<NonNullable<ModelSpec['material']>, () => THREE.Material> = {
  clay: () => new THREE.MeshStandardMaterial({ color: 0xb8afa2, roughness: 0.82, metalness: 0 }),
  bronze: () => new THREE.MeshStandardMaterial({ color: 0x8c6a43, roughness: 0.36, metalness: 0.88 }),
  marble: () => new THREE.MeshStandardMaterial({ color: 0xe9e5dd, roughness: 0.3, metalness: 0 }),
};

/* ───────────── 볼류메트릭 라이트 콘 (가산 혼합 셰이더) ───────────── */
function makeLightCone(height: number, radius: number) {
  const geo = new THREE.CylinderGeometry(0.06, radius, height, 48, 1, true);
  geo.translate(0, -height / 2, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0.16 }, uHeight: { value: height } },
    vertexShader: /* glsl */ `
      varying float vY; varying vec3 vN; varying vec3 vView;
      void main(){
        vY = position.y;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; uniform float uHeight;
      varying float vY; varying vec3 vN; varying vec3 vView;
      void main(){
        float along = clamp(-vY / uHeight, 0.0, 1.0);
        float edge = pow(abs(dot(vN, vView)), 1.6);
        float a = (1.0 - along) * edge * uOpacity;
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.86) * a, a);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

/* ───────────── 빛 속에 떠다니는 먼지 ───────────── */
function makeDust(count: number) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * 1.6;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 4.2;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff1d6,
    size: 0.012,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

type Variant = 'entrance' | 'room' | 'detail';

interface Props {
  model: ModelSpec;
  variant?: Variant;
  /** 0..1 — 입구 화면에서 스크롤 진행도에 따라 카메라가 물러남 */
  progressRef?: React.RefObject<number>;
  className?: string;
}

const EYE = 1.25;

export default function SculptureStage({ model, variant = 'room', progressRef, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  // three.js 객체를 React 렌더와 분리해 보관
  const api = useRef<{
    scene: THREE.Scene;
    holder: THREE.Group;
    current?: THREE.Object3D;
    zoom: number;
  } | null>(null);

  /* ── 1. 씬/렌더러 생성 (마운트 시 1회) ── */
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const dark = 0x0a0a0b;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(dark);
    scene.fog = new THREE.Fog(dark, 6, 16);

    const camera = new THREE.PerspectiveCamera(variant === 'entrance' ? 32 : 30, 1, 0.1, 50);

    // 조명: 천장 트랙 스포트 1개(그림자) + 차가운 림 + 아주 낮은 앰비언트
    scene.add(new THREE.HemisphereLight(0x9aa3b5, 0x0a0806, 0.35));
    const spot = new THREE.SpotLight(0xfff1dc, 70, 14, Math.PI / 7.5, 0.55, 1.6);
    spot.position.set(0.6, 5.6, 1.6);
    spot.target.position.set(0, EYE, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0004;
    spot.shadow.radius = 6;
    scene.add(spot, spot.target);

    const rim = new THREE.DirectionalLight(0x8fb0ff, 1.6);
    rim.position.set(-3, 2.5, -3.5);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffe2c0, 0.35);
    fill.position.set(3, 1, 3);
    scene.add(fill);

    // 바닥: 빛 웅덩이만 보이도록 어둡고 살짝 반사되는 석재
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(12, 64),
      new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.55, metalness: 0.2 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const cone = makeLightCone(5.6, 1.35);
    cone.position.copy(spot.position).setX(0.25);
    cone.lookAt(0, EYE - 1.4, 0);
    cone.rotateX(-Math.PI / 2);
    if (variant !== 'detail') scene.add(cone);

    const dust = makeDust(variant === 'detail' ? 0 : 260);
    scene.add(dust);

    const holder = new THREE.Group();
    holder.position.y = EYE;
    scene.add(holder);

    api.current = { scene, holder, zoom: 1 };

    /* ── 상호작용: 드래그로 회전 (휠은 페이지 스크롤에 양보) ── */
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let rotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onDown = (e: PointerEvent) => {
      if (variant === 'entrance') return;
      dragging = true;
      lastX = e.clientX;
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouseY = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx * 0.006;
      rotY += velocity;
    };
    const onUp = () => (dragging = false);
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);

    /* ── 크기 대응 ── */
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = wrap;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    /* ── 보일 때만 렌더 ── */
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(wrap);

    const clock = new THREE.Clock();
    let camX = 0;
    let camY = EYE + 0.05;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) {
        clock.getDelta();
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const p = progressRef?.current ?? 0;

      // 회전: 드래그 관성 + 느린 자동 회전
      if (!dragging) {
        velocity *= 0.94;
        rotY += velocity + dt * (variant === 'entrance' ? 0.12 : 0.16);
      }
      holder.rotation.y = rotY;
      holder.position.y = EYE + Math.sin(t * 0.8) * 0.035;

      // 카메라: 마우스 패럴랙스 + (입구) 스크롤 돌리
      const zoom = api.current?.zoom ?? 1;
      let dist = variant === 'entrance' ? 3.7 + p * 2.6 : variant === 'detail' ? 5.2 : 5.6;
      dist /= zoom;
      const lift = variant === 'entrance' ? -0.35 + p * 0.9 : 0.1;
      camX += (mouseX * 0.45 - camX) * 0.04;
      camY += (EYE + lift - mouseY * 0.18 - camY) * 0.04;
      camera.position.set(camX, camY, dist);
      camera.lookAt(0, EYE + (variant === 'entrance' ? 0.08 - p * 0.15 : 0), 0);

      // 먼지 흐름
      dust.rotation.y = t * 0.02;
      dust.position.y = Math.sin(t * 0.1) * 0.1;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('pointercancel', onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      api.current = null;
    };
  }, [variant, progressRef]);

  /* ── 2. 모델 교체 (렌더러는 유지) ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadModel(model.src)
      .then((gltf) => {
        const a = api.current;
        if (cancelled || !a) return;
        const root = cloneSkinned(gltf.scene);

        if (model.material) {
          const mat = MATERIALS[model.material]();
          root.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = mat;
          });
        }
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.frustumCulled = false;
          }
        });

        // 크기 정규화 + 중심 맞추기
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const s = model.size / Math.max(size.x, size.y, size.z);
        root.scale.setScalar(s);
        root.position.set(-center.x * s, -center.y * s, -center.z * s);

        const pivot = new THREE.Group();
        pivot.rotation.y = model.rotationY ?? 0;
        pivot.add(root);

        if (a.current) a.holder.remove(a.current);
        a.holder.add(pivot);
        a.current = pivot;
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [model]);

  const zoomBy = (f: number) => {
    if (api.current) api.current.zoom = Math.min(2.2, Math.max(0.8, api.current.zoom * f));
  };

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full touch-pan-y select-none ${variant !== 'entrance' ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-[1400ms] ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-px w-16 animate-pulse bg-white/40" />
        </div>
      )}
      {variant === 'detail' && (
        <div className="absolute bottom-5 right-5 flex gap-1">
          {[
            ['−', 0.85],
            ['+', 1.18],
          ].map(([l, f]) => (
            <button
              key={l as string}
              onClick={() => zoomBy(f as number)}
              className="h-9 w-9 border border-white/20 text-white/80 transition hover:border-white hover:text-white"
              aria-label={l === '+' ? '확대' : '축소'}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
