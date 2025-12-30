import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import generatedImage from '@assets/generated_images/friendly_3d_illustration_of_a_couple_planning_finances.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-heading">
            N
          </div>
          <span className="font-heading font-bold text-xl">NestEgg</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex">Log In</Button>
          </Link>
          <Link href="/onboarding">
            <Button className="rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 lg:p-12 max-w-7xl mx-auto">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-heading font-bold leading-[1.1] tracking-tight text-foreground">
              Build your future home, <span className="text-primary">together.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              The simple way for couples to budget, save, and reach their dream home goal without the stress.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/onboarding">
              <Button size="lg" className="rounded-full px-8 text-lg h-14 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                Start Saving Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Smart 50/30/20 Budgeting</span>
            </div>
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Shared Couple Goals</span>
            </div>
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Visual Progress Tracking</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform rotate-12 scale-90 -z-10" />
          <img 
            src={generatedImage} 
            alt="Couple planning finances" 
            className="rounded-3xl shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </main>
    </div>
  );
}
