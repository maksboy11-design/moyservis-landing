import type { LeadApiResponse, LeadFieldErrors } from "@/schemas/lead";

export type FieldErrors = LeadFieldErrors;

/**
 * Domain / application errors — map to HTTP at the transport boundary only.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    status: number,
    code: string,
    fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Некорректный запрос") {
    super(message, 400, "bad_request");
    this.name = "BadRequestError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Проверьте поля формы", fieldErrors?: FieldErrors) {
    super(message, 422, "validation_error", fieldErrors);
    this.name = "ValidationError";
  }
}

export class UpstreamError extends AppError {
  constructor(message = "Не удалось отправить заявку. Попробуйте позже.") {
    super(message, 502, "upstream_error");
    this.name = "UpstreamError";
  }
}

export function toErrorResponse(error: unknown): {
  body: LeadApiResponse;
  status: number;
} {
  if (error instanceof AppError) {
    const body: LeadApiResponse = {
      ok: false,
      error: error.message,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    };
    return { body, status: error.status };
  }

  const body: LeadApiResponse = {
    ok: false,
    error: "Что-то пошло не так. Попробуйте ещё раз.",
  };
  return { body, status: 500 };
}
