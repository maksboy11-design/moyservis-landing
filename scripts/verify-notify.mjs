/**
 * Verifies notify HTTP helpers: success, 5xx retries, timeout.
 * Run: node scripts/verify-notify.mjs
 */
import http from "node:http";

const hits = { ok: 0, fail: 0, slow: 0 };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/ok") {
    hits.ok += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname === "/fail") {
    hits.fail += 1;
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false }));
    return;
  }

  if (url.pathname === "/slow") {
    hits.slow += 1;
    await new Promise((r) => setTimeout(r, 1500));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function fetchJson(options) {
  const maxAttempts = Math.max(1, options.retries + 1);
  const started = Date.now();
  let lastError = "unknown";
  let lastStatus = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const response = await fetch(options.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(options.body ?? {}),
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          attempts: attempt,
          latencyMs: Date.now() - started,
        };
      }
      lastError = `http_${response.status}`;
      if (attempt < maxAttempts && (response.status === 503 || response.status >= 500)) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      return {
        ok: false,
        status: response.status,
        attempts: attempt,
        latencyMs: Date.now() - started,
        error: lastError,
      };
    } catch (error) {
      lastError =
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "network_error";
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      return {
        ok: false,
        status: lastStatus,
        attempts: attempt,
        latencyMs: Date.now() - started,
        error: lastError,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

const cases = [];

{
  const r = await fetchJson({
    url: `${base}/ok`,
    body: { id: "1" },
    timeoutMs: 1000,
    retries: 2,
  });
  cases.push(["success", r.ok && r.attempts === 1 && hits.ok === 1]);
}

{
  hits.fail = 0;
  const r = await fetchJson({
    url: `${base}/fail`,
    body: { id: "2" },
    timeoutMs: 1000,
    retries: 2,
  });
  cases.push([
    "unavailable + retries",
    !r.ok && r.attempts === 3 && hits.fail === 3 && r.error === "http_503",
  ]);
}

{
  hits.slow = 0;
  const r = await fetchJson({
    url: `${base}/slow`,
    body: { id: "3" },
    timeoutMs: 200,
    retries: 1,
  });
  cases.push([
    "timeout + retry",
    !r.ok && r.error === "timeout" && r.attempts === 2 && hits.slow === 2,
  ]);
}

server.close();

let failed = 0;
for (const [name, pass] of cases) {
  if (!pass) failed += 1;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
}

process.exit(failed === 0 ? 0 : 1);
