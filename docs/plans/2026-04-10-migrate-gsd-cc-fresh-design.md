# Design — Migrazione gsd-cc: archivio stato corrente + reinstall fresh v1.34.2

**Data:** 2026-04-10
**Contesto conversazionale:** Il progetto ha due sistemi GSD attivi distinti:

1. **gsd-cc** — installazione locale di `get-shit-done-cc` v1.34.2 in `.claude/` (hook, sub-agent, commands, get-shit-done/). È il target di questa migrazione.
2. **gsd-2** (aka "shell PI") — `gsd-pi` runtime globale in `/home/fabio/.gsd/`. La cartella `.gsd` nel progetto è un **symlink** a `/home/fabio/.gsd/projects/bbc293be6eb1/`. **Non viene toccato da questa migrazione** (richiesta esplicita: "cancella tutto ciò che fa riferimento a gsd-cc, non gsd-2").

La nuova versione di gsd-cc usa `.planning/` come directory di stato progettuale (non più `.gsd/`). Sarà creata on-demand al primo workflow.

**Obiettivo:** Ripartire da una installazione pulita di `get-shit-done-cc@latest` preservando l'installazione attuale come archivio recuperabile (preferenza utente: archiviare, mai cancellare direttamente). Il symlink `.gsd` e il runtime globale gsd-2 restano intatti.

## Decisione

Archiviare l'installazione gsd-cc corrente + `.gsd/` in `.archive-gsd-cc-2026-04-10/` (gitignored), resettare `.claude/` rimuovendo solo i file gsd-cc, reinstallare con `npx get-shit-done-cc@latest --claude --local`. Dopo l'installazione il progetto sarà su una base vergine v1.34.2 con `.planning/` che verrà creato on-demand al primo workflow (`/gsd:new-project` o `/gsd:new-milestone`).

## Rationale delle alternative scartate

- **Downgrade a v1.5.14 (skills-only puro)** — rifiutato dall'utente: preferisce la versione attuale, strippata o rifatta fresh.
- **Strip in place v1.34.2** — inizialmente considerato, poi superato: dato che la directory-dati è rinominata (`.gsd/` → `.planning/`), un'installazione fresca è meno soggetta a inconsistenze rispetto a rattoppare quella esistente.
- **Cancellazione diretta** — rifiutato per preferenza dell'utente (vedi `memory/feedback_archive_not_delete.md`).

## Stato corrente (baseline)

### `.claude/` — installazione gsd-cc v1.34.2

```
.claude/
├── get-shit-done/                  (bin, contexts, references, templates, workflows, VERSION=1.34.2)
├── agents/                         (23 gsd-*.md sub-agents)
├── commands/gsd/                   (70 skill/command markdown)
├── hooks/                          (9 gsd-*.{js,sh} intercettivi)
├── skills/                         (4 skill non-gsd: codebase-patterns, review-codebase, review-findings-fixer, ui-ux-pro-max)
├── gsd-file-manifest.json
├── package.json                    ({"type":"commonjs"} marker)
└── settings.json                   (hooks SessionStart/Pre/PostToolUse + statusLine gsd)
```

### `.gsd` — symlink a gsd-2 globale (NON TOCCARE)

```
.gsd → /home/fabio/.gsd/projects/bbc293be6eb1/
```

Appartiene a `gsd-pi` globale ("gsd-2", "shell PI"). Fuori scope della migrazione. Il symlink resta in place.

## Piano operativo

### 1. Crea struttura archivio

```
.archive-gsd-cc-2026-04-10/
├── README.md
├── claude/
└── gsd/
```

README.md contiene: data, motivazione (migrazione a installazione fresh v1.34.2), manifesto di cosa è stato spostato e istruzioni sintetiche di ripristino.

### 2. Sposta file gsd-cc in archivio

Spostamenti atomici (mv, non cp):
- `.claude/get-shit-done/` → `.archive-gsd-cc-2026-04-10/claude/get-shit-done/`
- `.claude/commands/gsd/` → `.archive-gsd-cc-2026-04-10/claude/commands/gsd/`
- `.claude/agents/` (solo i gsd-*.md — contiene solo file gsd) → `.archive-gsd-cc-2026-04-10/claude/agents/`
- `.claude/hooks/` (solo gsd-*) → `.archive-gsd-cc-2026-04-10/claude/hooks/`
- `.claude/gsd-file-manifest.json` → `.archive-gsd-cc-2026-04-10/claude/gsd-file-manifest.json`
- `.claude/package.json` → `.archive-gsd-cc-2026-04-10/claude/package.json`
- copia `.claude/settings.json` → `.archive-gsd-cc-2026-04-10/claude/settings.json` (copia, non spostamento — vedi punto 3)
- `.gsd/` → `.archive-gsd-cc-2026-04-10/gsd/` (intero tree)

Preservati in `.claude/`: `skills/` (non-gsd).

### 3. Reset `.claude/settings.json`

Sovrascritto a `{}` per azzerare gli hook e lo statusLine del vecchio installer. L'installer v1.34.2 popolerà i nuovi valori durante il reinstall.

### 4. Rimuovi sottodirectory vuote in `.claude/`

Dopo gli spostamenti, `commands/`, `agents/`, `hooks/` in `.claude/` potrebbero essere vuote — rmdir se lo sono, altrimenti lascia.

### 5. Reinstalla fresh v1.34.2

```bash
npx --yes get-shit-done-cc@latest --claude --local
```

Flag:
- `--claude` per target runtime Claude Code (niente prompt)
- `--local` per install al working directory (non a `~/.claude/`)
- `--yes` su npx per evitare conferma del package download

### 6. Aggiungi archivio a `.gitignore`

```
.archive-gsd-cc-2026-04-10/
```

### 7. Verifica post-install

- `cat .claude/get-shit-done/VERSION` → deve restituire `1.34.2`
- `.claude/commands/gsd/` popolato
- `.claude/settings.json` contiene hook freschi
- `.archive-gsd-cc-2026-04-10/claude/get-shit-done/VERSION` preservato (1.34.2 corrente)

## Criteri di successo

1. L'installer v1.34.2 termina senza errori.
2. La directory `.archive-gsd-cc-2026-04-10/` contiene tutto il materiale gsd-cc e `.gsd/` originali.
3. `.claude/skills/` (non gsd) invariata.
4. `.gitignore` aggiornato.
5. Il progetto è ora su base gsd-cc fresca, pronta per un primo workflow `/gsd:*`.

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| L'installer fallisce a metà | `.claude/` contiene ancora l'archivio → ripristino con `mv` inverso |
| `npx` richiede prompt interattivo nonostante `--yes --claude --local` | Catturare stderr; se blocca, fallback a `npm install --no-save get-shit-done-cc@latest && node node_modules/get-shit-done-cc/bin/install.js --claude --local` |
| Il reinstall sovrascrive `.claude/skills/` non-gsd | Ispezionato `install.js`: modifica solo `agents/`, `commands/gsd/`, `hooks/`, `get-shit-done/`, `settings.json`, `package.json`. Non tocca `skills/` |
| L'archivio viene committato accidentalmente | `.gitignore` aggiunto PRIMA degli spostamenti |

## Fuori scope

- Migrazione automatica dei contenuti metodologici da `.gsd/milestones/M002/` a `.planning/`. Da decidere in sessione futura quando l'utente riprende il lavoro su M002 con la nuova struttura.
- Rimozione globale di `gsd-pi` o altri tool global. La migrazione è scoped al progetto `board`.
- Pulizia della cache npx `~/.npm/_npx/*/get-shit-done-cc/` (contiene copia del package scaricata via npx a uso precedente — innocua, verrà sovrascritta al prossimo download).
