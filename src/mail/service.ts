import { logger } from "@/lib/logger";

import { readMailConfig, type MailConfig } from "./config";
import { NodemailerProvider } from "./nodemailer-provider";
import type { MailProvider } from "./provider";
import { MailQueue } from "./queue";
import type {
  MailAddress,
  MailEnqueueResult,
  MailSendRequest,
  MailTemplateName,
} from "./types";
import { MailWorker } from "./worker";

const TEMPLATE_NAMES = new Set<MailTemplateName>([
  "newLead",
  "callbackRequest",
  "adminNotification",
  "customerAutoReply",
  "serviceNotification",
]);
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_BYTES = 20 * 1024 * 1024;

export type CreateMailServiceResult =
  | { ok: true; service: MailService }
  | {
      ok: false;
      reason: "invalid_config" | "queue_unavailable";
      errors: string[];
    };

function isAddress(value: unknown): value is MailAddress {
  const address =
    typeof value === "string"
      ? value.trim()
      : typeof value === "object" &&
          value !== null &&
          "address" in value &&
          typeof value.address === "string"
        ? value.address.trim()
        : "";
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address);
}

function validAddressField(
  value: MailAddress | ReadonlyArray<MailAddress> | undefined,
): boolean {
  if (value === undefined) return true;
  const addresses = Array.isArray(value) ? value : [value];
  return addresses.length > 0 && addresses.every(isAddress);
}

function invalidRequest(request: MailSendRequest): string | null {
  if (!TEMPLATE_NAMES.has(request.template)) return "Unknown mail template";
  if (!request.data || typeof request.data !== "object") {
    return "Template data must be an object";
  }
  const recipients = Array.isArray(request.to) ? request.to : [request.to];
  if (recipients.length === 0 || !recipients.every(isAddress)) {
    return "At least one valid recipient is required";
  }
  if (!validAddressField(request.cc) || !validAddressField(request.bcc)) {
    return "CC and BCC must contain valid email addresses";
  }
  if (request.replyTo !== undefined && !isAddress(request.replyTo)) {
    return "Reply-To must contain a valid email address";
  }
  if (
    request.idempotencyKey !== undefined &&
    (request.idempotencyKey.trim() === "" || request.idempotencyKey.length > 200)
  ) {
    return "Idempotency key must contain 1 to 200 characters";
  }

  let total = 0;
  for (const attachment of request.attachments ?? []) {
    const filename = attachment.filename.trim();
    if (!filename) return "Attachment filename is required";
    if (filename.length > 255 || /[\r\n\0]/.test(filename)) {
      return "Attachment filename is invalid";
    }
    if (
      attachment.contentType &&
      (attachment.contentType.length > 100 ||
        /[\r\n\0]/.test(attachment.contentType))
    ) {
      return "Attachment content type is invalid";
    }
    const size =
      typeof attachment.content === "string"
        ? Buffer.byteLength(attachment.content)
        : attachment.content.byteLength;
    if (size > MAX_ATTACHMENT_BYTES) {
      return "An attachment exceeds the 10 MiB limit";
    }
    total += size;
  }
  return total > MAX_ATTACHMENTS_BYTES
    ? "Attachments exceed the 20 MiB total limit"
    : null;
}

export class MailService {
  private closed = false;

  constructor(
    private readonly queue: MailQueue,
    readonly config: MailConfig,
  ) {}

  static create(
    source: Readonly<Record<string, string | undefined>> = process.env,
  ): CreateMailServiceResult {
    const parsed = readMailConfig(source);
    if (!parsed.ok) {
      return { ok: false, reason: "invalid_config", errors: parsed.errors };
    }
    try {
      return {
        ok: true,
        service: new MailService(new MailQueue(parsed.config.queuePath), parsed.config),
      };
    } catch (error) {
      logger.exception("Mail queue initialization failed", error);
      return {
        ok: false,
        reason: "queue_unavailable",
        errors: [
          error instanceof Error ? error.message : "Unable to initialize mail queue",
        ],
      };
    }
  }

  /**
   * Persists a message for delivery. SMTP is never contacted from this method,
   * and all validation/database failures are represented by the return value.
   */
  async send<K extends MailTemplateName>(
    request: MailSendRequest<K>,
  ): Promise<MailEnqueueResult> {
    if (!this.config.enabled) {
      return {
        ok: false,
        reason: "not_configured",
        error: "Mail delivery is disabled",
      };
    }
    if (this.closed) {
      return {
        ok: false,
        reason: "queue_unavailable",
        error: "Mail service is closed",
      };
    }
    const validationError = invalidRequest(request);
    if (validationError) {
      return {
        ok: false,
        reason: "invalid_request",
        error: validationError,
      };
    }
    try {
      const result = this.queue.enqueue(request);
      return { ok: true, jobId: result.jobId, duplicate: result.duplicate };
    } catch (error) {
      logger.exception("Mail enqueue failed", error, {
        template: request.template,
      });
      return {
        ok: false,
        reason: "queue_unavailable",
        error: error instanceof Error ? error.message : "Mail enqueue failed",
      };
    }
  }

  createWorker(provider?: MailProvider): MailWorker {
    return new MailWorker(
      this.queue,
      provider ?? new NodemailerProvider(this.config),
      this.config,
    );
  }

  queueHealth(): { ok: true; pending: number } | { ok: false; error: string } {
    return this.queue.healthCheck();
  }

  cleanup(): number {
    return this.queue.cleanup(this.config.worker.retentionMs);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.queue.close();
  }
}
