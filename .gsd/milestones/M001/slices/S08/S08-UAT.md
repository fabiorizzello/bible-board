# S08: Jazz persistence - migrazione mock a CRDT — UAT

**Milestone:** M001
**Written:** 2026-04-23T10:43:25.073Z

# S08 UAT — Jazz Persistence

## Preconditions
- Dev server running (`pnpm dev` → `http://localhost:5173`)
- Fresh browser profile OR cleared localStorage (DevTools → Application → Local Storage → Clear)
- Browser console open to monitor `console.warn` output

---

## TC-01: DemoAuth — first login creates workspace

**Steps:**
1. Navigate to `http://localhost:5173/`
2. Expect: redirected to `/auth` (RequireAuth guard fires)
3. Enter name `"Marco"` and submit
4. Expect: redirected to workspace home (`/`)
5. Expect: workspace title "Il mio workspace" visible in sidebar
6. Open DevTools → Application → Local Storage
7. Expect: Jazz account key present (e.g. `jazz-account-*`)

---

## TC-02: DemoAuth — logout and re-login resumes same workspace

**Steps:**
1. From TC-01 state, open sidebar settings / logout
2. Expect: redirected to `/auth`
3. Enter same name `"Marco"` and submit
4. Expect: same workspace with same elements visible (none if workspace was empty)
5. Expect: no duplicate workspace created

---

## TC-03: Create element — persists after page reload

**Steps:**
1. In ListPane, click "+" to create a new element, enter title `"Abraamo"`, type `personaggio`
2. Expect: element appears immediately in the list
3. Hard-reload page (`Ctrl+Shift+R` / `Cmd+Shift+R`)
4. Expect: `"Abraamo"` is still in the list with type `personaggio`
5. Open the element in DetailPane
6. Expect: all fields intact (title, type)

---

## TC-04: Edit element fields — persists after reload

**Steps:**
1. Open `"Abraamo"` in DetailPane
2. Set nascita to `"2000 aev"`, tribù to `"Giuda"`
3. Blur or save fields
4. Hard-reload page
5. Expect: nascita `"2000 aev"` and tribù `"Giuda"` still present

---

## TC-05: Add fonte — persists after reload

**Steps:**
1. Open `"Abraamo"`, navigate to fonti section
2. Add fonte tipo `"bibbia"` with reference `"Genesi 12:1-3"`
3. Hard-reload page
4. Expect: fonte appears under the Bibbia group in fonti section
5. Add fonte tipo `"link"` with URL `"https://example.com"` and label `"Ref"`
6. Hard-reload
7. Expect: link fonte appears in the Link group

---

## TC-06: Bidirectional link — inverse appears automatically

**Steps:**
1. Ensure elements `"Abraamo"` and `"Isacco"` exist (create Isacco if needed)
2. Open `"Abraamo"`, add link: tipo `"parentela"`, ruolo `"padre"`, target `"Isacco"`
3. Expect: link `padre → Isacco` appears on Abraamo immediately
4. Open `"Isacco"` in DetailPane
5. Expect: link `figlio → Abraamo` appears on Isacco **without any manual action**
6. Hard-reload page
7. Expect: both links still present on their respective elements

---

## TC-07: Bidirectional link removal — inverse removed atomically

**Steps:**
1. From TC-06 state, open `"Abraamo"`, remove the `padre → Isacco` link
2. Expect: link removed from Abraamo immediately
3. Open `"Isacco"`
4. Expect: `figlio → Abraamo` link is also gone
5. Hard-reload — verify neither side shows the link

---

## TC-08: Soft delete with Annulla toast

**Steps:**
1. Create element `"Elemento Test"` 
2. Select it and trigger soft delete
3. Expect: toast appears `"Elemento Test" eliminato` with "Annulla" action, 30s countdown
4. Within 30s, click "Annulla"
5. Expect: element reappears in list
6. Delete again, this time wait >30s (or let toast expire)
7. Hard-reload
8. Expect: `"Elemento Test"` is NOT in the list

---

## TC-09: Workspace auto-created on first login (fresh state)

**Steps:**
1. Clear localStorage completely
2. Navigate to app, login with new name `"Luca"`
3. Expect: workspace "Il mio workspace" created automatically
4. Expect: empty workspace shows CTA "Crea il primo Elemento" in list/detail pane

---

## TC-10: Console diagnostics — no spurious warnings on valid data

**Steps:**
1. With a healthy workspace (elements, fonti, links), hard-reload
2. Open browser console
3. Expect: NO `console.warn` messages about malformed CoMaps or branded type failures
4. Verify: any `console.warn` output only appears for genuinely invalid/incomplete CoMap data

---

## Edge Cases

**EC-01: Self-link prevention** — attempt to create a link from Abraamo to Abraamo → expect UI to block or discard silently.

**EC-02: Duplicate link prevention** — create `padre → Isacco` twice → expect second creation rejected or deduplicated.

**EC-03: Link to non-existent target** — if a target element is deleted, its incoming links should be ignored at load time (filtered silently, no error).

**EC-04: Multiple accounts** — login as `"Marco"`, create element; logout; login as `"Lucia"` → Lucia sees her own empty workspace, not Marco's data.
