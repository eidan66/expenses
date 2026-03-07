import { useQuickAuth } from "@/contexts/QuickAuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useQuickAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isInitializing, setLocation]);

  if (isInitializing || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
