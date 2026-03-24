export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type WorkspaceId = Brand<string, "WorkspaceId">;
export type ElementoId = Brand<string, "ElementoId">;
export type BoardId = Brand<string, "BoardId">;
export type AzioneId = Brand<string, "AzioneId">;
export type MediaId = Brand<string, "MediaId">;
export type Tag = Brand<string, "Tag">;

export function asWorkspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}

export function asElementoId(value: string): ElementoId {
  return value as ElementoId;
}

export function asBoardId(value: string): BoardId {
  return value as BoardId;
}

export function asTag(value: string): Tag {
  return value as Tag;
}
