import { co, z } from "jazz-tools";
import { useWorkspaceAccount } from "@/features/workspace/workspace.adapter";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import { FonteSchema, ElementoSchema, MediaImmagineSchema } from "@/features/elemento/elemento.schema";
import { normalizeElementoInput, type ElementoInput } from "@/features/elemento/elemento.rules";
import { ensureTagsInRegistry } from "@/features/workspace/workspace.rules";
import { parseElementoId, type ElementoId } from "@/features/shared/newtypes";
import { TagRegistrationSchema } from "@/features/workspace/workspace.schema";
import { err, ok, type Result } from "neverthrow";
import type { DataTemporale } from "@/features/shared/value-objects";

export interface CreateElementoInput extends ElementoInput {}
export interface UpdateElementoInput extends ElementoInput {}

function serializeHistoricalDate(date: { anno: number; era: "aev" | "ev"; precisione: "esatta" | "circa"; mese?: number; giorno?: number; }) {
  return {
    ...date,
    mese: date.mese,
    giorno: date.giorno
  };
}

function serializeDataTemporale(date: DataTemporale | undefined) {
  if (!date) {
    return {
      dateKind: undefined,
      data: undefined,
      inizio: undefined,
      fine: undefined
    };
  }

  if (date.kind === "puntuale") {
    return {
      dateKind: "puntuale" as const,
      data: serializeHistoricalDate(date.data),
      inizio: undefined,
      fine: undefined
    };
  }

  return {
    dateKind: "range" as const,
    data: undefined,
    inizio: serializeHistoricalDate(date.inizio),
    fine: serializeHistoricalDate(date.fine)
  };
}

export function deserializeDataTemporale(elemento: any): DataTemporale | undefined {
  if (elemento?.dateKind === "puntuale" && elemento.data) {
    return {
      kind: "puntuale",
      data: elemento.data
    };
  }

  if (elemento?.dateKind === "range" && elemento.inizio && elemento.fine) {
    return {
      kind: "range",
      inizio: elemento.inizio,
      fine: elemento.fine
    };
  }

  return undefined;
}

export function useWorkspaceElementiState() {
  const account = useWorkspaceAccount();
  const workspace = account.me?.root?.workspace;

  return {
    account,
    workspace,
    elementi: workspace?.elementi ?? []
  };
}

export function createElementoInWorkspace(
  account: any,
  input: CreateElementoInput
): Result<any, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace) {
    throw new Error("Workspace non disponibile.");
  }

  if (!workspace.elementi) {
    throw new Error(
      "Il workspace corrente non ha ancora la collezione elementi. Serve migrazione schema."
    );
  }

  const normalizedResult = normalizeElementoInput(input);
  if (normalizedResult.isErr()) {
    return normalizedResult;
  }

  const normalized = normalizedResult.value;

  syncTagsToRegistry(workspace, normalized.tags, account);

  const elemento = ElementoSchema.create(
    {
      titolo: normalized.titolo,
      descrizione: normalized.descrizione,
      ...serializeDataTemporale(normalized.date),
      nascita: normalized.nascita
        ? serializeHistoricalDate(normalized.nascita)
        : undefined,
      morte: normalized.morte
        ? serializeHistoricalDate(normalized.morte)
        : undefined,
      tipo: normalized.tipo,
      tags: co.list(z.string()).create([...normalized.tags], account),
      fonti: co.list(FonteSchema).create([], account),
      media: co.list(MediaImmagineSchema).create([], account)
    },
    account
  );

  workspace.elementi.push(elemento);

  return ok(elemento);
}

export function updateWorkspaceElemento(
  account: any,
  elementoId: ElementoId | string,
  input: UpdateElementoInput
): Result<any, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) {
    throw new Error("Workspace non disponibile.");
  }

  const elemento = workspace.elementi.find((entry: any) => entry?.id === elementoId);
  if (!elemento) {
    return err({ type: "elemento_non_trovato" });
  }

  const normalizedResult = normalizeElementoInput(input);
  if (normalizedResult.isErr()) {
    return normalizedResult;
  }

  const normalized = normalizedResult.value;

  elemento.titolo = normalized.titolo;
  elemento.descrizione = normalized.descrizione;
  elemento.tipo = normalized.tipo;

  if (normalized.date) {
    const serializedDate = serializeDataTemporale(normalized.date);
    elemento.dateKind = serializedDate.dateKind;
    if (serializedDate.data) {
      elemento.data = serializedDate.data;
    } else {
      elemento.data = undefined;
    }
    if (serializedDate.inizio) {
      elemento.inizio = serializedDate.inizio;
    } else {
      elemento.inizio = undefined;
    }
    if (serializedDate.fine) {
      elemento.fine = serializedDate.fine;
    } else {
      elemento.fine = undefined;
    }
  } else {
    elemento.dateKind = undefined;
    elemento.data = undefined;
    elemento.inizio = undefined;
    elemento.fine = undefined;
  }

  if (normalized.nascita) {
    elemento.nascita = normalized.nascita;
  } else {
    elemento.nascita = undefined;
  }

  if (normalized.morte) {
    elemento.morte = normalized.morte;
  } else {
    elemento.morte = undefined;
  }

  syncTagsToRegistry(workspace, normalized.tags, account);

  if (elemento.tags) {
    while (elemento.tags.length > 0) {
      elemento.tags.splice(0, 1);
    }
    for (const tag of normalized.tags) {
      elemento.tags.push(tag);
    }
  } else {
    elemento.tags = co.list(z.string()).create([...normalized.tags], account);
  }

  return ok(elemento);
}

export function deleteWorkspaceElemento(
  account: any,
  elementoId: ElementoId | string
): Result<{ elemento: any; index: number }, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) {
    throw new Error("Workspace non disponibile.");
  }

  const index = workspace.elementi.findIndex((entry: any) => entry?.id === elementoId);
  if (index < 0) {
    return err({ type: "elemento_non_trovato" });
  }

  const removed = workspace.elementi.splice(index, 1)[0];
  if (!removed) {
    return err({ type: "elemento_non_trovato" });
  }

  return ok({ elemento: removed, index });
}

export function restoreWorkspaceElemento(
  account: any,
  payload: { elemento: any; index: number }
): Result<any, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) {
    throw new Error("Workspace non disponibile.");
  }

  workspace.elementi.splice(payload.index, 0, payload.elemento);

  return ok(payload.elemento);
}

export function findWorkspaceElementoById(
  workspace: ReturnType<typeof useWorkspaceElementiState>["workspace"],
  elementoId: string | undefined
) {
  if (!workspace || !elementoId) {
    return null;
  }

  const parsed = parseElementoId(elementoId);
  if (parsed.isErr()) {
    return null;
  }

  return workspace.elementi?.find((elemento) => elemento?.id === parsed.value) ?? null;
}

export interface ImageUploadResult {
  readonly id: string;
  readonly nomeFile: string;
  readonly mimeType: string;
  readonly dimensioneBytes: number;
}

function syncTagsToRegistry(workspace: any, tags: readonly string[], account: any) {
  if (!workspace.tagRegistry || tags.length === 0) return;

  const currentRegistry = Array.from(workspace.tagRegistry).filter(Boolean).map((entry: any) => ({
    tag: entry.tag,
    colore: entry.colore,
    elementoDescrittivoId: entry.elementoDescrittivoId
  }));

  const result = ensureTagsInRegistry(currentRegistry, [...tags]);
  if (result.isOk() && result.value.length > currentRegistry.length) {
    const newEntries = result.value.slice(currentRegistry.length);
    for (const entry of newEntries) {
      const registration = TagRegistrationSchema.create(
        { tag: entry.tag, colore: entry.colore, elementoDescrittivoId: entry.elementoDescrittivoId },
        account
      );
      workspace.tagRegistry.push(registration);
    }
  }
}

export async function uploadWorkspaceImage(_file: File): Promise<ImageUploadResult> {
  throw new Error("Upload immagini non ancora implementato in questa tranche.");
}

export function computeWorkspaceMediaUsage(workspace: any): { totalBytes: number; imageCount: number } {
  let totalBytes = 0;
  let imageCount = 0;

  if (!workspace?.elementi) return { totalBytes, imageCount };

  for (const elemento of workspace.elementi) {
    if (!elemento?.media) continue;
    for (const media of elemento.media) {
      if (!media) continue;
      totalBytes += media.dimensioneBytes ?? 0;
      imageCount += 1;
    }
  }

  return { totalBytes, imageCount };
}
