/**
 * Notify facade — PRD ch.8 + Stage 1 stack.
 *
 * v1 channels (activate via env):
 * - Telegram Bot API (primary for owner alerts)
 * - Email via Resend
 * - Generic webhook / REST
 * - Bitrix24 incoming webhook
 * - amoCRM API v4
 *
 * Fan-out: all configured adapters run in parallel.
 * Success if ≥1 configured channel succeeds.
 * not_configured if none enabled (lead still accepted by LeadService).
 * upstream_error if all configured channels fail.
 *
 * Server-only: do not import from client components.
 */

import { logger } from "@/lib/logger";
import { amocrmAdapter } from "./amocrm";
import { bitrix24Adapter } from "./bitrix24";
import { buildLeadNotifyEvent } from "./format";
import { resendAdapter } from "./resend";
import { telegramAdapter } from "./telegram";
import type { LeadPayload } from "@/domain/lead/types";
import type {
  AdapterAttemptResult,
  NotifyAdapter,
  NotifyLeadResult,
} from "./types";
import { webhookAdapter } from "./webhook";

const adapters: NotifyAdapter[] = [
  telegramAdapter,
  resendAdapter,
  webhookAdapter,
  bitrix24Adapter,
  amocrmAdapter,
];

function summarizeChannels(channels: AdapterAttemptResult[]) {
  return channels.map((c) => ({
    channel: c.channel,
    skipped: c.skipped,
    ok: c.ok,
    attempts: c.attempts,
    latencyMs: c.latencyMs,
    error: c.error,
  }));
}

export async function notifyLead(
  payload: LeadPayload,
  leadId: string,
): Promise<NotifyLeadResult> {
  const event = buildLeadNotifyEvent(payload, leadId);
  const configured = adapters.filter((adapter) => adapter.isConfigured());

  if (configured.length === 0) {
    logger.info("notify.skipped_not_configured", { id: leadId });
    return { ok: false, reason: "not_configured", channels: [] };
  }

  const settled = await Promise.all(
    configured.map(async (adapter) => {
      try {
        return await adapter.send(event);
      } catch (error) {
        logger.exception("notify.adapter_exception", error, {
          id: leadId,
          channel: adapter.channel,
        });
        return {
          channel: adapter.channel,
          skipped: false,
          ok: false,
          attempts: 1,
          latencyMs: 0,
          error: "adapter_exception",
        } satisfies AdapterAttemptResult;
      }
    }),
  );

  const channels = settled;
  const anyOk = channels.some((c) => c.ok);

  if (anyOk) {
    logger.info("notify.delivered", {
      id: leadId,
      channels: summarizeChannels(channels),
    });
    return { ok: true, channels };
  }

  logger.error("notify.all_failed", {
    id: leadId,
    channels: summarizeChannels(channels),
  });

  return { ok: false, reason: "upstream_error", channels };
}

export type { LeadNotifyEvent, NotifyLeadResult, AdapterAttemptResult } from "./types";
export { buildLeadNotifyEvent, formatLeadMessage, toLeadIntegrationPayload } from "./format";
export { verifyWebhookSignature } from "./webhook";
