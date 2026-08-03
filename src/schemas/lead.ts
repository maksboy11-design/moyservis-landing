import { z } from "zod";

export const DEVICE_TYPES = [
  "phone",
  "laptop",
  "pc",
  "console",
  "other",
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const CONTACT_PREFS = ["phone", "messenger"] as const;

export type ContactPref = (typeof CONTACT_PREFS)[number];

/**
 * Lead schema — shared by client (RHF) and server (Route Handler).
 * Ready for backend integration / Conversion stage notify adapters.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя")
    .max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(10, "Укажите телефон")
    .max(20, "Слишком длинный телефон")
    .regex(/^[+\d()\-\s]+$/, "Некорректный телефон"),
  message: z.string().trim().max(1000, "Слишком длинное сообщение").optional(),
  deviceType: z.enum(DEVICE_TYPES, {
    message: "Выберите тип устройства",
  }),
  contactPref: z.enum(CONTACT_PREFS, {
    message: "Выберите способ связи",
  }),
  callback: z.boolean(),
  consent: z.boolean().refine((value) => value === true, {
    message: "Нужно согласие на обработку данных",
  }),
  /** Honeypot — must stay empty */
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadDefaultValues: LeadInput = {
  name: "",
  phone: "",
  message: "",
  deviceType: "phone",
  contactPref: "phone",
  callback: false,
  consent: false,
  website: "",
};

/** Public API contract */
export type LeadApiSuccess = {
  ok: true;
  id: string;
};

export type LeadApiError = {
  ok: false;
  error: string;
  fieldErrors?: Partial<Record<keyof LeadInput, string[]>>;
};

export type LeadApiResponse = LeadApiSuccess | LeadApiError;
