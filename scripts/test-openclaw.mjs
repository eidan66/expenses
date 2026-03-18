#!/usr/bin/env node
/**
 * Simulates OpenClaw requests to verify the NestEgg API.
 * Run: node scripts/test-openclaw.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 * Example: node scripts/test-openclaw.mjs https://expenses-virid-two.vercel.app
 */
const BASE_URL = process.argv[2] || "http://localhost:3000";
const API_TOKEN = process.env.OPENCLAW_API_TOKEN || "0fc03309117127cad220ea91c0f8ea8c1b51c625846068df4b52c34db88bee9d";

const OPENCLAW_PAYLOAD = {
  title: "אייץ' אנד אר פתרח אופנה 2003 בע\"מ",
  amount: "299.60",
  category: "דיור",
  subcategory: "אחר",
  date: "2026-03-18",
  notes: "Card+micro-device items, raw OCR attached.",
  raw_payload: {
    vendor: "אייץ' אנד אר פתרח אופנה 2003 בע\"מ",
    total: 299.6,
    items: [
      { description: "card charge", amount: 20.0 },
      { description: "micro device", amount: 139.9 },
    ],
    invoice_number: "P7103304278",
  },
};

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, ok: res.ok };
}

async function runTest(name, fn) {
  try {
    const result = await fn();
    const pass = result.ok !== false && (result.status < 400 || (result.status >= 400 && result.body?.error));
    console.log(pass ? "✓" : "✗", name);
    if (!pass || result.status >= 400) {
      console.log("  Status:", result.status);
      console.log("  Body:", JSON.stringify(result.body, null, 2).slice(0, 500));
    }
    return pass;
  } catch (e) {
    console.log("✗", name);
    console.log("  Error:", e.message);
    return false;
  }
}

async function main() {
  console.log("\n=== OpenClaw API Simulation ===\n");
  console.log("Base URL:", BASE_URL);
  console.log("Auth: Bearer", API_TOKEN ? `${API_TOKEN.slice(0, 8)}...` : "(none)");
  console.log("");

  let passed = 0;
  let failed = 0;

  // 1. Ping (if available)
  const pingOk = await runTest("GET /api/openclaw/ping", async () => {
    return fetchJson(`${BASE_URL}/api/openclaw/ping`);
  });
  if (pingOk) passed++; else failed++;

  // 2. GET categories
  const catOk = await runTest("GET /api/categories (with Bearer)", async () => {
    return fetchJson(`${BASE_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
  });
  if (catOk) passed++; else failed++;

  // 3. POST payloads - flat body (direct fields)
  const postFlatOk = await runTest("POST /api/openclaw/payloads (flat body)", async () => {
    return fetchJson(`${BASE_URL}/api/openclaw/payloads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: JSON.stringify(OPENCLAW_PAYLOAD),
    });
  });
  if (postFlatOk) passed++; else failed++;

  // 4. POST payloads - nested body.payload (OpenClaw format)
  const postNestedOk = await runTest("POST /api/openclaw/payloads (nested payload)", async () => {
    return fetchJson(`${BASE_URL}/api/openclaw/payloads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: JSON.stringify({ payload: OPENCLAW_PAYLOAD }),
    });
  });
  if (postNestedOk) passed++; else failed++;

  // 5. GET payloads
  const getPayloadsOk = await runTest("GET /api/openclaw/payloads", async () => {
    return fetchJson(`${BASE_URL}/api/openclaw/payloads`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
  });
  if (getPayloadsOk) passed++; else failed++;

  console.log("\n--- Summary ---");
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
