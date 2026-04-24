# S06: Audit Jazz reale con 4 scenari browser — UAT

**Milestone:** M007
**Written:** 2026-04-24T11:04:44.355Z

# S06 UAT — Jazz Audit: 4 Scenari

## Preconditions
- App running on dev server: `pnpm dev`
- Browser: Chrome (latest) or Safari on iPad
- No sync peer configured (by design): `src/main.tsx` line 14 shows `sync={{ when: "never" }}`
- At least one Elemento created in the workspace

---

## TC01 — Scenario D: sync:'never' è intenzionale (verificabile da codice)

**Steps:**
1. `grep -n 'when.*never' src/main.tsx`
2. `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts`

**Expected:**
- Step 1: output `14: sync={{ when: "never" }}`, exit 0
- Step 2: 0 matches, exit 1

**Verdict:** PASS

---

## TC02 — Scenario A: Reload persistence (da verificare live in S07)

**Precondition:** Operatore umano con browser interattivo.

**Steps:**
1. Aprire l'app nel browser
2. Creare 5 elementi (titolo diverso ciascuno)
3. Ricaricare la pagina (`Cmd+R` / `F5`)
4. Osservare la lista elementi

**Expected:** Tutti e 5 gli elementi sono ancora presenti dopo il reload. Nessuna perdita di dati.

**Verdict atteso:** PASS — IDB peer sempre inizializzato; DemoAuth credentials sopravvivono in localStorage; Jazz ricostruisce lo stato CRDT completo.

---

## TC03 — Scenario B: Multi-tab propagation (da verificare live in S07)

**Precondition:** Operatore umano con browser interattivo, 2 tab aperte.

**Steps:**
1. Aprire l'app in Tab 1
2. Aprire l'app in Tab 2 (stessa URL)
3. In Tab 1: creare un nuovo Elemento
4. Passare a Tab 2 senza ricaricare
5. Osservare se l'elemento appare in Tab 2
6. Ricaricare Tab 2 (`Cmd+R`)
7. Osservare se l'elemento appare ora

**Expected:**
- Step 5: elemento NON appare in tempo reale (nessun BroadcastChannel/SharedWorker in jazz-browser@0.14.28)
- Step 7: elemento appare dopo reload (IDB condiviso tra tab dello stesso origin)

**Verdict atteso:** PARTIAL/EXPECTED-FAIL — cross-tab live richiederebbe sync server (M002)

---

## TC04 — Scenario C: Offline + modifica + online resync (da verificare live in S07)

**Precondition:** Operatore umano con browser interattivo, DevTools aperto.

**Steps:**
1. DevTools → Network → "Offline"
2. Creare 3 elementi nel workspace
3. Osservare che non ci sono errori UI
4. DevTools → Network → riportare online
5. Ricaricare la pagina

**Expected:**
- Step 3: elementi creati correttamente, nessun errore (tutte le mutazioni vanno a IDB)
- Step 4: nessun comportamento speciale (con `sync:'never'`, `toggleNetwork()` è no-op)
- Step 5: i 3 elementi sono ancora presenti (persistenza IDB confermata)

**Nota:** resync verso peer non avviene in M007 (sync:'never'). Questo scenario verifica solo la persistenza locale offline.

**Verdict atteso:** PASS (local mutations) / N/A (resync) — resync è scope M002

---

## TC05 — Forward Intelligence M002: attivazione sync

**Precondition:** Solo verifica documentale, non richiede browser.

**Steps:**
1. Aprire `src/main.tsx`
2. Verificare che la sezione 'Forward Intelligence for M002' in S06-RESEARCH.md documenti i 3 punti: attivazione sync, primo handshake IDB→peer, migrazione DemoAuth→PasskeyAuth

**Expected:**
- `src/main.tsx` contiene `sync={{ when: "never" }}` (facilmente modificabile per M002)
- S06-RESEARCH.md documenta la one-liner di attivazione: `when: "signedUp", peer: import.meta.env.VITE_JAZZ_PEER_URL`
- Sezione DemoAuth→PasskeyAuth: `useDemoAuth` → `usePasskeyAuth` in auth-context.tsx; account DemoAuth esistenti non migrabili

**Verdict:** PASS (documentazione completa)

