/**
 * GitHub Pages의 서브패스(예: /induk) 환경에서도
 * 이미지, 동영상, 3D 모델, 텍스처 등의 static 경로가 깨지지 않도록
 * 자동으로 basePath를 붙여주는 유틸리티입니다.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBase(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${clean}`;
}
