import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const DEFAULT_USER_ID = "c0d1a144-90cc-449f-a1ae-a1709cb534ca";

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

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
  const supabase = getSupabase();
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
    const body = req.body as Record<string, unknown>;
    const title = body?.title as string;
    const amount = body?.amount as string;
    const category = body?.category as string;
    const subcategory = body?.subcategory as string | undefined;
    const date = body?.date as string;
    const month = body?.month as string | undefined;
    const year = body?.year as string | undefined;
    const notes = body?.notes as string | undefined;
    const rawPayload = body?.raw_payload as Record<string, unknown> | undefined;

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
}
