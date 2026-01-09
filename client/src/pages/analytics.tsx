import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Wallet, ArrowUpRight, Home, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Transaction } from "@shared/schema";
import { safeParseFloat, safeParseInt } from "@/lib/utils";
import { getTransactions } from "@/lib/supabaseQueries";


export default function Analytics() {
  const { data: transactions = [] } = useQuery<Transaction[]>({ 
    queryKey: ['transactions'],
    queryFn: getTransactions
  });

  // If no data, show empty state
  if (transactions.length === 0) {
    return (
      <Layout>
        <div className="space-y-6" dir="rtl">
          <div>
             <h1 className="text-3xl font-heading font-bold">אנליטיקה וביצועים</h1>
             <p className="text-muted-foreground">ניתוח מעמיק של הרגלי הצריכה והחיסכון שלכם</p>
          </div>
          
          <Card className="border-dashed border-2 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="p-4 bg-background rounded-full shadow-sm">
                <BarChart3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">אין מספיק נתונים לאנליטיקה</h3>
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

  // Process data for charts
  const monthlyStats = new Map<string, { income: number, expenses: number, savings: number, savingsTransfers: number, monthIndex: number, year: number }>();
  const categoryStats = new Map<string, number>();
  let totalSavings = 0;
  
  const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

  transactions.forEach(t => {
    const amount = safeParseFloat(t.amount);
    const isIncome = amount > 0 && t.category === "הכנסה";
    const isSavings = t.category === "חיסכון";
    const isExpense = amount < 0 && !isSavings;
    const absAmount = Math.abs(amount);
    const monthIndex = MONTHS.indexOf(t.month);
    
    // Monthly Stats
    const key = `${t.month} ${t.year}`;
    if (!monthlyStats.has(key)) {
      monthlyStats.set(key, { income: 0, expenses: 0, savings: 0, savingsTransfers: 0, monthIndex, year: safeParseInt(t.year) });
    }
    const stat = monthlyStats.get(key)!;
    if (isIncome) {
      stat.income += absAmount;
    } else if (isSavings) {
      // Savings transfers - track separately, don't count as expenses
      stat.savingsTransfers += absAmount;
    } else if (isExpense) {
      stat.expenses += absAmount;
    }
    
    // Calculate net savings (income - expenses, savings transfers are separate)
    stat.savings = stat.income - stat.expenses;

    // Category Stats (Expenses only, exclude savings)
    if (isExpense) {
      const current = categoryStats.get(t.category) || 0;
      categoryStats.set(t.category, current + absAmount);
    }
    
    // Total savings calculation (income - expenses)
    if (isIncome) totalSavings += absAmount;
    else if (isExpense) totalSavings -= absAmount;
    // Note: savings transfers don't affect net savings calculation
  });

  // Convert to arrays and sort
  const monthlyData = Array.from(monthlyStats.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });

  const categoryData = Array.from(categoryStats.entries())
    .map(([name, value], index) => ({
      name, 
      value, 
      color: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.value - a.value);

  // Cumulative Savings (Simulated based on monthly for smoother graph)
  let runningTotal = 0;
  const cumulativeSavings = monthlyData.map(m => {
    runningTotal += m.savings;
    return { name: m.name, total: runningTotal };
  });

  const savingsRate = monthlyData.length > 0 
    ? (monthlyData.reduce((acc, curr) => acc + (curr.income > 0 ? curr.savings / curr.income : 0), 0) / monthlyData.length) * 100
    : 0;

  const avgIncome = monthlyData.length > 0
    ? monthlyData.reduce((acc, curr) => acc + curr.income, 0) / monthlyData.length
    : 0;

  const avgExpenses = monthlyData.length > 0
    ? monthlyData.reduce((acc, curr) => acc + curr.expenses, 0) / monthlyData.length
    : 0;

  // Format number with commas, max 2 decimals, and ₪ symbol
  const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₪0';
    return `₪${num.toLocaleString('he-IL', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold whitespace-nowrap">אנליטיקה וביצועים</h1>
          <p className="text-sm sm:text-base text-muted-foreground">ניתוח מעמיק של הרגלי הצריכה והחיסכון שלכם</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-emerald-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-emerald-600 mb-1">שיעור חיסכון ממוצע</p>
              <h3 className="text-2xl font-bold">{savingsRate.toFixed(1)}%</h3>
              <p className="text-xs text-emerald-600/70 mt-1 flex items-center justify-end">
                <TrendingUp className="w-3 h-3 ml-1" /> מחושב על בסיס חודשי
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-blue-600 mb-1">הכנסה חודשית ממוצעת</p>
              <h3 className="text-2xl font-bold">{formatCurrency(avgIncome)}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-orange-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-orange-600 mb-1">הוצאה חודשית ממוצעת</p>
              <h3 className="text-2xl font-bold">{formatCurrency(avgExpenses)}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-primary mb-1">חיסכון כולל מצטבר</p>
              <h3 className="text-2xl font-bold">{formatCurrency(runningTotal)}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg text-right">הכנסות מול הוצאות וחיסכון</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    hide 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" name="הכנסה" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="הוצאה" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="חיסכון" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg text-right">צבירת חיסכון לאורך זמן</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeSavings}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    hide 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="total" name="חיסכון מצטבר" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg text-right">התפלגות הוצאות</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold">{formatCurrency(avgExpenses)}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">ממוצע</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
