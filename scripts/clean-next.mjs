/**
 * Removes Next output dirs to prevent Turbopack/Webpack collisions
 * and OneDrive-corrupted junctions.
 */
import { rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

for (const name of [".next", ".next-out"]) {
  const dir = resolve(process.cwd(), name);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${name}`);
  } else {
    console.log(`No ${name} to remove`);
  }
}
