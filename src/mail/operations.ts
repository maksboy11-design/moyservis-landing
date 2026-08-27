import { NodemailerProvider } from "./nodemailer-provider";
import type { MailProvider } from "./provider";
import type { MailService } from "./service";
import type { MailEnqueueResult, MailHealth } from "./types";

export async function checkMailHealth(
  service: MailService,
  provider?: MailProvider,
): Promise<MailHealth> {
  const queue = service.queueHealth();
  if (!service.config.enabled) {
    return {
      ok: queue.ok,
      status: "disabled",
      queue,
      provider: { ok: true, configured: false },
    };
  }

  let ownedProvider: MailProvider | undefined;
  try {
    ownedProvider = provider ?? new NodemailerProvider(service.config);
    const providerResult = await ownedProvider.healthCheck();
    const providerHealth = providerResult.ok
      ? { ok: true as const, configured: true }
      : {
          ok: false as const,
          configured: true,
          error: providerResult.error.message,
        };
    const ok = queue.ok && providerHealth.ok;
    return {
      ok,
      status: ok ? "healthy" : queue.ok ? "degraded" : "unhealthy",
      queue,
      provider: providerHealth,
    };
  } catch (error) {
    return {
      ok: false,
      status: queue.ok ? "degraded" : "unhealthy",
      queue,
      provider: {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "Provider check failed",
      },
    };
  } finally {
    if (!provider) await ownedProvider?.close();
  }
}

export function enqueueTestMail(
  service: MailService,
  recipient: string,
): Promise<MailEnqueueResult> {
  return service.send({
    template: "adminNotification",
    to: recipient,
    data: {
      title: "Проверка почтового сервиса",
      message: "Тестовое сообщение успешно прошло постановку в очередь.",
      details: [
        { label: "Время", value: new Date().toISOString() },
        { label: "Окружение", value: process.env.NODE_ENV ?? "unknown" },
      ],
    },
    idempotencyKey: `mail-test:${Date.now()}`,
  });
}
