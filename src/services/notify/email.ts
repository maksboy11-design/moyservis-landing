import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { checkMailHealth, enqueueTestMail, MailService, readMailConfig } from "@/mail";
import type { CreateMailServiceResult, MailHealth } from "@/mail";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

let serviceResult: CreateMailServiceResult | undefined;

function getService(): CreateMailServiceResult {
  serviceResult ??= MailService.create();
  return serviceResult;
}

export function isEmailServiceConfigured(): boolean {
  const parsed = readMailConfig();
  return parsed.ok && parsed.config.enabled;
}

async function withHealthTimeout(
  health: Promise<MailHealth>,
  fallback: MailHealth,
): Promise<MailHealth> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      health,
      new Promise<MailHealth>((resolve) => {
        timer = setTimeout(() => resolve(fallback), env.MAIL_HEALTH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getEmailHealth(options: {
  live?: boolean;
  sendTestTo?: string;
}): Promise<
  MailHealth & {
    testSend?: { ok: boolean; queued?: boolean; id?: string; error?: string };
  }
> {
  if (!isEmailServiceConfigured()) {
    return {
      ok: false,
      status: "disabled",
      queue: { ok: true },
      provider: { ok: true, configured: false },
    };
  }

  const created = getService();
  if (!created.ok) {
    return {
      ok: false,
      status: "unhealthy",
      queue: { ok: false, error: created.reason },
      provider: { ok: false, configured: false, error: "invalid_config" },
    };
  }

  const queue = created.service.queueHealth();
  let health: MailHealth = {
    ok: queue.ok && isEmailServiceConfigured(),
    status: isEmailServiceConfigured()
      ? queue.ok
        ? "healthy"
        : "unhealthy"
      : "disabled",
    queue,
    provider: {
      ok: !options.live || !isEmailServiceConfigured(),
      configured: isEmailServiceConfigured(),
    },
  };

  if (options.live) {
    health = await withHealthTimeout(checkMailHealth(created.service), {
      ok: false,
      status: "degraded",
      queue,
      provider: {
        ok: false,
        configured: true,
        error: "health_timeout",
      },
    });
  }

  if (!options.sendTestTo) return health;
  const test = await enqueueTestMail(created.service, options.sendTestTo);
  return {
    ...health,
    testSend: test.ok
      ? { ok: true, queued: true, id: test.jobId }
      : { ok: false, error: test.reason },
  };
}

/**
 * Thin notify adapter. Transport, templates, queueing and retries belong to
 * @/mail; this layer only maps the canonical lead event to that API.
 */
export const emailAdapter: NotifyAdapter = {
  channel: "email",

  isConfigured() {
    return Boolean(env.MAIL_ADMIN_TO) && isEmailServiceConfigured();
  },

  async send(event: LeadNotifyEvent) {
    const startedAt = Date.now();

    if (!this.isConfigured() || !env.MAIL_ADMIN_TO) {
      return {
        channel: "email",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: Date.now() - startedAt,
      };
    }

    try {
      const created = getService();
      if (!created.ok) {
        return {
          channel: "email",
          skipped: false,
          ok: false,
          attempts: 1,
          latencyMs: Date.now() - startedAt,
          error: created.reason,
        };
      }

      const result = await created.service.send({
        to: env.MAIL_ADMIN_TO,
        template: "newLead",
        data: {
          leadId: event.id,
          name: event.name,
          phone: event.phone,
          device: event.deviceType,
          message: event.message,
          source: event.source,
          createdAt: event.createdAt,
        },
        idempotencyKey: `lead:${event.id}:admin-email`,
      });

      const adapterResult = {
        channel: "email" as const,
        skipped: false,
        ok: result.ok,
        attempts: 1,
        latencyMs: Date.now() - startedAt,
        error: result.ok ? undefined : result.reason,
      };

      if (result.ok) {
        logger.info("notify.email_accepted", {
          id: event.id,
          name: event.name,
          phone: event.phone,
          message: event.message,
          email: env.MAIL_ADMIN_TO,
          queued: true,
          mailId: result.jobId,
        });
      } else {
        logger.error("notify.email_failed", {
          id: event.id,
          name: event.name,
          phone: event.phone,
          email: env.MAIL_ADMIN_TO,
          error: result.reason,
        });
      }

      return adapterResult;
    } catch (error) {
      logger.exception("notify.email_exception", error, {
        id: event.id,
        name: event.name,
        phone: event.phone,
        email: env.MAIL_ADMIN_TO,
      });

      return {
        channel: "email",
        skipped: false,
        ok: false,
        attempts: 1,
        latencyMs: Date.now() - startedAt,
        error: "adapter_exception",
      };
    }
  },
};
