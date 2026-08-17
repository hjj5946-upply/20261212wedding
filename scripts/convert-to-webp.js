import fs from "fs";
import path from "path";
import sharp from "sharp";

const inDir = path.resolve("public/images");

if (!fs.existsSync(inDir)) {
  process.exit(1);
}

const files = fs
  .readdirSync(inDir)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  // ✅ intro_ 로 시작하는 것만 변환하고 싶으면 아래 주석 해제
  // .filter((f) => /^intro_\d+\.(jpg|jpeg|png)$/i.test(f))s
  ;

if (files.length === 0) {
  process.exit(0);
}

const WIDTH = 1080;    // ✅ 모바일 성능 기준 (권장)
const QUALITY = 78;    // ✅ 충분히 선명 + 용량 절감
const EFFORT = 4;      // ✅ 인코딩 속도/효율 균형 (0~6)

(async () => {
  const failed = [];

  for (const f of files) {
    const input = path.join(inDir, f);
    const output = path.join(inDir, f.replace(/\.(jpg|jpeg|png)$/i, ".webp"));

    try {
      // failOn: "none" — 스캔 헤더가 약간 깨진 사진(폰/카톡 경유본)도 살려서 변환한다.
      //   기본값이면 "Invalid SOS parameters" 같은 오류로 배치 전체가 멈춘다.
      await sharp(input, { failOn: "none" })
        .rotate() // ✅ 사진에 EXIF 회전값 있으면 바로잡기
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: EFFORT })
        .toFile(output);

      console.log(`ok   ${f}`);
    } catch (err) {
      // 한 장이 실패해도 나머지는 계속 변환하고, 끝에 모아서 보고한다
      failed.push({ file: f, message: err.message });
      console.warn(`FAIL ${f} — ${err.message}`);
    }
  }

  console.log(`\n변환 ${files.length - failed.length}/${files.length}장 완료`);

  if (failed.length > 0) {
    console.error(`실패 ${failed.length}장: ${failed.map((x) => x.file).join(", ")}`);
    process.exitCode = 1;
  }
})();
