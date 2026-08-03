import sharp from "sharp";
import fs from "fs";
import path from "path";

const src = path.resolve(
  "C:/Users/maksb/.cursor/projects/c-Users-maksb-OneDrive/assets/c__Users_maksb_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_761f7fe4-0285-4387-8d8d-251c263cfd07-ca7121e9-0f35-43bb-99ed-854b43ec2856.png",
);
const dir = path.resolve("public/images/about");

if (!fs.existsSync(src)) {
  console.error("Source image not found:", src);
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });

const meta = await sharp(src).metadata();
console.log("source", meta.width, meta.height, fs.statSync(src).size);

await sharp(src)
  .rotate()
  .webp({ quality: 90, effort: 4 })
  .toFile(path.join(dir, "devices.webp"));

await sharp(src)
  .rotate()
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(path.join(dir, "devices.jpg"));

console.log(
  "written",
  fs.readdirSync(dir).map((name) => ({
    name,
    size: fs.statSync(path.join(dir, name)).size,
  })),
);
