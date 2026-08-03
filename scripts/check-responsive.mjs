/**
 * Responsive QA — checks horizontal overflow at required viewports.
 * Usage: npm run check:responsive -- [baseUrl]
 * Requires: npm i -D playwright && npx playwright install chromium
 */

const QA_WIDTHS = [1920, 1440, 1366, 1024, 768, 480, 390, 375, 360, 320];
const HEIGHT = 900;
const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error(
      "Playwright не установлен. Запуск: npm i -D playwright && npx playwright install chromium",
    );
    process.exit(1);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const width of QA_WIDTHS) {
      const page = await browser.newPage({
        viewport: { width, height: HEIGHT },
      });
      await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(400);

      const report = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientWidth = doc.clientWidth;
        const overflowX = scrollWidth > clientWidth + 1;

        const overflowing = [];
        const all = document.querySelectorAll("body *");
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          if (rect.right > clientWidth + 1 || rect.left < -1) {
            const tag = el.tagName.toLowerCase();
            const cls =
              typeof el.className === "string" ? el.className.slice(0, 80) : "";
            overflowing.push(`${tag}.${cls}`.trim());
            if (overflowing.length >= 8) break;
          }
        }

        return { scrollWidth, clientWidth, overflowX, overflowing };
      });

      results.push({ width, ...report });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  let failed = 0;
  for (const r of results) {
    const status = r.overflowX ? "FAIL" : "PASS";
    if (r.overflowX) failed += 1;
    console.log(
      `${status}  ${String(r.width).padStart(4)}px  scroll=${r.scrollWidth} client=${r.clientWidth}` +
        (r.overflowing.length ? `  outliers: ${r.overflowing.join(" | ")}` : ""),
    );
  }

  if (failed) {
    console.error(`\n${failed}/${results.length} viewports with horizontal overflow`);
    process.exit(1);
  }

  console.log(`\nOK — ${results.length} viewports without horizontal scroll`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
