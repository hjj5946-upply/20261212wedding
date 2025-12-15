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
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

if (files.length === 0) {
  console.log("ℹ️ 변환할 이미지가 없습니다. (jpg/jpeg/png)");
  process.exit(0);
}

(async () => {
  for (const f of files) {
    const input = path.join(inDir, f);
    const output = path.join(
      inDir,
      f.replace(/\.(jpg|jpeg|png)$/i, ".webp")
    );

    await sharp(input)
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);

    console.log("✅ created:", path.relative(process.cwd(), output));
  }
})();
