import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Minimal health check for OpenClaw — no auth, no Supabase.
 * GET /api/openclaw/ping → 200 if the API is reachable.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
