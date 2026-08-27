import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { getEmailHealth, isEmailServiceConfigured } from "@/services/notify/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SENSITIVE_KEY =
  /password|passwd|secret|token|authorization|cookie|credential|smtp.*(user|host)|recipient|email|address|error|message/i;

function authorized(request: Request): boolean {
  const expected = env.MAIL_HEALTH_TOKEN;
  const header = request.headers.get("authorization");
  const bearer = header?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!expected || !bearer) return false;

  const actualDigest = createHash("sha256").update(bearer).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redact(item),
    ]),
  );
}

function readinessStatus(health: unknown): boolean {
  if (!health || typeof health !== "object") return false;
  const record = health as Record<string, unknown>;
  if (typeof record.ok === "boolean") return record.ok;
  if (typeof record.ready === "boolean") return record.ready;
  return isEmailServiceConfigured();
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const live = url.searchParams.get("live") === "true";
  const hasAccess = authorized(request);

  if (live && !hasAccess) {
    return Response.json(
      { ok: false, error: "unauthorized" },
      {
        status: 401,
        headers: { "cache-control": "no-store", "www-authenticate": "Bearer" },
      },
    );
  }

  try {
    const health = await getEmailHealth({
      live: hasAccess ? live : false,
    });
    const ready = readinessStatus(health);

    const body = hasAccess
      ? {
          ok: ready,
          configured: isEmailServiceConfigured(),
          health: redact(health),
        }
      : { ok: ready, configured: isEmailServiceConfigured() };

    return Response.json(body, {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    logger.exception("mail.health_failed", error, {
      live,
    });
    return Response.json(
      {
        ok: false,
        configured: isEmailServiceConfigured(),
        error: "health_check_failed",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return Response.json(
      { ok: false, error: "unauthorized" },
      {
        status: 401,
        headers: { "cache-control": "no-store", "www-authenticate": "Bearer" },
      },
    );
  }

  try {
    const body = (await request.json()) as { to?: unknown };
    const sendTestTo = typeof body.to === "string" ? body.to.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendTestTo)) {
      return Response.json(
        { ok: false, error: "invalid_test_recipient" },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    const health = await getEmailHealth({ live: true, sendTestTo });
    const ready = readinessStatus(health);
    return Response.json(
      {
        ok: ready && health.testSend?.ok === true,
        configured: isEmailServiceConfigured(),
        health: redact(health),
      },
      {
        status: ready && health.testSend?.ok === true ? 202 : 503,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch (error) {
    logger.exception("mail.test_send_failed", error);
    return Response.json(
      { ok: false, error: "invalid_request" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
}
