import { z } from "zod";

/**
 * Env schema — единственный вход для process.env.
 * Публичные: NEXT_PUBLIC_*
 * Серверные: без префикса (только Route Handlers / Actions).
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.string().url().default("http://localhost:3000"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  LEAD_NOTIFY_EMAIL: z.string().email().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_YM_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function createEnv() {
  const serverParsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_NOTIFY_EMAIL: process.env.LEAD_NOTIFY_EMAIL,
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
