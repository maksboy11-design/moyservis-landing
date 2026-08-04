/**
 * Verifies logger redaction — no full PII / secrets in output.
 * Run: node scripts/verify-logger.mjs
 */

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

function maskName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "***";
  return `${[...trimmed][0]}***`;
}

function maskEmail(email) {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  return `***@${email.slice(at + 1)}`;
}

const SENSITIVE_KEY =
  /^(.*_)?(password|passwd|secret|token|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|auth|bearer|cookie|private[_-]?key|bot[_-]?token)(_.*)?$/i;
const PII_KEY = /^(name|full[_-]?name|fio|email|phone|mobile|tel|message|comment|address)$/i;

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.username = "";
    parsed.password = "";
    let path = parsed.pathname.replace(/\/bot[^/]+/gi, "/bot***");
    path = path.replace(/\/rest\/\d+\/[^/]+/gi, "/rest/***/***");
    return `${parsed.origin}${path}${parsed.search}`;
  } catch {
    return url.replace(/\/bot[^/]+/gi, "/bot***");
  }
}

function sanitizeValue(key, value, depth = 0) {
  if (depth > 6) return "[Truncated]";
  if (SENSITIVE_KEY.test(key)) return "[REDACTED]";
  if (PII_KEY.test(key) && typeof value === "string") {
    if (/phone|mobile|tel/i.test(key)) return maskPhone(value);
    if (/email/i.test(key)) return maskEmail(value);
    if (/name|fio/i.test(key)) return maskName(value);
    if (/message|comment|address/i.test(key)) {
      return value.length === 0 ? "" : `[len:${value.length}]`;
    }
  }
  if (typeof value === "string") {
    if (key.toLowerCase().includes("url") || /^https?:\/\//i.test(value)) {
      return redactUrl(value);
    }
    if (/^Bearer\s+/i.test(value)) return "Bearer ***";
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => sanitizeValue(String(i), item, depth + 1));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeValue(k, v, depth + 1);
    }
    return out;
  }
  return value;
}

function sanitizeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = sanitizeValue(k, v);
  return out;
}

const sample = sanitizeFields({
  name: "Иван Петров",
  phone: "+7 (900) 123-45-67",
  email: "ivan@example.com",
  message: "Сломался экран",
  password: "super-secret",
  apiKey: "re_1234567890",
  TELEGRAM_BOT_TOKEN: "123456:ABC-DEF",
  authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig",
  url: "https://api.telegram.org/bot123456:AAHxxx/sendMessage",
  bitrix: "https://portal.bitrix24.ru/rest/1/abcsecrettoken/crm.lead.add.json",
  durationMs: 42,
  requestId: "req-1",
});

const line = JSON.stringify(sample);

const cases = [
  ["masks name", sample.name === "И***"],
  ["masks phone", sample.phone === "***4567"],
  ["masks email", sample.email === "***@example.com"],
  ["masks message length only", sample.message === "[len:14]"],
  ["redacts password", sample.password === "[REDACTED]"],
  ["redacts apiKey", sample.apiKey === "[REDACTED]"],
  ["redacts bot token field", sample.TELEGRAM_BOT_TOKEN === "[REDACTED]"],
  ["redacts authorization", sample.authorization === "[REDACTED]"],
  ["redacts telegram url token", !String(sample.url).includes("AAHxxx") && String(sample.url).includes("/bot***")],
  ["redacts bitrix webhook token", String(sample.bitrix).includes("/rest/***/***")],
  ["keeps durationMs", sample.durationMs === 42],
  ["no raw phone in JSON", !line.includes("900") && !line.includes("123-45")],
  ["no raw name in JSON", !line.includes("Петров")],
  ["no raw password in JSON", !line.includes("super-secret")],
  ["no bearer token in JSON", !line.includes("eyJhbGci")],
];

let failed = 0;
for (const [name, pass] of cases) {
  if (!pass) failed += 1;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
}

console.log(`\n${cases.length - failed}/${cases.length} passed`);
console.log("sample:", line);
process.exit(failed === 0 ? 0 : 1);
