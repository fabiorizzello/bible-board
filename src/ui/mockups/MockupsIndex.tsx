import { Link } from "react-router";
import { Chip } from "@heroui/react";
import { ArrowRight, CheckCircle2, Circle, Star } from "lucide-react";

/**
 * Index dei mockup S02/R005 — punto d'ingresso per il review umano.
 * Mounted on /dev/mockups.
 */

type MockupStatus = "decided" | "in_review";

interface MockupEntry {
  number: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  recommended: string;
  status: MockupStatus;
}

const MOCKUPS: MockupEntry[] = [
  {
    number: "1",
    slug: "commit-interaction",
    category: "Interazione",
    title: "Commit & touch interaction",
    description:
      "Tap nel campo Nascita → edit inline. Blur-to-save + toast undo non-invasivo con rollback 5s. Alternative (✓/✕ inline, auto-save) scartate — vedi storico nel mockup.",
    recommended: "A. Blur-to-save + toast undo",
    status: "decided",
  },
  {
    number: "2",
    slug: "add-field-flow",
    category: "Flow / Discovery",
    title: "Add field flow",
    description:
      "Tap '+ aggiungi campo' → popover unificato con content swap. Da categories → multi-chip o single-value picker, con back navigation. Niente popover che si chiudono e riaprono.",
    recommended: "Nested popover content swap",
    status: "decided",
  },
  {
    number: "2.5",
    slug: "multi-value-chip",
    category: "Array editing",
    title: "Multi-value chip array (Ruoli, Tags)",
    description:
      "Pattern unificato per array di chip inline: HeroUI Chip onClose per remove, popover input per add con suggestions dal workspace. Type+Enter aggiunge, virgola separa multipli.",
    recommended: "Inline chip + popover add con suggestions",
    status: "decided",
  },
  {
    number: "3",
    slug: "single-value-picker",
    category: "Picker unificato",
    title: "Single-value picker (Collegamento + Fonte)",
    description:
      "Picker unificato per i 2 field universali single-value. Stesso popover ~440px, search + grouped list + metadata sotto. 2 entry points: inline e chained dal mockup 2.",
    recommended: "Big anchored popover single-step",
    status: "decided",
  },
  {
    number: "4",
    slug: "markdown-descrizione",
    category: "Editor",
    title: "Markdown descrizione (Milkdown)",
    description:
      "Editor Milkdown 7.20 vero. Decisione lockata: niente alternative. Da testare su iPad reale per touch selection, Pencil Scribble, performance.",
    recommended: "Milkdown — preset-commonmark + listener",
    status: "decided",
  },
  {
    number: "5",
    slug: "composite-vita",
    category: "Composite",
    title: "Vita component (nascita + morte opt)",
    description:
      "Coppia naturale come componente unico, Right drawer Pages-style. Alternative (Modal centrato, Big popover) scartate — vedi storico nel mockup.",
    recommended: "A. Right drawer (Pages inspector)",
    status: "decided",
  },
  {
    number: "6",
    slug: "validation-ux",
    category: "Validation",
    title: "Cross-field validation UX",
    description:
      "Soft validation passive (inline icon, header badge, sidebar marker, drawer review). Alternative (Hard reject, Auto-prompt modal) scartate — vedi storico nel mockup.",
    recommended: "C. Soft validation + drawer review",
    status: "decided",
  },
  {
    number: "7",
    slug: "header-edit",
    category: "Header",
    title: "Header edit (nome + tipo + actions)",
    description:
      "Header del detail pane: come si edita nome, chip TipoElemento, e azioni (rinomina, duplica, elimina). 3 alternative con diverso grado di edit inline vs kebab menu.",
    recommended: "A. Inline nome + tipo popover + kebab actions",
    status: "in_review",
  },
  {
    number: "8",
    slug: "detail-layout",
    category: "Layout",
    title: "Detail pane layout (no more tabellare)",
    description:
      "Il 2-col label/value attuale sembra troppo tabellare. 3 alternative: status quo, Apple Calendar label-stacked, Linear chips header + body.",
    recommended: "C. Metadata chips + body (Linear style)",
    status: "in_review",
  },
];

const DECIDED_COUNT = MOCKUPS.filter((m) => m.status === "decided").length;

export function MockupsIndex() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium no-underline"
          >
            ← Torna alla app
          </Link>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">
              Phase 02 · S02 · R005
            </div>
            <Chip size="sm" variant="soft" color="accent">
              {MOCKUPS.length} mockup
            </Chip>
            <Chip size="sm" variant="soft" color="success">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                {DECIDED_COUNT} decisi
              </span>
            </Chip>
            {MOCKUPS.length - DECIDED_COUNT > 0 && (
              <Chip size="sm" variant="soft">
                <span className="inline-flex items-center gap-1">
                  <Circle size={12} />
                  {MOCKUPS.length - DECIDED_COUNT} in review
                </span>
              </Chip>
            )}
          </div>
          <h1 className="font-heading text-4xl text-ink-hi mt-2 leading-tight">
            Editor app-native — sketches
          </h1>
          <p className="text-sm text-ink-md mt-3 max-w-2xl leading-relaxed">
            Mockup React + HeroUI vero per la fase R005 (refactor inline per-campo).
            Device baseline: <strong>iPad 10.9" (Air)</strong> 1180×820 landscape ·
            820×1180 portrait. I mockup <strong>decisi</strong> sono consolidati
            sull'alternativa scelta (alternative scartate nel sotto-sezione storico).
            Quelli <strong>in review</strong> mostrano ancora 3 alternative da valutare.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCKUPS.map((m) => {
            const decided = m.status === "decided";
            return (
              <Link
                key={m.slug}
                to={`/dev/mockup-${m.slug}`}
                className={`group relative bg-panel border rounded-xl p-5 no-underline hover:shadow-md transition-all ${
                  decided
                    ? "border-emerald-300/50 hover:border-emerald-400"
                    : "border-edge hover:border-primary/40"
                }`}
              >
                {decided && (
                  <div className="absolute top-0 right-0 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 rounded-bl-xl rounded-tr-xl inline-flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Deciso
                  </div>
                )}
                {!decided && (
                  <div className="absolute top-0 right-0 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 rounded-bl-xl rounded-tr-xl inline-flex items-center gap-1">
                    <Circle size={12} />
                    In review
                  </div>
                )}
                <div className="flex items-start gap-4 mb-3 mt-1">
                  <div
                    className={`w-11 h-11 rounded-full inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0 ${
                      decided
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {m.number}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <div
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        decided ? "text-emerald-700" : "text-primary"
                      }`}
                    >
                      {m.category}
                    </div>
                    <h2 className="font-heading text-lg text-ink-hi mt-0.5 leading-tight">
                      {m.title}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-ink-md leading-relaxed mb-3">{m.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Star
                    size={12}
                    className={decided ? "text-emerald-600 fill-emerald-600" : "text-primary fill-primary"}
                  />
                  <span className="text-ink-md">
                    {decided ? "Scelta: " : "Recommended: "}
                    <strong className="text-ink-hi">{m.recommended}</strong>
                  </span>
                </div>
                <ArrowRight
                  size={18}
                  className="absolute right-5 bottom-5 text-ink-dim group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            );
          })}
        </div>

        <footer className="mt-12 pt-6 border-t border-edge text-xs text-ink-lo leading-relaxed">
          <div className="font-semibold text-ink-hi mb-2">Convenzioni del set</div>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              Tutti i mockup usano lo stesso dataset (personaggio Abraamo) per confronto a
              parità di contenuto
            </li>
            <li>
              Stack reale: <code className="bg-chip-bg px-1.5 rounded">@heroui/react</code>{" "}
              v3 + Tailwind v4 + lucide-react + tokens progetto
              (bg-primary, text-ink, font-heading)
            </li>
            <li>
              Touch target ≥44×44 (Apple HIG + WCAG 2.5.5), input HeroUI lg = 48px,
              button md = 44px
            </li>
            <li>
              Test su iPad reale: <code className="bg-chip-bg px-1.5 rounded">npm run dev -- --host</code>{" "}
              + apri da iPad sulla LAN
            </li>
            <li>
              Le route <code className="bg-chip-bg px-1.5 rounded">/dev/mockup-*</code> e{" "}
              <code className="bg-chip-bg px-1.5 rounded">src/ui/mockups/</code> sono
              dev-only — cleanup in plan 02-03
            </li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
