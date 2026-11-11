import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import { WORKS, SHOWREEL } from './data.js';
import { createPaintingMaterial } from './shaders.js';
import {
  textSign, plaqueTexture, woodTexture, FONTS,
  marbleFloorTexture, plasterTexture, damaskTexture, cofferTexture, classicDoorTexture,
} from './textures.js';
import { paintPlaceholder } from './paintings.js';
import { ExhibitionAudio } from './audio.js';

/* =====================================================================
 *  고전 미술관 레이아웃
 *  - 로비(대리석 홀) → 영상 액자 → 갤러리 대문 → 작품 회랑(양쪽 벽) → 엔딩
 *  - 반사 바닥 / 블룸 / 빔 광선 같은 눈부신 효과는 모두 제거했습니다.
 * ===================================================================== */
const LOBBY = { x: 11, zBack: -12, zFront: 14, h: 8 };
const DOOR = { w: 4.4, h: 5.6 };
const PAIR_GAP = 7.2;
const PAIRS = Math.ceil(WORKS.length / 2);
const HALL = { x: 6, zStart: LOBBY.zBack - 0.3, h: 6.2 };
HALL.firstZ = HALL.zStart - 6.2;
HALL.zEnd = HALL.firstZ - (PAIRS - 1) * PAIR_GAP - 8.5;
const FRAME_Y = 2.6;
const FRAME_Z = (i) => HALL.firstZ - Math.floor(i / 2) * PAIR_GAP;
const FRAME_SIDE = (i) => (i % 2 === 0 ? -1 : 1); // -1 = 왼쪽 벽, +1 = 오른쪽 벽

const VIDEO = { w: 6.4, h: 3.6, y: 3.7, z: -3.8 }; // 로비 왼쪽 벽 영상 액자
const STOP_FIRST_WORK = 3;
const MAX_STOP = STOP_FIRST_WORK + WORKS.length; // 마지막 = 엔딩

const CHAPTERS = [
  { label: 'LOBBY', ko: '중앙 홀' },
  { label: 'FILM', ko: '전시 영상' },
  { label: 'GALLERY', ko: '갤러리 입구' },
  ...WORKS.map((w) => ({ label: `No.${w.no}`, ko: w.title })),
  { label: 'FIN', ko: '관람 종료' },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

/* =====================================================================
 *  DOM
 * ===================================================================== */
const $ = (s) => document.querySelector(s);
const canvas = $('#scene');
const ui = {
  loader: $('#loader'),
  bar: $('#loaderBar'),
  pct: $('#loaderPct'),
  enterSound: $('#enterSound'),
  enterMute: $('#enterMute'),
  soundBtn: $('#soundBtn'),
  nav: $('#chapterNav'),
  progress: $('#progressFill'),
  hint: $('#scrollHint'),
  captions: [...document.querySelectorAll('[data-stop]')],
  placard: $('#placard'),
  cursor: $('#cursor'),
  cursorLabel: $('#cursorLabel'),
  warp: $('#warp'),
  nowPlaying: $('#nowPlaying'),
  stopLabel: $('#stopLabel'),
};
const finale = $('#finaleCaption');
if (finale) finale.dataset.stop = String(MAX_STOP);

/* =====================================================================
 *  렌더러 / 씬 / 카메라 (후처리 없음 → 번짐·깨짐 없는 선명한 화면)
 * ===================================================================== */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const PR = Math.min(window.devicePixelRatio, 1.5);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1612);
scene.fog = new THREE.Fog(0x1a1612, 38, 95);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 160);
camera.rotation.order = 'YXZ';
const BASE_FOV = 45;

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const manager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./vendor/three/addons/libs/draco/');
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

const texLoader = new THREE.TextureLoader(manager);
const loadTex = (url, onLoad) => {
  const t = texLoader.load(url, onLoad);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
};

const audio = new ExhibitionAudio();

/* =====================================================================
 *  머티리얼 — 모두 무광/저광택 (눈부심 방지)
 * ===================================================================== */
const ANISO = renderer.capabilities.getMaxAnisotropy();
const tune = (t, rx, ry) => { t.anisotropy = ANISO; if (rx) t.repeat.set(rx, ry ?? rx); return t; };

const M = {
  plaster: new THREE.MeshStandardMaterial({ map: tune(plasterTexture('#d9cfbb', 3)), roughness: 0.95 }),
  plasterDark: new THREE.MeshStandardMaterial({ map: tune(plasterTexture('#bfb39c', 2)), roughness: 0.95 }),
  marbleDado: new THREE.MeshStandardMaterial({ map: tune(plasterTexture('#6d5a48', 2)), roughness: 0.7 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.85 }),
  stoneShade: new THREE.MeshStandardMaterial({ color: 0xcfc3ad, roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ map: tune(cofferTexture('#e4dac7')), roughness: 1 }),
  damask: new THREE.MeshStandardMaterial({ map: tune(damaskTexture('#26352c', 'rgba(255,236,190,0.05)')), roughness: 0.95 }),
  panelWhite: new THREE.MeshStandardMaterial({ color: 0xe8e0cf, roughness: 0.85 }),
  // 금박 몰딩: 금속감은 살리되 거울처럼 번쩍이지 않도록 거칠기를 높임
  gold: new THREE.MeshStandardMaterial({ color: 0xa07c45, metalness: 0.65, roughness: 0.46, envMap: envTex, envMapIntensity: 0.35 }),
  brass: new THREE.MeshStandardMaterial({ color: 0x9c7a45, metalness: 0.6, roughness: 0.5, envMap: envTex, envMapIntensity: 0.3 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.7 }),
  velvet: new THREE.MeshStandardMaterial({ color: 0x6b1c22, roughness: 1 }),
  liner: new THREE.MeshStandardMaterial({ color: 0x1b1712, roughness: 1 }),
  glowSoft: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.88, 0.74), toneMapped: false }),
};

function box(w, h, d, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
function plane(w, h, mat, parent = scene) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  parent.add(m);
  return m;
}
function cyl(rt, rb, h, mat, x, y, z, parent = scene, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
function signMesh(tex, w, h, parent = scene, opts = {}) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.8, metalness: opts.metal ?? 0 });
  const m = plane(w, h, mat, parent);
  m.renderOrder = 2;
  return m;
}

/** 사각 액자 몰딩 (구멍 뚫린 사각형을 베벨로 돌출) */
function frameGeometry(ow, oh, iw, ih, depth = 0.08, bevel = 0.05) {
  const shape = new THREE.Shape();
  shape.moveTo(-ow / 2, -oh / 2); shape.lineTo(ow / 2, -oh / 2); shape.lineTo(ow / 2, oh / 2); shape.lineTo(-ow / 2, oh / 2); shape.lineTo(-ow / 2, -oh / 2);
  const hole = new THREE.Path();
  hole.moveTo(-iw / 2, -ih / 2); hole.lineTo(-iw / 2, ih / 2); hole.lineTo(iw / 2, ih / 2); hole.lineTo(iw / 2, -ih / 2); hole.lineTo(-iw / 2, -ih / 2);
  shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3 });
}

/** 액자 세트: 바깥 금박 + 안쪽 가는 금박 + 짙은 매트 */
function buildFrameSet(parent, w, h, { outer = 0.3, mat = 0.1 } = {}) {
  const iw = w + mat * 2, ih = h + mat * 2;
  const ow = iw + outer * 2, oh = ih + outer * 2;
  const frame = new THREE.Mesh(frameGeometry(ow, oh, iw, ih, 0.1, 0.06), M.gold);
  frame.position.z = 0.02;
  parent.add(frame);
  const lip = new THREE.Mesh(frameGeometry(iw + 0.06, ih + 0.06, iw - 0.04, ih - 0.04, 0.04, 0.015), M.gold);
  lip.position.z = 0.1;
  parent.add(lip);
  const liner = plane(iw, ih, M.liner, parent);
  liner.position.z = 0.06;
  return { ow, oh, frame, lip, liner };
}

/* =====================================================================
 *  바닥 — 무광 체커 대리석 (로비) / 헤링본 느낌 원목 (갤러리)
 * ===================================================================== */
{
  const lobbyD = LOBBY.zFront - LOBBY.zBack;
  const marble = tune(marbleFloorTexture({ light: '#ddd5c6', dark: '#62574c' }), (LOBBY.x * 2) / 4.8, lobbyD / 4.8);
  const lf = plane(LOBBY.x * 2, lobbyD, new THREE.MeshStandardMaterial({ map: marble, roughness: 0.6, metalness: 0 }));
  lf.rotation.x = -Math.PI / 2;
  lf.position.set(0, 0, (LOBBY.zFront + LOBBY.zBack) / 2);

  const hallD = HALL.zStart - HALL.zEnd;
  const wood = tune(woodTexture(), 2.4, hallD / 4.2);
  const hf = plane(HALL.x * 2, hallD, new THREE.MeshStandardMaterial({ map: wood, roughness: 0.75, color: 0xc9b7a2 }));
  hf.rotation.x = -Math.PI / 2;
  hf.position.set(0, 0, (HALL.zStart + HALL.zEnd) / 2);
  // 회랑 중앙 카펫 러너
  const rug = plane(2.2, hallD - 3, M.velvet);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.006, (HALL.zStart + HALL.zEnd) / 2 - 0.5);
  for (const s of [-1, 1]) {
    const edge = plane(0.08, hallD - 3, M.gold);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(s * 1.06, 0.008, (HALL.zStart + HALL.zEnd) / 2 - 0.5);
  }
}

/* =====================================================================
 *  로비 건축 — 크림색 석회벽, 기둥, 격자 천장, 고전 포털
 * ===================================================================== */
const lobbyGroup = new THREE.Group();
scene.add(lobbyGroup);
{
  const { x: LX, zBack: ZB, zFront: ZF, h: H } = LOBBY;
  const D = ZF - ZB;
  const cz = (ZF + ZB) / 2;

  // 벽
  for (const s of [-1, 1]) {
    const w = plane(D, H, M.plaster, lobbyGroup);
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * LX, H / 2, cz);
    // 하부 대리석 징두리 + 몰딩
    box(0.08, 1.15, D, M.marbleDado, s * (LX - 0.04), 0.575, cz, lobbyGroup);
    box(0.14, 0.07, D, M.stone, s * (LX - 0.07), 1.18, cz, lobbyGroup);
    box(0.16, 0.18, D, M.stoneShade, s * (LX - 0.08), 0.09, cz, lobbyGroup);
    // 상부 코니스
    box(0.3, 0.22, D, M.stone, s * (LX - 0.15), H - 0.11, cz, lobbyGroup);
    box(0.18, 0.08, D, M.gold, s * (LX - 0.09), H - 0.32, cz, lobbyGroup);
  }
  const fw = plane(LX * 2, H, M.plasterDark, lobbyGroup);
  fw.rotation.y = Math.PI;
  fw.position.set(0, H / 2, ZF);

  // 천장 (코퍼 격자)
  const ceilMat = M.ceiling.clone();
  ceilMat.map = M.ceiling.map.clone();
  ceilMat.map.needsUpdate = true;
  ceilMat.map.repeat.set((LX * 2) / 2.6, D / 2.6);
  const ceil = plane(LX * 2, D, ceilMat, lobbyGroup);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, cz);

  // 뒷벽 (문 개구부 제외)
  const side = LX - DOOR.w / 2;
  box(side, H, 0.6, M.plaster, -(DOOR.w / 2 + side / 2), H / 2, ZB, lobbyGroup);
  box(side, H, 0.6, M.plaster, DOOR.w / 2 + side / 2, H / 2, ZB, lobbyGroup);
  box(DOOR.w, H - DOOR.h, 0.6, M.plaster, 0, DOOR.h + (H - DOOR.h) / 2, ZB, lobbyGroup);
  for (const s of [-1, 1]) box(side, 1.15, 0.7, M.marbleDado, s * (DOOR.w / 2 + side / 2), 0.575, ZB + 0.01, lobbyGroup);

  // 좌우 벽 필라스터 (벽기둥)
  const pilaster = (x, z, rotY) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    lobbyGroup.add(g);
    box(0.8, 0.5, 0.36, M.stoneShade, 0, 0.25, 0, g);
    box(0.62, H - 1.3, 0.24, M.stone, 0, (H - 1.3) / 2 + 0.5, 0, g);
    for (let k = -2; k <= 2; k++) box(0.05, H - 1.6, 0.02, M.stoneShade, k * 0.11, (H - 1.3) / 2 + 0.5, 0.125, g);
    box(0.86, 0.22, 0.4, M.stoneShade, 0, H - 0.69, 0, g);
    box(0.74, 0.08, 0.32, M.gold, 0, H - 0.84, 0, g);
  };
  // 영상 액자(왼쪽)와 전시 타이틀(오른쪽)이 걸리는 z = -3.8 칸은 비워 둠
  for (const z of [ZB + 2.2, ZB + 14.2, ZB + 20.2]) {
    pilaster(-LX + 0.12, z, Math.PI / 2);
    pilaster(LX - 0.12, z, -Math.PI / 2);
  }

  // 갤러리 포털: 기둥 2개 + 엔타블러처 + 페디먼트
  const PZ = ZB + 0.55;
  for (const s of [-1, 1]) {
    const x = s * (DOOR.w / 2 + 0.75);
    box(1.0, 0.45, 1.0, M.stoneShade, x, 0.225, PZ, lobbyGroup);
    cyl(0.32, 0.36, DOOR.h - 0.45, M.stone, x, 0.45 + (DOOR.h - 0.45) / 2, PZ, lobbyGroup, 24);
    box(0.95, 0.28, 0.95, M.stoneShade, x, DOOR.h + 0.02, PZ, lobbyGroup);
  }
  box(DOOR.w + 3.0, 0.75, 1.1, M.stone, 0, DOOR.h + 0.5, PZ, lobbyGroup);
  box(DOOR.w + 3.2, 0.1, 1.2, M.gold, 0, DOOR.h + 0.9, PZ, lobbyGroup);
  {
    const tri = new THREE.Shape();
    const tw = (DOOR.w + 3.2) / 2;
    tri.moveTo(-tw, 0); tri.lineTo(tw, 0); tri.lineTo(0, 1.05); tri.lineTo(-tw, 0);
    const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.9, bevelEnabled: false }), M.stone);
    ped.position.set(0, DOOR.h + 0.95, PZ - 0.45);
    lobbyGroup.add(ped);
  }

  // 샹들리에 (작은 전구 링 — 블룸 없이 은은하게)
  const chand = new THREE.Group();
  chand.position.set(0, H - 1.6, 2.6);
  lobbyGroup.add(chand);
  box(0.04, 1.2, 0.04, M.brass, 0, 0.9, 0, chand);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.04, 8, 64), M.brass);
  ring.rotation.x = Math.PI / 2;
  chand.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.035, 8, 48), M.brass);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = -0.35;
  chand.add(ring2);
  const bulbGeo = new THREE.SphereGeometry(0.06, 12, 8);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = new THREE.Mesh(bulbGeo, M.glowSoft);
    b.position.set(Math.cos(a) * 1.1, 0.1, Math.sin(a) * 1.1);
    chand.add(b);
  }
}

/* =====================================================================
 *  로비 중앙 — 대리석 조각상
 * ===================================================================== */
const hero = new THREE.Group();
hero.position.set(0, 0, 2.6);
scene.add(hero);
let heroSculpture = null;
{
  box(2.3, 0.3, 2.3, M.stoneShade, 0, 0.15, 0, hero);
  box(1.75, 1.0, 1.75, M.stone, 0, 0.8, 0, hero);
  box(2.05, 0.18, 2.05, M.stoneShade, 0, 1.39, 0, hero);
  box(1.8, 0.05, 0.02, M.gold, 0, 1.2, 0.88, hero);
  const plaque = signMesh(textSign([
    { text: 'NEMETONA', font: `600 120px ${FONTS.SERIF}`, y: 110, color: '#3b2e1e', spacing: 24 },
    { text: '성소의 여신 · 대리석 조각 (복제)', font: `500 54px ${FONTS.SANS}`, y: 220, color: '#5c4a33', spacing: 4 },
  ], { w: 1400, h: 300 }), 1.5, 1.5 * 300 / 1400, hero);
  plaque.position.set(0, 0.8, 0.876);
}

gltfLoader.load('assets/models/nemetona.glb', (gltf) => {
  const model = gltf.scene;
  const box3 = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box3.getSize(size);
  const scale = 3.0 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  const center = new THREE.Vector3();
  box3.getCenter(center);
  model.position.set(-center.x * scale, -box3.min.y * scale + 1.48, -center.z * scale);
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2dccf, roughness: 0.72, metalness: 0, envMap: envTex, envMapIntensity: 0.25 });
  model.traverse((c) => {
    if (c.isMesh) {
      c.material = marbleMat;
      c.userData.isHero = true;
    }
  });
  hero.add(model);
  heroSculpture = model;
});

/* =====================================================================
 *  로비 왼쪽 벽 — 금박 액자 속 영상 (16:9 안에 원본 비율 그대로 맞춤)
 * ===================================================================== */
const video = document.createElement('video');
video.muted = true;
video.playsInline = true;
video.preload = 'auto';
video.crossOrigin = 'anonymous';
let reelIndex = 0;
function loadReel(i) {
  reelIndex = (i + SHOWREEL.length) % SHOWREEL.length;
  video.src = SHOWREEL[reelIndex].src;
  video.load();
  if (ui.nowPlaying) ui.nowPlaying.textContent = SHOWREEL[reelIndex].title;
}
video.addEventListener('ended', () => {
  loadReel(reelIndex + 1);
  if (state.videoWanted) video.play().catch(() => {});
});
video.addEventListener('loadedmetadata', () => {
  if (video.videoWidth) screenMat.uniforms.uVideoAspect.value = video.videoWidth / video.videoHeight;
});
loadReel(0);
const videoTex = new THREE.VideoTexture(video);
videoTex.colorSpace = THREE.SRGBColorSpace;

const screenMat = new THREE.ShaderMaterial({
  toneMapped: false,
  uniforms: {
    uMap: { value: videoTex },
    uOn: { value: 0 },
    uVideoAspect: { value: 16 / 9 },
    uScreenAspect: { value: VIDEO.w / VIDEO.h },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D uMap; uniform float uOn, uVideoAspect, uScreenAspect; varying vec2 vUv;
    void main(){
      // contain: 영상이 잘리거나 확대되지 않도록 화면 안에 원본 비율 그대로 배치
      vec2 uv = vUv - 0.5;
      float r = uVideoAspect / uScreenAspect;
      if (r > 1.0) uv.y *= r; else uv.x /= r;
      uv += 0.5;
      float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
      vec3 v = texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb * 0.92;
      vec3 col = mix(vec3(0.025, 0.022, 0.02), v * inside + vec3(0.02) * (1.0 - inside), uOn);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
});
const screenGroup = new THREE.Group();
screenGroup.position.set(-LOBBY.x + 0.12, VIDEO.y, VIDEO.z);
screenGroup.rotation.y = Math.PI / 2;
scene.add(screenGroup);
{
  const screenMesh = plane(VIDEO.w, VIDEO.h, screenMat, screenGroup);
  screenMesh.position.z = 0.07;
  buildFrameSet(screenGroup, VIDEO.w, VIDEO.h, { outer: 0.34, mat: 0.12 });
  const label = signMesh(textSign([
    { text: 'EXHIBITION FILM', font: `600 96px ${FONTS.SERIF}`, y: 90, color: '#3b2e1e', spacing: 20 },
    { text: '전시 소개 영상', font: `500 54px ${FONTS.SANS}`, y: 190, color: '#6a5539', spacing: 8 },
  ], { w: 1400, h: 260 }), 2.4, 2.4 * 260 / 1400, screenGroup);
  label.position.set(0, -VIDEO.h / 2 - 0.85, 0.02);
}

/* =====================================================================
 *  로비 오른쪽 벽 — 전시 타이틀 각인
 * ===================================================================== */
function buildSigns() {
  const title = signMesh(textSign([
    { text: 'INDUK UNIVERSITY', font: `600 150px ${FONTS.SERIF}`, y: 150, color: '#4a3a26', spacing: 40 },
    { text: 'GRADUATION EXHIBITION 2026', font: `500 76px ${FONTS.SERIF}`, y: 300, color: '#7a5f3a', spacing: 24 },
    { text: '인덕대학교 졸업 작품 전시회', font: `500 64px ${FONTS.SANS}`, y: 420, color: '#5c4a33', spacing: 14 },
  ], { w: 2048, h: 520 }), 7.6, 7.6 * 520 / 2048, lobbyGroup);
  title.rotation.y = -Math.PI / 2;
  title.position.set(LOBBY.x - 0.05, 4.6, VIDEO.z);

  const gate = signMesh(textSign([
    { text: 'GALLERY OF WORKS', font: `600 120px ${FONTS.SERIF}`, y: 100, color: '#3d2f1f', spacing: 30 },
  ], { w: 2048, h: 200 }), 5.6, 5.6 * 200 / 2048, lobbyGroup);
  gate.position.set(0, DOOR.h + 0.5, LOBBY.zBack + 1.12);

  const end = signMesh(textSign([
    { text: 'THANK YOU', font: `600 200px ${FONTS.SERIF}`, y: 190, color: '#f0e3c4', spacing: 40 },
    { text: 'FOR VISITING THE EXHIBITION', font: `500 64px ${FONTS.SERIF}`, y: 340, color: '#d4b47a', spacing: 20 },
    { text: '인덕대학교 졸업 작품 전시회 · 2026', font: `400 54px ${FONTS.SANS}`, y: 450, color: '#bfae8c', spacing: 8 },
  ], { w: 2048, h: 540 }), 6.4, 6.4 * 540 / 2048, hallGroup);
  end.position.set(0, 3.4, HALL.zEnd + 0.08);
}

/* =====================================================================
 *  갤러리 대문 (원목 양문)
 * ===================================================================== */
const doorMat = new THREE.MeshStandardMaterial({ map: classicDoorTexture(), roughness: 0.65, metalness: 0.05 });
const doorPivots = [-1, 1].map((s) => {
  const pivot = new THREE.Group();
  pivot.position.set(s * DOOR.w / 2, 0, LOBBY.zBack + 0.1);
  scene.add(pivot);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w / 2, DOOR.h, 0.14), [M.darkWood, M.darkWood, M.darkWood, M.darkWood, doorMat, doorMat]);
  panel.position.set(-s * DOOR.w / 4, DOOR.h / 2, 0);
  pivot.add(panel);
  const ringHandle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 24), M.brass);
  ringHandle.position.set(-s * (DOOR.w / 2 - 0.3), DOOR.h / 2 - 0.3, 0.1);
  pivot.add(ringHandle);
  return { pivot, s };
});

/* =====================================================================
 *  작품 회랑 — 다마스크 벽, 흰 징두리 판넬, 천창
 * ===================================================================== */
const hallGroup = new THREE.Group();
scene.add(hallGroup);
{
  const { x: HX, zStart: ZS, zEnd: ZE, h: H } = HALL;
  const D = ZS - ZE;
  const cz = (ZS + ZE) / 2;
  const wallMat = M.damask.clone();
  wallMat.map = M.damask.map.clone();
  wallMat.map.needsUpdate = true;
  wallMat.map.repeat.set(D / 1.2, (H - 1.1) / 1.2);
  for (const s of [-1, 1]) {
    const w = plane(D, H - 1.1, wallMat, hallGroup);
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * HX, 1.1 + (H - 1.1) / 2, cz);
    box(0.06, 1.1, D, M.panelWhite, s * (HX - 0.03), 0.55, cz, hallGroup);
    for (let z = ZS - 0.8; z > ZE + 0.5; z -= 1.6) box(0.02, 0.62, 1.2, M.stoneShade, s * (HX - 0.065), 0.58, z - 0.8, hallGroup);
    box(0.12, 0.06, D, M.gold, s * (HX - 0.06), 1.12, cz, hallGroup);
    box(0.12, 0.16, D, M.darkWood, s * (HX - 0.06), 0.08, cz, hallGroup);
    box(0.32, 0.26, D, M.panelWhite, s * (HX - 0.16), H - 0.13, cz, hallGroup);
    box(0.14, 0.06, D, M.gold, s * (HX - 0.07), H - 0.32, cz, hallGroup);
    // 그림 거는 레일
    box(0.04, 0.04, D, M.brass, s * (HX - 0.03), H - 0.45, cz, hallGroup);
  }
  // 끝 벽 (아치 장식)
  const ew = plane(HX * 2, H, M.damask.clone(), hallGroup);
  ew.material.map = M.damask.map.clone();
  ew.material.map.needsUpdate = true;
  ew.material.map.repeat.set((HX * 2) / 1.2, H / 1.2);
  ew.position.set(0, H / 2, ZE);
  box(HX * 2, 1.1, 0.06, M.panelWhite, 0, 0.55, ZE + 0.03, hallGroup);
  box(HX * 2, 0.06, 0.12, M.gold, 0, 1.12, ZE + 0.06, hallGroup);
  // 입구 쪽 벽 (문 개구부)
  const side = HX - DOOR.w / 2;
  for (const s of [-1, 1]) {
    const p = plane(side, H, M.damask, hallGroup);
    p.position.set(s * (DOOR.w / 2 + side / 2), H / 2, ZS);
    p.rotation.y = Math.PI;
  }

  // 천장 + 중앙 천창(라이트 박스)
  const ceilMat = M.ceiling.clone();
  ceilMat.map = M.ceiling.map.clone();
  ceilMat.map.needsUpdate = true;
  ceilMat.map.repeat.set((HX * 2) / 2.4, D / 2.4);
  const ceil = plane(HX * 2, D, ceilMat, hallGroup);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, cz);
  const sky = plane(3.2, D - 4, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.72, 0.68, 0.6), toneMapped: false }), hallGroup);
  sky.rotation.x = Math.PI / 2;
  sky.position.set(0, H - 0.02, cz);
  for (let z = ZS - 2; z > ZE + 2; z -= 1.6) box(3.3, 0.08, 0.08, M.gold, 0, H - 0.05, z, hallGroup);
  for (const s of [-1, 1]) box(0.1, 0.1, D - 4, M.gold, s * 1.65, H - 0.06, cz, hallGroup);

  // 벤치 (짝 사이마다)
  for (let k = 0; k < PAIRS - 1; k++) {
    const z = HALL.firstZ - k * PAIR_GAP - PAIR_GAP / 2;
    box(1.0, 0.16, 2.6, M.velvet, 0, 0.5, z, hallGroup);
    box(1.06, 0.06, 2.66, M.darkWood, 0, 0.4, z, hallGroup);
    for (const dx of [-0.42, 0.42]) for (const dz of [-1.15, 1.15]) box(0.08, 0.38, 0.08, M.darkWood, dx, 0.19, z + dz, hallGroup);
  }
}

/* --- 액자 + 그림 + 명패 + 그림 조명 + 관람 차단줄 --- */
const paintings = [];
function paintingTexture(work) {
  if (work.image) {
    const holder = { tex: null, ready: false, onLoad: null };
    holder.tex = loadTex(work.image, () => holder.onLoad && holder.onLoad());
    return holder;
  }
  const c = paintPlaceholder(Number(work.no), { width: 768 });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = ANISO;
  return { tex, ready: true };
}

function stanchionRope(parent, z0, z1, x) {
  for (const z of [z0, z1]) {
    cyl(0.03, 0.03, 0.95, M.brass, x, 0.475, z, parent, 12);
    cyl(0.16, 0.18, 0.04, M.brass, x, 0.02, z, parent, 24);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), M.brass);
    knob.position.set(x, 0.98, z);
    parent.add(knob);
  }
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push(new THREE.Vector3(x, 0.9 - Math.sin(t * Math.PI) * 0.16, lerp(z0, z1, t)));
  }
  const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.022, 8), M.velvet);
  parent.add(rope);
}

function buildFrame(work, index) {
  const texInfo = paintingTexture(work);
  const { tex, ready } = texInfo;
  const side = FRAME_SIDE(index);
  const z = FRAME_Z(index);
  const group = new THREE.Group();
  group.position.set(side * (HALL.x - 0.02), FRAME_Y, z);
  group.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  hallGroup.add(group);

  const mat = createPaintingMaterial(tex, 1.33);
  mat.toneMapped = false;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 96, 72), mat);
  mesh.position.z = 0.075;
  group.add(mesh);
  const frameHolder = new THREE.Group();
  group.add(frameHolder);

  // 벽 옆 작은 명패
  const plaque = plane(0.66, 0.66 * 340 / 1024, new THREE.MeshStandardMaterial({ map: plaqueTexture(work), roughness: 0.6 }), group);
  // 그림 조명 (황동 픽처 라이트)
  const lamp = new THREE.Group();
  group.add(lamp);
  box(0.9, 0.06, 0.08, M.brass, 0, 0, 0.36, lamp);
  box(0.03, 0.03, 0.34, M.brass, 0, 0.04, 0.17, lamp);
  box(0.8, 0.01, 0.04, M.glowSoft, 0, -0.035, 0.37, lamp);

  const spot = new THREE.SpotLight(0xffe9c9, 0, 9, 0.42, 0.75, 1.6);
  const spotTarget = new THREE.Object3D();
  group.add(spotTarget);
  spot.target = spotTarget;
  spot.position.set(side * (HALL.x - 2.6), HALL.h - 0.4, z);
  scene.add(spot);

  // 관람 차단줄 (액자 앞 1m)
  stanchionRope(hallGroup, z - 1.7, z + 1.7, side * (HALL.x - 1.1));

  const P = { mesh, work, index, group, w: 1, h: 1, ow: 1, oh: 1, spot, mat, side, z };
  mesh.userData.workIndex = index;
  paintings.push(P);

  P.layout = () => {
    const img = tex.image;
    const a = img && img.width ? img.width / img.height : 4 / 3;
    let w = 2.7, h = w / a;
    if (h > 2.25) { h = 2.25; w = h * a; }
    P.w = w; P.h = h;
    mesh.scale.set(w, h, 1);
    mat.uniforms.uAspect.value = a;
    frameHolder.clear();
    const f = buildFrameSet(frameHolder, w, h, { outer: 0.24, mat: 0.12 });
    P.ow = f.ow; P.oh = f.oh;
    if (plaque.material.map) plaque.material.map.dispose();
    plaque.material.map = plaqueTexture(work);
    plaque.material.needsUpdate = true;
    plaque.position.set(f.ow / 2 + 0.55, 1.45 - FRAME_Y, 0.01);
    lamp.position.set(0, f.oh / 2 + 0.12, 0);
    spotTarget.position.set(0, -0.15, 0);
    buildKeys();
  };
  if (ready) P.layout();
  else texInfo.onLoad = () => P.layout();
  return P;
}

/* =====================================================================
 *  조명 — 따뜻하고 부드러운 미술관 조명 (강한 하이라이트 없음)
 * ===================================================================== */
const hemi = new THREE.HemisphereLight(0xfff2de, 0x3a3025, 1.35);
scene.add(hemi);
const lobbyLights = [];
for (const [x, z] of [[-6, 8], [6, 8], [-6, -6], [6, -6], [0, 2.6]]) {
  const l = new THREE.PointLight(0xffe4bd, 20, 0, 2);
  l.position.set(x, LOBBY.h - 2.2, z);
  scene.add(l);
  lobbyLights.push(l);
}
const heroSpot = new THREE.SpotLight(0xfff3e2, 70, 0, 0.42, 0.8, 2);
heroSpot.position.set(0, LOBBY.h - 0.3, 7.5);
heroSpot.target.position.set(0, 2.8, 2.6);
scene.add(heroSpot, heroSpot.target);
const filmLight = new THREE.SpotLight(0xffe7c4, 30, 0, 0.6, 0.9, 2);
filmLight.position.set(-LOBBY.x + 4.5, LOBBY.h - 0.3, VIDEO.z);
filmLight.target.position.set(-LOBBY.x, VIDEO.y, VIDEO.z);
scene.add(filmLight, filmLight.target);
const hallLights = [];
for (let z = HALL.zStart - 5; z > HALL.zEnd; z -= 12) {
  const l = new THREE.PointLight(0xffe2b6, 16, 0, 2);
  l.position.set(0, HALL.h - 0.8, z);
  scene.add(l);
  hallLights.push(l);
}


/* =====================================================================
 *  카메라 키프레임 — 액자 크기와 화면비에 맞춰 거리를 자동 계산
 * ===================================================================== */
const K = [];
/** 대상(가로 w, 세로 h)이 화면의 fillW / fillH 비율을 넘지 않게 하는 거리 */
function fitDistance(w, h, fillW = 0.62, fillH = 0.6) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(BASE_FOV) / 2);
  const dH = h / (2 * tanV * fillH);
  const dW = w / (2 * tanV * camera.aspect * fillW);
  return Math.max(dH, dW);
}
function buildKeys() {
  K.length = 0;
  // 0) 로비 — 조각상과 갤러리 포털이 한눈에
  K.push({ p: 0, pos: [0, 2.7, 12.2], yaw: 0, pitch: 0.06 });
  // 조각상을 피해 왼쪽으로 돌아 영상 액자로
  K.push({ p: 0.5, pos: [-4.2, 2.9, 5.5], yaw: 0.75, pitch: 0.02 });
  // 1) 영상 액자 정면 — 액자 전체가 여유 있게 들어오는 거리
  const filmD = clamp(fitDistance(VIDEO.w + 0.9, VIDEO.h + 2.2, 0.66, 0.66), 5, LOBBY.x * 2 - 1.5);
  K.push({ p: 1, pos: [-LOBBY.x + filmD, VIDEO.y - 0.35, VIDEO.z], yaw: Math.PI / 2, pitch: -0.03 });
  // 2) 갤러리 문 앞
  K.push({ p: 2, pos: [0, 2.6, -2.2], yaw: 0, pitch: 0.06 });
  // 3~) 작품 하나하나
  paintings.forEach((P, i) => {
    const d = clamp(fitDistance(P.ow + 1.6, P.oh + 0.6, 0.6, 0.5), 3.2, HALL.x * 2 - 1.2);
    const s = P.side;
    K.push({ p: STOP_FIRST_WORK + i, pos: [s * (HALL.x - d), 2.15, P.z], yaw: s < 0 ? Math.PI / 2 : -Math.PI / 2, pitch: 0.06 });
  });
  // FIN — 회랑 끝 감사 인사
  K.push({ p: MAX_STOP, pos: [0, 2.6, HALL.zEnd + 14], yaw: 0, pitch: 0.05 });
}
WORKS.forEach((w, i) => buildFrame(w, i));
buildKeys();

function cameraAt(pe, out) {
  let a = K[0], b = K[K.length - 1];
  for (let i = 0; i < K.length - 1; i++) {
    if (pe >= K[i].p && pe <= K[i + 1].p) { a = K[i]; b = K[i + 1]; break; }
  }
  const t = b.p === a.p ? 0 : clamp((pe - a.p) / (b.p - a.p), 0, 1);
  out.pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
  let dy = b.yaw - a.yaw;
  out.yaw = a.yaw + dy * t;
  out.pitch = lerp(a.pitch, b.pitch, t);
  // 같은 위치에서 반대편 벽으로 돌아설 때 살짝 뒤로 물러나 회랑을 바라봄
  if (a.p >= STOP_FIRST_WORK && b.p < MAX_STOP) out.pos.x *= 1 - Math.sin(t * Math.PI) * 0.6;
  return out;
}
const easeStops = (p) => Math.floor(p) + easeInOut(p - Math.floor(p));

/* =====================================================================
 *  상태
 * ===================================================================== */
const params = new URLSearchParams(location.search);
const state = {
  started: false,
  p: 0,
  target: 0,
  lastWheel: 0,
  sound: false,
  videoWanted: false,
  mouse: new THREE.Vector2(99, 99),
  look: new THREE.Vector2(),
  hovered: null,
  warping: false,
  warp: null,
  prevDoor: 0,
  activeStop: -1,
};
{
  const m = location.hash.match(/work-(\d+)/);
  if (m) state.p = state.target = clamp(STOP_FIRST_WORK + Number(m[1]) - 1, 0, MAX_STOP);
  else if (location.hash === '#gallery') state.p = state.target = 2;
  if (params.has('p')) state.p = state.target = clamp(parseFloat(params.get('p')), 0, MAX_STOP);
  state.prevDoor = state.p > 1.5 ? 1 : 0;
}

/* =====================================================================
 *  UI 구성
 * ===================================================================== */
CHAPTERS.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'nav-item';
  b.innerHTML = `<span class="nav-label"><em>${c.label}</em>${c.ko}</span><span class="nav-dot"></span>`;
  b.addEventListener('click', () => goTo(i));
  ui.nav.appendChild(b);
});
const navItems = [...ui.nav.children];

function renderPlacard(i) {
  const w = WORKS[i];
  ui.placard.style.setProperty('--accent', w.accent);
  ui.placard.querySelector('.pl-no').textContent = `No.${w.no} / ${String(WORKS.length).padStart(2, '0')}`;
  ui.placard.querySelector('.pl-en').textContent = w.en;
  ui.placard.querySelector('.pl-title').textContent = w.title;
  ui.placard.querySelector('.pl-genre').textContent = `${w.student} · ${w.genre}`;
  ui.placard.querySelector('.pl-desc').textContent = w.desc;
  ui.placard.querySelector('.pl-tags').innerHTML = w.tags.map((t) => `<span>${t}</span>`).join('');
  ui.placard.dataset.side = FRAME_SIDE(i) < 0 ? 'right' : 'left';
}

const diveBtn = $('#diveBtn');
if (diveBtn) {
  diveBtn.addEventListener('click', () => {
    const idx = state.activeStop - STOP_FIRST_WORK;
    if (paintings[idx] && !state.warping) startWarp(paintings[idx], new THREE.Vector2(0.5, 0.5));
  });
}
const reelPrev = $('#reelPrev');
const reelNext = $('#reelNext');
if (reelPrev) reelPrev.addEventListener('click', () => { loadReel(reelIndex - 1); if (state.videoWanted) video.play().catch(() => {}); });
if (reelNext) reelNext.addEventListener('click', () => { loadReel(reelIndex + 1); if (state.videoWanted) video.play().catch(() => {}); });
document.querySelectorAll('[data-goto]').forEach((btn) => {
  btn.addEventListener('click', () => goTo(Number(btn.dataset.goto)));
});

function goTo(stop) {
  if (state.warping) return;
  state.target = clamp(stop, 0, MAX_STOP);
}

function setSound(on) {
  state.sound = on;
  audio.setEnabled(on);
  video.muted = !on;
  ui.soundBtn.classList.toggle('on', on);
  ui.soundBtn.querySelector('.sb-text').textContent = on ? 'SOUND ON' : 'SOUND OFF';
  try { sessionStorage.setItem('induk-sound', on ? '1' : '0'); } catch (e) {}
}
ui.soundBtn.addEventListener('click', () => setSound(!state.sound));

/* =====================================================================
 *  입력 — 휠 / 터치 / 키보드
 * ===================================================================== */
addEventListener('wheel', (e) => {
  if (!state.started || state.warping) return;
  e.preventDefault();
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 33;
  else if (e.deltaMode === 2) dy *= innerHeight;
  dy = clamp(dy, -160, 160);
  state.target = clamp(state.target + dy / 520, 0, MAX_STOP);
  state.lastWheel = performance.now();
}, { passive: false });

let touchY = null;
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
  if (!state.started || state.warping || touchY === null) return;
  const y = e.touches[0].clientY;
  state.target = clamp(state.target + (touchY - y) / 380, 0, MAX_STOP);
  touchY = y;
  state.lastWheel = performance.now();
}, { passive: true });
addEventListener('touchend', () => { touchY = null; });

addEventListener('keydown', (e) => {
  if (!state.started || state.warping) return;
  if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); goTo(Math.floor(state.target + 0.01) + 1); }
  if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); goTo(Math.ceil(state.target - 0.01) - 1); }
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(MAX_STOP);
  if (e.key === 'Enter' && state.activeStop >= STOP_FIRST_WORK && state.activeStop < MAX_STOP) startWarp(paintings[state.activeStop - STOP_FIRST_WORK], new THREE.Vector2(0.5, 0.5));
});

const raycaster = new THREE.Raycaster();
addEventListener('pointermove', (e) => {
  state.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ui.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

function pickPainting() {
  raycaster.setFromCamera(state.mouse, camera);
  const targets = paintings.map((p) => p.mesh);
  if (state.p < 0.6 && heroSculpture) heroSculpture.traverse((c) => { if (c.isMesh) targets.push(c); });
  const hit = raycaster.intersectObjects(targets, false)[0];
  if (!hit || hit.distance > 14) return null;
  return hit;
}

canvas.addEventListener('click', () => {
  if (!state.started || state.warping) return;
  const hit = pickPainting();
  if (!hit) return;
  if (hit.object.userData.isHero) {
    goTo(1);
  } else {
    const P = paintings.find((p) => p.mesh === hit.object);
    if (!P) return;
    // 멀리 있는 액자는 먼저 그 앞으로 걸어가고, 정면일 때 클릭하면 입장
    if (state.activeStop !== STOP_FIRST_WORK + P.index) goTo(STOP_FIRST_WORK + P.index);
    else startWarp(P, hit.uv);
  }
});

/* =====================================================================
 *  액자 입장 — 그림 앞으로 다가가며 잔잔한 물결 → 작품 페이지
 * ===================================================================== */
function startWarp(P, uv) {
  state.warping = true;
  const center = new THREE.Vector3();
  P.mesh.getWorldPosition(center);
  const normal = new THREE.Vector3(0, 0, 1).transformDirection(P.mesh.matrixWorld).normalize();
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = (P.h / 2) / Math.tan(fov / 2);
  const fitW = (P.w / 2) / (Math.tan(fov / 2) * camera.aspect);
  state.warp = {
    P,
    t0: performance.now(),
    from: { pos: camera.position.clone(), yaw: camera.rotation.y, pitch: camera.rotation.x },
    center,
    normal,
    close: Math.max(fitH, fitW) * 1.02,
    yaw: Math.atan2(normal.x, normal.z),
    navigated: false,
  };
  P.mat.uniforms.uClick.value.copy(uv || new THREE.Vector2(0.5, 0.5));
  P.mat.uniforms.uClickT.value = 0;
  ui.warp.style.setProperty('--accent', P.work.accent);
  document.body.classList.add('is-warping');
  audio.warp();
  try { sessionStorage.setItem('induk-return', String(P.index)); } catch (e) {}
}

function updateWarp(now) {
  const W = state.warp;
  const t = (now - W.t0) / 1000;
  const P = W.P;
  P.mat.uniforms.uClickT.value = t;
  P.mat.uniforms.uWarp.value = smooth(0.9, 2.0, t) * 0.6;
  const k = easeInOut(clamp(t / 1.2, 0, 1));
  const dive = easeInOut(clamp((t - 1.3) / 0.9, 0, 1));
  const dist = lerp(W.close, 0.3, dive);
  const target = W.center.clone().addScaledVector(W.normal, dist);
  camera.position.lerpVectors(W.from.pos, target, k);
  let dy = W.yaw - W.from.yaw;
  dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  camera.rotation.y = W.from.yaw + dy * k;
  camera.rotation.x = lerp(W.from.pitch, 0, k);
  camera.rotation.z = 0;
  camera.fov = lerp(BASE_FOV, 34, dive);
  camera.updateProjectionMatrix();
  if (t > 1.6) document.body.classList.add('warp-flash');
  if (t > 2.4 && !W.navigated) {
    W.navigated = true;
    location.href = P.work.url;
  }
}

function resetWarp() {
  if (state.warp) {
    const { P } = state.warp;
    P.mat.uniforms.uClickT.value = -1;
    P.mat.uniforms.uWarp.value = 0;
  }
  state.warp = null;
  state.warping = false;
  camera.fov = BASE_FOV;
  camera.rotation.z = 0;
  camera.updateProjectionMatrix();
  document.body.classList.remove('is-warping', 'warp-flash');
}
addEventListener('pageshow', (e) => { if (e.persisted) resetWarp(); });

/* =====================================================================
 *  메인 루프
 * ===================================================================== */
const camState = { pos: new THREE.Vector3(), yaw: 0, pitch: 0 };
const clock = new THREE.Clock();

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  const now = performance.now();

  if (!state.warping && now - state.lastWheel > 240) {
    const snap = Math.round(state.target);
    state.target = damp(state.target, snap, 7, dt);
    if (Math.abs(state.target - snap) < 0.001) state.target = snap;
  }
  state.p = damp(state.p, state.target, 3.0, dt);
  const pe = easeStops(state.p);

  // ---- 영상: 영상 액자 근처에서만 재생
  const screenOn = 1 - smooth(0.25, 0.75, Math.abs(pe - 1));
  screenMat.uniforms.uOn.value = Math.max(screenOn, 0.0);
  const wantVideo = screenOn > 0.02 && !document.hidden && state.started;
  if (wantVideo !== state.videoWanted) {
    state.videoWanted = wantVideo;
    if (wantVideo) { video.play().catch(() => {}); audio.click(); }
    else video.pause();
  }
  video.volume = clamp(screenOn, 0, 1);

  // ---- 문
  const doorOpen = smooth(1.45, 2.05, pe);
  doorPivots.forEach(({ pivot, s }) => { pivot.rotation.y = -s * doorOpen * 1.6; });
  if (doorOpen > 0.02 && state.prevDoor <= 0.02) audio.door();
  state.prevDoor = doorOpen;

  // ---- 갤러리 조명: 보고 있는 작품에 조금 더 빛
  const inHall = smooth(1.8, 2.8, pe);
  paintings.forEach((P, i) => {
    const focus = 1 - smooth(0, 1.4, Math.abs(pe - (STOP_FIRST_WORK + i)));
    P.spot.intensity = (14 + focus * 16) * (0.3 + inHall * 0.7);
    P.mat.uniforms.uLight.value = 0.86 + focus * 0.08;
    P.mat.uniforms.uTime.value = time;
  });

  // ---- 호버
  if (!state.warping && state.started) {
    const hit = pickPainting();
    const obj = hit ? hit.object : null;
    if (obj !== state.hovered) {
      if (obj) audio.blip(obj.userData && obj.userData.isHero ? 0.85 : 1 + ((obj.userData && obj.userData.workIndex) || 0) * 0.04);
      state.hovered = obj;
      document.body.classList.toggle('is-hover', !!obj);
      if (obj) {
        const isHero = obj.userData && obj.userData.isHero;
        const near = !isHero && state.activeStop === STOP_FIRST_WORK + obj.userData.workIndex;
        ui.cursorLabel.textContent = isHero ? '관람 시작' : near ? '작품 보러 가기' : '이 작품 앞으로';
      }
    }
    paintings.forEach((p) => {
      const m = p.mat;
      const isHover = obj && obj === p.mesh;
      if (isHover) m.uniforms.uHover.value.lerp(hit.uv, 0.3);
      m.uniforms.uHoverAmp.value = damp(m.uniforms.uHoverAmp.value, isHover ? 1 : 0, 4, dt);
    });
  }

  // ---- 카메라
  if (state.warping) {
    updateWarp(now);
  } else {
    cameraAt(pe, camState);
    const mx = Math.abs(state.mouse.x) <= 1 ? state.mouse.x : 0;
    const my = Math.abs(state.mouse.y) <= 1 ? state.mouse.y : 0;
    state.look.x = damp(state.look.x, mx, 2.2, dt);
    state.look.y = damp(state.look.y, my, 2.2, dt);
    camera.position.copy(camState.pos);
    camera.position.y += Math.sin(time * 0.5) * 0.012;
    camera.rotation.y = camState.yaw - state.look.x * 0.035;
    camera.rotation.x = camState.pitch + state.look.y * 0.025;
    camera.rotation.z = 0;
  }

  updateUI(pe);
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

function updateUI(pe) {
  const nearest = clamp(Math.round(pe), 0, MAX_STOP);
  if (nearest !== state.activeStop) {
    state.activeStop = nearest;
    navItems.forEach((n, i) => n.classList.toggle('active', i === nearest));
    if (nearest >= STOP_FIRST_WORK && nearest < MAX_STOP) renderPlacard(nearest - STOP_FIRST_WORK);
    ui.stopLabel.textContent = `${String(nearest + 1).padStart(2, '0')} — ${CHAPTERS[nearest].label}`;
    const hash = nearest >= STOP_FIRST_WORK && nearest < MAX_STOP ? `#work-${nearest - STOP_FIRST_WORK + 1}` : nearest === 2 ? '#gallery' : ' ';
    history.replaceState(null, '', hash === ' ' ? location.pathname + location.search : hash);
  }
  ui.captions.forEach((el) => {
    const s = Number(el.dataset.stop);
    const o = clamp(1 - Math.abs(pe - s) * 3.2, 0, 1);
    el.style.opacity = o;
    el.style.transform = `translate3d(-50%, ${(pe - s) * -40}px, 0)`;
    el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
  });
  const workFocus = pe >= STOP_FIRST_WORK - 0.4 && pe <= MAX_STOP - 0.6 ? clamp(1 - Math.abs(pe - nearest) * 3.2, 0, 1) : 0;
  ui.placard.style.opacity = state.warping ? 0 : workFocus;
  ui.placard.style.pointerEvents = workFocus > 0.5 ? 'auto' : 'none';
  ui.progress.style.transform = `scaleX(${pe / MAX_STOP})`;
  ui.hint.style.opacity = state.started && pe < MAX_STOP - 0.3 ? 1 : 0;
}

/* =====================================================================
 *  리사이즈
 * ===================================================================== */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  buildKeys();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else if (state.videoWanted) video.play().catch(() => {}); });

/* =====================================================================
 *  로딩 & 입장
 * ===================================================================== */
manager.onProgress = (_, loaded, total) => {
  const r = loaded / total;
  ui.bar.style.transform = `scaleX(${r})`;
  ui.pct.textContent = `${Math.round(r * 100)}%`;
};
const assetsReady = Promise.race([
  new Promise((res) => { manager.onLoad = res; }),
  new Promise((res) => setTimeout(res, 12000)),
]);
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load(`600 100px 'Cormorant Garamond'`),
    document.fonts.load(`500 100px 'Space Grotesk'`),
    document.fonts.load(`500 100px 'Noto Sans KR'`),
    document.fonts.load(`400 100px 'Noto Sans KR'`),
  ]),
  new Promise((r) => setTimeout(r, 3500)),
]);

function enter(withSound) {
  if (state.started) return;
  state.started = true;
  setSound(withSound);
  ui.loader.classList.add('hidden');
  document.body.classList.add('started');
  video.play().then(() => { if (!state.videoWanted) video.pause(); }).catch(() => {});
}
ui.enterSound.addEventListener('click', () => enter(true));
ui.enterMute.addEventListener('click', () => enter(false));

Promise.all([assetsReady, fontsReady]).then(() => {
  buildSigns();
  // 폰트가 늦게 로드된 경우 명패 텍스처를 다시 그림
  paintings.forEach((P) => P.layout());
  renderer.compile(scene, camera);
  ui.loader.classList.add('ready');
  ui.pct.textContent = '100%';
  ui.bar.style.transform = 'scaleX(1)';
  const returning = /work-|gallery/.test(location.hash) || params.has('p');
  if (returning) {
    let snd = false;
    try { snd = sessionStorage.getItem('induk-sound') === '1'; } catch (e) {}
    enter(false);
    if (snd) ui.soundBtn.classList.add('pulse');
  }
});

update();
