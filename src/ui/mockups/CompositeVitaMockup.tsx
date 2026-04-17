import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Chip, Drawer, Input, Label, Modal, Popover, TextField } from "@heroui/react";
import { ChevronLeft, Star } from "lucide-react";

/**
 * Mockup S02/R005 — Composite Vita component (v3 — tablet feel)
 *
 * 3 alternative pensate per iPad tablet (no mobile, no web-app):
 *   A. Right drawer (Pages format inspector style)        ⭐ RECOMMENDED
 *   B. Centered modal sheet (Numbers/Pages quick edit)
 *   C. Big anchored popover (Apple Calendar event style)
 *
 * Vincoli rispettati: idle = testo plain, edit = full-width input,
 * zero layout shift sul detail pane.
 *
 * Mounted on /dev/mockup-composite-vita.
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

        {/* A — Right drawer (RECOMMENDED) */}
        <Alternative
          letter="A"
          recommended
          title="Right drawer (Pages inspector style)"
          subtitle="tap row → drawer slide-in da destra ~440px · detail pane resta visibile a sinistra · iPad-native"
          mock={<DrawerRightVitaMock />}
          grammatica={
            <>
              Idle: row 48px plain text. Tap row → <Code>{`<Drawer placement="right">`}</Code>{" "}
              HeroUI slide-in dal bordo destro, ~440px di larghezza. Il detail pane resta
              visibile a sinistra (overlay con backdrop semi-trasparente).
              <br />
              Inspector ha header con titolo + close X, body con 2 <Code>{`<TextField>`}</Code>{" "}
              full-width grossi (h ~52px), durata calcolata, footer con hint commit.
              <br />
              Tap backdrop / tap X / Esc → close + commit. <strong>Pattern Apple Pages
              format inspector</strong> — il pattern più tablet-iPad che esiste.
            </>
          }
          items={[
            ["pro", "<strong>Pattern iPad-nativo per eccellenza</strong> — Apple Pages, Numbers, Mail compose"],
            ["pro", "Inspector ~440px lascia visibile metà detail pane a sinistra (contesto preservato)"],
            ["pro", "Sfrutta lo spazio orizzontale di iPad landscape (1194-1366px)"],
            ["pro", "Generalizzabile: stesso inspector per tutti i field complessi (collegamenti, fonti, allegati)"],
            ["pro", "Input molto grossi (~400px wide, 52px h) — touch comodissimo"],
            ["con", "iPad portrait (~820px) l'inspector copre quasi tutto il detail pane"],
            ["con", "1 tap extra per editare un singolo half (no edit diretto inline)"],
            ["con", "Pattern nuovo per il progetto — primo uso di Drawer placement=right"],
          ]}
        />

        <Divider />

        {/* B — Centered modal sheet */}
        <Alternative
          letter="B"
          title="Centered modal sheet"
          subtitle="tap row → modal HeroUI centrato ~520px · backdrop dim · pattern Pages quick add"
          mock={<ModalCenterVitaMock />}
          grammatica={
            <>
              Idle: row 48px plain text. Tap row → <Code>{`<Modal>`}</Code> HeroUI centrato,
              ~520px wide × auto-height, backdrop dim al 50%.
              <br />
              Header con titolo "Modifica vita" + close X, body con 2 TextField full-width
              grossi (~52px h), durata calcolata, footer "Salva" o "Annulla".
              <br />
              Tap backdrop / X / Esc → close + commit. <strong>Pattern Apple Pages
              quick-add</strong> — formale, focused, atomico.
            </>
          }
          items={[
            ["pro", "Focus totale sul commit — backdrop attenua il contesto"],
            ["pro", "Pattern iPad familiare (Pages/Numbers add row, Mail compose modal)"],
            ["pro", "Funziona identico in landscape e portrait"],
            ["pro", "Atomicità implicita: i due valori commitano insieme via Salva/Annulla"],
            ["con", "<strong>Modal pesante</strong> — più web-app che tablet-fluido"],
            ["con", "Rompe il principio inline per-campo (è un mode swap esplicito)"],
            ["con", "Necessita pulsanti Salva/Annulla espliciti (più chrome)"],
            ["con", "Backdrop nasconde il detail pane sotto"],
          ]}
        />

        <Divider />

        {/* C — Big anchored popover */}
        <Alternative
          letter="C"
          title="Big anchored popover (Calendar event style)"
          subtitle="tap row → popover HeroUI ancorato ~440px wide con padding generoso · sembra una mini-card iPad"
          mock={<PopoverBigVitaMock />}
          grammatica={
            <>
              Idle: row 48px plain text. Tap row → <Code>{`<Popover>`}</Code> HeroUI ancorato,
              ma <strong>large size</strong> (~440px wide) con padding 6-8 generoso, shadow
              importante, border-radius large.
              <br />
              Differenza dal popover classic web: dimensioni e padding tablet, input grossi
              (h 52px), sembra "una mini-card che galleggia", non un dropdown desktop.
              <br />
              Pattern Apple Calendar event quick-edit, iPadOS Notes attachment popover.
            </>
          }
          items={[
            ["pro", "Anchored al field — l'utente vede da dove arriva (context preservato)"],
            ["pro", "Lateralmente compatto — non copre tutto il detail pane"],
            ["pro", "Pattern Apple Calendar event editor — riconoscibile su iPad"],
            ["pro", "Stesso primitive HeroUI di sketch 03 (collegamento picker) → coerenza"],
            ["pro", "iPad-friendly se sized correttamente (440px+ wide, padding 24-28px)"],
            ["con", "Vicino al bordo destro del detail pane può essere clipped"],
            ["con", "Visivamente simile a popover web se non curato (rischio look web-app)"],
            ["con", "iPad portrait con poco spazio orizzontale può sembrare un modal piccolo"],
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
            Composite Vita component <span className="text-base text-ink-lo">— v3 tablet</span>
          </h1>
          <p className="text-sm text-ink-md mt-1.5 max-w-2xl">
            3 alternative pensate solo iPad tablet (no mobile-feel come bottom sheet, no
            web-feel come popover stretti). Tutte rispettano: idle = testo, edit = full-width,
            zero layout shift.
          </p>
        </div>
      </div>
      <div className="mt-6 px-4 py-3 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-md text-xs text-emerald-900 leading-relaxed">
        <strong>Mockup React vero:</strong> renderizzato dal dev server con HeroUI v3
        (Drawer right, Modal, Popover) + Tailwind v4 + tokens progetto. Il drawer non si
        vedrà in tutta la sua larghezza nel mock 520px — apri da iPad reale per fedeltà
        completa con <code>npm run dev -- --host</code>.
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
      className="bg-panel border border-edge rounded-xl shadow-md flex-shrink-0"
      style={{ width: 520 }}
    >
      <div className="h-9 bg-chrome border-b border-edge flex items-center justify-between px-4 text-[10px] uppercase tracking-wider text-ink-lo font-semibold rounded-t-xl">
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
      <Chip size="sm" color="accent" variant="soft" className="self-start">
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
      <div className="font-semibold text-ink-hi mb-1.5">Note iPad-tablet specific</div>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          <strong>Pattern tablet vs mobile vs web:</strong> bottom sheet = iOS mobile,
          dropdown stretto = web desktop, popover anchored grande / right drawer / centered
          modal = iPad tablet nativo.
        </li>
        <li>
          <strong>HeroUI primitives:</strong> A usa <Code>{`<Drawer placement="right">`}</Code>,
          B usa <Code>{`<Modal>`}</Code>, C usa <Code>{`<Popover>`}</Code> con sizing tablet.
        </li>
        <li>
          <strong>iPad reale:</strong> il mock 520px è la <em>detail pane</em> nel 3-pane
          layout. In viewport reale (1194-1366px landscape) drawer/modal/popover hanno tutto
          lo spazio del browser, non solo i 520px del mock.
        </li>
        <li>
          <strong>Test su iPad:</strong> <code>npm run dev -- --host</code> + apri da iPad
          sulla LAN per validare le proporzioni vere.
        </li>
      </ul>
    </footer>
  );
}

// ============================================================================
// Shared trigger atom (idle = plain text row)
// ============================================================================

interface VitaTriggerProps {
  nascita: string;
  morte: string;
  className?: string;
}

function VitaTrigger({ nascita, morte, className = "" }: VitaTriggerProps) {
  return (
    <span className={`flex-1 flex items-center gap-3 min-h-[48px] px-3 py-2 -mx-3 rounded-md hover:bg-primary/5 cursor-pointer transition-colors ${className}`}>
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
    </span>
  );
}

// ============================================================================
// ALT A — Right drawer (Pages inspector style)
// ============================================================================

function DrawerRightVitaMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [morte, setMorte] = useState("1825 a.E.V.");

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="flex items-center gap-4 min-h-[48px]">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Vita
        </span>
        <Drawer>
          <Drawer.Trigger className="flex-1">
            <VitaTrigger nascita={nascita} morte={morte} />
          </Drawer.Trigger>
          <Drawer.Backdrop>
            <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
              <Drawer.Dialog>
                <Drawer.Header className="px-7 py-5 border-b border-edge">
                  <Drawer.Heading className="font-heading text-xl text-ink-hi">
                    Modifica vita
                  </Drawer.Heading>
                  <Drawer.CloseTrigger />
                </Drawer.Header>
                <Drawer.Body className="px-7 py-6 space-y-5">
                  <TextField value={nascita} onChange={setNascita}>
                    <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                      Nato (obbligatoria)
                    </Label>
                    <Input className="min-h-[52px] text-base" />
                  </TextField>
                  <TextField value={morte} onChange={setMorte}>
                    <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                      Morto <span className="opacity-60 normal-case">(opzionale)</span>
                    </Label>
                    <Input placeholder="—" className="min-h-[52px] text-base" />
                  </TextField>
                  <div className="flex justify-between items-center pt-3 border-t border-edge text-sm">
                    <span className="text-primary font-semibold">Durata calcolata</span>
                    <span className="text-ink-hi font-mono font-semibold">175 anni</span>
                  </div>
                </Drawer.Body>
                <Drawer.Footer className="px-7 py-3 text-[11px] text-ink-dim border-t border-edge">
                  Tap fuori, Esc, o X per chiudere e salvare
                </Drawer.Footer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

// ============================================================================
// ALT B — Centered modal sheet
// ============================================================================

function ModalCenterVitaMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [morte, setMorte] = useState("1825 a.E.V.");

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="flex items-center gap-4 min-h-[48px]">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Vita
        </span>
        <Modal>
          <Modal.Trigger className="flex-1">
            <VitaTrigger nascita={nascita} morte={morte} />
          </Modal.Trigger>
          <Modal.Backdrop>
            <Modal.Container placement="center" size="md">
              <Modal.Dialog className="w-[520px] max-w-[90vw]">
                <Modal.Header className="px-7 py-5 border-b border-edge">
                  <Modal.Heading className="font-heading text-xl text-ink-hi">
                    Modifica vita
                  </Modal.Heading>
                  <Modal.CloseTrigger />
                </Modal.Header>
                <Modal.Body className="px-7 py-6 space-y-5">
                  <TextField value={nascita} onChange={setNascita}>
                    <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                      Nato (obbligatoria)
                    </Label>
                    <Input className="min-h-[52px] text-base" />
                  </TextField>
                  <TextField value={morte} onChange={setMorte}>
                    <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                      Morto <span className="opacity-60 normal-case">(opzionale)</span>
                    </Label>
                    <Input placeholder="—" className="min-h-[52px] text-base" />
                  </TextField>
                  <div className="flex justify-between items-center pt-3 border-t border-edge text-sm">
                    <span className="text-primary font-semibold">Durata calcolata</span>
                    <span className="text-ink-hi font-mono font-semibold">175 anni</span>
                  </div>
                </Modal.Body>
                <Modal.Footer className="px-7 py-4 border-t border-edge text-[11px] text-ink-dim">
                  Esc o tap fuori per annullare
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

// ============================================================================
// ALT C — Big anchored popover (Calendar event style)
// ============================================================================

function PopoverBigVitaMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [morte, setMorte] = useState("1825 a.E.V.");

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />

      <div className="flex items-center gap-4 min-h-[48px]">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Vita
        </span>
        <Popover>
          <Popover.Trigger className="flex-1">
            <VitaTrigger nascita={nascita} morte={morte} />
          </Popover.Trigger>
          <Popover.Content className="w-[440px]">
            <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-6">
              <Popover.Heading className="font-heading text-lg text-ink-hi mb-4">
                Modifica vita
              </Popover.Heading>
              <div className="space-y-4">
                <TextField value={nascita} onChange={setNascita}>
                  <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                    Nato (obbligatoria)
                  </Label>
                  <Input className="min-h-[52px] text-base" />
                </TextField>
                <TextField value={morte} onChange={setMorte}>
                  <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                    Morto <span className="opacity-60 normal-case">(opzionale)</span>
                  </Label>
                  <Input placeholder="—" className="min-h-[52px] text-base" />
                </TextField>
                <div className="flex justify-between items-center pt-3 border-t border-edge text-sm">
                  <span className="text-primary font-semibold">Durata calcolata</span>
                  <span className="text-ink-hi font-mono font-semibold">175 anni</span>
                </div>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>

      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}
