import fs from "fs";
import path from "path";
import sharp from "sharp";

const inDir = path.resolve("public/images");

if (!fs.existsSync(inDir)) {
  console.error("❌ public/images 폴더가 없습니다:", inDir);
  process.exit(1);
}

const files = fs
  .readdirSync(inDir)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  // ✅ intro_ 로 시작하는 것만 변환하고 싶으면 아래 주석 해제
  // .filter((f) => /^intro_\d+\.(jpg|jpeg|png)$/i.test(f))s
  ;

if (files.length === 0) {
  console.log("ℹ️ 변환할 이미지가 없습니다. (jpg/jpeg/png)");
  process.exit(0);
}

const WIDTH = 1080;    // ✅ 모바일 성능 기준 (권장)
const QUALITY = 78;    // ✅ 충분히 선명 + 용량 절감
const EFFORT = 4;      // ✅ 인코딩 속도/효율 균형 (0~6)

(async () => {
  for (const f of files) {
    const input = path.join(inDir, f);
    const output = path.join(inDir, f.replace(/\.(jpg|jpeg|png)$/i, ".webp"));

    await sharp(input)
      .rotate() // ✅ 사진에 EXIF 회전값 있으면 바로잡기
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: EFFORT })
      .toFile(output);

    console.log("✅ created:", path.relative(process.cwd(), output));
  }
})();
