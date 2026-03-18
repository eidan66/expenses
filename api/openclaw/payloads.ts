import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isOpenClawAuthenticated } from "../../lib/openclawAuth";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const DEFAULT_USER_ID = "c0d1a144-90cc-449f-a1ae-a1709cb534ca";

function deriveMonthYear(dateStr: string): { month: string; year: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      month: HEBREW_MONTHS[now.getMonth()],
      year: now.getFullYear().toString(),
    };
  }
  return {
    month: HEBREW_MONTHS[d.getMonth()],
    year: d.getFullYear().toString(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!isOpenClawAuthenticated(req)) {
      return res.status(401).json({
        error: "Unauthorized: provide Authorization: Bearer <token>",
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Add them in Vercel Project Settings.",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("pending_expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ payloads: data ?? [] });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body) as Record<string, unknown>;
        } catch {
          body = {};
        }
      }
      body = (body ?? {}) as Record<string, unknown>;
      // Support both flat body and nested body.payload (OpenClaw may send either)
      const payload = (body?.payload as Record<string, unknown>) ?? body;
      const title = (payload?.title ?? body?.title) as string;
      const amount = (payload?.amount ?? body?.amount) as string;
      const category = (payload?.category ?? body?.category) as string;
      const subcategory = (payload?.subcategory ?? body?.subcategory) as string | undefined;
      const date = (payload?.date ?? body?.date) as string;
      const month = (payload?.month ?? body?.month) as string | undefined;
      const year = (payload?.year ?? body?.year) as string | undefined;
      const notes = (payload?.notes ?? body?.notes) as string | undefined;
      let rawPayload = (payload?.raw_payload ?? body?.raw_payload) as Record<string, unknown> | undefined;
      // Sanitize: ensure JSON-serializable (avoids circular refs, BigInt, etc.)
      if (rawPayload != null && typeof rawPayload === "object") {
        try {
          rawPayload = JSON.parse(JSON.stringify(rawPayload)) as Record<string, unknown>;
        } catch {
          rawPayload = null;
        }
      } else {
        rawPayload = null;
      }

      if (!title || !amount || !category || !date) {
        return res.status(400).json({
          error: "Missing required fields: title, amount, category, date",
        });
      }

      let finalMonth = month;
      let finalYear = year;
      if (!finalMonth || !finalYear) {
        const derived = deriveMonthYear(date);
        finalMonth = finalMonth ?? derived.month;
        finalYear = finalYear ?? derived.year;
      }

      const { data, error } = await supabase
        .from("pending_expenses")
        .insert({
          user_id: userId,
          title,
          amount: String(amount),
          category,
          subcategory: subcategory ?? null,
          date,
          month: finalMonth,
          year: finalYear,
          notes: notes ?? null,
          raw_payload: rawPayload ?? null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `FUNCTION_INVOCATION_FAILED: ${msg}` });
  }
}
