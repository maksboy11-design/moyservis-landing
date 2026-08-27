/**
 * MAX Bot API types — server-only.
 * @see https://dev.max.ru/docs-api/methods/POST/messages
 */

/** Extensible lead fields for the MAX notification message. */
export type MaxLeadMessageField = {
  label: string;
  value: string;
};

export type MaxLeadMessageInput = {
  name: string;
  phone: string;
  /** ISO timestamp or Date; formatted for display. */
  createdAt?: string | Date;
  /** Default: Лендинг «МойСервис» */
  sourceLabel?: string;
  /**
   * Extra sections appended after the core block.
   * Use when the form gains more fields without rewriting the formatter.
   */
  extraFields?: MaxLeadMessageField[];
};

export type SendMaxMessageParams = {
  text: string;
  /** Destination chat / channel / user id (integer as string from env). */
  chatId: string;
  /** Query recipient: chat_id (default) or user_id for personal dialogs. */
  recipient?: "chat" | "user";
  disableLinkPreview?: boolean;
};

export type MaxApiResult = {
  ok: boolean;
  status: number;
  attempts: number;
  latencyMs: number;
  error?: string;
};

export type SendLeadToMaxResult = MaxApiResult & {
  skipped?: boolean;
};
