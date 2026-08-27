import {
  isMaxBotConfigured,
  sendLeadMessage,
} from "@/services/maxBot";
import type { LeadNotifyEvent, NotifyAdapter } from "./types";

const DEVICE_LABELS: Record<LeadNotifyEvent["deviceType"], string> = {
  phone: "Смартфон / планшет",
  laptop: "Ноутбук",
  pc: "Компьютер / ПК",
  console: "Игровая консоль",
  other: "Другое",
};

/**
 * Thin notify adapter — all MAX HTTP lives in @/services/maxBot.
 */
export const maxAdapter: NotifyAdapter = {
  channel: "max",

  isConfigured() {
    return isMaxBotConfigured();
  },

  async send(event: LeadNotifyEvent) {
    if (!this.isConfigured()) {
      return {
        channel: "max",
        skipped: true,
        ok: false,
        attempts: 0,
        latencyMs: 0,
      };
    }

    const extraFields = [
      { label: "📱 Устройство", value: DEVICE_LABELS[event.deviceType] },
      {
        label: "🔔 Обратный звонок",
        value: event.callback ? "да" : "нет",
      },
    ];

    if (event.message) {
      extraFields.push({ label: "💬 Комментарий", value: event.message });
    }

    const result = await sendLeadMessage({
      name: event.name,
      phone: event.phone,
      createdAt: event.createdAt,
      sourceLabel: "Лендинг «МойСервис»",
      extraFields,
    });

    return {
      channel: "max",
      skipped: Boolean(result.skipped),
      ok: result.ok,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  },
};
