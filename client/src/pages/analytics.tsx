import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Wallet, ArrowUpRight, Home } from "lucide-react";

const monthlyData = [
  { name: "ינואר", income: 24000, expenses: 10000, savings: 14000 },
  { name: "פברואר", income: 24000, expenses: 11000, savings: 13000 },
  { name: "מרץ", income: 24000, expenses: 9500, savings: 14500 },
  { name: "אפריל", income: 26000, expenses: 12000, savings: 14000 },
  { name: "מאי", income: 24000, expenses: 10500, savings: 13500 },
  { name: "יוני", income: 24000, expenses: 11000, savings: 13000 },
];

const categoryData = [
  { name: "דיור", value: 6500, color: "hsl(var(--chart-2))" },
  { name: "צריכה", value: 2500, color: "hsl(var(--chart-3))" },
  { name: "תחבורה", value: 1800, color: "hsl(var(--chart-4))" },
  { name: "בריאות", value: 1200, color: "hsl(var(--chart-5))" },
];

const cumulativeSavings = [
  { name: "ינואר", total: 14000 },
  { name: "פברואר", total: 27000 },
  { name: "מרץ", total: 41500 },
  { name: "אפריל", total: 55500 },
  { name: "מאי", total: 69000 },
  { name: "יוני", total: 82000 },
];

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-heading font-bold">אנליטיקה וביצועים</h1>
          <p className="text-muted-foreground">ניתוח מעמיק של הרגלי הצריכה והחיסכון שלכם</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-emerald-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-emerald-600 mb-1">שיעור חיסכון ממוצע</p>
              <h3 className="text-2xl font-bold">56%</h3>
              <p className="text-xs text-emerald-600/70 mt-1 flex items-center justify-end">
                <TrendingUp className="w-3 h-3 ml-1" /> 4% מעל החודש הקודם
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-blue-600 mb-1">הכנסה חודשית ממוצעת</p>
              <h3 className="text-2xl font-bold">₪24,333</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-orange-50/50">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-orange-600 mb-1">הוצאה חודשית ממוצעת</p>
              <h3 className="text-2xl font-bold">₪10,666</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-6 text-right">
              <p className="text-sm font-medium text-primary mb-1">זמן הגעה משוער ליעד</p>
              <h3 className="text-2xl font-bold">22 חודשים</h3>
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
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
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
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="total" name="סה\"כ נחסך" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg text-right">התפלגות הוצאות ממוצעת</CardTitle></CardHeader>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold">₪12K</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">הוצאות</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg text-right">תובנות חכמות</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 text-right">
                <div className="p-2 bg-white rounded-xl shadow-sm"><ArrowUpRight className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">קצב חיסכון מצוין</p>
                  <p className="text-xs text-emerald-600/80">אתם חוסכים ב-12% יותר מהמינימום הנדרש. זה מקצר את הדרך לדירה ב-4 חודשים.</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4 text-right">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Wallet className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-bold text-blue-700">יציבות בהכנסות</p>
                  <p className="text-xs text-blue-600/80">ההכנסות שלכם יציבות ב-5 החודשים האחרונים, מה שמאפשר תכנון ארוך טווח בטוח.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
