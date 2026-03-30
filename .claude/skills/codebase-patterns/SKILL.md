---
name: codebase-patterns
description: >
  Standard di qualita architetturale per Timeline Board App.
  Anti-pattern da evitare, pattern corretti attesi, e checklist pre-commit.
  Usato da review-findings-fixer (gate pre-commit) e review-codebase (post-fix).
user_invocable: false
---

# Codebase Patterns — Timeline Board App

Standard di riferimento per DDD vertical slices, neverthrow Result, Jazz CRDT boundary,
e principi DRY/YAGNI/SOLID pragmatici.
Questo skill e una libreria condivisa: non produce output autonomo, ma fornisce
le definizioni che `review-findings-fixer` e `review-codebase` usano come criteri.

---

## Anti-pattern noti -> Pattern corretti

| Anti-pattern | Segnale nel codice | Pattern corretto |
|---|---|---|
| `throw` per domain errors in features/ | `throw new Error(...)` in rules o model | `err(DomainError.xxx)` via neverthrow |
| try/catch come control flow in domain | `try { ... } catch` in rules/model | Propaga `Result<T, E>` verso il chiamante |
| `as any` o `any` non giustificato | `: any` senza commento `// justified:` | Tipo esplicito o generic; se impossibile, commento |
| `as BrandedType` cast insicuro | `value as WorkspaceId` senza parsing | `WorkspaceIdSchema.safeParse(value)` tramite Zod `.brand()` |
| Re-export wrapper inutili | `export { ok, err } from "neverthrow"` in file intermedio | Import diretto da `"neverthrow"` dove serve |
| Jazz imports in domain files | `import { CoMap } from 'jazz-tools'` in `.model.ts` o `.rules.ts` | Domain opera su plain TS interfaces; Jazz solo in `.schema.ts` e `.adapter.ts` |
| Business logic in UI components | Validazione, calcoli, state transitions in `.tsx` | Logica in `features/<domain>/rules.ts`, UI chiama e fa `.match()` |
| Mutazione diretta di oggetti dominio | `elemento.titolo = "..."` in rules | Funzioni pure che restituiscono nuovi oggetti |
| Duplicazione di validazione | Stessa regola validata in rules.ts E nel componente UI | Una sola source of truth in rules; UI mostra errori da Result |
| God function | Una funzione >40 righe con multiple responsabilita | Estrai funzioni pure composte; ogni funzione fa una cosa |
| Adapter che contiene logica di business | Regole di dominio dentro `.adapter.ts` | Adapter: solo mapping Jazz <-> domain; logica in `.rules.ts` |
| Schema Jazz con default di business | `CoMap` con logica di validazione o computed fields | Schema: solo struttura dati; computed/validation in domain |
| Componente che bypassa il router | Navigazione con `window.location` o link hardcoded | Usa React Router `useNavigate()` e il contratto routes |
| Test che importa Jazz runtime | `import { ... } from 'jazz-tools'` in unit test | Domain test importa solo da `features/`; nessun Jazz |

---

## Principi guida (pragmatici, non dogmatici)

### DRY — Don't Repeat Yourself

- Una regola di business deve esistere in **un solo posto** (tipicamente `rules.ts`).
- Estrai solo quando il codice duplicato rappresenta **lo stesso concetto logico**, non semplicemente righe simili. Codice che si assomiglia ma serve contesti diversi non e duplicazione.
- **Non** applicare DRY a: boilerplate strutturale (imports, setup test), codice UI con varianti visuali diverse, configurazioni che sembrano simili ma servono contesti diversi.

### SOLID (dove ha senso in FP)

- **S — Single Responsibility**: ogni file `.rules.ts` gestisce un aspetto del dominio. Se cresce oltre ~150 righe, valuta se contiene responsabilita miste.
- **O — Open/Closed**: usa discriminated unions (`TipoElemento`, `TipoLink`) anziche if/else chains. Aggiungere un tipo = aggiungere un case, non modificare logica esistente.
- **L — Liskov**: non applicabile direttamente (no classi), ma le funzioni che accettano `Elemento` devono funzionare con qualsiasi `TipoElemento`.
- **I — Interface Segregation**: adapter e domain non devono forzare il chiamante a conoscere campi che non usa. Preferisci parametri espliciti a oggetti monolitici.
- **D — Dependency Inversion**: UI dipende da domain (rules, model), mai il contrario. Domain non importa da adapter o schema.

### YAGNI

- Non aggiungere campi, tipi, o funzioni "per il futuro".
- Non creare astrazioni per un singolo uso.
- Se la spec non lo chiede, non implementarlo.

---

## Checklist pre-commit (gate obbligatorio prima di ogni commit)

Rispondi esplicitamente a ciascuna domanda. Una risposta "si" e un blocco: correggi prima di procedere.

### Purezza domain

- Ho introdotto `throw`, `try/catch`, o side effects in `features/<domain>/*.model.ts` o `*.rules.ts`?
- Ho importato da `jazz-tools`, `jazz-react`, `react`, o `react-router` in un file domain (model/rules/errors)?
- Ho messo logica di validazione o state transition in un file `.adapter.ts` o `.schema.ts`?
- Ho messo logica di business in un componente `.tsx`?

### Tipo Result (neverthrow)

- Ho usato `throw` dove avrei dovuto restituire `err()`?
- Ho unwrappato un Result con `.value` senza prima fare `.match()` o `.isOk()`?
- Ho ignorato un Result senza gestire il caso errore?

### DRY

- Ho duplicato una regola di validazione gia presente in un altro `rules.ts`?
- Ho duplicato lo stesso concetto logico in piu punti (non codice simile, ma la stessa regola)?

### Tipi e Branded Types

- Ho usato `any` senza commento di giustificazione?
- Ho usato `as BrandedType` invece di passare per `safeParse()` del Zod schema branded?
- Ho usato `as` cast senza necessita (type assertion non sicura)?
- Ho bypassato strict mode con `@ts-ignore` o `@ts-expect-error` senza commento?
- Ho creato un file wrapper che ri-esporta da una libreria senza aggiungere nulla?

### Completezza

- Ho aggiornato tutti i test che coprono il codice modificato?
- Ho cercato con grep tutti i caller del simbolo cambiato e li ho aggiornati?
- Ho verificato che le route nel router corrispondano ai deep link definiti in spec 011?

---

## Pattern positivi attesi

### Branded types con Zod (parse, don't validate)

```typescript
// newtypes.ts — branded schemas con Zod via jazz-tools
import { z } from "jazz-tools";
import { ok, err, type Result } from "neverthrow";

// Schema = parser + brand
const WorkspaceIdSchema = z.string().min(1).brand<"WorkspaceId">();
type WorkspaceId = z.infer<typeof WorkspaceIdSchema>;

// Smart constructor che restituisce Result
function parseWorkspaceId(value: string): Result<WorkspaceId, { type: "invalid_id" }> {
  const parsed = WorkspaceIdSchema.safeParse(value);
  return parsed.success ? ok(parsed.data) : err({ type: "invalid_id" });
}
```

### Domain rules con neverthrow

```typescript
import { ok, err, type Result } from "neverthrow";

// Composizione di validazioni
function createElemento(input: CreateElementoInput): Result<Elemento, ElementoError> {
  return validateTitolo(input.titolo)
    .andThen(titolo => validateTipo(input.tipo)
      .map(tipo => ({ ...defaults, titolo, tipo })))
}
```

### Adapter boundary (Jazz <-> Domain)

```typescript
// adapter.ts — unico punto di contatto con Jazz
// Parsing dei branded types avviene QUI, al confine Jazz -> domain
import { parseElementoId, parseNonEmptyString } from "@/features/shared/newtypes";

function toDomain(coMap: ElementoCoMap): Result<Elemento, AdapterError> {
  return parseElementoId(coMap.id)
    .andThen(id => parseNonEmptyString(coMap.titolo)
      .map(titolo => ({ id, titolo, /* ... */ })))
}

// Domain -> Jazz: i branded types sono gia validati, plain string a runtime
function toSchema(domain: Elemento): Partial<ElementoCoMap> {
  return { titolo: domain.titolo }; // branded string e plain string a runtime
}
```

### UI che consuma Result

```tsx
// Componente che usa .match() — nessuna logica di business
function ElementoEditor({ elemento }: Props) {
  const result = validateElemento(formData)

  return result.match(
    valid => <SaveButton onClick={() => save(valid)} />,
    error => <ErrorBanner errors={error} />
  )
}
```

### Test puro senza Jazz

```typescript
// Unit test che importa solo domain — neverthrow diretto, no wrapper
import { ok, err } from "neverthrow";
import { createElemento } from "@/features/elemento/elemento.rules";

test("rifiuta titolo vuoto", () => {
  const result = createElemento({ titolo: "", tipo: "personaggio" });
  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().type).toBe("TITOLO_VUOTO");
})
```
