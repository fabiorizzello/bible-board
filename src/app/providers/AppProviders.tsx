import type { ReactNode } from "react";
import { JazzProvider } from "jazz-react";
import { TimelineBoardAccount } from "@/features/workspace/workspace.schema";

const JAZZ_SYNC_PEER = "wss://cloud.jazz.tools/?key=bible-board";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <JazzProvider
      AccountSchema={TimelineBoardAccount}
      defaultProfileName="Nuovo utente"
      sync={{ peer: JAZZ_SYNC_PEER, when: "signedUp" }}
    >
      {children}
    </JazzProvider>
  );
}
