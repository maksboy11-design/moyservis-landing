import { randomUUID } from "node:crypto";

import { logger } from "@/lib/logger";

import type { MailConfig } from "./config";
import type { MailProvider } from "./provider";
import type { ClaimedMailJob, MailQueue } from "./queue";
import { renderMail } from "./templates";

function retryDelay(config: MailConfig, attempts: number): number {
  const exponent = Math.min(attempts - 1, 20);
  const ceiling = Math.min(
    config.worker.maxRetryMs,
    config.worker.baseRetryMs * 2 ** exponent,
  );
  return Math.floor(ceiling / 2 + Math.random() * (ceiling / 2));
}

export class MailWorker {
  private readonly owner = randomUUID();
  private readonly active = new Set<Promise<void>>();
  private stopping = false;
  private running = false;
  private wake: (() => void) | null = null;
  private nextCleanupAt = 0;

  constructor(
    private readonly queue: MailQueue,
    private readonly provider: MailProvider,
    private readonly config: MailConfig,
  ) {}

  async start(signal?: AbortSignal): Promise<void> {
    if (this.running) throw new Error("Mail worker is already running");
    this.running = true;
    this.stopping = false;
    const onAbort = () => {
      void this.stop();
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    logger.info("Mail worker started", {
      workerId: this.owner,
      concurrency: this.config.worker.concurrency,
    });

    try {
      while (!this.stopping) {
        this.cleanupCompletedJobs();
        const capacity = this.config.worker.concurrency - this.active.size;
        if (capacity > 0) {
          const jobs = this.queue.claim(capacity, this.owner, this.config.worker.leaseMs);
          for (const job of jobs) this.runJob(job);
          if (jobs.length > 0) continue;
        }
        await this.waitForWork();
      }
      await Promise.allSettled(this.active);
    } finally {
      signal?.removeEventListener("abort", onAbort);
      this.running = false;
      await this.provider.close();
      logger.info("Mail worker stopped", { workerId: this.owner });
    }
  }

  async stop(): Promise<void> {
    this.stopping = true;
    this.wake?.();
    if (this.running) await Promise.allSettled(this.active);
  }

  private cleanupCompletedJobs(): void {
    const now = Date.now();
    if (now < this.nextCleanupAt) return;
    this.nextCleanupAt = now + 60 * 60 * 1_000;
    try {
      const removed = this.queue.cleanup(this.config.worker.retentionMs);
      if (removed > 0) logger.info("Mail queue cleanup completed", { removed });
    } catch (error) {
      logger.exception("Mail queue cleanup failed", error);
    }
  }

  private runJob(job: ClaimedMailJob): void {
    const task = this.processJob(job)
      .catch((error) => {
        logger.exception("Unexpected mail worker failure", error, {
          jobId: job.id,
        });
      })
      .finally(() => {
        this.active.delete(task);
        this.wake?.();
      });
    this.active.add(task);
  }

  private async processJob(job: ClaimedMailJob): Promise<void> {
    const startedAt = Date.now();
    const heartbeat = setInterval(
      () => {
        try {
          const renewed = this.queue.renewLease(
            job.id,
            this.owner,
            this.config.worker.leaseMs,
          );
          if (!renewed) {
            logger.warn("Mail job lease heartbeat lost", { jobId: job.id });
          }
        } catch (error) {
          logger.exception("Mail job lease heartbeat failed", error, {
            jobId: job.id,
          });
        }
      },
      Math.max(1_000, Math.floor(this.config.worker.leaseMs / 3)),
    );
    heartbeat.unref();
    try {
      const rendered = renderMail(job.template, job.data);
      if (!this.config.from) {
        throw new Error("MAIL_FROM is not configured");
      }
      const result = await this.provider.send({
        from: this.config.from,
        to: job.to,
        ...(job.cc ? { cc: job.cc } : {}),
        ...(job.bcc ? { bcc: job.bcc } : {}),
        ...(job.replyTo || this.config.replyTo
          ? { replyTo: job.replyTo ?? this.config.replyTo! }
          : {}),
        subject: job.subject ?? rendered.subject,
        html: rendered.html,
        text: rendered.text,
        ...(job.attachments.length > 0 ? { attachments: job.attachments } : {}),
      });

      if (result.ok) {
        const updated = this.queue.markSent(job.id, this.owner, result.messageId);
        if (!updated) {
          logger.warn("Mail job lease lost after send", { jobId: job.id });
          return;
        }
        logger.info("Mail job sent", {
          jobId: job.id,
          attempts: job.attempts,
          rejectedCount: result.rejected.length,
          durationMs: Date.now() - startedAt,
        });
        return;
      }

      const state = this.queue.markFailed(job.id, this.owner, {
        error: result.error.message,
        retryable: result.error.retryable,
        attempts: job.attempts,
        maxAttempts: this.config.worker.maxAttempts,
        retryAt: Date.now() + retryDelay(this.config, job.attempts),
      });
      logger.warn("Mail job delivery failed", {
        jobId: job.id,
        attempts: job.attempts,
        retryable: result.error.retryable,
        queueState: state,
        code: result.error.code,
        responseCode: result.error.responseCode,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid mail job payload";
      this.queue.markFailed(job.id, this.owner, {
        error: message,
        retryable: false,
        attempts: job.attempts,
        maxAttempts: this.config.worker.maxAttempts,
        retryAt: Date.now(),
      });
      logger.exception("Mail job could not be processed", error, {
        jobId: job.id,
        durationMs: Date.now() - startedAt,
      });
    } finally {
      clearInterval(heartbeat);
    }
  }

  private waitForWork(): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        if (this.wake === done) this.wake = null;
        resolve();
      };
      const timer = setTimeout(done, this.config.worker.pollIntervalMs);
      this.wake = done;
    });
  }
}
