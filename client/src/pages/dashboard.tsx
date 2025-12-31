import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Home, Wallet, AlertCircle, FileText } from "lucide-react";
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

const CATEGORIES = {
  Housing: ["Rent", "Home Insurance", "HOA", "Property Tax", "Electricity", "Water", "Gas", "Internet", "Tami 4", "Other"],
  Health: ["General Medicine", "Dental", "Other"],
  Insurance: ["Health Insurance", "Life Insurance", "Other"],
  Consumables: ["Food", "Toiletries/Hygiene"],
  "Clothing & Footwear": ["Clothing & Footwear"],
  "Regular Bills": ["Pay TV", "Netflix", "Disney+", "Surveillance Cameras", "Other"],
  Communication: ["Mobile Phone"],
  "Transportation (Car)": ["Insurance", "Registration", "Fuel", "Maintenance", "Parking", "Other"],
  "Transportation (Motorcycle)": ["Insurance", "Registration", "Fuel", "Maintenance", "Parking", "Other"],
  "Public Transportation": ["Bus/Train", "Taxi", "Other"],
  Pets: ["Daisy Expenses", "Fish Expenses"],
  "Online Shopping": ["Temu", "Shein", "AliExpress", "Other"],
  "Digital Services": ["ChatGPT/GPT", "Cursor", "Online Apps", "Google Drive", "Other"],
  Miscellaneous: ["Cash", "Other"],
  Savings: ["Long-term Goal", "Emergency Fund"]
};

export default function Dashboard() {
  const income = 24000;
  const goalAmount = 600000;
  const currentSavings = 145000;
  const monthlySavings = 13000; 
  const savingsRate = (monthlySavings / income) * 100;
  const progressPercentage = (currentSavings / goalAmount) * 100;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [transactions] = useState([
    { id: 1, title: "Supermarket", amount: -450, category: "Consumables", subcategory: "Food", date: "Today", notes: "Weekly shopping at Shufersal" },
    { id: 2, title: "Salary Deposit", amount: 24000, category: "Income", subcategory: "Monthly", date: "Yesterday", notes: "" },
    { id: 3, title: "Netflix", amount: -60, category: "Regular Bills", subcategory: "Netflix", date: "Yesterday", notes: "Premium subscription" },
    { id: 4, title: "Electric Bill", amount: -320, category: "Housing", subcategory: "Electricity", date: "2 days ago", notes: "High usage due to AC" },
    { id: 5, title: "Daisy Grooming", amount: -150, category: "Pets", subcategory: "Daisy Expenses", date: "3 days ago", notes: "Monthly haircut for Daisy" },
  ]);

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Welcome back, Sarah & Tom</h1>
            <p className="text-muted-foreground">You're maintaining a healthy {(savingsRate).toFixed(0)}% savings rate.</p>
          </div>
          
          <div className="flex gap-3">
            <div className={cn(
              "px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm border",
              savingsRate >= 50 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              Rate: {savingsRate.toFixed(0)}%
              {savingsRate < 50 && <AlertCircle className="w-4 h-4" />}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-heading">New Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="e.g. Weekly Groceries" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (NIS)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(CATEGORIES).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCategory && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label>Subcategory</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES[selectedCategory as keyof typeof CATEGORIES].map(sub => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes (Searchable)</Label>
                    <Textarea placeholder="Add details, tags, or reminders..." className="resize-none h-20" />
                  </div>
                  <Button className="w-full mt-4 rounded-full h-12 text-lg">Record Transaction</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                  <h3 className="font-heading font-semibold text-lg opacity-90">Dream Home Goal</h3>
                  <p className="text-sm opacity-75">Target: ₪{goalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-heading">₪{currentSavings.toLocaleString()}</span>
                <p className="text-sm opacity-75">Saved ({(progressPercentage).toFixed(1)}%)</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-white" />
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">Monthly Savings</p>
                <p className="font-bold text-lg">₪{monthlySavings.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">Min. Req (50%)</p>
                <p className="font-bold text-lg">₪{(income/2).toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-xs opacity-75">Est. Arrival</p>
                <p className="font-bold text-lg">July 2027</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading">Activity & Search</CardTitle>
              <div className="relative w-64">
                <Input 
                  placeholder="Search notes or items..." 
                  className="rounded-full h-9 text-sm pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FileText className="absolute right-3 top-2 w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-white"
                      )}>
                        {t.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="font-heading">Savings Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-3xl font-bold text-emerald-600 font-heading tracking-tight">{(savingsRate).toFixed(0)}%</p>
                <p className="text-xs font-semibold text-emerald-700/70 uppercase">Current Savings Rate</p>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">How it works:</p>
                NestEgg enforces a <span className="text-emerald-600 font-bold">50% minimum savings rule</span>. Any income left after fixed needs is automatically suggested for your home fund.
              </div>
              <Button variant="outline" className="w-full rounded-full text-xs h-9">Configure Rule</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
