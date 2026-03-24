import { useAccount } from "jazz-react";
import { TimelineBoardAccount } from "@/features/workspace/workspace.schema";
import { ensureWorkspaceExists } from "@/features/workspace/workspace.rules";

export function useWorkspaceAccount() {
  return useAccount(TimelineBoardAccount, {
    resolve: {
      root: {
        workspace: {
          tagRegistry: true,
          boardIds: true,
          elementi: true
        }
      },
      profile: true
    }
  });
}

export function useWorkspaceHomeState() {
  const account = useWorkspaceAccount();
  const workspaceResult = ensureWorkspaceExists(account.me?.root?.workspace);

  return {
    account,
    workspaceResult
  };
}
