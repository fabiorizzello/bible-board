import { co, z } from "jazz-tools";
import { useWorkspaceAccount } from "@/features/workspace/workspace.adapter";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import {
  FonteSchema,
  ElementoSchema,
  MediaImmagineSchema,
  LinkSchema
} from "@/features/elemento/elemento.schema";
import {
  normalizeElementoInput,
  validateFonte,
  validateLink,
  validateLinkTipoPermission,
  getInverseLink,
  type ElementoInput,
  type FonteInput
} from "@/features/elemento/elemento.rules";
import { ensureTagsInRegistry } from "@/features/workspace/workspace.rules";
import { parseElementoId, type ElementoId } from "@/features/shared/newtypes";
import { TagRegistrationSchema } from "@/features/workspace/workspace.schema";
import { err, ok, type Result } from "neverthrow";
import type { DataTemporale } from "@/features/shared/value-objects";
import type {
  Elemento,
  ElementoTipo,
  ElementoLink,
  TipoLink,
  RuoloLink
} from "@/features/elemento/elemento.model";

export interface CreateElementoInput extends ElementoInput {}
export interface UpdateElementoInput extends ElementoInput {}

function serializeHistoricalDate(date: {
  anno: number;
  era: "aev" | "ev";
  precisione: "esatta" | "circa";
  mese?: number;
  giorno?: number;
}) {
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

/**
 * Convert a Jazz CoMap elemento to a pure domain Elemento.
 * Returns null and emits a console.warn if parsing fails (e.g. malformed CoMap).
 */
export function coMapToElementoDomain(elemento: any): Elemento | null {
  const idResult = parseElementoId(elemento?.id ?? "");
  if (idResult.isErr()) {
    console.warn("coMapToElementoDomain: invalid ElementoId", elemento?.id);
    return null;
  }

  const tipo = elemento?.tipo as ElementoTipo | undefined;
  const VALID_TIPOS: ElementoTipo[] = [
    "personaggio", "guerra", "profezia", "regno",
    "periodo", "luogo", "evento", "annotazione"
  ];
  if (!tipo || !VALID_TIPOS.includes(tipo)) {
    console.warn("coMapToElementoDomain: invalid tipo", tipo);
    return null;
  }

  const links: ElementoLink[] = elemento?.links
    ? [...elemento.links]
        .filter(Boolean)
        .map((l: any) => ({
          targetId: l.targetId as string,
          tipo: l.tipo as TipoLink,
          ...(l.ruolo ? { ruolo: l.ruolo as RuoloLink } : {}),
          ...(l.nota ? { nota: l.nota as string } : {})
        }))
    : [];

  const ruoli: string[] | undefined = elemento?.ruoliStr
    ? elemento.ruoliStr.split(",").map((s: string) => s.trim()).filter(Boolean)
    : undefined;

  return {
    id: idResult.value,
    titolo: elemento?.titolo ?? "",
    descrizione: elemento?.descrizione ?? "",
    tipo,
    tags: elemento?.tags ? [...elemento.tags].filter(Boolean) : [],
    link: links,
    date: deserializeDataTemporale(elemento),
    nascita: elemento?.nascita,
    morte: elemento?.morte,
    tribu: elemento?.tribu,
    ruoli: ruoli && ruoli.length > 0 ? ruoli : undefined,
    fazioni: elemento?.fazioni,
    esito: elemento?.esito,
    statoProfezia: elemento?.statoProfezia,
    dettagliRegno: elemento?.dettagliRegno,
    regione: elemento?.regione,
    autore: elemento?.autore
  };
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
      links: co.list(LinkSchema).create([], account),
      media: co.list(MediaImmagineSchema).create([], account),
      tribu: normalized.tribu,
      ruoliStr: normalized.ruoli ? normalized.ruoli.join(",") : undefined,
      fazioni: normalized.fazioni,
      esito: normalized.esito,
      statoProfezia: normalized.statoProfezia,
      dettagliRegno: normalized.dettagliRegno,
      regione: normalized.regione
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
    elemento.data = serializedDate.data ?? undefined;
    elemento.inizio = serializedDate.inizio ?? undefined;
    elemento.fine = serializedDate.fine ?? undefined;
  } else {
    elemento.dateKind = undefined;
    elemento.data = undefined;
    elemento.inizio = undefined;
    elemento.fine = undefined;
  }

  elemento.nascita = normalized.nascita ?? undefined;
  elemento.morte = normalized.morte ?? undefined;

  // Tipo-specific fields
  elemento.tribu = normalized.tribu ?? undefined;
  elemento.ruoliStr = normalized.ruoli ? normalized.ruoli.join(",") : undefined;
  elemento.fazioni = normalized.fazioni ?? undefined;
  elemento.esito = normalized.esito ?? undefined;
  elemento.statoProfezia = normalized.statoProfezia ?? undefined;
  elemento.dettagliRegno = normalized.dettagliRegno ?? undefined;
  elemento.regione = normalized.regione ?? undefined;

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

/**
 * Add a fonte to an elemento's fonti list via Jazz CoMap mutation.
 * Validates with domain rules before mutating.
 */
export function addFonteToElemento(
  account: any,
  elementoId: string,
  input: FonteInput
): Result<void, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) throw new Error("Workspace non disponibile.");

  const elemento = workspace.elementi.find((e: any) => e?.id === elementoId);
  if (!elemento) return err({ type: "elemento_non_trovato" });

  const validationResult = validateFonte(input);
  if (validationResult.isErr()) return validationResult;

  const fonte = validationResult.value;

  const existing = elemento.fonti ? [...elemento.fonti].filter(Boolean) : [];
  if (existing.some((f: any) => f?.tipo === fonte.tipo && f?.valore === fonte.valore)) {
    return err({ type: "fonte_duplicata" });
  }

  const fonteCoMap = FonteSchema.create(
    { tipo: fonte.tipo, valore: fonte.valore, urlCalcolata: fonte.urlCalcolata },
    account
  );

  if (!elemento.fonti) {
    elemento.fonti = co.list(FonteSchema).create([fonteCoMap], account);
  } else {
    elemento.fonti.push(fonteCoMap);
  }

  return ok(undefined);
}

/**
 * Remove a fonte from an elemento's fonti list.
 */
export function removeFonteFromElemento(
  account: any,
  elementoId: string,
  tipo: string,
  valore: string
): Result<void, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) throw new Error("Workspace non disponibile.");

  const elemento = workspace.elementi.find((e: any) => e?.id === elementoId);
  if (!elemento) return err({ type: "elemento_non_trovato" });

  if (!elemento.fonti) return err({ type: "fonte_non_trovata" });

  const index = [...elemento.fonti].findIndex(
    (f: any) => f?.tipo === tipo && f?.valore === valore
  );
  if (index === -1) return err({ type: "fonte_non_trovata" });

  elemento.fonti.splice(index, 1);
  return ok(undefined);
}

/**
 * Add a bidirectional link between two elementi.
 * Creates the forward link on source and the inverse on target in the same operation.
 * Jazz CRDTs merge atomically — both mutations are causally ordered.
 */
export function addBidirectionalLink(
  account: any,
  sourceId: string,
  targetId: string,
  tipo: TipoLink,
  ruolo?: RuoloLink,
  nota?: string
): Result<void, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) throw new Error("Workspace non disponibile.");

  const source = workspace.elementi.find((e: any) => e?.id === sourceId);
  const target = workspace.elementi.find((e: any) => e?.id === targetId);

  if (!source) return err({ type: "elemento_non_trovato" });
  if (!target) return err({ type: "elemento_non_trovato" });

  const permissionResult = validateLinkTipoPermission(
    source.tipo as ElementoTipo,
    tipo
  );
  if (permissionResult.isErr()) return permissionResult;

  const linkResult = validateLink(sourceId, { targetId, tipo, ruolo, nota });
  if (linkResult.isErr()) return linkResult;

  const sourceLinks = source.links ? [...source.links].filter(Boolean) : [];
  if (sourceLinks.some((l: any) => l?.targetId === targetId && l?.tipo === tipo)) {
    return err({ type: "link_duplicato" });
  }

  // Forward link
  const forwardCoMap = LinkSchema.create(
    { targetId, tipo, ruolo, nota },
    account
  );
  if (!source.links) {
    source.links = co.list(LinkSchema).create([forwardCoMap], account);
  } else {
    source.links.push(forwardCoMap);
  }

  // Inverse link (skip if already present)
  const inverse = getInverseLink(sourceId, linkResult.value);
  const targetLinks = target.links ? [...target.links].filter(Boolean) : [];
  if (!targetLinks.some((l: any) => l?.targetId === inverse.targetId && l?.tipo === inverse.tipo)) {
    const inverseCoMap = LinkSchema.create(
      {
        targetId: inverse.targetId,
        tipo: inverse.tipo,
        ruolo: inverse.ruolo,
        nota: inverse.nota
      },
      account
    );
    if (!target.links) {
      target.links = co.list(LinkSchema).create([inverseCoMap], account);
    } else {
      target.links.push(inverseCoMap);
    }
  }

  return ok(undefined);
}

/**
 * Remove a bidirectional link between two elementi.
 * Removes forward link from source and inverse from target.
 */
export function removeBidirectionalLink(
  account: any,
  sourceId: string,
  targetId: string,
  tipo: TipoLink
): Result<void, ElementoError> {
  const workspace = account.root?.workspace;
  if (!workspace?.elementi) throw new Error("Workspace non disponibile.");

  const source = workspace.elementi.find((e: any) => e?.id === sourceId);
  const target = workspace.elementi.find((e: any) => e?.id === targetId);

  if (!source) return err({ type: "elemento_non_trovato" });
  if (!target) return err({ type: "elemento_non_trovato" });

  if (source.links) {
    const fwdIdx = [...source.links].findIndex(
      (l: any) => l?.targetId === targetId && l?.tipo === tipo
    );
    if (fwdIdx !== -1) source.links.splice(fwdIdx, 1);
  }

  // Remove the inverse from target
  if (target.links) {
    const invIdx = [...target.links].findIndex(
      (l: any) => l?.targetId === sourceId && l?.tipo === tipo
    );
    if (invIdx !== -1) target.links.splice(invIdx, 1);
  }

  return ok(undefined);
}

export interface ImageUploadResult {
  readonly id: string;
  readonly nomeFile: string;
  readonly mimeType: string;
  readonly dimensioneBytes: number;
}

function syncTagsToRegistry(workspace: any, tags: readonly string[], account: any) {
  if (!workspace.tagRegistry || tags.length === 0) return;

  const currentRegistry = Array.from(workspace.tagRegistry)
    .filter(Boolean)
    .map((entry: any) => ({
      tag: entry.tag,
      colore: entry.colore,
      elementoDescrittivoId: entry.elementoDescrittivoId
    }));

  const result = ensureTagsInRegistry(currentRegistry, [...tags]);
  if (result.isOk() && result.value.length > currentRegistry.length) {
    const newEntries = result.value.slice(currentRegistry.length);
    for (const entry of newEntries) {
      const registration = TagRegistrationSchema.create(
        {
          tag: entry.tag,
          colore: entry.colore,
          elementoDescrittivoId: entry.elementoDescrittivoId
        },
        account
      );
      workspace.tagRegistry.push(registration);
    }
  }
}

export async function uploadWorkspaceImage(_file: File): Promise<ImageUploadResult> {
  throw new Error("Upload immagini non ancora implementato in questa tranche.");
}

export function computeWorkspaceMediaUsage(
  workspace: any
): { totalBytes: number; imageCount: number } {
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
