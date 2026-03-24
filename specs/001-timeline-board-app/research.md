# Research: Timeline Board App

## Decision 1: Use Jazz media primitives for offline images

- **Decision**: Model image attachments with `co.image()` and upload them with Jazz media helpers such as `createImage()`. Keep `co.fileStream()` as the fallback primitive for non-image binary attachments in future scope, not for v1 media UX.
- **Rationale**: Jazz documentation exposes first-class image handling with progressive loading, placeholder generation, and file-stream support. That matches the product requirement for offline image media while avoiding a hand-rolled blob subsystem.
- **Alternatives considered**:
  - Store raw blobs outside Jazz in IndexedDB: rejected because it would split persistence and sync concerns away from the project’s CRDT source of truth.
  - Use only `co.fileStream()` for images: rejected because `co.image()` gives better UI ergonomics and progressive display for the main media case.
- **Sources**:
  - Context7 `/garden-co/jazz`: file/image handling and `createImage()`
  - Jazz docs: https://jazz.tools/docs/react/media-and-images

## Decision 2: Treat Jazz schema evolution as additive-first with explicit migrations

- **Decision**: Define account/root/profile schemas with `co.account(...).withMigration(...)`, keep changes additive where possible, prefer optional new fields, and use explicit migration logic only when data initialization or structural backfill is required.
- **Rationale**: Jazz documentation shows `withMigration()` as the supported path for schema evolution. Additive-first evolution minimizes breakage for local-first synchronized clients and aligns with forward-compatible CRDT data.
- **Alternatives considered**:
  - Hard-reset schemas on breaking changes: rejected because it would break offline/local-first expectations and lose user data.
  - Manual ad hoc migration code in UI startup: rejected because it would scatter persistence concerns outside schema ownership.
- **Sources**:
  - Context7 `/garden-co/jazz`: account migration example
  - Jazz docs: https://jazz.tools/docs/upgrade/0-14-0

## Decision 3: Use Jazz groups as the single permission boundary

- **Decision**: Persist workspace ownership and sharing through Jazz `Group` objects, with read/write roles applied at workspace scope and inherited by contained CoValues.
- **Rationale**: Jazz groups are the documented permission mechanism and directly support local-first collaboration without introducing a parallel ACL system. This also matches the clarification that permissions are workspace-wide.
- **Alternatives considered**:
  - Board-level or elemento-level ACLs in v1: rejected because they complicate ownership graphs and sharing UX without being required by the spec.
  - Custom permission tables outside Jazz: rejected because they duplicate a capability already supplied by the data layer.
- **Sources**:
  - Context7 `/garden-co/jazz`: group ownership and permission checks
  - Jazz docs: https://jazz.tools/docs/permissions-and-sharing/overview

## Decision 4: Keep Jolly UI as the first choice, React Aria + Tailwind as the fallback

- **Decision**: Use Jolly UI components where official component docs exist; for gaps or immature wrappers, implement directly on React Aria primitives while preserving the Jolly/shadcn visual language with Tailwind.
- **Rationale**: The constitution requires Jolly UI for touch-first accessible UI. Official documentation indicates coverage for the components most relevant to this feature set, while React Aria provides the safe fallback path already allowed by the constitution.
- **Alternatives considered**:
  - Switch to shadcn/ui or Radix-first primitives: rejected due to the already documented tablet-touch issues.
  - Build a fully custom component system: rejected because it would slow delivery and add accessibility risk.
- **Sources**:
  - Jolly UI docs root: https://www.jollyui.dev/docs
  - Example component page: https://www.jollyui.dev/docs/components/combobox

## Decision 5: Install React Compiler through Babel in Vite

- **Decision**: Configure React Compiler in Vite with `babel-plugin-react-compiler`, using `vite-plugin-babel` alongside the normal React/Vite setup. Target React 19.x for the main implementation baseline.
- **Rationale**: React’s official documentation shows Vite integration via Babel plugin setup and states that the compiler works best with React 19. This matches the constitution’s performance stance and avoids spreading manual memoization through the codebase.
- **Alternatives considered**:
  - Manual `useMemo`/`useCallback` optimization everywhere: rejected because it adds maintenance cost and conflicts with the project’s chosen optimization model.
  - Skip the compiler initially: rejected because performance on tablet is a constitution-level concern.
- **Sources**:
  - Context7 `/reactjs/react.dev`: React Compiler with Vite
  - React docs: https://react.dev/learn/react-compiler/installation

## Decision 6: Use the WOL study-edition navigator URL with normalized references

- **Decision**: Normalize scripture references into a canonical internal structure and resolve them to the Italian WOL study-edition navigator using the pattern `https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/{bookNumber}/{chapter}`. Preserve the original verse or verse-range in app state and UI label; do not depend on undocumented verse-fragment URLs in v1.
- **Rationale**: The product requires the study edition, and the chosen `binav/r6/lp-i/nwtsty` base makes that intent explicit in the contract. A chapter-level adapter remains deterministic and testable while avoiding brittle dependency on undocumented verse fragments.
- **Alternatives considered**:
  - Reverse-engineer private verse fragment patterns: rejected because it is brittle and not document-backed.
  - Store raw external URLs only: rejected because the spec requires computed links from structured scripture references.
- **Sources**:
  - User-provided canonical base URL: https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty

## Planning Consequences

- The implementation should begin with domain modeling and Jazz adapters before any complex D3 work.
- Media support in v1 is images only, but the persistence strategy remains extensible to future file attachments.
- Route and link-resolver contracts should be tested early because they define the app’s external browser-facing behavior.
