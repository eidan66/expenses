import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, User, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    type: "together", 
    goalAmount: "500000",
    goalDate: "",
    income: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLocation("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold font-heading mx-auto text-xl mb-4">
            N
          </div>
          <Progress value={progress} className="h-2 w-full bg-muted" />
          <p className="text-xs text-muted-foreground pt-2">שלב {step} מתוך {totalSteps}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 shadow-xl border-none bg-card/80 backdrop-blur-sm text-right">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-heading font-bold">איך אתם חוסכים?</h2>
                    <p className="text-muted-foreground">רוב האנשים חוסכים מהר יותר כשהם עושים זאת ביחד.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, type: "solo" })}
                      className={cn(
                        "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                        formData.type === "solo" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <User className="w-8 h-8" />
                      <span className="font-semibold">לבד</span>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, type: "together" })}
                      className={cn(
                        "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                        formData.type === "together" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Users className="w-8 h-8" />
                      <span className="font-semibold">ביחד</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-heading font-bold">מה היעד שלכם?</h2>
                    <p className="text-muted-foreground">קבעו יעד לבית החלומות שלכם.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="block text-right">סכום יעד (₪)</Label>
                      <div className="relative">
                        <Home className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pr-10 h-12 text-lg text-right" 
                          value={formData.goalAmount}
                          onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {["500000", "600000", "700000"].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setFormData({...formData, goalAmount: amt})}
                          className={cn(
                            "px-2 py-2 text-sm rounded-lg border transition-colors",
                            formData.goalAmount === amt 
                              ? "bg-secondary text-secondary-foreground border-secondary" 
                              : "hover:bg-muted"
                          )}
                        >
                          {(parseInt(amt)/1000)}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-heading font-bold">הכנסה חודשית</h2>
                    <p className="text-muted-foreground">נעזור לכם לחשב את קצב החיסכון הנדרש (מינימום 50%).</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="block text-right">סה"כ הכנסה חודשית (נטו)</Label>
                      <Input 
                        type="number" 
                        placeholder="לדוגמה: 20000"
                        className="h-12 text-lg text-right"
                        value={formData.income}
                        onChange={(e) => setFormData({...formData, income: e.target.value})}
                      />
                    </div>
                    
                    <div className="p-4 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                      <p>על פי כללי המערכת, לפחות 50% מהכנסה זו יופנו לחיסכון.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  disabled={step === 1}
                  className="text-muted-foreground"
                >
                   הקודם <ArrowRight className="mr-2 w-4 h-4" />
                </Button>
                <Button onClick={handleNext} className="rounded-full px-8">
                  {step === totalSteps ? "סיום" : "הבא"} <ArrowLeft className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
