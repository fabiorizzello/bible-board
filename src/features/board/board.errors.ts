export type BoardError =
  | { type: "board_nome_vuoto" }
  | { type: "board_non_trovato" }
  | { type: "view_non_valida" }
  | { type: "selezione_vuota" };
