/**
 * Fail fast if production output is missing or is a Turbopack tree.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = process.env.NEXT_DIST_DIR || ".next-out";
const page = resolve(process.cwd(), distDir, "server/app/page.js");

if (!existsSync(page)) {
  console.error(
    `Missing ${distDir} production build. Run: npm run rebuild`,
  );
  process.exit(1);
}

const src = readFileSync(page, "utf8");
if (src.includes("[turbopack]_runtime")) {
  console.error(
    `Corrupt ${distDir}: Turbopack artifacts detected in production output.\n` +
      "Fix: stop all Next processes, then: npm run rebuild && npm start",
  );
  process.exit(1);
}

console.log(`Production ${distDir} looks consistent`);
