/**
 * Formats review ISO date for RU locale. Returns null if missing/invalid.
 */
export function formatReviewDate(iso?: string): string | null {
  if (!iso) return null;

  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
