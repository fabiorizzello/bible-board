export type WorkspaceError =
  | { type: "workspace_missing" }
  | { type: "workspace_name_empty" }
  | { type: "tag_vuoto" }
  | { type: "tag_duplicato"; tag: string }
  | { type: "tag_non_trovato"; tag: string }
  | { type: "azione_non_trovata"; id: string }
  | { type: "rollback_non_sicuro"; motivo: string };
