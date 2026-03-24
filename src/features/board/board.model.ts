export type BoardView = "timeline" | "lista" | "grafo" | "genealogia";

export interface Board {
  readonly id: string;
  readonly nome: string;
  readonly ultimaVista?: BoardView;
}
