import { Button, Chip, Drawer } from "@heroui/react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import {
  Alternative,
  Code,
  Divider,
  ElementoHeader,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 6: Validation UX cross-field
 *
 * Quando un commit viola una regola cross-aggregate (es. evento referenziato
 * precede vita.nascita del personaggio), come reagisce l'UI?
 *
 *   A. Hard reject (anti-pattern, blocking)
 *   B. Auto-prompt modal (dismissible)
 *   C. Soft validation persistente con drawer panel    ⭐ RECOMMENDED
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
              ma precede la sua nascita (2000 a.E.V.). Come l'UI segnala l'incoerenza?
            </>
          }
        />

        <Alternative
          letter="A"
          antiPattern
          title="Hard reject (blocking)"
          subtitle="commit fallisce, modal di errore, l'utente DEVE risolvere prima di procedere"
          mock={<HardRejectMock />}
          grammatica={
            <>
              Tap fuori → cross-validation fallisce → <Code>{`<Modal>`}</Code> di errore
              centrato. Il valore NON è committato.
              <br />
              L'utente DEVE correggere o annullare. Tutti gli altri field disabilitati per
              safety finché non risolto.
            </>
          }
          items={[
            ["pro", "Garanzia totale: aggregate mai in stato invalido"],
            ["pro", "Errore visibile e immediato"],
            ["con", "<strong>Anti-flow</strong>: l'utente deve risolvere PRIMA di altre azioni"],
            ["con", "Campi disabilitati rompono inline per-campo"],
            ["con", "Cross-aggregate hard reject + Jazz CRDT sync = problema concorrenza"],
            ["con", "Anti-Notion / anti-Apple Notes — nessuna app inline ragiona così"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Auto-prompt modal (dismissible)"
          subtitle="commit accetta · dopo 200ms appare modal piccolo con suggerimento fix · dismissible"
          mock={<AutoPromptMock />}
          grammatica={
            <>
              Commit va a buon fine. <Code>{`<Modal size="sm">`}</Code> appare 200ms dopo
              con titolo "Possibile incoerenza", body con descrizione, 2 bottoni:{" "}
              <strong>Correggi</strong> (riapre il field) o <strong>Lascia stare</strong>{" "}
              (dismiss + warning resta).
            </>
          }
          items={[
            ["pro", "Non bloccante — flow inline preservato"],
            ["pro", "Educa l'utente sul vincolo violato"],
            ["pro", "Dismissible — utente esperto può ignorare"],
            ["con", "<strong>Modal nag</strong>: ogni commit con warning fa apparire modal"],
            ["con", "Su edit non-lineari (15 modifiche di fila) è rumoroso"],
            ["con", "Su Jazz sync, peer remoti possono scatenare modal imprevisti"],
          ]}
        />

        <Divider />

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

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Strategia ibrida con sketch 5:</strong> i composite (Vita, Regno,
              Periodo) eliminano cross-validation intra-aggregate by construction. La soft
              validation D si occupa solo di cross-aggregate residuo.
            </li>
            <li>
              <strong>HeroUI mapping:</strong> warning icon è{" "}
              <Code>{`<Tooltip>`}</Code> + lucide TriangleAlert, header badge è{" "}
              <Code>{`<Chip color="warning" variant="soft">`}</Code>, drawer review è{" "}
              <Code>{`<Drawer placement="right">`}</Code>.
            </li>
            <li>
              <strong>Sidebar marker:</strong> 8×8px dot warning. Discreto in idle, immediato
              da scansionare.
            </li>
            <li>
              <strong>Workspace report (futuro):</strong> dashboard "elementi da rivedere"
              filtrabile — fuori scope di S02/R005, candidato per S04+.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Shared: detail pane content with warnings
// ============================================================================

function ElementoConWarnings({ showBadge = false }: { showBadge?: boolean }) {
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
        {showBadge && (
          <Chip color="warning" variant="soft" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle size={12} />
              2 da rivedere
            </span>
          </Chip>
        )}
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

function HardRejectMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V." />
      <div className="flex items-center gap-3 min-h-[48px] py-1 opacity-50">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Evento
        </span>
        <div className="flex-1 px-3 py-2 border-2 border-rose-500 bg-white rounded-md text-[15px] text-ink-hi shadow-[0_0_0_4px_rgba(244,63,94,0.15)]">
          2050 a.E.V. — Patto di Mamre
        </div>
      </div>
      <SimpleField label="Tribù" value="Ebrei" />

      {/* Modal mockup inline */}
      <div className="mt-4 mx-auto max-w-md bg-white border border-rose-200 rounded-xl shadow-2xl p-5">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 text-rose-600 rounded-full mb-3">
          <X size={20} />
        </div>
        <div className="font-heading text-base text-ink-hi mb-1">Salvataggio bloccato</div>
        <div className="text-sm text-ink-md mb-4 leading-relaxed">
          L'evento non può precedere la nascita del personaggio (2000 a.E.V.). Correggi o
          annulla per continuare.
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="primary" className="flex-1 min-h-10">
            Correggi
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 min-h-10">
            Annulla
          </Button>
        </div>
      </div>
    </>
  );
}

function AutoPromptMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V." />
      <SimpleField label="Evento" value="2050 a.E.V. — Patto di Mamre" />
      <SimpleField label="Tribù" value="Ebrei" />

      {/* Modal-as-bubble */}
      <div className="mt-4 mx-auto max-w-md bg-white border border-amber-200 rounded-xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-amber-100 text-amber-600 rounded-full inline-flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <div className="font-heading text-sm text-ink-hi mb-0.5">Possibile incoerenza</div>
            <div className="text-xs text-ink-md mb-3 leading-relaxed">
              <strong>Patto di Mamre</strong> (2050 a.E.V.) precede la nascita di Abraamo.
              Vuoi correggere?
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" className="min-h-9">
                Correggi data
              </Button>
              <Button size="sm" variant="ghost" className="min-h-9">
                Lascia stare
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SoftValidationMock() {
  return (
    <>
      <ElementoConWarnings showBadge />

      {/* Drawer trigger demo at bottom */}
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
