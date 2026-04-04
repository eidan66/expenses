/** Hebrew month names — must match dashboard transaction `month` values. */
export const HEBREW_MONTHS = [
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

export function getCurrentHebrewMonthName(): string {
  return HEBREW_MONTHS[new Date().getMonth()];
}

export function getCurrentBudgetYear(): string {
  return new Date().getFullYear().toString();
}

/** Years shown in budget/dashboard month filters (must match transaction `year` values). */
export const BUDGET_SELECTABLE_YEARS = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
] as const;

export type HebrewMonthName = (typeof HEBREW_MONTHS)[number];
export type BudgetSelectableYear = (typeof BUDGET_SELECTABLE_YEARS)[number];

export const BUDGET_PERIOD_STORAGE_KEY = "nestegg-budget-period-v1";
