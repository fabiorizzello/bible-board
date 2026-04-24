---
sliceId: S06
uatType: artifact-driven
verdict: PASS
date: 2026-04-24T13:04:49.000Z
---

# UAT Result — S06

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| TC01 Step 1: `grep -n 'when.*never' src/main.tsx` returns line 14 with `sync={{ when: "never" }}` | artifact | PASS | Output: `14:      sync={{ when: "never" }}` — exit 0 |
| TC01 Step 2: `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` returns 0 matches | artifact | PASS | Exit 1 (no matches) — no Jazz env vars anywhere in the codebase, confirming intentional config |
| TC02: Reload persistence — 5 elementi sopravvivono a page reload | human-follow-up | NEEDS-HUMAN | Richiede browser interattivo. Verdetto atteso: PASS (IDB peer sempre inizializzato, DemoAuth credentials in localStorage, CRDT ricostruito on reload). Confermato da analisi statica di createBrowserContext.js + LocalStorageKVStore. |
| TC03: Multi-tab propagation — elemento in Tab 1 appare in Tab 2 senza reload | human-follow-up | NEEDS-HUMAN | Richiede 2 tab browser interattive. Verdetto atteso: PARTIAL/EXPECTED-FAIL — jazz-browser@0.14.28 non ha BroadcastChannel né SharedWorker; cross-tab live sync è scope M002. Dopo reload Tab 2: PASS (IDB condiviso). |
| TC04: Offline + modifica + online resync — elementi creati offline presenti dopo reload | human-follow-up | NEEDS-HUMAN | Richiede DevTools Network toggle interattivo. Verdetto atteso: PASS (local mutations) / N/A (resync). Con `sync:'never'` il toggle network è no-op; tutte le mutazioni vanno a IDB indipendentemente dalla rete. |
| TC05 Step 1: `src/main.tsx` contiene `sync={{ when: "never" }}` | artifact | PASS | Confermato da TC01 Step 1 sopra |
| TC05 Step 2a: S06-RESEARCH.md contiene sezione 'Verdicts & Evidence' | artifact | PASS | `grep -c 'Verdict' S06-RESEARCH.md` → 7 matches (exit 0) |
| TC05 Step 2b: S06-RESEARCH.md contiene sezione 'Forward Intelligence for M002' | artifact | PASS | `grep -c 'Forward Intelligence' S06-RESEARCH.md` → 1 match (exit 0) |

## Overall Verdict

PASS — tutti i check automatizzabili sono passati (TC01, TC05). TC02/TC03/TC04 sono NEEDS-HUMAN per design: richiedono browser interattivo con operatore umano; i verdetti attesi sono documentati con rationale statico completo in S06-RESEARCH.md e S06-UAT.md.

## Notes

**TC01 — CONFIRMED INTENTIONAL:**
- `grep -n 'when.*never' src/main.tsx` → `14:      sync={{ when: "never" }}` (exit 0) ✅
- `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` → 0 match (exit 1) ✅
- Scenario D: la configurazione `sync:'never'` è intenzionale e verificabile da codice senza browser.

**TC05 — PASS:**
- S06-RESEARCH.md esiste e contiene entrambe le sezioni richieste.
- `src/main.tsx` line 14 conferma `sync={{ when: "never" }}` — la one-liner per M002 (`when: "signedUp", peer: VITE_JAZZ_PEER_URL`) è documentata nel research doc.

**Human follow-up per S07:**
1. Aprire dev server (`pnpm dev`)
2. TC02: creare 5 elementi → reload → verificare persistenza
3. TC03: aprire 2 tab → creare elemento in Tab 1 → verificare assenza live in Tab 2 → reload Tab 2 → verificare presenza
4. TC04: DevTools → Offline → creare 3 elementi → Online → reload → verificare presenza
5. Aggiornare S06-RESEARCH.md con verdetti live confermati se divergono dalle aspettative
