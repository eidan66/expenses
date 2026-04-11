import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isOpenClawAuthenticated } from "../lib/openclawAuth";

const DEFAULT_USER_ID = "c0d1a144-90cc-449f-a1ae-a1709cb534ca";

function clampLimit(raw: string | string[] | undefined, fallback: number, max: number): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(String(s ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
}

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

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
      });
    }

    const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
    const pendingLimit = clampLimit(req.query.pending_limit, 20, 50);
    const transactionLimit = clampLimit(req.query.transaction_limit, 15, 50);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const [pendingCountRes, approvedCountRes, declinedCountRes, pendingRecentRes, txRes, goalsRes] =
      await Promise.all([
        supabase
          .from("pending_expenses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "pending"),
        supabase
          .from("pending_expenses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "approved"),
        supabase
          .from("pending_expenses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "declined"),
        supabase
          .from("pending_expenses")
          .select(
            "id, title, amount, category, subcategory, date, month, year, notes, status, created_at"
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(pendingLimit),
        supabase
          .from("transactions")
          .select("id, title, amount, category, subcategory, date, month, year, notes")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(transactionLimit),
        supabase
          .from("goals")
          .select("id, name, target_amount, current_amount")
          .eq("user_id", userId)
          .order("name"),
      ]);

    const firstError =
      pendingCountRes.error ||
      approvedCountRes.error ||
      declinedCountRes.error ||
      pendingRecentRes.error ||
      txRes.error ||
      goalsRes.error;

    if (firstError) {
      return res.status(500).json({ error: firstError.message });
    }

    return res.status(200).json({
      ok: true,
      generated_at: new Date().toISOString(),
      scope: { user_id: userId },
      readonly: true,
      pending_expenses: {
        counts: {
          pending: pendingCountRes.count ?? 0,
          approved: approvedCountRes.count ?? 0,
          declined: declinedCountRes.count ?? 0,
        },
        recent: pendingRecentRes.data ?? [],
      },
      transactions: {
        recent: txRes.data ?? [],
      },
      goals: {
        items: goalsRes.data ?? [],
      },
      hints: {
        categories: "GET /api/categories — full category and subcategory list",
        submit_pending: "POST /api/openclaw/payloads — creates a new pending row (OCR / expenses agent)",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `FUNCTION_INVOCATION_FAILED: ${msg}` });
  }
}
