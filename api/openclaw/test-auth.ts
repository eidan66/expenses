import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isOpenClawAuthenticated } from "../lib/openclawAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ok = isOpenClawAuthenticated(req);
  return res.status(200).json({ ok, authed: ok });
}
