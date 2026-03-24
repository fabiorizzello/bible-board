import { err, ok, type Result } from "@/features/shared/result";
import type { ElementoError } from "@/features/elemento/elemento.errors";
import { resolveWolStudyEditionUrl } from "@/features/elemento/wol-link-resolver";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";
import { validateDataStorica, validateDataTemporale } from "@/features/shared/value-objects";
import type { ElementoTipo } from "@/features/elemento/elemento.model";

export interface ElementoInput {
  readonly titolo: string;
  readonly note?: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tipo: ElementoTipo;
}

export interface NormalizedElementoInput {
  readonly titolo: string;
  readonly note: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
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
    note: input.note?.trim() || "",
    date: input.date,
    nascita: input.nascita,
    morte: input.morte,
    tipo: input.tipo
  });
}
