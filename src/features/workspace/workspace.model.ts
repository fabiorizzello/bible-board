import type { BoardId, WorkspaceId } from "@/features/shared/newtypes";

export interface TagRegistration {
  readonly tag: string;
  readonly colore?: string;
  readonly elementoDescrittivoId?: string;
}

export interface Workspace {
  readonly id: WorkspaceId;
  readonly nome: string;
  readonly descrizione?: string;
  readonly boardIds: readonly BoardId[];
  readonly tagRegistry: readonly TagRegistration[];
  readonly createdAt: string;
}
