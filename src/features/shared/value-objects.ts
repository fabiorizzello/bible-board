import { err, ok, type Result } from "neverthrow";

export type HistoricalEra = "aev" | "ev";
export type HistoricalPrecision = "esatta" | "circa";

export interface DataStorica {
  readonly anno: number;
  readonly era: HistoricalEra;
  readonly mese?: number;
  readonly giorno?: number;
  readonly precisione: HistoricalPrecision;
}

export type DataTemporale =
  | {
      readonly kind: "puntuale";
      readonly data: DataStorica;
    }
  | {
      readonly kind: "range";
      readonly inizio: DataStorica;
      readonly fine: DataStorica;
    };

export type HistoricalDateError =
  | { type: "invalid_year" }
  | { type: "invalid_month" }
  | { type: "invalid_day" }
  | { type: "day_requires_month" }
  | { type: "range_order" };

export function validateDataStorica(input: DataStorica): Result<DataStorica, HistoricalDateError> {
  if (!Number.isInteger(input.anno) || input.anno <= 0) {
    return err({ type: "invalid_year" });
  }

  if (input.mese !== undefined && (!Number.isInteger(input.mese) || input.mese < 1 || input.mese > 12)) {
    return err({ type: "invalid_month" });
  }

  if (input.giorno !== undefined && input.mese === undefined) {
    return err({ type: "day_requires_month" });
  }

  if (input.giorno !== undefined && (!Number.isInteger(input.giorno) || input.giorno < 1 || input.giorno > 31)) {
    return err({ type: "invalid_day" });
  }

  return ok(input);
}

function toComparableYear(value: DataStorica) {
  return value.era === "aev" ? -value.anno : value.anno;
}

export function validateDataTemporale(input: DataTemporale): Result<DataTemporale, HistoricalDateError> {
  if (input.kind === "puntuale") {
    return validateDataStorica(input.data).map(() => input);
  }

  const startResult = validateDataStorica(input.inizio);
  if (startResult.isErr()) {
    return err(startResult.error);
  }

  const endResult = validateDataStorica(input.fine);
  if (endResult.isErr()) {
    return err(endResult.error);
  }

  if (toComparableYear(input.inizio) > toComparableYear(input.fine)) {
    return err({ type: "range_order" });
  }

  return ok(input);
}

export function formatHistoricalEra(era: HistoricalEra) {
  return era === "aev" ? "a.e.v." : "e.v.";
}
