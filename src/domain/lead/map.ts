import type { LeadInput } from "@/schemas/lead";
import type { LeadPayload } from "./types";

/** Pure mapping: validated form input → domain payload. */
export function toLeadPayload(data: LeadInput): LeadPayload {
  const message = data.message?.trim();

  return {
    name: data.name.trim(),
    phone: data.phone.trim(),
    message: message ? message : undefined,
    deviceType: data.deviceType,
    contactPref: data.contactPref,
    callback: data.callback,
    consent: data.consent,
    channel: data.callback ? "callback" : "form",
    source: "landing",
  };
}
