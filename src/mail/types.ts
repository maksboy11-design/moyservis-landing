export type MailAddress = string | { name?: string; address: string };

export type MailAttachment = {
  filename: string;
  content: string | Uint8Array;
  contentType?: string;
  contentDisposition?: "attachment" | "inline";
  cid?: string;
};

export type NewLeadTemplate = {
  leadId: string;
  name: string;
  phone: string;
  device?: string;
  message?: string;
  source?: string;
  createdAt?: string;
};

export type CallbackRequestTemplate = {
  requestId: string;
  name: string;
  phone: string;
  preferredTime?: string;
  comment?: string;
};

export type AdminNotificationTemplate = {
  title: string;
  message: string;
  details?: ReadonlyArray<{ label: string; value: string }>;
  actionUrl?: string;
  actionLabel?: string;
};

export type CustomerAutoReplyTemplate = {
  customerName: string;
  requestId?: string;
  summary?: string;
  expectedResponseTime?: string;
  contactPhone?: string;
};

export type ServiceNotificationTemplate = {
  customerName: string;
  orderId: string;
  status: string;
  message: string;
  serviceName?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export type MailTemplateMap = {
  newLead: NewLeadTemplate;
  callbackRequest: CallbackRequestTemplate;
  adminNotification: AdminNotificationTemplate;
  customerAutoReply: CustomerAutoReplyTemplate;
  serviceNotification: ServiceNotificationTemplate;
};

export type MailTemplateName = keyof MailTemplateMap;

export type MailSendRequest<K extends MailTemplateName = MailTemplateName> = {
  template: K;
  data: MailTemplateMap[K];
  to: MailAddress | ReadonlyArray<MailAddress>;
  /** Optional safe override for the template subject. */
  subject?: string;
  cc?: MailAddress | ReadonlyArray<MailAddress>;
  bcc?: MailAddress | ReadonlyArray<MailAddress>;
  replyTo?: MailAddress;
  attachments?: ReadonlyArray<MailAttachment>;
  idempotencyKey?: string;
  priority?: number;
};

export type MailEnqueueResult =
  | { ok: true; jobId: string; duplicate: boolean }
  | {
      ok: false;
      reason: "not_configured" | "invalid_request" | "queue_unavailable";
      error: string;
    };

export type RenderedMail = {
  subject: string;
  html: string;
  text: string;
};

export type ProviderMessage = {
  from: MailAddress;
  to: MailAddress | ReadonlyArray<MailAddress>;
  cc?: MailAddress | ReadonlyArray<MailAddress>;
  bcc?: MailAddress | ReadonlyArray<MailAddress>;
  replyTo?: MailAddress;
  subject: string;
  html: string;
  text: string;
  attachments?: ReadonlyArray<MailAttachment>;
};

export type ProviderSendResult =
  | { ok: true; messageId: string; accepted: string[]; rejected: string[] }
  | { ok: false; error: MailProviderError };

export type MailProviderError = {
  message: string;
  code?: string;
  responseCode?: number;
  retryable: boolean;
};

export type MailHealth = {
  ok: boolean;
  status: "healthy" | "degraded" | "unhealthy" | "disabled";
  queue: { ok: boolean; pending?: number; error?: string };
  provider: { ok: boolean; configured: boolean; error?: string };
};
