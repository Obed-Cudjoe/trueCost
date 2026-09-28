export const DATA_FRESHNESS_DAYS = 90;

export function isMonthOnlyDate(value?: string): boolean {
  return Boolean(value && /^[A-Za-z]{3,9}\s+\d{4}$/.test(value.trim()));
}

/**
 * Parse an exact ISO date, or use the end of a month when the source only stores
 * "Sep 2026". Using the end of the month avoids declaring a current-month record
 * stale before the month has finished; the UI says explicitly when the day is absent.
 */
export function parseCheckedDate(value?: string): Date | null {
  if (!value) return null;
  const exact = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (exact) return new Date(Date.UTC(Number(exact[1]), Number(exact[2]) - 1, Number(exact[3])));
  const month = /^([A-Za-z]{3,9})\s+(\d{4})$/.exec(value.trim());
  if (!month) return null;
  const index = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(month[1].slice(0, 3).toLowerCase());
  if (index < 0) return null;
  return new Date(Date.UTC(Number(month[2]), index + 1, 0));
}

export function isStale(value?: string, now = new Date()): boolean | null {
  const checked = parseCheckedDate(value);
  if (!checked) return null;
  return now.getTime() - checked.getTime() > DATA_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;
}
