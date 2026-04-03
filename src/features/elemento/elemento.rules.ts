import { err, ok, type Result } from "neverthrow";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import { resolveWolStudyEditionUrl } from "@/features/elemento/wol-link-resolver";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";
import { validateDataStorica, validateDataTemporale } from "@/features/shared/value-objects";
import type { ElementoLink, ElementoTipo, RuoloLink, TipoLink } from "@/features/elemento/elemento.model";

export interface ElementoInput {
  readonly titolo: string;
  readonly descrizione?: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tags?: readonly string[];
  readonly tipo: ElementoTipo;
}

export interface NormalizedElementoInput {
  readonly titolo: string;
  readonly descrizione: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tags: readonly string[];
  readonly tipo: ElementoTipo;
}

export function validateElementoTitle(titolo: string): Result<string, ElementoError> {
  const trimmed = titolo.trim();

  if (!trimmed) {
    return err({ type: "titolo_vuoto" });
  }

  return ok(trimmed);
}

export function resolveScriptureSource(reference: string): Result<string, ElementoError> {
  return resolveWolStudyEditionUrl(reference).mapErr(() => ({ type: "fonte_non_valida" }));
}

// --- Fonti ---

export type FonteTipo = "scrittura" | "articolo" | "altro";

export interface FonteInput {
  readonly tipo: FonteTipo;
  readonly valore: string;
}

export interface NormalizedFonte {
  readonly tipo: FonteTipo;
  readonly valore: string;
  readonly urlCalcolata?: string;
}

export function validateFonte(input: FonteInput): Result<NormalizedFonte, ElementoError> {
  const trimmed = input.valore.trim();
  if (!trimmed) {
    return err({ type: "fonte_non_valida" });
  }

  if (input.tipo === "scrittura") {
    const urlResult = resolveWolStudyEditionUrl(trimmed);
    return ok({
      tipo: "scrittura",
      valore: trimmed,
      urlCalcolata: urlResult.isOk() ? urlResult.value : undefined,
    });
  }

  if (input.tipo === "articolo") {
    return ok({
      tipo: "articolo",
      valore: trimmed,
      urlCalcolata: trimmed,
    });
  }

  return ok({
    tipo: "altro",
    valore: trimmed,
  });
}

export function normalizeFonti(
  fonti: readonly FonteInput[]
): Result<readonly NormalizedFonte[], ElementoError> {
  const normalized: NormalizedFonte[] = [];

  for (const fonte of fonti) {
    const result = validateFonte(fonte);
    if (result.isErr()) {
      return err(result.error);
    }
    normalized.push(result.value);
  }

  return ok(normalized);
}

export function normalizeElementoInput(
  input: ElementoInput
): Result<NormalizedElementoInput, ElementoError> {
  const titoloResult = validateElementoTitle(input.titolo);
  if (titoloResult.isErr()) {
    return err(titoloResult.error);
  }

  if (input.tipo !== "personaggio" && (input.nascita || input.morte)) {
    return err({ type: "data_non_valida" });
  }

  if (input.date && validateDataTemporale(input.date).isErr()) {
    return err({ type: "data_non_valida" });
  }

  if (input.nascita && validateDataStorica(input.nascita).isErr()) {
    return err({ type: "data_non_valida" });
  }

  if (input.morte && validateDataStorica(input.morte).isErr()) {
    return err({ type: "data_non_valida" });
  }

  return ok({
    titolo: titoloResult.value,
    descrizione: input.descrizione?.trim() || "",
    date: input.date,
    nascita: input.nascita,
    morte: input.morte,
    tags: input.tags?.map((t) => t.trim()).filter(Boolean) ?? [],
    tipo: input.tipo
  });
}

// --- Link Bidirezionali ---

interface LinkInput {
  readonly targetId: string;
  readonly tipo: TipoLink;
  readonly ruolo?: RuoloLink;
  readonly nota?: string;
}

const RUOLO_INVERSO: Record<RuoloLink, RuoloLink> = {
  padre: "figlio",
  madre: "figlia",
  figlio: "padre",
  figlia: "madre",
  coniuge: "coniuge",
};

export function validateLink(
  sourceId: string,
  input: LinkInput
): Result<ElementoLink, ElementoError> {
  if (input.targetId === sourceId) {
    return err({ type: "link_auto_riferimento" });
  }

  if (input.tipo === "parentela" && !input.ruolo) {
    return err({ type: "ruolo_mancante_per_parentela" });
  }

  const link: ElementoLink = {
    targetId: input.targetId,
    tipo: input.tipo,
    ...(input.ruolo ? { ruolo: input.ruolo } : {}),
    ...(input.nota ? { nota: input.nota } : {}),
  };

  return ok(link);
}

export function getInverseLink(sourceId: string, link: ElementoLink): ElementoLink {
  const inverse: ElementoLink = {
    targetId: sourceId,
    tipo: link.tipo,
    ...(link.tipo === "parentela" && link.ruolo
      ? { ruolo: RUOLO_INVERSO[link.ruolo] }
      : {}),
    ...(link.nota ? { nota: link.nota } : {}),
  };

  return inverse;
}

export function addLink(
  links: readonly ElementoLink[],
  sourceId: string,
  input: LinkInput
): Result<readonly ElementoLink[], ElementoError> {
  const validationResult = validateLink(sourceId, input);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  const link = validationResult.value;

  const duplicate = links.some(
    (l) => l.targetId === link.targetId && l.tipo === link.tipo
  );
  if (duplicate) {
    return err({ type: "link_duplicato" });
  }

  return ok([...links, link]);
}

export function removeLink(
  links: readonly ElementoLink[],
  targetId: string,
  tipo: TipoLink
): Result<readonly ElementoLink[], ElementoError> {
  const index = links.findIndex(
    (l) => l.targetId === targetId && l.tipo === tipo
  );

  if (index === -1) {
    return err({ type: "link_non_trovato" });
  }

  return ok([...links.slice(0, index), ...links.slice(index + 1)]);
}

export function cascadeRemoveLinks(
  links: readonly ElementoLink[],
  deletedElementoId: string
): readonly ElementoLink[] {
  return links.filter((l) => l.targetId !== deletedElementoId);
}
