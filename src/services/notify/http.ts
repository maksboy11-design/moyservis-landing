/**
 * Safe outbound HTTP with timeout + limited retries.
 * Logs network/timeouts with redacted URLs — never logs bodies or auth headers.
 */

import { logger, redactUrl } from "@/lib/logger";

export type FetchJsonOptions = {
  url: string;
  method?: "GET" | "POST" | "PATCH";
  headers?: Record<string, string>;
  /** Object is JSON.stringified; string is sent as-is (for HMAC). */
  body?: unknown;
  timeoutMs: number;
  retries: number;
  /** Retry on these HTTP statuses (default: 408, 429, 500–599). */
  retryStatuses?: number[];
  /** Optional label for logs (e.g. notify channel). */
  logChannel?: string;
};

export type FetchJsonResult = {
  ok: boolean;
  status: number;
  attempts: number;
  latencyMs: number;
  bodyText: string;
  error?: string;
};

function shouldRetryStatus(status: number, retryStatuses?: number[]): boolean {
  if (retryStatuses) return retryStatuses.includes(status);
  return status === 408 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson(
  options: FetchJsonOptions,
): Promise<FetchJsonResult> {
  const {
    url,
    method = "POST",
    headers = {},
    body,
    timeoutMs,
    retries,
    logChannel,
  } = options;

  const maxAttempts = Math.max(1, retries + 1);
  const started = Date.now();
  let lastError = "unknown";
  let lastStatus = 0;
  let lastBody = "";
  const safeUrl = redactUrl(url);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const serialized =
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body);

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...(serialized !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...headers,
        },
        body: serialized,
        signal: controller.signal,
      });

      lastStatus = response.status;
      lastBody = await response.text().catch(() => "");

      if (response.ok) {
        if (attempt > 1) {
          logger.info("http.retry_succeeded", {
            channel: logChannel,
            url: safeUrl,
            method,
            attempts: attempt,
            status: response.status,
            latencyMs: Date.now() - started,
          });
        }
        return {
          ok: true,
          status: response.status,
          attempts: attempt,
          latencyMs: Date.now() - started,
          bodyText: lastBody,
        };
      }

      lastError = `http_${response.status}`;

      logger.warn("http.upstream_error", {
        channel: logChannel,
        url: safeUrl,
        method,
        status: response.status,
        attempt,
        latencyMs: Date.now() - started,
      });

      if (
        attempt < maxAttempts &&
        shouldRetryStatus(response.status, options.retryStatuses)
      ) {
        await sleep(200 * 2 ** (attempt - 1));
        continue;
      }

      return {
        ok: false,
        status: response.status,
        attempts: attempt,
        latencyMs: Date.now() - started,
        bodyText: lastBody,
        error: lastError,
      };
    } catch (error) {
      const aborted =
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError");
      lastError = aborted ? "timeout" : "network_error";
      lastStatus = 0;

      logger.warn(aborted ? "http.timeout" : "http.network_error", {
        channel: logChannel,
        url: safeUrl,
        method,
        attempt,
        latencyMs: Date.now() - started,
        errorName: error instanceof Error ? error.name : undefined,
      });

      if (attempt < maxAttempts) {
        await sleep(200 * 2 ** (attempt - 1));
        continue;
      }

      return {
        ok: false,
        status: lastStatus,
        attempts: attempt,
        latencyMs: Date.now() - started,
        bodyText: lastBody,
        error: lastError,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    status: lastStatus,
    attempts: maxAttempts,
    latencyMs: Date.now() - started,
    bodyText: lastBody,
    error: lastError,
  };
}
