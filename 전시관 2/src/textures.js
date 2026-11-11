import * as THREE from 'three';

const SERIF = "'Cormorant Garamond', 'Noto Serif KR', serif";
const SANS = "'Noto Sans KR', 'Space Grotesk', sans-serif";
const GROT = "'Space Grotesk', 'Noto Sans KR', sans-serif";
export const FONTS = { SERIF, SANS, GROT };

function finish(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function spaced(g, text, x, y, spacing) {
  // letter-spacing 지원 (canvas 기본 미지원 브라우저 대비)
  if ('letterSpacing' in g) {
    g.letterSpacing = spacing + 'px';
    g.fillText(text, x, y);
    g.letterSpacing = '0px';
    return;
  }
  g.fillText(text, x, y);
}

/** 여러 줄 텍스트 사인 (투명 배경) */
export function textSign(lines, { w = 2048, h = 512, bg = null, align = 'center' } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.textAlign = align;
  g.textBaseline = 'middle';
  for (const L of lines) {
    g.font = L.font;
    g.fillStyle = L.color || '#fff';
    g.shadowColor = L.glow || 'transparent';
    g.shadowBlur = L.blur || 0;
    const x = align === 'center' ? w / 2 : align === 'left' ? (L.x ?? 60) : w - (L.x ?? 60);
    spaced(g, L.text, x, L.y, L.spacing || 0);
  }
  return finish(c);
}

/** 갤러리 액자 아래 작품 명패 */
export function plaqueTexture(work) {
  // 미술관 벽면 캡션 카드 (아이보리 바탕 + 짙은 글씨)
  const w = 1024, h = 340;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#efe8da';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,96,60,.5)';
  g.lineWidth = 4;
  g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#2a2118';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `600 40px ${GROT}`;
  g.fillStyle = '#8a6a3a';
  spaced(g, `No. ${work.no}`, 56, 74, 8);
  g.fillStyle = '#2a2118';
  g.font = `700 64px ${SANS}`;
  g.fillText(work.title, 56, 150, w - 112);
  g.font = `500 40px ${SANS}`;
  g.fillStyle = '#4a3c2a';
  g.fillText(work.student || '', 56, 222, w - 112);
  g.font = `400 32px ${GROT}`;
  g.fillStyle = '#6d5c44';
  g.fillText(work.genre, 56, 278, w - 112);
  return finish(c);
}

/** 콘크리트/석재 느낌 노이즈 텍스처 */
export function noiseTexture(base = '#3a3d44', amount = 18, size = 512, repeat = 4) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  // 은은한 얼룩
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 20 + Math.random() * 90;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(0,0,0,${Math.random() * 0.06})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, size, size);
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

/** 원목 마루 텍스처 (내부 갤러리 바닥) */
export function woodTexture() {
  const W = 1024, H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const plank = 128;
  for (let x = 0; x < W; x += plank) {
    let y = -Math.random() * 400;
    while (y < H) {
      const len = 300 + Math.random() * 400;
      const l = 22 + Math.random() * 10;
      g.fillStyle = `hsl(24, 38%, ${l}%)`;
      g.fillRect(x, y, plank, len);
      for (let k = 0; k < 26; k++) {
        g.strokeStyle = `rgba(30,15,5,${0.05 + Math.random() * 0.1})`;
        g.lineWidth = 1 + Math.random() * 2;
        g.beginPath();
        const gx = x + Math.random() * plank;
        g.moveTo(gx, y);
        g.bezierCurveTo(gx + 6, y + len * 0.3, gx - 6, y + len * 0.6, gx + 3, y + len);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,.55)';
      g.fillRect(x, y, plank, 3);
      y += len;
    }
    g.fillStyle = 'rgba(0,0,0,.6)';
    g.fillRect(x, 0, 3, H);
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** 아르데코 문 패널 (color + emissive) */
export function doorTextures() {
  const W = 512, H = 1229;
  const make = (emissive) => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = emissive ? '#000' : '#14100c';
    g.fillRect(0, 0, W, H);
    if (!emissive) {
      const grd = g.createLinearGradient(0, 0, W, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0.04)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.25)');
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);
    }
    g.strokeStyle = emissive ? '#ffcf7a' : '#c9a05a';
    g.lineWidth = 6;
    g.strokeRect(40, 40, W - 80, H - 80);
    g.lineWidth = 3;
    g.strokeRect(70, 70, W - 140, H - 140);
    // 선버스트 패턴
    const cx = W / 2, cy = H * 0.42;
    for (let i = 0; i < 15; i++) {
      const a = Math.PI + (i / 14) * Math.PI;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * 210, cy + Math.sin(a) * 300);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, 80, Math.PI, 0);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, 140, Math.PI, 0);
    g.stroke();
    for (let i = 0; i < 6; i++) {
      g.strokeRect(110, cy + 60 + i * 70, W - 220, 40);
    }
    return finish(c);
  };
  return { map: make(false), emissive: make(true) };
}

/* =====================================================================
 *  고전 미술관용 텍스처 (무광 대리석 / 회벽 / 다마스크 / 천장 격자)
 * ===================================================================== */
function veins(g, size, color, count, width) {
  for (let i = 0; i < count; i++) {
    g.strokeStyle = color;
    g.lineWidth = width * (0.4 + Math.random());
    g.globalAlpha = 0.08 + Math.random() * 0.18;
    g.beginPath();
    let x = Math.random() * size, y = Math.random() * size;
    g.moveTo(x, y);
    for (let k = 0; k < 14; k++) {
      x += (Math.random() - 0.3) * size * 0.12;
      y += (Math.random() - 0.5) * size * 0.08;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
}

/** 체커보드 대리석 바닥 (반사 없는 무광) */
export function marbleFloorTexture({ light = '#d9d2c4', dark = '#3b3631', tiles = 4 } = {}) {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const t = S / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      const isLight = (x + y) % 2 === 0;
      g.fillStyle = isLight ? light : dark;
      g.fillRect(x * t, y * t, t, t);
    }
  }
  veins(g, S, '#8c8274', 26, 3);
  veins(g, S, '#ffffff', 14, 2);
  g.strokeStyle = 'rgba(40,32,24,.45)';
  g.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    g.beginPath(); g.moveTo(i * t, 0); g.lineTo(i * t, S); g.stroke();
    g.beginPath(); g.moveTo(0, i * t); g.lineTo(S, i * t); g.stroke();
  }
  const tex = finish(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** 은은한 석회 회벽 / 대리석 벽 */
export function plasterTexture(base = '#d8cdb8', repeat = 3) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 20 + Math.random() * 80;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    const l = Math.random() > 0.5 ? '255,250,240' : '120,100,80';
    rg.addColorStop(0, `rgba(${l},${Math.random() * 0.06})`);
    rg.addColorStop(1, `rgba(${l},0)`);
    g.fillStyle = rg;
    g.fillRect(0, 0, S, S);
  }
  veins(g, S, '#a89a82', 6, 1.5);
  const tex = finish(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}

/** 갤러리 벽 다마스크 패브릭 (짙은 녹색/와인색) */
export function damaskTexture(base = '#2f3b33', motif = 'rgba(255,240,200,0.06)') {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  // 직물 결
  for (let y = 0; y < S; y += 2) {
    g.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.04})`;
    g.fillRect(0, y, S, 1);
  }
  g.fillStyle = motif;
  g.strokeStyle = motif;
  const drawMotif = (cx, cy, s) => {
    g.save();
    g.translate(cx, cy);
    g.scale(s, s);
    g.beginPath();
    g.moveTo(0, -90);
    g.bezierCurveTo(40, -60, 60, -10, 0, 40);
    g.bezierCurveTo(-60, -10, -40, -60, 0, -90);
    g.fill();
    g.beginPath();
    g.moveTo(0, 40);
    g.bezierCurveTo(50, 60, 70, 100, 0, 110);
    g.bezierCurveTo(-70, 100, -50, 60, 0, 40);
    g.fill();
    g.lineWidth = 4;
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.moveTo(0, -20);
      g.bezierCurveTo(sx * 60, -50, sx * 100, 0, sx * 70, 50);
      g.bezierCurveTo(sx * 50, 80, sx * 20, 60, sx * 30, 30);
      g.stroke();
    }
    g.restore();
  };
  drawMotif(S / 2, S / 2, 1);
  drawMotif(0, 0, 1);
  drawMotif(S, 0, 1);
  drawMotif(0, S, 1);
  drawMotif(S, S, 1);
  const tex = finish(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** 천장 격자(코퍼) 패널 */
export function cofferTexture(base = '#e7dfcf') {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  const m = 36;
  const grd = g.createLinearGradient(m, m, S - m, S - m);
  grd.addColorStop(0, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0.08)');
  g.fillStyle = grd;
  g.fillRect(m, m, S - m * 2, S - m * 2);
  g.fillStyle = base;
  g.fillRect(m + 30, m + 30, S - (m + 30) * 2, S - (m + 30) * 2);
  g.strokeStyle = 'rgba(176,138,72,0.8)';
  g.lineWidth = 6;
  g.strokeRect(m + 30, m + 30, S - (m + 30) * 2, S - (m + 30) * 2);
  // 중앙 로제트
  g.fillStyle = 'rgba(176,138,72,0.7)';
  for (let i = 0; i < 8; i++) {
    g.save();
    g.translate(S / 2, S / 2);
    g.rotate((i / 8) * Math.PI * 2);
    g.beginPath();
    g.ellipse(0, -30, 10, 28, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.beginPath();
  g.arc(S / 2, S / 2, 12, 0, Math.PI * 2);
  g.fill();
  const tex = finish(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** 고전 목재 문 패널 */
export function classicDoorTexture() {
  const W = 512, H = 1229;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0, '#3a2416');
  grd.addColorStop(0.5, '#4a2e1c');
  grd.addColorStop(1, '#2e1c11');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) {
    g.strokeStyle = `rgba(20,10,4,${0.08 + Math.random() * 0.12})`;
    g.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * W;
    g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 8, H * 0.3, x - 8, H * 0.6, x + 4, H); g.stroke();
  }
  const panel = (x, y, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(214,176,108,0.85)';
    g.lineWidth = 5;
    g.strokeRect(x + 14, y + 14, w - 28, h - 28);
    g.strokeStyle = 'rgba(255,230,190,0.12)';
    g.lineWidth = 3;
    g.strokeRect(x + 2, y + 2, w - 4, h - 4);
  };
  panel(60, 70, W - 120, 520);
  panel(60, 650, W - 120, 220);
  panel(60, 930, W - 120, 230);
  return finish(c);
}
