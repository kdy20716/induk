/**
 * 전시 작품 데이터 (단일 소스)
 * ------------------------------------------------------------------
 * 실제 학생 작품으로 교체할 때는 이 파일만 수정하면 됩니다.
 *  - 이미지:   public/works/<id>/... 에 넣고 경로를 '/works/<id>/1.jpg' 처럼 지정
 *  - 3D 모델:  public/models/*.glb
 *  - 영상:     public/videos/*.mp4
 *  - 유니티:   public/unity/<폴더>/Build/<파일명>.loader.js ... (public/unity/README.md 참고)
 * `credit` 필드가 있는 항목은 임시(공개 라이선스) 에셋입니다.
 */

export type RoomId = 'sculpture' | 'gallery' | 'media' | 'interactive';

export interface Artist {
  name: string;
  role: string;
  link?: string;
}

export interface ModelSpec {
  src: string;
  /** 화면 기준 높이(월드 단위) */
  size: number;
  /** 원본 재질 대신 조각 재질을 입힐 때 */
  material?: 'clay' | 'bronze' | 'marble';
  /** 기본 바라보는 각도 (rad) */
  rotationY?: number;
}

export interface UnityBuild {
  /** public 기준 폴더 — 예: '/unity/neo-seoul' */
  folder: string;
  /** Build 폴더 안 파일 이름 (확장자 제외) — 예: 'neo-seoul' */
  file: string;
  /** 압축 확장자: '' | '.gz' | '.br' | '.unityweb' */
  ext?: string;
}

export interface Experience {
  unity?: UnityBuild;
  /** 외부에 호스팅된 빌드 (itch.io, GitHub Pages 등) */
  iframeUrl?: string;
  /** 빌드가 없을 때 보여줄 360° 미리보기 */
  pano?: { src: string; type: 'image' | 'video' };
  controls: string;
}

export interface Artwork {
  id: string;
  room: RoomId;
  /** 전시 번호 — 벽면 캡션에 표기 */
  no: string;
  title: string;
  titleEn: string;
  artists: Artist[];
  year: number;
  medium: string;
  dimension?: string;
  statement: string;
  cover?: string;
  images?: string[];
  model?: ModelSpec;
  video?: { src: string };
  experience?: Experience;
  tools: string[];
  credit?: string;
}

export interface Room {
  id: RoomId;
  anchor: string;
  no: string;
  name: string;
  nameEn: string;
  tone: 'dark' | 'light';
  intro: string;
}

export const ROOMS: Room[] = [
  {
    id: 'sculpture',
    anchor: 'room-1',
    no: '01',
    name: '조각실',
    nameEn: 'Digital Sculpture',
    tone: 'dark',
    intro:
      '손끝의 감각이 디지털 점토가 되는 곳. 지브러쉬와 서브스턴스로 빚어낸 3D 조형을 실제 조각처럼 조명 아래에서 360° 돌려 보며 감상합니다.',
  },
  {
    id: 'gallery',
    anchor: 'room-2',
    no: '02',
    name: '회화실',
    nameEn: 'Concept & Render',
    tone: 'light',
    intro:
      '하얀 벽을 따라 걷는 회랑. 컨셉 아트, 배경 렌더, 캐릭터 시트가 액자처럼 걸려 있습니다. 스크롤하면 회랑을 따라 옆으로 이동합니다.',
  },
  {
    id: 'media',
    anchor: 'room-3',
    no: '03',
    name: '미디어실',
    nameEn: 'Black Box Screening',
    tone: 'dark',
    intro:
      '빛이 꺼진 상영관. 게임 플레이 영상, 시네마틱 트레일러, 애니메이션을 대형 스크린으로 상영합니다.',
  },
  {
    id: 'interactive',
    anchor: 'room-4',
    no: '04',
    name: '체험관',
    nameEn: 'Interactive Pavilion',
    tone: 'dark',
    intro:
      '보는 전시에서 걷는 전시로. 학생들이 유니티로 제작한 공간에 직접 들어가 1인칭으로 둘러봅니다.',
  },
];

const PLACEHOLDER_IMG = '임시 이미지 · Unsplash License';
const BLENDER = '임시 영상 · © Blender Foundation (CC BY 3.0)';
const SAMPLE_MODEL = '임시 모델 · 공개 샘플 에셋 (three.js / Khronos glTF Samples)';

const u = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`;

export const ARTWORKS: Artwork[] = [
  /* ───────────────────────── ROOM 01 · 조각실 ───────────────────────── */
  {
    id: 'bugatti-veyron',
    room: 'sculpture',
    no: 'S-01',
    title: '2015 부가티 베이론 16.4',
    titleEn: '2015 Bugatti Veyron 16.4',
    artists: [{ name: '학생 프로젝트', role: 'Hard-Surface 3D Modeler & LookDev' }],
    year: 2026,
    medium: '하드서피스 3D 모델링, PBR 풀 텍스처',
    dimension: '실시간 3D · PBR Textures',
    statement:
      '하이퍼카의 유려한 공기역학적 실루엣과 차체 페인트, 크롬 휠, 카본 파이버 질감을 정밀하게 구현한 하드서피스 모델링 프로젝트입니다. 실시간 빛 반사와 함께 360도로 자유롭게 회전하며 감상할 수 있습니다.',
    model: { src: '/models/2015_Bugatti_Veyron_web_test_2k_1k.glb', size: 2.6, rotationY: 0.6 },
    tools: ['Maya', 'Substance 3D Painter', 'Blender'],
  },
  {
    id: 'observer',
    room: 'sculpture',
    no: 'S-02',
    title: '관찰자',
    titleEn: 'The Observer',
    artists: [{ name: '이수빈', role: 'Character Sculptor' }],
    year: 2026,
    medium: 'ZBrush 클레이 렌더',
    dimension: '실시간 3D',
    statement:
      '사람의 얼굴은 가장 오래된 조각의 주제입니다. 해부학적 구조와 피부의 주름을 클레이 상태 그대로 남겨, 완성 직전 작업대 위의 긴장감을 전시합니다.',
    model: { src: '/models/LeePerrySmith.glb', size: 2.0, material: 'clay' },
    tools: ['ZBrush', 'Maya'],
    credit: SAMPLE_MODEL,
  },
  {
    id: 'vanguard-helmet',
    room: 'sculpture',
    no: 'S-03',
    title: '전위의 투구',
    titleEn: 'Vanguard Helmet',
    artists: [{ name: '한도윤', role: 'Hard-Surface Modeler' }],
    year: 2026,
    medium: '하드서피스 모델링, PBR 텍스처',
    dimension: '실시간 3D · 4K PBR',
    statement:
      '전장의 상흔을 고스란히 간직한 SF 파일럿 헬멧. 긁힘과 그을림, 유리 바이저의 반사를 PBR 재질로 설계해 조명 각도에 따라 전혀 다른 표정을 보여줍니다.',
    model: { src: '/models/DamagedHelmet.glb', size: 1.7 },
    tools: ['Blender', 'Substance 3D Painter'],
    credit: SAMPLE_MODEL,
  },
  {
    id: 'ion-drive',
    room: 'sculpture',
    no: 'S-04',
    title: '이온 엔진',
    titleEn: 'Primary Ion Drive',
    artists: [{ name: '송지우', role: 'Prop Artist' }],
    year: 2026,
    medium: '메카닉 프롭 모델링',
    dimension: '실시간 3D',
    statement:
      '우주선 추진 장치를 하나의 조각품처럼 다뤘습니다. 기능을 위한 부품들이 모여 만들어내는 리듬과 금속의 질감을 감상해 보세요.',
    model: { src: '/models/PrimaryIonDrive.glb', size: 1.9 },
    tools: ['3ds Max', 'Substance 3D Painter'],
    credit: SAMPLE_MODEL,
  },
  {
    id: 'operative',
    room: 'sculpture',
    no: 'S-05',
    title: '오퍼레이티브',
    titleEn: 'Tactical Operative',
    artists: [{ name: '최다은', role: 'Game Character Artist' }],
    year: 2026,
    medium: '게임 캐릭터 모델링, 리깅',
    dimension: '실시간 3D · 게임 레디',
    statement:
      '게임 엔진에서 실제로 움직이기 위해 만들어진 캐릭터. 로우폴리 최적화와 리깅까지 완료된 상태로, 정지된 자세 속에 움직임의 가능성을 담았습니다.',
    model: { src: '/models/Soldier.glb', size: 2.2, rotationY: Math.PI },
    tools: ['Maya', 'ZBrush', 'Unity'],
    credit: SAMPLE_MODEL,
  },

  /* ───────────────────────── ROOM 02 · 회화실 ───────────────────────── */
  {
    id: 'chronos',
    room: 'gallery',
    no: 'G-01',
    title: '크로노스: 추락한 세라핌',
    titleEn: 'CHRONOS: The Fallen Seraph',
    artists: [
      { name: '김민준', role: 'Concept Artist' },
      { name: '이수빈', role: 'Lighting Artist' },
    ],
    year: 2026,
    medium: '디지털 페인팅, 3D 렌더',
    dimension: '7680 × 4320 px',
    statement:
      '신화 속 천사와 사이버네틱 기계가 결합한 존재를 그린 키 비주얼. 무너지는 날개와 차가운 금속 사이의 대비로 신성의 몰락을 표현했습니다.',
    cover: u('photo-1618005182384-a83a8bd57fbe'),
    images: [u('photo-1618005182384-a83a8bd57fbe'), u('photo-1634017839464-5c339ebe3cb4')],
    tools: ['Photoshop', 'ZBrush', 'Unreal Engine 5'],
    credit: PLACEHOLDER_IMG,
  },
  {
    id: 'neo-seoul',
    room: 'gallery',
    no: 'G-02',
    title: '네오서울 2099',
    titleEn: 'NEO-SEOUL 2099: Underbelly',
    artists: [{ name: '박진우', role: 'Environment Artist' }],
    year: 2026,
    medium: '언리얼 엔진 5 환경 렌더',
    dimension: '3840 × 2160 px',
    statement:
      '서울의 오래된 골목에 2099년의 네온을 겹쳤습니다. 비에 젖은 아스팔트에 번지는 간판 불빛으로 미래 도시의 쓸쓸한 밤을 그렸습니다.',
    cover: u('photo-1542751371-adc38448a05e'),
    images: [u('photo-1542751371-adc38448a05e'), u('photo-1508739773434-c26b3d09e071')],
    tools: ['Unreal Engine 5', '3ds Max', 'Substance 3D Designer'],
    credit: PLACEHOLDER_IMG,
  },
  {
    id: 'sunken-shrine',
    room: 'gallery',
    no: 'G-03',
    title: '가라앉은 신전',
    titleEn: 'The Sunken Shrine',
    artists: [
      { name: '문태경', role: 'Level Artist' },
      { name: '배서연', role: 'Lighting Artist' },
    ],
    year: 2026,
    medium: '배경 컨셉 아트',
    dimension: '5120 × 2880 px',
    statement:
      '천장의 틈으로 쏟아지는 빛과 고요한 수면. 물과 빛이 공존하는 지하 신전을 하나의 장면으로 응축한 배경 컨셉입니다.',
    cover: u('photo-1518709268805-4e9042af9f23'),
    images: [u('photo-1518709268805-4e9042af9f23'), u('photo-1579783900882-c0d3dad7b119')],
    tools: ['Photoshop', 'Blender', 'Houdini'],
    credit: PLACEHOLDER_IMG,
  },
  {
    id: 'valkyrie',
    room: 'gallery',
    no: 'G-04',
    title: '발키리: 프로토-01',
    titleEn: 'VALKYRIE: PROTO-01',
    artists: [{ name: '한도윤', role: 'Mech Designer' }],
    year: 2026,
    medium: '메카닉 디자인 시트',
    dimension: '4096 × 4096 px',
    statement:
      '인간형 메카닉 안드로이드의 디자인 시트. 관절 구조와 장갑판의 분할선을 하나하나 설계한 과정을 함께 전시합니다.',
    cover: u('photo-1607604276583-eef5d076aa5f'),
    images: [u('photo-1607604276583-eef5d076aa5f'), u('photo-1563089145-599997674d42')],
    tools: ['ZBrush', 'Maya', 'KeyShot'],
    credit: PLACEHOLDER_IMG,
  },
  {
    id: 'abyss-walker-key',
    room: 'gallery',
    no: 'G-05',
    title: '심연을 걷는 자',
    titleEn: 'ABYSS WALKER — Key Art',
    artists: [{ name: '강예은', role: 'Technical Artist' }],
    year: 2026,
    medium: '게임 키 아트',
    dimension: '3840 × 2160 px',
    statement:
      '심해 유적을 배경으로 한 소울라이크 액션 게임의 대표 이미지. 압도적인 보스와 마주한 순간의 긴장을 한 장에 담았습니다.',
    cover: u('photo-1538481199705-c710c4e965fc'),
    images: [u('photo-1538481199705-c710c4e965fc'), u('photo-1550745165-9bc0b252726f')],
    tools: ['Unity', 'Photoshop'],
    credit: PLACEHOLDER_IMG,
  },
  {
    id: 'echo-sanctuary-key',
    room: 'gallery',
    no: 'G-06',
    title: '메아리의 성소',
    titleEn: 'ECHO SANCTUARY',
    artists: [{ name: '임수진', role: 'VR Environment Artist' }],
    year: 2026,
    medium: 'VR 공간 컨셉',
    dimension: '6000 × 3000 px',
    statement:
      '빛의 정령과 교감하는 숲속 유적. VR 공간을 설계하기 전, 관람자가 서게 될 시점에서 그린 공간 컨셉 아트입니다.',
    cover: u('photo-1593508512255-86ab42a8e620'),
    images: [u('photo-1593508512255-86ab42a8e620'), u('photo-1535223289827-42f1e9919769')],
    tools: ['Photoshop', 'SpeedTree', 'Unity'],
    credit: PLACEHOLDER_IMG,
  },

  /* ───────────────────────── ROOM 03 · 미디어실 ───────────────────────── */
  {
    id: 'sintel-cinematic',
    room: 'media',
    no: 'M-01',
    title: '마지막 비늘',
    titleEn: 'The Last Scale — Cinematic Trailer',
    artists: [
      { name: '정현우', role: 'Cinematic Director' },
      { name: '윤지호', role: 'Animator' },
    ],
    year: 2026,
    medium: '게임 시네마틱 트레일러',
    dimension: '1280 × 720',
    statement:
      '잃어버린 존재를 찾아 떠나는 여정을 담은 시네마틱 트레일러. 카메라 워크와 조명, 음악의 호흡으로 게임 세계관을 1분 안에 전달합니다.',
    video: { src: '/videos/sintel-trailer.mp4' },
    tools: ['Blender', 'Unreal Sequencer', 'DaVinci Resolve'],
    credit: BLENDER,
  },
  {
    id: 'meadow-animation',
    room: 'media',
    no: 'M-02',
    title: '초원의 아침',
    titleEn: 'Morning Meadow',
    artists: [{ name: '오세훈', role: '3D Animator' }],
    year: 2026,
    medium: '3D 애니메이션',
    dimension: '480 × 272',
    statement:
      '캐릭터의 과장된 몸짓과 타이밍을 연구한 3D 애니메이션. 대사 없이 움직임만으로 감정을 전달하는 것을 목표로 했습니다.',
    video: { src: '/videos/bbb-trailer.mp4' },
    tools: ['Blender', 'Maya'],
    credit: BLENDER,
  },
  {
    id: 'gameplay-reel',
    room: 'media',
    no: 'M-03',
    title: '플레이 영상: 설원의 추격',
    titleEn: 'Gameplay Reel — Snowfield Chase',
    artists: [{ name: '정현우', role: 'Gameplay Programmer' }],
    year: 2026,
    medium: '인게임 플레이 영상',
    dimension: '실시간 캡처',
    statement:
      '실제 플레이 장면을 편집 없이 캡처했습니다. 전투 연출과 카메라 시스템이 플레이어의 조작에 어떻게 반응하는지 확인할 수 있습니다.',
    video: { src: '/videos/sintel-clip.mp4' },
    tools: ['Unity', 'Cinemachine'],
    credit: BLENDER,
  },

  /* ───────────────────────── ROOM 04 · 체험관 ───────────────────────── */
  {
    id: 'neo-seoul-walk',
    room: 'interactive',
    no: 'I-01',
    title: '네오서울 언더패스',
    titleEn: 'Neo-Seoul Underpass',
    artists: [
      { name: '박진우', role: 'Level Designer' },
      { name: '최다은', role: 'Unity Developer' },
    ],
    year: 2026,
    medium: 'Unity WebGL · 1인칭 공간 체험',
    dimension: '실시간 인터랙티브',
    statement:
      '회화실에 걸린 〈네오서울 2099〉 속으로 직접 걸어 들어갑니다. 젖은 골목의 반사광과 간판 불빛을 1인칭으로 둘러보는 공간 체험 작품입니다.',
    cover: u('photo-1542751371-adc38448a05e'),
    experience: {
      unity: { folder: '/unity/neo-seoul', file: 'neo-seoul' },
      pano: { src: '/textures/pano-room.jpg', type: 'image' },
      controls: 'W A S D 이동 · 마우스 시점 · ESC 커서 해제',
    },
    tools: ['Unity 6', 'URP', 'ProBuilder'],
  },
  {
    id: 'echo-sanctuary-vr',
    room: 'interactive',
    no: 'I-02',
    title: '메아리의 성소 VR',
    titleEn: 'Echo Sanctuary VR',
    artists: [
      { name: '오세훈', role: 'VR Director' },
      { name: '임수진', role: 'Spatial Audio' },
    ],
    year: 2026,
    medium: 'Unity · OpenXR VR 콘텐츠',
    dimension: '실시간 인터랙티브 · 360°',
    statement:
      'Meta Quest 3용 VR 콘텐츠를 웹에서 간접 체험할 수 있도록 옮겼습니다. 마우스로 주위를 둘러보며 공간의 스케일을 느껴 보세요.',
    cover: u('photo-1593508512255-86ab42a8e620'),
    experience: {
      unity: { folder: '/unity/echo-sanctuary', file: 'echo-sanctuary' },
      pano: { src: '/videos/pano-360.webm', type: 'video' },
      controls: '드래그로 둘러보기 · 휠로 시야 조절',
    },
    tools: ['Unity 6', 'OpenXR', 'Meta XR SDK'],
  },
  {
    id: 'abyss-walker-demo',
    room: 'interactive',
    no: 'I-03',
    title: '심연을 걷는 자 — 플레이어블 데모',
    titleEn: 'ABYSS WALKER — Playable Demo',
    artists: [
      { name: '정현우', role: 'Game Lead' },
      { name: '강예은', role: 'Technical Artist' },
      { name: '윤지호', role: 'Level Planner' },
    ],
    year: 2026,
    medium: 'Unity WebGL · 액션 게임 데모',
    dimension: '실시간 인터랙티브',
    statement:
      '소울라이크 액션 게임의 첫 번째 구역을 브라우저에서 직접 플레이할 수 있는 데모입니다. 패링과 회피의 타이밍을 체험해 보세요.',
    cover: u('photo-1538481199705-c710c4e965fc'),
    experience: {
      unity: { folder: '/unity/abyss-walker', file: 'abyss-walker' },
      controls: 'W A S D 이동 · 마우스 좌클릭 공격 · Space 회피',
    },
    tools: ['Unity 6', 'C#', 'FMOD'],
  },
];

export const getRoom = (id: RoomId) => ROOMS.find((r) => r.id === id)!;
export const worksInRoom = (id: RoomId) => ARTWORKS.filter((w) => w.room === id);
export const getArtwork = (id: string) => ARTWORKS.find((w) => w.id === id);

/** 관람 동선 기준 이전/다음 작품 */
export function getNeighbours(id: string) {
  const i = ARTWORKS.findIndex((w) => w.id === id);
  return {
    prev: i > 0 ? ARTWORKS[i - 1] : undefined,
    next: i < ARTWORKS.length - 1 ? ARTWORKS[i + 1] : undefined,
  };
}

export const EXHIBITION = {
  title: '경계 너머의 감각',
  titleEn: 'Beyond the Frame',
  dept: '인덕대학교 게임&VR콘텐츠디자인학과',
  deptEn: 'Induk University · Dept. of Game & VR Contents Design',
  edition: '2026 졸업전시',
  period: '2026. 11. 20 — 11. 26',
  hours: '10:00 — 18:00 (마지막 입장 17:30)',
  venue: '인덕대학교 창조관 1층 갤러리',
  address: '서울특별시 노원구 초안산로 12',
};
