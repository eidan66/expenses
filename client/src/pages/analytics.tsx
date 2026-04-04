import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Transaction } from "@shared/schema";
import { useMemo, useState } from "react";
import { getTransactions } from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildAnalyticsReport,
  toAiContextSnapshot,
  type AnalyticsTimeRange,
} from "@/lib/analyticsMetrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsAiPanel } from "@/components/analytics-ai-panel";

const RANGE_OPTIONS: { value: AnalyticsTimeRange; label: string }[] = [
  { value: "all", label: "כל התקופה" },
  { value: "ytd", label: "שנה נוכחית" },
  { value: "12m", label: "12 חודשים אחרונים" },
  { value: "6m", label: "6 חודשים אחרונים" },
  { value: "3m", label: "3 חודשים אחרונים" },
];

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

export default function Analytics() {
  const { session, loading: authLoading } = useAuth();
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    enabled: !authLoading && !!session,
  });

  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("all");

  const report = useMemo(
    () => buildAnalyticsReport(transactions, timeRange),
    [transactions, timeRange]
  );

  const aiSnapshot = useMemo(() => toAiContextSnapshot(report), [report]);

  const pieData = useMemo(
    () =>
      report.pieExpenseSlices.map((d, i) => ({
        ...d,
        color: chartColor(i),
      })),
    [report.pieExpenseSlices]
  );

  const categoryBarData = useMemo(
    () =>
      report.expenseByCategory.slice(0, 12).map((d, i) => ({
        ...d,
        fill: chartColor(i),
      })),
    [report.expenseByCategory]
  );

  const incomeSubBar = useMemo(
    () =>
      report.incomeBySubcategory.slice(0, 10).map((d, i) => ({
        ...d,
        fill: chartColor(i + 2),
      })),
    [report.incomeBySubcategory]
  );

  if (transactions.length === 0) {
    return (
      <Layout>
        <div className="space-y-6" dir="rtl">
          <div>
            <h1 className="text-3xl font-heading font-bold">אנליטיקה וביצועים</h1>
            <p className="text-muted-foreground">
              ניתוח מעמיק של הרגלי הצריכה והחיסכון שלכם
            </p>
          </div>

          <Card className="border-dashed border-2 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="p-4 bg-background rounded-full shadow-sm">
                <BarChart3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">
                  אין מספיק נתונים לאנליטיקה
                </h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  ברגע שתתחילו להוסיף הכנסות והוצאות, נציג לכם כאן תובנות חכמות וגרפים.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { kpis, monthlySeries, cumulativeNet, insights } = report;
  const noMonthsInRange = monthlySeries.length === 0;

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold whitespace-nowrap">
              אנליטיקה וביצועים
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              ניתוח מעמיק של הרגלי הצריכה והחיסכון שלכם
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-56">
            <Label className="text-right text-muted-foreground">טווח זמן</Label>
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as AnalyticsTimeRange)}
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {RANGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="classic" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 sm:max-w-lg">
            <TabsTrigger value="classic">אנליטיקה</TabsTrigger>
            <TabsTrigger value="ai">אנליטיקה חכמה</TabsTrigger>
          </TabsList>

          <TabsContent value="classic" className="mt-4 space-y-6">
            {noMonthsInRange ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  אין עסקאות בטווח הזמן שנבחר. הרחיבו את הטווח או הוסיפו נתונים.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="p-4 text-right">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        הכנסה חודשית ממוצעת
                      </p>
                      <h3 className="text-xl font-bold">{formatCurrency(kpis.avgMonthlyIncome)}</h3>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-950/20">
                    <CardContent className="p-4 text-right">
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                        הוצאה חודשית ממוצעת
                      </p>
                      <h3 className="text-xl font-bold">{formatCurrency(kpis.avgMonthlyExpenses)}</h3>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardContent className="p-4 text-right">
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        שיעור חיסכון ממוצע
                      </p>
                      <h3 className="text-xl font-bold">
                        {kpis.avgSavingsRate.toFixed(1)}%
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-primary/5">
                    <CardContent className="p-4 text-right">
                      <p className="text-xs font-medium text-primary mb-1">יתרה נטו מצטברת</p>
                      <h3 className="text-xl font-bold">
                        {formatCurrency(kpis.cumulativeNetEnd)}
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-violet-50/50 dark:bg-violet-950/20">
                    <CardContent className="p-4 text-right">
                      <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
                        הפקדות חיסכון ממוצעות
                      </p>
                      <h3 className="text-xl font-bold">
                        {formatCurrency(kpis.avgSavingsTransfers)}
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-muted/40">
                    <CardContent className="p-4 text-right space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">שינוי מול חודש קודם</p>
                      {kpis.momIncomePct !== null && (
                        <div className="flex items-center justify-end gap-1 text-sm">
                          {kpis.momIncomePct >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span>הכנסה {kpis.momIncomePct >= 0 ? "+" : ""}{kpis.momIncomePct.toFixed(1)}%</span>
                        </div>
                      )}
                      {kpis.momExpensePct !== null && (
                        <div className="flex items-center justify-end gap-1 text-sm">
                          {kpis.momExpensePct <= 0 ? (
                            <TrendingDown className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          )}
                          <span>הוצאות {kpis.momExpensePct >= 0 ? "+" : ""}{kpis.momExpensePct.toFixed(1)}%</span>
                        </div>
                      )}
                      {kpis.momIncomePct === null && kpis.momExpensePct === null && (
                        <span className="text-xs text-muted-foreground">לא מספיק חודשים</span>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg text-right flex items-center justify-end gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      תובנות אוטומטיות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-right text-sm space-y-1 text-muted-foreground">
                      {insights.map((line, i) => (
                        <li key={i} className="marker:text-primary">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg text-right">
                        הכנסות, הוצאות, הפקדות חיסכון ויתרה חודשית
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlySeries} margin={{ top: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} hide />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Legend wrapperStyle={{ direction: "rtl" }} />
                          <Bar dataKey="income" name="הכנסה" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" name="הוצאות" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                          <Bar
                            dataKey="savingsTransfers"
                            name="הפקדות חיסכון"
                            fill="hsl(var(--chart-4))"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            type="monotone"
                            dataKey="netFlow"
                            name="יתרה חודשית (נטו)"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg text-right">
                        צבירת יתרה נטו לאורך זמן
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cumulativeNet}>
                          <defs>
                            <linearGradient id="colorNetTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} hide />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            name="יתרה נטו מצטברת"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorNetTotal)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg text-right">התפלגות הוצאות</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px] flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold">
                          {formatCurrency(kpis.totalExpensesInPeriod)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          סה״כ הוצאות בטווח
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg text-right">הוצאות לפי קטגוריה</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={categoryBarData}
                          margin={{ left: 16, right: 24, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {categoryBarData.map((entry, index) => (
                              <Cell key={`cat-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {incomeSubBar.length > 0 && (
                    <Card className="border-none shadow-sm lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="font-heading text-lg text-right">
                          הכנסות לפי תת-קטגוריה
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={incomeSubBar} margin={{ top: 8, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                            <YAxis axisLine={false} tickLine={false} hide />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="value" name="הכנסה" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {report.expenseBySubcategory.length > 0 && (
                    <Card className="border-none shadow-sm lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="font-heading text-lg text-right">
                          תתי-קטגוריות הוצאה מובילות
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={report.expenseBySubcategory}
                            margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                            <XAxis type="number" hide />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={140}
                              tick={{ fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {report.expenseBySubcategory.map((entry, index) => (
                                <Cell key={`sub-${index}`} fill={chartColor(index)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <AnalyticsAiPanel snapshot={aiSnapshot} timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
