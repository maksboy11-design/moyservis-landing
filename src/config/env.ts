import { z } from "zod";

/**
 * Env schema — единственный вход для process.env.
 * Публичные: NEXT_PUBLIC_*
 * Серверные: без префикса (только Route Handlers / Actions).
 *
 * Notify (PRD §8.6 / Stage 1):
 * - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 * - RESEND_API_KEY + LEAD_NOTIFY_EMAIL + LEAD_NOTIFY_FROM_EMAIL
 * - LEAD_WEBHOOK_URL (+ optional LEAD_WEBHOOK_SECRET)
 * - BITRIX24_WEBHOOK_URL
 * - AMOCRM_BASE_URL + AMOCRM_ACCESS_TOKEN
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.string().url().default("http://localhost:3000"),

  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  LEAD_NOTIFY_EMAIL: z.string().email().optional(),
  LEAD_NOTIFY_FROM_EMAIL: z.string().email().optional(),

  LEAD_WEBHOOK_URL: z.string().url().optional(),
  LEAD_WEBHOOK_SECRET: z.string().min(8).optional(),

  BITRIX24_WEBHOOK_URL: z.string().url().optional(),

  AMOCRM_BASE_URL: z.string().url().optional(),
  AMOCRM_ACCESS_TOKEN: z.string().min(1).optional(),

  NOTIFY_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  NOTIFY_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
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
    TELEGRAM_BOT_TOKEN: emptyToUndefined(process.env.TELEGRAM_BOT_TOKEN),
    TELEGRAM_CHAT_ID: emptyToUndefined(process.env.TELEGRAM_CHAT_ID),
    RESEND_API_KEY: emptyToUndefined(process.env.RESEND_API_KEY),
    LEAD_NOTIFY_EMAIL: emptyToUndefined(process.env.LEAD_NOTIFY_EMAIL),
    LEAD_NOTIFY_FROM_EMAIL: emptyToUndefined(process.env.LEAD_NOTIFY_FROM_EMAIL),
    LEAD_WEBHOOK_URL: emptyToUndefined(process.env.LEAD_WEBHOOK_URL),
    LEAD_WEBHOOK_SECRET: emptyToUndefined(process.env.LEAD_WEBHOOK_SECRET),
    BITRIX24_WEBHOOK_URL: emptyToUndefined(process.env.BITRIX24_WEBHOOK_URL),
    AMOCRM_BASE_URL: emptyToUndefined(process.env.AMOCRM_BASE_URL),
    AMOCRM_ACCESS_TOKEN: emptyToUndefined(process.env.AMOCRM_ACCESS_TOKEN),
    NOTIFY_TIMEOUT_MS: process.env.NOTIFY_TIMEOUT_MS ?? 8000,
    NOTIFY_RETRIES: process.env.NOTIFY_RETRIES ?? 2,
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
        clientParsed.data.NEXT_PUBLIC_SITE_URL ??
        serverParsed.data.SITE_URL
      ).replace(/\/$/, "");
    },
  };
}

export const env = createEnv();
