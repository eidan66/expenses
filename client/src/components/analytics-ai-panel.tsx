import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Volume2, Loader2, Sparkles } from "lucide-react";
import type {
  AiContextSnapshot,
  AnalyticsTimeRange,
} from "@/lib/analyticsMetrics";
import { cn } from "@/lib/utils";

function textFromMessage(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

type SpeechRecCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: unknown) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const RANGE_LABELS: Record<AnalyticsTimeRange, string> = {
  all: "כל התקופה",
  ytd: "שנה נוכחית (מתחילת השנה)",
  "12m": "12 חודשים אחרונים",
  "6m": "6 חודשים אחרונים",
  "3m": "3 חודשים אחרונים",
};

type Props = {
  snapshot: AiContextSnapshot;
  timeRange: AnalyticsTimeRange;
};

export function AnalyticsAiPanel({ snapshot, timeRange }: Props) {
  const [input, setInput] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const snapshotRef = useRef(snapshot);
  const timeRangeRef = useRef(timeRange);
  snapshotRef.current = snapshot;
  timeRangeRef.current = timeRange;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/analytics-chat",
        prepareSendMessagesRequest: ({ messages, body: baseBody }) => ({
          body: {
            ...baseBody,
            messages,
            metricsSnapshot: snapshotRef.current,
            timeRange: RANGE_LABELS[timeRangeRef.current],
          },
        }),
      }),
    []
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
  });

  const busy = status === "streaming" || status === "submitted";

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const t = input.trim();
      if (!t || busy) return;
      setInput("");
      await sendMessage({ text: t });
    },
    [input, busy, sendMessage]
  );

  const startListen = useCallback(() => {
    setVoiceError(null);
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setVoiceError("הדפדפן לא תומך בזיהוי דיבור. נסו Chrome או Edge.");
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = "he-IL";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (ev: unknown) => {
        const e = ev as {
          results: { 0: { transcript: string } }[];
        };
        const text = e.results?.[0]?.[0]?.transcript?.trim() ?? "";
        if (text) setInput((prev) => (prev ? `${prev} ${text}` : text));
      };
      rec.onerror = () => {
        setVoiceError("שגיאה בזיהוי דיבור. נסו שוב.");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setVoiceError("לא ניתן להפעיל את המיקרופון.");
    }
  }, []);

  const stopListen = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const speakLastAssistant = useCallback(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last || typeof window === "undefined" || !window.speechSynthesis) {
      setVoiceError("אין הודעת עוזר או שהדפדפן לא תומך בהקראה.");
      return;
    }
    const text = textFromMessage(last);
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    window.speechSynthesis.speak(u);
  }, [messages]);

  const errMsg = error?.message ?? "";
  const authLike =
    /invalid authentication|unauthorized|401|403/i.test(errMsg) ||
    errMsg.includes("API key");
  const showConfigHint =
    errMsg.includes("MOONSHOT") ||
    errMsg.includes("API") ||
    authLike;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="font-heading text-lg flex items-center justify-end gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          אנליטיקה חכמה
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          שאלו שאלות על ההכנסות, ההוצאות והמגמות — התשובות מבוססות על הנתונים המסוכמים בטווח
          הזמן שבחרתם בלשונית &quot;אנליטיקה&quot;.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(error || showConfigHint) && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-right text-sm text-destructive"
            role="alert"
          >
            {authLike && !errMsg.includes("MOONSHOT_API_KEY is missing")
              ? "המפתח ל-Moonshot נדחה (401). ודאו שהמפתח מ־אותה פלטפורמה כמו כתובת ה-API: מפתח מ־platform.moonshot.ai → ברירת המחדל api.moonshot.ai; מפתח מ־platform.moonshot.cn → MOONSHOT_BASE_URL=https://api.moonshot.cn/v1. חלופה: הוסיפו ב-.env.local את משתני NVIDIA/OpenAI-compat (למשל OPENAI_COMPATIBLE_BASE_URL + OPENAI_COMPATIBLE_API_KEY, או INTEGRATE_API_BASE_URL + NVIDIA_API_KEY) ואת ANALYTICS_AI_MODEL — ראו README. הפעילו מחדש את שרת הפיתוח."
              : error?.message ??
                "בדקו ש-MOONSHOT_API_KEY מוגדר בשרת (או הגדרו ספק openai-compatible)."}
          </div>
        )}
        {voiceError && (
          <p className="text-right text-sm text-amber-700 dark:text-amber-500">{voiceError}</p>
        )}

        <div
          className="max-h-[min(420px,50vh)] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3 text-right"
          dir="rtl"
        >
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              לדוגמה: &quot;מה קטגוריית ההוצאה הכי גדולה?&quot; או &quot;איך לשפר את שיעור החיסכון?&quot;
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "mr-0 ml-8 bg-primary/15"
                  : "mr-8 ml-0 bg-background border"
              )}
            >
              {textFromMessage(m) || (busy && m.role === "assistant" ? "…" : "")}
            </div>
          ))}
          {busy && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea
            dir="rtl"
            className="min-h-[80px] flex-1 text-right"
            placeholder="כתבו שאלה…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <div className="flex flex-wrap gap-2 justify-end sm:flex-col sm:justify-start">
            <Button type="submit" disabled={busy || !input.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "שלח"}
            </Button>
            {busy && (
              <Button type="button" variant="outline" onClick={() => void stop()}>
                <Square className="ml-1 h-4 w-4" />
                עצור
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={listening ? stopListen : startListen}
              disabled={busy}
            >
              {listening ? (
                <>
                  <Square className="ml-1 h-4 w-4" />
                  עצור הקלטה
                </>
              ) : (
                <>
                  <Mic className="ml-1 h-4 w-4" />
                  מיקרופון
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={speakLastAssistant} disabled={busy}>
              <Volume2 className="ml-1 h-4 w-4" />
              הקרא תשובה
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
