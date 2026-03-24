# Quickstart: Timeline Board App

## Goal

Validate the planned architecture end-to-end once implementation begins: auth, workspace creation, elemento CRUD, dynamic boards, timeline rendering, offline persistence, and collaboration.

## Prerequisites

- Node.js LTS
- npm
- Modern tablet-capable browser

## Expected Commands

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

## Manual Validation Flow

### 1. Start the app

```bash
npm run dev
```

Open the local Vite URL in a browser or tablet simulator.

### 2. Authenticate and create workspace

- Open the app as a new user.
- Complete Jazz authentication.
- Confirm that a single workspace is created automatically and that the empty-state onboarding appears.

### 3. Create baseline elementi

- Create at least:
  - one `personaggio`
  - one `profezia`
  - one `luogo`
  - one `regno` with range date
- Add:
  - historical dates in both point and range form
  - tags from the registry
  - one scripture source
  - one article source

### 4. Validate links

- Create a `parentela` link between two personaggi.
- Confirm the inverse link appears automatically.
- Delete one linked elemento and verify cascading link removal plus undo toast.

### 5. Validate boards

- Create one dynamic board filtered by tag and type.
- Confirm filter semantics:
  - categories combine with `AND`
  - multiple tags/types combine with `OR`
- Create one fixed board by manual selection.
- Switch the board across `timeline`, `lista`, `grafo`, and `genealogia`.

### 6. Validate timeline UX

- Open the timeline view.
- Confirm:
  - vertical time axis
  - range bar rendering
  - sticky card behavior for long-duration items
  - minimap visibility
  - uncertainty marker for approximate dates

### 7. Validate search

- Search for an elemento title in lowercase and uppercase.
- Confirm the same results appear.
- Clear the query and verify the board returns to the unfiltered state.

### 8. Validate offline media

- Upload one image to an elemento.
- Switch the browser offline via DevTools.
- Reload the app and confirm:
  - workspace data still opens
  - the uploaded image remains visible
  - the app is installable and assets stay cached

### 9. Validate collaboration

- Invite a second user to the workspace.
- Confirm a `scrittura` user can edit shared content.
- Confirm a `lettura` user cannot modify elementi, board, tags, or log actions.

### 10. Validate rollback

- Perform a destructive action.
- Open the action log.
- Trigger rollback and confirm it creates a compensating action rather than rewinding shared history.

## Test Focus

### Domain tests

- date validation and cross-era ranges
- bidirectional link rules
- board dynamic filter evaluation
- rollback eligibility and compensating action generation
- permission gating at workspace scope

### UI/integration tests

- auth gate and onboarding
- board view switching
- timeline interactions
- search behavior
- read-only collaboration restrictions

## Done Signals

- Domain tests pass.
- Build succeeds.
- Offline scenario works after first load.
- Timeline interactions remain smooth on tablet-sized viewports.
- Manual validation covers at least one successful collaboration round-trip.
