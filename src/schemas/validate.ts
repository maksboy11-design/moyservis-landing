import { leadSchema, type LeadFieldErrors, type LeadInput } from "./lead";

export type ValidateLeadSuccess = {
  success: true;
  data: LeadInput;
};

export type ValidateLeadFailure = {
  success: false;
  error: string;
  fieldErrors: LeadFieldErrors;
  /** Empty body / wrong shape / null */
  emptyRequest: boolean;
};

export type ValidateLeadResult = ValidateLeadSuccess | ValidateLeadFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Normalize nullish optional strings before Zod (JSON null). */
function normalizeLeadInput(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...input };

  if (next.message === null) next.message = undefined;
  if (next.website === null) next.website = "";
  if (typeof next.message === "string") next.message = next.message.trim();

  return next;
}

/**
 * Unified validation entry — Zod leadSchema is the only rule source.
 * Handles empty / malformed envelopes before field parsing.
 */
export function validateLead(input: unknown): ValidateLeadResult {
  if (input === null || input === undefined) {
    return {
      success: false,
      error: "Пустой запрос",
      fieldErrors: {},
      emptyRequest: true,
    };
  }

  if (
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean"
  ) {
    return {
      success: false,
      error: "Некорректный формат данных",
      fieldErrors: {},
      emptyRequest: true,
    };
  }

  if (Array.isArray(input) || !isPlainObject(input)) {
    return {
      success: false,
      error: "Некорректный формат данных",
      fieldErrors: {},
      emptyRequest: true,
    };
  }

  const emptyRequest = Object.keys(input).length === 0;
  const parsed = leadSchema.safeParse(normalizeLeadInput(input));

  if (!parsed.success) {
    return {
      success: false,
      error: emptyRequest ? "Пустой запрос" : "Проверьте поля формы",
      fieldErrors: parsed.error.flatten().fieldErrors as LeadFieldErrors,
      emptyRequest,
    };
  }

  return { success: true, data: parsed.data };
}
