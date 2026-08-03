import { notifyLeadStub } from "@/services/notify";
import {
  leadSchema,
  type LeadApiResponse,
  type LeadInput,
} from "@/schemas/lead";
import type { LeadPayload } from "@/domain/lead/types";

export const runtime = "nodejs";

function toPayload(data: LeadInput): LeadPayload {
  return {
    name: data.name,
    phone: data.phone,
    message: data.message ? data.message : undefined,
    deviceType: data.deviceType,
    contactPref: data.contactPref,
    callback: data.callback,
    consent: data.consent,
    channel: data.callback ? "callback" : "form",
    source: "landing",
  };
}

/**
 * POST /api/leads — backend-ready lead intake.
 * Validates with Zod, rejects honeypot, notifies via service adapter.
 */
export async function POST(request: Request): Promise<Response> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    const body: LeadApiResponse = {
      ok: false,
      error: "Некорректный JSON",
    };
    return Response.json(body, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);

  if (!parsed.success) {
    const body: LeadApiResponse = {
      ok: false,
      error: "Проверьте поля формы",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<keyof LeadInput, string[]>
      >,
    };
    return Response.json(body, { status: 422 });
  }

  const payload = toPayload(parsed.data);

  // Honeypot already enforced by schema (website max 0).
  const notify = await notifyLeadStub(payload);

  if (!notify.ok && notify.reason === "upstream_error") {
    const body: LeadApiResponse = {
      ok: false,
      error: "Не удалось отправить заявку. Попробуйте позже.",
    };
    return Response.json(body, { status: 502 });
  }

  // not_configured is OK in foundation — accept lead, log for Conversion stage
  console.info("[lead]", {
    ...payload,
    notify: notify.ok ? "sent" : notify.reason,
  });

  const body: LeadApiResponse = {
    ok: true,
    id: crypto.randomUUID(),
  };

  return Response.json(body, { status: 201 });
}
