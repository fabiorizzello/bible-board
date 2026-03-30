import { err, ok, type Result } from "neverthrow";
import type { WorkspaceError } from "@/features/workspace/workspace.errors";
import type { Azione, TagRegistration, TipoAzione } from "@/features/workspace/workspace.model";

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

// --- Tag Registry ---

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function findTagRegistration(
  registry: readonly TagRegistration[],
  tag: string
): TagRegistration | undefined {
  const needle = normalizeTag(tag);
  return registry.find((t) => normalizeTag(t.tag) === needle);
}

export function addTagToRegistry(
  registry: readonly TagRegistration[],
  tag: string
): Result<readonly TagRegistration[], WorkspaceError> {
  const trimmed = tag.trim();
  if (!trimmed) {
    return err({ type: "tag_vuoto" });
  }

  if (findTagRegistration(registry, trimmed)) {
    return err({ type: "tag_duplicato", tag: trimmed });
  }

  return ok([...registry, { tag: trimmed }]);
}

export function removeTagFromRegistry(
  registry: readonly TagRegistration[],
  tag: string
): Result<readonly TagRegistration[], WorkspaceError> {
  const needle = normalizeTag(tag);
  const index = registry.findIndex((t) => normalizeTag(t.tag) === needle);

  if (index === -1) {
    return err({ type: "tag_non_trovato", tag });
  }

  return ok([...registry.slice(0, index), ...registry.slice(index + 1)]);
}

export function updateTagRegistration(
  registry: readonly TagRegistration[],
  tag: string,
  updates: Partial<Pick<TagRegistration, "colore" | "elementoDescrittivoId">>
): Result<readonly TagRegistration[], WorkspaceError> {
  const needle = normalizeTag(tag);
  const index = registry.findIndex((t) => normalizeTag(t.tag) === needle);

  if (index === -1) {
    return err({ type: "tag_non_trovato", tag });
  }

  const updated = { ...registry[index], ...updates };
  return ok([...registry.slice(0, index), updated, ...registry.slice(index + 1)]);
}

export function ensureTagsInRegistry(
  registry: readonly TagRegistration[],
  tags: readonly string[]
): Result<readonly TagRegistration[], WorkspaceError> {
  const validTags = tags.map((t) => t.trim()).filter(Boolean);
  const newTags = validTags.filter((t) => !findTagRegistration(registry, t));

  if (newTags.length === 0) {
    return ok(registry);
  }

  const additions: TagRegistration[] = newTags.map((tag) => ({ tag }));
  return ok([...registry, ...additions]);
}

// --- Action Log ---

export interface RecordAzioneInput {
  readonly autoreId: string;
  readonly tipo: TipoAzione;
  readonly descrizione: string;
  readonly targetId?: string;
  readonly datiPrecedenti?: Record<string, unknown>;
}

export function recordAzione(
  log: readonly Azione[],
  input: RecordAzioneInput
): Result<readonly Azione[], WorkspaceError> {
  const nuovaAzione: Azione = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    autoreId: input.autoreId,
    tipo: input.tipo,
    payload: {
      descrizione: input.descrizione,
      ...(input.datiPrecedenti !== undefined ? { datiPrecedenti: input.datiPrecedenti } : {}),
    },
    ...(input.targetId !== undefined ? { targetId: input.targetId } : {}),
  };

  return ok([...log, nuovaAzione]);
}

export function findAzione(log: readonly Azione[], id: string): Azione | undefined {
  return log.find((a) => a.id === id);
}

export function canRollback(
  log: readonly Azione[],
  azioneId: string
): Result<Azione, WorkspaceError> {
  const azione = findAzione(log, azioneId);

  if (!azione) {
    return err({ type: "azione_non_trovata", id: azioneId });
  }

  if (azione.tipo === "rollback") {
    return err({ type: "rollback_non_sicuro", motivo: "Non si può fare rollback di un rollback" });
  }

  if (azione.compensatedBy !== undefined) {
    return err({ type: "rollback_non_sicuro", motivo: "L'azione è già stata compensata" });
  }

  return ok(azione);
}

export function rollbackAzione(
  log: readonly Azione[],
  azioneId: string,
  autoreId: string
): Result<readonly Azione[], WorkspaceError> {
  return canRollback(log, azioneId).map((azioneOriginale) => {
    const rollbackId = crypto.randomUUID();

    const logAggiornato = log.map((a) =>
      a.id === azioneId ? { ...a, compensatedBy: rollbackId } : a
    );

    const azioneRollback: Azione = {
      id: rollbackId,
      timestamp: new Date().toISOString(),
      autoreId,
      tipo: "rollback",
      payload: {
        descrizione: `Rollback di: ${azioneOriginale.payload.descrizione}`,
        datiPrecedenti: azioneOriginale.payload.datiPrecedenti,
      },
      targetId: azioneId,
    };

    return [...logAggiornato, azioneRollback];
  });
}

export function getLogOrdinato(log: readonly Azione[]): readonly Azione[] {
  return [...log].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
