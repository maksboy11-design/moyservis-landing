export { readMailConfig } from "./config";
export type { MailConfig, MailConfigResult } from "./config";
export { runMailCli } from "./cli";
export { NodemailerProvider } from "./nodemailer-provider";
export { checkMailHealth, enqueueTestMail } from "./operations";
export type { MailProvider, ProviderHealthResult } from "./provider";
export { classifyProviderError } from "./provider";
export { MailQueue } from "./queue";
export type { ClaimedMailJob, QueueEnqueueResult } from "./queue";
export { MailService } from "./service";
export type { CreateMailServiceResult } from "./service";
export { escapeHtml, renderMail } from "./templates";
export type {
  AdminNotificationTemplate,
  CallbackRequestTemplate,
  CustomerAutoReplyTemplate,
  MailAddress,
  MailAttachment,
  MailEnqueueResult,
  MailHealth,
  MailProviderError,
  MailSendRequest,
  MailTemplateMap,
  MailTemplateName,
  NewLeadTemplate,
  ProviderMessage,
  ProviderSendResult,
  RenderedMail,
  ServiceNotificationTemplate,
} from "./types";
export { MailWorker } from "./worker";
