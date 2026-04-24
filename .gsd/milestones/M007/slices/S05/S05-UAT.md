# S05: A11y baseline + density uniforme + animation polish — UAT

**Milestone:** M007
**Written:** 2026-04-24T10:54:49.142Z

# S05 UAT Script — A11y baseline + animation polish

## Preconditions
- App running in dev mode (`pnpm dev`)
- At least 2 boards exist in the workspace
- At least 1 elemento with an annotazione linked to it
- Browser: Chrome or Firefox (keyboard nav)
- Optional: VoiceOver/NVDA for screen reader checks

---

## TC-01: Tab-nav reaches board items in NavSidebar

**Steps:**
1. Focus the browser tab (click anywhere in the app).
2. Press Tab repeatedly until focus reaches the NavSidebar board list.
3. Observe: a visible teal focus ring (tokens.css global `:focus-visible`) appears on each board item div.
4. With focus on a board item, press Enter.
5. Observe: the board is selected (list pane updates to show that board's elements).
6. Tab back to a board item, press Space.
7. Observe: same selection behavior as Enter.

**Expected:** Focus ring visible on board items; Enter and Space both trigger selection; tab order flows sidebar → list → detail without gaps.

---

## TC-02: Keyboard nav does not conflict with inline rename

**Steps:**
1. Double-click a board item name to trigger inline rename mode.
2. While the rename input is active, press Enter.
3. Observe: rename commits (not board re-selected).
4. Press Escape.
5. Observe: rename cancelled (not board deselected).

**Expected:** The rename's own Enter/Escape handling wins while `isRenaming` is true; the board-selection onKeyDown is suppressed.

---

## TC-03: aria-label "Modifica titolo" announced

**Steps:**
1. Open an elemento in DetailPane.
2. Using a screen reader (or inspect with DevTools Accessibility panel), focus the title display area in ElementoEditor.
3. Observe the accessible name announced / shown.

**Expected:** Accessible name is "Modifica titolo".

---

## TC-04: aria-label "Modifica descrizione" announced

**Steps:**
1. Open an elemento in DetailPane that has a description.
2. Focus or inspect the description display area (the area showing the MarkdownPreview).

**Expected:** Accessible name is "Modifica descrizione".

---

## TC-05: aria-label dynamic on annotation navigate button

**Steps:**
1. Open an elemento that has at least one annotazione linked.
2. In the Annotazioni section of DetailPane, inspect or focus the navigate button next to an annotation.

**Expected:** Accessible name is "Apri annotazione: <titolo dell'annotazione>" where `<titolo>` matches the annotation's actual title.

---

## TC-06: aria-pressed reflects palette selection

**Steps:**
1. Open ThemeSwitcher (palette selector).
2. Inspect palette buttons with DevTools Accessibility panel or screen reader.
3. Click a palette button that is not currently selected.
4. Observe: the clicked button gains `aria-pressed="true"`; previously selected loses it.

**Expected:** Exactly one palette button has `aria-pressed="true"` at any time; all others have `aria-pressed="false"`.

---

## TC-07: No transition-all in src/ui/

**Steps:**
1. In terminal: `rg 'transition-all' src/ui/`

**Expected:** Zero output (exit code 1 or empty).

---

## TC-08: prefers-reduced-motion disables animations

**Steps:**
1. In browser DevTools → Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce`.
2. Perform actions that trigger animations (open drawer, toggle elements).
3. Observe: no opacity/transform transitions play.

**Expected:** All animated elements render in end-state immediately with no motion.

