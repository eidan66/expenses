import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Home, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight, FileText, Download } from "lucide-react";
import { BudgetPieChart } from "@/components/budget-chart";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = {
  "הכנסות": ["הכנסות עידן", "הכנסות ספיר", "הכנסות אחר"],
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
  חיסכון: ["יעד ארוך טווח", "קרן חירום"]
};

export default function Dashboard() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [income, setIncome] = useState(24000);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Savings logic
  const minSavingsRate = 0.5;
  const minRequiredSavings = income * minSavingsRate;
  
  const [transactions, setTransactions] = useState([
    { id: 1, title: "סופרמרקט", amount: -450, category: "צריכה", subcategory: "אוכל", date: "היום", notes: "קניות שבועיות בשופרסל" },
    { id: 2, title: "הפקדת משכורת", amount: 24000, category: "הכנסות", subcategory: "הכנסות עידן", date: "אתמול", notes: "" },
    { id: 3, title: "נטפליקס", amount: -60, category: "חשבונות קבועים", subcategory: "נטפליקס", date: "אתמול", notes: "מנוי פרימיום" },
    { id: 4, title: "חשבון חשמל", amount: -320, category: "דיור", subcategory: "חשמל", date: "לפני יומיים", notes: "שימוש גבוה במזגן" },
    { id: 5, title: "טיפוח לדייזי", amount: -150, category: "חיות", subcategory: "הוצאות דייזי", date: "לפני 3 ימים", notes: "תספורת חודשית לדייזי" },
  ]);

  const actualSavings = 13000;
  const totalExpenses = transactions.filter(t => t.amount < 0 && t.category !== "חיסכון").reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const currentSavingsRate = (actualSavings / income) * 100;
  const monthlyBalance = income - totalExpenses - actualSavings;
  
  const goalAmount = 600000;
  const currentSavingsTotal = 145000;
  const progressPercentage = (currentSavingsTotal / goalAmount) * 100;

  const [newTx, setNewTx] = useState({ title: "", amount: "", category: "", subcategory: "", notes: "" });

  const handleAddTransaction = () => {
    if (!newTx.title || !newTx.amount || !newTx.category) {
      toast({ variant: "destructive", title: "שגיאה", description: "אנא מלאו את כל שדות החובה" });
      return;
    }
    const transaction = {
      id: transactions.length + 1,
      title: newTx.title,
      amount: newTx.category === "הכנסות" ? Math.abs(Number(newTx.amount)) : -Math.abs(Number(newTx.amount)),
      category: newTx.category,
      subcategory: newTx.subcategory,
      date: "היום",
      notes: newTx.notes
    };
    setTransactions([transaction, ...transactions]);
    setOpen(false);
    setNewTx({ title: "", amount: "", category: "", subcategory: "", notes: "" });
    toast({ title: "העסקה נוספה", description: "העסקה תועדה בהצלחה במערכת" });
  };

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">לוח בקרה</h1>
            <p className="text-muted-foreground">מעקב אחר ההכנסות, ההוצאות והחיסכון לבית שלכם</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg shadow-primary/20"><Plus className="ml-2 h-4 w-4" />הוספת עסקה</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader><DialogTitle className="font-heading text-right">עסקה חדשה</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4 text-right">
                  <div className="space-y-2">
                    <Label>תיאור</Label>
                    <Input placeholder="לדוגמה: שופרסל" value={newTx.title} onChange={(e)=>setNewTx({...newTx, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>סכום (₪)</Label>
                      <Input type="number" placeholder="0.00" value={newTx.amount} onChange={(e)=>setNewTx({...newTx, amount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>קטגוריה</Label>
                      <Select value={newTx.category} onValueChange={(val)=>setNewTx({...newTx, category: val, subcategory: ""})}>
                        <SelectTrigger className="text-right"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                        <SelectContent dir="rtl">
                          {Object.keys(CATEGORIES).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newTx.category && (
                    <div className="space-y-2">
                      <Label>תת-קטגוריה</Label>
                      <Select value={newTx.subcategory} onValueChange={(val)=>setNewTx({...newTx, subcategory: val})}>
                        <SelectTrigger className="text-right"><SelectValue placeholder="בחר תת-קטגוריה" /></SelectTrigger>
                        <SelectContent dir="rtl">
                          {CATEGORIES[newTx.category as keyof typeof CATEGORIES].map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>הערות (ניתן לחיפוש)</Label>
                    <Textarea className="text-right h-20" placeholder="..." value={newTx.notes} onChange={(e)=>setNewTx({...newTx, notes: e.target.value})} />
                  </div>
                  <Button className="w-full rounded-full h-12" onClick={handleAddTransaction}>שמירה</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="rounded-full"><Download className="ml-2 h-4 w-4" />ייצוא</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-blue-600 mb-1">סה"כ הכנסות</p>
              <h3 className="text-2xl font-bold">₪{income.toLocaleString()}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-orange-50/50">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-orange-600 mb-1">סה"כ הוצאות</p>
              <h3 className="text-2xl font-bold">₪{totalExpenses.toLocaleString()}</h3>
            </CardContent>
          </Card>
          <Card className={cn("border-none shadow-sm", currentSavingsRate >= 50 ? "bg-emerald-50/50" : "bg-destructive/5")}>
            <CardContent className="p-6">
              <p className={cn("text-sm font-medium mb-1", currentSavingsRate >= 50 ? "text-emerald-600" : "text-destructive")}>שיעור חיסכון (מינימום 50%)</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentSavingsRate.toFixed(0)}%</h3>
                {currentSavingsRate < 50 && <AlertCircle className="w-5 h-5 text-destructive" />}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary mb-1">יתרה חודשית</p>
              <h3 className="text-2xl font-bold">₪{monthlyBalance.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Main Goal Section */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><Home className="w-8 h-8" /></div>
                <div>
                  <h2 className="text-2xl font-bold font-heading">יעד לדירה: ₪{goalAmount/1000}K</h2>
                  <p className="opacity-90">צפי הגעה: יולי 2027 (מבוסס על קצב נוכחי)</p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-4xl font-bold font-heading">₪{currentSavingsTotal.toLocaleString()}</p>
                <p className="opacity-90">סה"כ נחסך ({progressPercentage.toFixed(1)}%)</p>
              </div>
            </div>
            <div className="mt-8 space-y-2 relative z-10">
              <Progress value={progressPercentage} className="h-3 bg-white/20" indicatorClassName="bg-white" />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-none shadow-sm">
            <CardHeader><CardTitle className="font-heading text-lg">פילוח תקציב</CardTitle></CardHeader>
            <CardContent>
              <BudgetPieChart dataOverride={[
                { category: "Savings", amount: actualSavings, fill: "var(--color-chart-1)" },
                { category: "Needs", amount: totalExpenses * 0.7, fill: "var(--color-chart-2)" },
                { category: "Wants", amount: totalExpenses * 0.3, fill: "var(--color-chart-3)" },
              ]} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
              <CardTitle className="font-heading text-lg">פעילות אחרונה</CardTitle>
              <div className="relative w-64">
                <Input 
                  placeholder="חיפוש הערות או פריטים..." 
                  className="rounded-full h-9 text-sm pr-10 text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FileText className="absolute right-3 top-2 w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-xl", t.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground")}>
                        {t.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{t.category} • {t.subcategory} • {t.date}</p>
                        {t.notes && <p className="text-xs text-muted-foreground mt-1 italic">💬 {t.notes}</p>}
                      </div>
                    </div>
                    <span className={cn("font-bold font-heading", t.amount > 0 ? "text-emerald-600" : "text-foreground")}>
                      {t.amount > 0 ? "+" : ""}₪{Math.abs(t.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
