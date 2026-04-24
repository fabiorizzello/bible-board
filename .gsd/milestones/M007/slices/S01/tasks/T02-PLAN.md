---
estimated_steps: 14
estimated_files: 3
skills_used: []
---

# T02: Applicare layout fullheight iPad: h-dvh root + h-full su NavSidebar e ListPane wrapper

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

## Inputs

- ``src/ui/workspace-home/WorkspacePreviewPage.tsx``
- ``src/ui/workspace-home/NavSidebar.tsx``
- ``src/ui/workspace-home/ListPane.tsx``

## Expected Output

- ``src/ui/workspace-home/WorkspacePreviewPage.tsx``
- ``src/ui/workspace-home/NavSidebar.tsx``
- ``src/ui/workspace-home/ListPane.tsx``

## Verification

1. `rg -n 'h-screen' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 0 hit (o solo in commenti).
2. `rg -n 'h-dvh' src/ui/workspace-home/WorkspacePreviewPage.tsx` → 1 hit sul root div.
3. `rg -n 'h-full' src/ui/workspace-home/NavSidebar.tsx` → almeno 1 hit sul `<nav>` wrapper.
4. `rg -n 'h-full' src/ui/workspace-home/ListPane.tsx` → almeno 1 hit sul wrapper width-fixed.
5. `pnpm test` → 126/126 pass.
6. `pnpm tsc --noEmit` → clean.
7. `pnpm build` → success.
8. Dev server (`pnpm dev`) con viewport 1180×820 e 820×1180: sidebar e list background estendono a fondo viewport, document-level scroll assente, scroll regions interne clippano al bottom del viewport. Assumption: verifica visiva via browser automation tool (browser_navigate + browser_set_viewport + browser_screenshot) se disponibile, altrimenti documentare come manual-verify in Done When.
