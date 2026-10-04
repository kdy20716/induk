import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// GitHub Pages 저장소 이름 (/induk)
const repoName = "induk";
// GitHub Actions 빌드이거나 명시적 배포 설정 시 basePath 적용
const basePath = process.env.GITHUB_ACTIONS === "true" || process.env.NEXT_PUBLIC_BASE_PATH ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
