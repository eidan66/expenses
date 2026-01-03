import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Home, Wallet, AlertCircle, ShoppingBag, Shield, ShoppingCart, Car, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BudgetPieChart } from "@/components/budget-chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useQuery } from "@tanstack/react-query";
import { type Transaction } from "@shared/schema";

export default function Budget() {
  const [income, setIncome] = useState(24000);
  
  const { data: transactions = [] } = useQuery<Transaction[]>({ 
    queryKey: ["/api/transactions"] 
  });

  // Calculate spending per category from real transactions
  const spendingByCategory = transactions.reduce((acc, t) => {
    const amount = Math.abs(parseFloat(t.amount));
    // Verify expense (negative) or income. Usually expenses are negative in Dashboard logic, or categorized by type.
    // Dashboard logic: "amount: -450". So we look for negative amounts for spending.
    if (parseFloat(t.amount) < 0) {
      acc[t.category] = (acc[t.category] || 0) + amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const minSavingsRate = 0.5;
  const minSavingsAmount = income * minSavingsRate;

  const [categories, setCategories] = useState([
    { name: "חיסכון", type: "Savings", budget: 12000, spent: 0, icon: Wallet, color: "bg-emerald-500", items: ["יעד ארוך טווח", "קרן חירום"] },
    { name: "דיור", type: "Needs", budget: 6500, spent: 0, icon: Home, color: "bg-blue-500", items: ["שכירות", "חשמל", "מים", "ארנונה", "תמי 4"] },
    { name: "בריאות וביטוח", type: "Needs", budget: 1200, spent: 0, icon: Shield, color: "bg-blue-400", items: ["שיניים", "ביטוח חיים", "ביטוח בריאות"] },
    { name: "צריכה", type: "Needs", budget: 2500, spent: 0, icon: ShoppingBag, color: "bg-blue-300", items: ["אוכל", "טואלטיקה"] },
    { name: "תחבורה", type: "Needs", budget: 1800, spent: 0, icon: Car, color: "bg-blue-200", items: ["דלק", "טסט", "ביטוח"] },
    { name: "רצונות ודיגיטל", type: "Wants", budget: 1500, spent: 0, icon: ShoppingCart, color: "bg-orange-400", items: ["קניות אונליין", "נטפליקס", "ChatGPT"] }
  ]);
  
  // Merge calculated spending into categories for display
  const displayCategories = categories.map(cat => ({
    ...cat,
    spent: spendingByCategory[cat.name] || 0
  }));

  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("Needs");
  const [newCatBudget, setNewCatBudget] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New states for the additional buttons
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [tempIncome, setTempIncome] = useState(income.toString());

  const [isSubCatDialogOpen, setIsSubCatDialogOpen] = useState(false);
  const [selectedParentCat, setSelectedParentCat] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");

  const handleUpdateIncome = () => {
    setIncome(Number(tempIncome));
    setIsIncomeDialogOpen(false);
  };

  const handleAddSubCategory = () => {
    if (!selectedParentCat || !newSubCatName) return;
    setCategories(prev => prev.map(cat => 
      cat.name === selectedParentCat 
        ? { ...cat, items: [...cat.items, newSubCatName] }
        : cat
    ));
    setNewSubCatName("");
    setIsSubCatDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCatName || !newCatBudget) return;
    
    const newCategory = {
      name: newCatName,
      type: newCatType,
      budget: Number(newCatBudget),
      spent: 0,
      icon: newCatType === "Savings" ? Wallet : newCatType === "Needs" ? Home : ShoppingCart,
      color: newCatType === "Savings" ? "bg-emerald-500" : newCatType === "Needs" ? "bg-blue-500" : "bg-orange-400",
      items: []
    };

    setCategories([...categories, newCategory]);
    setNewCatName("");
    setNewCatBudget("");
    setIsDialogOpen(false);
  };

  const totalBudgetedSavings = displayCategories.find(c => c.type === "Savings")?.budget || 0;
  const currentSavingsRate = (totalBudgetedSavings / income) * 100;
  const isRateValid = currentSavingsRate >= 50;

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold">ניהול תקציב</h1>
            <p className="text-muted-foreground">תכנון חודשי מול ביצוע בפועל</p>
          </div>
          <div className="flex gap-3">
             <div className={cn(
               "px-4 py-2 rounded-xl font-bold flex items-center gap-2 border",
               isRateValid ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-destructive/10 text-destructive border-destructive/20"
             )}>
               שיעור חיסכון: {currentSavingsRate.toFixed(0)}%
               {!isRateValid && <AlertCircle className="w-4 h-4" />}
             </div>
             
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
               <DialogTrigger asChild>
                 <Button className="rounded-full shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" />קטגוריה חדשה</Button>
               </DialogTrigger>
               <DialogContent className="text-right" dir="rtl">
                 <DialogHeader>
                   <DialogTitle className="text-xl font-heading font-bold">הוספת קטגוריה חדשה</DialogTitle>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label htmlFor="name">שם הקטגוריה</Label>
                     <Input id="name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="לדוגמה: בידור, השקעות..." className="text-right" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="type">סוג תקציב</Label>
                     <Select onValueChange={setNewCatType} defaultValue={newCatType}>
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
                     <Input id="budget" type="number" value={newCatBudget} onChange={(e) => setNewCatBudget(e.target.value)} placeholder="0" className="text-right" />
                   </div>
                 </div>
                 <DialogFooter className="gap-2 sm:gap-0">
                   <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">ביטול</Button>
                   <Button onClick={handleAddCategory} className="rounded-full">הוספה</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
        </div>

        {!isRateValid && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p><strong>אזהרה:</strong> שיעור החיסכון המתוכנן נמוך מ-50%. המערכת דורשת הקצאה של לפחות ₪{minSavingsAmount.toLocaleString()} לחיסכון.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <BudgetPieChart dataOverride={[
                  { category: "Savings", amount: totalBudgetedSavings, fill: "var(--color-chart-1)" },
                  { category: "Needs", amount: income * 0.3, fill: "var(--color-chart-2)" },
                  { category: "Wants", amount: income * 0.2, fill: "var(--color-chart-3)" },
                ]} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5">
              <CardHeader><CardTitle className="font-heading text-lg">סיכום חיסכון</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-sm text-muted-foreground">הכנסה נטו</span>
                  <span className="font-bold">₪{income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-sm text-emerald-700">מינימום חיסכון (50%)</span>
                  <span className="font-bold text-emerald-800">₪{minSavingsAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-sm text-muted-foreground">הקצאה בפועל</span>
                  <span className="font-bold text-primary">₪{totalBudgetedSavings.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
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
                    <div className="space-y-2">
                      <Label htmlFor="income-edit">הכנסה חודשית נטו (₪)</Label>
                      <Input 
                        id="income-edit" 
                        type="number" 
                        value={tempIncome} 
                        onChange={(e) => setTempIncome(e.target.value)} 
                        className="text-right" 
                      />
                      <p className="text-[10px] text-muted-foreground">עדכון ההכנסה ישפיע על חישוב ה-50% חיסכון שלך.</p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)} className="rounded-full">ביטול</Button>
                    <Button onClick={handleUpdateIncome} className="rounded-full">עדכון הכנסה</Button>
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
                          {displayCategories.map(c => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
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
                    <Button variant="outline" onClick={() => setIsSubCatDialogOpen(false)} className="rounded-full">ביטול</Button>
                    <Button onClick={handleAddSubCategory} className="rounded-full">הוספה</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {displayCategories.map((cat) => (
              <Card key={cat.name} className={cn(
                "border-none shadow-sm overflow-hidden text-right group transition-all hover:shadow-md",
                cat.type === "Savings" && "bg-emerald-50/20 ring-1 ring-emerald-500/20"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(cat.color, "p-2.5 rounded-xl text-white shadow-sm")}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold">{cat.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
                          {cat.type === "Savings" ? "חיסכון חובה" : cat.type === "Needs" ? "הוצאה חיונית" : "הוצאה גמישה"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₪{cat.spent.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">מתוך ₪{cat.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Progress value={(cat.spent / cat.budget) * 100} className="h-2" indicatorClassName={cat.spent > cat.budget ? "bg-destructive" : cat.color} />
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {cat.items.map(item => (
                        <span key={item} className="text-[9px] px-2 py-0.5 bg-white border rounded-full text-muted-foreground font-bold">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
