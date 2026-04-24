# S01: Linguaggio di dominio e layout fullheight — UAT

**Milestone:** M007
**Written:** 2026-04-24T09:40:44.163Z

# UAT — S01: Linguaggio di dominio e layout fullheight

## Preconditions
- Dev server running (`pnpm dev`)
- Browser set to iPad viewport: 1180×820 landscape and 820×1180 portrait
- At least one Elemento of type Persona exists in the workspace

---

## Test Case 1 — Warning strings use Italian domain language (R046)

**Goal:** Confirm no user-visible text contains "markdown", "mockup", or "detail pane".

**Steps:**
1. Open the workspace and select an Elemento of type Persona that has no description and no roles.
2. Observe the warning panel in the detail pane.
3. Expected: Warning reads "Manca una descrizione. Aggiungila direttamente qui." (NOT "markdown" or "detail pane").
4. Expected: Warning reads "Nessun ruolo definito." (NOT "mockup canonico").
5. Open the empty-warnings panel (select an Elemento with no warnings).
6. Expected: Empty state reads "Nessun avviso attivo." (NOT "allineato al mockup").

**Pass criteria:** None of the strings "markdown", "mockup", or "detail pane" appear in any user-visible text in the warnings area.

---

## Test Case 2 — Root layout fills iPad landscape viewport without external scroll (R047)

**Goal:** Confirm the 3-pane layout fills 100% of the viewport in landscape orientation.

**Steps:**
1. Set browser viewport to 1180×820 (iPad landscape).
2. Navigate to the workspace home page.
3. Observe the sidebar background (NavSidebar), list background (ListPane), and detail area (DetailPane).
4. Scroll the document (not the internal scroll regions) — attempt to scroll the page itself.
5. Expected: The document does not scroll; sidebar and list backgrounds reach the bottom of the viewport.
6. Scroll inside the list pane (the element list) — expected: internal scroll clips at the viewport bottom.
7. Scroll inside the nav sidebar (the board list) — expected: internal scroll clips at the viewport bottom.

**Pass criteria:** Document-level scroll is absent; sidebar and list backgrounds visually extend to the bottom edge of the 1180×820 viewport.

---

## Test Case 3 — Root layout fills iPad portrait viewport without external scroll (R047)

**Goal:** Same as Test Case 2 in portrait orientation.

**Steps:**
1. Set browser viewport to 820×1180 (iPad portrait).
2. Repeat steps 2–7 from Test Case 2.

**Pass criteria:** Same as Test Case 2; no regression introduced by portrait orientation.

---

## Test Case 4 — Edge case: Safari iPadOS dynamic toolbar does not cause overflow

**Goal:** Confirm h-dvh handles the Safari dynamic toolbar correctly.

**Steps:**
1. (Manual — iOS Safari only) Open the app in Safari on iPad.
2. Scroll down slightly to trigger the dynamic toolbar collapse.
3. Observe whether any white space or overflow appears at the bottom of the layout.

**Pass criteria:** Layout adjusts to the available visual viewport; no overflow or white gap appears when the toolbar collapses or expands.

---

## Test Case 5 — Code identifiers unchanged (non-regression)

**Goal:** Confirm the technical term replacement did not affect code identifiers or component names.

**Steps:**
1. Open the description field of an Elemento (Milkdown editor).
2. Type a description and blur the field.
3. Expected: Description saves normally; no console errors; no visible breakage.
4. Open the ElementoEditor for a Persona with existing description.
5. Expected: MarkdownPreview renders the description correctly.

**Pass criteria:** Description field works correctly; Milkdown renders; no regressions in editor functionality.
