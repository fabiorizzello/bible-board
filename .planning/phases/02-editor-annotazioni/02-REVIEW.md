---
phase: 02-editor-annotazioni
reviewed: 2026-04-13T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/features/elemento/elemento.rules.ts
  - src/features/elemento/elemento.errors.ts
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/features/elemento/__tests__/elemento.rules.test.ts
findings:
  critical: 0
  warning: 3
  info: 6
  total: 9
status: issues_found
---

# Phase 02: Code Review Report (Re-review after gap closure 02-02)

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This re-review covers the 4 files touched by plan 02-02 (gap closure) on top
of base `2dc3ce8`: the elemento domain contract extension, the new error
variant, the rewritten ElementoEditor, and the new domain test file. The
previous 02-REVIEW.md warnings this plan targets (`WR-01` handleSave drops
type-specific fields, `WR-02` missing ElementoTipo branches + no
exhaustiveness, `WR-03` Select null-handling, `IN-03` ERROR_MESSAGES
incomplete) are **all closed**:

- `ElementoEditor.renderTypeSpecificFields` is a proper discriminated-union
  dispatcher with `const _exhaustive: never = tipo` and all 8 `ElementoTipo`
  variants, including `evento`, `periodo`, and `annotazione`.
- `handleSave` now builds a complete `ElementoInput` payload: parses
  `nascita`/`morte` for personaggio, constructs `date` for evento/periodo,
  and forwards all 7 type-specific scalars gated by tipo owner.
- All 6 `Select.onSelectionChange` callbacks use literal-union checks; zero
  `as` casts and zero `String(key)` patterns remain.
- `ERROR_MESSAGES` covers all 10 `ElementoError` variants.
- `normalizeElementoInput` enforces 6 tipo↔field consistency branches via
  the new `tipo_specifico_non_ammesso` variant.
- 13 Vitest cases pin the shared-validation, tipo↔field consistency, and
  date-validation contracts.

**What's still open.** Three new themes surface under the re-review lens:
(1) the domain contract is incomplete for the `date` field — it is the only
field that carries a tipo ownership but is not gated by the consistency
rule, which lets the rules layer accept `date` on a `personaggio` through
a back door; (2) `ElementoEditor.initState` defaults `statoProfezia` to
`"futura"` even when the source Elemento has `statoProfezia: undefined`, so
opening the editor on an unset profezia and pressing Save silently stamps
`"futura"` onto the normalized payload; (3) the new test file pins only 2
of the 6 rejection branches and has no coverage for boundary years, date
trimming, or empty-string type-specific fields — the contract is pinned
unevenly. No critical issues. No security issues.

## Warnings

### WR-01: `normalizeElementoInput` does not gate `date` by tipo — `date` can reach a `personaggio`

**File:** `src/features/elemento/elemento.rules.ts:131-153`
**Issue:** The 6 new tipo↔field consistency checks cover `nascita`/`morte`,
`tribu`/`ruoli`, `fazioni`/`esito`, `statoProfezia`, `dettagliRegno`, and
`regione`. But `date` — which conceptually belongs to `evento` (puntuale)
and `periodo` (range) only — has no ownership branch. A caller can pass
`{ tipo: "personaggio", date: { kind: "puntuale", data: … } }` and
`normalizeElementoInput` will happily accept it and forward `date` into
the normalized output. The editor is constructive (it only builds `date`
for evento/periodo in `handleSave`), so this is unreachable from the
current UI, but it breaks the "belt-and-braces defensive domain" invariant
the plan explicitly established for every other type-specific field, and
it leaves a silent hole for future callers (Jazz adapter, paste-from-clipboard
flows, import/export). The plan's own `tipo_specifico_non_ammesso` design
note — "the field does not belong to this tipo is a different failure mode
from value failed parsing" — applies verbatim to `date`.

This is the single most user-visible gap left after 02-02. It should be
closed in the same spirit as the other 6 branches so every type-specific
field has the same defensive shape.

**Fix:** Add a 7th consistency branch before the shape-validation block:
```ts
// date only belongs to evento (puntuale) and periodo (range)
if (input.date && input.tipo !== "evento" && input.tipo !== "periodo") {
  return err({ type: "tipo_specifico_non_ammesso" });
}
```
And extend `elemento.rules.test.ts` with both sides of the contract:
```ts
it("rejects date on a personaggio with tipo_specifico_non_ammesso", () => {
  const result = normalizeElementoInput({
    titolo: "Abraamo",
    tipo: "personaggio",
    date: { kind: "puntuale", data: DS(2000) },
  });
  expect(result.isErr()).toBe(true);
  if (result.isErr()) expect(result.error.type).toBe("tipo_specifico_non_ammesso");
});
```
Consider also: a puntuale-vs-range kind↔tipo check (puntuale only on evento,
range only on periodo). That is a second enforcement and can live in a
follow-up; the ownership gate above is the minimum that matches the 6 sibling
branches.

### WR-02: `ElementoEditor.initState` stamps `statoProfezia = "futura"` on profezie that have no prior value

**File:** `src/ui/workspace-home/ElementoEditor.tsx:83, 228-229`
**Issue:** `initState` seeds `statoProfezia: el.statoProfezia ?? "futura"`,
so any `profezia` Elemento whose model field is `undefined` (the Elemento
interface declares `statoProfezia?: string`, i.e. truly optional) will
open the editor with `"futura"` pre-selected. If the user merely clicks
Modifica → Salva without touching the Select, `handleSave` then forwards
`statoProfezia: "futura"` into `normalizeElementoInput`, which writes it
into the normalized output. In the current mock-data prototype this is
harmless (no persistence), but the same `handleSave` is the shape M003
Jazz wiring will adopt verbatim, and at that point the editor will silently
promote every unset profezia to `"futura"` on the first round-trip — a
classic UI→domain data contamination footgun.

This is the same class of bug the 02-02 plan explicitly set out to
eliminate ("the form silently swallows user input"), but in reverse: the
form silently **injects** a value the user never chose.

**Fix:** Preserve `undefined` through the editor lifecycle. Two shapes
work:
```ts
// Option A — keep the Select empty when the source is unset
statoProfezia: el.statoProfezia ?? "",
// handleSave already does: tipo === "profezia" ? (state.statoProfezia || undefined) : undefined
// so empty string correctly collapses to undefined.
```
But HeroUI `Select` with `selectedKey=""` will not render a selected item,
so the Select visually shows "pick a state" which is correct UX for an
unset profezia. Alternatively, tighten `EditorState.statoProfezia` to
`"adempiuta" | "in corso" | "futura" | ""` so the compiler forbids any
other value. Add a test:
```ts
it("does not promote an unset statoProfezia to 'futura' on save", () => {
  // harder to test directly through the rules layer; best pinned via an
  // ElementoEditor React Testing Library test, or by asserting that
  // normalizeElementoInput({ tipo: "profezia", titolo: "x" }).value.statoProfezia
  // is undefined (which it already does).
});
```
Also relevant to future work: `autore` (Elemento.autore) has the same
shape — an annotazione's author is currently not editable and not wired
into `ElementoInput`, so the editor cannot round-trip it. Worth a TODO
now so the gap is visible (see IN-02 below).

### WR-03: `elemento.rules.test.ts` pins only 2 of 6 rejection branches — contract is under-specified

**File:** `src/features/elemento/__tests__/elemento.rules.test.ts:34-112`
**Issue:** The 6 tipo↔field consistency branches in `normalizeElementoInput`
are:
1. nascita/morte on non-personaggio
2. tribu/ruoli on non-personaggio
3. fazioni/esito on non-guerra
4. statoProfezia on non-profezia
5. dettagliRegno on non-regno
6. regione on non-luogo

The test file only covers rejection for (1) `nascita on evento` and (2)
`tribu on guerra`. Branches 3–6 (and the `morte` side of branch 1, and
the `ruoli` side of branch 2, and the `esito` side of branch 3) are all
verified in the **happy path** but never in the **rejection path**. That
means: if someone refactors the checks and accidentally drops the
`statoProfezia` / `dettagliRegno` / `regione` branch, or swaps a tipo name,
the test suite will not catch it. The plan's own stated goal was "the new
contract is pinned by tests" — it is pinned unevenly, with exactly one
positive and one negative case per conceptual pair.

Additionally missing:
- **Boundary year tests.** `validateDataStorica` accepts `anno > 0` as integer.
  Tests never pin `anno = 0` (rejected), `anno = 1` (accepted), `anno = -1`
  (rejected), or `anno` as a non-integer like `2.5` (rejected). Only NaN
  is exercised.
- **Empty-string type-specific fields.** `normalizeElementoInput` trims
  and converts `""` to `undefined` for tribu/fazioni/esito/statoProfezia/
  dettagliRegno/regione. No test pins this — a regression that changed
  `tribu?.trim() || undefined` to `tribu?.trim() ?? undefined` (different
  behavior for whitespace-only strings) would pass silently.
- **`annotazione`-with-extras rejection.** Test #2 verifies a happy
  annotazione with shared fields only. There is no rejection test like
  "annotazione + tribu → tipo_specifico_non_ammesso" to prove annotazione
  is correctly routed through the non-personaggio branch.
- **Trimming for shared fields.** No test pins that
  `{ titolo: "  x  " }` normalizes to `titolo: "x"`.

**Fix:** Add one-liner rejection tests for the 4 uncovered branches
(parameterised via `it.each` to keep the file tight):
```ts
it.each([
  ["fazioni", "personaggio", { fazioni: "x" }],
  ["esito", "personaggio", { esito: "x" }],
  ["statoProfezia", "evento", { statoProfezia: "futura" }],
  ["dettagliRegno", "luogo", { dettagliRegno: "x" }],
  ["regione", "regno", { regione: "x" }],
  ["tribu", "annotazione", { tribu: "levi" }],
  ["morte", "guerra", { morte: DS(500) }],
  ["ruoli", "profezia", { ruoli: ["profeta"] }],
] as const)(
  "rejects %s on a %s with tipo_specifico_non_ammesso",
  (_field, tipo, extra) => {
    const result = normalizeElementoInput({ titolo: "Test", tipo, ...extra });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("tipo_specifico_non_ammesso");
  },
);
```
And three small boundary tests for `validateDataStorica` via
`normalizeElementoInput` (anno 0, anno -1, anno 2.5 → `data_non_valida`),
plus one trimming test for `titolo` / `tribu`.

## Info

### IN-01: `ERROR_MESSAGES` is `Record<string, string>` instead of `Record<ElementoError["type"], string>` — loses compile-time coverage

**File:** `src/ui/workspace-home/ElementoEditor.tsx:114-125`
**Issue:** The lookup table now covers all 10 `ElementoError` variants,
but its type is `Record<string, string>`. If a future `ElementoError`
variant lands (say `concurrency_conflict` for the Jazz layer), TypeScript
will not flag the missing key. The old `IN-03` suggestion to centralise
this as a helper function in `elemento.errors.ts` with an exhaustive
switch is now doubly valuable because the record covers more ground.
**Fix:**
```ts
// elemento.errors.ts
export function formatElementoError(error: ElementoError): string {
  switch (error.type) {
    case "titolo_vuoto": return "Il titolo è obbligatorio";
    case "data_non_valida": return "Data non valida";
    case "tipo_specifico_non_ammesso": return "Campo non valido per questo tipo";
    case "elemento_non_trovato": return "Elemento non trovato";
    case "fonte_non_valida": return "Fonte non valida";
    case "link_non_valido": return "Collegamento non valido";
    case "link_duplicato": return "Collegamento duplicato";
    case "link_auto_riferimento": return "Un elemento non può riferire se stesso";
    case "link_non_trovato": return "Collegamento non trovato";
    case "ruolo_mancante_per_parentela": return "Ruolo parentela mancante";
  }
}
```
Then `ElementoEditor` imports and calls `formatElementoError(error)` —
the compiler enforces completeness across the codebase.

### IN-02: `autore` is in the Elemento model but has no path through the editor / ElementoInput

**File:** `src/features/elemento/elemento.model.ts:59`,
`src/features/elemento/elemento.rules.ts:8-26`,
`src/ui/workspace-home/ElementoEditor.tsx:65-93`
**Issue:** `Elemento.autore?: string` was added in 02-01 for annotazioni.
The editor's `initState` does not read it, `EditorState` has no slot for
it, `ElementoInput` has no field for it, and `normalizeElementoInput`
has no branch for it. This means editing an annotazione cannot set or
preserve `autore` — it is silently dropped the next time the editor
persists anything. Not a bug in the re-review scope (the prototype
doesn't persist), but it is a silent model↔input drift that mirrors
exactly the WR-01 class-of-bug this plan was designed to fix.
**Fix:** Add `autore?: string` to `ElementoInput` and
`NormalizedElementoInput`, gate it `tipo === "annotazione"` in a 7th
consistency branch, wire it into `ElementoEditor.AnnotazioneFields`,
and add a happy+rejection test pair. Alternatively, add a `// TODO(03):`
comment in `AnnotazioneFields` so the gap is visible and the
documentation for 02-02 explicitly covers this "remaining annotation
field" as scheduled for S03/S04.

### IN-03: `elemento.rules.ts` is now 277 lines mixing 3 concerns — evaluate split

**File:** `src/features/elemento/elemento.rules.ts` (whole file)
**Issue:** After 02-02 the file hosts (a) `ElementoInput` + title +
`normalizeElementoInput`, (b) `Fonte` + `validateFonte` + `normalizeFonti`,
and (c) `LinkInput` + `validateLink` + `getInverseLink` + `addLink` /
`removeLink` / `cascadeRemoveLinks`. Constitution V-bis: "Se supera ~150
righe, valutare se mescola concern". At 277 lines the file is nearly 2×
the soft cap, and the three sections are genuinely independent domains
(no cross-references inside the file).
**Fix:** When S03 (Fonti e link inline) adds more validation, split into
`elemento.rules.ts` (core elemento), `fonte.rules.ts` (fonti), and
`link.rules.ts` (link). No refactor needed right now — just a note that
the next plan that touches fonti/link should also carry the split.

### IN-04: `EditorState.statoProfezia` is typed `string` but effectively a 3-value literal union

**File:** `src/ui/workspace-home/ElementoEditor.tsx:50`
**Issue:** `EditorState` fields `nascitaEra`, `morteEra`, `eventoEra`,
`periodoInizioEra`, `periodoFineEra` are all already typed as
`"aev" | "ev"` — tight. `statoProfezia` is typed `string`, losing the
literal-union discipline. The `Select.onSelectionChange` callback at
line 453 literally writes the three allowed values, so the type can be
tightened without changing runtime.
**Fix:**
```ts
statoProfezia: "adempiuta" | "in corso" | "futura" | "";
```
(`""` for the unset case per WR-02 fix.) The null-guard at line 453 then
becomes a no-op at the type level and the compiler proves the Select
cannot introduce foreign strings.

### IN-05: `parseDataStorica` accepts non-finite `anno` via `Number(trimmed)` edge cases

**File:** `src/ui/workspace-home/ElementoEditor.tsx:104-110`
**Issue:** `Number("")` is `0` (correctly caught by the `!trimmed` early
return), `Number("1e3")` is `1000` (accepted — probably fine, exotic
scientific notation is unusual but not wrong), `Number("1_000")` is
`NaN` (rejected by `Number.isInteger`), `Number(" 1 ")` is `1` (accepted
— correct). However `Number("0x10")` is `16` and `Number.isInteger(16)`
is `true` — the helper would silently accept hex input. The
`validateDataStorica` downstream does not re-check string shape, so
year `"0x10"` enters the domain as `16`. Exotic, low risk, but inconsistent
with the `inputMode="numeric"` UX hint on the Input.
**Fix:** Tighten the pre-check:
```ts
function parseDataStorica(annoStr: string, era: "aev" | "ev"): ParseResult {
  const trimmed = annoStr.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return INVALID_DATA;
  const anno = Number(trimmed);
  if (!Number.isInteger(anno) || anno <= 0) return INVALID_DATA;
  return { anno, era, precisione: "esatta" };
}
```

### IN-06: `renderTypeSpecificFields` return type `JSX.Element | null` is wider than reality

**File:** `src/ui/workspace-home/ElementoEditor.tsx:639-666`
**Issue:** Every branch of the switch returns a real JSX element; the
default branch throws. No branch returns `null`, so the declared
`: JSX.Element | null` return type is strictly wider than the actual
behavior. Minor signal loss — `JSX.Element` alone would tighten the
contract. Not a bug.
**Fix:** Change the return annotation to `JSX.Element`. Alternatively
keep `| null` and have `AnnotazioneFields` return `null` instead of a
placeholder paragraph (then drop the "Nessun campo aggiuntivo per questo
tipo" hint or move it to a sibling above the dispatcher call). Either
direction is fine; the inconsistency is the smell.

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
