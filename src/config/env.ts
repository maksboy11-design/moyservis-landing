import { z } from "zod";

/**
 * Env schema — единственный вход для process.env.
 * Публичные: NEXT_PUBLIC_*
 * Серверные: без префикса (только Route Handlers / Actions).
 *
 * Notify:
 * - MAX_BOT_TOKEN + MAX_CHAT_ID (MAX Bot API)
 * - SMTP_* + MAIL_* (email delivery)
 */

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().email().optional(),
);

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return value;
  }, z.boolean());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.string().url().default("http://localhost:3000"),

  MAX_BOT_TOKEN: z.string().min(1).optional(),
  MAX_CHAT_ID: z.string().min(1).optional(),
  /** Prefer chat_id or user_id when calling MAX /messages. */
  MAX_RECIPIENT: z.enum(["chat", "user"]).optional(),
  /** Override API host (default https://platform-api.max.ru). */
  MAX_API_BASE_URL: z.string().url().optional(),

  NOTIFY_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  NOTIFY_RETRIES: z.coerce.number().int().min(0).max(5).default(2),

  MAIL_ENABLED: booleanFromEnv(false),
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(587),
  SMTP_SECURE: booleanFromEnv(false),
  SMTP_REQUIRE_TLS: booleanFromEnv(false),
  SMTP_TLS_REJECT_UNAUTHORIZED: booleanFromEnv(true),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_CONNECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(120_000)
    .default(10_000),
  SMTP_SOCKET_TIMEOUT_MS: z.coerce.number().int().min(100).max(300_000).default(30_000),
  MAIL_FROM: optionalString,
  MAIL_REPLY_TO: optionalEmail,
  MAIL_ADMIN_TO: optionalEmail,
  MAIL_QUEUE_PATH: optionalString,
  MAIL_WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(4),
  MAIL_POLL_INTERVAL_MS: z.coerce.number().int().min(50).max(60_000).default(1_000),
  MAIL_LEASE_MS: z.coerce.number().int().min(5_000).max(900_000).default(60_000),
  MAIL_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(50).default(8),
  MAIL_BASE_RETRY_MS: z.coerce.number().int().min(100).max(3_600_000).default(5_000),
  MAIL_MAX_RETRY_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(86_400_000)
    .default(3_600_000),
  MAIL_RETENTION_MS: z.coerce
    .number()
    .int()
    .min(60_000)
    .max(7_776_000_000)
    .default(604_800_000),
  MAIL_HEALTH_TOKEN: optionalString,
  MAIL_HEALTH_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_YM_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  return value;
}

function createEnv() {
  const serverParsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
    MAX_BOT_TOKEN: emptyToUndefined(process.env.MAX_BOT_TOKEN),
    MAX_CHAT_ID: emptyToUndefined(process.env.MAX_CHAT_ID),
    MAX_RECIPIENT: emptyToUndefined(process.env.MAX_RECIPIENT),
    MAX_API_BASE_URL: emptyToUndefined(process.env.MAX_API_BASE_URL),
    NOTIFY_TIMEOUT_MS: process.env.NOTIFY_TIMEOUT_MS ?? 8000,
    NOTIFY_RETRIES: process.env.NOTIFY_RETRIES ?? 2,
    MAIL_ENABLED: process.env.MAIL_ENABLED ?? false,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ?? 587,
    SMTP_SECURE: process.env.SMTP_SECURE ?? false,
    SMTP_REQUIRE_TLS: process.env.SMTP_REQUIRE_TLS ?? false,
    SMTP_TLS_REJECT_UNAUTHORIZED: process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? true,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_CONNECTION_TIMEOUT_MS: process.env.SMTP_CONNECTION_TIMEOUT_MS ?? 10_000,
    SMTP_SOCKET_TIMEOUT_MS: process.env.SMTP_SOCKET_TIMEOUT_MS ?? 30_000,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_REPLY_TO: process.env.MAIL_REPLY_TO,
    MAIL_ADMIN_TO: process.env.MAIL_ADMIN_TO,
    MAIL_QUEUE_PATH: process.env.MAIL_QUEUE_PATH,
    MAIL_WORKER_CONCURRENCY: process.env.MAIL_WORKER_CONCURRENCY ?? 4,
    MAIL_POLL_INTERVAL_MS: process.env.MAIL_POLL_INTERVAL_MS ?? 1_000,
    MAIL_LEASE_MS: process.env.MAIL_LEASE_MS ?? 60_000,
    MAIL_MAX_ATTEMPTS: process.env.MAIL_MAX_ATTEMPTS ?? 8,
    MAIL_BASE_RETRY_MS: process.env.MAIL_BASE_RETRY_MS ?? 5_000,
    MAIL_MAX_RETRY_MS: process.env.MAIL_MAX_RETRY_MS ?? 3_600_000,
    MAIL_RETENTION_MS: process.env.MAIL_RETENTION_MS ?? 604_800_000,
    MAIL_HEALTH_TOKEN: process.env.MAIL_HEALTH_TOKEN,
    MAIL_HEALTH_TIMEOUT_MS: process.env.MAIL_HEALTH_TIMEOUT_MS ?? 5_000,
  });

  if (!serverParsed.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(serverParsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }

  const clientParsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID,
  });

  if (!clientParsed.success) {
    console.error("❌ Invalid public environment variables:");
    console.error(clientParsed.error.flatten().fieldErrors);
    throw new Error("Invalid public environment variables");
  }

  return {
    ...serverParsed.data,
    ...clientParsed.data,
    /** Канонический origin сайта */
    get siteUrl() {
      return (
        clientParsed.data.NEXT_PUBLIC_SITE_URL ?? serverParsed.data.SITE_URL
      ).replace(/\/$/, "");
    },
  };
}

export const env = createEnv();
