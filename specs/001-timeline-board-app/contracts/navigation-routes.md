# Contract: Navigation Routes

## Purpose

Define the browser-facing route surface of the static SPA. These routes are stable contracts for UI navigation, deep-linking, and contract tests.

## Canonical Routes

| Route | Purpose | Auth | Notes |
|------|------|------|------|
| `/` | Workspace home | Required after bootstrap | Shows onboarding when workspace is empty |
| `/board/:boardId` | Board shell | Required | Main route for timeline/list/graph/genealogy |
| `/elemento/:elementoId` | Element detail/editor surface | Required | Opened from boards, links, breadcrumbs |

## Query Parameters

### `/board/:boardId`

| Param | Type | Required | Allowed Values | Meaning |
|------|------|----------|------|------|
| `view` | string | No | `timeline`, `lista`, `grafo`, `genealogia` | Overrides last-used view for deep links |
| `q` | string | No | free text | Current board search query |

### `/elemento/:elementoId`

| Param | Type | Required | Allowed Values | Meaning |
|------|------|----------|------|------|
| `fromBoard` | `BoardId` | No | existing board id | Allows return navigation to board context |

## Behavioral Rules

- Unauthenticated users hitting any route are redirected into the Jazz auth gate and returned afterward.
- If `view` is missing on `/board/:boardId`, the app uses the board’s persisted `ultimaVista` or defaults to `timeline`.
- Unknown `view` values are rejected and normalized back to the last valid board view.
- Missing or unknown `boardId` / `elementoId` show an in-app not-found state, not a server error.
- Clearing `q` must behave the same as no query parameter.

## Contract Tests

- `/board/:boardId?view=lista` opens the requested board in list view.
- `/board/:boardId?q=abraamo` hydrates board search with the same case-insensitive behavior as typing in the UI.
- `/elemento/:elementoId?fromBoard=:boardId` preserves breadcrumb/back-navigation context.
