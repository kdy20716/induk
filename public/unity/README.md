# 유니티 WebGL 체험 작품 넣는 법

체험관(04)의 각 작품은 이 폴더에 빌드가 있으면 **자동으로 실제 유니티 체험**으로 실행되고,
없으면 360° 미리보기(또는 "준비 중")로 대체됩니다. 코드 수정은 필요 없습니다.

## 1. 유니티에서 빌드

1. `File > Build Settings` → **WebGL** 선택 → `Switch Platform`
2. `Player Settings > Publishing Settings`
   - **Compression Format: Disabled** (가장 간단) 또는 Gzip
   - Gzip/Brotli를 쓰면 **Decompression Fallback** 체크
3. `Build` → 폴더 이름을 작품 id와 같게 (예: `neo-seoul`)

## 2. 파일 복사

빌드 결과물 중 `Build/` 폴더(와 있다면 `StreamingAssets/`)를 아래처럼 넣습니다.
`index.html`, `TemplateData/`는 필요 없습니다.

```
public/unity/neo-seoul/Build/neo-seoul.loader.js
public/unity/neo-seoul/Build/neo-seoul.data
public/unity/neo-seoul/Build/neo-seoul.framework.js
public/unity/neo-seoul/Build/neo-seoul.wasm
```

## 3. 데이터 확인

`src/data/artworks.ts` 의 해당 작품:

```ts
experience: {
  unity: { folder: '/unity/neo-seoul', file: 'neo-seoul' },   // Gzip이면 ext: '.gz'
  controls: 'W A S D 이동 · 마우스 시점',
}
```

| 작품 | folder | file |
| --- | --- | --- |
| I-01 네오서울 언더패스 | `/unity/neo-seoul` | `neo-seoul` |
| I-02 메아리의 성소 VR | `/unity/echo-sanctuary` | `echo-sanctuary` |
| I-03 심연을 걷는 자 | `/unity/abyss-walker` | `abyss-walker` |

> 빌드가 100MB를 넘으면 itch.io / GitHub Pages 등에 올리고
> `experience.iframeUrl` 에 주소를 넣어도 됩니다.
