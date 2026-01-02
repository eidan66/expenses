import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Home, Plane, Car, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Goals() {
  const [goals, setGoals] = useState([
    { title: "מקדמה לדירה", target: 600000, current: 145000, icon: Home, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "טיול לאירופה", target: 25000, current: 12000, icon: Plane, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "רכב חדש", target: 120000, current: 30000, icon: Car, color: "text-orange-500", bg: "bg-orange-50" },
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    const newGoal = {
      title: newGoalTitle,
      target: Number(newGoalTarget),
      current: 0,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10"
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setNewGoalTarget("");
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-8" dir="rtl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold">יעדים פיננסיים</h1>
            <p className="text-muted-foreground">עקבו אחר ההתקדמות שלכם לעבר הדברים הגדולים.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full">
              <Settings className="w-4 h-4 ml-2" /> הגדרות יעד דירה
            </Button>
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
                    <Input id="target" type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="0" className="text-right" />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">ביטול</Button>
                  <Button onClick={handleAddGoal} className="rounded-full">הוספה</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          {goals.map((goal) => (
            <Card key={goal.title} className="border-none shadow-sm group hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${goal.bg}`}>
                    <goal.icon className={`w-6 h-6 ${goal.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">יעד: ₪{goal.target.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>התקדמות</span>
                    <span>{((goal.current / goal.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} />
                  <div className="flex justify-between items-center mt-1">
                     <p className="text-sm text-muted-foreground">
                      ₪{goal.current.toLocaleString()} נחסכו
                    </p>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full">עדכון ידני</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
