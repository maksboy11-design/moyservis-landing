/**
 * MAX Bot integration — public server-only surface.
 * Do not import from Client Components.
 */

export {
  getMaxApiBaseUrl,
  isMaxBotConfigured,
  MAX_API_BASE_URL,
  MAX_API_BASE_URL_DEFAULT,
} from "./client";
export { formatMaxLeadMessage } from "./format";
export { sendLeadMessage, sendMessage } from "./sendMessage";
export type {
  MaxApiResult,
  MaxLeadMessageField,
  MaxLeadMessageInput,
  SendLeadToMaxResult,
  SendMaxMessageParams,
} from "./types";
