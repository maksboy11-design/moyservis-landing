/**
 * Accessibility QA — axe-core score target ≥ 95.
 * Usage: node scripts/check-a11y.mjs [baseUrl]
 */

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";

async function main() {
  let playwright;
  let axeSource;
  try {
    playwright = await import("playwright");
  } catch {
    console.error("Install playwright: npm i -D playwright");
    process.exit(1);
  }

  try {
    const axePath = new URL(
      "../node_modules/axe-core/axe.min.js",
      import.meta.url,
    );
    axeSource = await (await import("node:fs/promises")).readFile(
      axePath,
      "utf8",
    );
  } catch {
    console.error("Install axe-core: npm i -D axe-core");
    process.exit(1);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    const response = await page.goto(baseUrl, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    if (!response || response.status() >= 400) {
      throw new Error(`Page load failed: ${response?.status()}`);
    }
    await page.waitForSelector("main#main, main", { timeout: 20000 });
    await page.addScriptTag({ content: axeSource });

    const results = await page.evaluate(async () => {
      const axe = window.axe;
      return axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
        },
      });
    });

    const violations = results.violations ?? [];
    const passes = results.passes?.length ?? 0;
    const incomplete = results.incomplete?.length ?? 0;

    const impactWeight = { critical: 12, serious: 8, moderate: 4, minor: 1 };
    let score = 100;
    for (const v of violations) {
      const w = impactWeight[v.impact] ?? 4;
      score -= w * Math.min(v.nodes?.length ?? 1, 3);
    }
    score = Math.max(0, Math.min(100, score));

    console.log(`Passes: ${passes}`);
    console.log(`Incomplete: ${incomplete}`);
    console.log(`Violations: ${violations.length}`);
    console.log(`Accessibility Score (approx): ${score}`);

    for (const v of violations) {
      console.log(
        `\n[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`,
      );
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`  - ${node.target?.join(" ")}`);
        console.log(`    ${node.failureSummary?.split("\n")[0] ?? ""}`);
      }
    }

    if (score < 95 || violations.some((v) => v.impact === "critical")) {
      console.error("\nFAIL — score < 95 or critical violations");
      process.exit(1);
    }

    console.log("\nOK — Accessibility Score ≥ 95");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
