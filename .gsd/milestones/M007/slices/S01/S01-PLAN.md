# S01: Linguaggio di dominio e layout fullheight

**Goal:** App su iPad 1180×820 landscape e 820×1180 portrait non mostra più termini tecnici user-visible (markdown, mockup, detail pane) nelle warning strings; root layout usa h-dvh e NavSidebar/ListPane hanno h-full sugli intermediate wrappers in modo che le scroll region interne (flex-1 overflow-y-auto) siano correttamente bounded e non producano overflow esterno.
**Demo:** App su iPad 1180x820 e 820x1180 non mostra più markdown/panel/toast/field; root/FullscreenOverlay/DetailPane 100% viewport senza scroll esterno

## Must-Haves

- `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` ritorna solo code identifiers / import paths, non JSX text children visibile all'utente
- WorkspacePreviewPage root: `h-dvh` (non `h-screen`)
- NavSidebar `<nav>`: contiene `h-full`
- ListPane inner `<div>` (width-fixed): contiene `h-full`
- `pnpm test` → 126/126 pass
- `pnpm tsc --noEmit` → clean
- Dev server su 1180×820 e 820×1180: sidebar/list background estendono fino al fondo del viewport, nessuno scroll del document, scroll regions interne clippano correttamente

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [x] **T01: Sostituire termini tecnici user-visible nelle warning strings di ElementoEditor** `est:15min`
  In `src/ui/workspace-home/ElementoEditor.tsx`, la funzione `getWarnings()` contiene 2 warning user-visible con termini tecnici vietati dal linguaggio di dominio (R046). Riscrivere in italiano di dominio.

Cambiamenti esatti:

1. Warning 'descrizione mancante' (~line 200):
   - OLD: `"Manca una descrizione markdown. Aggiungila inline senza lasciare il detail pane."`
   - NEW: `"Manca una descrizione. Aggiungila direttamente qui."`

2. Warning 'ruoli mancanti' (~line 207):
   - OLD: `"Nessun ruolo visibile. Il mockup canonico prevede chip modificabili per i ruoli principali."`
   - NEW: `"Nessun ruolo definito."`

NON toccare:
- Code identifiers (`editingFieldId`, `MilkdownEditorInline`, `.markdownUpdated(...)`, `EditableFieldId`, ecc.)
- Toast strings esistenti (rimozione toast è scope S04, non S01)
- Nomi componenti/import (`PanelLeft`, `SearchField`, `TextField`, `Toast`, ecc.)
- CSS token `bg-panel`

Nota: i file in `src/ui/mockups/` sono dev-only (rotta `/dev/mockup-*`) e sono scope out — non toccarli.

Assumption: non risultano test che asseriscano sul testo esatto di queste 2 warning string (verificato: test presenti sono display-helpers.test.ts e link-helpers.test.ts). Se un test inatteso rompe, aggiornare l'asserzione al nuovo testo.
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`
  - Verify: 1. `rg -n 'markdown|mockup|detail pane' src/ui/workspace-home/ElementoEditor.tsx` — confermare che i match rimasti sono SOLO code identifiers (es. `MilkdownEditorInline`, `.markdownUpdated`, `editingFieldId`) e NON stringhe JSX user-visible.
2. `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` — ispezionare ogni hit e confermare che nessuno è testo mostrato all'utente.
3. `pnpm test` → 126/126 pass.
4. `pnpm tsc --noEmit` → clean.

- [x] **T02: Applicare layout fullheight iPad: h-dvh root + h-full su NavSidebar e ListPane wrapper** `est:20min`
  Tre modifiche className mirate per far sì che il layout riempia il viewport iPad senza scroll esterno, e che le scroll region interne (`flex-1 overflow-y-auto`) abbiano un parent di altezza bounded.

**Modifica 1 — `src/ui/workspace-home/WorkspacePreviewPage.tsx` (~line 130):**
- OLD: `<div className="flex h-screen bg-panel font-body">`
- NEW: `<div className="flex h-dvh bg-panel font-body">`
- Rationale: `h-screen` (100vh) non si adatta alla dynamic toolbar iPad Safari; `h-dvh` (100dvh) sì. `dvh` è già in uso in `DemoAuthPage.tsx` e `NotFoundPage.tsx`, confermato supportato dalla Tailwind config.

**Modifica 2 — `src/ui/workspace-home/NavSidebar.tsx` (~line 102):**
- L'outer `<div className={\`flex-shrink-0 overflow-hidden ${sidebarOpen ? "w-[220px]" : "w-0"}\`}>` (line ~100) è già flex item del root e riceve altezza via stretch.
- Il `<nav className={\`w-[220px] flex flex-col border-r border-primary/10 bg-chrome ...\`}>` (line ~102) è un block element senza altezza bounded → aggiungere `h-full` alla sua className.
- Questo permette al `ScrollShadow` interno con `flex-1 overflow-y-auto` di clippare correttamente.

**Modifica 3 — `src/ui/workspace-home/ListPane.tsx` (~line 148):**
- L'outer `<div className={\`flex-shrink-0 overflow-hidden ${fullscreen ? "w-0" : "w-[300px]"}\`}>` (line ~146) è già flex item del root.
- Il `<div className={\`w-[300px] flex flex-col border-r ... overflow-hidden ...\`}>` interno (line ~148) non ha altezza bounded → aggiungere `h-full` alla sua className.

NON toccare `DetailPane.tsx` (già corretto: `flex flex-1 flex-col overflow-hidden`) e `FullscreenOverlay.tsx` (già corretto: `fixed inset-0`).

Questo task è indipendente da T01 (nessuna sovrapposizione di file).
  - Files: `src/ui/workspace-home/WorkspacePreviewPage.tsx`, `src/ui/workspace-home/NavSidebar.tsx`, `src/ui/workspace-home/ListPane.tsx`
  - Verify: 1. `rg -n 'h-screen' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 0 hit (o solo in commenti).
2. `rg -n 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 1 hit sul root div.
3. `rg -n 'h-full' src/ui/workspace-home/NavSidebar.tsx` → almeno 1 hit sul `<nav>` wrapper.
4. `rg -n 'h-full' src/ui/workspace-home/ListPane.tsx` → almeno 1 hit sul wrapper width-fixed.
5. `pnpm test` → 126/126 pass.
6. `pnpm tsc --noEmit` → clean.
7. `pnpm build` → success.
8. Dev server (`pnpm dev`) con viewport 1180×820 e 820×1180: sidebar e list background estendono a fondo viewport, document-level scroll assente, scroll regions interne clippano al bottom del viewport. Assumption: verifica visiva via browser automation tool (browser_navigate + browser_set_viewport + browser_screenshot) se disponibile, altrimenti documentare come manual-verify in Done When.

## Files Likely Touched

- src/ui/workspace-home/ElementoEditor.tsx
- src/ui/workspace-home/WorkspacePreviewPage.tsx
- src/ui/workspace-home/NavSidebar.tsx
- src/ui/workspace-home/ListPane.tsx
