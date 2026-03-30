import { z } from "jazz-tools";
import { ok, err, type Result } from "neverthrow";

// Branded schemas
export const WorkspaceIdSchema = z.string().min(1).brand<"WorkspaceId">();
export const ElementoIdSchema = z.string().min(1).brand<"ElementoId">();
export const BoardIdSchema = z.string().min(1).brand<"BoardId">();
export const AzioneIdSchema = z.string().min(1).brand<"AzioneId">();
export const MediaIdSchema = z.string().min(1).brand<"MediaId">();
export const TagSchema = z.string().min(1).brand<"Tag">();
export const NonEmptyStringSchema = z.string().min(1).brand<"NonEmptyString">();

// Inferred types
export type WorkspaceId = z.infer<typeof WorkspaceIdSchema>;
export type ElementoId = z.infer<typeof ElementoIdSchema>;
export type BoardId = z.infer<typeof BoardIdSchema>;
export type AzioneId = z.infer<typeof AzioneIdSchema>;
export type MediaId = z.infer<typeof MediaIdSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type NonEmptyString = z.infer<typeof NonEmptyStringSchema>;

// Generic parse helper
type ParseError = { type: "parse_error"; message: string };

function parseWith<T>(schema: z.ZodType<T>, value: unknown): Result<T, ParseError> {
  const result = schema.safeParse(value);
  return result.success
    ? ok(result.data)
    : err({ type: "parse_error", message: result.error.issues[0]?.message ?? "Invalid value" });
}

// Smart constructors
export const parseWorkspaceId = (v: string) => parseWith(WorkspaceIdSchema, v);
export const parseElementoId = (v: string) => parseWith(ElementoIdSchema, v);
export const parseBoardId = (v: string) => parseWith(BoardIdSchema, v);
export const parseAzioneId = (v: string) => parseWith(AzioneIdSchema, v);
export const parseMediaId = (v: string) => parseWith(MediaIdSchema, v);
export const parseTag = (v: string) => parseWith(TagSchema, v);
export const parseNonEmptyString = (v: string) => parseWith(NonEmptyStringSchema, v);
