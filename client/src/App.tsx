import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuickAuthProvider, useQuickAuth } from "@/contexts/QuickAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Budget from "@/pages/budget";
import Goals from "@/pages/goals";
import Profile from "@/pages/profile";
import Categories from "@/pages/categories";
import Analytics from "@/pages/analytics";
import QuickLogin from "@/pages/QuickLogin";

function HomePage() {
  const { isAuthenticated } = useQuickAuth();
  return isAuthenticated ? <Dashboard /> : <QuickLogin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={HomePage} />
      <Route path="/budget">
        <ProtectedRoute>
          <Budget />
        </ProtectedRoute>
      </Route>
      <Route path="/goals">
        <ProtectedRoute>
          <Goals />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/categories">
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QuickAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QuickAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
