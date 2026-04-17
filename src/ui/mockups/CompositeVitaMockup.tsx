import { useState, type ReactNode } from "react";
import { Chip, Drawer, Input, Label, TextField } from "@heroui/react";
import {
  Alternative,
  Code,
  ConsideredAlternatives,
  ElementoHeader,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 5: Composite Vita component
 *
 * Decisione lockata: A. Right drawer (Pages format inspector style).
 * Le alternative Modal centered e Big anchored popover sono elencate in fondo
 * come storico, non implementate.
 *
 * Vincoli rispettati: idle = testo plain, edit = full-width input,
 * zero layout shift sul detail pane.
 */

export function CompositeVitaMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="5"
          title="Composite Vita component"
          subtitle={
            <>
              Coppia <strong>nascita + morte (opt)</strong> come componente unico. Edit in
              right drawer — pattern Apple Pages format inspector, lascia il detail pane
              visibile a sinistra.
            </>
          }
        />

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
            ["pro", "Sfrutta lo spazio orizzontale di iPad 10.9\" landscape (1180px)"],
            ["pro", "Generalizzabile: stesso inspector per tutti i field complessi (collegamenti, fonti, allegati)"],
            ["pro", "Input molto grossi (~400px wide, 52px h) — touch comodissimo"],
            ["con", "iPad portrait (~820px) l'inspector copre quasi tutto il detail pane"],
            ["con", "1 tap extra per editare un singolo half (no edit diretto inline)"],
          ]}
        />

        <ConsideredAlternatives
          entries={[
            {
              letter: "B",
              title: "Centered modal sheet",
              summary:
                "Tap row → Modal HeroUI centrato ~520px, backdrop dim. Pattern Pages quick-add.",
              pros: [
                "Focus totale sul commit — backdrop attenua il contesto",
                "Pattern iPad familiare (Pages/Numbers add row, Mail compose modal)",
                "Funziona identico in landscape e portrait",
                "Atomicità implicita: i due valori commitano insieme via Salva/Annulla",
              ],
              cons: [
                "Modal pesante — più web-app che tablet-fluido",
                "Rompe il principio inline per-campo (mode swap esplicito)",
                "Necessita pulsanti Salva/Annulla espliciti (più chrome)",
                "Backdrop nasconde il detail pane sotto",
              ],
              whyRejected:
                "Il Right Drawer è più tablet-native e preserva il contesto del detail pane a sinistra. Il Modal è un pattern enterprise-web, non iPad-fluido.",
            },
            {
              letter: "C",
              title: "Big anchored popover (Calendar event style)",
              summary:
                "Tap row → Popover HeroUI ancorato ~440px wide con padding tablet.",
              pros: [
                "Anchored al field — l'utente vede da dove arriva (context preservato)",
                "Lateralmente compatto — non copre tutto il detail pane",
                "Pattern Apple Calendar event editor — riconoscibile su iPad",
                "Stesso primitive HeroUI di sketch 03 (collegamento picker)",
                "iPad-friendly se sized correttamente (440px+ wide, padding 24-28px)",
              ],
              cons: [
                "Vicino al bordo destro del detail pane può essere clipped",
                "Visivamente simile a popover web se non curato (rischio look web-app)",
                "iPad portrait con poco spazio orizzontale può sembrare un modal piccolo",
              ],
              whyRejected:
                "Il Drawer è più robusto del Popover su iPad portrait. Il Popover funziona ma può essere clipped vicino ai bordi; il Drawer slide-in è sempre ben collocato.",
            },
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Pattern unificato:</strong> il Right Drawer sarà riutilizzato per tutti
              i field complessi (collegamenti estesi, fonti con metadata, allegati). Vedi
              anche sketch 6 per validation review panel → stesso primitive.
            </li>
            <li>
              <strong>Generalizzabile:</strong> lo stesso drawer vale per Regno (re), Periodo
              storico, Profezia (enunciazione → adempimento), come istanze di{" "}
              <Code>Intervallo&lt;DataStorica&gt;</Code>.
            </li>
            <li>
              <strong>HeroUI setup:</strong> <Code>{`<Drawer>`}</Code> wrapper,{" "}
              <Code>{`<Drawer.Backdrop>`}</Code> DEVE avvolgere{" "}
              <Code>{`<Drawer.Content placement="right">`}</Code>. Senza nesting, Backdrop è
              orfano e non si apre.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Shared trigger: idle = plain text row (tappable)
// ============================================================================

interface VitaTriggerProps {
  nascita: string;
  morte: string;
}

function VitaTrigger({ nascita, morte }: VitaTriggerProps): ReactNode {
  return (
    <span className="flex-1 flex items-center gap-3 min-h-[48px] px-3 py-2 -mx-3 rounded-md hover:bg-primary/5 cursor-pointer transition-colors">
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
// Right drawer — recommended implementation
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
