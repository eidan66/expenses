/** Hebrew month labels used across NestEgg (calendar month, 1–12). */
export const HEBREW_MONTH_NAMES = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
] as const;

/**
 * Half-open ISO range `[gte, lt)` for calendar month — safe for PostgREST on
 * `date`, `timestamp`, and text columns that store ISO dates or datetimes
 * (`2026-04-15T00:00:00.000Z` sorts between `2026-04-01` and `2026-05-01`).
 * Avoids `LIKE` on `date`-typed columns (which can 500 in Postgres).
 */
export function isoDateHalfOpenRangeForHebrewCalendarMonth(
  hebrewMonth: string,
  yearStr: string
): { gte: string; lt: string } | null {
  const idx = HEBREW_MONTH_NAMES.indexOf(
    hebrewMonth as (typeof HEBREW_MONTH_NAMES)[number]
  );
  const y = parseInt(yearStr, 10);
  if (idx < 0 || !Number.isFinite(y)) return null;
  const monthNum = idx + 1;
  const mm = String(monthNum).padStart(2, "0");
  const gte = `${y}-${mm}-01`;
  let nextM = monthNum + 1;
  let nextY = y;
  if (nextM > 12) {
    nextM = 1;
    nextY = y + 1;
  }
  const lt = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
  return { gte, lt };
}

/**
 * Derives calendar month/year for bucketing from a stored date string.
 * `date` is the source of truth — ignores any separate month/year hints from agents/UI.
 *
 * Supports common Israeli formats (D.M.YYYY), ISO dates, and `Date` parseable strings.
 */
export function deriveHebrewMonthYearFromDate(dateStr: string): {
  month: string;
  year: string;
} {
  const s = dateStr.trim();

  const dmyDot = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s);
  if (dmyDot) {
    const day = parseInt(dmyDot[1], 10);
    const monthNum = parseInt(dmyDot[2], 10);
    const y = parseInt(dmyDot[3], 10);
    if (monthNum >= 1 && monthNum <= 12 && day >= 1 && day <= 31) {
      return {
        month: HEBREW_MONTH_NAMES[monthNum - 1],
        year: String(y),
      };
    }
  }

  const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (dmySlash) {
    const day = parseInt(dmySlash[1], 10);
    const monthNum = parseInt(dmySlash[2], 10);
    const y = parseInt(dmySlash[3], 10);
    if (monthNum >= 1 && monthNum <= 12 && day >= 1 && day <= 31) {
      return {
        month: HEBREW_MONTH_NAMES[monthNum - 1],
        year: String(y),
      };
    }
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const y = parseInt(iso[1], 10);
    const monthNum = parseInt(iso[2], 10);
    const day = parseInt(iso[3], 10);
    if (monthNum >= 1 && monthNum <= 12 && day >= 1 && day <= 31) {
      return {
        month: HEBREW_MONTH_NAMES[monthNum - 1],
        year: String(y),
      };
    }
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return {
      month: HEBREW_MONTH_NAMES[d.getMonth()],
      year: String(d.getFullYear()),
    };
  }

  const now = new Date();
  return {
    month: HEBREW_MONTH_NAMES[now.getMonth()],
    year: String(now.getFullYear()),
  };
}
