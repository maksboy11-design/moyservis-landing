import { resolve } from "node:path";

import type { MailAddress } from "./types";

export type MailConfig = {
  enabled: boolean;
  from: MailAddress | null;
  replyTo: MailAddress | null;
  queuePath: string;
  smtp: {
    host: string | null;
    port: number;
    secure: boolean;
    requireTls: boolean;
    rejectUnauthorized: boolean;
    user: string | null;
    password: string | null;
    connectionTimeoutMs: number;
    socketTimeoutMs: number;
  };
  worker: {
    concurrency: number;
    pollIntervalMs: number;
    leaseMs: number;
    maxAttempts: number;
    baseRetryMs: number;
    maxRetryMs: number;
    retentionMs: number;
  };
};

export type MailConfigResult =
  { ok: true; config: MailConfig } | { ok: false; errors: string[] };

function optional(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function boolean(
  name: string,
  value: string | undefined,
  fallback: boolean,
  errors: string[],
): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  errors.push(`${name} must be a boolean`);
  return fallback;
}

function integer(
  name: string,
  value: string | undefined,
  fallback: number,
  range: { min: number; max: number },
  errors: string[],
): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < range.min || parsed > range.max) {
    errors.push(`${name} must be an integer from ${range.min} to ${range.max}`);
    return fallback;
  }
  return parsed;
}

function parseAddress(
  name: string,
  value: string | null,
  errors: string[],
): MailAddress | null {
  if (!value) return null;
  const bracket = /^(.*?)\s*<([^<>]+)>$/.exec(value);
  const address = (bracket?.[2] ?? value).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    errors.push(`${name} must contain a valid email address`);
    return null;
  }
  const displayName = bracket?.[1]?.trim().replace(/^["']|["']$/g, "");
  return displayName ? { name: displayName, address } : address;
}

/**
 * Reads only an explicitly supplied environment object. No SMTP host,
 * credentials, or sender address is guessed.
 */
export function readMailConfig(
  source: Readonly<Record<string, string | undefined>> = process.env,
): MailConfigResult {
  const errors: string[] = [];
  const enabled = boolean("MAIL_ENABLED", source.MAIL_ENABLED, false, errors);
  const host = optional(source.SMTP_HOST);
  const user = optional(source.SMTP_USER);
  const password = optional(source.SMTP_PASSWORD);
  const from = parseAddress("MAIL_FROM", optional(source.MAIL_FROM), errors);
  const replyToValue = optional(source.MAIL_REPLY_TO);
  const replyTo = replyToValue
    ? parseAddress("MAIL_REPLY_TO", replyToValue, errors)
    : null;

  if (enabled && !host) errors.push("SMTP_HOST is required when mail is enabled");
  if (enabled && !from) errors.push("MAIL_FROM is required when mail is enabled");
  if ((user === null) !== (password === null)) {
    errors.push("SMTP_USER and SMTP_PASSWORD must be set together");
  }

  const queueValue = optional(source.MAIL_QUEUE_PATH);
  const queuePath =
    queueValue === ":memory:"
      ? queueValue
      : resolve(queueValue ?? resolve(process.cwd(), "data", "mail-queue.sqlite"));

  const config: MailConfig = {
    enabled,
    from,
    replyTo,
    queuePath,
    smtp: {
      host,
      port: integer("SMTP_PORT", source.SMTP_PORT, 587, { min: 1, max: 65535 }, errors),
      secure: boolean("SMTP_SECURE", source.SMTP_SECURE, false, errors),
      requireTls: boolean("SMTP_REQUIRE_TLS", source.SMTP_REQUIRE_TLS, false, errors),
      rejectUnauthorized: boolean(
        "SMTP_TLS_REJECT_UNAUTHORIZED",
        source.SMTP_TLS_REJECT_UNAUTHORIZED,
        true,
        errors,
      ),
      user,
      password,
      connectionTimeoutMs: integer(
        "SMTP_CONNECTION_TIMEOUT_MS",
        source.SMTP_CONNECTION_TIMEOUT_MS,
        10_000,
        { min: 100, max: 120_000 },
        errors,
      ),
      socketTimeoutMs: integer(
        "SMTP_SOCKET_TIMEOUT_MS",
        source.SMTP_SOCKET_TIMEOUT_MS,
        30_000,
        { min: 100, max: 300_000 },
        errors,
      ),
    },
    worker: {
      concurrency: integer(
        "MAIL_WORKER_CONCURRENCY",
        source.MAIL_WORKER_CONCURRENCY,
        4,
        { min: 1, max: 32 },
        errors,
      ),
      pollIntervalMs: integer(
        "MAIL_POLL_INTERVAL_MS",
        source.MAIL_POLL_INTERVAL_MS,
        1_000,
        { min: 50, max: 60_000 },
        errors,
      ),
      leaseMs: integer(
        "MAIL_LEASE_MS",
        source.MAIL_LEASE_MS,
        60_000,
        { min: 5_000, max: 900_000 },
        errors,
      ),
      maxAttempts: integer(
        "MAIL_MAX_ATTEMPTS",
        source.MAIL_MAX_ATTEMPTS,
        8,
        { min: 1, max: 50 },
        errors,
      ),
      baseRetryMs: integer(
        "MAIL_BASE_RETRY_MS",
        source.MAIL_BASE_RETRY_MS,
        5_000,
        { min: 100, max: 3_600_000 },
        errors,
      ),
      maxRetryMs: integer(
        "MAIL_MAX_RETRY_MS",
        source.MAIL_MAX_RETRY_MS,
        3_600_000,
        { min: 1_000, max: 86_400_000 },
        errors,
      ),
      retentionMs: integer(
        "MAIL_RETENTION_MS",
        source.MAIL_RETENTION_MS,
        7 * 86_400_000,
        { min: 60_000, max: 90 * 86_400_000 },
        errors,
      ),
    },
  };

  if (config.worker.baseRetryMs > config.worker.maxRetryMs) {
    errors.push("MAIL_BASE_RETRY_MS cannot exceed MAIL_MAX_RETRY_MS");
  }
  if (
    enabled &&
    config.worker.leaseMs <= config.smtp.connectionTimeoutMs + config.smtp.socketTimeoutMs
  ) {
    errors.push(
      "MAIL_LEASE_MS must exceed the combined SMTP connection and socket timeouts",
    );
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, config };
}
