import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Home, ShoppingBag, Utensils, Heart, Shield, Shirt, Tv, Smartphone, Car, Bike, Train, Dog, ShoppingCart, Globe, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BudgetPieChart } from "@/components/budget-chart";

export default function Budget() {
  const [income, setIncome] = useState(20000);
  const minSavingsRate = 0.5;
  const minSavingsAmount = income * minSavingsRate;

  const categories = [
    { 
      name: "Savings", 
      type: "Savings", 
      budget: 10000, 
      spent: 10000, 
      icon: Wallet, 
      color: "bg-emerald-500",
      items: ["Long-term Goals", "Emergency Fund"]
    },
    { 
      name: "Housing", 
      type: "Needs", 
      budget: 6000, 
      spent: 5800, 
      icon: Home, 
      color: "bg-blue-500",
      items: ["Rent", "Electricity", "Water", "Internet", "Tami 4"]
    },
    { 
      name: "Health & Insurance", 
      type: "Needs", 
      budget: 1500, 
      spent: 1400, 
      icon: Shield, 
      color: "bg-blue-400",
      items: ["Dental", "Life Insurance", "Health Insurance"]
    },
    { 
      name: "Consumables", 
      type: "Needs", 
      budget: 3000, 
      spent: 2400, 
      icon: ShoppingBag, 
      color: "bg-blue-300",
      items: ["Food", "Toiletries"]
    },
    { 
      name: "Transportation", 
      type: "Needs", 
      budget: 2000, 
      spent: 1800, 
      icon: Car, 
      color: "bg-blue-200",
      items: ["Fuel", "Registration", "Insurance", "Public Transport"]
    },
    { 
      name: "Wants & Digital", 
      type: "Wants", 
      budget: 2500, 
      spent: 2800, 
      icon: ShoppingCart, 
      color: "bg-orange-400",
      items: ["Online Shopping", "Netflix", "ChatGPT", "Clothing"]
    }
  ];

  const totalBudgetedSavings = categories.find(c => c.name === "Savings")?.budget || 0;
  const currentSavingsRate = totalBudgetedSavings / income;
  const isRateValid = currentSavingsRate >= minSavingsRate;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Ensuring at least 50% savings rate for your home.</p>
          </div>
          <div className="flex gap-4">
             <div className={cn(
               "px-4 py-2 rounded-full font-bold flex items-center gap-2",
               isRateValid ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive"
             )}>
               Savings Rate: {(currentSavingsRate * 100).toFixed(0)}%
               {!isRateValid && <AlertCircle className="w-4 h-4" />}
             </div>
             <Button className="rounded-full">
               <Plus className="w-4 h-4 mr-2" /> Add Expense
             </Button>
          </div>
        </div>

        {!isRateValid && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p><strong>Warning:</strong> Your current savings rate is below the 50% minimum. Please reduce "Wants" or "Needs" to stay on track for your home goal.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm bg-card h-fit sticky top-8">
            <CardHeader>
              <CardTitle className="font-heading">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BudgetPieChart dataOverride={[
                { category: "Savings", amount: totalBudgetedSavings, fill: "var(--color-chart-1)" },
                { category: "Needs", amount: income * 0.35, fill: "var(--color-chart-2)" },
                { category: "Wants", amount: income * 0.15, fill: "var(--color-chart-3)" },
              ]} />
              
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Required Savings (50%)</p>
                  <p className="text-2xl font-bold text-emerald-700">₪{minSavingsAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Net Monthly Income</p>
                  <p className="text-2xl font-bold">₪{income.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {categories.map((cat) => (
              <Card key={cat.name} className={cn(
                "border-none shadow-sm overflow-hidden transition-all",
                cat.name === "Savings" && "ring-2 ring-emerald-500 ring-offset-2"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(cat.color, "p-3 rounded-xl text-white shadow-lg")}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-lg">{cat.name}</h4>
                        <p className="text-xs text-muted-foreground">{cat.type} Allocation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₪{cat.spent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">of ₪{cat.budget.toLocaleString()} budget</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Progress 
                      value={(cat.spent / cat.budget) * 100} 
                      className="h-2"
                      indicatorClassName={cat.spent > cat.budget ? "bg-destructive" : cat.color}
                    />
                    <div className="flex flex-wrap gap-2">
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
