import type { ReactNode } from "react";
import { useAccount, useDemoAuth, useIsAuthenticated } from "jazz-react";
import { TimelineBoardAccount } from "@/features/workspace/workspace.schema";

export interface AuthState {
  /** The authenticated user's name, or null if unauthenticated */
  nome: string | null;
  /** Log in (or sign up) with a display name — async, backed by Jazz DemoAuth */
  login: (nome: string) => Promise<void>;
  /** Log out */
  logout: () => void;
}

/**
 * No-op wrapper kept for component tree compatibility.
 * Auth state is provided by JazzProvider (in main.tsx).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Access auth state and actions.
 * Must be used within a JazzProvider.
 */
export function useAuth(): AuthState {
  const { logIn, signUp, existingUsers } = useDemoAuth();
  const { me, logOut } = useAccount(TimelineBoardAccount, {
    resolve: { profile: true }
  });
  const isAuthenticated = useIsAuthenticated();

  const nome = isAuthenticated ? (me?.profile?.name ?? null) : null;

  const login = async (username: string) => {
    const trimmed = username.trim();
    if (existingUsers.includes(trimmed)) {
      await logIn(trimmed);
    } else {
      await signUp(trimmed);
    }
  };

  return { nome, login, logout: logOut };
}
