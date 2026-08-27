import type { MailTemplateMap, MailTemplateName, RenderedMail } from "./types";

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function text(value: string | undefined, fallback = "Не указано"): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function safeActionUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function safeSubject(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 200);
}

function rows(values: ReadonlyArray<{ label: string; value: string | undefined }>): {
  html: string;
  text: string;
} {
  const filtered = values.filter((item) => item.value?.trim());
  return {
    html: filtered
      .map(
        ({ label, value }) =>
          `<tr><th style="padding:8px 12px;text-align:left;vertical-align:top;color:#475569">${escapeHtml(label)}</th><td style="padding:8px 12px;color:#0f172a;white-space:pre-wrap">${escapeHtml(text(value))}</td></tr>`,
      )
      .join(""),
    text: filtered.map(({ label, value }) => `${label}: ${text(value)}`).join("\n"),
  };
}

function layout(options: {
  heading: string;
  intro?: string;
  bodyHtml: string;
  bodyText: string;
  actionUrl?: string;
  actionLabel?: string;
}): { html: string; text: string } {
  const actionUrl = safeActionUrl(options.actionUrl);
  const action =
    actionUrl && options.actionLabel
      ? `<p style="margin:24px 0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none">${escapeHtml(options.actionLabel)}</a></p>`
      : "";
  const actionText =
    actionUrl && options.actionLabel ? `\n\n${options.actionLabel}: ${actionUrl}` : "";

  return {
    html: `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(options.intro ?? options.heading)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px"><tr><td style="padding:28px"><h1 style="margin:0 0 18px;font-size:24px">${escapeHtml(options.heading)}</h1>${options.intro ? `<p style="line-height:1.6">${escapeHtml(options.intro)}</p>` : ""}${options.bodyHtml}${action}<p style="margin:28px 0 0;color:#64748b;font-size:12px">Это автоматическое сообщение. Не передавайте в ответ пароли или коды подтверждения.</p></td></tr></table></td></tr></table></body></html>`,
    text: `${options.heading}${options.intro ? `\n\n${options.intro}` : ""}\n\n${options.bodyText}${actionText}\n\nЭто автоматическое сообщение. Не передавайте в ответ пароли или коды подтверждения.`,
  };
}

const renderers: {
  [K in MailTemplateName]: (data: MailTemplateMap[K]) => RenderedMail;
} = {
  newLead(data) {
    const content = rows([
      { label: "Номер заявки", value: data.leadId },
      { label: "Имя", value: data.name },
      { label: "Телефон", value: data.phone },
      { label: "Устройство", value: data.device },
      { label: "Сообщение", value: data.message },
      { label: "Источник", value: data.source },
      { label: "Создана", value: data.createdAt },
    ]);
    return {
      subject: `Новая заявка ${data.leadId}`,
      ...layout({
        heading: "Новая заявка",
        intro: "На сайте оставлена новая заявка.",
        bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content.html}</table>`,
        bodyText: content.text,
      }),
    };
  },
  callbackRequest(data) {
    const content = rows([
      { label: "Номер запроса", value: data.requestId },
      { label: "Имя", value: data.name },
      { label: "Телефон", value: data.phone },
      { label: "Удобное время", value: data.preferredTime },
      { label: "Комментарий", value: data.comment },
    ]);
    return {
      subject: `Запрос обратного звонка ${data.requestId}`,
      ...layout({
        heading: "Запрос обратного звонка",
        bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content.html}</table>`,
        bodyText: content.text,
      }),
    };
  },
  adminNotification(data) {
    const content = rows(data.details ?? []);
    return {
      subject: data.title,
      ...layout({
        heading: data.title,
        intro: data.message,
        bodyHtml: content.html
          ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content.html}</table>`
          : "",
        bodyText: content.text,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
      }),
    };
  },
  customerAutoReply(data) {
    const content = rows([
      { label: "Номер обращения", value: data.requestId },
      { label: "Обращение", value: data.summary },
      { label: "Срок ответа", value: data.expectedResponseTime },
      { label: "Телефон сервиса", value: data.contactPhone },
    ]);
    return {
      subject: data.requestId
        ? `Мы получили обращение ${data.requestId}`
        : "Мы получили ваше обращение",
      ...layout({
        heading: `Здравствуйте, ${data.customerName}!`,
        intro: "Спасибо за обращение. Специалист свяжется с вами.",
        bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content.html}</table>`,
        bodyText: content.text,
      }),
    };
  },
  serviceNotification(data) {
    const content = rows([
      { label: "Заказ", value: data.orderId },
      { label: "Статус", value: data.status },
      { label: "Сервис", value: data.serviceName },
      { label: "Комментарий", value: data.message },
    ]);
    return {
      subject: `Заказ ${data.orderId}: ${data.status}`,
      ...layout({
        heading: `Здравствуйте, ${data.customerName}!`,
        intro: `Статус заказа ${data.orderId} изменился.`,
        bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content.html}</table>`,
        bodyText: content.text,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
      }),
    };
  },
};

export function renderMail<K extends MailTemplateName>(
  template: K,
  data: MailTemplateMap[K],
): RenderedMail {
  const renderer = renderers[template] as (value: MailTemplateMap[K]) => RenderedMail;
  const rendered = renderer(data);
  return { ...rendered, subject: safeSubject(rendered.subject) };
}
