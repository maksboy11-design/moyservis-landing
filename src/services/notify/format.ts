import type { LeadPayload } from "@/domain/lead/types";
import type { LeadNotifyEvent } from "./types";

const DEVICE_LABELS: Record<LeadPayload["deviceType"], string> = {
  phone: "Смартфон / планшет",
  laptop: "Ноутбук",
  pc: "Компьютер / ПК",
  console: "Игровая консоль",
  other: "Другое",
};

const CONTACT_LABELS: Record<LeadPayload["contactPref"], string> = {
  phone: "Телефон",
  messenger: "Мессенджер",
};

export function buildLeadNotifyEvent(
  payload: LeadPayload,
  id: string,
  createdAt = new Date().toISOString(),
): LeadNotifyEvent {
  return {
    id,
    createdAt,
    name: payload.name,
    phone: payload.phone,
    message: payload.message,
    deviceType: payload.deviceType,
    contactPref: payload.contactPref,
    callback: payload.callback,
    consent: payload.consent,
    source: payload.source ?? "landing",
    channel: payload.channel ?? "form",
  };
}

/** Human-readable fallback / debug message (MAX uses formatMaxLeadMessage). */
export function formatLeadMessage(event: LeadNotifyEvent): string {
  const lines = [
    "Новая заявка — МойСервис",
    "",
    `ID: ${event.id}`,
    `Имя: ${event.name}`,
    `Телефон: ${event.phone}`,
    `Устройство: ${DEVICE_LABELS[event.deviceType]}`,
    `Связь: ${CONTACT_LABELS[event.contactPref]}`,
    `Обратный звонок: ${event.callback ? "да" : "нет"}`,
    `Канал: ${event.channel}`,
    `Источник: ${event.source}`,
    `Время: ${event.createdAt}`,
  ];

  if (event.message) {
    lines.push("", `Комментарий: ${event.message}`);
  }

  return lines.join("\n");
}
