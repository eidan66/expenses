import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetPieChart } from "@/components/budget-chart";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Home, ShoppingBag, Utensils } from "lucide-react";

export default function Budget() {
  const categories = [
    { name: "Rent & Utilities", type: "Needs", budget: 6000, spent: 5800, icon: Home, color: "bg-blue-500" },
    { name: "Groceries", type: "Needs", budget: 3000, spent: 2400, icon: ShoppingBag, color: "bg-blue-400" },
    { name: "Dining Out", type: "Wants", budget: 2000, spent: 2150, icon: Utensils, color: "bg-orange-500" },
    { name: "Subscriptions", type: "Wants", budget: 500, spent: 480, icon: Coffee, color: "bg-orange-400" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold">Budget Plan</h1>
            <p className="text-muted-foreground">Manage your 50/30/20 allocation.</p>
          </div>
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm">
            <CardContent className="pt-6">
              <BudgetPieChart />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {categories.map((cat) => (
              <Card key={cat.name} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${cat.color} p-3 rounded-xl text-white`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{cat.name}</h4>
                      <p className="text-xs text-muted-foreground">{cat.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₪{cat.spent} <span className="text-xs font-normal text-muted-foreground">/ ₪{cat.budget}</span></p>
                    <div className="w-32 h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          cat.spent > cat.budget ? "bg-destructive" : "bg-primary"
                        )} 
                        style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                      />
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
