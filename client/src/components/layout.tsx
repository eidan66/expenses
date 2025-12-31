import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, PieChart, Target, User, Menu, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "סקירה כללית", icon: Home },
    { href: "/budget", label: "תקציב", icon: PieChart },
    { href: "/goals", label: "יעדים", icon: Target },
    { href: "/analytics", label: "אנליטיקה", icon: BarChart2 },
    { href: "/profile", label: "פרופיל", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans" dir="rtl">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-heading">
            N
          </div>
          <span className="font-heading font-semibold text-lg">NestEgg</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                    location === item.href 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted"
                  )}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-l bg-card p-6 gap-8 sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-heading">
              N
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">NestEgg</span>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-right",
                  location === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", location === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          <div className="p-4 bg-secondary/30 rounded-xl border border-secondary text-right">
            <h4 className="font-heading font-semibold text-sm mb-1 text-secondary-foreground">טיפ מהיר</h4>
            <p className="text-xs text-muted-foreground">נסו את כלל ה-50/50 כדי למקסם את החיסכון שלכם החודש.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
