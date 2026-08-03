import sharp from "sharp";
import fs from "fs";
import path from "path";

const root = process.cwd();
const mastersDir = path.join(root, "public/images/masters");
const workshopDir = path.join(root, "public/images/workshop");
fs.mkdirSync(mastersDir, { recursive: true });
fs.mkdirSync(workshopDir, { recursive: true });

function portrait(bg, initials) {
  return Buffer.from(`<svg width="640" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#121212"/>
    </linearGradient>
  </defs>
  <rect width="640" height="800" fill="url(#g)"/>
  <circle cx="320" cy="300" r="120" fill="#ffffff22"/>
  <text x="320" y="325" text-anchor="middle" font-family="Arial,sans-serif" font-size="72" font-weight="700" fill="#ffffff">${initials}</text>
</svg>`);
}

function workshop(label, c1, c2) {
  return Buffer.from(`<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <rect x="80" y="120" width="480" height="320" rx="32" fill="#ffffff18"/>
  <rect x="620" y="200" width="500" height="400" rx="32" fill="#ffffff12"/>
  <text x="80" y="720" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="#C8FF00">${label}</text>
</svg>`);
}

const masters = [
  ["alex", "#6B2CF5", "АС"],
  ["maria", "#FF4D00", "МИ"],
  ["dmitry", "#333333", "ДК"],
];

for (const [name, bg, ini] of masters) {
  await sharp(portrait(bg, ini))
    .webp({ quality: 80 })
    .toFile(path.join(mastersDir, `${name}.webp`));
}

await sharp(workshop("МАСТЕРСКАЯ", "#1a1030", "#6B2CF5"))
  .webp({ quality: 80 })
  .toFile(path.join(workshopDir, "bench.webp"));

await sharp(workshop("РАБОЧЕЕ МЕСТО", "#121212", "#2a2a2a"))
  .webp({ quality: 80 })
  .toFile(path.join(workshopDir, "desk.webp"));

await sharp(path.join(root, "public/images/services/parts.webp"))
  .resize(1200, 800, { fit: "cover" })
  .webp({ quality: 82 })
  .toFile(path.join(workshopDir, "stock.webp"));

console.log("masters", fs.readdirSync(mastersDir));
console.log("workshop", fs.readdirSync(workshopDir));
