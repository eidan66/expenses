import { deriveHebrewMonthYearFromDate } from "@shared/hebrewMonthYear";
import { HEBREW_MONTHS } from "@/lib/budgetConstants";

/**
 * ISO `YYYY-MM-DD` for the expense’s **assigned** calendar month (and optional day).
 * Use when the UI collects Hebrew month + year (no separate day) so stored `date` matches
 * the month the user chose — not “today” when they tap save in a later month.
 */
export function isoDateFromHebrewMonthYear(
  hebrewMonth: string,
  yearStr: string,
  dayOfMonth = 1
): string {
  const mi = HEBREW_MONTHS.indexOf(hebrewMonth as (typeof HEBREW_MONTHS)[number]);
  const y = parseInt(yearStr, 10);
  if (mi < 0 || !Number.isFinite(y)) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${mm}-${dd}`;
  }
  const monthNum = mi + 1;
  const lastDay = new Date(y, monthNum, 0).getDate();
  const day = Math.min(Math.max(dayOfMonth, 1), lastDay);
  return `${y}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Align stored `date` (ISO) with Hebrew `month`/`year` from the form (day 1 of that month). */
export function storagePeriodFromHebrewMonthYear(
  hebrewMonth: string,
  yearStr: string
): { date: string; month: string; year: string } {
  const date = isoDateFromHebrewMonthYear(hebrewMonth, yearStr, 1);
  const { month, year } = deriveHebrewMonthYearFromDate(date);
  return { date, month, year };
}

/**
 * Whether a transaction belongs in the selected Hebrew calendar month/year for reporting.
 * Uses the **assigned** expense `date` only — not `created_at` / `updated_at` / stored `month` & `year`.
 * (Stored month/year may still be shown in forms; totals follow `date`.)
 */
export function transactionMatchesAssignedPeriod(
  row: { date: string | null | undefined },
  hebrewMonth: string,
  year: string
): boolean {
  const d = row.date?.trim();
  if (!d) return false;
  const { month, year: y } = deriveHebrewMonthYearFromDate(d);
  return month === hebrewMonth && y === year;
}
