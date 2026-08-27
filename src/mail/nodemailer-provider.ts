import { createRequire } from "node:module";

import { logger } from "@/lib/logger";

import type { MailConfig } from "./config";
import {
  classifyProviderError,
  type MailProvider,
  type ProviderHealthResult,
} from "./provider";
import type { ProviderMessage, ProviderSendResult } from "./types";

type Transporter = {
  sendMail(message: ProviderMessage): Promise<{
    messageId?: string;
    accepted?: unknown[];
    rejected?: unknown[];
  }>;
  verify(): Promise<boolean>;
  close(): void;
};

type NodemailerModule = {
  createTransport(options: Record<string, unknown>): Transporter;
};

function stringifyAddresses(values: unknown[] | undefined): string[] {
  return (values ?? []).map((value) =>
    typeof value === "string" ? value : String(value),
  );
}

export class NodemailerProvider implements MailProvider {
  private readonly transporter: Transporter;

  constructor(config: MailConfig) {
    if (!config.enabled || !config.smtp.host) {
      throw new Error("Mail provider is not configured");
    }

    const require = createRequire(import.meta.url);
    const nodemailer = require("nodemailer") as NodemailerModule;
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      requireTLS: config.smtp.requireTls,
      tls: {
        rejectUnauthorized: config.smtp.rejectUnauthorized,
      },
      ...(config.smtp.user && config.smtp.password
        ? {
            auth: {
              user: config.smtp.user,
              pass: config.smtp.password,
            },
          }
        : {}),
      connectionTimeout: config.smtp.connectionTimeoutMs,
      socketTimeout: config.smtp.socketTimeoutMs,
      pool: true,
      maxConnections: config.worker.concurrency,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }

  async send(message: ProviderMessage): Promise<ProviderSendResult> {
    try {
      const result = await this.transporter.sendMail(message);
      const accepted = stringifyAddresses(result.accepted);
      const rejected = stringifyAddresses(result.rejected);
      if (accepted.length === 0) {
        return {
          ok: false,
          error: {
            message: "SMTP server rejected all recipients",
            code: "EENVELOPE",
            retryable: false,
          },
        };
      }
      return {
        ok: true,
        messageId: result.messageId ?? "",
        accepted,
        rejected,
      };
    } catch (error) {
      const classified = classifyProviderError(error);
      logger.warn("Mail provider send failed", {
        code: classified.code,
        responseCode: classified.responseCode,
        retryable: classified.retryable,
      });
      return { ok: false, error: classified };
    }
  }

  async verify(): Promise<ProviderHealthResult> {
    const startedAt = Date.now();
    try {
      await this.transporter.verify();
      return { ok: true, latencyMs: Date.now() - startedAt };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - startedAt,
        error: classifyProviderError(error),
      };
    }
  }

  healthCheck(): Promise<ProviderHealthResult> {
    return this.verify();
  }

  async close(): Promise<void> {
    try {
      this.transporter.close();
    } catch (error) {
      logger.exception("Failed to close mail provider", error);
    }
  }
}
