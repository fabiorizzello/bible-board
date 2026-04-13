---
phase: 02-editor-annotazioni
reviewed: 2026-04-13T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/FullscreenOverlay.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
findings:
  critical: 0
  warning: 6
  info: 8
  total: 14
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 02 introduces an inline `ElementoEditor`, a Legend-State-backed UI store
with soft-delete + toast undo, and decomposes the workspace preview into
ListPane / DetailPane / FullscreenOverlay shells. The slice is correctly scoped
as a mock-data prototype: no Jazz wiring, immutable mock data, and no hidden
side effects.

The architecture is sound — store mutations capture data before clearing
selection (toast closures stay valid), `getElementsForView` composes
`deletedIds` cleanly and is well covered by tests, and the editor wires
`normalizeElementoInput` correctly through neverthrow's `.match`. No critical
correctness or security issues found.

The warnings cluster around three themes: (1) the editor advertises that it
reads type-specific fields from `EditorState` but those fields are never
forwarded into `normalizeElementoInput`, so the form silently throws away most
of its own state on save; (2) several discriminated-union branches in
`ElementoEditor` are missing (`evento`, `periodo`, `annotazione`) so editing
those types renders a no-op form; (3) a couple of dropdown / dead-code items
that are easy to clean up before this slice grows.

## Warnings

### WR-01: `ElementoEditor.handleSave` discards every type-specific edit

**File:** `src/ui/workspace-home/ElementoEditor.tsx:114-139`
**Issue:** The editor maintains rich `EditorState` for `nascita*`, `morte*`,
`tribu`, `ruoli`, `fazioni`, `esito`, `statoProfezia`, `dettagliRegno`, and
`regione`, but `handleSave` only passes `titolo`, `descrizione`, `tags`, and
`tipo` to `normalizeElementoInput`. The function then immediately calls
`stopEditing()` on success, so even if persistence existed, every type-specific
edit would be silently dropped. Worse, the date strings (`nascitaAnno`,
`morteAnno`) are never parsed into `DataStorica`, so an invalid year like
`"abc"` would never trigger the `data_non_valida` branch the editor's
`ERROR_MESSAGES` registers. This is a logic bug today — the form lies about
what it validates and saves.

Even in a mock prototype this matters because the same `handleSave` is the
shape that will be re-used once Jazz wiring lands; baking the right input
construction in now avoids a silent data-loss footgun later.

**Fix:**
```ts
function parseDataStorica(annoStr: string, era: "aev" | "ev"): DataStorica | undefined {
  const trimmed = annoStr.trim();
  if (!trimmed) return undefined;
  const anno = Number(trimmed);
  if (!Number.isFinite(anno) || anno <= 0) return undefined;
  return { anno, era, precisione: "esatta" };
}

function handleSave() {
  const result = normalizeElementoInput({
    titolo: state.titolo,
    descrizione: state.descrizione,
    tags: state.tags.split(",").map((t) => t.trim()).filter(Boolean),
    tipo: element.tipo,
    nascita: element.tipo === "personaggio"
      ? parseDataStorica(state.nascitaAnno, state.nascitaEra)
      : undefined,
    morte: element.tipo === "personaggio"
      ? parseDataStorica(state.morteAnno, state.morteEra)
      : undefined,
  });
  // ...
}
```
Type-specific scalar fields (`tribu`, `ruoli`, `fazioni`, `esito`, …) are not
in `ElementoInput` yet — extend `elemento.rules.ts` so the editor has a real
target, or add a TODO comment that explicitly says the prototype only
round-trips the shared header. Either way, do not silently swallow user input.

### WR-02: `ElementoEditor` has no branch for `evento`, `periodo`, or `annotazione`

**File:** `src/ui/workspace-home/ElementoEditor.tsx:185-192`
**Issue:** `ElementoTipo` has 8 variants (`personaggio | guerra | profezia |
regno | periodo | luogo | evento | annotazione`) but the editor only renders
type-specific groups for 5 of them. Selecting an `evento` (e.g. "Diluvio" in
the mock data, which is rendered in the list) and pressing Modifica gives a
form with only Titolo / Descrizione / Tag and no way to edit the date — the
user sees a non-editable item presented as editable. Same for `periodo` and
`annotazione`. The constitution explicitly calls out discriminated unions over
`if/else` (V-bis Open/Closed) — the editor should be exhaustive against
`ElementoTipo`.

**Fix:** Either render an `EventoFields` group (with the same date inputs as
`PersonaggioFields`, sourced from `el.date`) and analogous groups for
`periodo` / `annotazione`, or — pragmatic for a prototype — add a default
fallback that renders an explicit "(Nessun campo aggiuntivo per questo tipo)"
hint plus an exhaustiveness check:
```ts
const _exhaustive: never = tipo; // compile-time guard if a tipo is added later
```

### WR-03: Editor dropdowns mis-handle "no selection" instead of clearing

**File:** `src/ui/workspace-home/ElementoEditor.tsx:246-249, 277-280, 347-350`
**Issue:** The HeroUI `Select` callback signature gives `key: Key | null`, but
the cast `key as "aev" | "ev"` (and `String(key)` for `statoProfezia`)
unconditionally writes the value, even when `key` is `null` (which RAC emits
when a selection is cleared via keyboard). For the era selectors this would
silently overwrite the `era` discriminant with the literal string `"null"`,
breaking the next save attempt. This is also a `as`-cast that the constitution
discourages without justification (Principle V).

**Fix:**
```tsx
<Select
  selectedKey={state.nascitaEra}
  onSelectionChange={(key) => {
    if (key === "aev" || key === "ev") set("nascitaEra", key);
  }}
>
```
Apply the same guard to `morteEra` and use a literal-union check
(`if (key === "adempiuta" || key === "in corso" || key === "futura")`) on
`statoProfezia` so the field can be tightened from `string` to a real union.

### WR-04: `clear filters` button only shows when `filterText` is non-empty, but resets `activeTipo` too

**File:** `src/ui/workspace-home/ListPane.tsx:246-262`
**Issue:** The empty state offers a "Resetta filtri" button only when
`filterText` is truthy, but the empty list can also be caused by a `tipo`
filter alone (e.g. choose "Profezie" while on `board-patriarchi`, which has no
profezie). In that scenario the user sees "Nessun risultato." with no escape
hatch and has to know to scroll back up to the tag bar. The reset action also
clobbers `activeTipo` even when only the text filter caused the empty result —
mildly surprising but acceptable; the missing guard above is the real issue.

**Fix:** Show the reset button whenever `filterText !== ""` OR
`activeTipo !== "Tutti"`, and rename it accordingly:
```tsx
{(filterText || activeTipo !== "Tutti") && (
  <Button onPress={() => {
    workspaceUi$.filterText.set("");
    workspaceUi$.activeTipo.set("Tutti");
  }}>
    Resetta filtri
  </Button>
)}
```

### WR-05: Recenti `ListBox` composite key parser breaks if any id contains `-`

**File:** `src/ui/workspace-home/ListPane.tsx:167-178`
**Issue:** Composite keys are built as `${rec.tipo}-${rec.id}` and then split
on the *first* `-`, taking the prefix as `tipo` and the rest as `id`. That
works today because the mock `RECENTI` data uses simple ids, but `ElementoId`
is a Zod `.brand()` string and there is no guarantee Jazz-issued ids never
contain `-` (CoValue ids are typically `co_z…` but the type does not enforce
that). The bigger issue is that this hand-rolled string protocol now lives
across two places (key construction at `ListBox.Item id={…}` and parsing in
`onSelectionChange`), with no shared constant.

**Fix:** Either use a non-`-` separator that cannot appear in ids
(e.g. `\u0000` or `::`) and centralise it as a constant, or — cleaner —
maintain a small `Map<key, RecentiItem>` built once and look the key up
directly:
```ts
const recentiByKey = new Map(RECENTI.map((r) => [`${r.tipo}::${r.id}`, r]));
// onSelectionChange
const item = recentiByKey.get(String([...keys][0]));
if (item?.tipo === "elemento") handleSelectElement(item.id);
```

### WR-06: `getBoardElements` uses OR semantics for `tags` + `tipi`, broadening dynamic boards beyond intent

**File:** `src/ui/workspace-home/display-helpers.ts:96-105`
**Issue:** The dynamic-selection filter combines `matchesTag` and `matchesTipo`
with `||`, so a board declaring `{ tipi: ["profezia"], tags: ["messianico"] }`
will pull in every profezia regardless of tag, plus every messianic element
regardless of tipo. The mock `RESEARCH.md` and existing test
(`returns board elements for board-profeti via dynamic selection`) silently
rely on this OR behaviour, but it is almost certainly not the contract a user
who configures both filters expects. Compare with `resolveBoardsForElement`
on lines 224-237 which uses the same OR logic, so the bug is consistent —
which means the wrong semantics are doubled up, not that the helpers
disagree.

This is a v1 contract decision that should be made explicitly before more
code grows on top of it.

**Fix:** Decide the contract: AND when both filters are present, OR otherwise.
```ts
const tagFilter = selezione.tags?.length
  ? (el: Elemento) => el.tags.some((t) => selezione.tags!.includes(t))
  : null;
const tipoFilter = selezione.tipi?.length
  ? (el: Elemento) => selezione.tipi!.includes(el.tipo)
  : null;
return ELEMENTI.filter((el) =>
  (tagFilter?.(el) ?? true) && (tipoFilter?.(el) ?? true)
);
```
Mirror the change in `resolveBoardsForElement` and add a test that pins the
intended semantics so this cannot regress.

## Info

### IN-01: `finalizeDelete` is exported but called by no one

**File:** `src/ui/workspace-home/workspace-ui-store.ts:92-97`
**Issue:** `finalizeDelete(id)` is declared as a "future Jazz hook" but no
caller exists in the repo today (grep confirms zero hits outside the
declaration). Dead exports rot quickly — at minimum mark it as deliberately
held with a `// TODO(jazz):` comment so future readers don't think the
toast-undo flow is broken.
**Fix:** Either drop the function and re-add it when the Jazz adapter lands,
or wire it into the toast `onClose` handler in `handleSoftDelete` so the
no-op runs at the right moment and the symbol is exercised:
```ts
toast(`"${titolo}" eliminato`, {
  timeout: 30_000,
  onClose: () => finalizeDelete(elementId),
  // ...
});
```

### IN-02: `WorkspaceUIState.lastModified` is set on init but never read or updated

**File:** `src/ui/workspace-home/workspace-ui-store.ts:28, 39`
**Issue:** `lastModified: Date.now()` is initialised but no code reads or
writes it (grep returns zero matches for `workspaceUi$.lastModified`). It
adds a field to the persisted UI state shape with no purpose.
**Fix:** Remove the field, or document what consumer is supposed to read it.

### IN-03: `ERROR_MESSAGES` only handles two error types out of nine

**File:** `src/ui/workspace-home/ElementoEditor.tsx:77-80`
**Issue:** `ElementoError` has 9 variants; the lookup table covers
`titolo_vuoto` and `data_non_valida`. Anything else (e.g. `fonte_non_valida`,
`link_duplicato`) falls back to "Errore di validazione" with no detail. Today
the editor only triggers `titolo_vuoto`, but adding the WR-01 fix will start
exercising the date branches.
**Fix:** Add a helper `formatElementoError(err: ElementoError): string` in
`elemento.errors.ts` with an exhaustive switch so the lookup is centralised
and the compiler enforces coverage:
```ts
export function formatElementoError(error: ElementoError): string {
  switch (error.type) {
    case "titolo_vuoto": return "Il titolo è obbligatorio";
    case "data_non_valida": return "Data non valida";
    // ...
  }
}
```

### IN-04: `set` callback's error-clearing branch does not handle `_form`

**File:** `src/ui/workspace-home/ElementoEditor.tsx:98-112`
**Issue:** After a save fails with a non-`titolo_vuoto` error, the message
lands in `errors._form`. The `set` callback only clears `errors[key]` for the
edited field, so `_form` remains visible until the next failed save (or
manual cancel). Minor UX paper-cut.
**Fix:** Clear `errors._form` whenever any field changes, or scope `_form`
into a separate `useState` so it doesn't share the field-level error map.

### IN-05: HeroUI `<Button variant="primary">` may not be a real variant

**File:** `src/ui/workspace-home/ElementoEditor.tsx:204`,
`src/ui/workspace-home/DetailPane.tsx:96`
**Issue:** HeroUI v3's `Button` typically exposes `variant` values like
`solid | flat | bordered | light | ghost | shadow`. `variant="primary"`
appears in two places and is likely either ignored or producing a runtime
warning, with the actual styling coming from the inline `bg-accent` /
`bg-chrome` classes. The constitution explicitly says "varianti `flat`/`light`
per azioni secondarie, `solid` per CTA" — there is no `primary` variant.
**Fix:** Use `variant="solid"` (CTA) for `Salva` and `Modifica`, and verify
against HeroUI v3 docs (use the context7 MCP server) before committing.

### IN-06: `ListPane` re-imports `ViewId` from the store and silently shadows the `display-helpers` re-export

**File:** `src/ui/workspace-home/ListPane.tsx:27-28`
**Issue:** `display-helpers.ts:14-17` re-exports `ViewId` precisely so UI
modules have a single import point, but `ListPane` imports it directly from
`./workspace-ui-store`. Not a bug, just defeats the convention `display-helpers`
sets up. Either commit to the re-export or delete it.
**Fix:** Import from `./display-helpers` for consistency:
```ts
import type { ViewId } from "./display-helpers";
```

### IN-07: `Toast.Provider` placement option is not documented as supported in HeroUI v3

**File:** `src/ui/workspace-home/WorkspacePreviewPage.tsx:28`
**Issue:** `<Toast.Provider placement="bottom" />` — the prop name and
accepted values vary between HeroUI versions (some use
`placement="bottom-center"`, some use `position`). Worth verifying against
the installed HeroUI v3 type definitions so the iPad-thumb placement actually
applies.
**Fix:** Use the context7 MCP server (or the package types directly) to
confirm the prop name and value, and add a comment near the import to
indicate which v3 release the placement string is from.

### IN-08: `display-helpers.test.ts` asserts hard counts that will be brittle as mock data grows

**File:** `src/ui/workspace-home/__tests__/display-helpers.test.ts:91`,
**lines 91, 178**
**Issue:** Tests like `expect(result.length).toBe(7)` and the soft-delete
baseline-minus-1 assertions are deterministic but break loudly the next time
someone adds an Elemento to `ELEMENTI`. Since `ELEMENTI.length` is computed,
it would be nicer to pin shape rather than counts.
**Fix:** For the soft-delete test, you already correctly diff against
`baseline.length - 1` — keep that pattern, and for the board-patriarchi
fixed-count assertion either compute the expected length from
`board.selezione.elementiIds.length` or replace `.toBe(7)` with
`.toBeGreaterThanOrEqual(7)` plus a `.toContain("Abraamo")` check.

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
