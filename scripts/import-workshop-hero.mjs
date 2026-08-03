import sharp from "sharp";
import fs from "fs";
import path from "path";

const src = path.resolve(
  "C:/Users/maksb/.cursor/projects/c-Users-maksb-OneDrive/assets/c__Users_maksb_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_c9b149aa-49cb-42a9-b8cc-417f2697b935-924dd5df-303b-446d-baad-f4fecb579c6c.png",
);
const dir = path.resolve("public/images/workshop");

if (!fs.existsSync(src)) {
  console.error("Source image not found:", src);
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });

const base = sharp(src).rotate();

await base
  .clone()
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 84 })
  .toFile(path.join(dir, "bench.webp"));

await base
  .clone()
  .resize({ width: 1920, withoutEnlargement: true })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(dir, "bench.jpg"));

console.log("written", fs.readdirSync(dir));
