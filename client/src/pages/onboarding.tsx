import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, User, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    type: "together", // together | solo
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold font-heading mx-auto text-xl mb-4">
            N
          </div>
          <Progress value={progress} className="h-2 w-full bg-muted" />
          <p className="text-xs text-muted-foreground pt-2">Step {step} of {totalSteps}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 shadow-xl border-none bg-card/80 backdrop-blur-sm">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-heading font-bold">How are you saving?</h2>
                    <p className="text-muted-foreground">Most people save faster when they do it together.</p>
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
                      <span className="font-semibold">Solo</span>
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
                      <span className="font-semibold">Together</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-heading font-bold">What's your goal?</h2>
                    <p className="text-muted-foreground">Set a target for your dream home.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Target Amount (NIS)</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pl-10 h-12 text-lg" 
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
                    <h2 className="text-2xl font-heading font-bold">Monthly Income</h2>
                    <p className="text-muted-foreground">We'll help you calculate your 50/30/20 split.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Total Monthly Income (Net)</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 20000"
                        className="h-12 text-lg"
                        value={formData.income}
                        onChange={(e) => setFormData({...formData, income: e.target.value})}
                      />
                    </div>
                    
                    <div className="p-4 bg-secondary/20 rounded-lg text-sm text-secondary-foreground">
                      <p>Based on the 50/30/20 rule, we'll recommend saving 20% of this amount.</p>
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
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={handleNext} className="rounded-full px-8">
                  {step === totalSteps ? "Finish" : "Next"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
