import { useMemo, useState } from "react";
import { type Transaction } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface Props {
  category: string | null;
  transactions: Transaction[];
  onClose: () => void;
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "₪0";
  return `₪${num.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function chartColor(i: number): string {
  const n = (i % 5) + 1;
  return `hsl(var(--chart-${n}))`;
}

function isExpenseTx(t: Transaction): boolean {
  const amt = parseFloat(t.amount);
  return t.category !== "הכנסה" && t.category !== "חיסכון" && amt < 0;
}

export default function CategoryDetailPanel({ category, transactions, onClose }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const catTransactions = useMemo(() => {
    if (!category) return [];
    return transactions.filter(
      (t) => isExpenseTx(t) && t.category === category
    );
  }, [category, transactions]);

  const months = useMemo(() => {
    const seen = new Map<string, { label: string; sortKey: number }>();
    for (const t of catTransactions) {
      const key = `${t.month} ${t.year}`;
      if (!seen.has(key)) {
        seen.set(key, { label: key, sortKey: parseInt(t.year) * 100 });
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1].sortKey - a[1].sortKey)
      .map(([k, v]) => ({ value: k, label: v.label }));
  }, [catTransactions]);

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return catTransactions;
    return catTransactions.filter(
      (t) => `${t.month} ${t.year}` === selectedMonth
    );
  }, [catTransactions, selectedMonth]);

  const totalSpend = useMemo(
    () => filtered.reduce((s, t) => s + Math.abs(parseFloat(t.amount)), 0),
    [filtered]
  );

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { value: number; sortKey: number }>();
    for (const t of catTransactions) {
      const key = `${t.month} ${t.year}`;
      const abs = Math.abs(parseFloat(t.amount));
      const existing = map.get(key) ?? { value: 0, sortKey: parseInt(t.year) * 100 };
      map.set(key, { value: existing.value + abs, sortKey: existing.sortKey });
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .map(([name, d]) => ({ name, value: d.value }));
  }, [catTransactions]);

  const subcategoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      const sub = t.subcategory?.trim() || "ללא תת-קטגוריה";
      map.set(sub, (map.get(sub) ?? 0) + Math.abs(parseFloat(t.amount)));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const sortedTransactions = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  );

  // reset month filter when category changes
  useMemo(() => {
    setSelectedMonth("all");
  }, [category]);

  return (
    <Sheet open={!!category} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="left" className="w-full sm:max-w-xl overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right mb-4">
          <SheetTitle className="font-heading text-xl">{category}</SheetTitle>
        </SheetHeader>

        {/* Month filter */}
        <div className="mb-5">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="כל החודשים" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">כל החודשים</SelectItem>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-muted/40 rounded-lg p-3 text-right">
            <p className="text-xs text-muted-foreground mb-1">סה״כ הוצאות</p>
            <p className="font-bold text-sm">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-right">
            <p className="text-xs text-muted-foreground mb-1">מספר עסקאות</p>
            <p className="font-bold text-sm">{filtered.length}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-right">
            <p className="text-xs text-muted-foreground mb-1">ממוצע לעסקה</p>
            <p className="font-bold text-sm">
              {filtered.length > 0 ? formatCurrency(totalSpend / filtered.length) : "—"}
            </p>
          </div>
        </div>

        {/* Monthly trend */}
        {monthlyTrend.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-right">מגמה חודשית</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" name="הוצאות" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subcategory breakdown */}
        {subcategoryBreakdown.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-right">פילוח תת-קטגוריות</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subcategoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subcategoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={chartColor(i)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transaction list */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-right">
            עסקאות ({sortedTransactions.length})
          </h3>
          {sortedTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-right">אין עסקאות בטווח שנבחר</p>
          ) : (
            <div className="space-y-2">
              {sortedTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-destructive">
                    {formatCurrency(Math.abs(parseFloat(t.amount)))}
                  </span>
                  <div className="text-right flex-1 mx-3">
                    <p className="font-medium leading-tight">{t.title}</p>
                    {t.subcategory && (
                      <p className="text-xs text-muted-foreground">{t.subcategory}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
