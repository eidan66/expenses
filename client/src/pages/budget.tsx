import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetPieChart } from "@/components/budget-chart";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Home, ShoppingBag, Utensils, Heart, Shield, Shirt, Tv, Smartphone, Car, Bike, Train, Dog, ShoppingCart, Globe, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Budget() {
  const [income, setIncome] = useState(20000);
  const minSavingsRate = 0.5;
  const minSavingsAmount = income * minSavingsRate;

  const categories = [
    { 
      name: "חיסכון", 
      type: "Savings", 
      budget: 10000, 
      spent: 10000, 
      icon: Wallet, 
      color: "bg-emerald-500",
      items: ["יעדים ארוכי טווח", "קרן חירום"]
    },
    { 
      name: "דיור", 
      type: "Needs", 
      budget: 6000, 
      spent: 5800, 
      icon: Home, 
      color: "bg-blue-500",
      items: ["שכירות", "חשמל", "מים", "אינטרנט", "תמי 4"]
    },
    { 
      name: "בריאות וביטוח", 
      type: "Needs", 
      budget: 1500, 
      spent: 1400, 
      icon: Shield, 
      color: "bg-blue-400",
      items: ["שיניים", "ביטוח חיים", "ביטוח בריאות"]
    },
    { 
      name: "צריכה", 
      type: "Needs", 
      budget: 3000, 
      spent: 2400, 
      icon: ShoppingBag, 
      color: "bg-blue-300",
      items: ["אוכל", "טואלטיקה"]
    },
    { 
      name: "תחבורה", 
      type: "Needs", 
      budget: 2000, 
      spent: 1800, 
      icon: Car, 
      color: "bg-blue-200",
      items: ["דלק", "טסט", "ביטוח", "תחבורה ציבורית"]
    },
    { 
      name: "רצונות ודיגיטל", 
      type: "Wants", 
      budget: 2500, 
      spent: 2800, 
      icon: ShoppingCart, 
      color: "bg-orange-400",
      items: ["קניות אונליין", "נטפליקס", "ChatGPT", "ביגוד"]
    }
  ];

  const totalBudgetedSavings = categories.find(c => c.type === "Savings")?.budget || 0;
  const currentSavingsRate = totalBudgetedSavings / income;
  const isRateValid = currentSavingsRate >= minSavingsRate;

  return (
    <Layout>
      <div className="space-y-8" dir="rtl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">ניהול תקציב</h1>
            <p className="text-muted-foreground">מבטיחים לפחות 50% חיסכון עבור הבית שלכם.</p>
          </div>
          <div className="flex gap-4">
             <div className={cn(
               "px-4 py-2 rounded-full font-bold flex items-center gap-2",
               isRateValid ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive"
             )}>
               שיעור חיסכון: {(currentSavingsRate * 100).toFixed(0)}%
               {!isRateValid && <AlertCircle className="w-4 h-4" />}
             </div>
             <Button className="rounded-full">
               <Plus className="w-4 h-4 mr-2" /> הוספת קטגוריה
             </Button>
          </div>
        </div>

        {!isRateValid && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p><strong>אזהרה:</strong> שיעור החיסכון הנוכחי נמוך מהמינימום של 50%. מומלץ לצמצם הוצאות בקטגוריית "רצונות" כדי לעמוד ביעד.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm bg-card h-fit lg:sticky lg:top-8">
            <CardContent className="pt-6">
              <BudgetPieChart dataOverride={[
                { category: "Savings", amount: totalBudgetedSavings, fill: "var(--color-chart-1)" },
                { category: "Needs", amount: income * 0.35, fill: "var(--color-chart-2)" },
                { category: "Wants", amount: income * 0.15, fill: "var(--color-chart-3)" },
              ]} />
              
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-right">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">חיסכון נדרש (50%)</p>
                  <p className="text-2xl font-bold text-emerald-700">₪{minSavingsAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl text-right">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">הכנסה חודשית נטו</p>
                  <p className="text-2xl font-bold">₪{income.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {categories.map((cat) => (
              <Card key={cat.name} className={cn(
                "border-none shadow-sm overflow-hidden transition-all text-right",
                cat.type === "Savings" && "ring-2 ring-emerald-500 ring-offset-2"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(cat.color, "p-3 rounded-xl text-white shadow-lg")}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-lg">{cat.name}</h4>
                        <p className="text-xs text-muted-foreground">הקצאת {cat.type === "Savings" ? "חיסכון" : cat.type === "Needs" ? "צרכים" : "רצונות"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₪{cat.spent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">מתוך תקציב של ₪{cat.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", cat.spent > cat.budget ? "bg-destructive" : cat.color)}
                          style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {cat.items.map(item => (
                        <span key={item} className="text-[10px] px-2 py-1 bg-muted rounded-full text-muted-foreground font-medium">
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
