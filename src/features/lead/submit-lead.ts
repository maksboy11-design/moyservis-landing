import type { LeadApiError, LeadApiResponse, LeadInput } from "@/schemas/lead";

export type LeadFieldErrors = NonNullable<LeadApiError["fieldErrors"]>;

export class LeadSubmitError extends Error {
  readonly status: number;
  readonly fieldErrors?: LeadFieldErrors;

  constructor(message: string, status: number, fieldErrors?: LeadFieldErrors) {
    super(message);
    this.name = "LeadSubmitError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Client → POST /api/leads
 * Ready to swap for Server Action later without changing form UI.
 */
export async function submitLead(data: LeadInput): Promise<{ id: string }> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });

  let payload: LeadApiResponse;

  try {
    payload = (await response.json()) as LeadApiResponse;
  } catch {
    throw new LeadSubmitError("Ошибка ответа сервера", response.status);
  }

  if (!response.ok || !payload.ok) {
    const errorPayload = payload as LeadApiError;
    throw new LeadSubmitError(
      errorPayload.error ?? "Не удалось отправить заявку",
      response.status,
      errorPayload.fieldErrors,
    );
  }

  return { id: payload.id };
}
