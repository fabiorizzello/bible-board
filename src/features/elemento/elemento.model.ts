import type { ElementoId } from "@/features/shared/newtypes";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";

export type ElementoTipo =
  | "personaggio"
  | "guerra"
  | "profezia"
  | "regno"
  | "periodo"
  | "luogo"
  | "evento";

export interface Elemento {
  readonly id: ElementoId;
  readonly titolo: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly note: string;
  readonly tipo: ElementoTipo;
}
