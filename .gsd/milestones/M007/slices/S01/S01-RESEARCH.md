# S01 Research: Linguaggio di dominio e layout fullheight

**Slice:** S01 — Linguaggio di dominio e layout fullheight
**Requirements owned:** R046 (linguaggio UI), R047 (layout fullheight iPad)
**Complexity:** Light — known patterns, known code, 4 targeted files

---

## Summary

S01 is straightforward. There are exactly **two independent workstreams**:

1. **Language cleanup** — replace 3 user-visible technical strings in `ElementoEditor.tsx:getWarnings()`. The acceptance criterion `rg -i '(markdown|panel|toast|field)' src/ui/'` will match CSS class names (`bg-panel`), component names (`Toast`, `SearchField`, `TextField`), and icon names (`PanelLeft`) — but these are **not user-visible text**. The only actual user-visible technical terms are in the warning messages (lines 196–228).

2. **Layout fullheight** — add `h-full` to two intermediate wrapper `<div>`/`<nav>` elements in NavSidebar and ListPane. The root already has `h-screen`; FullscreenOverlay already has `fixed inset-0`; DetailPane already has `flex-1`. The two missing `h-full` classes break the `flex-1 overflow-y-auto` scroll regions inside each pane.

---

## Implementation Landscape

### File 1: `src/ui/workspace-home/ElementoEditor.tsx`

**User-visible technical terms** are all in `getWarnings()` (lines 193–229):

| Line | Current string | Technical terms | Fix |
|------|----------------|-----------------|-----|
| 200 | `"Manca una descrizione markdown. Aggiungila inline senza lasciare il detail pane."` | **markdown**, **detail pane** | `"Manca una descrizione. Aggiungila direttamente qui."` |
| 207 | `"Nessun ruolo visibile. Il mockup canonico prevede chip modificabili per i ruoli principali."` | **mockup** | `"Nessun ruolo definito."` |
| 213 | `"I board dinamici rispondono ai tag di sessione."` | no banned term | no change needed |
| 224 | `"Usa il picker inline, non il vecchio form globale."` | no banned term | no change needed |

Note: `markdown` also appears in the internal function name `MilkdownEditorInline` and in internal callbacks (line 184: `.markdownUpdated(...)`). These are code identifiers, not user-visible — leave unchanged.

Note: `field` appears extensively as code identifier (`editingFieldId`, `openFieldEditor`, `EditableFieldId`, etc.). Not user-visible — leave unchanged.

**Other toast/field references in this file:**
- `toast("Titolo aggiornato", ...)`, `toast("Tag aggiunto", ...)` etc. — these ARE user-visible strings passed to the toast system, but the content is Italian and correct. The word "toast" does not appear in these strings; the function name `toast` is a code identifier. No change needed for S01 (toast removal is S04).

### File 2: `src/ui/workspace-home/NavSidebar.tsx`

**Layout bug** at lines 100–104:
```tsx
// outer div: flex item of root → h-screen via align-items:stretch ✓
<div className={`flex-shrink-0 overflow-hidden ${sidebarOpen ? "w-[220px]" : "w-0"}`}>
  // inner nav: block element, NO h-full → only grows as tall as content
  <nav className={`w-[220px] flex flex-col border-r border-primary/10 bg-chrome ...`}>
    ...
    <ScrollShadow className="flex-1 overflow-y-auto px-1.5">  // flex-1 won't constrain without bounded parent
```

**Fix:** Add `h-full` to `<nav>` className (line 102).

### File 3: `src/ui/workspace-home/ListPane.tsx`

**Layout bug** at lines 146–152:
```tsx
// outer div: flex item of root → h-screen via align-items:stretch ✓
<div className={`flex-shrink-0 overflow-hidden ${fullscreen ? "w-0" : "w-[300px]"}`}>
  // inner div: block element, NO h-full → only grows as tall as content
  <div className={`w-[300px] flex flex-col border-r ... overflow-hidden ...`}>
    ...
    <ScrollShadow className="flex-1 overflow-y-auto">  // flex-1 won't constrain without bounded parent
```

**Fix:** Add `h-full` to inner `<div>` className (line 148).

### File 4: `src/ui/workspace-home/WorkspacePreviewPage.tsx`

**Root layout** at line 130:
```tsx
<div className="flex h-screen bg-panel font-body">
```

`h-screen` = `100vh`. On iPad Safari, `100vh` does not adjust for the dynamic toolbar (address bar shows/hides). The codebase already uses `min-h-dvh` in `DemoAuthPage.tsx` and `NotFoundPage.tsx`, confirming `dvh` is available in the Tailwind config.

**Fix:** Change `h-screen` → `h-dvh` (= `100dvh`, adjusts for iPad Safari dynamic toolbar). This is a one-word Tailwind class change.

### Files NOT requiring changes for S01

- `src/ui/workspace-home/DetailPane.tsx` — layout is `flex flex-1 flex-col overflow-hidden` (correct flex item), inner `ScrollShadow` uses `flex-1 overflow-y-auto`. No height bug; no technical term strings.
- `src/ui/workspace-home/FullscreenOverlay.tsx` — `fixed inset-0` covers full viewport. No issue.
- `src/ui/workspace-home/workspace-ui-store.ts` — no user-visible strings, no layout.
- `src/ui/mockups/` — dev-only routes at `/dev/mockup-*`. Contain many technical terms but these are design exploration documents, not the app the user sees. The `rg` acceptance check should exclude this folder: `rg -i '(markdown|panel|toast|field)' src/ui/ --glob '!src/ui/mockups/**'`. The planner should adjust the acceptance command accordingly, OR clean up mockups as a bonus task (low priority).

---

## Constraints

- **Constitution IX**: animate only `opacity` and `transform`. The existing `transition-[opacity,transform]` on FullscreenOverlay is already correct. No new animations needed in S01.
- **No Toast removal in S01**: The `toast()` calls and `Toast.Provider` are S04's scope. S01 only fixes user-visible label strings.
- **126/126 tests must pass**: The warning message changes in `getWarnings()` should be reflected in any existing tests that assert on warning text. Check `src/ui/workspace-home/__tests__/` for any tests on `getWarnings`.
- **Acceptance check refinement**: The literal `rg -i '(markdown|panel|toast|field)' src/ui/'` will always hit CSS token `bg-panel` and component names. The planner must either (a) use a refined grep that excludes className attributes, or (b) document this as a known false-positive set and check only string literals.

---

## Verification Plan

1. **Language check** (refined):
   ```bash
   # Check user-visible strings only (JSX children, not className/import/identifier)
   rg -i '(markdown|panel|toast|field)' src/ui/ --glob '!src/ui/mockups/**' -n
   # Manually confirm any remaining hits are CSS tokens or code identifiers
   ```

2. **Layout check** — start dev server and load at 1180×820 and 820×1180:
   ```bash
   pnpm dev
   ```
   - Sidebar background should extend to bottom of screen (no gap below last board item)
   - List pane background should extend to bottom
   - Scroll regions should clip content at bottom of viewport, not overflow

3. **Tests**:
   ```bash
   pnpm test
   ```
   - 126/126 must pass. Check `__tests__/` for any tests asserting on the 3 changed warning strings.

---

## Natural Task Decomposition

**Task T01** (`ElementoEditor.tsx` — language cleanup): Edit `getWarnings()` lines 196–228. Two string replacements. Self-contained; no dependencies.

**Task T02** (`WorkspacePreviewPage.tsx` + `NavSidebar.tsx` + `ListPane.tsx` — fullheight layout): Three targeted className additions/changes. Self-contained; no dependencies on T01.

These can be done in parallel or sequentially — no ordering constraint.
