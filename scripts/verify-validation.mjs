/**
 * Edge-case suite for the unified Zod validation layer.
 * Mirrors src/schemas/{fields,lead,validate}.ts — keep in sync when rules change.
 * Run: node scripts/verify-validation.mjs
 */
import { z } from "zod";

const NAME_MIN = 2;
const NAME_MAX = 80;
const PHONE_MAX_LEN = 20;
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;
const MESSAGE_MAX = 1000;
const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[\s'’\-]+[\p{L}\p{M}]+)*$/u;
const PHONE_CHARS_PATTERN = /^[+\d()\-\s]+$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const DEVICE_TYPES = ["phone", "laptop", "pc", "console", "other"];
const CONTACT_PREFS = ["phone", "messenger"];

function countDigits(value) {
  return value.replace(/\D/g, "").length;
}

const nameField = z
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
const phoneField = z
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

const messageField = z
  .string({ error: "Некорректное сообщение" })
  .trim()
  .max(MESSAGE_MAX, "Слишком длинное сообщение")
  .refine((value) => !CONTROL_CHARS.test(value), {
    message: "Сообщение содержит недопустимые символы",
  })
  .optional();

const leadSchema = z.object({
  name: nameField,
  phone: phoneField,
  message: messageField,
  deviceType: z.enum(DEVICE_TYPES, { message: "Выберите тип устройства" }),
  contactPref: z.enum(CONTACT_PREFS, { message: "Выберите способ связи" }),
  callback: z.boolean({ error: "Некорректное значение" }),
  consent: z
    .boolean({ error: "Нужно согласие на обработку данных" })
    .refine((v) => v === true, {
      message: "Нужно согласие на обработку данных",
    }),
  website: z.string().trim().max(0, "Некорректный запрос").optional(),
});

function validateLead(input) {
  if (input === null || input === undefined) {
    return { success: false, emptyRequest: true, fields: [] };
  }
  if (
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean" ||
    Array.isArray(input) ||
    typeof input !== "object"
  ) {
    return { success: false, emptyRequest: true, fields: [] };
  }
  const emptyRequest = Object.keys(input).length === 0;
  const next = { ...input };
  if (next.message === null) next.message = undefined;
  if (next.website === null) next.website = "";
  const parsed = leadSchema.safeParse(next);
  if (!parsed.success) {
    return {
      success: false,
      emptyRequest,
      fields: Object.keys(parsed.error.flatten().fieldErrors),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  return { success: true, data: parsed.data };
}

const valid = {
  name: "Иван",
  phone: "+7 (900) 123-45-67",
  message: "",
  deviceType: "phone",
  contactPref: "phone",
  callback: false,
  consent: true,
  website: "",
};

const cases = [
  ["valid cyrillic name", () => validateLead(valid).success === true],
  [
    "valid latin + hyphen",
    () =>
      validateLead({ ...valid, name: "Jean-Luc" }).success === true,
  ],
  [
    "valid apostrophe",
    () => validateLead({ ...valid, name: "O'Brien" }).success === true,
  ],
  ["empty name", () => {
    const r = validateLead({ ...valid, name: "" });
    return !r.success && r.fields.includes("name");
  }],
  ["name too short", () => {
    const r = validateLead({ ...valid, name: "А" });
    return !r.success && r.fields.includes("name");
  }],
  ["name too long", () => {
    const r = validateLead({ ...valid, name: "А".repeat(81) });
    return !r.success && r.fields.includes("name");
  }],
  ["name with digits", () => {
    const r = validateLead({ ...valid, name: "Иван123" });
    return !r.success && r.fields.includes("name");
  }],
  ["name with HTML", () => {
    const r = validateLead({ ...valid, name: "<script>" });
    return !r.success && r.fields.includes("name");
  }],
  ["name with emoji", () => {
    const r = validateLead({ ...valid, name: "Иван😀" });
    return !r.success && r.fields.includes("name");
  }],
  ["name whitespace only", () => {
    const r = validateLead({ ...valid, name: "   " });
    return !r.success && r.fields.includes("name");
  }],
  ["empty phone", () => {
    const r = validateLead({ ...valid, phone: "" });
    return !r.success && r.fields.includes("phone");
  }],
  ["phone letters", () => {
    const r = validateLead({ ...valid, phone: "abcdefghij" });
    return !r.success && r.fields.includes("phone");
  }],
  ["phone too few digits", () => {
    const r = validateLead({ ...valid, phone: "12345" });
    return !r.success && r.fields.includes("phone");
  }],
  ["phone special only", () => {
    const r = validateLead({ ...valid, phone: "+()--" });
    return !r.success && r.fields.includes("phone");
  }],
  ["phone too long string", () => {
    const r = validateLead({ ...valid, phone: "+7 900 123-45-678901234" });
    return !r.success && r.fields.includes("phone");
  }],
  ["missing consent", () => {
    const r = validateLead({ ...valid, consent: false });
    return !r.success && r.fields.includes("consent");
  }],
  ["consent wrong type", () => {
    const r = validateLead({ ...valid, consent: "yes" });
    return !r.success && r.fields.includes("consent");
  }],
  ["invalid deviceType", () => {
    const r = validateLead({ ...valid, deviceType: "toaster" });
    return !r.success && r.fields.includes("deviceType");
  }],
  ["invalid contactPref", () => {
    const r = validateLead({ ...valid, contactPref: "fax" });
    return !r.success && r.fields.includes("contactPref");
  }],
  ["callback not boolean", () => {
    const r = validateLead({ ...valid, callback: "true" });
    return !r.success && r.fields.includes("callback");
  }],
  ["message too long", () => {
    const r = validateLead({ ...valid, message: "x".repeat(MESSAGE_MAX + 1) });
    return !r.success && r.fields.includes("message");
  }],
  ["message control char", () => {
    const r = validateLead({ ...valid, message: "hi\u0000there" });
    return !r.success && r.fields.includes("message");
  }],
  ["honeypot filled", () => {
    const r = validateLead({ ...valid, website: "http://spam" });
    return !r.success && r.fields.includes("website");
  }],
  ["empty object", () => {
    const r = validateLead({});
    return !r.success && r.emptyRequest === true;
  }],
  ["null request", () => {
    const r = validateLead(null);
    return !r.success && r.emptyRequest === true;
  }],
  ["undefined request", () => {
    const r = validateLead(undefined);
    return !r.success && r.emptyRequest === true;
  }],
  ["array request", () => {
    const r = validateLead([]);
    return !r.success && r.emptyRequest === true;
  }],
  ["string request", () => {
    const r = validateLead("lead");
    return !r.success && r.emptyRequest === true;
  }],
  ["missing required fields", () => {
    const r = validateLead({ consent: true });
    return (
      !r.success &&
      r.fields.includes("name") &&
      r.fields.includes("phone") &&
      r.fields.includes("deviceType")
    );
  }],
  ["message null normalized", () => {
    const r = validateLead({ ...valid, message: null });
    return r.success === true;
  }],
];

let failed = 0;
for (const [name, run] of cases) {
  let pass = false;
  try {
    pass = run() === true;
  } catch {
    pass = false;
  }
  if (!pass) failed += 1;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
}

console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed === 0 ? 0 : 1);
