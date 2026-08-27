/**
 * High-level MAX send helpers. Callers outside maxBot must use these,
 * not the raw client / platform API.
 */

import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { isMaxBotConfigured, postMessage } from "./client";
import { formatMaxLeadMessage } from "./format";
import type {
  MaxLeadMessageInput,
  SendLeadToMaxResult,
  SendMaxMessageParams,
} from "./types";

export async function sendMessage(
  params: SendMaxMessageParams,
): Promise<SendLeadToMaxResult> {
  const result = await postMessage(params);

  if (result.ok) {
    logger.info("max.send_ok", {
      status: result.status,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
    });
  } else if (result.error === "timeout") {
    logger.error("max.send_timeout", {
      status: result.status,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    });
  } else if (result.error === "invalid_chat_id") {
    logger.error("max.invalid_chat_id", {
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    });
  } else {
    logger.error("max.send_failed", {
      status: result.status,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    });
  }

  return result;
}

/**
 * Formats a lead and delivers it to MAX_CHAT_ID.
 * Tries chat_id first, then user_id (personal dialog) if chat is missing.
 * Returns skipped when env is not configured (no throw).
 */
export async function sendLeadMessage(
  input: MaxLeadMessageInput,
): Promise<SendLeadToMaxResult> {
  if (!isMaxBotConfigured()) {
    logger.info("max.skipped_not_configured", {});
    return {
      ok: false,
      skipped: true,
      status: 0,
      attempts: 0,
      latencyMs: 0,
      error: "not_configured",
    };
  }

  const text = formatMaxLeadMessage(input);
  const chatId = env.MAX_CHAT_ID!;
  const preferred =
    env.MAX_RECIPIENT === "user" ? ("user" as const) : ("chat" as const);
  const fallback = preferred === "chat" ? ("user" as const) : ("chat" as const);

  const primary = await sendMessage({
    text,
    chatId,
    recipient: preferred,
    disableLinkPreview: true,
  });

  if (primary.ok) return primary;

  const miss =
    primary.error?.includes("chat.not.found") ||
    primary.error?.includes("dialog.not.found") ||
    primary.error?.includes("http_404");

  if (!miss) return primary;

  logger.warn("max.recipient_fallback", {
    from: preferred,
    to: fallback,
    error: primary.error,
  });

  return sendMessage({
    text,
    chatId,
    recipient: fallback,
    disableLinkPreview: true,
  });
}
