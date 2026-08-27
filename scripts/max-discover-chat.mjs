/**
 * Long-poll MAX /updates to discover chat_id / user_id after you open the bot.
 *
 * Usage:
 *   1) Open @your_bot in MAX and press Start / send any message
 *   2) node scripts/max-discover-chat.mjs
 *
 * Reads MAX_BOT_TOKEN from .env.local — never prints the token.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
  }
  return out;
}

const env = loadEnvLocal();
const token = env.MAX_BOT_TOKEN;
const base = (env.MAX_API_BASE_URL || "https://platform-api.max.ru").replace(
  /\/$/,
  "",
);

if (!token) {
  console.error("MAX_BOT_TOKEN missing in .env.local");
  process.exit(1);
}

const meRes = await fetch(`${base}/me`, {
  headers: { Authorization: token, Accept: "application/json" },
});
const me = await meRes.json();
console.log("Bot:", me?.username ? `@${me.username}` : me);
console.log("Open this bot in MAX, press Start, then wait…\n");

let marker = 0;
const deadline = Date.now() + 90_000;

while (Date.now() < deadline) {
  const url = new URL(`${base}/updates`);
  url.searchParams.set("limit", "100");
  url.searchParams.set("timeout", "30");
  if (marker) url.searchParams.set("marker", String(marker));

  const res = await fetch(url, {
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("updates failed", res.status, data?.code || data);
    process.exit(1);
  }

  if (typeof data.marker === "number") marker = data.marker;

  const updates = Array.isArray(data.updates) ? data.updates : [];
  for (const update of updates) {
    const type = update.update_type || update.type || "unknown";
    const chatId =
      update.chat_id ??
      update.chat?.chat_id ??
      update.message?.recipient?.chat_id ??
      update.message?.chat_id;
    const userId =
      update.user_id ??
      update.user?.user_id ??
      update.message?.sender?.user_id ??
      update.message?.recipient?.user_id;

    console.log("update:", type, { chatId, userId });

    if (chatId != null || userId != null) {
      console.log("\nUse in .env.local / Vercel:");
      if (chatId != null) console.log(`MAX_CHAT_ID=${chatId}`);
      if (userId != null) {
        console.log(`# or personal dialog:`);
        console.log(`MAX_CHAT_ID=${userId}`);
        console.log(`MAX_RECIPIENT=user`);
      }
      process.exit(0);
    }
  }
}

console.error("Timed out: no chat/user id in updates. Start the bot in MAX and retry.");
process.exit(1);
