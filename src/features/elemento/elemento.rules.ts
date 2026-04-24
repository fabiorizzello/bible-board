import { err, ok, type Result } from "neverthrow";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import { resolveWolStudyEditionUrl } from "@/features/elemento/wol-link-resolver";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";
import { validateDataStorica, validateDataTemporale } from "@/features/shared/value-objects";
import type { Elemento, ElementoLink, ElementoTipo, RuoloLink, TipoLink } from "@/features/elemento/elemento.model";

export interface ElementoInput {
  readonly titolo: string;
  readonly descrizione?: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tags?: readonly string[];
  readonly tipo: ElementoTipo;

  // Type-specific optional fields — mirror Elemento model.
  // normalizeElementoInput rejects fields that don't belong to the given tipo.
  readonly tribu?: string;              // personaggio
  readonly ruoli?: readonly string[];   // personaggio
  readonly fazioni?: string;            // guerra
  readonly esito?: string;              // guerra
  readonly statoProfezia?: string;      // profezia
  readonly dettagliRegno?: string;      // regno
  readonly regione?: string;            // luogo
}

export interface NormalizedElementoInput {
  readonly titolo: string;
  readonly descrizione: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tags: readonly string[];
  readonly tipo: ElementoTipo;

  readonly tribu?: string;
  readonly ruoli?: readonly string[];
  readonly fazioni?: string;
  readonly esito?: string;
  readonly statoProfezia?: string;
  readonly dettagliRegno?: string;
  readonly regione?: string;
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

/** FonteTipo in scope for M001 (video deferred to M004). */
export type FonteTipo = "scrittura" | "articolo-wol" | "pubblicazione" | "link" | "altro";

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

  if (input.tipo === "articolo-wol") {
    return ok({
      tipo: "articolo-wol",
      valore: trimmed,
      urlCalcolata: trimmed,
    });
  }

  if (input.tipo === "pubblicazione") {
    return ok({
      tipo: "pubblicazione",
      valore: trimmed,
    });
  }

  if (input.tipo === "link") {
    return ok({
      tipo: "link",
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

export function addFonte(
  fonti: readonly NormalizedFonte[],
  input: FonteInput,
): Result<readonly NormalizedFonte[], ElementoError> {
  const validationResult = validateFonte(input);
  if (validationResult.isErr()) return err(validationResult.error);

  const fonte = validationResult.value;
  const duplicate = fonti.some((f) => f.tipo === fonte.tipo && f.valore === fonte.valore);
  if (duplicate) return err({ type: "fonte_duplicata" });

  return ok([...fonti, fonte]);
}

export function removeFonte(
  fonti: readonly NormalizedFonte[],
  tipo: FonteTipo,
  valore: string,
): Result<readonly NormalizedFonte[], ElementoError> {
  const index = fonti.findIndex((f) => f.tipo === tipo && f.valore === valore);
  if (index === -1) return err({ type: "fonte_non_trovata" });

  return ok([...fonti.slice(0, index), ...fonti.slice(index + 1)]);
}

export function normalizeElementoInput(
  input: ElementoInput
): Result<NormalizedElementoInput, ElementoError> {
  const titoloResult = validateElementoTitle(input.titolo);
  if (titoloResult.isErr()) {
    return err(titoloResult.error);
  }

  // Tipo↔field consistency — rich domain rule: a field is only valid on its owning tipo.
  // Keeps the "Parse, don't validate" contract tight so the UI cannot silently persist
  // stale type-specific data after the user switches tipo.
  if ((input.nascita || input.morte) && input.tipo !== "personaggio") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }
  if ((input.tribu || input.ruoli) && input.tipo !== "personaggio") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }
  if ((input.fazioni || input.esito) && input.tipo !== "guerra") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }
  if (input.statoProfezia && input.tipo !== "profezia") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }
  if (input.dettagliRegno && input.tipo !== "regno") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }
  if (input.regione && input.tipo !== "luogo") {
    return err({ type: "tipo_specifico_non_ammesso" });
  }

  // Date shape validation (unchanged from pre-existing behavior).
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
    tipo: input.tipo,
    tribu: input.tribu?.trim() || undefined,
    ruoli: input.ruoli?.map((r) => r.trim()).filter(Boolean),
    fazioni: input.fazioni?.trim() || undefined,
    esito: input.esito?.trim() || undefined,
    statoProfezia: input.statoProfezia?.trim() || undefined,
    dettagliRegno: input.dettagliRegno?.trim() || undefined,
    regione: input.regione?.trim() || undefined,
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

export function validateLinkTipoPermission(
  sourceTipo: ElementoTipo,
  linkTipo: TipoLink
): Result<void, ElementoError> {
  if (linkTipo === "parentela" && sourceTipo !== "personaggio") {
    return err({ type: "parentela_non_ammessa" });
  }
  return ok(undefined);
}

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

// --- Validity Warnings ---

export interface ValidityWarning {
  readonly field: 'date' | 'nascita' | 'morte' | 'link';
  readonly targetId?: string;
  readonly message: string;
}

export function computeValidityWarnings(
  elemento: Elemento,
  resolveId: (id: string) => boolean
): readonly ValidityWarning[] {
  const warnings: ValidityWarning[] = [];

  if (elemento.date !== undefined && validateDataTemporale(elemento.date).isErr()) {
    warnings.push({ field: 'date', message: "La data dell'elemento non è valida." });
  }

  if (elemento.nascita !== undefined && validateDataStorica(elemento.nascita).isErr()) {
    warnings.push({ field: 'nascita', message: 'La data di nascita non è valida.' });
  }

  if (elemento.morte !== undefined && validateDataStorica(elemento.morte).isErr()) {
    warnings.push({ field: 'morte', message: 'La data di morte non è valida.' });
  }

  for (const link of elemento.link) {
    if (!resolveId(link.targetId)) {
      warnings.push({
        field: 'link',
        targetId: link.targetId,
        message: 'Collegamento a elemento non trovato (potrebbe essere stato eliminato).',
      });
    }
  }

  return warnings;
}
