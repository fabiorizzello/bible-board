import { Navigate } from "react-router";
import { useAuth } from "@/app/auth-context";

/**
 * Auth guard — redirects to /auth when unauthenticated.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  if (!nome) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

/**
 * Redirect authenticated users away from /auth.
 */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  if (nome) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
