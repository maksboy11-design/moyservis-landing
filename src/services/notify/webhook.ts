import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";
import { toLeadIntegrationPayload } from "./format";
import { fetchJson } from "./http";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signBody(body, secret);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generic outbound webhook / REST sink (custom CRM, middleware, Zapier, etc.).
 * Optional HMAC: header X-Moyservis-Signature = hex(sha256(body, secret)).
 */
export const webhookAdapter: NotifyAdapter = {
  channel: "webhook",

  isConfigured() {
    return Boolean(env.LEAD_WEBHOOK_URL);
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "webhook",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const payload = toLeadIntegrationPayload(event);
    const rawBody = JSON.stringify(payload);
    const headers: Record<string, string> = {};

    if (env.LEAD_WEBHOOK_SECRET) {
      headers["X-Moyservis-Signature"] = signBody(
        rawBody,
        env.LEAD_WEBHOOK_SECRET,
      );
    }

    const result = await fetchJson({
      url: env.LEAD_WEBHOOK_URL!,
      headers,
      body: rawBody,
      timeoutMs: env.NOTIFY_TIMEOUT_MS,
      retries: env.NOTIFY_RETRIES,
      logChannel: "webhook",
    });

    return {
      channel: "webhook",
      skipped: false,
      ok: result.ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  },
};
