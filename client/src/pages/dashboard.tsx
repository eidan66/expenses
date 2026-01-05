import Layout from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Home, Wallet, AlertCircle, FileText, Calendar, Pencil, Trash2 } from "lucide-react";
import { BudgetPieChart } from "@/components/budget-chart";
import { cn, safeParseFloat, safeParseInt } from "@/lib/utils";
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

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { type Transaction, type InsertTransaction, type Goal, type InsertGoal } from "@shared/schema";
import { getTransactions, createTransaction, getGoals, createGoal, updateTransaction, deleteTransaction, updateGoal, deleteGoal } from "@/lib/supabaseQueries";

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
  "בילויים ופנאי": [],
  שונות: ["מזומן", "אחר"],
  חיסכון: ["יעד ארוך טווח", "קרן חירום"],
  הכנסה: ["הכנסות עידן", "הכנסות ספיר", "הכנסות אחר"]
};

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const currentDate = new Date();
const currentMonthIndex = currentDate.getMonth();
const currentYearStr = currentDate.getFullYear().toString();
const currentMonthName = MONTHS[currentMonthIndex];

 export default function Dashboard() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editTransactionDialogOpen, setEditTransactionDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: ""
  });
  
  // Create a default goal for now if not exists, or fetch goals
  const { data: goals = [] } = useQuery<Goal[]>({ 
    queryKey: ['goals'],
    queryFn: getGoals
  });
  
  // Use the first goal or null
  const mainGoal = goals[0] || null;
  const goalAmount = mainGoal ? safeParseInt(mainGoal.target_amount || mainGoal.targetAmount) : 0;
  const currentSavingsTotal = mainGoal ? safeParseInt(mainGoal.current_amount || mainGoal.currentAmount) : 0;

  const { data: transactions = [] } = useQuery<Transaction[]>({ 
    queryKey: ['transactions'],
    queryFn: getTransactions
  });

  // Calculate financial metrics
  const calculateFinancials = () => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavingsTransfers = 0;
    
    transactions.forEach(t => {
      if (t.month !== selectedMonth || t.year !== selectedYear) return;
      
      const amount = safeParseFloat(t.amount);
      
      if (t.category === "הכנסה") {
        // Income (salary, etc.) - positive amounts
        totalIncome += amount;
      } else if (t.category === "חיסכון") {
        // Explicit savings transfers - these are stored as negative (money leaving liquid funds)
        // But we want to track them as positive contribution to goal
        totalSavingsTransfers += Math.abs(amount);
      } else if (amount < 0) {
        // Regular expenses - negative amounts
        totalExpenses += Math.abs(amount);
      }
    });
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      savingsTransfers: totalSavingsTransfers,
      netSavings: totalIncome - totalExpenses, // Available to save (not yet transferred)
    };
  };
  
  const financials = calculateFinancials();
  const savingsRate = financials.income > 0 ? (financials.netSavings / financials.income) * 100 : 0;
  
  // Calculate total savings towards goal (only explicit savings transfers, not just leftover money)
  const calculateGoalProgress = () => {
    let totalTransferredToGoal = 0;
    
    transactions.forEach(t => {
      if (t.category === "חיסכון") {
        totalTransferredToGoal += Math.abs(safeParseFloat(t.amount));
      }
    });
    
    return totalTransferredToGoal;
  };
  
  const totalSavingsTowardsGoal = calculateGoalProgress();
  const progressPercentage = goalAmount > 0 ? (totalSavingsTowardsGoal / goalAmount) * 100 : 0;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const [newTx, setNewTx] = useState({
    title: "",
    amount: "",
    category: "",
    subcategory: "",
    notes: "",
    month: currentMonthName,
    year: currentYearStr
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "העסקה נוספה",
        description: "העסקה תועדה בהצלחה במערכת"
      });
      setOpen(false);
      setNewTx({ title: "", amount: "", category: "", subcategory: "", notes: "", month: currentMonthName, year: currentYearStr });
      setSelectedCategory("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת העסקה"
      });
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "היעד נוצר בהצלחה",
        description: "היעד החדש שלכם נשמר במערכת"
      });
      setGoalDialogOpen(false);
      setNewGoal({ name: "", targetAmount: "" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת היעד"
      });
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertTransaction> }) => 
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: "העסקה עודכנה", description: "השינויים נשמרו בהצלחה" });
      setEditTransactionDialogOpen(false);
      setEditingTransaction(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון העסקה"
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: "העסקה נמחקה", description: "העסקה הוסרה מהמערכת" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת העסקה"
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertGoal> }) => 
      updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: "היעד עודכן", description: "השינויים נשמרו בהצלחה" });
      setEditGoalDialogOpen(false);
      setEditingGoal(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון היעד"
      });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: "היעד נמחק", description: "היעד הוסר מהמערכת" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת היעד"
      });
    }
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

    const val = safeParseFloat(newTx.amount);
    const finalAmount = newTx.category === "הכנסה" ? Math.abs(val) : -Math.abs(val);

    createTransactionMutation.mutate({
      title: newTx.title,
      amount: finalAmount.toString(),
      category: newTx.category,
      subcategory: newTx.subcategory || null,
      date: new Date().toLocaleDateString('he-IL'), // Store real date string
      month: newTx.month,
      year: newTx.year,
      notes: newTx.notes || null
    });
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלאו את כל שדות החובה"
      });
      return;
    }

    createGoalMutation.mutate({
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: "0"
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.notes || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.subcategory || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = t.month === selectedMonth;
    const matchesYear = t.year === selectedYear; // New filter
    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <Layout>
      <div className="space-y-8" dir="rtl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground whitespace-nowrap">ברוכים השבים, עידן וספיר</h1>
              <p className="text-sm sm:text-base text-muted-foreground">אתם שומרים על קצב חיסכון בריא של {(savingsRate).toFixed(0)}%.</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-28 border-none bg-transparent focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {MONTHS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="w-[1px] h-4 bg-muted-foreground/20" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-20 border-none bg-transparent focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
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
                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 text-right mb-4">
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
                            {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.map(sub => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-right">
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
                    <div className="space-y-2">
                       <Label>שנה</Label>
                        <Select 
                          value={newTx.year}
                          onValueChange={(val) => setNewTx({...newTx, year: val})}
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent dir="rtl">
                            {YEARS.map(y => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                  </div>

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

            {/* Edit Transaction Dialog */}
            <Dialog open={editTransactionDialogOpen} onOpenChange={setEditTransactionDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center">ערוך עסקה</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>כותרת</Label>
                      <Input 
                        placeholder="לדוגמה: קניות בסופר" 
                        className="text-right"
                        value={editingTransaction?.title || ""}
                        onChange={(e) => setEditingTransaction(editingTransaction ? {...editingTransaction, title: e.target.value} : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>סכום (₪)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="text-right ltr-input"
                        value={editingTransaction?.amount || ""}
                        onChange={(e) => setEditingTransaction(editingTransaction ? {...editingTransaction, amount: e.target.value} : null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>קטגוריה</Label>
                    <Select 
                      value={editingTransaction?.category || ""}
                      onValueChange={(val) => {
                        setEditingTransaction(editingTransaction ? {...editingTransaction, category: val, subcategory: ""} : null);
                      }}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {Object.keys(CATEGORIES).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editingTransaction?.category && CATEGORIES[editingTransaction.category as keyof typeof CATEGORIES].length > 0 && (
                    <div className="space-y-2">
                      <Label>תת-קטגוריה</Label>
                      <Select 
                        value={editingTransaction?.subcategory || ""}
                        onValueChange={(val) => setEditingTransaction(editingTransaction ? {...editingTransaction, subcategory: val} : null)}
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="בחרו תת-קטגוריה" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {CATEGORIES[editingTransaction.category as keyof typeof CATEGORIES].map((sub: string) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>חודש</Label>
                      <Select 
                        value={editingTransaction?.month || ""}
                        onValueChange={(val) => setEditingTransaction(editingTransaction ? {...editingTransaction, month: val} : null)}
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
                    <div className="space-y-2">
                      <Label>שנה</Label>
                      <Select 
                        value={editingTransaction?.year || ""}
                        onValueChange={(val) => setEditingTransaction(editingTransaction ? {...editingTransaction, year: val} : null)}
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {YEARS.map(y => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>הערות (אופציונלי)</Label>
                    <Textarea 
                      placeholder="הוסיפו פרטים, תגיות או תזכורות..." 
                      className="resize-none h-20 text-right" 
                      value={editingTransaction?.notes || ""}
                      onChange={(e) => setEditingTransaction(editingTransaction ? {...editingTransaction, notes: e.target.value} : null)}
                    />
                  </div>
                  <Button 
                    className="w-full mt-4 rounded-full h-12 text-lg" 
                    onClick={() => {
                      if (editingTransaction) {
                        updateTransactionMutation.mutate({
                          id: editingTransaction.id,
                          updates: {
                            title: editingTransaction.title,
                            amount: editingTransaction.amount,
                            category: editingTransaction.category,
                            subcategory: editingTransaction.subcategory,
                            date: editingTransaction.date,
                            month: editingTransaction.month,
                            year: editingTransaction.year,
                            notes: editingTransaction.notes
                          }
                        });
                      }
                    }}
                  >
                    שמור שינויים
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {mainGoal ? (
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <CardContent className="p-8 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg opacity-90">{mainGoal.name}</h3>
                    <p className="text-sm opacity-75">יעד סופי: ₪{goalAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-bold font-heading">₪{totalSavingsTowardsGoal.toLocaleString()}</span>
                    <p className="text-sm opacity-75">נחסך עד כה ({(progressPercentage).toFixed(1)}%)</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => { 
                        setEditingGoal(mainGoal); 
                        setEditGoalDialogOpen(true); 
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-white hover:bg-red-500/30"
                      onClick={() => {
                        if (confirm("האם אתה בטוח שברצונך למחוק יעד זה?")) {
                          deleteGoalMutation.mutate(mainGoal.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-white" />
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-xs opacity-75">הכנסות ({selectedMonth})</p>
                  <p className="font-bold text-lg">₪{financials.income.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-xs opacity-75">הוצאות ({selectedMonth})</p>
                  <p className="font-bold text-lg">₪{financials.expenses.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-xs opacity-75">נותר לחיסכון</p>
                  <p className="font-bold text-lg">₪{financials.netSavings.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-xs opacity-75">הועבר ליעד ({selectedMonth})</p>
                  <p className="font-bold text-lg text-emerald-300">₪{financials.savingsTransfers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 bg-background rounded-full shadow-sm">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">עדיין לא הוגדר יעד</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  הגדירו את המטרה הראשית שלכם (למשל: דירה) כדי להתחיל לעקוב אחר החיסכון.
                </p>
              </div>
              <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" /> הגדרת יעד חדש
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-right">יעד חדש</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 text-right">
                    <div className="space-y-2">
                      <Label>שם היעד</Label>
                      <Input 
                        placeholder="לדוגמה: דירה, טיול, רכב" 
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>סכום יעד (₪)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      />
                    </div>
                    <Button className="w-full mt-4 rounded-full h-12 text-lg" onClick={handleAddGoal}>
                      יצירת יעד
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Goal Dialog */}
              <Dialog open={editGoalDialogOpen} onOpenChange={setEditGoalDialogOpen}>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-center">ערוך יעד</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>שם היעד</Label>
                      <Input 
                        placeholder="לדוגמה: דירה ראשונה" 
                        className="text-right"
                        value={editingGoal?.name || ""}
                        onChange={(e) => setEditingGoal(editingGoal ? {...editingGoal, name: e.target.value} : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>סכום יעד (₪)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="text-right ltr-input"
                        value={editingGoal?.targetAmount || ""}
                        onChange={(e) => setEditingGoal(editingGoal ? {...editingGoal, targetAmount: e.target.value} : null)}
                      />
                    </div>
                    <Button 
                      className="w-full rounded-full h-12 text-lg" 
                      onClick={() => {
                        if (editingGoal && editingGoal.name && editingGoal.targetAmount) {
                          updateGoalMutation.mutate({
                            id: editingGoal.id,
                            updates: {
                              name: editingGoal.name,
                              targetAmount: editingGoal.targetAmount
                            }
                          });
                        }
                      }}
                    >
                      שמור שינויים
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
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
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        safeParseFloat(t.amount) > 0 ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-white"
                      )}>
                        {safeParseFloat(t.amount) > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="text-right flex-1">
                        <p className="font-bold text-sm text-foreground">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {t.category} {t.subcategory && `• ${t.subcategory}`} • {t.date}
                        </p>
                        {t.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{t.notes}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-bold font-heading",
                        safeParseFloat(t.amount) > 0 ? "text-emerald-600" : "text-foreground"
                      )}>
                        {safeParseFloat(t.amount) > 0 ? "+" : ""}₪{Math.abs(safeParseFloat(t.amount)).toLocaleString()}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => { 
                            setEditingTransaction(t); 
                            setEditTransactionDialogOpen(true); 
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("האם אתה בטוח שברצונך למחוק עסקה זו?")) {
                              deleteTransactionMutation.mutate(t.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
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
              <div className="text-xs text-muted-foreground leading-relaxed text-right space-y-2">
                <div>
                  <p className="font-semibold text-foreground mb-1">הכנסות החודש:</p>
                  <p>₪{financials.income.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">הוצאות החודש:</p>
                  <p>₪{financials.expenses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">נותר לחיסכון:</p>
                  <p className="text-emerald-600 font-bold">₪{financials.netSavings.toLocaleString()}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-foreground mb-1">סה"כ הועבר ליעד:</p>
                  <p className="mb-1">₪{totalSavingsTowardsGoal.toLocaleString()} מתוך ₪{goalAmount.toLocaleString()}</p>
                </div>
                <p className="pt-2 text-xs">
                  <span className="text-emerald-600 font-bold">טיפ:</span> העבירו את הכסף שנותר לחיסכון לקטגוריית "חיסכון" כדי לעדכן את היעד
                </p>
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
