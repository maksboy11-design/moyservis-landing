/**
 * Validation layer — Zod schemas are the single source of rules.
 * Import from `@/schemas` in features / route handlers.
 */

export {
  CONTACT_PREFS,
  DEVICE_TYPES,
  leadDefaultValues,
  leadSchema,
  type ContactPref,
  type DeviceType,
  type LeadApiError,
  type LeadApiResponse,
  type LeadApiSuccess,
  type LeadFieldErrors,
  type LeadInput,
} from "./lead";

export {
  MESSAGE_MAX,
  NAME_MAX,
  NAME_MIN,
  PHONE_MAX_DIGITS,
  PHONE_MAX_LEN,
  PHONE_MIN_DIGITS,
  consentField,
  countDigits,
  honeypotField,
  messageField,
  nameField,
  phoneField,
} from "./fields";

export {
  validateLead,
  type ValidateLeadFailure,
  type ValidateLeadResult,
  type ValidateLeadSuccess,
} from "./validate";
