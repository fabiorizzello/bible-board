export type ElementoError =
  | { type: "titolo_vuoto" }
  | { type: "elemento_non_trovato" }
  | { type: "data_non_valida" }
  | { type: "fonte_non_valida" }
  | { type: "link_non_valido" };
