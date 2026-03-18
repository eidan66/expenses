type ReqWithHeaders = {
  headers?: Record<string, string | string[] | undefined>;
};

/**
 * Validates OpenClaw Bearer token authentication.
 * - No OPENCLAW_API_TOKEN configured → allow (backward compat)
 * - Token configured, no Authorization header → allow (browser)
 * - Token configured, header present → must match
 */
export function isOpenClawAuthenticated(req: ReqWithHeaders): boolean {
  const token = process.env.OPENCLAW_API_TOKEN;
  if (!token) return true;

  const auth = req.headers?.["authorization"];
  const authStr = Array.isArray(auth) ? auth[0] : auth;
  if (!authStr?.startsWith("Bearer ")) return true;

  return authStr.slice(7) === token;
}
