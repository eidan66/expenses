import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: "Missing payload id" });
    }

    const body = (req.body as Record<string, string>) ?? {};
    const action = body.action as string;

    if (action !== "approve" && action !== "decline") {
      return res.status(400).json({ error: "Missing or invalid action: use approve or decline" });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: pending, error: fetchError } = await supabase
      .from("pending_expenses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !pending) {
      return res.status(404).json({ error: "Pending expense not found" });
    }

    if (pending.status !== "pending") {
      return res.status(400).json({ error: `Payload already ${pending.status}` });
    }

    if (action === "decline") {
      const { error: updateError } = await supabase
        .from("pending_expenses")
        .update({ status: "declined" })
        .eq("id", id);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
      return res.status(200).json({ ok: true, status: "declined" });
    }

    // approve: insert into transactions, then update status
    // Negate amount for expense categories (app convention: expenses are negative)
    const isExpenseCategory =
      pending.category !== "הכנסה" && pending.category !== "חיסכון";
    const amountNum = parseFloat(String(pending.amount));
    const finalAmount =
      isExpenseCategory && amountNum > 0 ? (-amountNum).toString() : pending.amount;

    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: pending.user_id,
      title: pending.title,
      amount: finalAmount,
      category: pending.category,
      subcategory: pending.subcategory ?? null,
      date: pending.date,
      month: pending.month,
      year: pending.year,
      notes: pending.notes ?? null,
    });

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    const { error: updateError } = await supabase
      .from("pending_expenses")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ ok: true, status: "approved" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `FUNCTION_INVOCATION_FAILED: ${msg}` });
  }
}
