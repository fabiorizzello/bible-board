export type ElementoError =
  | { type: "titolo_vuoto" }
  | { type: "elemento_non_trovato" }
  | { type: "data_non_valida" }
  | { type: "fonte_non_valida" }
  | { type: "link_non_valido" }
  | { type: "link_duplicato" }
  | { type: "link_auto_riferimento" }
  | { type: "link_non_trovato" }
  | { type: "ruolo_mancante_per_parentela" }
  | { type: "tipo_specifico_non_ammesso" }
  | { type: "parentela_non_ammessa" };
