import { toLeadPayload } from "@/domain/lead/map";
import { UpstreamError } from "@/lib/errors";
import { logger, maskName, maskPhone } from "@/lib/logger";
import type { LeadInput } from "@/schemas/lead";
import { notifyLead } from "@/services/notify";

export type CreateLeadMeta = {
  requestId: string;
  ip?: string;
  userAgent?: string;
};

export type CreateLeadResult = {
  id: string;
};

/**
 * Lead use-case — single orchestration point for form intake.
 * Called from Route Handler (and optional Server Action later).
 */
export async function createLead(
  input: LeadInput,
  meta: CreateLeadMeta,
): Promise<CreateLeadResult> {
  const payload = toLeadPayload(input);
  const id = crypto.randomUUID();
  const started = Date.now();

  const notify = await notifyLead(payload, id);

  if (!notify.ok && notify.reason === "upstream_error") {
    logger.error("lead.notify_failed", {
      requestId: meta.requestId,
      id,
      name: maskName(payload.name),
      phone: maskPhone(payload.phone),
      reason: notify.reason,
      channels: notify.channels,
      durationMs: Date.now() - started,
    });
    throw new UpstreamError();
  }

  logger.info("lead.accepted", {
    requestId: meta.requestId,
    id,
    name: maskName(payload.name),
    phone: maskPhone(payload.phone),
    deviceType: payload.deviceType,
    contactPref: payload.contactPref,
    callback: payload.callback,
    channel: payload.channel,
    notify: notify.ok ? "sent" : notify.reason,
    notifyChannels: notify.channels.map((c) => c.channel),
    durationMs: Date.now() - started,
    ip: meta.ip,
  });

  return { id };
}
