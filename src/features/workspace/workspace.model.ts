import type { BoardId, WorkspaceId } from "@/features/shared/newtypes";

export type TipoAzione = "creazione" | "modifica" | "eliminazione" | "link" | "rollback";

export interface RollbackPayload {
  readonly descrizione: string;
  readonly datiPrecedenti?: Record<string, unknown>;
}

export interface Azione {
  readonly id: string;
  readonly timestamp: string;
  readonly autoreId: string;
  readonly tipo: TipoAzione;
  readonly payload: RollbackPayload;
  readonly targetId?: string;
  readonly compensatedBy?: string;
}

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
