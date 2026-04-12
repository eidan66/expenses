import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isOpenClawAuthenticated } from "../lib/openclawAuth.js";
import {
  deriveHebrewMonthYearFromDate,
  HEBREW_MONTH_NAMES,
  resolveHebrewCalendarMonthSummaryQuery,
} from "../../shared/hebrewMonthYear";

const DEFAULT_USER_ID = "c0d1a144-90cc-449f-a1ae-a1709cb534ca";

const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

type TxRow = {
  id: string;
  title: string;
  amount: string;
  category: string;
  subcategory: string | null;
  date: string;
  month: string;
  year: string;
  notes: string | null;
};

function parseAmount(s: string): number {
  const n = parseFloat(String(s));
  return Number.isFinite(n) ? n : 0;
}

function firstQueryString(
  q: string | string[] | undefined
): string {
  if (q == null) return "";
  const s = Array.isArray(q) ? q[0] : q;
  return typeof s === "string" ? s : "";
}

function rowInPeriod(row: TxRow, canonicalHebrewMonth: string, year: string): boolean {
  const d = row.date?.trim();
  if (!d) return false;
  const derived = deriveHebrewMonthYearFromDate(d);
  return derived.month === canonicalHebrewMonth && derived.year === year;
}

/**
 * GET /api/openclaw/month-summary?month=אפריל&year=2026
 * Read-only. Buckets booked transactions by **assigned** `date` (same rule as NestEgg UI).
 */
export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isOpenClawAuthenticated(req)) {
      return res.status(401).json({
        error: "Unauthorized: provide Authorization: Bearer <token>",
      });
    }

    const monthRaw = firstQueryString(req.query.month).trim();
    const yearRaw = firstQueryString(req.query.year).trim();
    const includeTransactions =
      req.query.include_transactions === "1" || req.query.include_transactions === "true";
    if (!monthRaw || !yearRaw) {
      return res.status(400).json({
        error: "Query required: month (Hebrew name) and year, e.g. ?month=אפריל&year=2026",
      });
    }

    const resolved = resolveHebrewCalendarMonthSummaryQuery(monthRaw, yearRaw);
    if (!resolved) {
      return res.status(400).json({
        error: "unknown_hebrew_month_or_year",
        month_received: monthRaw,
        year_received: yearRaw,
        allowed_months: [...HEBREW_MONTH_NAMES],
      });
    }

    const { canonicalMonth, year, range: dateRange } = resolved;

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
      });
    }

    const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const all: TxRow[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const query = supabase
        .from("transactions")
        .select("id, title, amount, category, subcategory, date, month, year, notes")
        .eq("user_id", userId)
        .gte("date", dateRange.gte)
        .lt("date", dateRange.lt)
        .order("date", { ascending: false })
        .range(from, to);

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const chunk = (data ?? []) as TxRow[];
      all.push(...chunk);
      if (chunk.length < PAGE_SIZE) break;
    }

    const inPeriod = all.filter((r) => rowInPeriod(r, canonicalMonth, year));

    let income = 0;
    let expenses = 0;
    let savingsTransfers = 0;
    const expensesByCategory: Record<string, number> = {};

    for (const t of inPeriod) {
      const amount = parseAmount(t.amount);
      if (t.category === "הכנסה") {
        if (amount > 0) income += amount;
      } else if (t.category === "חיסכון") {
        savingsTransfers += Math.abs(amount);
      } else if (amount < 0) {
        const absAmt = Math.abs(amount);
        expenses += absAmt;
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + absAmt;
      }
    }

    return res.status(200).json({
      ok: true,
      generated_at: new Date().toISOString(),
      scope: { user_id: userId },
      period: { month: canonicalMonth, year, month_requested: monthRaw },
      basis: "assigned_date_field",
      query: { date_gte: dateRange.gte, date_lt: dateRange.lt },
      counts: {
        transactions_in_period: inPeriod.length,
        ledger_rows_loaded: all.length,
      },
      totals: {
        income,
        expenses,
        savings_transfers: savingsTransfers,
        net_after_expenses_and_savings: income - expenses - savingsTransfers,
      },
      expenses_by_category: expensesByCategory,
      ...(includeTransactions ? { transactions: inPeriod } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `FUNCTION_INVOCATION_FAILED: ${msg}` });
  }
}
