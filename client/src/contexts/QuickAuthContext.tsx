import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const QUICK_AUTH_STORAGE_KEY = "nestegg_quick_auth";
const QUICK_USERNAME = "idansapir9394";
const QUICK_PASSWORD = "20102025";

// Auto-login: set these in .env.local to skip login UI and sign in as this user by default
const AUTO_LOGIN_EMAIL = import.meta.env.VITE_SUPABASE_QUICK_AUTH_EMAIL as string | undefined;
const AUTO_LOGIN_PASSWORD = import.meta.env.VITE_SUPABASE_QUICK_AUTH_PASSWORD as string | undefined;

interface QuickAuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const QuickAuthContext = createContext<QuickAuthContextType | undefined>(undefined);

function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(QUICK_AUTH_STORAGE_KEY) === "1";
}

export function QuickAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setIsAuthenticated(true);
      // Ensure Supabase session exists (needed for RLS to return data)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session && AUTO_LOGIN_EMAIL && AUTO_LOGIN_PASSWORD) {
          supabase.auth.signInWithPassword({
            email: AUTO_LOGIN_EMAIL,
            password: AUTO_LOGIN_PASSWORD,
          });
        }
      });
      setAutoLoginAttempted(true);
      return;
    }

    // Auto-login: if env has email+password for default user, sign in and skip login UI
    if (AUTO_LOGIN_EMAIL && AUTO_LOGIN_PASSWORD) {
      supabase.auth
        .signInWithPassword({ email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD })
        .then(({ error }) => {
          if (!error) {
            localStorage.setItem(QUICK_AUTH_STORAGE_KEY, "1");
            setIsAuthenticated(true);
          }
        })
        .finally(() => setAutoLoginAttempted(true));
      return;
    }

    setAutoLoginAttempted(true);
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string): Promise<boolean> => {
    // Hardcoded QuickAuth (username only) — must also sign into Supabase so RLS returns data
    if (usernameOrEmail === QUICK_USERNAME && password === QUICK_PASSWORD) {
      const email = AUTO_LOGIN_EMAIL || `${QUICK_USERNAME}@gmail.com`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      localStorage.setItem(QUICK_AUTH_STORAGE_KEY, "1");
      setIsAuthenticated(true);
      return true;
    }
    // Supabase email/password (when input looks like email)
    if (usernameOrEmail.includes("@")) {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password,
      });
      if (!error) {
        localStorage.setItem(QUICK_AUTH_STORAGE_KEY, "1");
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(QUICK_AUTH_STORAGE_KEY);
    supabase.auth.signOut();
    setIsAuthenticated(false);
  }, []);

  return (
    <QuickAuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing: !autoLoginAttempted,
        login,
        logout,
      }}
    >
      {children}
    </QuickAuthContext.Provider>
  );
}

export function useQuickAuth() {
  const context = useContext(QuickAuthContext);
  if (!context) throw new Error("useQuickAuth must be used within QuickAuthProvider");
  return context;
}
