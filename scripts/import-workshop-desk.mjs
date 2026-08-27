import sharp from "sharp";
import fs from "fs";
import path from "path";

const panorama = path.resolve(
  "C:/Users/maksb/.cursor/projects/c-Users-maksb-OneDrive/assets/c__Users_maksb_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_c9b149aa-49cb-42a9-b8cc-417f2697b935-924dd5df-303b-446d-baad-f4fecb579c6c.png",
);
const workplace = path.resolve(
  "C:/Users/maksb/.cursor/projects/c-Users-maksb-OneDrive/assets/c__Users_maksb_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_af604cf4-7012-4177-bec2-85bd909dfd75__1_-acc1ca21-4bfb-418f-a905-5c0e397e67c1.png",
);
const dir = path.resolve("public/images/workshop");
fs.mkdirSync(dir, { recursive: true });

async function write(src, basename) {
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  await sharp(src)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toFile(path.join(dir, `${basename}.webp`));
  await sharp(src)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(dir, `${basename}.jpg`));
  console.log(
    basename,
    fs.statSync(path.join(dir, `${basename}.webp`)).size,
  );
}

// desk = «Рабочее место» (user photo)
await write(workplace, "desk");
// bench = панорама мастерской
await write(panorama, "bench");
