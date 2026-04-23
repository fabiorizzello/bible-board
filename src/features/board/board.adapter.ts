import { useWorkspaceAccount } from "@/features/workspace/workspace.adapter";

/** Returns the list of board IDs stored in the workspace. */
export function useBoardIdList(): string[] {
  const account = useWorkspaceAccount();
  const workspace = account.me?.root?.workspace;
  if (!workspace?.boardIds) return [];
  return [...workspace.boardIds].filter(Boolean) as string[];
}
