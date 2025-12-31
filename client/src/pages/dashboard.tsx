import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Home, Wallet } from "lucide-react";
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
import { useState } from "react";

export default function Dashboard() {
  const goalAmount = 600000;
  const currentSavings = 145000;
  const progressPercentage = (currentSavings / goalAmount) * 100;
  
  const [transactions, setTransactions] = useState([
    { id: 1, title: "Supermarket", amount: -450, category: "Needs", date: "Today" },
    { id: 2, title: "Salary Deposit", amount: 12000, category: "Income", date: "Yesterday" },
    { id: 3, title: "Cinema", amount: -80, category: "Wants", date: "Yesterday" },
    { id: 4, title: "Electric Bill", amount: -320, category: "Needs", date: "2 days ago" },
  ]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Welcome back, Sarah & Tom</h1>
            <p className="text-muted-foreground">You're making great progress on your home goal.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="e.g. Weekly Groceries" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (NIS)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needs">Need (50%)</SelectItem>
                      <SelectItem value="wants">Want (30%)</SelectItem>
                      <SelectItem value="savings">Saving (20%)</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full mt-4 rounded-full">Save Transaction</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg opacity-90">Dream Home Fund</h3>
                  <p className="text-sm opacity-75">Target: ₪{goalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-heading">₪{currentSavings.toLocaleString()}</span>
                <p className="text-sm opacity-75">Saved so far</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium opacity-90">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-white" />
            </div>

            <div className="mt-6 flex gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1">
                <p className="text-xs opacity-75">Monthly Target</p>
                <p className="font-semibold">₪4,000</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1">
                <p className="text-xs opacity-75">Est. Completion</p>
                <p className="font-semibold">Aug 2028</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Monthly Budget (50/30/20)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between">
              <div className="w-full sm:w-1/2">
                <BudgetPieChart />
              </div>
              <div className="w-full sm:w-1/2 space-y-4 p-4">
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                    <span className="font-medium">Needs</span>
                  </div>
                  <span className="font-bold">₪10,000</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                    <span className="font-medium">Wants</span>
                  </div>
                  <span className="font-bold">₪6,000</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                    <span className="font-medium">Savings</span>
                  </div>
                  <span className="font-bold text-primary">₪4,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="font-heading">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        t.amount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {t.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-semibold text-sm",
                      t.amount > 0 ? "text-primary" : "text-foreground"
                    )}>
                      {t.amount > 0 ? "+" : ""}₪{Math.abs(t.amount)}
                    </span>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">View All</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-none shadow-sm bg-accent/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-background rounded-full shadow-sm">
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-accent-foreground">Spending Insight</h4>
                  <p className="text-sm text-muted-foreground">You spent 15% less on dining out this week compared to last month. Great job!</p>
                </div>
              </CardContent>
           </Card>
           
           <Card className="border-none shadow-sm bg-secondary/20">
              <CardContent className="p-6 flex items-center gap-4">
                 <div className="p-3 bg-background rounded-full shadow-sm">
                  <Wallet className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-secondary-foreground">Savings Tip</h4>
                  <p className="text-sm text-muted-foreground">Automate your transfer of ₪4,000 to your savings account to never miss a goal.</p>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
