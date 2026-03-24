# UI/UX Memo: Timeline Board App

**Date**: 2026-03-23  
**Input Sources**:
- [spec.md](./spec.md)
- [plan.md](./plan.md)
- [MASTER.md](/home/fabio/dev/bible-board/design-system/timeline-board/MASTER.md)
- `ui-ux-pro-max` searches for accessibility, form controls, tablet layouts, progressive disclosure

## Goal

Stop designing the product incrementally by local code choices and define a stable UI/UX direction for:
- information architecture
- control selection
- editing flows
- screen hierarchy
- implementation order

This memo is normative for upcoming UI work unless a later product decision supersedes it.

## Product Positioning

The app should feel like a visual study notebook, not a technical database.

For an average user, the core promise is:
- save a study item quickly
- place it in time
- connect it to related items
- revisit it in views that clarify understanding

The app should not force users to think in terms of data modeling first.

## UI/UX Principles

Derived from the project design system and `ui-ux-pro-max` guidance:

1. **Clarity before density**
Use large readable labels, explicit section titles, and visible grouping. Avoid crowded forms and overloaded screens.

2. **Progressive disclosure**
Show the minimum fields needed to move forward. Reveal more fields when the selected type or action requires them.

3. **Visible choices for small option sets**
If a field has 2-3 high-frequency options, prefer segmented controls or radio-card groups over hidden select menus.

4. **Select menus only for long lists**
Use `select` for values such as month, existing tag lists, or long filter sets. Do not hide binary choices inside dropdowns.

5. **Every input has a real label**
No placeholder-only fields. Labels remain visible in all states.

6. **Feedback must be actionable**
Saving, deleting, validation failures, and sync states must always tell the user what happened and what to do next.

7. **Do not communicate state by color alone**
Errors, warnings, and success states need text and, where useful, iconography in addition to color.

8. **Tablet-first actions**
Primary actions should be easy to reach, large enough for touch, and stable in position.

## Visual Direction

Keep the existing project direction from [MASTER.md](/home/fabio/dev/bible-board/design-system/timeline-board/MASTER.md):
- teal primary
- orange accent
- light paper-like background
- precise but friendly typography
- tactile micro-interactions

Adaptation for mainstream usability:
- reduce ornamental motion
- reduce technical tone in headings/copy
- prefer stronger readability over visual cleverness
- keep a calm, study-oriented feel instead of “dashboard intensity”

## Core Use Cases

The first truly useful user journey is:

1. Open workspace.
2. Create an elemento quickly.
3. Assign time information with minimal confusion.
4. Add notes.
5. Add tags.
6. Add sources.
7. Add links.
8. Organize saved items into boards.
9. View them first in list, then in timeline.

This ordering should drive both UI and implementation.

## Screen Architecture

### 1. Workspace Home

Purpose:
- entry point
- orient the user
- expose next actions

Structure:
- workspace header
- primary CTA: `Nuovo elemento`
- recent elementi
- recent board
- workspace status (`offline`, `sync`, shared state later)

Rules:
- empty-state copy must guide the next action explicitly
- avoid showing too many zero-state metrics without utility
- one dominant CTA only

### 2. Elemento Editor

Purpose:
- fast creation and confident editing

Screen structure:
- header with title and type
- section `Identita`
- section `Tempo`
- section `Note`
- section `Tag`
- section `Fonti`
- section `Collegamenti`

Rules:
- do not show all advanced sections at equal visual weight
- `Identita`, `Tempo`, and `Note` come first
- tags, sources, and links are secondary but always reachable
- actions remain stable and touch-friendly

### 3. Elemento Detail

Purpose:
- read and navigate, not edit everything inline

Structure:
- overview card
- chronology card
- notes
- tags
- sources
- links
- actions row

Rules:
- reading experience should be calmer than the editor
- editing is a deliberate action, not accidental inline mutation everywhere

### 4. Board

Purpose:
- organize subsets of knowledge

Rules:
- first mature board experience should be `lista`
- `timeline` comes after list is robust
- graph and genealogy come later
- board creation must feel like “save a view”, not “configure a mini-application”

## Control Decisions

### Use Segmented Controls / Button Groups For

- `Era`: `a.e.v.` / `e.v.`
- `Precisione`: `Esatta` / `Circa`
- `Dettaglio data`: `Solo anno` / `Anno + mese` / `Anno + mese + giorno`
- future board view switching: `Timeline`, `Lista`, `Grafo`, `Genealogia`

Reason:
- small option set
- high frequency
- selection should be visible without opening a menu

### Use Radio Cards For

- `Tipo elemento`
- future board selection mode: `Fissa` / `Dinamica`

Reason:
- choice affects the rest of the screen
- cards can include short explanatory text
- easier to understand than plain dropdowns for average users

### Use Select For

- `Mese`
- long lists of existing tags or entities
- filter values with many options

Reason:
- these sets are too long for segmented controls

## Date UX Rules

### General Date Model

The product keeps:
- one general `DataTemporale` for generic elemento chronology
- dedicated `nascita` and `morte` for `personaggio`

### Input Flow

Every historical date is entered in this order:
- year
- era
- precision
- detail level
- month only if needed
- day only if month is present

### Control Rules

- `era`: segmented control
- `precisione`: segmented control
- `dettaglio`: segmented control
- `mese`: select
- `giorno`: numeric input enabled only after month selection

### Copy Rules

Do not expose internal terminology like `DataStorica` or `DataTemporale` in UI copy.

User-facing labels should be:
- `Data`
- `Data nascita`
- `Data morte`
- `Periodo`
- `Circa`
- `Esatta`

## Feedback Rules

Guided by `ui-ux-pro-max`:

- save must show visible confirmation
- delete must show both consequence and recovery path
- validation must explain what to fix
- dynamic state changes should be announced visually and, where useful, via `aria-live`

Minimum required patterns:
- inline field error
- page-level save/delete feedback
- undo after delete
- explicit loading states

## Information Hierarchy Rules

### Editor Priority

1. Title
2. Type
3. Time
4. Notes
5. Tags
6. Sources
7. Links

### Detail Priority

1. What it is
2. When it belongs
3. Why it matters
4. What it connects to
5. Where the information comes from

## Anti-Goals

Avoid:
- forms that look like raw schemas
- too many controls in a single visual block
- dense dropdown-heavy interfaces
- technical wording for mainstream tasks
- timeline-first UX before list/search/data entry are solid

## Recommended Next UI Work

### Phase A: Editing Experience

- Replace `tipo` select with radio cards
- Replace date binary/small-option selects with segmented controls
- Add true section hierarchy to the editor
- Add explicit save feedback and clearer inline validation

### Phase B: Data Enrichment

- Add tag input/autocomplete
- Add source editor
- Add link editor

### Phase C: Reading And Organization

- Improve detail page structure
- Add recent elementi to workspace home
- Implement board list-first experience

### Phase D: Visual Views

- Build mature list view first
- Build timeline after list and search are reliable
- Build graph/genealogy last

## Recommended Implementation Order

Use this order instead of jumping between UI experiments:

1. `US3` complete historical date UX and general chronology
2. `US4` tags
3. `US6` sources
4. `US5` links
5. `US8` board creation and management
6. `US10` list view
7. `US11` board search
8. `US9` timeline
9. `US12-US17` advanced navigation, offline polish, sharing, rollback

## Planning Consequence

Current `tasks.md` remains broadly usable, but execution should be interpreted through this memo:
- prioritize user-comprehensible editing first
- do not implement advanced views before core data entry is genuinely good
- prefer UI controls that expose small choice sets directly

