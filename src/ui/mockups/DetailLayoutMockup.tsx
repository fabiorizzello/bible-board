import { Chip } from "@heroui/react";
import { Calendar, Link2, MapPin, Tag, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Alternative,
  Code,
  Divider,
  MockupFooter,
  MockupHeader,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 8: Detail pane layout
 *
 * Rivedere il layout 2-col label/value attuale ("troppo tabellare").
 * 3 alternative che differenziano trattamento dei field per tipologia.
 *
 *   A. 2-col label/value (status quo baseline)
 *   B. Label-stacked (Apple Calendar event style)
 *   C. Metadata chips + body (Linear issue style)     ⭐ RECOMMENDED
 */

const ABRAAMO = {
  nome: "Abraamo",
  tipo: "personaggio",
  descrizione:
    "Patriarca dei tre monoteismi abramitici. Chiamato da Ur dei Caldei, riceve la promessa divina di una terra e una discendenza. La sua fede viene messa alla prova nel sacrificio di Isacco.",
  nascita: "2000 a.E.V.",
  morte: "1825 a.E.V.",
  tribu: "Ebrei",
  luogo_origine: "Ur dei Caldei",
  ruoli: ["patriarca", "profeta"],
  tags: ["Genesi", "Antico Testamento"],
  collegamenti: [
    { nome: "Sara", ruolo: "coniuge" },
    { nome: "Isacco", ruolo: "figlio" },
  ],
};

export function DetailLayoutMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="8"
          title="Detail pane layout"
          subtitle={
            <>
              Il layout 2-col label/value attuale sembra <em>troppo tabellare</em>. 3
              alternative che differenziano il trattamento per <strong>tipologia</strong> di
              field (metadati brevi, contenuto lungo, collezioni di chip).
            </>
          }
        />

        <Alternative
          letter="A"
          title="2-col label/value (status quo)"
          subtitle="label uppercase 110px + value flex · tutti i field trattati uguali"
          mock={<TwoColMock />}
          grammatica={
            <>
              Pattern attuale: ogni field è una row uniforme con{" "}
              <Code>[label 110px] [value flex-1]</Code>.
              <br />
              Tipo, descrizione, date, tribù, ruoli, tags, collegamenti — tutti usano lo
              stesso template. I field array (ruoli, tags, collegamenti) hanno i chip come
              value wrappato.
              <br />
              Pattern Notion database property view, Apple Reminders.
            </>
          }
          items={[
            ["pro", "Scanning verticale veloce — label allineati a sinistra"],
            ["pro", "Pattern database / form familiare"],
            ["pro", "Layout prevedibile: ogni field sa dove sta"],
            ["con", "<strong>Tabellare</strong> — tratta descrizione lunga come tribù corto"],
            ["con", "Spreco spazio orizzontale per label uppercase ripetuti"],
            ["con", "Array di chip (ruoli, tags, collegamenti) schiacciati nel value → wrap ruvido"],
            ["con", "Metadati brevi occupano una riga intera ciascuno (verticale alto)"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Label-stacked (Apple Calendar event)"
          subtitle="label uppercase mini ABOVE, value grosso sotto · più ariosità, meno densità"
          mock={<StackedLabelMock />}
          grammatica={
            <>
              Ogni field è un blocco verticale: label uppercase 10px in alto, value 15-16px
              sotto.
              <br />
              Tap area più grande (intero blocco). Più respiro verticale.
              <br />
              Pattern Apple Calendar event detail, Apple Mail message metadata, Contacts
              app.
            </>
          }
          items={[
            ["pro", "Value prominente — leggibilità massima del dato"],
            ["pro", "Tap area enorme (intero blocco verticale) — iPad touch-friendly"],
            ["pro", "Pattern Apple-native (Calendar, Mail, Contacts)"],
            ["pro", "Niente allineamento label a sinistra → flessibilità typografica"],
            ["con", "Verticalità esplosa — ogni field 2 righe invece di 1 (scroll aumenta)"],
            ["con", "Scan meno efficace — occhio non trova i label subito"],
            ["con", "Su detail pane stretto (iPad portrait) perde ariosità"],
            ["con", "Non risolve il problema array di chip schiacciati"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          recommended
          title="Metadata chips + body (Linear issue style)"
          subtitle="metadati brevi in chip header · descrizione/body full-width · sezioni per array"
          mock={<ChipsBodyMock />}
          grammatica={
            <>
              Layout <strong>differenziato per tipologia</strong> di field:
              <br />
              <strong>Header metadata</strong>: chip pills orizzontali con icona + valore
              per metadati brevi (tipo, nascita, morte, tribù, luogo). Ognuno è un chip ~28px
              tappabile.
              <br />
              <strong>Body</strong>: descrizione full-width in prose, label-less.
              <br />
              <strong>Sezioni raggruppate</strong>: Ruoli, Tags, Collegamenti — ognuna un
              mini-header + chip row.
              <br />
              Pattern Linear issue detail, Notion page properties + body.
            </>
          }
          items={[
            ["pro", "<strong>Differenzia per tipologia</strong> — ogni field tipo ha il trattamento ottimale"],
            ["pro", "Metadati brevi compattissimi in 1 row orizzontale (4-6 chip)"],
            ["pro", "Descrizione full-width come una vera prose — respiro da documento"],
            ["pro", "Array di chip in sezioni dedicate — niente wrap schiacciato"],
            ["pro", "Pattern moderni (Linear, Notion, GitHub issue) familiare a power user"],
            ["pro", "Sfrutta bene lo spazio orizzontale iPad 10.9 landscape"],
            ["con", "Pattern più complesso — più varianti visuali da disegnare/mantenere"],
            ["con", "Header chip row può wrappare disordinatamente su tipi con molti metadati (es. periodo con 4 date)"],
            ["con", "Edit di un metadato chip può richiedere popover invece che inline"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Impatto su altri mockup:</strong> la scelta di C ribalta parte dei
              mockup 1/2/3 (edit inline di field = tap sulla chip in header, non più sulla
              row). Da propagare in plan esecutivo se scelto.
            </li>
            <li>
              <strong>Tipi di field identificati:</strong>
              <ol className="list-decimal list-inside ml-2 mt-1 space-y-0.5 text-xs">
                <li>Metadata scalari brevi (tipo, tribù, luogo, date singole) → chip header</li>
                <li>Contenuto lungo (descrizione, annotazioni) → prose full-width</li>
                <li>Array di chip (ruoli, tags, collegamenti, fonti) → sezione dedicata</li>
                <li>Composite (Vita, Regno, Intervallo) → chip speciale o drawer</li>
              </ol>
            </li>
            <li>
              <strong>Portrait/landscape:</strong> il layout C richiede un breakpoint: su
              iPad portrait (820px) i chip header possono wrappare su 2 righe, mentre le
              sezioni array restano uguali.
            </li>
            <li>
              <strong>HeroUI:</strong> tutto realizzabile con <Code>{`<Chip>`}</Code>{" "}
              esistente. Niente nuovi primitive richiesti.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Shared name+tipo header (uguale per tutte le alternative)
// ============================================================================
function AbraamoHeader({ withTipo = true }: { withTipo?: boolean }) {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-edge mb-4">
      {withTipo && (
        <Chip size="sm" color="accent" variant="soft" className="self-start">
          {ABRAAMO.tipo}
        </Chip>
      )}
      <div className="font-heading text-2xl font-semibold text-ink-hi leading-tight">
        {ABRAAMO.nome}
      </div>
    </div>
  );
}

// ============================================================================
// A — 2-col label/value (status quo)
// ============================================================================

function TwoColMock() {
  return (
    <>
      <AbraamoHeader />
      <TwoColRow label="Tipo" value={<span>{ABRAAMO.tipo}</span>} />
      <TwoColRow
        label="Descrizione"
        value={<span className="line-clamp-2">{ABRAAMO.descrizione}</span>}
      />
      <TwoColRow label="Nascita" value={<span>{ABRAAMO.nascita}</span>} />
      <TwoColRow label="Morte" value={<span>{ABRAAMO.morte}</span>} />
      <TwoColRow label="Tribù" value={<span>{ABRAAMO.tribu}</span>} />
      <TwoColRow label="Luogo origine" value={<span>{ABRAAMO.luogo_origine}</span>} />
      <TwoColRow
        label="Ruoli"
        value={
          <span className="flex flex-wrap gap-1.5">
            {ABRAAMO.ruoli.map((r) => (
              <Chip key={r} size="sm" variant="soft" className="bg-chip-bg text-ink-lo">
                {r}
              </Chip>
            ))}
          </span>
        }
      />
      <TwoColRow
        label="Tags"
        value={
          <span className="flex flex-wrap gap-1.5">
            {ABRAAMO.tags.map((t) => (
              <Chip key={t} size="sm" variant="soft" className="bg-chip-bg text-ink-lo">
                {t}
              </Chip>
            ))}
          </span>
        }
      />
      <TwoColRow
        label="Collegamenti"
        value={
          <span className="flex flex-wrap gap-1.5">
            {ABRAAMO.collegamenti.map((c) => (
              <Chip key={c.nome} size="sm" variant="soft" color="accent">
                {c.nome} · {c.ruolo}
              </Chip>
            ))}
          </span>
        }
      />
    </>
  );
}

function TwoColRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4 min-h-[48px] py-1.5 px-2 -mx-2 rounded hover:bg-primary/5 transition-colors">
      <span className="w-[110px] flex-shrink-0 pt-[3px] text-[11px] uppercase tracking-wider text-primary font-semibold">
        {label}
      </span>
      <span className="flex-1 text-[15px] text-ink-hi">{value}</span>
    </div>
  );
}

// ============================================================================
// B — Label-stacked (Apple Calendar event)
// ============================================================================

function StackedLabelMock() {
  return (
    <>
      <AbraamoHeader />
      <StackedField label="Tipo" value={ABRAAMO.tipo} />
      <StackedField label="Descrizione">
        <span className="text-[15px] text-ink-hi leading-relaxed line-clamp-3 block">
          {ABRAAMO.descrizione}
        </span>
      </StackedField>
      <div className="grid grid-cols-2 gap-4">
        <StackedField label="Nascita" value={ABRAAMO.nascita} />
        <StackedField label="Morte" value={ABRAAMO.morte} />
        <StackedField label="Tribù" value={ABRAAMO.tribu} />
        <StackedField label="Luogo origine" value={ABRAAMO.luogo_origine} />
      </div>
      <StackedField label="Ruoli">
        <span className="flex flex-wrap gap-1.5">
          {ABRAAMO.ruoli.map((r) => (
            <Chip key={r} size="sm" variant="soft" className="bg-chip-bg text-ink-lo">
              {r}
            </Chip>
          ))}
        </span>
      </StackedField>
      <StackedField label="Collegamenti">
        <span className="flex flex-wrap gap-1.5">
          {ABRAAMO.collegamenti.map((c) => (
            <Chip key={c.nome} size="sm" variant="soft" color="accent">
              {c.nome} · {c.ruolo}
            </Chip>
          ))}
        </span>
      </StackedField>
    </>
  );
}

function StackedField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="py-2 hover:bg-primary/5 rounded px-2 -mx-2 transition-colors cursor-text">
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-semibold mb-1">
        {label}
      </div>
      {children ?? <div className="text-[16px] text-ink-hi">{value}</div>}
    </div>
  );
}

// ============================================================================
// C — Metadata chips + body (Linear/Notion hybrid) — RECOMMENDED
// ============================================================================

function ChipsBodyMock() {
  return (
    <>
      <AbraamoHeader withTipo={false} />

      {/* Metadata chips header */}
      <div className="flex flex-wrap gap-2 mb-5 -mt-2">
        <MetaChip icon={<Users size={12} />} label="Tipo" value={ABRAAMO.tipo} primary />
        <MetaChip icon={<Calendar size={12} />} label="Nato" value={ABRAAMO.nascita} />
        <MetaChip icon={<Calendar size={12} />} label="Morto" value={ABRAAMO.morte} />
        <MetaChip icon={<MapPin size={12} />} label="Origine" value={ABRAAMO.luogo_origine} />
        <MetaChip icon={<Users size={12} />} label="Tribù" value={ABRAAMO.tribu} />
      </div>

      {/* Body: descrizione full-width */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
          Descrizione
        </div>
        <p className="text-[15px] leading-relaxed text-ink-hi line-clamp-4">
          {ABRAAMO.descrizione}
        </p>
      </div>

      {/* Sezioni per array di chip */}
      <ArraySection
        icon={<Tag size={12} />}
        label="Ruoli"
        chips={ABRAAMO.ruoli.map((r) => (
          <Chip key={r} size="md" variant="soft" className="bg-chip-bg text-ink-lo">
            {r}
          </Chip>
        ))}
      />
      <ArraySection
        icon={<Tag size={12} />}
        label="Tags"
        chips={ABRAAMO.tags.map((t) => (
          <Chip key={t} size="md" variant="soft" className="bg-chip-bg text-ink-lo">
            {t}
          </Chip>
        ))}
      />
      <ArraySection
        icon={<Link2 size={12} />}
        label="Collegamenti"
        chips={ABRAAMO.collegamenti.map((c) => (
          <Chip key={c.nome} size="md" variant="soft" color="accent">
            <span className="inline-flex items-center gap-1">
              {c.nome}
              <span className="opacity-60">· {c.ruolo}</span>
            </span>
          </Chip>
        ))}
      />
    </>
  );
}

function MetaChip({
  icon,
  label,
  value,
  primary,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 min-h-[28px] px-3 py-1 rounded-full border transition-colors cursor-pointer ${
        primary
          ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
          : "border-edge bg-chrome text-ink-md hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <span className={primary ? "text-primary" : "text-ink-lo"}>{icon}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
        {label}
      </span>
      <span className="text-[13px] font-medium">{value}</span>
    </button>
  );
}

function ArraySection({
  icon,
  label,
  chips,
}: {
  icon: ReactNode;
  label: string;
  chips: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-ink-lo">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">{chips}</div>
    </div>
  );
}
