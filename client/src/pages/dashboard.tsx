import Layout from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Home, Wallet, AlertCircle, FileText, Calendar } from "lucide-react";
import { BudgetPieChart } from "@/components/budget-chart";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = {
  דיור: ["שכירות/משכנתא", "ביטוח מבנה", "ועד בית", "ארנונה", "חשמל", "מים", "גז", "אינטרנט", "תמי 4", "אחר"],
  בריאות: ["רפואה כללית", "שיניים", "אחר"],
  ביטוחים: ["ביטוח בריאות", "ביטוח חיים", "אחר"],
  צריכה: ["אוכל", "טואלטיקה/היגיינה"],
  "ביגוד והנעלה": ["ביגוד והנעלה"],
  "חשבונות קבועים": ["טלוויזיה", "נטפליקס", "דיסני+", "מצלמות אבטחה", "אחר"],
  תקשורת: ["טלפון נייד"],
  "תחבורה (רכב)": ["ביטוח", "טסט", "דלק", "תחזוקה", "חניה", "אחר"],
  "תחבורה (אופנוע)": ["ביטוח", "טסט", "דלק", "תחזוקה", "חניה", "אחר"],
  "תחבורה ציבורית": ["אוטובוס/רכבת", "מונית", "אחר"],
  חיות: ["הוצאות דייזי", "הוצאות דגים"],
  "קניות אונליין": ["Temu", "Shein", "AliExpress", "אחר"],
  "שירותים דיגיטליים": ["ChatGPT/GPT", "Cursor", "אפליקציות", "Google Drive", "אחר"],
  שונות: ["מזומן", "אחר"],
  חיסכון: ["יעד ארוך טווח", "קרן חירום"],
  הכנסה: ["הכנסות עידן", "הכנסות ספיר", "הכנסות אחר"]
};

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export default function Dashboard() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("יוני");
  
  const income = 24000;
  const goalAmount = 600000;
  const currentSavingsTotal = 145000; // Total from day 0
  const monthlySavingsActual = 13000; 
  const savingsRate = (monthlySavingsActual / income) * 100;
  const progressPercentage = (currentSavingsTotal / goalAmount) * 100;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const [transactions, setTransactions] = useState([
    { id: 1, title: "סופרמרקט", amount: -450, category: "צריכה", subcategory: "אוכל", date: "היום", month: "יוני", notes: "קניות שבועיות בשופרסל" },
    { id: 2, title: "הפקדת משכורת", amount: 24000, category: "הכנסה", subcategory: "הכנסות עידן", date: "אתמול", month: "יוני", notes: "" },
    { id: 3, title: "נטפליקס", amount: -60, category: "חשבונות קבועים", subcategory: "נטפליקס", date: "אתמול", month: "יוני", notes: "מנוי פרימיום" },
    { id: 4, title: "חשבון חשמל", amount: -320, category: "דיור", subcategory: "חשמל", date: "לפני יומיים", month: "יוני", notes: "שימוש גבוה במזגן" },
    { id: 5, title: "טיפוח לדייזי", amount: -150, category: "חיות", subcategory: "הוצאות דייזי", date: "לפני 3 ימים", month: "יוני", notes: "תספורת חודשית לדייזי" },
    { id: 6, title: "שכירות מאי", amount: -6500, category: "דיור", subcategory: "שכירות/משכנתא", date: "לפני חודש", month: "מאי", notes: "" },
  ]);

  const [newTx, setNewTx] = useState({
    title: "",
    amount: "",
    category: "",
    subcategory: "",
    notes: "",
    month: "יוני"
  });

  const handleAddTransaction = () => {
    if (!newTx.title || !newTx.amount || !newTx.category) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלאו את כל שדות החובה"
      });
      return;
    }

    const transaction = {
      id: transactions.length + 1,
      title: newTx.title,
      amount: newTx.category === "הכנסה" ? Math.abs(Number(newTx.amount)) : -Math.abs(Number(newTx.amount)),
      category: newTx.category,
      subcategory: newTx.subcategory,
      date: "היום",
      month: newTx.month,
      notes: newTx.notes
    };

    setTransactions([transaction, ...transactions]);
    setOpen(false);
    setNewTx({ title: "", amount: "", category: "", subcategory: "", notes: "", month: "יוני" });
    setSelectedCategory("");
    
    toast({
      title: "העסקה נוספה",
      description: "העסקה תועדה בהצלחה במערכת"
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = t.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  return (
    <Layout>
      <div className="space-y-8" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">ברוכים השבים, שרה ותום</h1>
              <p className="text-muted-foreground">אתם שומרים על קצב חיסכון בריא של {(savingsRate).toFixed(0)}%.</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32 border-none bg-transparent focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {MONTHS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={cn(
              "px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm border",
              savingsRate >= 50 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              שיעור: {savingsRate.toFixed(0)}%
              {savingsRate < 50 && <AlertCircle className="w-4 h-4" />}
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  <Plus className="ml-2 h-4 w-4" /> הוספת עסקה
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-right">עסקה חדשה</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4 text-right">
                  <div className="space-y-2">
                    <Label>תיאור</Label>
                    <Input 
                      placeholder="לדוגמה: קניות שבועיות" 
                      value={newTx.title}
                      onChange={(e) => setNewTx({...newTx, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>סכום (₪)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label>קטגוריה</Label>
                      <Select 
                        value={newTx.category}
                        onValueChange={(val) => {
                          setSelectedCategory(val);
                          setNewTx({...newTx, category: val, subcategory: ""});
                        }}
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {Object.keys(CATEGORIES).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCategory && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 text-right">
                      <div className="space-y-2">
                        <Label>תת-קטגוריה</Label>
                        <Select 
                          value={newTx.subcategory}
                          onValueChange={(val) => setNewTx({...newTx, subcategory: val})}
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר" />
                          </SelectTrigger>
                          <SelectContent dir="rtl">
                            {CATEGORIES[selectedCategory as keyof typeof CATEGORIES].map(sub => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>חודש</Label>
                        <Select 
                          value={newTx.month}
                          onValueChange={(val) => setNewTx({...newTx, month: val})}
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent dir="rtl">
                            {MONTHS.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>הערות (אופציונלי)</Label>
                    <Textarea 
                      placeholder="הוסיפו פרטים, תגיות או תזכורות..." 
                      className="resize-none h-20 text-right" 
                      value={newTx.notes}
                      onChange={(e) => setNewTx({...newTx, notes: e.target.value})}
                    />
                  </div>
                  <Button className="w-full mt-4 rounded-full h-12 text-lg" onClick={handleAddTransaction}>
                    תיעוד עסקה
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg opacity-90">יעד לדירה - סה"כ מהיום הראשון</h3>
                  <p className="text-sm opacity-75">יעד סופי: ₪{goalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-heading">₪{currentSavingsTotal.toLocaleString()}</span>
                <p className="text-sm opacity-75">נחסך עד כה ({(progressPercentage).toFixed(1)}%)</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-white" />
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">חיסכון החודש ({selectedMonth})</p>
                <p className="font-bold text-lg">₪{monthlySavingsActual.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">מינימום נדרש (50%)</p>
                <p className="font-bold text-lg">₪{(income/2).toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">צפי הגעה</p>
                <p className="font-bold text-lg">יולי 2027</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">פעילות - {selectedMonth}</CardTitle>
              <div className="relative w-64">
                <Input 
                  placeholder="חפשו הערות או פריטים..." 
                  className="rounded-full h-9 text-sm pr-10 text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FileText className="absolute right-3 top-2 w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-white"
                      )}>
                        {t.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {t.category} {t.subcategory && `• ${t.subcategory}`} • {t.date}
                        </p>
                        {t.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{t.notes}"</p>}
                      </div>
                    </div>
                    <span className={cn(
                      "font-bold font-heading",
                      t.amount > 0 ? "text-emerald-600" : "text-foreground"
                    )}>
                      {t.amount > 0 ? "+" : ""}₪{Math.abs(t.amount).toLocaleString()}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground">
                    אין פעילות בחודש זה
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="font-heading text-lg">חוק ה-50%</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-3xl font-bold text-emerald-600 font-heading tracking-tight">{(savingsRate).toFixed(0)}%</p>
                <p className="text-xs font-semibold text-emerald-700/70 uppercase">שיעור חיסכון {selectedMonth}</p>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed text-right">
                <p className="font-semibold text-foreground mb-1">חישוב מהיום הראשון:</p>
                <p className="mb-2">נחסכו סה"כ ₪{currentSavingsTotal.toLocaleString()} מתוך ₪{goalAmount.toLocaleString()}.</p>
                <p className="font-semibold text-foreground mb-1">איך זה עובד:</p>
                אנחנו אוכפים <span className="text-emerald-600 font-bold">מינימום 50% חיסכון</span>. כל יתרה מההכנסה מופנית אוטומטית ליעד הדירה שלכם.
              </div>
              <Link href="/analytics" className="w-full">
                <Button variant="outline" className="w-full rounded-full text-xs h-9">צפייה באנליטיקה מלאה</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
