import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isOpenClawAuthenticated } from "../lib/openclawAuth.js";
import {
  deriveHebrewMonthYearFromDate,
  isoDateHalfOpenRangeForHebrewCalendarMonth,
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

function rowInPeriod(row: TxRow, hebrewMonth: string, year: string): boolean {
  const d = row.date?.trim();
  if (!d) return false;
  const derived = deriveHebrewMonthYearFromDate(d);
  return derived.month === hebrewMonth && derived.year === year;
}

/**
 * GET /api/openclaw/month-summary?month=אפריל&year=2026
 * Read-only. Buckets booked transactions by **assigned** `date` (same rule as NestEgg UI).
 */
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

    const month = typeof req.query.month === "string" ? req.query.month.trim() : "";
    const year = typeof req.query.year === "string" ? req.query.year.trim() : "";
    const includeTransactions =
      req.query.include_transactions === "1" || req.query.include_transactions === "true";
    if (!month || !year) {
      return res.status(400).json({
        error: "Query required: month (Hebrew name) and year, e.g. ?month=אפריל&year=2026",
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
      });
    }

    const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    /** DB-side filter on ISO calendar month `[gte, lt)` — works for date/timestamp/text; avoids full-table scan. */
    const dateRange = isoDateHalfOpenRangeForHebrewCalendarMonth(month, year);

    const all: TxRow[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from("transactions")
        .select("id, title, amount, category, subcategory, date, month, year, notes")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .range(from, to);

      if (dateRange) {
        query = query.gte("date", dateRange.gte).lt("date", dateRange.lt);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const chunk = (data ?? []) as TxRow[];
      all.push(...chunk);
      if (chunk.length < PAGE_SIZE) break;
    }

    const inPeriod = all.filter((r) => rowInPeriod(r, month, year));

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
      period: { month, year },
      basis: "assigned_date_field",
      query: dateRange
        ? { date_gte: dateRange.gte, date_lt: dateRange.lt }
        : { date_gte: null, date_lt: null },
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
