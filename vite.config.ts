import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * public/ 안에는 webp 변환 "원본"(jpg/png)이 함께 들어 있는데,
 * Vite는 public/ 을 그대로 dist/ 로 복사하므로 코드가 쓰지 않는 원본까지 배포된다.
 * (변환 전 원본 약 60MB + 미사용 폰트 5.8MB)
 *
 * 규칙: dist/images 안에서 "같은 이름의 .webp가 존재하는" jpg/jpeg/png 는 제외.
 *  - 코드는 전부 .webp 를 참조하므로 화면에는 영향 없음
 *  - KEEP_IMAGES: 외부에서 절대 URL로 직접 참조되는 원본이 생기면 여기에 추가한다
 *  - PRUNE_FILES: 선언만 있고 실제로 쓰이지 않는 자산 (되살리려면 이 목록에서 제거)
 *
 * 원본 파일 자체는 손대지 않으므로 `npm run img:webp` 는 그대로 동작한다.
 */
function prunePublicSources(): Plugin {
  // index.html 의 og:image / twitter:image 가 절대 URL로 직접 가리키는 파일
  // (현재는 og:image 도 .webp 를 가리키므로 예외 없음. 원본 확장자를 직접 참조하게 되면 여기 추가할 것)
  const KEEP_IMAGES = new Set<string>([]);

  // .font-noto-serif 클래스가 코드에서 쓰이지 않아 다운로드되지 않는 폰트(5.8MB)
  const PRUNE_FILES = ["fonts/NotoSerifKR-VariableFont_wght.woff2"];

  return {
    name: "prune-public-sources",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve("dist");
      if (!fs.existsSync(outDir)) return;

      let removed = 0;
      let bytes = 0;

      const drop = (abs: string) => {
        if (!fs.existsSync(abs)) return;
        bytes += fs.statSync(abs).size;
        fs.rmSync(abs);
        removed += 1;
      };

      const imagesDir = path.join(outDir, "images");
      if (fs.existsSync(imagesDir)) {
        for (const file of fs.readdirSync(imagesDir)) {
          if (!/\.(jpe?g|png)$/i.test(file)) continue;
          if (KEEP_IMAGES.has(file)) continue;

          const twin = path.join(imagesDir, file.replace(/\.(jpe?g|png)$/i, ".webp"));
          if (fs.existsSync(twin)) drop(path.join(imagesDir, file));
        }
      }

      for (const rel of PRUNE_FILES) drop(path.join(outDir, rel));

      if (removed > 0) {
        console.log(
          `\nprune-public-sources: ${removed}개 미사용 원본 제외 (-${(bytes / 1024 / 1024).toFixed(1)} MB)`
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), prunePublicSources()],
  base: "/",
  build: {
    // 라이브러리(react/gsap/supabase)를 본문 코드와 분리해 캐시 재사용률을 높인다
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "gsap", test: /node_modules[\\/]gsap[\\/]/ },
            { name: "supabase", test: /node_modules[\\/]@supabase[\\/]/ },
          ],
        },
      },
    },
    // 청크 크기 경고는 유지, 압축 사이즈 계산은 빌드 시간만 잡아먹으므로 생략
    reportCompressedSize: false,
  },
});
