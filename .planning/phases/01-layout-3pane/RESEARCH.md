# S01 Research — Recupero layout 3-pane consolidato con dark mode

## Summary

This slice decomposes the 785-line monolith `WorkspacePreviewPage.tsx` into modular components while preserving all existing visual features: sidebar navigation with workspace switcher, list pane with search/filters, detail pane with description/fonti/collegamenti/board sections, dark mode via ThemeSwitcher FAB, fullscreen overlay, and DemoAuth. The codebase is clean: TypeScript compiles with zero errors, 16 domain tests pass, mock data uses proper branded types. This is **straightforward decomposition of known code** — no new technology, no API integration, no risky unknowns.

## Depth Calibration: Light-to-Targeted

Known codebase, known patterns (React component extraction), no new libraries. The only moderate complexity is wiring shared UI state across the decomposed panes.

## Recommendation

Decompose the monolith into 5-6 components, introduce a Legend State (`@legendapp/state`) observable store for shared UI state (sidebar open, selected element, current view, filters), and keep routing at `/` with `RequireAuth` guard. Mock data import switches from inline constants to `src/mock/data.ts` (already built with proper domain types).

## Implementation Landscape

### What Exists (Monolith: WorkspacePreviewPage.tsx — 785 lines)

The file contains everything in one component:
- **Local state** (7 `useState` calls): `currentView`, `selectedElementId`, `filterText`, `activeTipo`, `sidebarOpen`, `fullscreen`
- **Inline mock data**: Local `ELEMENTI`, `BOARDS`, `RECENTI`, `TIPO_FILTERS` arrays (duplicate of `src/mock/data.ts`)
- **Local types**: `ViewId`, `Elemento`, `Board`, `Recente` (simplified versions of domain models)
- **Nav sidebar**: Workspace switcher dropdown, Recenti/Tutti ListBox, Board ListBox, Settings footer
- **List pane**: Header with new-element button, SearchField, TagGroup tipo filters, ListBox (recenti + element views)
- **Detail pane**: Card-based header, action toolbar (Modifica/Link/Fonte/Board/overflow), body sections (Descrizione/Collegamenti/Fonti/Board), empty state
- **Fullscreen overlay**: Fixed inset-0 with opacity+translate-y animation
- **ThemeSwitcher**: Imported from `./ThemeSwitcher.tsx` (282 lines, fully self-contained FAB)

### Supporting Infrastructure Already Built

| File | Status | Notes |
|------|--------|-------|
| `src/mock/data.ts` | ✅ Complete | 20 elementi, 2 boards, 8 recenti, workspace. Uses branded IDs. |
| `src/mock/index.ts` | ✅ Complete | Barrel export |
| `src/app/auth-context.tsx` | ✅ Complete | Simple React context, `useAuth()` hook |
| `src/app/auth-guards.tsx` | ✅ Complete | `RequireAuth` + `RedirectIfAuth` components |
| `src/app/router.tsx` | ✅ Simple | `/auth` → DemoAuthPage, `/` → WorkspacePreviewPage |
| `src/ui/auth/DemoAuthPage.tsx` | ✅ Complete | HeroUI v3 TextField composition, working |
| `src/styles/tokens.css` | ✅ Complete | CSS custom properties + `@theme` block for Tailwind |
| `src/styles/index.css` | ✅ Complete | Import chain: fonts → heroui/styles → tokens → tailwindcss |
| `ThemeSwitcher.tsx` | ✅ Complete | 8 palettes, light/dark toggle, FAB UI. Self-contained. |
| Domain layer | ✅ Complete | models, rules, errors, value-objects, newtypes — all tested |

### What Needs to Change

1. **Delete inline mock data** from WorkspacePreviewPage and use `src/mock/` instead
2. **Extract components** into separate files under `src/ui/workspace-home/`
3. **Introduce shared UI state** via Legend State observable store (D029)
4. **Adapt mock data types** — the monolith uses simplified local types; the mock module uses proper domain types (branded `ElementoId`, `Elemento` with `link` instead of `collegamenti`, `Fonte` objects instead of strings). The components need to render from domain types.

### Natural Component Seams

The monolith has clear visual/logical boundaries:

| Component | Lines (approx) | Responsibility |
|-----------|----------------|----------------|
| `NavSidebar` | ~120 | Workspace switcher, nav ListBoxes (Recenti/Tutti/Board), settings footer, collapse toggle |
| `ListPane` | ~150 | Header (view label, new button), SearchField, tipo TagGroup filters, ListBox (recenti or elements), empty state |
| `DetailPane` | ~100 | Header card (title, tipo chip, tags, date), action toolbar, body sections, empty state |
| `DetailBody` | ~80 | Descrizione/Collegamenti/Fonti/Board Card sections (reused by detail + fullscreen) |
| `ActionToolbar` | ~30 | Modifica/Link/Fonte/Board buttons + overflow dropdown |
| `FullscreenOverlay` | ~50 | Fixed overlay wrapping DetailBody with header |
| `WorkspaceLayout` | ~30 | Shell: flex h-screen, 3-pane composition, ThemeSwitcher |

### Shared UI State Store (Legend State)

The 7 useState calls need to be shared across NavSidebar (writes `currentView`, reads/writes `sidebarOpen`), ListPane (reads `currentView`/`filterText`/`activeTipo`, writes `selectedElementId`), and DetailPane (reads `selectedElementId`). 

**Store shape:**
```ts
// src/ui/workspace-home/workspace-ui-store.ts
import { observable } from "@legendapp/state";

export const workspaceUI$ = observable({
  currentView: "recenti" as ViewId,
  selectedElementId: null as string | null,
  filterText: "",
  activeTipo: "Tutti",
  sidebarOpen: true,
  fullscreen: false,
});
```

Legend State is already installed (`@legendapp/state` v2.1.15 in dependencies) but unused. Components read with `workspaceUI$.currentView.get()` and write with `workspaceUI$.currentView.set(...)`. Fine-grained reactivity via `observer()` HOC or `use$()` hook means only the subscribing component re-renders.

### Mock Data Type Adaptation

The monolith's inline types differ from `src/mock/data.ts`:

| Monolith field | Mock/Domain field | Adaptation needed |
|---------------|-------------------|-------------------|
| `collegamenti: { titolo, tipo }[]` | `link: ElementoLink[]` with `targetId` | Resolve `targetId` → titolo via `ELEMENTI_MAP` |
| `fonti: string[]` | No fonti in mock `Elemento` | Mock data `Elemento` has no `fonti` field — mock fonti only exist in monolith inline data. Add fonti to Abraamo in mock data, or render from hardcoded. |
| `boards: string[]` | No boards field on Elemento | Derive from `BOARDS`: filter boards whose selezione includes the elemento |
| `data: string` (display) | `date: DataTemporale`, `nascita: DataStorica` | Format with `formatHistoricalEra()` and date fields |

**Key insight**: The mock module (`src/mock/data.ts`) has a rich `Elemento` type with proper `link` arrays and branded IDs, but NO `fonti` field on elements (fonti are only defined in the Jazz schema, not the domain model). The monolith has hardcoded `fonti: ["Genesi 12:1-3", ...]` only on Abraamo. 

**Resolution**: For S01, add `fonti` data to the mock module as a separate lookup (e.g., `FONTI_MAP: Map<ElementoId, FonteDisplay[]>`) or add a `fonti` field to the mock Elemento for Abraamo only. Keep it simple — this is prototype data.

### Build / Config Status

- **Vite**: Working, React Compiler enabled via `@rolldown/plugin-babel`
- **PostCSS**: `postcss.config.js` with `@tailwindcss/postcss` (D027 — do NOT change to Vite plugin)
- **TypeScript**: Strict mode, zero errors
- **Tests**: 16 passing (domain data validation)
- **HeroUI v3**: Working with composition pattern (TextField > Label + Input + FieldError)

### Routing

Current routing is flat: `/auth` and `/`. D024 mentions nested routes with `useParams()` for deep links, but this was an M001 decision. For S01, keep the simple `/` route and focus on component decomposition. Deep link routing (`/workspace/elemento/:id`) can be added in a later slice if needed.

## Key Constraints

1. **D027**: PostCSS config MUST stay as `@tailwindcss/postcss`. Never switch to `@tailwindcss/vite`.
2. **D026**: Layout starts from the existing monolith (commit e18cb09 reference), not from scratch.
3. **D029**: Use Legend State for shared UI state.
4. **D022**: Tokens.css import order guarantees HeroUI variable overrides — don't change import chain in `index.css`.
5. **D025**: HeroUI v3 uses composition pattern (TextField > Label + Input + FieldError), NOT v2 props on Input.
6. **Constitution**: Touch targets ≥44px, `touch-action: manipulation`, `prefers-reduced-motion` respected.
7. **UI-UX Pro Max rules** (from skill): `touch-target-size` (44×44pt min), `touch-spacing` (8px gap), `duration-timing` (150-300ms), `transform-performance` (only transform/opacity), `color-dark-mode` (desaturated variants), `nav-state-active` (highlight current), `drawer-usage` (sidebar for secondary nav), `state-preservation` (restore scroll/filter on navigate back), `empty-states` (helpful message + action).

## Verification Strategy

1. **TypeScript**: `npx tsc --noEmit` — zero errors after decomposition
2. **Tests**: `npx vitest run` — 16 existing tests still pass
3. **Visual**: Dev server shows identical 3-pane layout with sidebar, list, detail
4. **Interactions**: Nav selection changes list content, element selection shows detail, sidebar collapse/expand, tipo filters work, search filters work, fullscreen overlay opens/closes, ThemeSwitcher changes palette + dark/light mode
5. **No regressions**: Dark mode works, DemoAuth flow works, all HeroUI components render correctly

## Fonti Data Gap

The domain model `Elemento` has no `fonti` field — fonti live in Jazz schema but not in the TypeScript domain interface. The monolith hardcodes `fonti: ["Genesi 12:1-3", ...]` only on Abraamo. For S01, the simplest approach is to add a lightweight `fonti` display field to mock data (parallel to how `link` exists on the domain model). This is cosmetic mock data for the prototype — not a domain model change.

## Skills Discovered

- `ui-ux-pro-max` — already installed, used for pre-delivery checklist and UX rule references
- `heroui-react` — already installed, relevant for HeroUI v3 composition patterns

No additional skills needed — this is standard React component decomposition.
