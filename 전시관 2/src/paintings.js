/* =====================================================================
 *  임시 전시용 "유화 풍" 그림 생성기
 *  - 학생 작품 이미지가 들어오기 전까지 액자에 걸어 둘 그림을 코드로 그립니다.
 *  - 같은 번호(seed)는 항상 같은 그림이 나오므로, 3D 전시장과 작품 페이지가
 *    동일한 그림을 보여 줍니다.
 *  - three.js 에 의존하지 않으므로 일반 HTML 페이지에서도 import 할 수 있습니다.
 * ===================================================================== */

function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ['#1f2a44', '#3d4f74', '#c9774a', '#f0c27b', '#f7e3b5', '#2b1d17'], // 황혼
  ['#0f1b2b', '#1f3a5a', '#4f7ca8', '#dbe6ef', '#f2d48f', '#0a0f18'], // 달밤 바다
  ['#2d3b23', '#4f6b35', '#8aa356', '#d9c78a', '#f1ead2', '#1b2214'], // 숲
  ['#5a1f1b', '#a2412f', '#d98c4f', '#efd3a3', '#2c1a14', '#f6ead8'], // 붉은 정물
  ['#16283d', '#244b78', '#e3b23c', '#f1e6c8', '#0b1422', '#6b8fb8'], // 별밤
  ['#3a2f4b', '#6a4f7c', '#c79bb5', '#f2d7c9', '#e2a86b', '#1c1626'], // 라벤더
];

/* ---------- 공통 붓터치 헬퍼 ---------- */
function stroke(g, r, x, y, len, w, ang, color, alpha) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(0, 0, len, w, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function dabArea(g, r, x0, y0, x1, y1, colors, n, size, angBase = 0, angVar = 0.5, alpha = 0.35) {
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    const c = colors[Math.floor(r() * colors.length)];
    stroke(g, r, x, y, size * (0.6 + r()), size * (0.18 + r() * 0.2), angBase + (r() - 0.5) * angVar, c, alpha * (0.5 + r() * 0.5));
  }
}

function vGrad(g, W, H, stops) {
  const grd = g.createLinearGradient(0, 0, 0, H);
  stops.forEach(([t, c]) => grd.addColorStop(t, c));
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
}

function ridge(g, r, W, H, baseY, amp, color, rough = 6) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, H);
  let y = baseY;
  for (let x = 0; x <= W; x += W / 60) {
    y += (r() - 0.5) * amp / rough;
    y = Math.min(baseY + amp, Math.max(baseY - amp, y));
    g.lineTo(x, y - Math.sin((x / W) * Math.PI * (1 + r())) * amp * 0.6);
  }
  g.lineTo(W, H);
  g.closePath();
  g.fill();
}

/* ---------- 화풍들 ---------- */
const STYLES = {
  // 낭만주의 풍경 — 노을, 산맥, 호수
  landscape(g, W, H, r, p) {
    vGrad(g, W, H, [[0, p[0]], [0.35, p[1]], [0.55, p[2]], [0.62, p[3]]]);
    const sx = W * (0.3 + r() * 0.4), sy = H * 0.5;
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, W * 0.35);
    sun.addColorStop(0, 'rgba(255,240,200,.95)');
    sun.addColorStop(0.15, 'rgba(255,210,140,.5)');
    sun.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, W, H);
    dabArea(g, r, 0, 0, W, H * 0.5, [p[3], p[4], p[2]], 260, W * 0.05, 0, 0.25, 0.18);
    ridge(g, r, W, H, H * 0.52, H * 0.08, '#4b4560');
    ridge(g, r, W, H, H * 0.6, H * 0.06, '#33304a');
    // 호수
    g.fillStyle = p[1];
    g.globalAlpha = 0.85;
    g.fillRect(0, H * 0.68, W, H * 0.14);
    g.globalAlpha = 1;
    for (let i = 0; i < 70; i++) stroke(g, r, sx + (r() - 0.5) * W * 0.25, H * (0.69 + r() * 0.12), W * 0.03, 2, 0, p[4], 0.45);
    ridge(g, r, W, H, H * 0.84, H * 0.04, p[5]);
    dabArea(g, r, 0, H * 0.8, W, H, [p[5], '#3a2b20', '#51402c'], 300, W * 0.03, 0, 0.6, 0.5);
  },

  // 달밤 바다
  seascape(g, W, H, r, p) {
    vGrad(g, W, H, [[0, p[5]], [0.45, p[0]], [0.55, p[1]], [1, p[0]]]);
    const mx = W * (0.25 + r() * 0.5), my = H * 0.22;
    const moon = g.createRadialGradient(mx, my, 0, mx, my, W * 0.22);
    moon.addColorStop(0, 'rgba(250,245,225,1)');
    moon.addColorStop(0.08, 'rgba(250,245,225,.9)');
    moon.addColorStop(0.1, 'rgba(220,230,240,.35)');
    moon.addColorStop(1, 'rgba(200,220,240,0)');
    g.fillStyle = moon;
    g.fillRect(0, 0, W, H);
    dabArea(g, r, 0, 0, W, H * 0.45, [p[1], p[2], p[0]], 220, W * 0.06, 0, 0.3, 0.2);
    for (let y = H * 0.5; y < H; y += 5) {
      const n = 6 + Math.floor((y / H) * 10);
      for (let i = 0; i < n; i++) {
        const near = Math.abs((r() * W) - mx) < W * 0.12;
        stroke(g, r, r() * W, y + r() * 4, W * (0.02 + r() * 0.04), 1.6 + (y / H) * 3, (r() - 0.5) * 0.1, near && r() > 0.4 ? p[4] : r() > 0.5 ? p[2] : p[1], 0.5);
      }
    }
    // 작은 범선
    g.fillStyle = '#0b0f17';
    const bx = W * (0.15 + r() * 0.6), by = H * 0.6;
    g.beginPath(); g.moveTo(bx - 40, by); g.lineTo(bx + 40, by); g.lineTo(bx + 28, by + 12); g.lineTo(bx - 28, by + 12); g.fill();
    g.beginPath(); g.moveTo(bx, by - 70); g.lineTo(bx, by); g.lineTo(bx + 34, by - 6); g.fill();
    g.beginPath(); g.moveTo(bx - 3, by - 60); g.lineTo(bx - 3, by - 4); g.lineTo(bx - 36, by - 8); g.fill();
  },

  // 인상주의 숲길
  forest(g, W, H, r, p) {
    vGrad(g, W, H, [[0, p[4]], [0.5, p[3]], [1, p[0]]]);
    dabArea(g, r, 0, 0, W, H * 0.7, [p[1], p[2], p[3], p[4]], 900, W * 0.025, -0.4, 1.4, 0.45);
    for (let i = 0; i < 9; i++) {
      const x = r() * W, w = 10 + r() * 22;
      g.fillStyle = p[5];
      g.globalAlpha = 0.85;
      g.fillRect(x, H * (0.1 + r() * 0.3), w, H);
      g.globalAlpha = 1;
    }
    // 길
    g.fillStyle = p[3];
    g.beginPath();
    g.moveTo(W * 0.42, H * 0.62); g.lineTo(W * 0.58, H * 0.62); g.lineTo(W * 0.9, H); g.lineTo(W * 0.1, H);
    g.fill();
    dabArea(g, r, 0, H * 0.6, W, H, [p[0], p[1], p[2], p[3]], 700, W * 0.02, 0, 0.6, 0.5);
    dabArea(g, r, W * 0.3, H * 0.62, W * 0.7, H, [p[4], p[3]], 160, W * 0.02, 0, 0.3, 0.4);
  },

  // 정물 — 화병과 꽃
  stillLife(g, W, H, r, p) {
    vGrad(g, W, H, [[0, p[4]], [0.7, p[3]], [0.7, p[1]], [1, p[0]]]);
    dabArea(g, r, 0, 0, W, H * 0.7, [p[3], p[4]], 500, W * 0.03, 0.2, 0.8, 0.1);
    const cx = W * (0.4 + r() * 0.2), vy = H * 0.72;
    // 화병
    g.fillStyle = p[1];
    g.beginPath();
    g.moveTo(cx - 40, vy - 150);
    g.bezierCurveTo(cx - 140, vy - 60, cx - 110, vy + 40, cx - 60, vy + 60);
    g.lineTo(cx + 60, vy + 60);
    g.bezierCurveTo(cx + 110, vy + 40, cx + 140, vy - 60, cx + 40, vy - 150);
    g.fill();
    stroke(g, r, cx - 50, vy - 50, 14, 60, 0.1, 'rgba(255,240,220,.6)', 0.5);
    // 꽃
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
      const d = 120 + r() * 170;
      const fx = cx + Math.cos(a) * d, fy = vy - 150 + Math.sin(a) * d * 0.8;
      g.strokeStyle = '#3d4a28'; g.lineWidth = 3; g.globalAlpha = 0.8;
      g.beginPath(); g.moveTo(cx, vy - 140); g.quadraticCurveTo(cx + (fx - cx) * 0.3, fy + 60, fx, fy); g.stroke();
      g.globalAlpha = 1;
      const col = [p[2], p[4], p[3], '#e9d6e8'][Math.floor(r() * 4)];
      for (let k = 0; k < 7; k++) stroke(g, r, fx + (r() - 0.5) * 30, fy + (r() - 0.5) * 30, 18 + r() * 12, 10 + r() * 6, r() * 3, col, 0.7);
      stroke(g, r, fx, fy, 6, 6, 0, '#f2c14e', 0.9);
    }
    // 과일
    for (let i = 0; i < 3; i++) {
      const fx = cx + 160 + i * 60 + r() * 20, fy = vy + 40;
      stroke(g, r, fx, fy, 30, 28, 0, i === 1 ? p[3] : p[2], 0.95);
      stroke(g, r, fx - 8, fy - 10, 8, 6, 0, 'rgba(255,255,255,.7)', 0.6);
    }
  },

  // 별이 소용돌이치는 밤
  starryNight(g, W, H, r, p) {
    g.fillStyle = p[0];
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) {
      const x = r() * W, y = r() * H * 0.75;
      const ang = Math.atan2(y - H * 0.35, x - W * 0.5) + Math.PI / 2 + Math.sin(x * 0.01) * 0.4;
      stroke(g, r, x, y, 9 + r() * 10, 2.2, ang, [p[1], p[5], p[2] , p[1], p[3]][Math.floor(r() * 5)], 0.55);
    }
    for (let i = 0; i < 11; i++) {
      const x = r() * W, y = r() * H * 0.55, rad = 10 + r() * 22;
      const gl = g.createRadialGradient(x, y, 0, x, y, rad * 3);
      gl.addColorStop(0, 'rgba(255,240,170,1)'); gl.addColorStop(0.3, 'rgba(240,200,90,.6)'); gl.addColorStop(1, 'rgba(240,200,90,0)');
      g.fillStyle = gl; g.fillRect(x - rad * 3, y - rad * 3, rad * 6, rad * 6);
    }
    ridge(g, r, W, H, H * 0.78, H * 0.05, '#0e1a2c');
    // 마을 불빛
    for (let i = 0; i < 26; i++) {
      const x = r() * W, y = H * (0.82 + r() * 0.12);
      g.fillStyle = '#1b2a3e'; g.fillRect(x, y, 26, 20);
      g.fillStyle = p[2]; g.fillRect(x + 8, y + 6, 6, 6);
    }
    // 사이프러스 나무
    g.fillStyle = '#0d140f';
    const tx = W * (r() > 0.5 ? 0.15 : 0.8);
    g.beginPath(); g.moveTo(tx - 50, H); g.quadraticCurveTo(tx - 30, H * 0.4, tx, H * 0.12); g.quadraticCurveTo(tx + 30, H * 0.4, tx + 50, H); g.fill();
  },

  // 색면 추상 (로스코 풍)
  colorField(g, W, H, r, p) {
    g.fillStyle = p[0];
    g.fillRect(0, 0, W, H);
    const bands = 2 + Math.floor(r() * 2);
    let y = H * 0.07;
    const gap = H * 0.05;
    const bh = (H * 0.86 - gap * (bands - 1)) / bands;
    for (let i = 0; i < bands; i++) {
      const c = p[1 + Math.floor(r() * 4)];
      for (let k = 0; k < 160; k++) stroke(g, r, W * 0.1 + r() * W * 0.8, y + r() * bh, W * 0.08, bh * 0.25, 0, c, 0.12);
      g.globalAlpha = 0.75;
      g.fillStyle = c;
      g.fillRect(W * 0.09, y + 6, W * 0.82, bh - 12);
      g.globalAlpha = 1;
      dabArea(g, r, W * 0.09, y, W * 0.91, y + bh, [c, p[4]], 120, W * 0.05, 0, 0.2, 0.12);
      y += bh + gap;
    }
  },

  // 기하 추상 (칸딘스키 풍)
  geometric(g, W, H, r, p) {
    vGrad(g, W, H, [[0, p[4]], [1, p[3]]]);
    dabArea(g, r, 0, 0, W, H, [p[4], p[3]], 300, W * 0.06, 0, 3, 0.2);
    for (let i = 0; i < 9; i++) {
      const x = r() * W, y = r() * H, rad = 20 + r() * 110;
      g.globalAlpha = 0.85;
      g.fillStyle = p[Math.floor(r() * 4)];
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      g.strokeStyle = p[5]; g.lineWidth = 3; g.stroke();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = p[5]; g.lineWidth = 2 + r() * 6;
      g.beginPath(); g.moveTo(r() * W, r() * H); g.lineTo(r() * W, r() * H); g.stroke();
    }
    for (let i = 0; i < 5; i++) {
      g.save();
      g.translate(r() * W, r() * H); g.rotate(r() * Math.PI);
      g.fillStyle = p[Math.floor(r() * 4)]; g.globalAlpha = 0.8;
      g.beginPath(); g.moveTo(0, -60 - r() * 60); g.lineTo(50 + r() * 40, 40); g.lineTo(-50 - r() * 40, 40); g.fill();
      g.restore();
    }
    g.globalAlpha = 1;
  },
};

const STYLE_ORDER = ['landscape', 'seascape', 'stillLife', 'starryNight', 'forest', 'colorField', 'geometric'];

/* ---------- 유화 마감: 캔버스 결, 바니시, 비네팅 ---------- */
function finishOil(g, W, H, r) {
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const weave = ((x % 4 < 2) ^ (y % 4 < 2) ? 4 : -4) + (r() - 0.5) * 10;
      d[i] = d[i] + weave;
      d[i + 1] = d[i + 1] + weave;
      d[i + 2] = d[i + 2] + weave;
    }
  }
  g.putImageData(img, 0, 0);
  // 따뜻한 바니시 톤
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = 'rgba(255, 236, 205, 0.55)';
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(20,10,0,0.45)');
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
}

/** 번호(1부터)에 해당하는 임시 그림을 그린 canvas 를 돌려줍니다. */
export function paintPlaceholder(no, { width = 1024, variant = 0 } = {}) {
  const r = rng(no * 97 + variant * 7919 + 13);
  const style = STYLE_ORDER[(no - 1 + variant) % STYLE_ORDER.length];
  const pal = PALETTES[(no * 5 + variant) % PALETTES.length];
  // 가로형 / 세로형을 번갈아 사용
  const portrait = (no + variant) % 3 === 0;
  const W = width;
  const H = Math.round(portrait ? width * 1.25 : width * 0.75);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  // 그리는 좌표계를 1024 기준으로 통일
  const s = W / 1024;
  g.save();
  g.scale(s, s);
  STYLES[style](g, 1024, H / s, r, pal);
  g.restore();
  g.globalAlpha = 1;
  finishOil(g, W, H, r);
  return c;
}

export const PAINTING_STYLE_NAMES = {
  landscape: '풍경화 · Romantic Landscape',
  seascape: '바다 풍경 · Moonlit Seascape',
  stillLife: '정물화 · Still Life with Flowers',
  starryNight: '야경 · Swirling Night',
  forest: '인상주의 · Forest Path',
  colorField: '색면 추상 · Color Field',
  geometric: '기하 추상 · Composition',
};

export function placeholderStyle(no) {
  return STYLE_ORDER[(no - 1) % STYLE_ORDER.length];
}
