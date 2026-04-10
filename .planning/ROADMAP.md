# M002: Prototipo completo su layout 3-pane consolidato

## Vision
Costruire il prototipo completo partendo dal codice attuale: monolite WorkspacePreviewPage.tsx (785 righe, 3-pane con dark mode, ThemeSwitcher, sidebar, filtri, collegamenti, fonti), DemoAuth già fixato HeroUI v3, Vite optimizeDeps già configurato, domain layer e mock data completi. S01 decompone il monolite in componenti modulari senza perdere feature. Gli slice successivi aggiungono editor, annotazioni (D021), board CRUD (D012), timeline D3, polish.

## Slice Overview
| ID | Slice | Risk | Depends | Done | After this |
|----|-------|------|---------|------|------------|
| S01 | Recupero layout 3-pane consolidato con dark mode | medium | — | ⬜ | Layout 3-pane identico agli screenshot: sidebar completa, list pane con filtri tipo, detail con desc+fonti+link+board, dark mode con ThemeSwitcher FAB, DemoAuth funzionante |
| S02 | Editor inline, annotazioni, soft delete | medium | S01 | ⬜ | Click Modifica → editor inline con campi tipo-specifici. Annotazioni mie/altrui nel detail. Soft delete con toast Annulla 30s. |
| S03 | Fonti e link editor inline | low | S01 | ⬜ | Detail mostra fonti come link cliccabili raggruppati per tipo. Editor link inline con selettore tipo e ruolo parentela. |
| S04 | Board CRUD e ricerca | medium | S01 | ⬜ | Crea board da sidebar, rinomina inline, elimina con conferma. Vista lista compatta con ordinamento. Ricerca cross-view. |
| S05 | Timeline D3 SVG con zoom/pan e popup | high | S01, S04 | ⬜ | Vista timeline con asse verticale SVG, card posizionate, zoom cambia scala, pan con drag, popup compatto su click card. |
| S06 | Polish iPad-native e UAT finale | low | S01, S02, S03, S04, S05 | ⬜ | App completa che sembra iPad nativa. Scenario UAT end-to-end passa. |
