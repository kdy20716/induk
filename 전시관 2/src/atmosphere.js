import * as THREE from 'three';

/* =====================================================================
 *  분위기 효과 — 부드러운 빛줄기(볼류메트릭 콘) + 빛 속을 떠다니는 먼지
 *  - 후처리 없이 메시 2개로 표현 (가볍고, 화면이 깨지지 않음)
 *  - 빛줄기: 가장자리로 갈수록 투명해지는 원뿔 + 느리게 흐르는 결
 *  - 먼지: 원뿔 안에서만 천천히 떠다니며 반짝이는 입자
 * ===================================================================== */

const shaftVertex = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const shaftFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSeed;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying vec2 vUv;
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    // 원뿔의 가운데(시선과 마주 보는 면)는 진하고, 실루엣 가장자리는 사라지게
    float facing = abs(dot(normalize(vNormalW), V));
    float core = pow(facing, 1.5);
    // 위(광원)에서 아래로 갈수록 옅어짐 — 끝은 바닥/작품에 닿기 전에 사라짐
    float t = 1.0 - vUv.y;
    float along = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.6, 1.0, t)) * mix(1.0, 0.45, t);
    // 빛줄기 결 (천천히 흔들리는 세로 줄무늬) + 공기 흐름
    float a = vUv.x * 6.2831853;
    float streak = 0.72 + 0.28 * sin(a * 9.0 + uSeed * 7.0 + sin(uTime * 0.21 + a * 3.0) * 0.8)
                        * sin(a * 4.0 - uTime * 0.13 + uSeed);
    float haze = 0.8 + 0.2 * sin(vWorldPos.y * 2.1 - uTime * 0.35 + vWorldPos.x * 1.3)
                           * sin(vWorldPos.z * 1.7 + uTime * 0.27);
    // 카메라가 빛줄기 안/근처에 있을 때 면이 보이지 않도록
    float nearFade = smoothstep(0.4, 2.6, distance(cameraPosition, vWorldPos));
    float alpha = uIntensity * core * along * streak * haze * nearFade;
    gl_FragColor = vec4(uColor, alpha);
  }`;

const dustVertex = /* glsl */ `
  attribute vec4 aDust; // x: 각도, y: 반경 비율, z: 길이 위치, w: 시드
  uniform float uTime;
  uniform float uLen;
  uniform float uR0;
  uniform float uR1;
  uniform float uSize;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    float seed = aDust.w;
    // 아주 느리게 가라앉으며 소용돌이
    float t = fract(aDust.z + uTime * (0.002 + seed * 0.004));
    float ang = aDust.x + uTime * (seed - 0.5) * 0.08;
    float r = aDust.y * mix(uR0, uR1, t);
    vec3 p = vec3(cos(ang) * r, -t * uLen, sin(ang) * r);
    p += vec3(
      sin(uTime * (0.21 + seed * 0.3) + seed * 31.0),
      sin(uTime * (0.17 + seed * 0.2) + seed * 17.0) * 0.6,
      cos(uTime * (0.19 + seed * 0.25) + seed * 23.0)
    ) * 0.06;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * (0.55 + seed * 0.9) * uScale / max(depth, 0.1), 1.0, 28.0);
    float edge = 1.0 - smoothstep(0.65, 1.0, aDust.y);
    float along = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.7, 1.0, t));
    // 빛을 받는 순간만 반짝
    float twinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (0.5 + seed * 1.6) + seed * 47.0), 2.0);
    // 렌즈 바로 앞 먼지는 흐릿하고 옅게 (초점 밖)
    float focus = mix(0.25, 1.0, smoothstep(0.5, 2.2, depth));
    vAlpha = edge * along * twinkle * focus * smoothstep(0.25, 0.7, depth);
  }`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    gl_FragColor = vec4(uColor, a * vAlpha * uIntensity);
  }`;

const UP = new THREE.Vector3(0, -1, 0);

export class Atmosphere {
  constructor(scene) {
    this.scene = scene;
    this.shafts = [];
    this.dustMaterials = [];
    this.scale = 1000;
  }

  /**
   * from → to 방향으로 내려오는 빛줄기를 만든다.
   * r0: 광원 쪽 반경, r1: 끝 반경, intensity: 빛줄기 진하기, dust: 먼지 개수
   */
  addShaft({ from, to, r0 = 0.2, r1 = 1.2, color = 0xffe6c2, intensity = 0.08, dust = 200, dustIntensity = 0.9, dustSize = 0.014, seed = Math.random() }) {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();

    const group = new THREE.Group();
    group.position.copy(a);
    group.quaternion.setFromUnitVectors(UP, dir);
    this.scene.add(group);

    const geo = new THREE.CylinderGeometry(r0, r1, len, 64, 1, true);
    geo.translate(0, -len / 2, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uTime: { value: 0 },
        uSeed: { value: seed * 10 },
      },
      vertexShader: shaftVertex,
      fragmentShader: shaftFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 5;
    mesh.frustumCulled = false;
    group.add(mesh);

    let points = null;
    let dustMat = null;
    if (dust > 0) {
      const arr = new Float32Array(dust * 4);
      for (let i = 0; i < dust; i++) {
        arr[i * 4] = Math.random() * Math.PI * 2;
        arr[i * 4 + 1] = Math.sqrt(Math.random());
        arr[i * 4 + 2] = Math.random();
        arr[i * 4 + 3] = Math.random();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('aDust', new THREE.BufferAttribute(arr, 4));
      // position 속성은 셰이더에서 계산 — 개수만 맞춰 둠
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dust * 3), 3));
      dustMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35) },
          uIntensity: { value: dustIntensity },
          uTime: { value: 0 },
          uLen: { value: len },
          uR0: { value: r0 },
          uR1: { value: r1 },
          uSize: { value: dustSize },
          uScale: { value: this.scale },
        },
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      points = new THREE.Points(g, dustMat);
      points.frustumCulled = false;
      points.renderOrder = 6;
      group.add(points);
      this.dustMaterials.push(dustMat);
    }

    const shaft = { group, mesh, mat, points, dustMat, base: intensity, dustBase: dustIntensity };
    /** 0~1 배율로 빛줄기/먼지 진하기 조절 (0이면 숨김 → 연산 절약) */
    shaft.setLevel = (k) => {
      group.visible = k > 0.003;
      mat.uniforms.uIntensity.value = shaft.base * k;
      if (dustMat) dustMat.uniforms.uIntensity.value = shaft.dustBase * k;
    };
    this.shafts.push(shaft);
    return shaft;
  }

  /** 화면 높이·FOV가 바뀌면 먼지 크기 기준을 다시 계산 */
  resize(heightPx, fovDeg) {
    this.scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
    this.dustMaterials.forEach((m) => { m.uniforms.uScale.value = this.scale; });
  }

  update(time) {
    for (const s of this.shafts) {
      if (!s.group.visible) continue;
      s.mat.uniforms.uTime.value = time;
      if (s.dustMat) s.dustMat.uniforms.uTime.value = time;
    }
  }
}
