import type { ElementoTipo } from "@/features/elemento/elemento.model";

export type BoardView = "timeline" | "lista" | "grafo" | "genealogia";

export interface SelezioneFissa {
  readonly kind: "fissa";
  readonly elementiIds: readonly string[];
}

export interface SelezioneDinamica {
  readonly kind: "dinamica";
  readonly tags?: readonly string[];
  readonly tipi?: readonly ElementoTipo[];
}

export type SelezioneElementi = SelezioneFissa | SelezioneDinamica;

export interface Board {
  readonly id: string;
  readonly nome: string;
  readonly selezione: SelezioneElementi;
  readonly ultimaVista?: BoardView;
}
