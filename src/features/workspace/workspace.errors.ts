export type WorkspaceError =
  | { type: "workspace_missing" }
  | { type: "workspace_name_empty" };
