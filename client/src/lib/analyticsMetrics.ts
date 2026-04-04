import type { Transaction } from "@shared/schema";
import { safeParseFloat, safeParseInt } from "@/lib/utils";

export const ANALYTICS_MONTHS = [
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

export type AnalyticsTimeRange = "all" | "ytd" | "12m" | "6m" | "3m";

export type MonthlySeriesPoint = {
  name: string;
  income: number;
  expenses: number;
  netFlow: number;
  savingsTransfers: number;
  monthIndex: number;
  year: number;
};

export type NamedAmount = { name: string; value: number };

export type AnalyticsKpis = {
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  avgSavingsTransfers: number;
  avgSavingsRate: number;
  totalExpensesInPeriod: number;
  totalIncomeInPeriod: number;
  cumulativeNetEnd: number;
  momIncomePct: number | null;
  momExpensePct: number | null;
};

export type AnalyticsReport = {
  range: AnalyticsTimeRange;
  filteredTransactions: Transaction[];
  monthlySeries: MonthlySeriesPoint[];
  cumulativeNet: { name: string; total: number }[];
  expenseByCategory: NamedAmount[];
  expenseBySubcategory: NamedAmount[];
  incomeBySubcategory: NamedAmount[];
  pieExpenseSlices: NamedAmount[];
  kpis: AnalyticsKpis;
  insights: string[];
};

const PIE_TOP_N = 7;
const SUB_TOP_K = 12;

function txPeriodValue(t: Transaction): number {
  const mi = ANALYTICS_MONTHS.indexOf(t.month as (typeof ANALYTICS_MONTHS)[number]);
  const y = safeParseInt(t.year);
  if (mi < 0 || !Number.isFinite(y)) return Number.NaN;
  return y * 12 + mi;
}

export function filterTransactionsByRange(
  transactions: Transaction[],
  range: AnalyticsTimeRange
): Transaction[] {
  if (range === "all") return transactions;

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth();

  if (range === "ytd") {
    return transactions.filter((t) => {
      const y = safeParseInt(t.year);
      const mi = ANALYTICS_MONTHS.indexOf(
        t.month as (typeof ANALYTICS_MONTHS)[number]
      );
      if (mi < 0 || !Number.isFinite(y)) return false;
      if (y !== curY) return false;
      return mi <= curM;
    });
  }

  const monthsBack = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  const cutoff = new Date(curY, curM - monthsBack + 1, 1);
  const cutoffVal = cutoff.getFullYear() * 12 + cutoff.getMonth();

  return transactions.filter((t) => {
    const v = txPeriodValue(t);
    return Number.isFinite(v) && v >= cutoffVal;
  });
}

export function topNWithOther(
  items: NamedAmount[],
  n: number,
  otherLabel = "אחר"
): NamedAmount[] {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  if (sorted.length <= n) return sorted;
  const head = sorted.slice(0, n);
  const rest = sorted.slice(n).reduce((s, x) => s + x.value, 0);
  if (rest > 0) head.push({ name: otherLabel, value: rest });
  return head;
}

function classifyTx(t: Transaction): {
  isIncome: boolean;
  isSavings: boolean;
  isExpense: boolean;
  abs: number;
} {
  const amount = safeParseFloat(t.amount);
  const isIncome = amount > 0 && t.category === "הכנסה";
  const isSavings = t.category === "חיסכון";
  const isExpense = amount < 0 && !isSavings;
  return {
    isIncome,
    isSavings,
    isExpense,
    abs: Math.abs(amount),
  };
}

export function buildAnalyticsReport(
  transactions: Transaction[],
  range: AnalyticsTimeRange
): AnalyticsReport {
  const filteredTransactions = filterTransactionsByRange(transactions, range);

  const monthlyMap = new Map<
    string,
    {
      income: number;
      expenses: number;
      savingsTransfers: number;
      monthIndex: number;
      year: number;
    }
  >();

  const categoryExpense = new Map<string, number>();
  const subExpense = new Map<string, number>();
  const incomeSub = new Map<string, number>();

  for (const t of filteredTransactions) {
    const { isIncome, isSavings, isExpense, abs } = classifyTx(t);
    const monthIndex = ANALYTICS_MONTHS.indexOf(
      t.month as (typeof ANALYTICS_MONTHS)[number]
    );
    const year = safeParseInt(t.year);
    const key = `${t.month} ${t.year}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        income: 0,
        expenses: 0,
        savingsTransfers: 0,
        monthIndex: monthIndex >= 0 ? monthIndex : 0,
        year: Number.isFinite(year) ? year : 0,
      });
    }
    const m = monthlyMap.get(key)!;
    if (isIncome) m.income += abs;
    else if (isSavings) m.savingsTransfers += abs;
    else if (isExpense) m.expenses += abs;

    if (isExpense) {
      categoryExpense.set(t.category, (categoryExpense.get(t.category) || 0) + abs);
      const subLabel = t.subcategory?.trim()
        ? `${t.category} • ${t.subcategory}`
        : t.category;
      subExpense.set(subLabel, (subExpense.get(subLabel) || 0) + abs);
    }
    if (isIncome) {
      const sub = t.subcategory?.trim() || "ללא תת-קטגוריה";
      incomeSub.set(sub, (incomeSub.get(sub) || 0) + abs);
    }
  }

  const monthlySeries: MonthlySeriesPoint[] = Array.from(monthlyMap.entries())
    .map(([name, d]) => ({
      name,
      income: d.income,
      expenses: d.expenses,
      netFlow: d.income - d.expenses,
      savingsTransfers: d.savingsTransfers,
      monthIndex: d.monthIndex,
      year: d.year,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });

  let running = 0;
  const cumulativeNet = monthlySeries.map((row) => {
    running += row.netFlow;
    return { name: row.name, total: running };
  });

  const expenseByCategory: NamedAmount[] = Array.from(categoryExpense.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const expenseBySubcategory: NamedAmount[] = Array.from(subExpense.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const incomeBySubcategory: NamedAmount[] = Array.from(incomeSub.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const pieExpenseSlices = topNWithOther(expenseByCategory, PIE_TOP_N);

  const n = monthlySeries.length;
  const avgMonthlyIncome =
    n > 0 ? monthlySeries.reduce((s, r) => s + r.income, 0) / n : 0;
  const avgMonthlyExpenses =
    n > 0 ? monthlySeries.reduce((s, r) => s + r.expenses, 0) / n : 0;
  const avgSavingsTransfers =
    n > 0 ? monthlySeries.reduce((s, r) => s + r.savingsTransfers, 0) / n : 0;

  const rates: number[] = [];
  for (const row of monthlySeries) {
    if (row.income > 0) {
      rates.push(((row.income - row.expenses) / row.income) * 100);
    }
  }
  const avgSavingsRate =
    rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

  const totalIncomeInPeriod = monthlySeries.reduce((s, r) => s + r.income, 0);
  const totalExpensesInPeriod = monthlySeries.reduce((s, r) => s + r.expenses, 0);
  const cumulativeNetEnd = cumulativeNet.length
    ? cumulativeNet[cumulativeNet.length - 1].total
    : 0;

  let momIncomePct: number | null = null;
  let momExpensePct: number | null = null;
  if (monthlySeries.length >= 2) {
    const prev = monthlySeries[monthlySeries.length - 2];
    const last = monthlySeries[monthlySeries.length - 1];
    if (prev.income > 0) {
      momIncomePct = ((last.income - prev.income) / prev.income) * 100;
    } else if (last.income > 0) {
      momIncomePct = 100;
    }
    if (prev.expenses > 0) {
      momExpensePct = ((last.expenses - prev.expenses) / prev.expenses) * 100;
    } else if (last.expenses > 0) {
      momExpensePct = 100;
    }
  }

  const kpis: AnalyticsKpis = {
    avgMonthlyIncome,
    avgMonthlyExpenses,
    avgSavingsTransfers,
    avgSavingsRate,
    totalExpensesInPeriod,
    totalIncomeInPeriod,
    cumulativeNetEnd,
    momIncomePct,
    momExpensePct,
  };

  const insights = buildInsights({
    expenseByCategory,
    monthlySeries,
    kpis,
    range,
  });

  return {
    range,
    filteredTransactions,
    monthlySeries,
    cumulativeNet,
    expenseByCategory,
    expenseBySubcategory: expenseBySubcategory.slice(0, SUB_TOP_K),
    incomeBySubcategory: incomeBySubcategory.slice(0, SUB_TOP_K),
    pieExpenseSlices,
    kpis,
    insights,
  };
}

function rangeLabel(range: AnalyticsTimeRange): string {
  switch (range) {
    case "all":
      return "כל התקופה";
    case "ytd":
      return "מתחילת השנה";
    case "12m":
      return "12 חודשים אחרונים";
    case "6m":
      return "6 חודשים אחרונים";
    case "3m":
      return "3 חודשים אחרונים";
    default:
      return range;
  }
}

function buildInsights(ctx: {
  expenseByCategory: NamedAmount[];
  monthlySeries: MonthlySeriesPoint[];
  kpis: AnalyticsKpis;
  range: AnalyticsTimeRange;
}): string[] {
  const out: string[] = [];
  const { expenseByCategory, monthlySeries, kpis, range } = ctx;

  out.push(`טווח נבחר: ${rangeLabel(range)}.`);

  if (expenseByCategory.length > 0) {
    const top = expenseByCategory[0];
    out.push(`קטגוריית ההוצאה הגבוהה ביותר: ${top.name} (${formatIls(top.value)}).`);
  }

  if (kpis.momIncomePct !== null) {
    const dir = kpis.momIncomePct >= 0 ? "עלתה" : "ירדה";
    out.push(
      `הכנסה בחודש האחרון ${dir} ב-${Math.abs(kpis.momIncomePct).toFixed(1)}% לעומת החודש הקודם.`
    );
  }
  if (kpis.momExpensePct !== null) {
    const dir = kpis.momExpensePct <= 0 ? "ירדה" : "עלתה";
    out.push(
      `הוצאות בחודש האחרון ${dir} ב-${Math.abs(kpis.momExpensePct).toFixed(1)}% לעומת החודש הקודם.`
    );
  }

  const negMonths = monthlySeries.filter((m) => m.netFlow < 0).length;
  if (negMonths > 0) {
    out.push(`ב-${negMonths} חודשים בתוך הטווח התזרים החודשי היה שלילי (הוצאות מעל הכנסות).`);
  }

  if (kpis.avgSavingsRate >= 20) {
    out.push(`שיעור חיסכון ממוצע לחודש (מתוך הכנסה): כ-${kpis.avgSavingsRate.toFixed(0)}% — מעל סף של 20% לעומת הכנסה.`);
  } else if (kpis.avgSavingsRate > 0 && monthlySeries.some((m) => m.income > 0)) {
    out.push(`שיעור חיסכון ממוצע לחודש: כ-${kpis.avgSavingsRate.toFixed(0)}% — נמוך מ-20%; שקלו להגדיל הפרשה או לצמצם הוצאות.`);
  }

  return out;
}

function formatIls(n: number): string {
  if (!Number.isFinite(n)) return "₪0";
  return `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export type AiContextSnapshot = {
  timeRange: AnalyticsTimeRange;
  timeRangeLabel: string;
  kpis: AnalyticsKpis;
  topExpenseCategories: NamedAmount[];
  topExpenseSubcategories: NamedAmount[];
  incomeBySubcategory: NamedAmount[];
  monthlySummary: {
    period: string;
    income: number;
    expenses: number;
    netFlow: number;
    savingsTransfers: number;
  }[];
  insights: string[];
};

const AI_SNAPSHOT_MAX_CHARS = 14_000;

export function toAiContextSnapshot(report: AnalyticsReport): AiContextSnapshot {
  const base: AiContextSnapshot = {
    timeRange: report.range,
    timeRangeLabel: rangeLabel(report.range),
    kpis: report.kpis,
    topExpenseCategories: report.expenseByCategory.slice(0, 8),
    topExpenseSubcategories: report.expenseBySubcategory.slice(0, 10),
    incomeBySubcategory: report.incomeBySubcategory.slice(0, 10),
    monthlySummary: report.monthlySeries.map((m) => ({
      period: m.name,
      income: m.income,
      expenses: m.expenses,
      netFlow: m.netFlow,
      savingsTransfers: m.savingsTransfers,
    })),
    insights: report.insights,
  };

  let s = JSON.stringify(base);
  if (s.length <= AI_SNAPSHOT_MAX_CHARS) return base;

  const trimmed = { ...base, monthlySummary: [...base.monthlySummary] };
  while (JSON.stringify(trimmed).length > AI_SNAPSHOT_MAX_CHARS && trimmed.monthlySummary.length > 2) {
    trimmed.monthlySummary = trimmed.monthlySummary.slice(
      Math.floor(trimmed.monthlySummary.length / 2)
    );
  }
  return trimmed;
}
