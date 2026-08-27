import type { MaxLeadMessageField, MaxLeadMessageInput } from "./types";

const DEFAULT_SOURCE = "Лендинг «МойСервис»";

function formatDisplayTime(createdAt?: string | Date): string {
  const date =
    createdAt instanceof Date
      ? createdAt
      : createdAt
        ? new Date(createdAt)
        : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
    });
  }

  return date.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
}

function appendField(
  lines: string[],
  label: string,
  value: string,
): void {
  lines.push(`${label}:`, value, "");
}

/**
 * Builds the MAX notification text.
 * Core block is fixed; extraFields extend without changing callers.
 */
export function formatMaxLeadMessage(input: MaxLeadMessageInput): string {
  const lines: string[] = ["📩 Новая заявка", ""];

  appendField(lines, "👤 Имя", input.name);
  appendField(lines, "📞 Телефон", input.phone);
  appendField(lines, "🕒 Время", formatDisplayTime(input.createdAt));
  appendField(lines, "🌐 Источник", input.sourceLabel ?? DEFAULT_SOURCE);

  const extras: MaxLeadMessageField[] = input.extraFields ?? [];
  for (const field of extras) {
    if (!field.label || field.value === undefined || field.value === "") {
      continue;
    }
    appendField(lines, field.label, field.value);
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}
