import type { ServerResponse } from "node:http";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createMoonshotAI } from "@ai-sdk/moonshotai";
import { createOpenAI } from "@ai-sdk/openai";

const MAX_SNAPSHOT_CHARS = 20_000;

/** Trim, strip UTF-8 BOM, and remove a single pair of surrounding quotes from .env values. */
function normalizeEnvApiKey(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  let s = raw.trim();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

/** Base URL for OpenAI-compatible analytics providers (NVIDIA NIM, OpenRouter, etc.). */
export function getOpenAiCompatBaseUrl(): string | undefined {
  const candidates = [
    process.env.OPENAI_COMPATIBLE_BASE_URL,
    process.env.NVIDIA_OPENAI_BASE_URL,
    process.env.INTEGRATE_API_BASE_URL,
  ];
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return undefined;
}

/** API key for OpenAI-compatible analytics providers. */
export function getOpenAiCompatApiKey(): string | undefined {
  return normalizeEnvApiKey(
    process.env.OPENAI_COMPATIBLE_API_KEY ??
      process.env.NVIDIA_API_KEY ??
      process.env.NGC_API_KEY
  );
}

function readInitBodyAsUtf8(body: BodyInit | null | undefined): string | null {
  if (body == null) return null;
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) {
    return body.toString("utf8");
  }
  return null;
}

/**
 * Merges top-level JSON fields into POST /chat/completions bodies (e.g. NVIDIA Kimi
 * `chat_template_kwargs`) — the AI SDK does not send arbitrary keys by default.
 */
function mergeChatCompletionBodyFetch(
  extra: Record<string, unknown>
): typeof globalThis.fetch {
  const base = globalThis.fetch.bind(globalThis);
  return async (input, init) => {
    const method = (init?.method ?? "GET").toUpperCase();
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : "";
    const raw = readInitBodyAsUtf8(init?.body ?? null);
    if (
      method !== "POST" ||
      !url.includes("chat/completions") ||
      raw == null
    ) {
      return base(input as RequestInfo, init);
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const body = JSON.stringify({ ...parsed, ...extra });
      return base(input as RequestInfo, { ...init, body });
    } catch {
      return base(input as RequestInfo, init);
    }
  };
}

/**
 * When ANALYTICS_AI_PROVIDER is unset, prefer OpenAI-compatible (e.g. NVIDIA NIM) if fully
 * configured, so a leftover invalid MOONSHOT_API_KEY does not block a working nvapi setup.
 */
export function resolveAnalyticsAiProvider(): "moonshot" | "openai-compatible" {
  const explicit = process.env.ANALYTICS_AI_PROVIDER?.trim();
  if (explicit === "openai-compatible") return "openai-compatible";
  if (explicit === "moonshot") return "moonshot";
  const compatReady =
    Boolean(getOpenAiCompatBaseUrl()) && Boolean(getOpenAiCompatApiKey());
  return compatReady ? "openai-compatible" : "moonshot";
}

function parseOpenAiCompatibleExtraBody(): Record<string, unknown> | undefined {
  const raw = process.env.OPENAI_COMPATIBLE_EXTRA_BODY_JSON?.trim();
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error(
      "OPENAI_COMPATIBLE_EXTRA_BODY_JSON must be valid JSON (e.g. {\"chat_template_kwargs\":{\"thinking\":true}} for NVIDIA Kimi)."
    );
  }
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("OPENAI_COMPATIBLE_EXTRA_BODY_JSON must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

const SYSTEM_PROMPT = `אתה יועץ פיננסי אישי למשק בית ישראלי באפליקציית ניהול הוצאות והכנסות (NestEgg).
כל התשובות בעברית, בטון מכבד וקצר ככל האפשר אלא אם המשתמש מבקש פירוט.
הסתמך **רק** על אובייקט ה-JSON "metricsSnapshot" ועל טווח הזמן שנשלחו בבקשה. אין לך גישה לעסקאות גולמיות שלא הועברו ב-snapshot.
אם חסרים נתונים או שה-snapshot ריק — אמור זאת במפורש.
אל תיתן ייעוץ השקעות ספציפי (מניות, אג"ח, קריפטו). אפשר להציע עקרונות כלליים לתקציב וחיסכון.
כאשר מצטטים סכומים, השתמש בשקלים (₪) ובפורמט קריא.`;

function getLanguageModel() {
  const provider = resolveAnalyticsAiProvider();
  const modelId =
    process.env.ANALYTICS_AI_MODEL ??
    (provider === "moonshot" ? "kimi-k2.5" : "gpt-4o-mini");

  if (provider === "openai-compatible") {
    const baseURL = getOpenAiCompatBaseUrl();
    const apiKey = getOpenAiCompatApiKey() ?? "";
    if (!baseURL?.trim()) {
      throw new Error(
        "Set OPENAI_COMPATIBLE_BASE_URL or NVIDIA_OPENAI_BASE_URL or INTEGRATE_API_BASE_URL for provider openai-compatible"
      );
    }
    if (!apiKey) {
      throw new Error(
        "Set OPENAI_COMPATIBLE_API_KEY or NVIDIA_API_KEY or NGC_API_KEY (e.g. NVIDIA nvapi-… key)."
      );
    }
    const extraBody = parseOpenAiCompatibleExtraBody();
    const fetchImpl = extraBody
      ? mergeChatCompletionBodyFetch(extraBody)
      : undefined;
    const client = createOpenAI({
      baseURL: baseURL.trim(),
      apiKey,
      ...(fetchImpl ? { fetch: fetchImpl } : {}),
    });
    return client.chat(modelId);
  }

  const moonshotKey = normalizeEnvApiKey(process.env.MOONSHOT_API_KEY);
  if (!moonshotKey) {
    throw new Error(
      "MOONSHOT_API_KEY is missing. Add it to the repository root .env / .env.local or to client/.env.local, then restart the dev server."
    );
  }
  // International default: https://api.moonshot.ai/v1. Keys from platform.moonshot.cn need
  // MOONSHOT_BASE_URL=https://api.moonshot.cn/v1 (see Kimi FAQ: mixed platform → 401).
  const moonshotBase = normalizeEnvApiKey(process.env.MOONSHOT_BASE_URL);
  const moonshot = createMoonshotAI({
    apiKey: moonshotKey,
    ...(moonshotBase ? { baseURL: moonshotBase } : {}),
  });
  return moonshot(modelId);
}

export async function streamAnalyticsChat(
  body: unknown,
  res: ServerResponse
): Promise<void> {
  if (!body || typeof body !== "object") {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  const { messages, metricsSnapshot, timeRange } = body as {
    messages?: UIMessage[];
    metricsSnapshot?: unknown;
    timeRange?: string;
  };

  if (!Array.isArray(messages)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "messages must be an array" }));
    return;
  }

  const snapStr = JSON.stringify(metricsSnapshot ?? {});
  if (snapStr.length > MAX_SNAPSHOT_CHARS) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "metricsSnapshot too large" }));
    return;
  }

  let model;
  try {
    model = getLanguageModel();
  } catch (e) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error:
          e instanceof Error
            ? e.message
            : "AI provider not configured (set MOONSHOT_API_KEY or openai-compatible env vars)",
      })
    );
    return;
  }

  const provider = resolveAnalyticsAiProvider();
  const system = `${SYSTEM_PROMPT}

טווח זמן שנבחר בממשק: ${typeof timeRange === "string" ? timeRange : "לא צוין"}

metricsSnapshot (JSON):
${snapStr}`;

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(messages),
    ...(provider === "moonshot"
      ? {
          providerOptions: {
            moonshotai: { thinking: { type: "disabled" as const } },
          },
        }
      : {}),
  });

  result.pipeUIMessageStreamToResponse(res);
}
