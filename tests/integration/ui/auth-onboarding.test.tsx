import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthGate } from "@/ui/auth-gate/AuthGate";
import { WorkspaceHomePage } from "@/ui/workspace-home/WorkspaceHomePage";

const useIsAuthenticated = vi.fn();
const useAccount = vi.fn();

vi.mock("jazz-react", () => ({
  PasskeyAuthBasicUI: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="passkey-auth-ui">{children}</div>
  ),
  useIsAuthenticated: () => useIsAuthenticated(),
  useAccount: () => useAccount()
}));

describe("auth and onboarding", () => {
  afterEach(() => {
    useIsAuthenticated.mockReset();
    useAccount.mockReset();
  });

  it("shows the auth UI when the user is not authenticated", () => {
    useIsAuthenticated.mockReturnValue(false);

    render(
      <AuthGate>
        <div>contenuto protetto</div>
      </AuthGate>
    );

    expect(screen.getByTestId("passkey-auth-ui")).toBeInTheDocument();
    expect(screen.queryByText("contenuto protetto")).not.toBeInTheDocument();
  });

  it("shows the workspace onboarding state after authentication", () => {
    useIsAuthenticated.mockReturnValue(true);
    useAccount.mockReturnValue({
      me: {
        profile: { name: "Fabio" },
        root: {
          workspace: {
            nome: "Workspace Fabio",
            createdAt: "2026-03-23T00:00:00.000Z",
            boardIds: [],
            tagRegistry: [],
            elementi: []
          }
        }
      },
      logOut: vi.fn()
    });

    render(
      <MemoryRouter>
        <WorkspaceHomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Workspace Fabio")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crea il primo Elemento/i })
    ).toBeInTheDocument();
  });
});
