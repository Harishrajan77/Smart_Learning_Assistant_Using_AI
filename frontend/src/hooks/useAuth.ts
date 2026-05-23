import { useState } from "react";
import { AuthSession, User } from "@/types";

const AUTH_KEY = "sla-auth-session";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? (JSON.parse(saved) as AuthSession) : null;
  });

  const isAuthenticated = !!session?.token;
  const user: User | null = session?.user ?? null;
  const token = session?.token ?? null;

  const login = (nextSession: AuthSession) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  };

  return { user, token, isAuthenticated, login, logout };
}
