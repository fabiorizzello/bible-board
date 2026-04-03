import type { ElementoId } from "@/features/shared/newtypes";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";

export type ElementoTipo =
  | "personaggio"
  | "guerra"
  | "profezia"
  | "regno"
  | "periodo"
  | "luogo"
  | "evento"
  | "annotazione";

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
  readonly descrizione: string;
  readonly tipo: ElementoTipo;
  readonly link: readonly ElementoLink[];

  // Tipo-specific optional fields
  readonly tribu?: string;              // personaggio
  readonly ruoli?: readonly string[];   // personaggio
  readonly fazioni?: string;            // guerra
  readonly esito?: string;              // guerra
  readonly statoProfezia?: string;      // profezia (adempiuta | in corso | futura)
  readonly dettagliRegno?: string;      // regno
  readonly regione?: string;            // luogo

  // Annotazione authorship
  readonly autore?: string;
}
