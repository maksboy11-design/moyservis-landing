/**
 * Low-level MAX Bot API client.
 * All HTTPS calls to MAX platform API go through here.
 * Token is read only from process.env via @/config/env — never logged.
 *
 * Default host is platform-api.max.ru: platform-api2.max.ru requires the
 * MinTsifry TLS chain, which is often missing on Vercel/Node hosts and
 * surfaces as network_error.
 */

import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { fetchJson } from "@/services/notify/http";
import type { MaxApiResult, SendMaxMessageParams } from "./types";

/** Stable host for hosted Node runtimes (Vercel). Override via MAX_API_BASE_URL. */
export const MAX_API_BASE_URL_DEFAULT = "https://platform-api.max.ru";

export function getMaxApiBaseUrl(): string {
  return (env.MAX_API_BASE_URL ?? MAX_API_BASE_URL_DEFAULT).replace(/\/$/, "");
}

/** @deprecated use getMaxApiBaseUrl() */
export const MAX_API_BASE_URL = MAX_API_BASE_URL_DEFAULT;

function parseChatId(chatId: string): number | null {
  const trimmed = chatId.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isSafeInteger(n) ? n : null;
}

function extractApiErrorCode(bodyText: string): string | undefined {
  if (!bodyText) return undefined;
  try {
    const parsed = JSON.parse(bodyText) as { code?: unknown; message?: unknown };
    if (typeof parsed.code === "string" && parsed.code.length > 0) {
      return parsed.code.slice(0, 80);
    }
  } catch {
    // ignore non-JSON upstream bodies
  }
  return undefined;
}

/**
 * POST /messages — send text to a chat or user dialog.
 * Auth: Authorization header with bot token (query token not supported).
 */
export async function postMessage(
  params: SendMaxMessageParams,
): Promise<MaxApiResult> {
  const token = env.MAX_BOT_TOKEN;
  if (!token) {
    return {
      ok: false,
      status: 0,
      attempts: 0,
      latencyMs: 0,
      error: "not_configured",
    };
  }

  const chatId = parseChatId(params.chatId);
  if (chatId === null) {
    return {
      ok: false,
      status: 0,
      attempts: 0,
      latencyMs: 0,
      error: "invalid_chat_id",
    };
  }

  const base = getMaxApiBaseUrl();
  const recipient =
    params.recipient === "user"
      ? ({ key: "user_id", value: chatId } as const)
      : ({ key: "chat_id", value: chatId } as const);

  const url = new URL(`${base}/messages`);
  url.searchParams.set(recipient.key, String(recipient.value));
  if (params.disableLinkPreview) {
    url.searchParams.set("disable_link_preview", "true");
  }

  const result = await fetchJson({
    url: url.toString(),
    method: "POST",
    headers: {
      // Official MAX docs: Authorization: {access_token} (not Bearer)
      Authorization: token,
    },
    body: {
      text: params.text,
      notify: true,
    },
    timeoutMs: env.NOTIFY_TIMEOUT_MS,
    retries: env.NOTIFY_RETRIES,
    logChannel: "max",
  });

  const apiCode = extractApiErrorCode(result.bodyText);
  if (!result.ok) {
    logger.warn("max.api_response", {
      status: result.status,
      apiCode,
      recipient: recipient.key,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    });
  }

  return {
    ok: result.ok,
    status: result.status,
    attempts: result.attempts,
    latencyMs: result.latencyMs,
    error: result.ok
      ? undefined
      : apiCode
        ? `${result.error ?? "upstream"}:${apiCode}`
        : result.error,
  };
}

export function isMaxBotConfigured(): boolean {
  return Boolean(env.MAX_BOT_TOKEN && env.MAX_CHAT_ID);
}
