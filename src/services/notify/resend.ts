import { env } from "@/config/env";
import { siteConfig } from "@/config/site";
import { formatLeadMessage } from "./format";
import { fetchJson } from "./http";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

/**
 * Email via Resend HTTP API (PRD: email notifications to owner).
 * SMTP not used in v1 — Resend is the approved stack choice.
 */
export const resendAdapter: NotifyAdapter = {
  channel: "email",

  isConfigured() {
    return Boolean(
      env.RESEND_API_KEY && env.LEAD_NOTIFY_EMAIL && env.LEAD_NOTIFY_FROM_EMAIL,
    );
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "email",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const result = await fetchJson({
      url: "https://api.resend.com/emails",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: {
        from: env.LEAD_NOTIFY_FROM_EMAIL,
        to: [env.LEAD_NOTIFY_EMAIL],
        subject: `Заявка ${event.id} — ${siteConfig.name}`,
        text: formatLeadMessage(event),
      },
      timeoutMs: env.NOTIFY_TIMEOUT_MS,
      retries: env.NOTIFY_RETRIES,
      logChannel: "email",
    });

    return {
      channel: "email",
      skipped: false,
      ok: result.ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  },
};
