import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface AuthState {
  /** The authenticated user's name, or null if unauthenticated */
  nome: string | null;
  /** Log in with a display name */
  login: (nome: string) => void;
  /** Log out and clear auth state */
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [nome, setNome] = useState<string | null>(null);

  const login = useCallback((n: string) => {
    setNome(n);
  }, []);

  const logout = useCallback(() => {
    setNome(null);
  }, []);

  return (
    <AuthContext value={{ nome, login, logout }}>
      {children}
    </AuthContext>
  );
}

/**
 * Access auth state and actions.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
