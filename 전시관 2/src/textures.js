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
  const w = 1024, h = 340;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#d8c79a');
  grd.addColorStop(0.5, '#f3e6bf');
  grd.addColorStop(1, '#b89a5a');
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,40,10,.55)';
  g.lineWidth = 6;
  g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = '#2a1d08';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 44px ${GROT}`;
  spaced(g, `No. ${work.no}  ·  ${work.en}`, w / 2, 92, 6);
  g.font = `700 78px ${SANS}`;
  g.fillText(work.title, w / 2, 182, w - 80);
  g.font = `400 34px ${GROT}`;
  g.fillStyle = '#4a3a1c';
  g.fillText(work.genre, w / 2, 262, w - 80);
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
