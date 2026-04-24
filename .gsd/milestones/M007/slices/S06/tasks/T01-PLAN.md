---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T01: Eseguire audit Jazz 4 scenari e completare S06-RESEARCH.md con verdetti

Eseguire l'audit Jazz dei 4 scenari documentati nel research doc preesistente e aggiungere la sezione 'Verdicts & Evidence' a `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`. Scenario D (sync:'never' intenzionale) è verificabile da codice — esegui i grep e cattura l'output. Scenari A (reload persistence), B (multi-tab propagation), C (offline+online) richiedono browser interattivo: l'analisi statica nel research doc è già completa; documenta i verdetti attesi con rationale basato su analisi di `createBrowserContext.js` già inclusa, e flagga A/B/C come 'da verificare live in S07 con operatore umano' (auto-mode non ha browser). Esegui `pnpm tsc --noEmit` e `pnpm test --run` per confermare nessuna regressione. Nessun codice applicativo cambia. Se i grep per Scenario D rivelano qualcosa di inatteso (es. variabile env JAZZ_* non vista prima), flagga come blocker e aggiorna il research doc di conseguenza. Aggiungi infine in fondo al doc una sezione 'Forward Intelligence for M002' che elenca (a) come attivare sync, (b) cosa aspettarsi dal primo handshake IDB→peer, (c) note su DemoAuth → PasskeyAuth migration path.

## Inputs

- `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`
- `src/main.tsx`
- `src/app/auth-context.tsx`
- `src/features/workspace/workspace.schema.ts`

## Expected Output

- `.gsd/milestones/M007/slices/S06/S06-RESEARCH.md`

## Verification

grep -n 'when.*never' src/main.tsx deve mostrare la config intenzionale; `rg 'JAZZ|VITE_JAZZ|cloudSyncPeer' src/ vite.config.ts` deve restituire 0 hit relativi a env vars Jazz; `pnpm tsc --noEmit` deve essere clean; `pnpm test --run` deve passare verde (150+ test); S06-RESEARCH.md deve contenere la nuova sezione 'Verdicts & Evidence' con 4 sotto-sezioni (una per scenario) con verdict esplicito (PASS/PARTIAL/CONFIRMED/DEFERRED-TO-S07) e una sezione finale 'Forward Intelligence for M002'.
