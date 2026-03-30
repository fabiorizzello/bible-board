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

export type TipoLink =
  | "adempimento"
  | "causa-effetto"
  | "parallelo"
  | "successione"
  | "parentela"
  | "localizzazione"
  | "residenza"
  | "correlato";

export type RuoloLink =
  | "padre"
  | "madre"
  | "figlio"
  | "figlia"
  | "coniuge";

export interface ElementoLink {
  readonly targetId: string;
  readonly tipo: TipoLink;
  readonly ruolo?: RuoloLink;
  readonly nota?: string;
}

export interface Elemento {
  readonly id: ElementoId;
  readonly titolo: string;
  readonly date?: DataTemporale;
  readonly nascita?: DataStorica;
  readonly morte?: DataStorica;
  readonly tags: readonly string[];
  readonly note: string;
  readonly tipo: ElementoTipo;
  readonly link: readonly ElementoLink[];
}
