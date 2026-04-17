import { Link } from "react-router";
import { Chip } from "@heroui/react";
import { ArrowRight, Star } from "lucide-react";

/**
 * Index dei mockup S02/R005 — punto d'ingresso per il review umano.
 * Mounted on /dev/mockups.
 */

interface MockupEntry {
  number: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  recommended: string;
}

const MOCKUPS: MockupEntry[] = [
  {
    number: "1",
    slug: "commit-interaction",
    category: "Interazione",
    title: "Commit & touch interaction",
    description:
      "Tap nel campo Nascita di Abraamo, modifichi. Come si committa? 3 alternative: blur-to-save, ✓/✕ inline, auto-save toast.",
    recommended: "A. Blur-to-save (Apple Notes pattern)",
  },
  {
    number: "2",
    slug: "empty-fields",
    category: "Discovery",
    title: "Empty fields + aggiungi campo",
    description:
      "Campi vuoti sempre visibili o on-demand? Dove vive il '+ aggiungi'? 3 alternative: placeholder, popover chips, sticky toolbar.",
    recommended: "B. Riga inline + popover chips",
  },
  {
    number: "3",
    slug: "collegamento-picker",
    category: "Popover",
    title: "Collegamento picker",
    description:
      "Aggiungi link → Isacco con TipoLink parentela, ruolo figlio. 3 alternative: popover single-step, drawer con filtri, modal command-palette.",
    recommended: "A. Big anchored popover single-step",
  },
  {
    number: "4",
    slug: "markdown-descrizione",
    category: "Editor",
    title: "Markdown descrizione (Milkdown)",
    description:
      "Editor Milkdown 7.20 vero (non più sketch statico). Decisione lockata: niente alternative. Da testare su iPad reale per touch selection, Pencil Scribble, performance.",
    recommended: "Milkdown vero — preset-commonmark + listener",
  },
  {
    number: "5",
    slug: "composite-vita",
    category: "Composite",
    title: "Vita component (nascita + morte opt)",
    description:
      "Coppia naturale come componente unico, tablet feel iPad. 3 alternative: right drawer Pages-style, modal centered, big popover.",
    recommended: "A. Right drawer (Pages inspector style)",
  },
  {
    number: "6",
    slug: "validation-ux",
    category: "Validation",
    title: "Cross-field validation UX",
    description:
      "Quando un commit viola un vincolo cross-aggregate, come reagisce l'UI? 3 alternative: hard reject, auto-prompt modal, soft validation persistente.",
    recommended: "C. Soft validation + drawer review panel",
  },
];

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
          </div>
          <h1 className="font-heading text-4xl text-ink-hi mt-2 leading-tight">
            Editor app-native — sketches
          </h1>
          <p className="text-sm text-ink-md mt-3 max-w-2xl leading-relaxed">
            Mockup React + HeroUI vero per la fase R005 (refactor inline per-campo).
            Device baseline: <strong>iPad 10.9" (Air)</strong> 1180×820 landscape ·
            820×1180 portrait. Apri ognuno, confronta le 3 alternative, poi torna in chat
            con le scelte.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCKUPS.map((m) => (
            <Link
              key={m.slug}
              to={`/dev/mockup-${m.slug}`}
              className="group bg-panel border border-edge rounded-xl p-5 no-underline hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0">
                  {m.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                    {m.category}
                  </div>
                  <h2 className="font-heading text-lg text-ink-hi mt-0.5 leading-tight">
                    {m.title}
                  </h2>
                </div>
                <ArrowRight
                  size={18}
                  className="text-ink-dim group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-3"
                />
              </div>
              <p className="text-sm text-ink-md leading-relaxed mb-3">{m.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <Star size={12} className="text-primary fill-primary" />
                <span className="text-ink-md">
                  Recommended: <strong className="text-ink-hi">{m.recommended}</strong>
                </span>
              </div>
            </Link>
          ))}
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
