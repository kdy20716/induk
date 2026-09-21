import { StudentProject } from '@/types';

export const PROJECTS_DATA: StudentProject[] = [
  {
    id: 'chronos-vanguard',
    title: 'CHRONOS: The Fallen Seraph',
    subtitle: '지브러쉬 기반 시네마틱 크리처 & 하이엔드 PBR 캐릭터',
    category: 'character',
    categoryLabel: '3D 캐릭터/크리처',
    students: [
      { name: '김민준', role: '3D Character Sculptor & PBR Texturing', artstation: 'https://artstation.com' },
      { name: '이수빈', role: 'Lookdev & Lighting Artist' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    description: '고대 신화의 천사 형상과 사이버네틱 메카닉 요소를 결합한 지브러쉬 하이폴리곤 스컬프팅 프로젝트입니다. ZBrush에서 8,000만 폴리곤으로 세밀한 피부 모공과 찢긴 날개 깃털을 디테일링한 뒤, Substance 3D Painter로 8K PBR 텍스처를 제작했습니다.',
    tools: ['ZBrush 2026', 'Substance 3D Painter', 'Marmoset Toolbag 5', 'Unreal Engine 5.5'],
    specs: {
      polyCount: 'High: 82M Tri / Low: 48,000 Poly',
      textureResolution: '8K UDIM (4 Sets)',
      engine: 'Unreal Engine 5 (Lumen/Nanite)'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'cyber-neo-seoul',
    title: 'NEO-SEOUL 2099: Underbelly',
    subtitle: '언리얼 엔진 5 루멘 기반 사이버펑크 도시 환경 레벨디자인',
    category: 'environment',
    categoryLabel: '배경 & 레벨 디자인',
    students: [
      { name: '박진우', role: 'Environment Art & Lighting', artstation: 'https://artstation.com' },
      { name: '최다은', role: 'Prop Modeling & Shaders' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    description: '서울의 전통 골목 구조에 2099년 미래 사이버펑크 네온 간판과 비에 젖은 아스팔트 반사를 가미한 AAA급 배경 프로젝트입니다. 모듈러 에셋 파이프라인과 나나이트(Nanite), 루멘(Lumen) 글로벌 일루미네이션을 활용했습니다.',
    tools: ['Unreal Engine 5.5', '3ds Max', 'Substance 3D Designer', 'Photoshop'],
    specs: {
      polyCount: 'Nanite Infinite Mesh (4.2M Instances)',
      textureResolution: '4K Tileable & Decals',
      engine: 'Unreal Engine 5.5 Lumen Raytracing'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'project-abyss-walker',
    title: 'ABYSS WALKER',
    subtitle: '유니티 엔진 3D 소울라이크 액션 어드벤처 게임',
    category: 'game',
    categoryLabel: '게임 개발 & 기획',
    students: [
      { name: '정현우', role: 'Game Lead & Combat Programmer', github: 'https://github.com' },
      { name: '강예은', role: 'Technical Artist & VFX' },
      { name: '윤지호', role: 'System & Level Planner' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    description: '심해 유적지에서 벌어지는 정교한 패링과 회피 메커니즘 중심의 3D 3인칭 소울라이크 액션 게임입니다. 유니티 URP 환경에서 물리 기반 타격감과 보스 몬스터의 동적 패턴 AI를 구현했습니다.',
    tools: ['Unity 6', 'C#', 'Blender', 'FMOD Studio', 'Shader Graph'],
    specs: {
      engine: 'Unity 6 (URP 60fps Target)',
      platform: 'PC (Steam Deck Compatible)'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'echo-sanctuary-vr',
    title: 'ECHO SANCTUARY: VR',
    subtitle: 'Meta Quest 3 기반 감성 인터랙티브 VR 명상 & 탈출 경험',
    category: 'vr',
    categoryLabel: 'VR / XR 인터랙티브',
    students: [
      { name: '오세훈', role: 'VR Experience Director & Dev' },
      { name: '임수진', role: 'VR Environment & Spatial Audio' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
    description: '손 추적(Hand Tracking)과 햅틱 피드백을 통해 숲속 유적지의 고대 룬 문자를 맞추고 빛의 정령과 교감하는 가상현실 콘텐츠입니다. 유니티 OpenXR과 공간 음향(Spatial Audio)을 활용해 어지럼증을 최소화했습니다.',
    tools: ['Unity 6', 'OpenXR SDK', 'Meta XR Core SDK', 'ZBrush', 'SpeedTree'],
    specs: {
      engine: 'Unity 6 VR Pipeline',
      platform: 'Meta Quest 3 Standalone / PCVR'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'valkyrie-genesis',
    title: 'VALKYRIE: PROTO-01',
    subtitle: '하드서피스 메카닉 모델링 & ZBrush 스컬프팅 융합 프로젝트',
    category: 'character',
    categoryLabel: '3D 캐릭터/크리처',
    students: [
      { name: '한도윤', role: 'Hard-Surface 3D Modeler', artstation: 'https://artstation.com' },
      { name: '송지우', role: 'Rigging & Animation' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    description: '공상과학 전장 환경에 투입되는 인간형 발키리 메카닉 안드로이드 디자인입니다. 복잡한 관절 가동 유압 프레임과 장갑판 분할선을 ZBrush ZModeler 및 Maya로 설계하고 정밀하게 웨이트 리깅을 완성했습니다.',
    tools: ['ZBrush', 'Maya 2026', 'Substance 3D Painter', 'RizomUV'],
    specs: {
      polyCount: '78,500 Tri (Game-Ready Optimized)',
      textureResolution: '4K UDIM x 3'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'forgotten-relic-shrine',
    title: 'THE SUNKEN SHRINE',
    subtitle: '물과 빛이 공존하는 판타지 지하 신전 레벨디자인',
    category: 'environment',
    categoryLabel: '배경 & 레벨 디자인',
    students: [
      { name: '문태경', role: 'Lead Level Artist' },
      { name: '배서연', role: 'Lighting & Water Shader Specialist' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    description: '천장에서 떨어지는 수직 광선(God Rays)과 잔잔한 수면 위의 반사 효과를 중점적으로 연구한 배경 포트폴리오입니다. 커스텀 단층 워터 쉐이더와 부식된 석조 텍스처를 직접 디자이너 툴로 제작했습니다.',
    tools: ['Unreal Engine 5.5', 'Blender', 'Substance Designer', 'Houdini'],
    specs: {
      polyCount: 'Nanite Geometry System',
      textureResolution: '4K Procedural PBR'
    },
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'
    ]
  }
];
