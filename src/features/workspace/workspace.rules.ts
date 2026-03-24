import { err, ok, type Result } from "@/features/shared/result";
import type { WorkspaceError } from "@/features/workspace/workspace.errors";

export interface InitialWorkspaceInput {
  readonly accountId: string;
  readonly preferredName?: string;
}

export interface WorkspaceRecordInput {
  readonly nome: string;
  readonly descrizione?: string;
  readonly createdAt: string;
  readonly boardIds: readonly string[];
  readonly tagRegistry: readonly {
    readonly tag: string;
    readonly colore?: string;
    readonly elementoDescrittivoId?: string;
  }[];
}

export function createInitialWorkspace(input: InitialWorkspaceInput): WorkspaceRecordInput {
  const fallbackName = `Workspace ${input.accountId.slice(0, 6)}`;

  return {
    nome: input.preferredName?.trim() || fallbackName,
    createdAt: new Date().toISOString(),
    boardIds: [],
    tagRegistry: []
  };
}

export function validateWorkspaceName(nome: string): Result<string, WorkspaceError> {
  const trimmed = nome.trim();

  if (!trimmed) {
    return err({ type: "workspace_name_empty" });
  }

  return ok(trimmed);
}

export function ensureWorkspaceExists<TWorkspace extends { nome: string } | null | undefined>(
  workspace: TWorkspace
): Result<NonNullable<TWorkspace>, WorkspaceError> {
  if (!workspace) {
    return err({ type: "workspace_missing" });
  }

  return validateWorkspaceName(workspace.nome).map(() => workspace);
}
