/**
 * Verifies MAX Bot integration: message format, HTTP success/error/timeout,
 * and that secrets stay server-side.
 *
 * Run: node scripts/verify-max-bot.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function formatMaxLeadMessage(input) {
  const lines = ["📩 Новая заявка", ""];
  const append = (label, value) => {
    lines.push(`${label}:`, value, "");
  };
  append("👤 Имя", input.name);
  append("📞 Телефон", input.phone);
  append("🕒 Время", input.createdAt ?? "now");
  append("🌐 Источник", input.sourceLabel ?? "Лендинг «МойСервис»");
  for (const field of input.extraFields ?? []) {
    if (field.label && field.value) append(field.label, field.value);
  }
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

const hits = { ok: 0, fail: 0, bad: 0, slow: 0, auth: [] };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const auth = req.headers.authorization ?? "";
  hits.auth.push(auth);

  let body = "";
  for await (const chunk of req) body += chunk;

  if (url.pathname === "/messages" && url.searchParams.get("mode") === "ok") {
    hits.ok += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: { body: { text: "ok" } } }));
    return;
  }

  if (url.pathname === "/messages" && url.searchParams.get("mode") === "fail") {
    hits.fail += 1;
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: "service_unavailable" }));
    return;
  }

  if (url.pathname === "/messages" && url.searchParams.get("mode") === "bad") {
    hits.bad += 1;
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: "bad_request" }));
    return;
  }

  if (url.pathname === "/messages" && url.searchParams.get("mode") === "slow") {
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

async function postMessage(url, token, text, timeoutMs = 8000, retries = 2) {
  const maxAttempts = Math.max(1, retries + 1);
  const started = Date.now();
  let lastError = "unknown";
  let lastStatus = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text, notify: true }),
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
      const aborted =
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError");
      lastError = aborted ? "timeout" : "network_error";
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

const text = formatMaxLeadMessage({
  name: "Иван",
  phone: "+79001234567",
  createdAt: "04.08.2026, 12:00:00",
  extraFields: [{ label: "📱 Устройство", value: "Смартфон / планшет" }],
});

const cases = [];

cases.push([
  "message has title",
  text.includes("📩 Новая заявка"),
]);
cases.push(["message has name", text.includes("👤 Имя:\nИван")]);
cases.push(["message has phone", text.includes("📞 Телефон:\n+79001234567")]);
cases.push(["message has source", text.includes("Лендинг «МойСервис»")]);
cases.push(["message has extra field", text.includes("📱 Устройство:\nСмартфон / планшет")]);

const token = "test-max-token-secret";
const ok = await postMessage(`${base}/messages?mode=ok&chat_id=1`, token, text);
cases.push(["success send ok", ok.ok === true && ok.status === 200]);
cases.push(["success uses auth header", hits.auth.includes(token)]);

const fail = await postMessage(
  `${base}/messages?mode=fail&chat_id=1`,
  token,
  text,
  8000,
  2,
);
cases.push(["503 retries then fails", fail.ok === false && fail.attempts === 3]);
cases.push(["503 error code", fail.error === "http_503"]);

const bad = await postMessage(
  `${base}/messages?mode=bad&chat_id=1`,
  token,
  text,
  8000,
  2,
);
cases.push(["400 no retry storm", bad.ok === false && bad.attempts === 1]);

const slow = await postMessage(
  `${base}/messages?mode=slow&chat_id=1`,
  token,
  text,
  200,
  0,
);
cases.push(["timeout handled", slow.ok === false && slow.error === "timeout"]);

// Secret must not appear in client feature code
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const clientRoots = [
  path.join(root, "src", "features"),
  path.join(root, "src", "components"),
].filter((p) => fs.existsSync(p));

let clientLeak = false;
for (const dir of clientRoots) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, "utf8");
    if (
      /MAX_BOT_TOKEN/.test(src) ||
      /platform-api2\.max\.ru/.test(src) ||
      /from ["']@\/services\/maxBot/.test(src)
    ) {
      clientLeak = true;
      console.error("leak candidate:", file);
    }
  }
}
cases.push(["no max secrets/API in client UI code", !clientLeak]);

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
cases.push(["env example documents MAX_BOT_TOKEN", envExample.includes("MAX_BOT_TOKEN")]);
cases.push(["env example documents MAX_CHAT_ID", envExample.includes("MAX_CHAT_ID")]);
cases.push([
  "env example has no real token",
  !/MAX_BOT_TOKEN=\S+/.test(envExample.replace(/#.*MAX_BOT_TOKEN=.*/g, "")),
]);

server.close();

let failed = 0;
for (const [name, pass] of cases) {
  if (!pass) {
    failed += 1;
    console.error("FAIL:", name);
  } else {
    console.log("OK:", name);
  }
}

if (failed) {
  console.error(`\nmax-bot verify failed: ${failed}`);
  process.exit(1);
}

console.log("\nmax-bot verify passed");
