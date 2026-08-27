import type { MailProviderError, ProviderMessage, ProviderSendResult } from "./types";

export type ProviderHealthResult =
  | { ok: true; latencyMs: number }
  | { ok: false; latencyMs: number; error: MailProviderError };

export interface MailProvider {
  send(message: ProviderMessage): Promise<ProviderSendResult>;
  verify(): Promise<ProviderHealthResult>;
  healthCheck(): Promise<ProviderHealthResult>;
  close(): Promise<void>;
}

type ErrorWithSmtpFields = Error & {
  code?: string;
  responseCode?: number;
  command?: string;
};

const TRANSIENT_CODES = new Set([
  "ECONNECTION",
  "ETIMEDOUT",
  "ECONNRESET",
  "EPIPE",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ESOCKET",
]);
const PERMANENT_CODES = new Set(["EAUTH", "EENVELOPE", "EMESSAGE"]);

export function classifyProviderError(error: unknown): MailProviderError {
  const candidate = error instanceof Error ? (error as ErrorWithSmtpFields) : undefined;
  const code = candidate?.code;
  const responseCode = candidate?.responseCode;
  const retryable =
    code !== undefined && PERMANENT_CODES.has(code)
      ? false
      : (responseCode !== undefined && responseCode >= 400 && responseCode < 500) ||
        (code !== undefined && TRANSIENT_CODES.has(code));

  return {
    message: candidate?.message?.slice(0, 500) ?? "Unknown mail provider error",
    ...(code ? { code } : {}),
    ...(responseCode !== undefined ? { responseCode } : {}),
    retryable,
  };
}
