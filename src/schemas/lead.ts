import { z } from "zod";
import {
  consentField,
  honeypotField,
  messageField,
  nameField,
  phoneField,
} from "./fields";

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
 * Lead schema — single Zod source of truth for client (RHF) and server.
 * Field rules live in schemas/fields.ts; compose here only.
 */
export const leadSchema = z.object({
  name: nameField,
  phone: phoneField,
  message: messageField,
  deviceType: z.enum(DEVICE_TYPES, {
    message: "Выберите тип устройства",
  }),
  contactPref: z.enum(CONTACT_PREFS, {
    message: "Выберите способ связи",
  }),
  callback: z.boolean({ error: "Некорректное значение" }),
  consent: consentField,
  website: honeypotField,
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadFieldErrors = Partial<Record<keyof LeadInput, string[]>>;

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
  fieldErrors?: LeadFieldErrors;
};

export type LeadApiResponse = LeadApiSuccess | LeadApiError;
