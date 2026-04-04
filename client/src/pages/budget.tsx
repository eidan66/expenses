import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Home,
  Wallet,
  AlertCircle,
  ShoppingBag,
  Shield,
  ShoppingCart,
  Car,
  Settings2,
  Calendar,
  Pencil,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, safeParseFloat, formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { BudgetPieChart } from "@/components/budget-chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useQuery } from "@tanstack/react-query";
import { type Transaction } from "@shared/schema";
import { getTransactions } from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext";
import {
  BUDGET_PERIOD_STORAGE_KEY,
  BUDGET_SELECTABLE_YEARS,
  HEBREW_MONTHS,
  getCurrentBudgetYear,
} from "@/lib/budgetConstants";

const MONTHS = [...HEBREW_MONTHS];
const YEARS = [...BUDGET_SELECTABLE_YEARS];
const MONTH_VALUES = HEBREW_MONTHS as readonly string[];
const YEAR_VALUES = BUDGET_SELECTABLE_YEARS as readonly string[];

const currentMonthName = MONTHS[new Date().getMonth()];
const rawCalendarYear = getCurrentBudgetYear();
const currentYearStr = YEAR_VALUES.includes(rawCalendarYear) ? rawCalendarYear : YEARS[YEARS.length - 1]!;

function loadStoredBudgetPeriod(): { month: string; year: string } {
  try {
    const raw = sessionStorage.getItem(BUDGET_PERIOD_STORAGE_KEY);
    if (!raw) return { month: currentMonthName, year: currentYearStr };
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return { month: currentMonthName, year: currentYearStr };
    const o = p as Record<string, unknown>;
    const month = o.month;
    const year = o.year;
    if (
      typeof month === "string" &&
      MONTH_VALUES.includes(month) &&
      typeof year === "string" &&
      YEAR_VALUES.includes(year)
    ) {
      return { month, year };
    }
  } catch {
    /* ignore */
  }
  return { month: currentMonthName, year: currentYearStr };
}

const BUDGET_STORAGE_KEY = "nestegg-budget-categories-v1";

type BudgetCatType = "Savings" | "Needs" | "Wants";

type StoredBudgetCategory = {
  name: string;
  type: BudgetCatType;
  budget: number;
  items: string[];
};

type BudgetCategoryRow = StoredBudgetCategory & {
  icon: LucideIcon;
  color: string;
};

const ICON_BY_NAME: Record<string, LucideIcon> = {
  חיסכון: Wallet,
  דיור: Home,
  "בריאות וביטוח": Shield,
  צריכה: ShoppingBag,
  תחבורה: Car,
  "רצונות ודיגיטל": ShoppingCart,
};

const COLOR_BY_NAME: Record<string, string> = {
  חיסכון: "bg-emerald-500",
  דיור: "bg-blue-500",
  "בריאות וביטוח": "bg-blue-400",
  צריכה: "bg-blue-300",
  תחבורה: "bg-blue-200",
  "רצונות ודיגיטל": "bg-orange-400",
};

function iconForType(type: BudgetCatType): LucideIcon {
  switch (type) {
    case "Savings":
      return Wallet;
    case "Needs":
      return Home;
    case "Wants":
      return ShoppingCart;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function colorForType(type: BudgetCatType): string {
  switch (type) {
    case "Savings":
      return "bg-emerald-500";
    case "Needs":
      return "bg-blue-500";
    case "Wants":
      return "bg-orange-400";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function decorateCategory(s: StoredBudgetCategory): BudgetCategoryRow {
  const icon = ICON_BY_NAME[s.name] ?? iconForType(s.type);
  const color = COLOR_BY_NAME[s.name] ?? colorForType(s.type);
  return { ...s, icon, color };
}

const DEFAULT_STORED_CATEGORIES: StoredBudgetCategory[] = [
  { name: "חיסכון", type: "Savings", budget: 12000, items: ["יעד ארוך טווח", "קרן חירום"] },
  { name: "דיור", type: "Needs", budget: 6500, items: ["שכירות", "חשמל", "מים", "ארנונה", "תמי 4"] },
  { name: "בריאות וביטוח", type: "Needs", budget: 1200, items: ["שיניים", "ביטוח חיים", "ביטוח בריאות"] },
  { name: "צריכה", type: "Needs", budget: 2500, items: ["אוכל", "טואלטיקה"] },
  { name: "תחבורה", type: "Needs", budget: 1800, items: ["דלק", "טסט", "ביטוח"] },
  { name: "רצונות ודיגיטל", type: "Wants", budget: 1500, items: ["קניות אונליין", "נטפליקס", "ChatGPT"] },
];

function isValidStored(x: unknown): x is StoredBudgetCategory {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    (o.type === "Savings" || o.type === "Needs" || o.type === "Wants") &&
    typeof o.budget === "number" &&
    Number.isFinite(o.budget) &&
    Array.isArray(o.items) &&
    o.items.every((i) => typeof i === "string")
  );
}

function loadStoredCategories(): BudgetCategoryRow[] {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return DEFAULT_STORED_CATEGORIES.map(decorateCategory);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isValidStored)) {
      return DEFAULT_STORED_CATEGORIES.map(decorateCategory);
    }
    return parsed.map(decorateCategory);
  } catch {
    return DEFAULT_STORED_CATEGORIES.map(decorateCategory);
  }
}

function mapTransactionToBudgetCategory(txCategory: string): string {
  const mapping: Record<string, string> = {
    דיור: "דיור",
    בריאות: "בריאות וביטוח",
    ביטוחים: "בריאות וביטוח",
    צריכה: "צריכה",
    "ביגוד והנעלה": "צריכה",
    "תחבורה (רכב)": "תחבורה",
    "תחבורה (אופנוע)": "תחבורה",
    "תחבורה ציבורית": "תחבורה",
    "קניות אונליין": "רצונות ודיגיטל",
    "שירותים דיגיטליים": "רצונות ודיגיטל",
    "חשבונות קבועים": "רצונות ודיגיטל",
    מנויים: "רצונות ודיגיטל",
    "בילויים ופנאי": "רצונות ודיגיטל",
    חיות: "רצונות ודיגיטל",
    תקשורת: "רצונות ודיגיטל",
    חיסכון: "חיסכון",
  };
  return mapping[txCategory] || "שונות";
}

export default function Budget() {
  const { session, loading: authLoading } = useAuth();
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    enabled: !authLoading && !!session,
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => loadStoredBudgetPeriod().month);
  const [selectedYear, setSelectedYear] = useState<string>(() => loadStoredBudgetPeriod().year);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        BUDGET_PERIOD_STORAGE_KEY,
        JSON.stringify({ month: selectedMonth, year: selectedYear })
      );
    } catch {
      /* ignore */
    }
  }, [selectedMonth, selectedYear]);

  const transactionsThisMonth = useMemo(
    () => transactions.filter((t) => t.month === selectedMonth && t.year === selectedYear),
    [transactions, selectedMonth, selectedYear]
  );

  /** הכנסות לחודש הנוכחי — כמו בסקירה הכללית (כל תנועת הכנסה חיובית). */
  const calculatedIncome = useMemo(() => {
    return transactionsThisMonth.reduce((sum, t) => {
      if (t.category !== "הכנסה") return sum;
      const amt = safeParseFloat(t.amount);
      if (amt > 0) return sum + amt;
      return sum;
    }, 0);
  }, [transactionsThisMonth]);

  const [manualIncome, setManualIncome] = useState<number | null>(null);
  const income = manualIncome ?? calculatedIncome;

  useEffect(() => {
    setManualIncome(null);
  }, [selectedMonth, selectedYear]);

  const spendingByCategory = useMemo(() => {
    return transactionsThisMonth.reduce(
      (acc, t) => {
        const amount = Math.abs(safeParseFloat(t.amount));
        if (safeParseFloat(t.amount) < 0) {
          const budgetCategory = mapTransactionToBudgetCategory(t.category);
          acc[budgetCategory] = (acc[budgetCategory] || 0) + amount;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  }, [transactionsThisMonth]);

  const minSavingsRate = 0.5;
  const minSavingsAmount = income > 0 ? income * minSavingsRate : 0;

  const [categories, setCategories] = useState<BudgetCategoryRow[]>(() => loadStoredCategories());

  useEffect(() => {
    const serializable: StoredBudgetCategory[] = categories.map(({ name, type, budget, items }) => ({
      name,
      type,
      budget,
      items,
    }));
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      /* ignore quota / private mode */
    }
  }, [categories]);

  const displayCategories = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        spent: spendingByCategory[cat.name] || 0,
      })),
    [categories, spendingByCategory]
  );

  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<BudgetCatType>("Needs");
  const [newCatBudget, setNewCatBudget] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [tempIncome, setTempIncome] = useState("");

  const [isSubCatDialogOpen, setIsSubCatDialogOpen] = useState(false);
  const [selectedParentCat, setSelectedParentCat] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");

  const [editBudgetDialogOpen, setEditBudgetDialogOpen] = useState(false);
  const [editBudgetCategoryName, setEditBudgetCategoryName] = useState<string | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState("");

  const handleUpdateIncome = () => {
    const cleaned = parseFormattedNumber(tempIncome).replace(/\s/g, "");
    if (cleaned === "") {
      setManualIncome(null);
    } else {
      setManualIncome(safeParseFloat(cleaned));
    }
    setTempIncome("");
    setIsIncomeDialogOpen(false);
  };

  const handleAddSubCategory = () => {
    if (!selectedParentCat || !newSubCatName) return;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === selectedParentCat ? { ...cat, items: [...cat.items, newSubCatName] } : cat
      )
    );
    setNewSubCatName("");
    setIsSubCatDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCatName || !newCatBudget) return;

    const budgetVal = safeParseFloat(newCatBudget);
    const stored: StoredBudgetCategory = {
      name: newCatName,
      type: newCatType,
      budget: budgetVal,
      items: [],
    };

    setCategories((prev) => [...prev, decorateCategory(stored)]);
    setNewCatName("");
    setNewCatBudget("");
    setIsDialogOpen(false);
  };

  const openEditBudget = (cat: BudgetCategoryRow) => {
    setEditBudgetCategoryName(cat.name);
    setEditBudgetAmount(String(cat.budget));
    setEditBudgetDialogOpen(true);
  };

  const saveEditBudget = () => {
    if (!editBudgetCategoryName) return;
    const next = Math.max(0, safeParseFloat(editBudgetAmount));
    setCategories((prev) =>
      prev.map((c) => (c.name === editBudgetCategoryName ? { ...c, budget: next } : c))
    );
    setEditBudgetDialogOpen(false);
    setEditBudgetCategoryName(null);
    setEditBudgetAmount("");
  };

  const totalBudgetedSavings = displayCategories.find((c) => c.type === "Savings")?.budget ?? 0;
  const currentSavingsRate = income > 0 ? (totalBudgetedSavings / income) * 100 : 0;
  const displaySavingsRate = Number.isFinite(currentSavingsRate) ? currentSavingsRate : 0;
  const isRateValid = income > 0 && displaySavingsRate >= 50;

  const plannedPieSlices = useMemo(() => {
    let savings = 0;
    let needs = 0;
    let wants = 0;
    for (const c of categories) {
      if (c.type === "Savings") savings += c.budget;
      else if (c.type === "Needs") needs += c.budget;
      else wants += c.budget;
    }
    return [
      { category: "Savings" as const, amount: savings, fill: "var(--color-chart-1)" },
      { category: "Needs" as const, amount: needs, fill: "var(--color-chart-2)" },
      { category: "Wants" as const, amount: wants, fill: "var(--color-chart-3)" },
    ];
  }, [categories]);

  const expenseOversCount = useMemo(
    () => displayCategories.filter((c) => c.type !== "Savings" && c.budget > 0 && c.spent > c.budget).length,
    [displayCategories]
  );

  const chartFooter = useMemo(() => {
    if (income <= 0) {
      return {
        variant: "neutral" as const,
        message:
          "הגדירו הכנסה חודשית (אוטומטית מהעסקאות או ידנית בהגדרות) כדי לקבל בדיקת יעד חיסכון של 50%.",
      };
    }
    if (expenseOversCount > 0) {
      return {
        variant: "caution" as const,
        message: `${expenseOversCount} קטגוריות הוצאה מעל היעד החודשי — עקבו אחרי הסכומים בכרטיסים`,
      };
    }
    if (!isRateValid) {
      return {
        variant: "caution" as const,
        message: "שיעור החיסכון המתוכנן נמוך מ־50% מההכנסה — שקלו להגדיל את יעד החיסכון",
      };
    }
    return {
      variant: "positive" as const,
      message: "אתם בדרך הנכונה החודש — היעדים וההכנסה מסתדרים עם כללי העבודה",
    };
  }, [income, expenseOversCount, isRateValid]);

  const showSavingsRuleWarning = income > 0 && !isRateValid;
  const showIncomeHint = income <= 0;

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold whitespace-nowrap">ניהול תקציב</h1>
              <p className="text-sm sm:text-base text-muted-foreground">תכנון חודשי מול ביצוע בפועל</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                סכומי <strong>ביצוע בפועל</strong> (הכנסות והוצאות) מחושבים לפי <strong>חודש {selectedMonth} {selectedYear}</strong>{" "}
                שבחרתם. <strong>ההוצאה הצפויה / יעד חודשי</strong> לכל קטגוריה מעודכן בלחיצה על{" "}
                <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </span>{" "}
                בכרטיס. היעדים נשמרים בדפדפן וחלים על כל החודשים.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl self-start">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[7.5rem] border-none bg-transparent focus:ring-0 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-4 bg-muted-foreground/20 shrink-0" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[4.5rem] border-none bg-transparent focus:ring-0 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 ml-2" />
                    קטגוריה חדשה
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-right" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-heading font-bold">הוספת קטגוריה חדשה</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">שם הקטגוריה</Label>
                      <Input
                        id="name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="לדוגמה: בידור, השקעות..."
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">סוג תקציב</Label>
                      <Select
                        onValueChange={(v) => setNewCatType(v as BudgetCatType)}
                        value={newCatType}
                      >
                        <SelectTrigger id="type" className="text-right">
                          <SelectValue placeholder="בחר סוג" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Savings">חיסכון (50%+)</SelectItem>
                          <SelectItem value="Needs">הוצאה חיונית</SelectItem>
                          <SelectItem value="Wants">הוצאה גמישה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">תקציב חודשי (₪)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newCatBudget}
                        onChange={(e) => setNewCatBudget(e.target.value)}
                        placeholder="0"
                        className="text-right"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                      ביטול
                    </Button>
                    <Button onClick={handleAddCategory} className="rounded-full">
                      הוספה
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {showIncomeHint && (
          <div className="bg-sky-500/10 border border-sky-500/25 p-4 rounded-xl text-sky-900 dark:text-sky-100 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <p>
              <strong>הכנסה חודשית:</strong> לא נמצאו הכנסות חיוביות בקטגוריית &quot;הכנסה&quot; ל־
              <strong>
                {selectedMonth} {selectedYear}
              </strong>
              , או שההכנסה היא 0. לחצו על &quot;הגדרות תקציב חודשי&quot; כדי לעדכן הכנסה ידנית עבור חודש זה — כך חישוב
              50% חיסכון יהיה מדויק.
            </p>
          </div>
        )}

        {showSavingsRuleWarning && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              <strong>אזהרה:</strong> שיעור החיסכון המתוכנן נמוך מ־50% מההכנסה. מומלץ להקצות לפחות{" "}
              <strong>₪{Math.ceil(minSavingsAmount).toLocaleString()}</strong> לחיסכון (50% מ־₪
              {income.toLocaleString()}).
            </p>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <BudgetPieChart
                  dataOverride={plannedPieSlices}
                  chartSubtitle={`חודש ${selectedMonth} ${selectedYear} · סכומי יעד לפי סוג`}
                  footer={chartFooter}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="font-heading text-lg">סיכום חיסכון</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-sm text-muted-foreground">
                    הכנסה נטו ({selectedMonth} {selectedYear})
                  </span>
                  <span className="font-bold">₪{income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-sm text-emerald-700">מינימום חיסכון (50%)</span>
                  <span className="font-bold text-emerald-800">
                    {income > 0 ? `₪${Math.ceil(minSavingsAmount).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-sm text-muted-foreground">הקצאה מתוכננת לחיסכון</span>
                  <span className="font-bold text-primary">₪{totalBudgetedSavings.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4">
              <Dialog
                open={isIncomeDialogOpen}
                onOpenChange={(open) => {
                  setIsIncomeDialogOpen(open);
                  if (open) {
                    setTempIncome(manualIncome !== null ? String(manualIncome) : "");
                  } else {
                    setTempIncome("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Settings2 className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">הגדרות תקציב חודשי</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="text-right" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-heading font-bold">הגדרות תקציב חודשי</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-800 mb-1">הכנסה מחושבת אוטומטית לחודש הנבחר</p>
                      <p className="text-2xl font-bold text-emerald-900">₪{calculatedIncome.toLocaleString()}</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        סכום כל תנועות &quot;הכנסה&quot; החיוביות ב־{selectedMonth} {selectedYear} (כמו בסקירה הכללית)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income-edit">עקוף הכנסה ידנית (אופציונלי)</Label>
                      <Input
                        id="income-edit"
                        type="text"
                        inputMode="numeric"
                        placeholder={calculatedIncome.toLocaleString()}
                        value={formatNumberWithCommas(tempIncome)}
                        onChange={(e) => {
                          const cleaned = parseFormattedNumber(e.target.value);
                          setTempIncome(cleaned);
                        }}
                        className="text-right"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        השאירו ריק ולחצו &quot;עדכון הכנסה&quot; כדי לחזור לחישוב האוטומטי. ערך זה משפיע על בדיקת 50%
                        חיסכון.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)} className="rounded-full">
                      ביטול
                    </Button>
                    <Button onClick={handleUpdateIncome} className="rounded-full">
                      עדכון הכנסה
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isSubCatDialogOpen} onOpenChange={setIsSubCatDialogOpen}>
                <DialogTrigger asChild>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Plus className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">הוספת תת-קטגוריה</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="text-right" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-heading font-bold">הוספת תת-קטגוריה</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent-cat">בחר קטגוריית אם</Label>
                      <Select onValueChange={setSelectedParentCat}>
                        <SelectTrigger id="parent-cat" className="text-right">
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                        <SelectContent>
                          {displayCategories.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-name">שם תת-הקטגוריה</Label>
                      <Input
                        id="sub-name"
                        value={newSubCatName}
                        onChange={(e) => setNewSubCatName(e.target.value)}
                        placeholder="לדוגמה: מנוי חדר כושר, ביטוח רכב..."
                        className="text-right"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsSubCatDialogOpen(false)} className="rounded-full">
                      ביטול
                    </Button>
                    <Button onClick={handleAddSubCategory} className="rounded-full">
                      הוספה
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {displayCategories.map((cat) => {
              const isSavings = cat.type === "Savings";
              const budget = cat.budget;
              const spent = cat.spent;
              const ratio = budget > 0 ? spent / budget : 0;
              const progressPct = Math.min(100, ratio * 100);
              const overBudget = !isSavings && budget > 0 && spent > budget;
              const overPct = budget > 0 && spent > budget ? Math.round((spent / budget - 1) * 100) : 0;

              let indicatorClass: string;
              if (isSavings) {
                if (budget <= 0) indicatorClass = "bg-muted-foreground/40";
                else if (spent >= budget) indicatorClass = "bg-emerald-600";
                else indicatorClass = "bg-amber-500";
              } else if (overBudget) {
                indicatorClass = "bg-destructive";
              } else {
                indicatorClass = cat.color;
              }

              return (
                <Card
                  key={cat.name}
                  className={cn(
                    "border-none shadow-sm overflow-hidden text-right group transition-all hover:shadow-md",
                    isSavings && "bg-emerald-50/20 ring-1 ring-emerald-500/20"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(cat.color, "p-2.5 rounded-xl text-white shadow-sm shrink-0")}>
                          <cat.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading font-bold">{cat.name}</h4>
                          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-tighter">
                            {isSavings ? "חיסכון (העברות)" : cat.type === "Needs" ? "הוצאה חיונית" : "הוצאה גמישה"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => openEditBudget(cat)}
                          aria-label={`עריכת יעד תקציב — ${cat.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <div className="text-right">
                          <p className="text-lg font-bold">₪{spent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {isSavings
                              ? `הועבר לחיסכון ב־${selectedMonth} · יעד `
                              : `הוצאות ב־${selectedMonth} · יעד `}
                            ₪{budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Progress value={progressPct} className="h-2" indicatorClassName={indicatorClass} />
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {cat.items.map((item) => (
                            <span
                              key={item}
                              className="text-[11px] px-2 py-0.5 bg-white border rounded-full text-muted-foreground font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        {overBudget && (
                          <span className="text-xs font-medium text-destructive shrink-0">
                            מעל היעד ב־{overPct}%
                          </span>
                        )}
                        {isSavings && budget > 0 && spent < budget && (
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-500 shrink-0">
                            עוד ₪{(budget - spent).toLocaleString()} ליעד
                          </span>
                        )}
                        {isSavings && budget > 0 && spent >= budget && (
                          <span className="text-xs font-medium text-emerald-700 shrink-0">הגעתם ליעד החודש</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Dialog
          open={editBudgetDialogOpen}
          onOpenChange={(open) => {
            setEditBudgetDialogOpen(open);
            if (!open) {
              setEditBudgetCategoryName(null);
              setEditBudgetAmount("");
            }
          }}
        >
          <DialogContent className="text-right" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold">
                {editBudgetCategoryName ? `יעד חודשי — ${editBudgetCategoryName}` : "יעד חודשי"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                סכום זה הוא ההוצאה (או חיסכון) <strong>המתוכננת</strong> לחודש, לעומת הביצוע בפועל שמגיע מהעסקאות.
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-budget-amount">סכום ב־₪</Label>
                <Input
                  id="edit-budget-amount"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setEditBudgetDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button className="rounded-full" onClick={saveEditBudget}>
                שמירה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
