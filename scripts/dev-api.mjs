#!/usr/bin/env node
/**
 * Local API server for development.
 * Run: node scripts/dev-api.mjs
 * Requires: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createServer } from "http";
import { parse as parseUrl } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  deriveHebrewMonthYearFromDate,
  isoDateHalfOpenRangeForHebrewCalendarMonth,
} from "../shared/hebrewMonthYear.ts";

// Load .env and .env.local from project root
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const clientRoot = join(root, "client");
for (const base of [root, clientRoot]) {
  for (const name of [".env", ".env.local", ".env.vercel"]) {
    const p = join(base, name);
    if (existsSync(p)) {
      try {
        const env = readFileSync(p, "utf8");
        for (const line of env.split("\n")) {
          const m = line.match(/^([^#=]+)=(.*)$/);
          if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      } catch (_) {}
    }
  }
}

const DEFAULT_USER_ID = "c0d1a144-90cc-449f-a1ae-a1709cb534ca";

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Get it from Supabase Dashboard > Settings > API.");
  return createClient(url, key);
}

function isOpenClawAuthenticated(headers) {
  const token = process.env.OPENCLAW_API_TOKEN;
  if (!token) return true;
  const auth = headers?.authorization;
  const authStr = Array.isArray(auth) ? auth[0] : auth;
  if (!authStr?.startsWith("Bearer ")) return true;
  return authStr.slice(7) === token;
}

async function handleOpenClawStatus(supabase, req, res) {
  const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
  const url = new URL(req.url || "", "http://localhost");
  const pendingLimit = Math.min(
    Math.max(parseInt(url.searchParams.get("pending_limit") || "20", 10) || 20, 1),
    50
  );
  const transactionLimit = Math.min(
    Math.max(parseInt(url.searchParams.get("transaction_limit") || "15", 10) || 15, 1),
    50
  );

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
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: firstError.message }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
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
      transactions: { recent: txRes.data ?? [] },
      goals: { items: goalsRes.data ?? [] },
      hints: {
        categories: "GET /api/categories — full category and subcategory list",
        submit_pending: "POST /api/openclaw/payloads — creates a new pending row (OCR / expenses agent)",
      },
    })
  );
}

async function handleCategories(supabase, res) {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, type")
    .order("name");
  if (catError) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: catError.message }));
  }
  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id, category_id, name")
    .order("name");
  const cats = (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    subcategories: (subcategories || []).filter((s) => s.category_id === c.id).map((s) => s.name),
  }));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ categories: cats }));
}

async function handlePayloads(supabase, method, body, res) {
  const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
  if (method === "GET") {
    const { data, error } = await supabase
      .from("pending_expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: error.message }));
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ payloads: data ?? [] }));
  }
  if (method === "POST") {
    const raw = body || {};
    const payload = raw.payload || raw;
    let { title, amount, category, subcategory, date, notes, raw_payload } = {
      ...raw,
      ...payload,
    };
    if (raw_payload != null && typeof raw_payload === "object") {
      try {
        raw_payload = JSON.parse(JSON.stringify(raw_payload));
      } catch {
        raw_payload = null;
      }
    } else {
      raw_payload = null;
    }
    if (!title || !amount || !category || !date) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing required fields: title, amount, category, date" }));
    }
    const { month: finalMonth, year: finalYear } = deriveHebrewMonthYearFromDate(String(date));
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
        raw_payload: raw_payload ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: error.message }));
    }
    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  }
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Method not allowed" }));
}

async function handlePayloadById(supabase, id, method, body, res) {
  if (method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }
  const action = (body || {}).action;
  if (action !== "approve" && action !== "decline") {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Missing or invalid action: use approve or decline" }));
  }
  const { data: pending, error: fetchError } = await supabase
    .from("pending_expenses")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !pending) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Pending expense not found" }));
  }
  if (pending.status !== "pending") {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: `Payload already ${pending.status}` }));
  }
  if (action === "decline") {
    await supabase.from("pending_expenses").update({ status: "declined" }).eq("id", id);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, status: "declined" }));
  }
  // Negate amount for expense categories (app convention: expenses are negative)
  const isExpenseCategory = pending.category !== "הכנסה" && pending.category !== "חיסכון";
  const amountNum = parseFloat(String(pending.amount));
  const finalAmount = isExpenseCategory && amountNum > 0 ? String(-amountNum) : pending.amount;
  const { month: ledgerMonth, year: ledgerYear } = deriveHebrewMonthYearFromDate(
    String(pending.date)
  );
  const { error: insertError } = await supabase.from("transactions").insert({
    user_id: pending.user_id,
    title: pending.title,
    amount: finalAmount,
    category: pending.category,
    subcategory: pending.subcategory ?? null,
    date: pending.date,
    month: ledgerMonth,
    year: ledgerYear,
    notes: pending.notes ?? null,
  });
  if (insertError) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: insertError.message }));
  }
  await supabase
    .from("pending_expenses")
    .update({ status: "approved", month: ledgerMonth, year: ledgerYear })
    .eq("id", id);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, status: "approved" }));
}

const LEDGER_PAGE = 1000;
const LEDGER_MAX_PAGES = 20;

async function handleOpenClawMonthSummary(supabase, req, res) {
  const userId = process.env.OPENCLAW_USER_ID ?? DEFAULT_USER_ID;
  const url = new URL(req.url || "", "http://localhost");
  const month = (url.searchParams.get("month") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  const includeTransactions =
    url.searchParams.get("include_transactions") === "1" ||
    url.searchParams.get("include_transactions") === "true";
  if (!month || !year) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        error: "Query required: month (Hebrew) and year, e.g. ?month=אפריל&year=2026",
      })
    );
  }

  function rowInPeriod(row) {
    const d = (row.date || "").trim();
    if (!d) return false;
    const derived = deriveHebrewMonthYearFromDate(d);
    return derived.month === month && derived.year === year;
  }

  function parseAmount(s) {
    const n = parseFloat(String(s));
    return Number.isFinite(n) ? n : 0;
  }

  const dateRange = isoDateHalfOpenRangeForHebrewCalendarMonth(month, year);
  const all = [];
  for (let page = 0; page < LEDGER_MAX_PAGES; page++) {
    const from = page * LEDGER_PAGE;
    const to = from + LEDGER_PAGE - 1;
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
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: error.message }));
    }
    const chunk = data || [];
    all.push(...chunk);
    if (chunk.length < LEDGER_PAGE) break;
  }

  const inPeriod = all.filter(rowInPeriod);
  let income = 0;
  let expenses = 0;
  let savingsTransfers = 0;
  const expensesByCategory = {};
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

  const body = {
    ok: true,
    generated_at: new Date().toISOString(),
    scope: { user_id: userId },
    period: { month, year },
    basis: "assigned_date_field",
    query: dateRange
      ? { date_gte: dateRange.gte, date_lt: dateRange.lt }
      : { date_gte: null, date_lt: null },
    counts: { transactions_in_period: inPeriod.length, ledger_rows_loaded: all.length },
    totals: {
      income,
      expenses,
      savings_transfers: savingsTransfers,
      net_after_expenses_and_savings: income - expenses - savingsTransfers,
    },
    expenses_by_category: expensesByCategory,
  };
  if (includeTransactions) body.transactions = inPeriod;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  const { pathname } = parseUrl(req.url || "/", true);
  let body = null;
  if (req.method === "POST" && req.headers["content-type"]?.includes("application/json")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (_) {}
  }
  let supabase;
  try {
    supabase = getSupabase();
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: e.message }));
  }
  if (pathname === "/api/analytics-chat" && req.method === "POST") {
    try {
      const { streamAnalyticsChat } = await import("../api/analyticsChatStream.ts");
      await streamAnalyticsChat(body, res);
      return;
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: e instanceof Error ? e.message : "Analytics chat failed",
        })
      );
    }
  }
  if (pathname === "/api/categories") {
    if (!isOpenClawAuthenticated(req.headers)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized: provide Authorization: Bearer <token>" }));
    }
    return handleCategories(supabase, res);
  }
  if (pathname === "/api/openclaw/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, ts: new Date().toISOString() }));
  }
  if (pathname === "/api/openclaw/status" && req.method === "GET") {
    if (!isOpenClawAuthenticated(req.headers)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized: provide Authorization: Bearer <token>" }));
    }
    return handleOpenClawStatus(supabase, req, res);
  }
  if (pathname === "/api/openclaw/month-summary" && req.method === "GET") {
    if (!isOpenClawAuthenticated(req.headers)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized: provide Authorization: Bearer <token>" }));
    }
    return handleOpenClawMonthSummary(supabase, req, res);
  }
  if (pathname === "/api/openclaw/payloads") {
    if (!isOpenClawAuthenticated(req.headers)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized: provide Authorization: Bearer <token>" }));
    }
    return handlePayloads(supabase, req.method, body, res);
  }
  const m = pathname?.match(/^\/api\/openclaw\/payloads\/([^/]+)$/);
  if (m) {
    return handlePayloadById(supabase, m[1], req.method, body, res);
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const port = 3000;
server.listen(port, () => {
  console.log(`Dev API server: http://localhost:${port}`);
  console.log("  POST /api/analytics-chat");
  console.log("  GET  /api/categories");
  console.log("  GET  /api/openclaw/status");
  console.log("  GET  /api/openclaw/month-summary?month=…&year=…");
  console.log("  GET  /api/openclaw/payloads");
  console.log("  POST /api/openclaw/payloads");
  console.log("  POST /api/openclaw/payloads/:id (body: { action: 'approve'|'decline' })");
});
