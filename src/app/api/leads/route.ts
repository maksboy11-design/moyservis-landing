import { createLead } from "@/services/lead/create-lead";
import { BadRequestError, toErrorResponse, ValidationError } from "@/lib/errors";
import { logger, startRequestTimer } from "@/lib/logger";
import { validateLead } from "@/schemas";

export const runtime = "nodejs";

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? undefined;
}

function isHoneypotFilled(json: unknown): boolean {
  if (!json || typeof json !== "object" || Array.isArray(json)) return false;
  const website = (json as Record<string, unknown>).website;
  return typeof website === "string" && website.trim().length > 0;
}

/**
 * POST /api/leads — thin HTTP boundary.
 * Logs outcomes + durationMs; PII/secrets redacted by logger.
 */
export async function POST(request: Request): Promise<Response> {
  const timer = startRequestTimer();
  const { requestId } = timer;
  const ip = clientIp(request);

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    logger.warn("lead.bad_json", {
      requestId,
      durationMs: timer.elapsed(),
      ip,
    });
    const { body, status } = toErrorResponse(
      new BadRequestError("Некорректный JSON"),
    );
    return Response.json(body, { status });
  }

  if (isHoneypotFilled(json)) {
    logger.warn("lead.honeypot", {
      requestId,
      durationMs: timer.elapsed(),
      ip,
    });
    return Response.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  const validated = validateLead(json);

  if (!validated.success) {
    logger.warn("lead.validation_failed", {
      requestId,
      durationMs: timer.elapsed(),
      emptyRequest: validated.emptyRequest,
      fields: Object.keys(validated.fieldErrors),
      ip,
    });
    const { body, status } = toErrorResponse(
      new ValidationError(validated.error, validated.fieldErrors),
    );
    return Response.json(body, { status });
  }

  try {
    const result = await createLead(validated.data, {
      requestId,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    logger.info("lead.request_complete", {
      requestId,
      id: result.id,
      status: 201,
      durationMs: timer.elapsed(),
      outcome: "success",
    });

    return Response.json({ ok: true, id: result.id }, { status: 201 });
  } catch (error) {
    const { body, status } = toErrorResponse(error);
    logger.exception("lead.request_failed", error, {
      requestId,
      durationMs: timer.elapsed(),
      status,
      ip,
    });
    return Response.json(body, { status });
  }
}
