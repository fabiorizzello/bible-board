import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Chip, Input, Label, TextField } from "@heroui/react";
import { ChevronLeft, Star } from "lucide-react";

/**
 * Mockup S02/R005 — Composite Vita component
 *
 * 3 alternative iPad-space-aware (no half stretti):
 *   A. Stacked full-width rows (RECOMMENDED)
 *   B. Adaptive collapse/expand
 *   C. Combined notation single input
 *
 * Mounted on /dev/mockup-composite-vita (dev-only route).
 * Usa HeroUI v3 reali + tokens progetto (bg-surface, text-ink, font-heading…).
 *
 * Dataset: personaggio Abraamo, parità con altri sketch del set.
 */

export function CompositeVitaMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Header />

        {/* DDD model preview */}
        <section className="mb-10">
          <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
            Modello di dominio
          </div>
          <pre className="rounded-md bg-slate-900 text-slate-200 p-5 text-xs leading-relaxed overflow-x-auto font-mono">
{`// shared/value-objects.ts
type Vita = {
  nascita: DataStorica;
  morte?: DataStorica;  // opzionale by construction
};

const creaVita = (
  nascita: DataStorica,
  morte?: DataStorica
): Result<Vita, VitaError> =>
  morte && morte.compareTo(nascita) <= 0
    ? err({ tipo: 'morte_prima_di_nascita' })
    : ok({ nascita, morte });`}
          </pre>
        </section>

        {/* A — Recommended */}
        <Alternative
          letter="A"
          recommended
          title="Stacked full-width rows"
          subtitle="due field-row separate, ogni input full-width, coupling via prefisso label"
          mock={<StackedVitaMock />}
          grammatica={
            <>
              Due field-row indipendenti, ognuna con <Code>{`<TextField>`}</Code> →{" "}
              <Code>{`<Label>`}</Code> + <Code>{`<Input>`}</Code> HeroUI vero,
              full-width (~390px). Label condivide il prefisso{" "}
              <strong>"Vita ›"</strong> + qualifier (<em>nato</em>, <em>morto</em>) →
              coupling visivo senza chrome. Durata calcolata come{" "}
              <Code>{`<Chip>`}</Code> nel <Code>endContent</Code> dell'input morte.
              Commit blur-to-save per ogni input indipendentemente.
            </>
          }
          items={[
            ["pro", "Tap target FULL-WIDTH (~390px) — visibilità e click massimi su iPad"],
            ["pro", "Funziona identico in landscape e portrait — niente layout fragile"],
            ["pro", "Implementazione triviale: due TextField HeroUI, no animazioni, no parser"],
            ["pro", "Pattern Notion property-style — familiare iPad"],
            ["pro", "Cross-validation by construction (VO Vita) garantisce consistency"],
            ["con", "2 row verticali per \"un concetto\" — meno densità rispetto a single-row"],
            ["con", "Coupling visivo via prefix label è sottile (potrebbe non bastare)"],
          ]}
        />

        <Divider />

        {/* B — Adaptive */}
        <Alternative
          letter="B"
          title="Adaptive collapse/expand"
          subtitle="idle: compact read-mode · tap: espande in 2 input full-width · blur: collassa"
          mock={<AdaptiveVitaMock />}
          grammatica={
            <>
              <strong>Idle</strong>: row compatta read-mode <Code>2000 → 1825 · 175 anni</Code>{" "}
              (1 row, densità massima).
              <br />
              <strong>Tap sulla row</strong> → si espande verticalmente in un Card con due
              TextField HeroUI full-width. Bottone "chiudi" in alto destra. Blur fuori →
              collassa back to compact + commit.
              <br />
              Best of both worlds: dense quando non editi, comodo quando editi.
            </>
          }
          items={[
            ["pro", "Densità massima in idle (1 row) — feed Notion compatto"],
            ["pro", "Spazio massimo in edit (2 input full-width) — comodo iPad touch"],
            ["pro", 'Transizione visibile communica "questo è un componente unico"'],
            ["con", "Layout shift verticale all'espansione — può disorientare"],
            ["con", "Più complesso da implementare (animazione, focus management, keyboard)"],
            ["con", '"Tap fuori" deve essere ben definito — collide con altri popover/click target'],
          ]}
        />

        <Divider />

        {/* C — Combined notation */}
        <Alternative
          letter="C"
          title="Combined notation single input"
          subtitle="un solo Input full-width con sintassi `nascita — morte`, parsing dal dominio"
          mock={<CombinedNotationMock />}
          grammatica={
            <>
              Un solo <Code>{`<TextField>`}</Code> con <Code>{`<Input>`}</Code> full-width e
              sintassi <Code>"nascita — morte"</Code> (em-dash o trattino).
              <Code>Vita.parse()</Code> nel dominio splitta + valida + ritorna{" "}
              <Code>Result&lt;Vita, VitaError&gt;</Code>. Border passa a warning se sintassi
              invalida. Durata calcolata come <Code>{`<Chip>`}</Code> a destra.
            </>
          }
          items={[
            ["pro", "Massima compattezza visiva (1 row, 1 input)"],
            ["pro", "Power user: type-and-go, niente Tab tra due input"],
            ["pro", "Funziona perfetto in portrait stretto"],
            ["con", "<strong>Anti-discoverability</strong>: l'utente deve scoprire la sintassi"],
            ["con", 'Parser robusto è non triviale (date storiche, "a.E.V.", "circa", range incerti)'],
            ["con", "Errore di sintassi a metà digitazione → input warning costante (rumoroso)"],
            ["con", "Nessuna affordance visiva per \"morte è opzionale\""],
          ]}
        />

        <Footer />
      </div>
    </div>
  );
}

// ============================================================================
// Layout atoms
// ============================================================================

function Header() {
  return (
    <header className="mb-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium no-underline"
      >
        <ChevronLeft size={14} />
        Torna alla app
      </Link>
      <div className="flex items-center gap-4 mt-4">
        <Badge>5</Badge>
        <div>
          <h1 className="font-heading text-3xl text-ink-hi leading-tight">
            Composite Vita component
          </h1>
          <p className="text-sm text-ink-md mt-1.5 max-w-xl">
            Coppia <strong>nascita + morte (opt)</strong> come componente unico, ottimizzato
            per spazio iPad reale (full-width input ~390px, no half stretti).
          </p>
        </div>
      </div>
      <div className="mt-6 px-4 py-3 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-md text-xs text-emerald-900 leading-relaxed">
        <strong>Mockup React vero:</strong> renderizzato dal dev server con HeroUI v3 +
        Tailwind v4 + tokens progetto (bg-primary, text-ink, font-heading…). Quello che vedi
        qui è esattamente come renderà la app prod.
      </div>
    </header>
  );
}

interface AlternativeProps {
  letter: string;
  recommended?: boolean;
  title: string;
  subtitle: string;
  mock: ReactNode;
  grammatica: ReactNode;
  items: Array<["pro" | "con", string]>;
}

function Alternative({ letter, recommended, title, subtitle, mock, grammatica, items }: AlternativeProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <Badge recommended={recommended}>{letter}</Badge>
        <div className="flex-1">
          <h2 className="font-heading text-xl text-ink-hi">{title}</h2>
          <div className="text-sm text-ink-lo">{subtitle}</div>
        </div>
        {recommended && (
          <Chip color="accent" variant="primary" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Star size={12} />
              Raccomandato per iPad
            </span>
          </Chip>
        )}
      </div>

      <div className="flex gap-8 items-start flex-wrap">
        <IpadFrame>{mock}</IpadFrame>
        <div className="flex-1 min-w-[320px] space-y-5">
          <Grammatica>{grammatica}</Grammatica>
          <ProCons items={items} />
        </div>
      </div>
    </section>
  );
}

function Badge({ children, recommended }: { children: ReactNode; recommended?: boolean }) {
  const base =
    "w-11 h-11 rounded-full inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0";
  const skin = recommended
    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25"
    : "bg-primary/10 text-primary";
  return <div className={`${base} ${skin}`}>{children}</div>;
}

function IpadFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-panel border border-edge rounded-xl shadow-md overflow-hidden flex-shrink-0"
      style={{ width: 520 }}
    >
      <div className="h-9 bg-chrome border-b border-edge flex items-center justify-between px-4 text-[10px] uppercase tracking-wider text-ink-lo font-semibold">
        <span>iPad · detail pane · 520px</span>
        <span className="text-emerald-600">touch ≥ 44px ✓</span>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

function ElementoHeader() {
  return (
    <div className="flex flex-col gap-2 pb-5 border-b border-edge mb-3">
      <Chip
        size="sm"
        color="accent"
        variant="soft"
        className="self-start"
      >
        personaggio
      </Chip>
      <div className="font-heading text-2xl font-semibold text-ink-hi leading-tight">
        Abraamo
      </div>
    </div>
  );
}

function SimpleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 min-h-[48px] py-1 px-2 -mx-2 rounded hover:bg-primary/5 transition-colors">
      <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
        {label}
      </span>
      <span className="flex-1 text-[15px] text-ink-hi">{value}</span>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-chip-bg px-1.5 py-0.5 rounded text-ink-md">
      {children}
    </code>
  );
}

function Grammatica({ children }: { children: ReactNode }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
      <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
        Grammatica
      </div>
      <div>{children}</div>
    </div>
  );
}

function ProCons({ items }: { items: Array<["pro" | "con", string]> }) {
  return (
    <div className="text-sm leading-snug space-y-1.5">
      {items.map(([type, text], i) => (
        <div key={i} className="flex items-start gap-2">
          <span
            className={`font-bold flex-shrink-0 ${
              type === "pro" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {type === "pro" ? "+" : "−"}
          </span>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return (
    <div
      className="h-px my-9"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.18), transparent)",
      }}
    />
  );
}

function Footer() {
  return (
    <footer className="mt-14 pt-6 border-t border-edge text-xs text-ink-lo leading-relaxed">
      <div className="font-semibold text-ink-hi mb-1.5">Note iPad-specific</div>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          <strong>Spazio iPad reale:</strong> detail pane 520px − label 110px − gap 16px =
          ~395px disponibili. Tutti gli input nelle alternative usano questo spazio per
          intero (no half stretti come la versione precedente).
        </li>
        <li>
          <strong>HeroUI vero:</strong> <Code>{`<TextField>`}</Code>,{" "}
          <Code>{`<Input>`}</Code>, <Code>{`<Chip>`}</Code> reali da{" "}
          <Code>@heroui/react@3.0.2</Code> + design tokens del progetto. Tailwind v4
          processato dal dev server.
        </li>
        <li>
          <strong>Pattern generalizzabile:</strong> stacked rows funzionano anche per Regno
          (re), Periodo storico, Profezia (enunciazione → adempimento), tutti come istanze
          di <Code>Intervallo&lt;DataStorica&gt;</Code>.
        </li>
      </ul>
    </footer>
  );
}

// ============================================================================
// ALT A — Stacked full-width rows
// ============================================================================

function StackedVitaMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [morte, setMorte] = useState("1825 a.E.V.");
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="space-y-1 my-1">
        <div className="flex items-start gap-4 min-h-[48px]">
          <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
            <span className="opacity-60">Vita ›</span> nato
          </span>
          <div className="flex-1">
            <TextField value={nascita} onChange={setNascita} aria-label="Vita - nascita">
              <Input className="min-h-[48px]" />
            </TextField>
          </div>
        </div>
        <div className="flex items-start gap-4 min-h-[48px]">
          <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
            <span className="opacity-60">Vita ›</span> morto
          </span>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1">
              <TextField value={morte} onChange={setMorte} aria-label="Vita - morte">
                <Input placeholder="opzionale" className="min-h-[48px]" />
              </TextField>
            </div>
            <Chip
              size="sm"
              variant="soft"
              className="bg-chip-bg text-ink-lo font-mono text-[11px] flex-shrink-0"
            >
              175 anni
            </Chip>
          </div>
        </div>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

// ============================================================================
// ALT B — Adaptive collapse/expand
// ============================================================================

function AdaptiveVitaMock() {
  const [expanded, setExpanded] = useState(true);
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [morte, setMorte] = useState("1825 a.E.V.");

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="flex items-start gap-4 min-h-[48px] my-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Vita
        </span>
        <div className="flex-1">
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full text-left flex items-center gap-3 min-h-[48px] px-3 py-2 rounded-md hover:bg-primary/5 cursor-text transition-colors"
            >
              <span className="text-[15px] text-ink-hi">{nascita}</span>
              <span className="text-ink-dim">→</span>
              <span className="text-[15px] text-ink-hi">{morte}</span>
              <Chip
                size="sm"
                variant="soft"
                className="ml-auto bg-chip-bg text-ink-lo font-mono text-[11px]"
              >
                175 anni
              </Chip>
            </button>
          )}
          {expanded && (
            <div className="space-y-2 p-3 -mx-1 rounded-lg bg-primary/5 border border-primary/15">
              <div className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-2">
                <span>Vita — modifica</span>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="ml-auto text-[10px] text-primary hover:text-primary/80 normal-case font-medium underline"
                >
                  chiudi
                </button>
              </div>

              <TextField value={nascita} onChange={setNascita} aria-label="Vita - nascita">
                <Label className="text-[10px] uppercase text-ink-lo font-semibold mb-1 block">
                  nato
                </Label>
                <Input className="min-h-[48px]" />
              </TextField>

              <TextField value={morte} onChange={setMorte} aria-label="Vita - morte">
                <Label className="text-[10px] uppercase text-ink-lo font-semibold mb-1 block">
                  morto <span className="opacity-60 normal-case">(opzionale)</span>
                </Label>
                <Input className="min-h-[48px]" />
              </TextField>

              <div className="flex justify-between items-center pt-2 border-t border-primary/15 text-xs">
                <span className="text-primary font-semibold">Durata calcolata</span>
                <span className="text-ink-hi font-mono font-semibold">175 anni</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

// ============================================================================
// ALT C — Combined notation single input
// ============================================================================

function CombinedNotationMock() {
  const [val, setVal] = useState("2000 — 1825 a.E.V.");
  const valid = /\d.*[—-].*\d/.test(val);

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="flex items-start gap-4 min-h-[48px] my-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Vita
        </span>
        <div className="flex-1 flex items-start gap-3">
          <div className="flex-1">
            <TextField
              value={val}
              onChange={setVal}
              isInvalid={!valid}
              aria-label="Vita - notazione combinata"
            >
              <Input
                placeholder="es: 2000 — 1825 a.E.V."
                className="min-h-[48px]"
              />
            </TextField>
            <div className="text-[10px] text-ink-lo mt-1">
              Sintassi: <Code>nascita — morte</Code> (em-dash, morte opzionale)
            </div>
          </div>
          <Chip
            size="sm"
            variant="soft"
            className="bg-chip-bg text-ink-lo font-mono text-[11px] flex-shrink-0 mt-3"
          >
            175 anni
          </Chip>
        </div>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}
