# S07: Polish iPad-native e UAT finale

**Goal:** App completa che sembra iPad nativa (densità, transizioni, gesti rispettati). Scenario UAT end-to-end passa.
**Demo:** App completa iPad-native, scenario UAT end-to-end PASS

## Must-Haves

- Reviewer percorre scenario UAT su iPad reale senza blockers; feel iPad-native confermato: no chrome superfluo, animazioni solo transform/opacity, touch targets ≥44x44. R011 coperto.

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [ ] **T01: Polish iPad-native + UAT end-to-end** `est:3h`
  Rifiniture di densità, typography, spacing (tokens.css come SoT). Animazioni solo su transform e opacity; prefers-reduced-motion rispettato. Touch target ≥44×44, gap ≥8px. Scenario UAT end-to-end PASS. Consegna R011.
  - Files: `src/styles/tokens.css`
  - Verify: Scenario UAT PASS; touch targets ≥44px; no chrome superfluo; animazioni solo transform/opacity; R011 coperto

## Files Likely Touched

- src/styles/tokens.css
