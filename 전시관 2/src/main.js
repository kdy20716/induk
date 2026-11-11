import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import { WORKS, SHOWREEL } from './data.js';
import { createPaintingMaterial, createBeamGeometry, createBeamMaterial, createDustMaterial, createGlowTexture } from './shaders.js';
import { textSign, plaqueTexture, noiseTexture, woodTexture, doorTextures, FONTS } from './textures.js';
import { ExhibitionAudio } from './audio.js';

/* =====================================================================
 *  상수 & 레이아웃
 * ===================================================================== */
const LOBBY = { x: 12, zBack: -14, zFront: 16, h: 9 };
const HALL = { x: 5, zStart: -14.3, zEnd: -55, h: 6.4 };
const DOOR = { w: 5, h: 6 };
const SCREEN = { w: 16.0, h: 9.0, top: 8.8, z: -13.35 };
const PROJ = { pos: new THREE.Vector3(0, 8.4, 5.5) };
const FRAME_Z = (i) => -21 - i * 7;
const FRAME_SIDE = (i) => (i % 2 === 0 ? -1 : 1); // -1 = 왼쪽 벽, +1 = 오른쪽 벽
const STOP_FIRST_WORK = 3;
const MAX_STOP = STOP_FIRST_WORK + WORKS.length; // 마지막 = 엔딩

const CHAPTERS = [
  { label: 'LOBBY', ko: '전시장 로비' },
  { label: 'SHOWREEL', ko: '작품 영상관' },
  { label: 'THE GATE', ko: '갤러리 입구' },
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

/* =====================================================================
 *  렌더러 / 씬 / 카메라
 * ===================================================================== */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const PR = Math.min(window.devicePixelRatio, 1.75);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.FogExp2(0x050608, 0.012);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.05, 200);
camera.rotation.order = 'YXZ';

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.25, 0.5, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const manager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./vendor/three/addons/libs/draco/');
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

const texLoader = new THREE.TextureLoader(manager);
const loadTex = (url) => {
  const t = texLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
};

const audio = new ExhibitionAudio();
const glowTex = createGlowTexture();
const goldGlowTex = createGlowTexture('rgba(255,236,190,1)', 'rgba(255,190,90,0.35)');

/* =====================================================================
 *  공용 머티리얼 / 헬퍼
 * ===================================================================== */
const M = {
  concrete: new THREE.MeshStandardMaterial({ map: noiseTexture('#3b3f47', 16, 512, 3), roughness: 0.92, metalness: 0 }),
  concreteDark: new THREE.MeshStandardMaterial({ map: noiseTexture('#22252b', 14, 512, 3), roughness: 0.95 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 1 }),
  hallWall: new THREE.MeshStandardMaterial({ map: noiseTexture('#3a2629', 10, 512, 6), roughness: 0.88 }),
  hallWainscot: new THREE.MeshStandardMaterial({ color: 0x1a1214, roughness: 0.6, metalness: 0.1 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd4a85a, metalness: 1, roughness: 0.28, envMap: envTex, envMapIntensity: 1.2 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x1b1d22, metalness: 0.8, roughness: 0.35, envMap: envTex, envMapIntensity: 0.5 }),
  // 천장 조명 밝기 대폭 완화 (눈부심 없는 차분한 고급 미술관 간접등)
  stripCool: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.42, 0.5, 0.68), toneMapped: true }),
  stripWarm: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.38, 0.22), toneMapped: true }),
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
function signMesh(tex, w, h, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: opts.toneMapped ?? true });
  if (opts.color) mat.color = opts.color;
  return plane(w, h, mat, opts.parent || scene);
}
function makeDust(count, sampler, color, size) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler(v);
    pos.set([v.x, v.y, v.z], i * 3);
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const p = new THREE.Points(g, createDustMaterial(color, size));
  p.frustumCulled = false;
  scene.add(p);
  return p;
}

/* =====================================================================
 *  바닥 (반사) — 로비: 폴리싱 콘크리트 / 갤러리: 원목 마루
 * ===================================================================== */
{
  const totalD = LOBBY.zFront - HALL.zEnd + 2;
  const mirror = new Reflector(new THREE.PlaneGeometry(LOBBY.x * 2, totalD), {
    clipBias: 0.003,
    textureWidth: Math.floor(innerWidth * PR * 0.5),
    textureHeight: Math.floor(innerHeight * PR * 0.5),
    color: 0x8a8f99,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(0, 0, (LOBBY.zFront + HALL.zEnd) / 2);
  scene.add(mirror);

  const lobbyD = LOBBY.zFront - LOBBY.zBack;
  const lobbyFloorTex = noiseTexture('#1c1f25', 12, 512, 6);
  const lobbyFloor = plane(LOBBY.x * 2, lobbyD, new THREE.MeshStandardMaterial({ map: lobbyFloorTex, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.82 }));
  lobbyFloor.rotation.x = -Math.PI / 2;
  lobbyFloor.position.set(0, 0.003, (LOBBY.zFront + LOBBY.zBack) / 2);

  const hallD = HALL.zStart - HALL.zEnd;
  const wood = woodTexture();
  wood.repeat.set(2.2, hallD / 4.5);
  const hallFloor = plane(HALL.x * 2, hallD, new THREE.MeshStandardMaterial({ map: wood, roughness: 0.45, transparent: true, opacity: 0.86 }));
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.position.set(0, 0.003, (HALL.zStart + HALL.zEnd) / 2);

  // 로비 바닥 라인 조명 (입구 → 스크린으로 안내)
  for (const x of [-3.2, 3.2]) {
    const s = box(0.05, 0.01, lobbyD - 4, M.stripCool, x, 0.01, (LOBBY.zFront + LOBBY.zBack) / 2 + 1);
    s.material = M.stripCool.clone();
    s.material.color = new THREE.Color(0.4, 0.55, 0.9);
  }
}

/* =====================================================================
 *  로비 건축
 * ===================================================================== */
const lobbyGroup = new THREE.Group();
scene.add(lobbyGroup);
{
  const { x: LX, zBack: ZB, zFront: ZF, h: H } = LOBBY;
  const D = ZF - ZB;
  const cz = (ZF + ZB) / 2;
  // 좌우 벽
  const lw = plane(D, H, M.concrete, lobbyGroup);
  lw.rotation.y = Math.PI / 2;
  lw.position.set(-LX, H / 2, cz);
  const rw = plane(D, H, M.concrete, lobbyGroup);
  rw.rotation.y = -Math.PI / 2;
  rw.position.set(LX, H / 2, cz);
  // 앞 벽 (카메라 뒤)
  const fw = plane(LX * 2, H, M.concreteDark, lobbyGroup);
  fw.rotation.y = Math.PI;
  fw.position.set(0, H / 2, ZF);
  // 천장
  const ceil = plane(LX * 2, D, M.ceiling, lobbyGroup);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, cz);
  // 뒷벽 (문 개구부 제외)
  const side = (LX - DOOR.w / 2);
  box(side, H, 0.6, M.concreteDark, -(DOOR.w / 2 + side / 2), H / 2, ZB, lobbyGroup);
  box(side, H, 0.6, M.concreteDark, DOOR.w / 2 + side / 2, H / 2, ZB, lobbyGroup);
  box(DOOR.w, H - DOOR.h, 0.6, M.concreteDark, 0, DOOR.h + (H - DOOR.h) / 2, ZB, lobbyGroup);

  // 천장 라인 조명 + 벽 수직 조명
  for (const x of [-LX + 0.4, LX - 0.4]) box(0.1, 0.06, D - 1, M.stripCool, x, H - 0.05, cz, lobbyGroup);
  for (let z = ZB + 3; z < ZF - 1; z += 4.2) {
    box(0.06, H - 1.2, 0.06, M.stripCool, -LX + 0.04, H / 2, z, lobbyGroup);
    box(0.06, H - 1.2, 0.06, M.stripCool, LX - 0.04, H / 2, z, lobbyGroup);
  }
  // 천장 루버
  for (let z = ZB + 1; z < ZF; z += 1.6) box(LX * 2 - 1, 0.25, 0.08, M.darkMetal, 0, H - 0.2, z, lobbyGroup);
}

let endSignMesh = null;

/* --- 로비 사인 (폰트 로드 후 생성) --- */
function buildLobbySigns() {
  const { x: LX, h: H } = LOBBY;
  const left = textSign(
    [
      { text: 'INDUK', font: `600 330px ${FONTS.SERIF}`, y: 300, color: '#e9eef8', spacing: 40 },
      { text: 'UNIVERSITY', font: `500 80px ${FONTS.GROT}`, y: 520, color: '#9fb4d8', spacing: 46 },
      { text: 'GAME & MEDIA EXHIBITION 2026', font: `500 64px ${FONTS.GROT}`, y: 660, color: '#ffffff', spacing: 18 },
      { text: '인덕대학교 · 졸업 작품 전시', font: `400 56px ${FONTS.SANS}`, y: 770, color: '#9aa3b5', spacing: 8 },
    ],
    { w: 2048, h: 900 }
  );
  const ls = signMesh(left, 11, 11 * 900 / 2048, { parent: lobbyGroup });
  ls.rotation.y = Math.PI / 2;
  ls.position.set(-LX + 0.06, 5.2, 4.5);

  const right = textSign(
    [
      { text: 'DOYEON KIM', font: `600 210px ${FONTS.SERIF}`, y: 230, color: '#f4efe6', spacing: 22 },
      { text: '김도연  ·  GAME & WEB DEVELOPER', font: `500 70px ${FONTS.SANS}`, y: 440, color: '#d9b981', spacing: 10 },
      { text: 'Student ID 202236028', font: `400 54px ${FONTS.GROT}`, y: 560, color: '#8d96a8', spacing: 14 },
      { text: '— 5 WORKS ON DISPLAY —', font: `500 54px ${FONTS.GROT}`, y: 700, color: '#ffffff', spacing: 20 },
    ],
    { w: 2048, h: 860 }
  );
  const rs = signMesh(right, 10.5, 10.5 * 860 / 2048, { parent: lobbyGroup });
  rs.rotation.y = -Math.PI / 2;
  rs.position.set(LX - 0.06, 5.2, 4.5);

  // 문 위 사인 (스크린 뒤에 숨어있다가 스크린이 올라가면 드러남)
  const gate = textSign(
    [
      { text: 'THE INNER GALLERY', font: `600 150px ${FONTS.SERIF}`, y: 150, color: '#ffe2a8', glow: 'rgba(255,190,90,.9)', blur: 30, spacing: 26 },
      { text: '작 품 전 시 관', font: `500 64px ${FONTS.SANS}`, y: 300, color: '#d8b77a', spacing: 30 },
    ],
    { w: 2048, h: 380 }
  );
  const gs = signMesh(gate, 6.4, 6.4 * 380 / 2048, { parent: lobbyGroup, toneMapped: false, color: new THREE.Color(1.3, 1.3, 1.3) });
  gs.position.set(0, 7.15, LOBBY.zBack + 0.32);

  // 엔딩 벽
  const end = textSign(
    [
      { text: 'THANK YOU', font: `600 260px ${FONTS.SERIF}`, y: 250, color: '#fff1d2', glow: 'rgba(255,190,90,.8)', blur: 40, spacing: 40 },
      { text: 'FOR VISITING THE EXHIBITION', font: `500 70px ${FONTS.GROT}`, y: 430, color: '#d8b77a', spacing: 22 },
      { text: '인덕대학교 · 김도연 · 2026', font: `400 60px ${FONTS.SANS}`, y: 560, color: '#b9a689', spacing: 10 },
    ],
    { w: 2048, h: 700 }
  );
  const es = signMesh(end, 8.2, 8.2 * 700 / 2048, { toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) });
  es.position.set(0, 3.3, HALL.zEnd + 0.05);
  es.material.transparent = true;
  es.material.opacity = 0;
  es.visible = false;
  endSignMesh = es;
}

/* =====================================================================
 *  [Scene 1] 대표 3D 조각상 쇼케이스 (해외 미술작품 조각상)
 * ===================================================================== */
const hero = new THREE.Group();
hero.position.set(0, 0, 2.6);
scene.add(hero);

const heroFloat = new THREE.Group();
hero.add(heroFloat);
heroFloat.position.y = 0.5;

let heroSculpture = null;
// 2단 대리석 좌대 (Museum Marble Pedestal)
{
  const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.45, 64), M.darkMetal);
  pedBase.position.y = 0.225;
  hero.add(pedBase);

  const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.35, 64), M.concrete);
  pedTop.position.y = 0.55;
  hero.add(pedTop);

  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.028, 12, 96), M.gold);
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.45;
  hero.add(goldRing);

  const innerGoldRing = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.024, 12, 96), M.gold);
  innerGoldRing.rotation.x = Math.PI / 2;
  innerGoldRing.position.y = 0.725;
  hero.add(innerGoldRing);

  // 천장 링 샹들리에 조명
  const halo = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.05, 8, 128), M.stripCool);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, LOBBY.h - 0.4, 2.6);
  scene.add(halo);

  // 좌대 전면 명패
  const plaqueMat = new THREE.MeshStandardMaterial({
    map: textSign([
      { text: 'GRAND ATRIUM · MASTERPIECE SCULPTURE', font: `600 68px ${FONTS.GROT}`, y: 80, color: '#e5be79', spacing: 14 },
      { text: 'Sanctuary Goddess · Nemetona', font: `600 130px ${FONTS.SERIF}`, y: 215, color: '#ffffff', spacing: 10 },
      { text: '인덕대학교 게임 & 미디어 전시관 · 김도연 2026', font: `400 64px ${FONTS.SANS}`, y: 345, color: '#9aa5b8', spacing: 6 }
    ], { w: 1800, h: 440 }),
    roughness: 0.3,
    metalness: 0.5,
    envMap: envTex,
    envMapIntensity: 0.8
  });
  const plaque = plane(2.2, 2.2 * 440 / 1800, plaqueMat, hero);
  plaque.position.set(0, 0.55, 2.15);
}

// 3D 조각상 모델 로드 (nemetona.glb - 3.8MB, 깃허브 100MB 제한 아래의 해외 미술관 명작 대리석 조각상)
gltfLoader.load('assets/models/nemetona.glb', (gltf) => {
  const model = gltf.scene;
  const box3 = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box3.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetH = 3.65;
  const scale = targetH / maxDim;
  model.scale.setScalar(scale);

  // 중심 정렬
  const center = new THREE.Vector3();
  box3.getCenter(center);
  model.position.x = -center.x * scale;
  model.position.y = -box3.min.y * scale + 0.22;
  model.position.z = -center.z * scale;

  // 해외 유명 미술관의 천연 카라라 백대리석 질감 (조각상 이목구비와 옷주름 음영이 또렷하게 표현됨)
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xc6c1b6,
    roughness: 0.68,
    metalness: 0.02,
    envMap: envTex,
    envMapIntensity: 0.45
  });

  model.traverse((child) => {
    if (child.isMesh) {
      child.material = marbleMat;
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.isHero = true;
    }
  });

  heroFloat.add(model);
  heroSculpture = model;
});

// 조각상 전용 조명 (조각상의 입체적 음영과 실루엣을 살리는 부드러운 갤러리 라이트)
const heroSpot = new THREE.SpotLight(0xfff8ee, 14, 20, 0.55, 0.85, 1.4);
heroSpot.position.set(0, LOBBY.h - 0.4, 6.2);
heroSpot.target = heroFloat;
scene.add(heroSpot);

const heroRimLight = new THREE.SpotLight(0xaed3ff, 12, 18, 0.6, 0.8, 1.5);
heroRimLight.position.set(0, 5.0, -1.5);
heroRimLight.target = heroFloat;
scene.add(heroRimLight);

// 부유하는 금빛 미술관 더스트 파티클
const jellyDust = [
  makeDust(90, (v) => {
    const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 2.8;
    v.set(Math.cos(a) * r, 0.8 + Math.random() * 4.6, 2.6 + Math.sin(a) * r * 0.7);
  }, new THREE.Color(1.0, 0.88, 0.55), 45)
];

/* =====================================================================
 *  [Scene 2] 빔프로젝터 + 스크린 + 쇼릴 영상 (영상 밝기 최적화 및 스테이지)
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
loadReel(0);
const videoTex = new THREE.VideoTexture(video);
videoTex.colorSpace = THREE.SRGBColorSpace;

const screenGroup = new THREE.Group();
screenGroup.position.set(0, SCREEN.top, SCREEN.z);
scene.add(screenGroup);

// 영상 본래 색감과 선명도를 살리는 스크린 쉐이더 (과도한 블룸 폭발 방지 및 선명한 화질)
const screenMat = new THREE.ShaderMaterial({
  uniforms: { uMap: { value: videoTex }, uOn: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D uMap; uniform float uOn, uTime; varying vec2 vUv;
    void main(){
      vec3 fabric = vec3(0.012, 0.013, 0.016);
      vec3 v = texture2D(uMap, vUv).rgb;
      // 깊고 단단한 블랙과 선명한 원본 컬러 표현 (하얗게 뜨는 현상 방지)
      v = pow(v, vec3(1.08));
      v *= 1.05;
      vec3 col = mix(fabric, v, uOn);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), screenMat);
screenMesh.position.y = -SCREEN.h / 2;
screenGroup.add(screenMesh);

const screenBorder = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w + 0.35, SCREEN.h + 0.35), new THREE.MeshStandardMaterial({ color: 0x070709, roughness: 0.9 }));
screenBorder.position.set(0, -SCREEN.h / 2, -0.02);
screenGroup.add(screenBorder);

const screenRod = box(SCREEN.w + 0.6, 0.09, 0.09, M.darkMetal, 0, 0, 0.02);
scene.remove(screenRod);
screenRod.position.set(0, SCREEN.top - SCREEN.h - 0.15, SCREEN.z + 0.03);
scene.add(screenRod);
box(SCREEN.w + 1.0, 0.34, 0.38, M.darkMetal, 0, SCREEN.top + 0.17, SCREEN.z); // 롤러 하우징

const screenLight = new THREE.PointLight(0xa5c4ff, 0, 10, 2.0);
screenLight.position.set(0, 4.2, SCREEN.z + 2.5);
scene.add(screenLight);

// 프로젝터 본체
const projector = new THREE.Group();
projector.position.copy(PROJ.pos);
scene.add(projector);
box(1.35, 0.46, 1.1, M.darkMetal, 0, 0, 0, projector);
box(1.37, 0.06, 1.12, new THREE.MeshStandardMaterial({ color: 0xe8e8ea, roughness: 0.4, metalness: 0.3 }), 0, 0.2, 0, projector);
box(0.06, LOBBY.h - PROJ.pos.y - 0.2, 0.06, M.darkMetal, 0, (LOBBY.h - PROJ.pos.y) / 2 + 0.1, 0, projector);
{
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.26, 32), M.darkMetal);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.25, -0.03, -0.66);
  projector.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ color: 0x223, toneMapped: false }));
  glass.position.set(0.25, -0.03, -0.8);
  glass.rotation.y = Math.PI;
  projector.add(glass);
  projector.userData.glass = glass;
  const led = box(0.04, 0.04, 0.01, new THREE.MeshBasicMaterial({ color: 0x220000, toneMapped: false }), -0.45, -0.1, -0.56, projector);
  projector.userData.led = led;
}
const lensWorld = new THREE.Vector3(PROJ.pos.x + 0.25, PROJ.pos.y - 0.03, PROJ.pos.z - 0.82);
const lensFlare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(1.3, 1.5, 2.0), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
lensFlare.position.copy(lensWorld);
lensFlare.scale.setScalar(2.0);
scene.add(lensFlare);

const screenCorners = [
  new THREE.Vector3(-SCREEN.w / 2, SCREEN.top, SCREEN.z + 0.05),
  new THREE.Vector3(SCREEN.w / 2, SCREEN.top, SCREEN.z + 0.05),
  new THREE.Vector3(SCREEN.w / 2, SCREEN.top - SCREEN.h, SCREEN.z + 0.05),
  new THREE.Vector3(-SCREEN.w / 2, SCREEN.top - SCREEN.h, SCREEN.z + 0.05),
];
const beamMat = createBeamMaterial(new THREE.Color(0.65, 0.78, 1.0));
const beam = new THREE.Mesh(createBeamGeometry(lensWorld, screenCorners, 0.1), beamMat);
beam.frustumCulled = false;
scene.add(beam);
const beamCoreMat = createBeamMaterial(new THREE.Color(0.8, 0.9, 1.0));
const coreCorners = screenCorners.map((c) => new THREE.Vector3().lerpVectors(new THREE.Vector3(0, SCREEN.top - SCREEN.h / 2, c.z), c, 0.55));
const beamCore = new THREE.Mesh(createBeamGeometry(lensWorld, coreCorners, 0.05), beamCoreMat);
beamCore.frustumCulled = false;
scene.add(beamCore);
const beamDust = makeDust(800, (v) => {
  const t = Math.pow(Math.random(), 0.8);
  const u = Math.random(), w = Math.random();
  const top = new THREE.Vector3().lerpVectors(screenCorners[0], screenCorners[1], u);
  const bot = new THREE.Vector3().lerpVectors(screenCorners[3], screenCorners[2], u);
  const far = top.lerp(bot, w);
  v.lerpVectors(lensWorld, far, 0.08 + t * 0.9);
}, new THREE.Color(0.7, 0.85, 1.0), 22);

/* =====================================================================
 *  [Scene 3] 갤러리 대문 (양문형 아르데코 도어)
 * ===================================================================== */
const doorTex = doorTextures();
const doorMat = new THREE.MeshStandardMaterial({
  map: doorTex.map,
  emissiveMap: doorTex.emissive,
  emissive: new THREE.Color(0.9, 0.62, 0.25),
  emissiveIntensity: 0.25,
  metalness: 0.55,
  roughness: 0.38,
  envMap: envTex,
  envMapIntensity: 0.6,
});
const doorPivots = [-1, 1].map((s) => {
  const pivot = new THREE.Group();
  pivot.position.set(s * DOOR.w / 2, 0, LOBBY.zBack);
  scene.add(pivot);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w / 2, DOOR.h, 0.16), [M.darkMetal, M.darkMetal, M.darkMetal, M.darkMetal, doorMat, doorMat]);
  panel.position.set(-s * DOOR.w / 4, DOOR.h / 2, 0);
  pivot.add(panel);
  // 손잡이
  const handle = box(0.06, 0.9, 0.08, M.gold, -s * (DOOR.w / 2 - 0.25), DOOR.h / 2 - 0.4, 0.13, pivot);
  handle.userData.side = s;
  return { pivot, s };
});
// 문틀
for (const [w, h, x, y] of [
  [0.22, DOOR.h + 0.22, -DOOR.w / 2 - 0.11, DOOR.h / 2 + 0.11],
  [0.22, DOOR.h + 0.22, DOOR.w / 2 + 0.11, DOOR.h / 2 + 0.11],
  [DOOR.w + 0.44, 0.22, 0, DOOR.h + 0.11],
]) box(w, h, 0.7, M.gold, x, y, LOBBY.zBack);
// 문 너머 황금빛
const doorLight = new THREE.PointLight(0xffc27a, 0, 30, 1.4);
doorLight.position.set(0, 3.2, LOBBY.zBack - 2.5);
scene.add(doorLight);
const lightSpill = plane(DOOR.w + 2, 12, new THREE.MeshBasicMaterial({ map: (() => {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, 'rgba(255,200,120,1)');
  grd.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 256);
  const hg = g.createLinearGradient(0, 0, 64, 0);
  g.globalCompositeOperation = 'destination-in';
  hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(0.25, 'rgba(0,0,0,1)'); hg.addColorStop(0.75, 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hg;
  g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
lightSpill.rotation.x = -Math.PI / 2;
lightSpill.position.set(0, 0.02, LOBBY.zBack + 6.2);

/* =====================================================================
 *  [Scene 4] 내부 갤러리 회랑 + 액자
 * ===================================================================== */
const hallGroup = new THREE.Group();
scene.add(hallGroup);
{
  const { x: HX, zStart: ZS, zEnd: ZE, h: H } = HALL;
  const D = ZS - ZE;
  const cz = (ZS + ZE) / 2;
  const lw = plane(D, H, M.hallWall, hallGroup);
  lw.rotation.y = Math.PI / 2;
  lw.position.set(-HX, H / 2, cz);
  const rw = plane(D, H, M.hallWall, hallGroup);
  rw.rotation.y = -Math.PI / 2;
  rw.position.set(HX, H / 2, cz);
  const ew = plane(HX * 2, H, M.hallWall, hallGroup);
  ew.position.set(0, H / 2, ZE);
  const ceil = plane(HX * 2, D, M.ceiling, hallGroup);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, cz);
  // 하부 웨인스코팅 + 금색 몰딩
  for (const s of [-1, 1]) {
    box(0.06, 0.95, D, M.hallWainscot, s * (HX - 0.03), 0.475, cz, hallGroup);
    box(0.08, 0.04, D, M.gold, s * (HX - 0.05), 0.97, cz, hallGroup);
    box(0.08, 0.05, D, M.gold, s * (HX - 0.05), H - 0.35, cz, hallGroup);
    box(0.2, 0.05, D, M.stripWarm, s * (HX - 0.35), H - 0.03, cz, hallGroup); // 코브 조명
  }
  box(0.3, 0.04, D - 2, M.stripWarm, 0, H - 0.02, cz, hallGroup);
  // 따뜻한 보조광
  for (let z = ZS - 4; z > ZE; z -= 12) {
    const pl = new THREE.PointLight(0xffb36b, 14, 16, 1.5);
    pl.position.set(0, H - 0.6, z);
    hallGroup.add(pl);
  }
}
const hallDust = makeDust(500, (v) => v.set((Math.random() - 0.5) * 9, Math.random() * 6, HALL.zStart - Math.random() * (HALL.zStart - HALL.zEnd)), new THREE.Color(1.2, 0.9, 0.5), 30);

const paintings = []; // { mesh, work, index, normal, center, w, h }
function buildFrame(work, index) {
  const tex = loadTex(work.image);
  const side = FRAME_SIDE(index);
  const z = FRAME_Z(index);
  const group = new THREE.Group();
  group.position.set(side * (HALL.x - 0.02), 2.45, z);
  group.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  hallGroup.add(group);

  const mat = createPaintingMaterial(tex, 1.5);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 128, 96), mat);
  mesh.position.z = 0.1;
  group.add(mesh);
  const liner = plane(1, 1, new THREE.MeshStandardMaterial({ color: 0x0d0b09, roughness: 0.7 }), group);
  liner.position.z = 0.08;
  const molding = new THREE.Mesh(new THREE.BufferGeometry(), M.gold);
  group.add(molding);
  const plaque = plane(1.25, 1.25 * 340 / 1024, new THREE.MeshStandardMaterial({ map: plaqueTexture(work), roughness: 0.35, metalness: 0.4, envMap: envTex, envMapIntensity: 0.5 }), group);
  // 그림 조명 (picture light)
  const lamp = new THREE.Group();
  group.add(lamp);
  box(1.2, 0.07, 0.07, M.gold, 0, 0, 0.32, lamp);
  box(0.04, 0.04, 0.3, M.gold, 0, 0.03, 0.15, lamp);
  const lampGlow = box(1.1, 0.012, 0.03, M.stripWarm, 0, -0.04, 0.33, lamp);
  lampGlow.material = M.stripWarm;

  const spot = new THREE.SpotLight(0xffe3b8, 0, 11, 0.36, 0.65, 1.4);
  const spotTarget = new THREE.Object3D();
  group.add(spotTarget);
  spot.target = spotTarget;
  scene.add(spot);
  spot.position.set(side * (HALL.x - 3.2), HALL.h - 0.3, z);
  spotTarget.position.set(0, -0.1, 0);

  const P = { mesh, work, index, group, w: 1, h: 1, spot, mat };
  mesh.userData.workIndex = index;
  paintings.push(P);

  const layout = () => {
    const img = tex.image;
    const a = img && img.width ? img.width / img.height : 1.5;
    let w = 3.7, h = w / a;
    if (h > 2.45) { h = 2.45; w = h * a; }
    P.w = w; P.h = h;
    mesh.scale.set(w, h, 1);
    mat.uniforms.uAspect.value = a;
    liner.scale.set(w + 0.18, h + 0.18, 1);
    const ow = w + 0.62, oh = h + 0.62, iw = w + 0.16, ih = h + 0.16;
    const shape = new THREE.Shape();
    shape.moveTo(-ow / 2, -oh / 2); shape.lineTo(ow / 2, -oh / 2); shape.lineTo(ow / 2, oh / 2); shape.lineTo(-ow / 2, oh / 2); shape.lineTo(-ow / 2, -oh / 2);
    const hole = new THREE.Path();
    hole.moveTo(-iw / 2, -ih / 2); hole.lineTo(-iw / 2, ih / 2); hole.lineTo(iw / 2, ih / 2); hole.lineTo(iw / 2, -ih / 2); hole.lineTo(-iw / 2, -ih / 2);
    shape.holes.push(hole);
    molding.geometry.dispose();
    molding.geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
    plaque.position.set(0, -oh / 2 - 0.42, 0.02);
    lamp.position.set(0, oh / 2 + 0.22, 0);
  };
  P.layout = layout;
  return P;
}
WORKS.forEach((w, i) => buildFrame(w, i));

/* =====================================================================
 *  조명
 * ===================================================================== */
const hemi = new THREE.HemisphereLight(0x9fb2d8, 0x120f10, 0.9);
scene.add(hemi);
const lobbyFill = [];
for (const [x, z] of [[-7, 9], [7, 9], [-7, -6], [7, -6]]) {
  const s = new THREE.SpotLight(0xdfe8ff, 90, 16, 0.75, 0.9, 1.5);
  s.position.set(x, LOBBY.h - 0.3, z);
  s.target.position.set(x * 1.35, 2, z);
  scene.add(s, s.target);
  lobbyFill.push(s);
}

/* =====================================================================
 *  카메라 키프레임 (p = 스크롤 진행도)
 * ===================================================================== */
const K = [
  { p: 0, pos: [0, 2.5, 9.6], yaw: 0, pitch: 0.03 },
  { p: 1, pos: [0, 4.3, -1.8], yaw: 0, pitch: 0.0 }, // 16:9 대형 스크린 정면 100% 영화관 뷰 (검은 네모 및 잘림 완전 제거)
  { p: 1.55, pos: [0, 2.7, -4.5], yaw: 0, pitch: 0.04 },
  { p: 2, pos: [0, 2.25, -9.2], yaw: 0, pitch: 0.0 },
];
WORKS.forEach((_, i) => {
  const s = FRAME_SIDE(i);
  K.push({ p: STOP_FIRST_WORK + i, pos: [-s * 1.1, 2.4, FRAME_Z(i)], yaw: s < 0 ? Math.PI / 2 : -Math.PI / 2, pitch: 0.0 });
});
K.push({ p: MAX_STOP, pos: [0, 2.6, HALL.zEnd + 8.5], yaw: 0, pitch: 0.035 });

function cameraAt(pe, out) {
  let a = K[0], b = K[K.length - 1];
  for (let i = 0; i < K.length - 1; i++) {
    if (pe >= K[i].p && pe <= K[i + 1].p) { a = K[i]; b = K[i + 1]; break; }
  }
  const t = b.p === a.p ? 0 : clamp((pe - a.p) / (b.p - a.p), 0, 1);
  out.pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
  out.yaw = lerp(a.yaw, b.yaw, t);
  out.pitch = lerp(a.pitch, b.pitch, t);
  // 액자 사이 이동 시 살짝 뒤로 빠졌다가 다가감 (돌리 줌 느낌)
  if (a.p >= STOP_FIRST_WORK - 1 && b.p <= MAX_STOP) out.pos.y += Math.sin(t * Math.PI) * 0.12;
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
  prevBeam: 0,
  prevDoor: 0,
  activeStop: -1,
};
{
  const m = location.hash.match(/work-(\d+)/);
  if (m) state.p = state.target = clamp(STOP_FIRST_WORK + Number(m[1]) - 1, 0, MAX_STOP);
  else if (location.hash === '#gallery') state.p = state.target = 2;
  if (params.has('p')) state.p = state.target = clamp(parseFloat(params.get('p')), 0, MAX_STOP);
  // 이전 상태로 복귀 시 문/스크린 효과음이 재생되지 않도록
  state.prevBeam = state.p > 0.6 ? 1 : 0;
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
  ui.placard.querySelector('.pl-genre').textContent = w.genre;
  ui.placard.querySelector('.pl-desc').textContent = w.desc;
  ui.placard.querySelector('.pl-tags').innerHTML = w.tags.map((t) => `<span>${t}</span>`).join('');
  ui.placard.dataset.side = FRAME_SIDE(i) < 0 ? 'right' : 'left';
}

const diveBtn = document.querySelector('#diveBtn');
if (diveBtn) {
  diveBtn.addEventListener('click', () => {
    const idx = state.activeStop - STOP_FIRST_WORK;
    if (paintings[idx] && !state.warping) {
      startWarp(paintings[idx], new THREE.Vector2(0.5, 0.5));
    }
  });
}
const reelPrev = document.querySelector('#reelPrev');
const reelNext = document.querySelector('#reelNext');
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

/* --- 포인터: 패럴랙스 + 액자 호버 + 클릭 --- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
addEventListener('pointermove', (e) => {
  state.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ui.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

function pickPainting() {
  ndc.copy(state.mouse);
  raycaster.setFromCamera(ndc, camera);
  const targets = paintings.map((p) => p.mesh);
  if (state.p < 1.0 && heroSculpture) {
    heroSculpture.traverse((c) => { if (c.isMesh) targets.push(c); });
  }
  const hit = raycaster.intersectObjects(targets, true)[0];
  if (!hit || hit.distance > 16) return null;
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
    if (P) startWarp(P, hit.uv);
  }
});

/* =====================================================================
 *  [Scene 5] 마리오64 워프 — 클로즈업 → 출렁임 → 페이지 이동
 * ===================================================================== */
function startWarp(P, uv) {
  state.warping = true;
  const center = new THREE.Vector3();
  P.mesh.getWorldPosition(center);
  const normal = new THREE.Vector3(0, 0, 1).transformDirection(P.mesh.matrixWorld).normalize();
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = (P.h / 2) / Math.tan(fov / 2);
  const fitW = (P.w / 2) / (Math.tan(fov / 2) * camera.aspect);
  const close = Math.max(fitH, fitW) * 0.98;
  const yaw = Math.atan2(-normal.x, -normal.z) + Math.PI;
  state.warp = {
    P,
    t0: performance.now(),
    from: { pos: camera.position.clone(), yaw: camera.rotation.y, pitch: camera.rotation.x },
    center,
    normal,
    close,
    yaw: Math.atan2(normal.x, normal.z),
    navigated: false,
  };
  void yaw;
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
  P.mat.uniforms.uWarp.value = smooth(0.7, 2.0, t);
  // 1) 클로즈업
  const k = easeInOut(clamp(t / 1.15, 0, 1));
  // 2) 그림 표면 속으로 다이빙
  const dive = easeInOut(clamp((t - 1.25) / 1.0, 0, 1));
  const dist = lerp(W.close, 0.18, dive);
  const target = W.center.clone().addScaledVector(W.normal, dist);
  camera.position.lerpVectors(W.from.pos, target, k);
  let dy = W.yaw - W.from.yaw;
  dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  camera.rotation.y = W.from.yaw + dy * k;
  camera.rotation.x = lerp(W.from.pitch, 0, k);
  camera.rotation.z = Math.sin(t * 6) * 0.012 * smooth(0.9, 1.8, t);
  camera.fov = lerp(42, 30, dive);
  camera.updateProjectionMatrix();
  if (t > 1.55) document.body.classList.add('warp-flash');
  if (t > 2.45 && !W.navigated) {
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
  camera.fov = 42;
  camera.rotation.z = 0;
  camera.updateProjectionMatrix();
  document.body.classList.remove('is-warping', 'warp-flash');
}
// 뒤로가기로 돌아왔을 때 (bfcache) 워프 상태 해제
addEventListener('pageshow', (e) => {
  if (e.persisted) resetWarp();
});

/* =====================================================================
 *  메인 루프
 * ===================================================================== */
const camState = { pos: new THREE.Vector3(), yaw: 0, pitch: 0 };
const clock = new THREE.Clock();

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  const now = performance.now();

  // 스크롤 스냅
  if (!state.warping && now - state.lastWheel > 240) {
    const snap = Math.round(state.target);
    state.target = damp(state.target, snap, 7, dt);
    if (Math.abs(state.target - snap) < 0.001) state.target = snap;
  }
  state.p = damp(state.p, state.target, 3.2, dt);
  const pe = easeStops(state.p);

  // ---- 시퀀스 파라미터
  const heroSink = smooth(0.12, 0.8, pe);
  const dim = smooth(0.15, 0.7, pe);
  const beamOn = smooth(0.4, 0.85, pe) * (1 - smooth(1.08, 1.32, pe));
  const screenOn = smooth(0.5, 0.92, pe) * (1 - smooth(1.12, 1.34, pe));
  const roll = smooth(1.22, 1.55, pe);
  const doorOpen = smooth(1.42, 1.92, pe);
  const inHall = smooth(1.7, 2.4, pe);

  // ---- 히어로 3D 조각상
  heroFloat.position.y = 0.5 - heroSink * 6.0;
  heroFloat.rotation.y = time * 0.18 + state.look.x * 0.12;
  hero.position.y = -heroSink * 4.0;
  hero.visible = heroSink < 0.92;
  heroSpot.intensity = 14 * (1 - heroSink);
  heroRimLight.intensity = 12 * (1 - heroSink);
  jellyDust.forEach((d) => { d.material.uniforms.uOpacity.value = 0.9 * (1 - heroSink) + 0.05; });

  // ---- 조명 (프로젝터가 켜지면 어두워짐)
  const lobbyLevel = 1 - dim * 0.82 + doorOpen * 0.15;
  hemi.intensity = 0.55 * lobbyLevel + 0.12;
  lobbyFill.forEach((s) => (s.intensity = 90 * lobbyLevel));
  M.stripCool.color.setRGB(1.6, 1.8, 2.2).multiplyScalar(0.25 + 0.75 * lobbyLevel);

  // ---- 프로젝터
  beamMat.uniforms.uOpacity.value = beamOn;
  beamCoreMat.uniforms.uOpacity.value = beamOn * 0.8;
  beam.visible = beamCore.visible = beamOn > 0.001;
  beamDust.material.uniforms.uOpacity.value = beamOn * 0.85;
  lensFlare.material.opacity = beamOn;
  lensFlare.scale.setScalar(2.0 + Math.sin(time * 30) * 0.03);
  projector.userData.glass.material.color.setRGB(0.1 + beamOn * 3, 0.1 + beamOn * 3.2, 0.15 + beamOn * 3.6);
  projector.userData.led.material.color.setRGB(beamOn > 0.1 ? 0.2 : 2, beamOn > 0.1 ? 2.5 : 0.1, 0.1);
  screenMat.uniforms.uOn.value = screenOn;
  screenLight.intensity = 0; // 영상 표면에 불필요한 인공광을 배제하여 원본 색감 유지
  audio.setProjector(beamOn);
  if (beamOn > 0.15 && state.prevBeam <= 0.15) audio.click();
  state.prevBeam = beamOn;

  // 비디오 재생 제어
  const wantVideo = screenOn > 0.02 && !document.hidden;
  if (wantVideo !== state.videoWanted) {
    state.videoWanted = wantVideo;
    if (wantVideo) video.play().catch(() => {});
    else video.pause();
  }
  video.volume = clamp(screenOn, 0, 1);

  // ---- 스크린 롤업 & 문
  screenGroup.scale.y = Math.max(0.0001, 1 - roll);
  screenRod.position.y = SCREEN.top - (SCREEN.h + 0.15) * (1 - roll) - 0.02;
  doorPivots.forEach(({ pivot, s }) => { pivot.rotation.y = -s * doorOpen * 1.72; });
  doorLight.intensity = 60 * doorOpen;
  doorMat.emissiveIntensity = 0.25 + doorOpen * 0.9 + (1 - doorOpen) * smooth(1.2, 1.42, pe) * 0.6;
  lightSpill.material.opacity = doorOpen * 0.5 * (1 - inHall * 0.7);
  if (doorOpen > 0.02 && state.prevDoor <= 0.02) audio.door();
  state.prevDoor = doorOpen;

  // ---- 갤러리
  hallDust.material.uniforms.uOpacity.value = 0.25 + inHall * 0.6;
  paintings.forEach((P, i) => {
    const focus = 1 - smooth(0, 1.2, Math.abs(pe - (STOP_FIRST_WORK + i)));
    P.spot.intensity = (28 + focus * 70) * (0.25 + doorOpen * 0.75);
    P.mat.uniforms.uLight.value = 0.62 + focus * 0.5;
  });

  // ---- 호버
  if (!state.warping && state.started) {
    const hit = pickPainting();
    const obj = hit ? hit.object : null;
    if (obj !== state.hovered) {
      if (obj) audio.blip(obj.userData && obj.userData.isHero ? 0.85 : 1 + ((obj.userData && obj.userData.workIndex) || 0) * 0.06);
      state.hovered = obj;
      document.body.classList.toggle('is-hover', !!obj);
      if (obj) ui.cursorLabel.textContent = (obj.userData && obj.userData.isHero) ? 'EXPLORE EXHIBITION' : 'CLICK · DIVE IN';
    }
    paintings.map((p) => p.mat).forEach((m) => {
      const isHover = obj && obj.material === m;
      if (isHover) m.uniforms.uHover.value.lerp(hit.uv, 0.3);
      m.uniforms.uHoverAmp.value = damp(m.uniforms.uHoverAmp.value, isHover ? 1 : 0, 4, dt);
    });
  }
  paintings.map((p) => p.mat).forEach((m) => (m.uniforms.uTime.value = time));

  // ---- 셰이더 시간
  beamMat.uniforms.uTime.value = time;
  beamCoreMat.uniforms.uTime.value = time;
  screenMat.uniforms.uTime.value = time;
  [beamDust, hallDust, ...jellyDust].forEach((d) => (d.material.uniforms.uTime.value = time));

  // ---- 엔딩 땡큐 사인 (문 열릴 때는 안 보이고, 마지막 앨범에 도달했을 때만 비로소 점등)
  if (endSignMesh) {
    const endFocus = smooth(MAX_STOP - 0.7, MAX_STOP, pe);
    endSignMesh.material.opacity = endFocus;
    endSignMesh.visible = endFocus > 0.005;
  }

  // ---- 카메라
  if (state.warping) {
    updateWarp(now);
  } else {
    cameraAt(pe, camState);
    if (pe < 1.4) {
      // 첫 부분(로비)과 영상 틀어지는 부분은 마우스를 움직여도 화면이 흔들리지 않고 완전 고정
      state.look.set(0, 0);
    } else {
      state.look.x = damp(state.look.x, Math.abs(state.mouse.x) <= 1 ? state.mouse.x : 0, 2.5, dt);
      state.look.y = damp(state.look.y, Math.abs(state.mouse.y) <= 1 ? state.mouse.y : 0, 2.5, dt);
    }
    const breathe = Math.sin(time * 0.6) * 0.02;
    camera.position.copy(camState.pos);
    camera.position.x += state.look.x * 0.25;
    camera.position.y += state.look.y * 0.12 + breathe;
    camera.rotation.y = camState.yaw - state.look.x * 0.045;
    camera.rotation.x = camState.pitch + state.look.y * 0.03;
    camera.rotation.z = 0;
  }

  
  // ---- UI
  updateUI(pe);
  composer.render();
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
  composer.setSize(innerWidth, innerHeight);
  bloom.setSize(innerWidth, innerHeight);
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
const texturesReady = new Promise((res) => { manager.onLoad = res; });
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load(`600 100px 'Cormorant Garamond'`),
    document.fonts.load(`500 100px 'Space Grotesk'`),
    document.fonts.load(`700 100px 'Noto Sans KR'`),
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

Promise.all([texturesReady, fontsReady]).then(() => {
  buildLobbySigns();
  paintings.forEach((P) => P.layout());
  renderer.compile(scene, camera);
  ui.loader.classList.add('ready');
  ui.pct.textContent = '100%';
  ui.bar.style.transform = 'scaleX(1)';
  // 작품 페이지에서 돌아온 경우 / 디버그 모드: 바로 입장
  const returning = /work-|gallery/.test(location.hash) || params.has('p');
  if (returning) {
    let snd = false;
    try { snd = sessionStorage.getItem('induk-sound') === '1'; } catch (e) {}
    enter(false);
    if (snd) ui.soundBtn.classList.add('pulse');
  }
});

update();
