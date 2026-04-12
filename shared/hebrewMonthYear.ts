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

/** Zero-width / BOM characters that sometimes appear in copy-paste or chat URLs. */
const HE_MONTH_STRIP = /[\u200B-\u200D\uFEFF]/g;

/**
 * Normalize user-supplied Hebrew month text so it matches `HEBREW_MONTH_NAMES`
 * (NFC, trim, strip invisible chars).
 */
export function normalizeHebrewMonthLabelInput(input: string): string {
  return input.replace(HE_MONTH_STRIP, "").trim().normalize("NFC");
}

/** Resolve to a canonical month label, or `null` if unknown. */
export function canonicalHebrewMonthFromUserInput(input: string): string | null {
  const n = normalizeHebrewMonthLabelInput(input);
  for (const name of HEBREW_MONTH_NAMES) {
    if (name === n) return name;
  }
  return null;
}

export type HebrewCalendarMonthSummaryQuery = {
  canonicalMonth: string;
  year: string;
  range: { gte: string; lt: string };
};

/**
 * Validates month + year for `/month-summary`: canonical Hebrew month, year string,
 * and half-open ISO `[gte, lt)` for PostgREST. Returns `null` if month/year are invalid.
 */
export function resolveHebrewCalendarMonthSummaryQuery(
  hebrewMonthInput: string,
  yearStrInput: string
): HebrewCalendarMonthSummaryQuery | null {
  const canonicalMonth = canonicalHebrewMonthFromUserInput(hebrewMonthInput);
  const y = parseInt(String(yearStrInput).trim(), 10);
  if (!canonicalMonth || !Number.isFinite(y) || y < 1970 || y > 2100) {
    return null;
  }
  const idx = HEBREW_MONTH_NAMES.indexOf(
    canonicalMonth as (typeof HEBREW_MONTH_NAMES)[number]
  );
  if (idx < 0) return null;
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
  return {
    canonicalMonth,
    year: String(y),
    range: { gte, lt },
  };
}

/**
 * @deprecated Prefer `resolveHebrewCalendarMonthSummaryQuery` (normalizes month input).
 */
export function isoDateHalfOpenRangeForHebrewCalendarMonth(
  hebrewMonth: string,
  yearStr: string
): { gte: string; lt: string } | null {
  const r = resolveHebrewCalendarMonthSummaryQuery(hebrewMonth, yearStr);
  return r?.range ?? null;
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
