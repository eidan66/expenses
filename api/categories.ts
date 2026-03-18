import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isOpenClawAuthenticated } from "./lib/openclawAuth";

// Optional descriptions/keywords per category for OpenClaw matching
const CATEGORY_HINTS: Record<string, string> = {
  דיור: "housing, rent, mortgage, utilities, electricity, water, gas, property tax, arnona",
  בריאות: "health, medical, doctor, dentist, pharmacy",
  ביטוחים: "insurance, health insurance, life insurance",
  צריכה: "consumption, food, groceries, toiletries, hygiene",
  "ביגוד והנעלה": "clothing, shoes, fashion",
  "חשבונות קבועים": "fixed bills, TV, Netflix, Disney+, security cameras",
  תקשורת: "communication, phone, mobile",
  "תחבורה (רכב)": "car, vehicle, fuel, parking, maintenance, insurance, test",
  "תחבורה (אופנוע)": "motorcycle, scooter, fuel, parking, maintenance",
  "תחבורה ציבורית": "public transport, bus, train, taxi",
  חיות: "pets, animals, dog, fish",
  "קניות אונליין": "online shopping, Temu, Shein, AliExpress",
  "שירותים דיגיטליים": "digital services, ChatGPT, Cursor, apps, Google Drive",
  "בילויים ופנאי": "entertainment, leisure, fun",
  שונות: "miscellaneous, cash, other",
  חיסכון: "savings, emergency fund, long-term goal",
  "גמל להשקעה": "investment provident fund, gemel, pension savings",
  הכנסה: "income, salary, earnings",
  קניות: "shopping, supermarket, market",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isOpenClawAuthenticated(req)) {
    return res.status(401).json({
      error: "Unauthorized: provide Authorization: Bearer <token>",
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Missing Supabase env vars" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, type")
    .order("name");

  if (catError) {
    return res.status(500).json({ error: catError.message });
  }

  const { data: subcategories, error: subError } = await supabase
    .from("subcategories")
    .select("id, category_id, name")
    .order("name");

  if (subError) {
    return res.status(500).json({ error: subError.message });
  }

  const categoriesWithSubs = (categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    subcategories:
      (subcategories ?? [])
        .filter((s) => s.category_id === cat.id)
        .map((s) => s.name) ?? [],
    description: CATEGORY_HINTS[cat.name] ?? undefined,
  }));

  return res.status(200).json({ categories: categoriesWithSubs });
}
