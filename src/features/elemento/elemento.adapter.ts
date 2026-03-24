import { co } from "jazz-tools";
import { useWorkspaceAccount } from "@/features/workspace/workspace.adapter";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import { FonteSchema, ElementoSchema } from "@/features/elemento/elemento.schema";
import { normalizeElementoInput, type ElementoInput } from "@/features/elemento/elemento.rules";
import { asElementoId, type ElementoId } from "@/features/shared/newtypes";
import { err, ok, type Result } from "@/features/shared/result";
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

  const elemento = ElementoSchema.create(
    {
      titolo: normalized.titolo,
      note: normalized.note,
      ...serializeDataTemporale(normalized.date),
      nascita: normalized.nascita
        ? serializeHistoricalDate(normalized.nascita)
        : undefined,
      morte: normalized.morte
        ? serializeHistoricalDate(normalized.morte)
        : undefined,
      tipo: normalized.tipo,
      fonti: co.list(FonteSchema).create([], account)
    },
    account
  );

  workspace.elementi.$jazz.push(elemento);

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

  elemento.$jazz.set("titolo", normalized.titolo);
  elemento.$jazz.set("note", normalized.note);
  elemento.$jazz.set("tipo", normalized.tipo);

  if (normalized.date) {
    const serializedDate = serializeDataTemporale(normalized.date);
    elemento.$jazz.set("dateKind", serializedDate.dateKind);
    if (serializedDate.data) {
      elemento.$jazz.set("data", serializedDate.data);
    } else {
      elemento.$jazz.delete("data");
    }
    if (serializedDate.inizio) {
      elemento.$jazz.set("inizio", serializedDate.inizio);
    } else {
      elemento.$jazz.delete("inizio");
    }
    if (serializedDate.fine) {
      elemento.$jazz.set("fine", serializedDate.fine);
    } else {
      elemento.$jazz.delete("fine");
    }
  } else {
    elemento.$jazz.delete("dateKind");
    elemento.$jazz.delete("data");
    elemento.$jazz.delete("inizio");
    elemento.$jazz.delete("fine");
  }

  if (normalized.nascita) {
    elemento.$jazz.set("nascita", normalized.nascita);
  } else {
    elemento.$jazz.delete("nascita");
  }

  if (normalized.morte) {
    elemento.$jazz.set("morte", normalized.morte);
  } else {
    elemento.$jazz.delete("morte");
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

  const removed = workspace.elementi.$jazz.remove(index)[0];
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

  workspace.elementi.$jazz.splice(payload.index, 0, payload.elemento);

  return ok(payload.elemento);
}

export function findWorkspaceElementoById(
  workspace: ReturnType<typeof useWorkspaceElementiState>["workspace"],
  elementoId: string | undefined
) {
  if (!workspace || !elementoId) {
    return null;
  }

  const normalizedId = asElementoId(elementoId);

  return workspace.elementi?.find((elemento) => elemento?.id === normalizedId) ?? null;
}

export interface ImageUploadResult {
  readonly id: string;
  readonly nomeFile: string;
  readonly mimeType: string;
  readonly dimensioneBytes: number;
}

export async function uploadWorkspaceImage(_file: File): Promise<ImageUploadResult> {
  throw new Error("Upload immagini non ancora implementato in questa tranche.");
}
