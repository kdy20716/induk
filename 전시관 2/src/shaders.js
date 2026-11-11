import * as THREE from 'three';

/* ------------------------------------------------------------------
 *  마리오64 스타일 "출렁이는 그림" 머티리얼
 *  - 마우스 호버: 커서 위치에서 잔잔한 물결
 *  - 클릭(워프): 클릭 지점에서 동심원 파동이 퍼지며 점점 크게 출렁임
 * ------------------------------------------------------------------ */
export function createPaintingMaterial(texture, aspect) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uTime: { value: 0 },
      uAspect: { value: aspect },
      uHover: { value: new THREE.Vector2(0.5, 0.5) },
      uHoverAmp: { value: 0 },
      uClick: { value: new THREE.Vector2(0.5, 0.5) },
      uClickT: { value: -1 },
      uLight: { value: 1 },
      uWarp: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uAspect, uHoverAmp, uClickT, uWarp;
      uniform vec2 uHover, uClick;
      varying vec2 vUv;
      varying float vH;
      varying vec3 vWorld;

      float ripple(vec2 uv, vec2 c, float t, float freq, float speed, float decay) {
        vec2 d2 = (uv - c) * vec2(uAspect, 1.0);
        float d = length(d2);
        return sin(d * freq - t * speed) * exp(-d * decay);
      }

      void main() {
        vUv = uv;
        float h = 0.0;
        // 호버: 잔잔한 물결
        h += uHoverAmp * 0.035 * ripple(uv, uHover, uTime, 34.0, 7.0, 3.2);
        // 클릭: 퍼져나가는 파동 (마리오64)
        if (uClickT >= 0.0) {
          vec2 d2 = (uv - uClick) * vec2(uAspect, 1.0);
          float d = length(d2);
          float front = uClickT * 1.25;
          float behind = smoothstep(front, front - 0.25, d);
          float amp = (0.06 + 0.22 * uWarp) * behind * exp(-d * 1.1);
          h += amp * sin(d * (26.0 - 8.0 * uWarp) - uClickT * 11.0);
          // 두번째 파동 (간섭 무늬)
          h += amp * 0.45 * sin(d * 41.0 - uClickT * 17.0 + 1.3);
        }
        vH = h;
        vec3 p = position + vec3(0.0, 0.0, h);
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uLight, uWarp, uTime;
      varying vec2 vUv;
      varying float vH;
      varying vec3 vWorld;

      void main() {
        // 표면 기울기 → 굴절 + 반사 하이라이트
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        float gx = dFdx(vH) * 60.0;
        float gy = dFdy(vH) * 60.0;
        vec2 uv = vUv + vec2(gx, gy) * (0.6 + uWarp * 2.0);
        vec3 col = texture2D(uMap, clamp(uv, 0.001, 0.999)).rgb;

        // 수면처럼 반짝이는 스페큘러
        float spec = pow(clamp(abs(gx) + abs(gy), 0.0, 1.0), 1.6);
        col += vec3(1.0, 0.97, 0.9) * spec * (0.55 + uWarp * 0.9);

        // 상단 스포트라이트 느낌 (그림 위쪽이 살짝 밝게)
        float pool = 0.82 + 0.28 * smoothstep(0.0, 1.0, vUv.y) - 0.18 * length(vUv - vec2(0.5, 0.62));
        col *= uLight * pool;

        // 워프 순간 빛나며 그림 속으로 빨려들어감
        col = mix(col, col * 1.6 + vec3(0.08, 0.06, 0.12), uWarp * 0.6);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/* ------------------------------------------------------------------
 *  빔프로젝터 볼류메트릭 광선 (렌즈 → 스크린 사각뿔)
 * ------------------------------------------------------------------ */
export function createBeamGeometry(apex, corners, apexSize = 0.12) {
  // corners: [TL, TR, BR, BL] (Vector3) — 4개의 측면 quad 생성
  const pos = [];
  const uv = [];
  const idx = [];
  const n = 4;
  const seg = 12; // 측면 가로 분할 (부드러운 가장자리용)
  const axis = new THREE.Vector3().addVectors(corners[0], corners[2]).multiplyScalar(0.5).sub(apex).normalize();
  for (let s = 0; s < n; s++) {
    const a = corners[s];
    const b = corners[(s + 1) % n];
    const base = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const far = new THREE.Vector3().lerpVectors(a, b, t);
      // 렌즈 쪽 작은 사각형
      const dir = new THREE.Vector3().subVectors(far, apex);
      const side = dir.clone().sub(axis.clone().multiplyScalar(dir.dot(axis))).normalize();
      const near = apex.clone().add(side.multiplyScalar(apexSize));
      pos.push(near.x, near.y, near.z, far.x, far.y, far.z);
      uv.push(t, 0, t, 1);
    }
    for (let i = 0; i < seg; i++) {
      const k = base + i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export function createBeamMaterial(color = new THREE.Color(0.75, 0.85, 1.0)) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: color },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity, uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      void main() {
        float along = vUv.y;               // 0 = 렌즈, 1 = 스크린
        float edge = pow(sin(vUv.x * 3.14159), 0.7);
        float n = noise(vec2(vUv.x * 9.0, along * 5.0 - uTime * 0.35)) * 0.55 + 0.45;
        float flick = 0.94 + 0.06 * sin(uTime * 37.0) * sin(uTime * 13.0);
        float a = (1.0 - along * 0.82) * mix(0.25, 1.0, edge) * n * flick;
        a *= smoothstep(0.0, 0.04, along);
        // 스크린 표면 앞에서는 빔이 페이드아웃되어 영상이 뿌옇게 타는 것을 방지
        a *= smoothstep(0.98, 0.70, along);
        gl_FragColor = vec4(uColor * a * uOpacity * 0.065, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

/* ------------------------------------------------------------------
 *  빛 속을 떠다니는 먼지 파티클
 * ------------------------------------------------------------------ */
export function createDustMaterial(color = new THREE.Color(1, 1, 1), size = 22) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: color },
      uSize: { value: size },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uSize, uPixelRatio;
      attribute float aSeed;
      varying float vTw;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.21 + aSeed * 40.0) * 0.18;
        p.y += sin(uTime * 0.17 + aSeed * 23.0) * 0.22 + sin(uTime * 0.05 + aSeed) * 0.1;
        p.z += cos(uTime * 0.19 + aSeed * 31.0) * 0.18;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (0.4 + fract(aSeed * 7.13)) / -mv.z;
        vTw = 0.45 + 0.55 * sin(uTime * (0.8 + fract(aSeed * 3.7) * 2.0) + aSeed * 60.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor * a * a * vTw * uOpacity, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

/* ------------------------------------------------------------------
 *  방사형 글로우 텍스처 (렌즈 플레어 / 조명 헤일로)
 * ------------------------------------------------------------------ */
export function createGlowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(180,210,255,0.35)') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.18, mid);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
