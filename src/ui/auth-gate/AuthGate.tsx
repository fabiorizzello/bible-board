import type { ReactNode } from "react";
import { PasskeyAuthBasicUI, useIsAuthenticated } from "jazz-react";

export function AuthGate({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <PasskeyAuthBasicUI appName="Bible Board">
        <div />
      </PasskeyAuthBasicUI>
    );
  }

  return <>{children}</>;
}
