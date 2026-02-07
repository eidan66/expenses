import { createContext, useContext, useCallback, useState, useEffect } from "react";

const QUICK_AUTH_STORAGE_KEY = "nestegg_quick_auth";
const QUICK_USERNAME = "idansapir9394";
const QUICK_PASSWORD = "20102025";

interface QuickAuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const QuickAuthContext = createContext<QuickAuthContextType | undefined>(undefined);

function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(QUICK_AUTH_STORAGE_KEY) === "1";
}

export function QuickAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(getStoredAuth());
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === QUICK_USERNAME && password === QUICK_PASSWORD) {
      localStorage.setItem(QUICK_AUTH_STORAGE_KEY, "1");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(QUICK_AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <QuickAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </QuickAuthContext.Provider>
  );
}

export function useQuickAuth() {
  const context = useContext(QuickAuthContext);
  if (!context) throw new Error("useQuickAuth must be used within QuickAuthProvider");
  return context;
}
