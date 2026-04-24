# S04: Notification center iPad-native (bell + drawer + rollback) — UAT

**Milestone:** M007
**Written:** 2026-04-24T10:44:24.506Z

# S04 UAT: Notification Center

## Preconditions
- App running in dev or prod build
- Workspace with at least 2 elementi loaded
- Browser devtools available for store inspection

---

## Test 1: Bell appears in NavSidebar footer
**Steps:**
1. Open the workspace 3-pane view
2. Inspect the NavSidebar footer row

**Expected:** `<NotificationBell>` appears between the "Impostazioni" button and the ThemeSwitcher. Touch target is ≥44×44px. No badge visible when no notifications exist.

---

## Test 2: Edit an elemento title → bell shows badge, drawer opens with update entry
**Steps:**
1. Select an elemento in the list
2. Edit the title in the detail pane and blur (commit)
3. Observe the bell icon

**Expected:** Bell badge (accent dot) appears. Click bell → drawer opens from the right (placement=right, max-w-[420px]). Drawer shows one entry: Pencil icon + "Aggiornato [label]" + relative timestamp ("ora"). "Annulla" button visible.

---

## Test 3: Blur without change does not generate notification
**Steps:**
1. Select an elemento
2. Click into the description field, do NOT change text, click elsewhere

**Expected:** Bell badge does NOT appear. Drawer (if already open) shows no new entry.

---

## Test 4: Rollback update via drawer
**Steps:**
1. Edit an elemento title (e.g. "Abraamo" → "Abramo")
2. Open the notification drawer
3. Click "Annulla" on the update entry

**Expected:** elemento title reverts to previous value in the UI. The entry in the drawer shows "Annullato" badge. "Annulla" button is gone. Clicking "Annulla" a second time is a no-op (idempotent).

---

## Test 5: Create link → drawer shows create entry with rollback
**Steps:**
1. Open ElementoEditor for an elemento
2. Add a "collegamento famiglia" (parentela link)
3. Open drawer

**Expected:** Entry with Plus icon + "Collegamento famiglia aggiunto". Click "Annulla" → link removed, inverse link removed, entry shows "Annullato".

---

## Test 6: Delete link → drawer shows delete entry with rollback
**Steps:**
1. Open ElementoEditor, remove an existing collegamento
2. Open drawer

**Expected:** Entry with Trash icon + "Collegamento rimosso". Click "Annulla" → link restored bidirectionally. Entry shows "Annullato".

---

## Test 7: Soft-delete elemento → drawer shows delete entry with rollback
**Steps:**
1. Select an elemento in the detail pane
2. Click the delete/eliminate action
3. Observe bell and open drawer

**Expected:** Elemento disappears from list. Drawer shows entry: Trash icon + `"[titolo]" eliminato`. Click "Annulla" → elemento reappears in the list. Entry shows "Annullato".

---

## Test 8: Add/remove fonte → drawer entries present
**Steps:**
1. Open ElementoEditor, add a fonte (any type)
2. Then remove it

**Expected:** Two drawer entries: "Fonte aggiunta" (create, Plus) and "Fonte rimossa" (delete, Trash). Both have "Annulla" button. Rollback each independently.

---

## Test 9: Empty drawer state
**Steps:**
1. Hard-refresh (new session) or call clearAll() via devtools
2. Open drawer via bell

**Expected:** Drawer body shows "Nessuna attività recente" (Italian empty state). No list items.

---

## Test 10: Badge pulse animation on new notification
**Steps:**
1. Start with 0 notifications
2. Make a mutation (e.g. edit a title)
3. Observe bell badge

**Expected:** Badge appears with pulse animation (~300ms). Under `prefers-reduced-motion: reduce` OS setting, badge appears without animation.

---

## Test 11: Multiple notifications ordered newest-first
**Steps:**
1. Make 3 mutations in sequence (edit title, add fonte, remove link)
2. Open drawer

**Expected:** Entries appear newest-first (most recent at top). Each shows correct tipo icon and label.

---

## Test 12: System error in ListPane is inline, not in drawer
**Steps:**
1. Simulate no-account scenario (or trigger creation error) in ListPane
2. Check bell and drawer

**Expected:** Error appears as inline red text ("Account non disponibile" or "Errore creazione: ...") near the list header. Bell badge does NOT appear. Drawer does NOT contain the error.

---

## Test 13: No Toast.Provider / no toast visible anywhere
**Steps:**
1. Perform any mutation (create/update/delete elemento, link, fonte)
2. Check bottom of viewport for toast overlay

**Expected:** No toast overlay appears anywhere. All feedback is exclusively in the notification drawer.
