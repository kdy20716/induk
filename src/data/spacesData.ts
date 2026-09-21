import { VirtualSpace } from '@/types';

export const VIRTUAL_SPACES: VirtualSpace[] = [
  {
    id: 'space-cyberpunk',
    name: 'Sector 07: Neon Underpass',
    koreanName: '섹터 07: 사이버펑크 네온 언더패스',
    theme: 'cyberpunk',
    description: '비에 젖어 빛을 반사하는 아스팔트와 푸른색/자줏빛 네온사인이 교차하는 미래 도시의 뒷골목 공간입니다. 유니티의 Reflection Probe와 Emissive Material을 극대화하여 화려한 야경을 체감할 수 있습니다.',
    atmosphere: '비 내리는 습한 밤, 홀로그램 글리치, 미래형 네온 조명',
    lightingType: 'Baked Lightmap + Dynamic Point Lights + Bloom Post-Process',
    assetsUsed: ['Modular Cyberpunk Buildings', 'Hologram Shader', 'Rain Particle System', 'Wet Road Decals'],
    color: 'from-cyan-500 via-fuchsia-500 to-purple-600',
    accentHex: 0x00ffff,
    bgHex: 0x0a0a14
  },
  {
    id: 'space-fantasy',
    name: 'Aethelgard: Sunken Sanctum',
    koreanName: '에델가드: 잠든 태양의 고대 신전',
    theme: 'fantasy',
    description: '천장의 붕괴된 틈새로 신비로운 수직 광선(God Rays)이 쏟아져 내리는 웅장한 석조 신전입니다. 부유하는 빛의 포자 파티클과 고대 룬 문자 기둥 사이를 1인칭으로 탐험할 수 있습니다.',
    atmosphere: '장엄한 성소, 부유하는 빛 파티클, 고대 룬의 신비로운 잔향',
    lightingType: 'Volumetric Directional Light + Warm Candle Emissive',
    assetsUsed: ['Ancient Temple Columns', 'God-Ray Volumetric Fog', 'Floating Motes Particle', 'Carved Reliefs'],
    color: 'from-amber-400 via-yellow-600 to-orange-700',
    accentHex: 0xffaa00,
    bgHex: 0x140d05
  },
  {
    id: 'space-scifi',
    name: 'Aegis-IV: Orbital Observatorium',
    koreanName: '이지스-IV: 우주 궤도 관측 기지',
    theme: 'scifi',
    description: '우주 정거장의 대형 파노라마 돔 창문 너머로 회전하는 지구와 보랏빛 성운이 펼쳐지는 최첨단 관측실입니다. 미래형 홀로그램 인터페이스와 금속 격자 바닥의 반사를 체험할 수 있습니다.',
    atmosphere: '고요한 우주 심연, 푸른 지구의 대기광, 미래 연구소 분위기',
    lightingType: 'Cold White Fluorescent + Earth Rim Lighting + Neon Cyan UI',
    assetsUsed: ['Sci-Fi Modular Corridor', 'Hologram Display Mesh', 'Deep Space Skybox', 'Metallic Sci-fi Props'],
    color: 'from-blue-600 via-indigo-600 to-cyan-400',
    accentHex: 0x3b82f6,
    bgHex: 0x050b14
  }
];
