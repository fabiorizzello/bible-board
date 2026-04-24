# S05 Research — A11y baseline + density uniforme + animation polish

**Date:** 2026-04-24
**Slice:** S05 (risk: medium, depends: S01)
**Researcher:** Scout agent

---

## Executive Summary

The codebase is in **good shape** for S05. There are **zero `transition-all` occurrences in `src/ui/workspace-home/`** (only in mockups which are out of scope). The `prefers-reduced-motion` baseline is already handled globally in `src/styles/tokens.css`. All `isIconOnly` buttons already carry `aria-label`. The HeroUI ListBox components in NavSidebar and ListPane already provide keyboard navigation via React Aria. The scope of S05 is therefore **narrower than feared**: it is about verifying, hardening, and closing a small set of remaining gaps — not about sweeping fixes.

---

## 1. Audit: `transition-all` Occurrences

### In `src/ui/workspace-home/` — ZERO hits

No `transition-all` in any workspace-home component. All transitions use:
- `transition-opacity` — NavSidebar.tsx:102, ListPane.tsx:148
- `transition-[opacity,transform]` — FullscreenOverlay.tsx:41
- `transition-colors` — ElementoEditor.tsx (multiple), ListPane.tsx, NavSidebar.tsx, DetailPane.tsx
- `transition-transform` — WorkspacePreviewPage.tsx:78 (FAB button)

### In `src/ui/mockups/` — 4 hits (out of scope)

| File | Line | Class | Verdict |
|------|------|-------|---------|
| `CommitInteractionMockup.tsx` | 274 | `transition-all duration-200` | Mockup — out of scope for AC |
| `UnifiedEditorMockup.tsx` | 1895 | `transition-all duration-200` | Mockup — out of scope for AC |
| `MockupsIndex.tsx` | 175 | `transition-all` | Mockup — out of scope for AC |
| `MockupsIndex.tsx` | 243 | `transition-all` | Mockup — out of scope for AC |

**AC status:** `rg 'transition-all' src/ui/workspace-home/` → zero hits already satisfied. If the AC means all of `src/ui/` (including mockups), the mockup files need fixing too — but mockups are dev-only artifacts. **Recommend scoping the check to `src/ui/workspace-home/`.**

---

## 2. Audit: `aria-label` on `isIconOnly` Buttons

Cross-referencing all `isIconOnly` usages against `aria-label` presence:

| File | Line (isIconOnly) | aria-label | Status |
|------|-------------------|------------|--------|
| `FullscreenOverlay.tsx` | 64 | Line 67: `"Esci da schermo intero"` | OK |
| `ThemeSwitcher.tsx` | 165 | Line 168: `"Cambia palette colori"` | OK |
| `ThemeSwitcher.tsx` | 181 | Line 184: dynamic `isDark` check | OK |
| `NavSidebar.tsx` | 205 | Line 207: `"Nuovo board"` | OK |
| `NavSidebar.tsx` | 271 | Line 273: `"Azioni per ${board.nome}"` | OK |
| `NavSidebar.tsx` | 398 | Line 401: `"Chiudi navigazione"` | OK |
| `ElementoEditor.tsx` | 670 | Line 673: `"Apri in fullscreen"` | OK |
| `ElementoEditor.tsx` | 937 | Line 939: `"Azioni elemento"` | OK |
| `ListPane.tsx` | 159 | Line 162: `"Apri navigazione"` | OK |
| `ListPane.tsx` | 218 | Line 220: `"Nuovo elemento"` | OK |

**All `isIconOnly` HeroUI Buttons have `aria-label`. No gaps found.**

---

## 3. Audit: Icon-Only `<button>` Elements (raw HTML, not HeroUI)

Raw `<button>` elements that contain only icons (no visible text):

| File | Line | Content | aria-label | Status |
|------|------|---------|------------|--------|
| `ElementoEditor.tsx` | 1437 | `<X>` icon (remove tag) | Line 1441: `"Rimuovi ${item}"` | OK |
| `ElementoEditor.tsx` | 1492 | `<X>` icon (remove link) | Line 1496: `"Rimuovi ${link.titolo}"` | OK |
| `ElementoEditor.tsx` | 1646 | `<X>` icon (remove fonte) | Line 1650: `"Rimuovi ${fonte.valore}"` | OK |
| `ElementoEditor.tsx` | 1022 | Title edit button (text content = `{value}`) | MISSING | **GAP** |
| `ElementoEditor.tsx` | 1354 | Description edit button (contains `<MarkdownPreview>`) | MISSING | **GAP** |
| `ElementoEditor.tsx` | 1068 | Warning item button in ReviewDrawer | MISSING | Contextual |
| `DetailPane.tsx` | 178 | Annotation navigate button | MISSING | **GAP** |
| `ThemeSwitcher.tsx` | 201 | Palette selection button | MISSING | **GAP** |
| `WorkspacePreviewPage.tsx` | 76 | FAB `+` button | Line 79: `"Aggiungi campo"` | OK |
| `ListPane.tsx` | 180 | Vista lista `<button>` | Line 188: `aria-label="Vista lista"` | OK |
| `ListPane.tsx` | 196 | Vista timeline `<button>` | Line 204: `aria-label="Vista timeline"` | OK |
| `ListPane.tsx` | 297 | Sort column `<button>` | Line 306: dynamic `aria-label` | OK |

**Gaps identified (4 buttons need `aria-label` or accessible name):**

1. **`ElementoEditor.tsx:1022`** — `InlineTitle` display button. The button's visible text is `{value}` (element title), so it has a text node. The issue is it lacks an explicit `aria-label` that communicates the action ("Modifica titolo"). Screen readers would announce the title text only, not the affordance.

2. **`ElementoEditor.tsx:1354`** — Description display button. The button contains `<MarkdownPreview>`, which renders plain text. No `aria-label` communicating "Modifica descrizione".

3. **`DetailPane.tsx:178`** — Annotation navigate button. Contains text (`ann.titolo`) but no explicit label for the action. Acceptable as-is (text is descriptive enough), but could be enhanced with `aria-label={`Apri annotazione: ${ann.titolo}`}`.

4. **`ThemeSwitcher.tsx:201`** — Palette selection button. Has visible text (`p.name`), so technically accessible, but `aria-pressed` state is missing to indicate selection.

---

## 4. Audit: `prefers-reduced-motion`

### Global handler in `src/styles/tokens.css:85-93`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is a **nuclear global override** that disables ALL transitions and animations when the user prefers reduced motion. This satisfies the AC requirement "prefers-reduced-motion disabilita tutte le nuove animazioni" at the global level.

**No Tailwind `motion-reduce:` prefixes are used anywhere in `src/ui/`** — this is fine because the global CSS rule covers everything.

**Verdict: Already compliant.** No per-component changes needed for `prefers-reduced-motion`.

---

## 5. Audit: Keyboard Navigation (Tab order, 3-pane)

### NavSidebar (keyboard nav analysis)

- Uses HeroUI `ListBox` (React Aria) for "Recenti" and "Tutti gli elementi" nav items → **keyboard nav provided by React Aria** (Arrow keys to navigate items, Enter/Space to select)
- Board items use custom `div[role="option"]` with `onClick` → **keyboard gap**: these `div` elements are NOT keyboard-focusable by default. They have no `tabIndex` and no `onKeyDown`. Clicking with keyboard requires them to be focusable.
  - **File:** `NavSidebar.tsx:221-295`
  - **Fix needed:** Add `tabIndex={0}` + `onKeyDown` handler for Enter/Space on each board `div[role="option"]`
- Note: MEM049 documents this was a deliberate choice (ListBox conflicted with inline rename), so the workaround div approach is intentional — but `tabIndex={0}` was apparently missed.

### ListPane (keyboard nav analysis)

- "Recenti" list uses HeroUI `ListBox` → React Aria keyboard nav ✓
- "Elementi" list uses HeroUI `ListBox` → React Aria keyboard nav ✓
- Sort column buttons (`<button>` elements) → natively keyboard-focusable ✓
- View toggle buttons (`<button>` elements) → natively keyboard-focusable ✓
- SearchField is HeroUI → keyboard-accessible ✓
- TagGroup for tipo filters is HeroUI → React Aria handles keyboard ✓

### DetailPane / ElementoEditor (keyboard nav analysis)

- `InlineTitle` button: natively focusable `<button>` ✓
- `ChipButton` components: natively focusable `<button>` ✓
- HeroUI `Dropdown`, `Popover`, `Drawer` → React Aria keyboard nav ✓
- Remove buttons inside chips: natively focusable ✓
- Warning buttons in ReviewDrawer: natively focusable ✓
- Description edit button: natively focusable ✓

### Focus Ring Verification

`src/styles/tokens.css:78-82` provides:
```css
:focus-visible {
  outline: 2px solid var(--board-color-primary);  /* #0d9488 teal */
  outline-offset: 2px;
  border-radius: 0.5rem;
}
```

This is a global `:focus-visible` rule — applies to all interactive elements. WCAG 2.1 AA requires a focus indicator with at least 3:1 contrast ratio. `#0d9488` (teal) on white background = ~4.5:1 contrast → **compliant**.

HeroUI components (React Aria) also add their own focus ring via `data-[focus-visible]` attributes — the global CSS should override or complement this.

---

## 6. Issue Table (Concrete Audit)

| # | File | Line | Issue | Fix | Priority |
|---|------|------|-------|-----|----------|
| 1 | `NavSidebar.tsx` | 221-295 | Board `div[role="option"]` elements not keyboard-focusable | Add `tabIndex={0}` + `onKeyDown` (Enter/Space → navigate) | HIGH |
| 2 | `ElementoEditor.tsx` | 1022 | `InlineTitle` display button lacks action-describing `aria-label` | Add `aria-label="Modifica titolo"` | MEDIUM |
| 3 | `ElementoEditor.tsx` | 1354 | Description display button lacks `aria-label` | Add `aria-label="Modifica descrizione"` | MEDIUM |
| 4 | `ThemeSwitcher.tsx` | 201 | Palette selection button lacks `aria-pressed` state | Add `aria-pressed={activePalette === p.name}` | LOW |
| 5 | `DetailPane.tsx` | 178 | Annotation button missing action aria-label | Add `aria-label={`Apri annotazione: ${ann.titolo}`}` | LOW |
| 6 | `ElementoEditor.tsx` | 303 | `ChipButton` (tipo/data/vita/etc) lacks `aria-label` | `ChipButton` renders visible label+value text → accessible, but add `aria-label` to button combining label+value | LOW |
| 7 | Mockups: `CommitInteractionMockup.tsx:274`, `UnifiedEditorMockup.tsx:1895`, `MockupsIndex.tsx:175,243` | — | `transition-all` in mockup files | Replace with `transition-[opacity,transform]` if AC covers full `src/ui/` | LOW |

---

## 7. Implementation Landscape

### Files Requiring Changes

| File | Change Type | Effort |
|------|-------------|--------|
| `src/ui/workspace-home/NavSidebar.tsx` | Add `tabIndex={0}` + `onKeyDown` to board `div[role="option"]` items | Small (5-10 lines) |
| `src/ui/workspace-home/ElementoEditor.tsx` | Add `aria-label` to InlineTitle button and description button | Minimal (2 attributes) |
| `src/ui/workspace-home/ThemeSwitcher.tsx` | Add `aria-pressed` to palette buttons | Minimal (1 attribute) |
| `src/ui/workspace-home/DetailPane.tsx` | Add `aria-label` to annotation navigate button | Minimal (1 attribute) |
| `src/ui/mockups/*.tsx` | Replace `transition-all` with `transition-[opacity,transform]` | Minimal if in scope |

**No new files needed.** No architectural changes needed. All fixes are surgical attribute additions.

### What NOT to Change (Already Compliant)

- `prefers-reduced-motion` — global CSS rule already covers all animations
- Focus ring — global `:focus-visible` rule already applied
- All `isIconOnly` HeroUI buttons — all have `aria-label`
- `transition-all` in workspace-home — zero occurrences
- HeroUI ListBox keyboard nav — React Aria provides this out of the box
- `aria-hidden` on hidden panes — already applied correctly

---

## 8. Natural Seams for Task Decomposition

Tasks can be built independently:

### T01 — Keyboard nav on board items in NavSidebar (HIGH priority, blocking)
- **Scope:** `NavSidebar.tsx:221-295`
- **Work:** Add `tabIndex={0}`, `onKeyDown` (Enter/Space to navigate), `onKeyDown` for rename inline (Escape already handled)
- **Risk:** Low — additive change only
- **Verify:** Manual tab navigation through board list

### T02 — aria-label on action buttons (MEDIUM priority)
- **Scope:** `ElementoEditor.tsx:1022,1354`, `DetailPane.tsx:178`
- **Work:** Add 3 `aria-label` attributes
- **Risk:** Minimal
- **Verify:** `axe-core` or browser a11y audit; check screen reader announcement

### T03 — aria-pressed on ThemeSwitcher palette buttons (LOW priority)
- **Scope:** `ThemeSwitcher.tsx:201`
- **Work:** Add `aria-pressed={activePalette === p.name}` to palette button
- **Risk:** Minimal
- **Verify:** Check that aria-pressed toggles correctly

### T04 — transition-all in mockups (LOW priority, AC-dependent)
- **Scope:** 4 mockup files
- **Work:** Replace `transition-all` with `transition-[opacity,transform]`
- **Risk:** Minimal — cosmetic only
- **Verify:** `rg 'transition-all' src/ui/` → zero hits

---

## 9. Build First (Risk Order)

**Highest risk / most blocking:** T01 (NavSidebar board keyboard nav). The board items use a custom `div[role="option"]` workaround (per MEM049) which currently breaks keyboard navigation for the board list entirely. This is the only structural gap that affects core 3-pane tab navigation.

**Second:** T02 (aria-label on edit buttons). These are the most meaningful a11y gaps for screen reader users.

**Third/Fourth:** T03, T04 are polish items.

---

## 10. Verification Commands

```bash
# AC1: transition-all in workspace-home → zero hits
rg 'transition-all' src/ui/workspace-home/

# AC2: transition-all in all src/ui → check scope (includes mockups)
rg 'transition-all' src/ui/

# AC3: All icon-only buttons have aria-label
rg 'isIconOnly' src/ui/workspace-home/ -A3 | grep -v 'aria-label'

# AC4: prefers-reduced-motion coverage
grep -n 'prefers-reduced-motion' src/styles/tokens.css

# AC5: Test suite still passes
npx vitest run
```

Manual verification:
- Tab through 3-pane: sidebar items → board items → list items → detail controls
- Each focusable element shows teal `outline: 2px solid` focus ring
- Activate OS "Reduce Motion" → no transitions/animations visible
- Screen reader (VoiceOver/NVDA) announces icon-only button labels correctly

---

## 11. Prior Art / Memory Notes Applied

- **MEM051:** Width-collapse animation pattern (outer instant-collapse + inner opacity fade) — already correctly implemented in NavSidebar and ListPane. No changes needed.
- **MEM053:** `transition-all` forward-safety warning — already addressed in workspace-home; mockups are the only remaining hits.
- **MEM049:** Board items use `div[role="option"]` due to ListBox+rename conflict — this is why T01 needs `tabIndex={0}`.
- **tokens.css:78-82:** Global `:focus-visible` rule provides WCAG AA focus ring.
- **tokens.css:85-93:** Global `prefers-reduced-motion` block already handles all animation disabling.
