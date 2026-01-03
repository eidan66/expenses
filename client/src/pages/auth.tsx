import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "ברוכים השבים!",
          description: "התחברתם בהצלחה ל-NestEgg.",
        });
        setLocation("/dashboard");
      } else {
        await signUp(email, password);
        toast({
          title: "החשבון נוצר!",
          description: "נשלח אליכם מייל לאימות. אנא אמתו את החשבון.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "התחברות נכשלה" : "הרשמה נכשלה",
        description: error.message || "אירעה שגיאה, נסו שוב.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <Link href="/">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold font-heading mx-auto text-xl mb-4 cursor-pointer hover:scale-105 transition-transform">
              N
            </div>
          </Link>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            {isLogin ? "ברוכים השבים" : "יצירת חשבון חדש"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? "התחילו לנהל את חיסכון הדירה המשותף שלכם." 
              : "הצטרפו ל-NestEgg והגיעו ליעד הדירה שלכם."}
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-right">
            <CardTitle className="text-xl font-heading">
              {isLogin ? "התחברות" : "הרשמה"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "הזינו את הפרטים כדי להיכנס לחשבון" 
                : "מלאו את הפרטים כדי להתחיל"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-right">אימייל</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="test@example.com" 
                  required 
                  className="h-11 text-right"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">סיסמה</Label>
                  {isLogin && (
                    <Button variant="link" className="px-0 h-auto text-xs text-primary font-medium">
                      שכחת סיסמה?
                    </Button>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-11 text-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-full font-semibold" disabled={isLoading}>
                {isLoading ? "אנא המתינו..." : (isLogin ? "התחברות" : "יצירת חשבון")}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">או המשך באמצעות</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 rounded-full font-medium flex items-center justify-center gap-2"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-bold text-primary" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "הרשמה" : "התחברות"}
              </Button>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground px-8">
          בלחיצה על המשך, אתם מסכימים ל
          <span className="underline cursor-pointer px-1">תנאי השירות</span> ו
          <span className="underline cursor-pointer px-1">מדיניות הפרטיות</span> שלנו.
        </p>
      </div>
    </div>
  );
}
