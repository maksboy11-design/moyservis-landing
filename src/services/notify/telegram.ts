import { env } from "@/config/env";
import { formatLeadMessage } from "./format";
import { fetchJson } from "./http";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

export const telegramAdapter: NotifyAdapter = {
  channel: "telegram",

  isConfigured() {
    return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "telegram",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const token = env.TELEGRAM_BOT_TOKEN!;
    const chatId = env.TELEGRAM_CHAT_ID!;
    const result = await fetchJson({
      url: `https://api.telegram.org/bot${token}/sendMessage`,
      body: {
        chat_id: chatId,
        text: formatLeadMessage(event),
        disable_web_page_preview: true,
      },
      timeoutMs: env.NOTIFY_TIMEOUT_MS,
      retries: env.NOTIFY_RETRIES,
      logChannel: "telegram",
    });

    return {
      channel: "telegram",
      skipped: false,
      ok: result.ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  },
};
