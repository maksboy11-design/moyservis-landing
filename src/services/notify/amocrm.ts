import { env } from "@/config/env";
import { fetchJson } from "./http";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

/**
 * amoCRM API v4 — create lead + contact (complex).
 * Env: AMOCRM_BASE_URL (https://subdomain.amocrm.ru), AMOCRM_ACCESS_TOKEN
 */
export const amocrmAdapter: NotifyAdapter = {
  channel: "amocrm",

  isConfigured() {
    return Boolean(env.AMOCRM_BASE_URL && env.AMOCRM_ACCESS_TOKEN);
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "amocrm",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const base = env.AMOCRM_BASE_URL!.replace(/\/?$/, "");
    const details = [
      event.message,
      `устройство: ${event.deviceType}`,
      `связь: ${event.contactPref}`,
      event.callback ? "нужен звонок" : null,
      `id ${event.id}`,
    ]
      .filter(Boolean)
      .join("; ");

    const result = await fetchJson({
      url: `${base}/api/v4/leads/complex`,
      headers: {
        Authorization: `Bearer ${env.AMOCRM_ACCESS_TOKEN}`,
      },
      body: [
        {
          name: `Сайт: ${event.name} (${details})`.slice(0, 250),
          request_id: event.id,
          _embedded: {
            contacts: [
              {
                name: event.name,
                custom_fields_values: [
                  {
                    field_code: "PHONE",
                    values: [{ value: event.phone }],
                  },
                ],
              },
            ],
          },
        },
      ],
      timeoutMs: env.NOTIFY_TIMEOUT_MS,
      retries: env.NOTIFY_RETRIES,
      logChannel: "amocrm",
    });

    return {
      channel: "amocrm",
      skipped: false,
      ok: result.ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  },
};
