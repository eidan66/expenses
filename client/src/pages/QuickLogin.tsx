import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuickAuth } from "@/contexts/QuickAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useQuickAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (login(username, password)) {
        toast({
          title: "ברוכים השבים!",
          description: "התחברתם בהצלחה.",
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: "התחברות נכשלה",
          description: "שם משתמש או סיסמה שגויים.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold font-heading mx-auto text-xl">
            N
          </div>
          <h1 className="text-2xl font-heading font-bold mt-4">NestEgg</h1>
          <p className="text-sm text-muted-foreground mt-1">התחברות</p>
        </div>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg">התחברות</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">שם משתמש</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="שם משתמש"
                  className="text-right"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  className="text-right"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
