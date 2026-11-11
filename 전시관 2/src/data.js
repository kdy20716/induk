// =====================================================================
//  전시 작품 데이터 — 갤러리 액자 순서대로 배치됩니다.
//  지금은 학생 작품이 없어서 임시 그림(코드로 그린 유화 풍 그림)과
//  "작품 예시 페이지(subpages/work.html?no=번호)"로 통일해 두었습니다.
//
//  ▶ 학생 작품으로 바꿀 때는 아래 PLACEHOLDER 대신 이렇게 적으면 됩니다.
//    {
//      title: '작품 제목', en: 'ENGLISH TITLE', student: '홍길동', major: '게임&VR콘텐츠디자인과',
//      genre: 'Unity · 3D Action', tags: ['Unity', 'Blender'],
//      desc: '작품 설명 한두 문장',
//      image: 'assets/works/01.jpg',   // 액자에 걸릴 대표 이미지 (없으면 임시 그림)
//      video: 'assets/works/01.mp4',   // 작품 페이지에 들어갈 영상 (선택)
//    },
// =====================================================================

const WORK_COUNT = 12;

const PLACEHOLDER = (n) => ({
  title: `작품 제목 ${n}`,
  en: `UNTITLED WORK No.${n}`,
  student: '학생 이름',
  major: '인덕대학교 졸업 작품',
  genre: 'Graduation Work · 2026',
  tags: ['Game', 'Media Art', 'Interactive'],
  desc: '학생 작품이 등록되면 이곳에 작품 소개가 표시됩니다. 액자를 클릭하면 작품 상세 페이지로 이동합니다.',
  image: null,
  video: null,
});

const ENTRIES = [
  // 학생 작품이 정해지면 여기에 순서대로 넣으세요. 비어 있는 자리는 임시 작품으로 채워집니다.
];

export const WORKS = Array.from({ length: WORK_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    ...PLACEHOLDER(n),
    ...(ENTRIES[i] || {}),
    no: n,
    index: i,
    url: `subpages/work.html?no=${n}`,
    accent: '#d9b471',
  };
});

// 로비 영상 액자에서 재생할 목록
export const SHOWREEL = [
  { src: 'assets/videos/mallang_1min.mp4', title: '전시 소개 영상 01' },
  { src: 'assets/videos/mallang_clip1.mp4', title: '전시 소개 영상 02' },
  { src: 'assets/videos/mallang_clip2.mp4', title: '전시 소개 영상 03' },
  { src: 'assets/videos/mallang_clip3.mp4', title: '전시 소개 영상 04' },
];
