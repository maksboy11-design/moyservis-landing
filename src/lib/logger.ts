type LogLevel = "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const SENSITIVE_KEY =
  /^(.*_)?(password|passwd|secret|token|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|auth|bearer|cookie|private[_-]?key|bot[_-]?token)(_.*)?$/i;

const PII_KEY = /^(name|full[_-]?name|fio|email|phone|mobile|tel|message|comment|address)$/i;

/** Mask phone — keep last 4 digits only. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

/** Mask personal name — first char + ***. */
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "***";
  const first = [...trimmed][0] ?? "*";
  return `${first}***`;
}

/** Mask email — keep domain. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  return `***@${email.slice(at + 1)}`;
}

/**
 * Strip secrets from URLs (Telegram bot token, query tokens, basic auth).
 * Example: bot TOKEN path segment becomes bot*** .
 */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.username = "";
    parsed.password = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (SENSITIVE_KEY.test(key)) parsed.searchParams.set(key, "***");
    }
    let path = parsed.pathname.replace(
      /\/bot[^/]+/gi,
      "/bot***",
    );
    path = path.replace(
      /\/rest\/\d+\/[^/]+/gi,
      "/rest/***/***",
    );
    return `${parsed.origin}${path}${parsed.search}`;
  } catch {
    return url
      .replace(/\/bot[^/]+/gi, "/bot***")
      .replace(/([?&](token|key|secret|password)=)[^&]*/gi, "$1***");
  }
}

function redactStringValue(value: string): string {
  if (/^Bearer\s+/i.test(value)) return "Bearer ***";
  if (/^[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\./.test(value)) return "***jwt***";
  return value;
}

function sanitizeValue(key: string, value: unknown, depth: number): unknown {
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
    return redactStringValue(value);
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeValue(String(index), item, depth + 1),
    );
  }

  if (value && typeof value === "object") {
    return sanitizeFields(value as LogFields, depth + 1);
  }

  return value;
}

/** Deep-sanitize log fields — strips secrets and full PII. */
export function sanitizeFields(
  fields: LogFields,
  depth = 0,
): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = sanitizeValue(key, value, depth);
  }
  return out;
}

export function serializeError(error: unknown): LogFields {
  if (!(error instanceof Error)) {
    return { error: String(error) };
  }

  return {
    errorName: error.name,
    errorMessage: redactStringValue(error.message).slice(0, 500),
    // Stack without query strings / tokens if present in message paths
    ...(process.env.NODE_ENV !== "production"
      ? {
          errorStack: error.stack
            ?.split("\n")
            .slice(0, 8)
            .map((line) =>
              line
                .replace(/\/bot[^/\s]+/gi, "/bot***")
                .replace(/Bearer\s+\S+/gi, "Bearer ***"),
            )
            .join("\n"),
        }
      : {}),
  };
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...(fields ? sanitizeFields(fields) : {}),
  };
  const line = JSON.stringify(payload);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/**
 * Structured logger — server-only.
 * Never logs full PII, tokens, passwords, or API keys.
 */
export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
  /** Exceptions / unexpected failures */
  exception(message: string, error: unknown, fields?: LogFields) {
    write("error", message, {
      ...fields,
      ...serializeError(error),
    });
  },
};

export type RequestTimer = {
  requestId: string;
  startedAt: number;
  /** Elapsed ms since start */
  elapsed: () => number;
};

export function startRequestTimer(requestId = crypto.randomUUID()): RequestTimer {
  const startedAt = Date.now();
  return {
    requestId,
    startedAt,
    elapsed: () => Date.now() - startedAt,
  };
}
