# S06: Audit Jazz reale con 4 scenari browser

**Goal:** Eseguire audit Jazz reale con 4 scenari (persistence, multi-tab, offline, sync:'never') e documentare verdetti + evidenza in S06-RESEARCH.md. Nessun nuovo codice applicativo — deliverable è il research artifact completato con sezione "Verdicts & Evidence".
**Demo:** S06-RESEARCH.md con 4 scenari + verdict + evidenza: reload dopo 5 mutazioni, 2 tab propagano, offline+modifica+online resync, sync:'never' confermato

## Must-Haves

- S06-RESEARCH.md contiene: (a) sezione "Verdicts & Evidence" con PASS/FAIL/PARTIAL per ciascuno dei 4 scenari, (b) evidenza code-level verificabile (grep output per Scenario D, file paths per A-C), (c) lista blocker (vuota se nessuno) propagata a CONTEXT M002, (d) eventuali fix in-scope applicati (nessuno atteso). Verifica automatizzata: `grep "when.*never" src/main.tsx` mostra la config; `rg 'JAZZ|VITE_JAZZ' src/` vuoto; test suite verde; tsc pulito.

## Proof Level

- This slice proves: Code-level proof (grep/rg) per Scenario D è definitivo. Scenari A–C sono empirici in browser; in auto-mode senza browser interattivo l'executor documenta: (i) analisi statica del codice Jazz (createBrowserContext.js, IDBStorage peer) che stabilisce il comportamento atteso, (ii) esecuzione `pnpm build && pnpm tsc --noEmit && pnpm test --run` a conferma che la pipeline non è regredita, (iii) verdetti basati su analisi (già fatti nel research doc preesistente). I verdetti live-browser sono delegati come follow-up manuale in S07 (ui-ux-pro-max finale) ove l'operatore umano eseguirà gli scenari A–C sul dev server.

## Integration Closure

S06 consuma da S04 (notification center come canale per errori sync futuri — non attivato in M007). Produce output per S07 (research doc completo, da includere nel report finale) e M002 (forward intelligence: attivare sync con `sync:{when:'signedUp', peer: env.VITE_JAZZ_PEER_URL}`, IDB transaction log replay al primo connect). Nessuna modifica a schema/adapter/UI. Nessun cambio al runtime Jazz.

## Verification

- Not provided.

## Tasks

- [x] **T01: Eseguire audit Jazz 4 scenari e completare S06-RESEARCH.md con verdetti** `est:30m`
  Eseguire l'audit Jazz dei 4 scenari documentati nel research doc preesistente e aggiungere la sezione 'Verdicts & Evidence' a `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`. Scenario D (sync:'never' intenzionale) è verificabile da codice — esegui i grep e cattura l'output. Scenari A (reload persistence), B (multi-tab propagation), C (offline+online) richiedono browser interattivo: l'analisi statica nel research doc è già completa; documenta i verdetti attesi con rationale basato su analisi di `createBrowserContext.js` già inclusa, e flagga A/B/C come 'da verificare live in S07 con operatore umano' (auto-mode non ha browser). Esegui `pnpm tsc --noEmit` e `pnpm test --run` per confermare nessuna regressione. Nessun codice applicativo cambia. Se i grep per Scenario D rivelano qualcosa di inatteso (es. variabile env JAZZ_* non vista prima), flagga come blocker e aggiorna il research doc di conseguenza. Aggiungi infine in fondo al doc una sezione 'Forward Intelligence for M002' che elenca (a) come attivare sync, (b) cosa aspettarsi dal primo handshake IDB→peer, (c) note su DemoAuth → PasskeyAuth migration path.
  - Files: `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`, `src/main.tsx`
  - Verify: grep -n 'when.*never' src/main.tsx deve mostrare la config intenzionale; `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` deve restituire 0 hit relativi a env vars Jazz; `pnpm tsc --noEmit` deve essere clean; `pnpm test --run` deve passare verde (150+ test); S06-RESEARCH.md deve contenere la nuova sezione 'Verdicts & Evidence' con 4 sotto-sezioni (una per scenario) con verdict esplicito (PASS/PARTIAL/CONFIRMED/DEFERRED-TO-S07) e una sezione finale 'Forward Intelligence for M002'.

## Files Likely Touched

- .gsd/milestones/M007/slices/S06/S06-RESEARCH.md
- src/main.tsx
