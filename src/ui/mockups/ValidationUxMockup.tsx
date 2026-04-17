import { Chip, Drawer } from "@heroui/react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  Alternative,
  Code,
  ConsideredAlternatives,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 6: Validation UX cross-field
 *
 * Decisione lockata: C. Soft validation persistente con drawer review panel.
 * Le alternative A (Hard reject) e B (Auto-prompt modal) sono elencate in
 * fondo come storico, non implementate.
 *
 * Scenario: l'evento "Patto di Mamre" 2050 a.E.V. referenzia Abraamo, ma
 * precede la sua nascita (2000 a.E.V.). L'UI segnala senza bloccare.
 */

export function ValidationUxMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="6"
          title="Validation UX cross-field"
          subtitle={
            <>
              Scenario: l'evento <em>"Patto di Mamre" 2050 a.E.V.</em> referenzia Abraamo,
              ma precede la sua nascita (2000 a.E.V.). Soft validation non-bloccante con
              drawer review panel.
            </>
          }
        />

        <Alternative
          letter="C"
          recommended
          title="Soft validation + drawer review panel"
          subtitle="commit sempre ok · 4 livelli passive cues · tap badge header → drawer con lista warnings"
          mock={<SoftValidationMock />}
          grammatica={
            <>
              Commit sempre accettato. Validation gira al READ via{" "}
              <Code>{`useElemento(id)`}</Code> → ritorna sempre{" "}
              <Code>{`{ elemento, warnings }`}</Code>.
              <br />
              <strong>4 livelli passive cues</strong>:
              <ol className="list-decimal list-inside ml-2 mt-1 space-y-0.5">
                <li>
                  <strong>Inline icon</strong> ⚠ accanto al field problematico (Tooltip su tap)
                </li>
                <li>
                  <strong>Header badge</strong> Chip warning "2 da rivedere"
                </li>
                <li>
                  <strong>Sidebar marker</strong> ● dot warning sul nome elemento
                </li>
                <li>
                  <strong>Tap badge</strong> → <Code>{`<Drawer placement="right">`}</Code>{" "}
                  con lista warnings cliccabili (jump al field)
                </li>
              </ol>
            </>
          }
          items={[
            ["pro", "<strong>Zero friction</strong> sul flow — commit sempre accettato"],
            ["pro", "Discoverable a 4 livelli — l'utente vede il problema da qualunque pane"],
            ["pro", "Pattern DDD canonico (Eric Evans): invariants check at READ, not WRITE"],
            ["pro", "Compatibile Jazz CRDT — peer remoto cambia field, validation re-runs"],
            ["pro", "Pattern presente in Notion (missing required), Linear (issue blocked)"],
            ["pro", "Drawer review panel → jump-to-fix list — UX da debugger"],
            ["con", "L'utente PUÒ ignorare warnings indefinitamente — serve report workspace-level (futuro)"],
            ["con", "Re-validation a ogni read costoso su workspace grandi — memoizzare con React Compiler"],
          ]}
        />

        <ConsideredAlternatives
          entries={[
            {
              letter: "A",
              title: "Hard reject (blocking)",
              summary:
                "Commit fallisce, modal errore centrato. Tutti field disabilitati finché non risolto.",
              pros: [
                "Garanzia totale: aggregate mai in stato invalido",
                "Errore visibile e immediato",
              ],
              cons: [
                "Anti-flow: l'utente deve risolvere PRIMA di altre azioni",
                "Campi disabilitati rompono inline per-campo",
                "Cross-aggregate hard reject + Jazz CRDT sync = problema concorrenza",
                "Anti-Notion / anti-Apple Notes — nessuna app inline lavora così",
              ],
              whyRejected:
                "Jazz CRDT permette peer remoto di creare stati 'validi localmente, invalidi after merge' — l'hard reject non sa cosa fare. Inoltre blocca il flusso inline per-campo.",
            },
            {
              letter: "B",
              title: "Auto-prompt modal (dismissible)",
              summary:
                "Commit ok · 200ms dopo appare modal con suggerimento fix · dismissible.",
              pros: [
                "Non bloccante — flow inline preservato",
                "Educa l'utente sul vincolo violato",
                "Dismissible — utente esperto può ignorare",
              ],
              cons: [
                "Modal nag: ogni commit con warning fa apparire modal",
                "Su edit non-lineari (15 modifiche di fila) è rumoroso",
                "Su Jazz sync, peer remoti possono scatenare modal imprevisti",
              ],
              whyRejected:
                "Il modal prompt interrompe il flow a ogni commit problematico. Soft validation passive (C) dà la stessa discoverability senza interruzioni.",
            },
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Strategia ibrida con sketch 5:</strong> i composite (Vita, Regno,
              Periodo) eliminano cross-validation intra-aggregate by construction. La soft
              validation si occupa solo di cross-aggregate residuo.
            </li>
            <li>
              <strong>HeroUI mapping:</strong> warning icon è span con <Code>title</Code>{" "}
              tooltip + lucide TriangleAlert, header badge è{" "}
              <Code>{`<Chip color="warning" variant="soft">`}</Code>, drawer review è{" "}
              <Code>{`<Drawer placement="right">`}</Code> (stesso pattern sketch 5).
            </li>
            <li>
              <strong>Workspace report (futuro):</strong> dashboard "elementi da rivedere"
              filtrabile — fuori scope S02/R005, candidato per S04+.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Soft validation mock — recommended implementation
// ============================================================================

function ElementoConWarnings() {
  return (
    <>
      <div className="flex items-start justify-between pb-5 border-b border-edge mb-3 gap-3">
        <div className="flex flex-col gap-2">
          <Chip size="sm" color="accent" variant="soft" className="self-start">
            personaggio
          </Chip>
          <div className="font-heading text-2xl font-semibold text-ink-hi leading-tight">
            Abraamo
          </div>
        </div>
        <Chip color="warning" variant="soft" size="sm">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle size={12} />
            2 da rivedere
          </span>
        </Chip>
      </div>
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <div className="flex items-center gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Evento
        </span>
        <span className="flex-1 text-[15px] text-ink-hi inline-flex items-center gap-2">
          2050 a.E.V. — Patto di Mamre
          <span
            className="text-amber-600 cursor-help"
            title="Precede la nascita (2000 a.E.V.)"
          >
            <AlertTriangle size={16} />
          </span>
        </span>
      </div>
      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

function SoftValidationMock() {
  return (
    <>
      <ElementoConWarnings />

      <div className="mt-5 pt-4 border-t border-edge">
        <Drawer>
          <Drawer.Trigger className="inline-flex items-center gap-2 text-xs text-amber-700 font-semibold cursor-pointer hover:text-amber-900">
            <AlertTriangle size={14} />
            Apri pannello "2 da rivedere"
            <ArrowRight size={12} />
          </Drawer.Trigger>
          <Drawer.Backdrop>
            <Drawer.Content placement="right" className="w-[400px] max-w-[90vw]">
              <Drawer.Dialog>
                <Drawer.Header className="px-6 py-4 border-b border-edge flex items-center justify-between">
                  <Drawer.Heading className="font-heading text-lg text-ink-hi inline-flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    Da rivedere (2)
                  </Drawer.Heading>
                  <Drawer.CloseTrigger />
                </Drawer.Header>
                <Drawer.Body className="px-6 py-5 space-y-3">
                  <ReviewItem
                    field="Evento"
                    message="Patto di Mamre (2050 a.E.V.) precede la nascita di Abraamo (2000 a.E.V.)"
                    severity="warning"
                  />
                  <ReviewItem
                    field="Sepoltura"
                    message="Hebron non ha riferimenti geografici nel workspace"
                    severity="info"
                  />
                </Drawer.Body>
                <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
                  Tap su un item per saltare al field
                </Drawer.Footer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    </>
  );
}

function ReviewItem({
  field,
  message,
  severity,
}: {
  field: string;
  message: string;
  severity: "warning" | "info";
}) {
  const colorClass =
    severity === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-blue-50 border-blue-200 text-blue-900";
  const iconClass = severity === "warning" ? "text-amber-600" : "text-blue-600";
  return (
    <div className={`p-3 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${colorClass}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${iconClass}`} />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-75 mb-0.5">
            {field}
          </div>
          <div className="text-xs leading-relaxed">{message}</div>
        </div>
      </div>
    </div>
  );
}
