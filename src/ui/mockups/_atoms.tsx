import { Link } from "react-router";
import { Chip } from "@heroui/react";
import { ChevronLeft, Star, X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * RemovableChip — HeroUI Chip + X button per remove.
 * HeroUI v3 Chip non ha onClose nativo, lo facciamo a mano.
 */
export function RemovableChip({
  children,
  onRemove,
  className = "bg-primary/10 text-primary",
  size = "md",
}: {
  children: ReactNode;
  onRemove: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Chip size={size} variant="soft" className={className}>
      <span className="inline-flex items-center gap-1.5">
        {children}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Rimuovi"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-current/20 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X size={12} />
        </button>
      </span>
    </Chip>
  );
}

/**
 * Atoms condivisi per i mockup .tsx in src/ui/mockups/.
 * Dev-only artifacts — da rimuovere prima di prod insieme a /dev/mockup-* routes.
 *
 * Convenzioni:
 *   - Device baseline: iPad 10.9" (1180×820 landscape, 820×1180 portrait)
 *   - Detail pane mock: 520px (rappresentazione 3-pane su iPad 10.9")
 *   - Touch target ≥ 44×44 (Apple HIG + WCAG 2.5.5)
 *   - HeroUI v3 reali + tokens progetto (bg-surface, text-ink, font-heading…)
 */

export interface MockupHeaderProps {
  number: string;
  title: string;
  subtitle: ReactNode;
}

export function MockupHeader({ number, title, subtitle }: MockupHeaderProps) {
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
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0">
          {number}
        </div>
        <div>
          <h1 className="font-heading text-3xl text-ink-hi leading-tight">{title}</h1>
          <div className="text-sm text-ink-md mt-1.5 max-w-2xl">{subtitle}</div>
        </div>
      </div>
      <div className="mt-6 px-4 py-3 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-md text-xs text-emerald-900 leading-relaxed">
        <strong>Mockup React vero — iPad 10.9" baseline:</strong> renderizzato dal dev server
        con HeroUI v3 + Tailwind v4 + tokens progetto. Test su iPad reale via{" "}
        <code>npm run dev -- --host</code>.
      </div>
    </header>
  );
}

export interface AlternativeProps {
  letter: string;
  recommended?: boolean;
  antiPattern?: boolean;
  title: string;
  subtitle: string;
  mock: ReactNode;
  grammatica: ReactNode;
  items: Array<["pro" | "con", string]>;
}

export function Alternative({
  letter,
  recommended,
  antiPattern,
  title,
  subtitle,
  mock,
  grammatica,
  items,
}: AlternativeProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <Badge recommended={recommended} antiPattern={antiPattern}>
          {letter}
        </Badge>
        <div className="flex-1">
          <h2 className="font-heading text-xl text-ink-hi">{title}</h2>
          <div className="text-sm text-ink-lo">{subtitle}</div>
        </div>
        {recommended && (
          <Chip color="accent" variant="primary" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Star size={12} />
              Raccomandato
            </span>
          </Chip>
        )}
        {antiPattern && (
          <Chip color="danger" variant="soft" size="sm">
            Anti-pattern
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

export function Badge({
  children,
  recommended,
  antiPattern,
}: {
  children: ReactNode;
  recommended?: boolean;
  antiPattern?: boolean;
}) {
  const base =
    "w-11 h-11 rounded-full inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0";
  const skin = recommended
    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25"
    : antiPattern
    ? "bg-red-100 text-red-700"
    : "bg-primary/10 text-primary";
  return <div className={`${base} ${skin}`}>{children}</div>;
}

export function IpadFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-panel border border-edge rounded-xl shadow-md flex-shrink-0"
      style={{ width: 520 }}
    >
      <div className="h-9 bg-chrome border-b border-edge flex items-center justify-between px-4 text-[10px] uppercase tracking-wider text-ink-lo font-semibold rounded-t-xl">
        <span>iPad 10.9" · detail pane · 520px</span>
        <span className="text-emerald-600">touch ≥ 44px ✓</span>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

export function ElementoHeader({ name = "Abraamo", tipo = "personaggio" }: { name?: string; tipo?: string }) {
  return (
    <div className="flex flex-col gap-2 pb-5 border-b border-edge mb-3">
      <Chip size="sm" color="accent" variant="soft" className="self-start">
        {tipo}
      </Chip>
      <div className="font-heading text-2xl font-semibold text-ink-hi leading-tight">{name}</div>
    </div>
  );
}

export function SimpleField({ label, value, dim }: { label: string; value: ReactNode; dim?: boolean }) {
  return (
    <div className="flex items-center gap-4 min-h-[48px] py-1 px-2 -mx-2 rounded hover:bg-primary/5 transition-colors">
      <span
        className={`w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider font-semibold ${
          dim ? "text-ink-dim" : "text-primary"
        }`}
      >
        {label}
      </span>
      <span className={`flex-1 text-[15px] ${dim ? "text-ink-dim italic" : "text-ink-hi"}`}>{value}</span>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-chip-bg px-1.5 py-0.5 rounded text-ink-md">{children}</code>
  );
}

export function Grammatica({ children }: { children: ReactNode }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
      <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
        Grammatica
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ProCons({ items }: { items: Array<["pro" | "con", string]> }) {
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

export function Divider() {
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

export function MockupFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="mt-14 pt-6 border-t border-edge text-xs text-ink-lo leading-relaxed">
      <div className="font-semibold text-ink-hi mb-1.5">Note iPad 10.9"</div>
      {children}
    </footer>
  );
}

/**
 * Summary section per alternative valutate e SCARTATE (solo riferimento storico,
 * no mock implementato). Compatto, mostra pro/con essenziali.
 */
export interface ConsideredEntry {
  letter: string;
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  whyRejected: string;
}

export function ConsideredAlternatives({ entries }: { entries: ConsideredEntry[] }) {
  return (
    <section className="mt-12 pt-8 border-t border-edge">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wider text-ink-lo font-bold mb-1">
          Storico · alternative considerate
        </div>
        <p className="text-sm text-ink-md max-w-2xl">
          Queste alternative sono state valutate e <strong>scartate</strong>. Mantenute qui per
          conoscenza delle ragioni — non implementate nel mockup.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((e) => (
          <div
            key={e.letter}
            className="bg-panel border border-edge rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-ink-dim/20 text-ink-lo inline-flex items-center justify-center font-mono font-bold text-sm flex-shrink-0">
                {e.letter}
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm text-ink-md line-through decoration-ink-dim/50 decoration-1">
                  {e.title}
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-md mb-3 leading-relaxed">{e.summary}</p>
            <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-1">
              Pro
            </div>
            <ul className="list-disc list-inside text-[11px] text-ink-md space-y-0.5 mb-2 ml-1">
              {e.pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-1">
              Contro
            </div>
            <ul className="list-disc list-inside text-[11px] text-ink-md space-y-0.5 mb-2 ml-1">
              {e.cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <div className="text-[10px] pt-2 mt-2 border-t border-edge">
              <span className="uppercase tracking-wider text-rose-600 font-bold">Perché scartata:</span>{" "}
              <span className="text-ink-md italic">{e.whyRejected}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
