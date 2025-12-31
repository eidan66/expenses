import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Home, Plane, Car, Plus } from "lucide-react";

export default function Goals() {
  const goals = [
    { title: "Apartment Downpayment", target: 600000, current: 145000, icon: Home, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Europe Trip", target: 25000, current: 12000, icon: Plane, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "New Car", target: 120000, current: 30000, icon: Car, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">Track your progress towards the big things.</p>
          </div>
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> New Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.title} className="border-none shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${goal.bg}`}>
                    <goal.icon className={`w-6 h-6 ${goal.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">₪{goal.target.toLocaleString()} Target</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{((goal.current / goal.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} />
                  <p className="text-sm text-right text-muted-foreground">
                    ₪{goal.current.toLocaleString()} saved
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
