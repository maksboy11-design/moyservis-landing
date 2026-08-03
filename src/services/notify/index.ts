/**
 * Notify adapters — Stage 1 placeholder.
 * Реализация Telegram/Email — Conversion stage.
 * Server-only: не импортировать из client components.
 */

import type { LeadPayload } from "@/domain/lead/types";

export type NotifyLeadResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "upstream_error" };

export async function notifyLeadStub(
  _payload?: LeadPayload,
): Promise<NotifyLeadResult> {
  void _payload;
  return { ok: false, reason: "not_configured" };
}
