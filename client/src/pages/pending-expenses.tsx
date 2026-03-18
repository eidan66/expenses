import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ChevronDown, ChevronUp, FileText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { formatNumberWithCommas } from "@/lib/utils";

export interface PendingExpense {
  id: string;
  user_id: string;
  title: string;
  amount: string;
  category: string;
  subcategory: string | null;
  date: string;
  month: string;
  year: string;
  notes: string | null;
  raw_payload: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

async function fetchPendingPayloads(): Promise<PendingExpense[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("/api/openclaw/payloads", { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.payloads ?? [];
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("השרת לא מגיב. ודא ש-yarn dev:api רץ ו-SUPABASE_SERVICE_ROLE_KEY מוגדר ב-.env");
    }
    throw e;
  }
}

export default function PendingExpenses() {
  const { toast } = useToast();
  const [openRaw, setOpenRaw] = useState<Record<string, boolean>>({});

  const { data: payloads = [], isLoading, refetch } = useQuery({
    queryKey: ["pending-expenses"],
    queryFn: fetchPendingPayloads,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/openclaw/payloads/${id}`, {
        action: "approve",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      refetch();
      toast({ title: "אושר", description: "ההוצאה נוספה בהצלחה" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: err.message,
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/openclaw/payloads/${id}`, {
        action: "decline",
      });
    },
    onSuccess: () => {
      refetch();
      toast({ title: "נדחה", description: "ההוצאה נדחתה" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: err.message,
      });
    },
  });

  const pending = payloads.filter((p) => p.status === "pending");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">הוצאות ממתינות (OpenClaw)</h1>
          <p className="text-muted-foreground mt-1">
            אשרו או דחו הוצאות שסרק OpenClaw מחשבונות ומקבלות
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">טוען...</p>
        ) : pending.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">אין הוצאות ממתינות</p>
                <p className="text-sm text-muted-foreground mt-1">
                  הוצאות חדשות מ-OpenClaw יופיעו כאן לאישור
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{formatNumberWithCommas(p.amount)} ₪</span>
                        <span>•</span>
                        <span>{p.category}</span>
                        {p.subcategory && (
                          <>
                            <span>•</span>
                            <span>{p.subcategory}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{p.date}</span>
                        <span>({p.month} {p.year})</span>
                      </div>
                      {p.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{p.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(p.id)}
                        disabled={approveMutation.isPending || declineMutation.isPending}
                      >
                        <Check className="w-4 h-4 ml-1" />
                        אשר
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => declineMutation.mutate(p.id)}
                        disabled={approveMutation.isPending || declineMutation.isPending}
                      >
                        <X className="w-4 h-4 ml-1" />
                        דחה
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {p.raw_payload && Object.keys(p.raw_payload).length > 0 && (
                  <CardContent className="pt-0">
                    <Collapsible
                      open={!!openRaw[p.id]}
                      onOpenChange={(o) =>
                        setOpenRaw((prev) => ({ ...prev, [p.id]: o }))
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          {openRaw[p.id] ? "הסתר" : "הצג"} נתוני OCR
                          {openRaw[p.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
                          {JSON.stringify(p.raw_payload, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
