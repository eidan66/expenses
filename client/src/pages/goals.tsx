import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Home, Plane, Car, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeParseInt, formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Goal, type InsertGoal } from "@shared/schema";
import { Loader2 } from "lucide-react";
export default function Goals() {
  const { toast } = useToast();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery<Goal[]>({ 
    queryKey: ["/api/goals"] 
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: Omit<InsertGoal, "userId" | "id">) => {
      const res = await apiRequest("POST", "/api/goals", goal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "היעד נוצר בהצלחה" });
      setNewGoalTitle("");
      setNewGoalTarget("");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה ביצירת היעד" });
    }
  });

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    createGoalMutation.mutate({
      name: newGoalTitle,
      targetAmount: newGoalTarget,
      currentAmount: "0" // Initial amount is 0
    });
  };

  // Helper to get icon/color based on title helper (simple usage)
  const getGoalStyle = (title: string) => {
    if (title.includes("דירה") || title.includes("בית")) return { icon: Home, color: "text-emerald-500", bg: "bg-emerald-50" };
    if (title.includes("טיול") || title.includes("חופשה")) return { icon: Plane, color: "text-blue-500", bg: "bg-blue-50" };
    if (title.includes("רכב") || title.includes("מכונית")) return { icon: Car, color: "text-orange-500", bg: "bg-orange-50" };
    return { icon: Target, color: "text-primary", bg: "bg-primary/10" };
  };

  return (
    <Layout>
      <div className="space-y-8" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold whitespace-nowrap">יעדים פיננסיים</h1>
            <p className="text-sm sm:text-base text-muted-foreground">עקבו אחר ההתקדמות שלכם לעבר הדברים הגדולים.</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 ml-2" /> יעד חדש
                </Button>
              </DialogTrigger>
              <DialogContent className="text-right" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-heading font-bold">הוספת יעד חדש</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">שם היעד</Label>
                    <Input id="title" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} placeholder="לדוגמה: קרן השתלמות, חתונה..." className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">סכום יעד (₪)</Label>
                    <Input 
                      id="target" 
                      type="text" 
                      inputMode="numeric"
                      value={formatNumberWithCommas(newGoalTarget)} 
                      onChange={(e) => {
                        const cleaned = parseFormattedNumber(e.target.value);
                        setNewGoalTarget(cleaned);
                      }} 
                      placeholder="0" 
                      className="text-right" 
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">ביטול</Button>
                  <Button onClick={handleAddGoal} className="rounded-full" disabled={createGoalMutation.isPending}>
                    {createGoalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "הוספה"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : goals.length === 0 ? (
          <Card className="border-dashed border-2 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-background rounded-full shadow-sm">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">אין יעדים עדיין</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  זה הזמן להגדיר את החלום הבא שלכם ולהתחיל לחסוך אליו.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            {goals.map((goal) => {
              const { icon: Icon, color, bg } = getGoalStyle(goal.name);
              const target = safeParseInt(goal.target_amount || goal.targetAmount);
              const current = safeParseInt(goal.current_amount || goal.currentAmount);
              const progress = target > 0 ? (current / target) * 100 : 0;

              return (
                <Card key={goal.id} className="border-none shadow-sm group hover:shadow-md transition-all">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">יעד: ₪{target.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>התקדמות</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} />
                      <div className="flex justify-between items-center mt-1">
                         <p className="text-sm text-muted-foreground">
                          ₪{current.toLocaleString()} נחסכו
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full">עדכון ידני</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
