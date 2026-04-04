import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

function bearerMatchesSecret(
  authorization: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const token = authorization.slice(7).trim();
  if (!token || token.length !== secret.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = req.headers["x-vercel-cron"] === "1";
  const isDev = process.env.NODE_ENV !== "production";
  const pingSecret = process.env.HEALTH_PING_SECRET;
  const isPingSecretOk = bearerMatchesSecret(
    req.headers.authorization,
    pingSecret
  );

  if (!isCron && !isDev && !isPingSecretOk) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Missing Supabase env vars" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const timestamp = new Date().toISOString();

  const { error } = await supabase.from("app_settings").upsert(
    { key: "health_timestamp", value: timestamp, updated_at: timestamp },
    { onConflict: "key" }
  );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, timestamp });
}
