import { z } from "zod";

/** Shared field primitives — sole Zod building blocks for lead validation. */

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const PHONE_MAX_LEN = 20;
export const PHONE_MIN_DIGITS = 10;
export const PHONE_MAX_DIGITS = 15;
export const MESSAGE_MAX = 1000;

/** Letters (any script), combining marks, spaces, hyphen, apostrophe. */
const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[\s'’\-]+[\p{L}\p{M}]+)*$/u;

const PHONE_CHARS_PATTERN = /^[+\d()\-\s]+$/;

/** Control chars except TAB / LF / CR. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function countDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

export const nameField = z
  .string({ error: "Укажите имя" })
  .trim()
  .superRefine((value, ctx) => {
    if (!value || value.length < NAME_MIN) {
      ctx.addIssue({ code: "custom", message: "Укажите имя" });
      return;
    }
    if (value.length > NAME_MAX) {
      ctx.addIssue({ code: "custom", message: "Слишком длинное имя" });
      return;
    }
    if (!NAME_PATTERN.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Имя содержит недопустимые символы",
      });
    }
  });
export const phoneField = z
  .string({ error: "Укажите телефон" })
  .trim()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: "custom", message: "Укажите телефон" });
      return;
    }

    if (value.length > PHONE_MAX_LEN) {
      ctx.addIssue({ code: "custom", message: "Слишком длинный телефон" });
      return;
    }

    if (!PHONE_CHARS_PATTERN.test(value)) {
      ctx.addIssue({ code: "custom", message: "Некорректный телефон" });
      return;
    }

    const digits = countDigits(value);
    if (digits < PHONE_MIN_DIGITS || digits > PHONE_MAX_DIGITS) {
      ctx.addIssue({ code: "custom", message: "Некорректный телефон" });
    }
  });

/**
 * Optional comment. Empty / whitespace → still valid string;
 * domain map coerces blank to undefined.
 */
export const messageField = z
  .string({ error: "Некорректное сообщение" })
  .trim()
  .max(MESSAGE_MAX, "Слишком длинное сообщение")
  .refine((value) => !CONTROL_CHARS.test(value), {
    message: "Сообщение содержит недопустимые символы",
  })
  .optional();

export const consentField = z
  .boolean({ error: "Нужно согласие на обработку данных" })
  .refine((value) => value === true, {
    message: "Нужно согласие на обработку данных",
  });

/** Honeypot — must be absent or empty. */
export const honeypotField = z
  .string()
  .trim()
  .max(0, "Некорректный запрос")
  .optional();
