import { env } from "@/config/env";
import { fetchJson } from "./http";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

/**
 * Bitrix24 incoming webhook → crm.lead.add
 * Env: BITRIX24_WEBHOOK_URL = https://{portal}/rest/{user}/{token}/
 */
export const bitrix24Adapter: NotifyAdapter = {
  channel: "bitrix24",

  isConfigured() {
    return Boolean(env.BITRIX24_WEBHOOK_URL);
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "bitrix24",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const base = env.BITRIX24_WEBHOOK_URL!.replace(/\/?$/, "/");
    const comments = [
      `Источник: ${event.source}`,
      `Устройство: ${event.deviceType}`,
      `Связь: ${event.contactPref}`,
      `Обратный звонок: ${event.callback ? "да" : "нет"}`,
      `ID: ${event.id}`,
      event.message ? `Комментарий: ${event.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await fetchJson({
      url: `${base}crm.lead.add.json`,
      body: {
        fields: {
          TITLE: `Заявка с сайта — ${event.name}`,
          NAME: event.name,
          PHONE: [{ VALUE: event.phone, VALUE_TYPE: "WORK" }],
          COMMENTS: comments,
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: event.source,
        },
      },
      timeoutMs: env.NOTIFY_TIMEOUT_MS,
      retries: env.NOTIFY_RETRIES,
      logChannel: "bitrix24",
    });

    let ok = result.ok;
    if (ok && result.bodyText) {
      try {
        const parsed = JSON.parse(result.bodyText) as {
          result?: unknown;
          error?: unknown;
        };
        if (parsed.error) ok = false;
      } catch {
        // keep HTTP ok
      }
    }

    return {
      channel: "bitrix24",
      skipped: false,
      ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: ok ? undefined : (result.error ?? "bitrix24_error"),
    };
  },
};
