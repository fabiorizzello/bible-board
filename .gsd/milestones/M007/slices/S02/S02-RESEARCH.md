# S02 Research — Warning reali (rimozione check di completezza)

## Summary

The warning system currently lives entirely in `src/ui/workspace-home/ElementoEditor.tsx` as a pure UI-layer function `getWarnings` (lines 193–229). There is **no `computeValidityWarnings` helper in the domain layer yet** — this slice must create it in `src/features/elemento/elemento.rules.ts` and rewire the UI to use it.

---

## 1. Current Warning Logic

### Location: `src/ui/workspace-home/ElementoEditor.tsx` lines 193–229

```ts
function getWarnings(element: Elemento): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // COMPLETENESS CHECK #1 — must be removed
  if (!element.descrizione.trim()) {
    warnings.push({ field: "descrizione", label: "Descrizione", message: "Manca una descrizione. Aggiungila direttamente qui." });
  }

  // COMPLETENESS CHECK #2 — must be removed
  if (element.tipo === "personaggio" && (!element.ruoli || element.ruoli.length === 0)) {
    warnings.push({ field: "ruoli", label: "Ruoli", message: "Nessun ruolo definito." });
  }

  // COMPLETENESS CHECK #3 — must be removed
  if (element.tipo !== "annotazione" && element.tags.length === 0) {
    warnings.push({ field: "tags", label: "Tag", message: "I tag sono vuoti. I board dinamici rispondono ai tag di sessione." });
  }

  // COMPLETENESS CHECK #4 — must be removed
  if (element.tipo !== "annotazione" && element.link.length === 0) {
    warnings.push({ field: "collegamenti-generici", label: "Collegamenti", message: "Nessun collegamento visibile. Usa il picker inline, non il vecchio form globale." });
  }

  return warnings;
}
```

All four checks are **completeness checks** (missing optional fields). None check actual validity. All must be removed.

### Related type: `ValidationWarning` at line 74

```ts
type ValidationWarning = {
  field: EditableFieldId;
  label: string;
  message: string;
};
```

This type is local to the UI file. The domain helper will need its own interface.

### Consumed at:
- Line 355: `const warnings = useMemo(() => getWarnings(element), [element]);`
- Lines 661–668: passed to `<ReviewDrawer warnings={warnings} .../>` — the bell-icon drawer in the header

---

## 2. Domain Model Shape

### `Elemento` interface — `src/features/elemento/elemento.model.ts`

Key fields for validity checking:
- `date?: DataTemporale` — optional; when present must be valid
- `nascita?: DataStorica` — personaggio only; when present must be valid
- `morte?: DataStorica` — personaggio only; when present must be valid
- `link: readonly ElementoLink[]` — each `link.targetId: string`
- No `deletedAt` on the domain `Elemento` — that lives on the Jazz CoMap (schema)

### Soft-delete mechanism
- Jazz CoMap has `deletedAt: z.string().optional()` (schema line 81)
- `softDeleteWorkspaceElemento` sets `elemento.deletedAt = new Date().toISOString()`
- `WorkspacePreviewPage` filters `.filter((e: any) => !e.deletedAt)` before building the domain `Elemento[]`
- **Result: `getJazzElementi()` already returns only live elements** — elements with `deletedAt` set are excluded from the store

### Broken link detection
`resolveCollegamenti` in `display-helpers.ts` (line 269) resolves targetIds via `getResolvedElementMap()`. When a target is missing: `target?.titolo ?? link.targetId` — it falls back to the raw ID string with no signal. **There is currently no broken-link detection.**

A link to a soft-deleted element IS a broken reference because soft-deleted elements are excluded from `getJazzElementi()`. If element A links to element B and B is soft-deleted, B won't appear in the map, so `resolveCollegamenti` silently shows the raw ID.

---

## 3. What Needs to Change

### A. New domain helper: `computeValidityWarnings`

**Location:** `src/features/elemento/elemento.rules.ts`

**Contract:**

```ts
export interface ValidityWarning {
  readonly field: "date" | "nascita" | "morte" | "link";
  readonly targetId?: string;   // only for broken-link warnings
  readonly message: string;
}

export function computeValidityWarnings(
  elemento: Elemento,
  resolveId: (id: string) => boolean   // returns true if ID exists (not deleted)
): readonly ValidityWarning[]
```

The `resolveId` callback keeps the domain function pure — no Jazz import, no UI store access. The caller (UI layer) passes a lookup function backed by `getJazzElementi()`.

**Checks to implement:**
1. If `elemento.date` is present → `validateDataTemporale(elemento.date).isErr()` → warning `field: "date"`
2. If `elemento.nascita` is present → `validateDataStorica(elemento.nascita).isErr()` → warning `field: "nascita"`
3. If `elemento.morte` is present → `validateDataStorica(elemento.morte).isErr()` → warning `field: "morte"`
4. For each `elemento.link`: if `!resolveId(link.targetId)` → warning `field: "link"`, `targetId: link.targetId`

Note: `validateDataTemporale` and `validateDataStorica` are already imported in `elemento.rules.ts` (lines 5–6). No new imports needed for the date checks.

### B. UI wiring: `ElementoEditor.tsx`

1. **Remove** the `getWarnings` function (lines 193–229) entirely
2. **Replace** `const warnings = useMemo(() => getWarnings(element), [element]);` with a call to `computeValidityWarnings`, passing a resolver built from `getJazzElementi()`
3. **Map** `ValidityWarning[]` → `ValidationWarning[]` for the existing `ReviewDrawer` (which needs `field: EditableFieldId` and `label: string`) — or update `ReviewDrawer` to accept the domain type directly
4. The `ValidationWarning.field` type is `EditableFieldId`; domain warning fields (`"date"`, `"nascita"`, `"morte"`, `"link"`) need to map to valid `EditableFieldId` values. Check `EditableFieldId` definition before wiring.

### C. Warning messages (domain strings from S01)
Per S01 output, user-visible strings are in Italian domain language. New warning messages should follow the same convention. Suggested strings:
- Date invalida (date): `"La data dell'elemento non è valida."`
- Nascita invalida (nascita): `"La data di nascita non è valida."`
- Morte invalida (morte): `"La data di morte non è valida."`
- Link rotto (link): `"Collegamento a elemento non trovato (potrebbe essere stato eliminato)."`

---

## 4. What Does NOT Change

- `normalizeElementoInput` — not touched; it validates on write, not on read
- `getInverseLink`, `addLink`, `removeLink`, `cascadeRemoveLinks` — not touched
- All existing `ValidateFonte` / `addFonte` / `removeFonte` logic — not touched
- The `ReviewDrawer` component structure — only the data feeding it changes
- Test files for adapter — not touched
- The 126 existing tests in `elemento.rules.test.ts` and `elemento.adapter.test.ts` — must continue to pass

---

## 5. Files to Create/Modify

| File | Change |
|---|---|
| `src/features/elemento/elemento.rules.ts` | Add `ValidityWarning` interface + `computeValidityWarnings` function |
| `src/ui/workspace-home/ElementoEditor.tsx` | Remove `getWarnings`, rewire `useMemo` to `computeValidityWarnings`, map to `ValidationWarning[]` |
| `src/features/elemento/__tests__/elemento.rules.test.ts` | Add tests for `computeValidityWarnings` |

No new files needed.

---

## 6. EditableFieldId Lookup

The `EditableFieldId` type is imported from `./workspace-ui-store` in the editor. The domain `ValidityWarning.field` values (`"date"`, `"nascita"`, `"morte"`, `"link"`) must map to valid `EditableFieldId` values. The planner must check the `EditableFieldId` union in `workspace-ui-store.ts` before writing the mapper.

---

## 7. Verification Commands

```bash
# Run all tests — must show 126/126 passing
npx vitest run

# Verify completeness checks are gone from the editor
rg "manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile" src/ --type ts --type tsx -i

# Verify computeValidityWarnings is exported from rules
rg "computeValidityWarnings" src/features/elemento/elemento.rules.ts

# Verify getWarnings is gone
rg "getWarnings" src/ui/workspace-home/ElementoEditor.tsx

# TypeScript compile check
npx tsc --noEmit
```

---

## 8. Acceptance Criteria Traceability

| Criterion | Implementation |
|---|---|
| Elemento minimale (solo titolo) → zero warning | `computeValidityWarnings` only checks present+invalid fields — absent fields produce no warnings |
| Data malformata → warning visibile inline | Date validity checks via `validateDataTemporale` / `validateDataStorica` |
| Link a elemento soft-deleted → warning visibile | `resolveId` callback returns false for any ID not in `getJazzElementi()` (soft-deleted elements excluded from that store) |

---

## 9. Memory Reference

MEM066 confirms the decision: "Solo warning di validità (data invalida, referenza rotta, link a elemento eliminato). Rimossi check di completezza (manca descrizione/tag/link)."
