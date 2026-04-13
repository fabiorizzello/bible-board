/**
 * ElementoEditor — inline edit form for an Elemento.
 *
 * Renders shared fields (titolo, descrizione, tags) and type-specific fields
 * based on elemento.tipo. Uses controlled local state (useState) — edits
 * update local state only. Save validates via normalizeElementoInput(), then
 * closes edit mode (no actual persistence in prototype — mock data immutable).
 *
 * HeroUI v3 RAC composition patterns:
 * - TextField > Label + Input + FieldError
 * - TextField > Label + TextArea + FieldError
 * - Select > Select.Trigger > Select.Value + Select.Popover > ListBox > ListBox.Item
 */

import { useState, useCallback } from "react";
import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { Save, X } from "lucide-react";

import type { Elemento, ElementoTipo } from "@/features/elemento/elemento.model";
import { normalizeElementoInput } from "@/features/elemento/elemento.rules";
import type { DataStorica, DataTemporale } from "@/features/shared/value-objects";
import { stopEditing } from "./workspace-ui-store";

// ── Local form state ──

interface EditorState {
  titolo: string;
  descrizione: string;
  tags: string;
  // personaggio
  nascitaAnno: string;
  nascitaEra: "aev" | "ev";
  morteAnno: string;
  morteEra: "aev" | "ev";
  tribu: string;
  ruoli: string;
  // guerra
  fazioni: string;
  esito: string;
  // profezia
  statoProfezia: string;
  // regno
  dettagliRegno: string;
  // luogo
  regione: string;
  // evento — single date (DataTemporale kind="puntuale")
  eventoAnno: string;
  eventoEra: "aev" | "ev";
  // periodo — range (DataTemporale kind="range")
  periodoInizioAnno: string;
  periodoInizioEra: "aev" | "ev";
  periodoFineAnno: string;
  periodoFineEra: "aev" | "ev";
}

function initState(el: Elemento): EditorState {
  // Extract date components for evento and periodo if present.
  const eventoPuntuale =
    el.date?.kind === "puntuale" ? el.date.data : undefined;
  const periodoRange = el.date?.kind === "range" ? el.date : undefined;

  return {
    titolo: el.titolo,
    descrizione: el.descrizione,
    tags: el.tags.join(", "),
    nascitaAnno: el.nascita?.anno?.toString() ?? "",
    nascitaEra: el.nascita?.era ?? "aev",
    morteAnno: el.morte?.anno?.toString() ?? "",
    morteEra: el.morte?.era ?? "aev",
    tribu: el.tribu ?? "",
    ruoli: (el.ruoli ?? []).join(", "),
    fazioni: el.fazioni ?? "",
    esito: el.esito ?? "",
    statoProfezia: el.statoProfezia ?? "futura",
    dettagliRegno: el.dettagliRegno ?? "",
    regione: el.regione ?? "",
    eventoAnno: eventoPuntuale?.anno?.toString() ?? "",
    eventoEra: eventoPuntuale?.era ?? "aev",
    periodoInizioAnno: periodoRange?.inizio.anno?.toString() ?? "",
    periodoInizioEra: periodoRange?.inizio.era ?? "aev",
    periodoFineAnno: periodoRange?.fine.anno?.toString() ?? "",
    periodoFineEra: periodoRange?.fine.era ?? "aev",
  };
}

// ── parseDataStorica ──
// Converts the editor's (annoString, era) pair into a DataStorica, returning
// undefined when the field is blank (meaning "not set"). Returns a sentinel
// INVALID_DATA marker when the user typed a non-empty but non-parseable year,
// so handleSave can distinguish "omit this optional field" from "this field
// exists but is invalid".
const INVALID_DATA = Symbol("INVALID_DATA");
type ParseResult = DataStorica | undefined | typeof INVALID_DATA;

function parseDataStorica(annoStr: string, era: "aev" | "ev"): ParseResult {
  const trimmed = annoStr.trim();
  if (!trimmed) return undefined;
  const anno = Number(trimmed);
  if (!Number.isInteger(anno) || anno <= 0) return INVALID_DATA;
  return { anno, era, precisione: "esatta" };
}

// ── Error messages ──

const ERROR_MESSAGES: Record<string, string> = {
  titolo_vuoto: "Il titolo è obbligatorio",
  data_non_valida: "Data non valida",
  tipo_specifico_non_ammesso: "Campo non valido per questo tipo",
  elemento_non_trovato: "Elemento non trovato",
  fonte_non_valida: "Fonte non valida",
  link_non_valido: "Collegamento non valido",
  link_duplicato: "Collegamento duplicato",
  link_auto_riferimento: "Un elemento non può riferire se stesso",
  link_non_trovato: "Collegamento non trovato",
  ruolo_mancante_per_parentela: "Ruolo parentela mancante",
};

// ── Section heading ──

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-lo mt-1">
      {children}
    </h3>
  );
}

// ── Component ──

export function ElementoEditor({ element }: { element: Elemento }) {
  const [state, setState] = useState<EditorState>(() => initState(element));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback(
    <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
      // Clear error for this field on change
      setErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  function handleSave() {
    const tipo = element.tipo;

    // Parse nascita / morte (only for personaggio)
    const nascitaParsed =
      tipo === "personaggio"
        ? parseDataStorica(state.nascitaAnno, state.nascitaEra)
        : undefined;
    const morteParsed =
      tipo === "personaggio"
        ? parseDataStorica(state.morteAnno, state.morteEra)
        : undefined;

    if (nascitaParsed === INVALID_DATA || morteParsed === INVALID_DATA) {
      setErrors({ _form: ERROR_MESSAGES.data_non_valida });
      return;
    }

    // Build DataTemporale for evento / periodo (from local state, not element.date).
    let date: DataTemporale | undefined;
    if (tipo === "evento") {
      const eventoParsed = parseDataStorica(state.eventoAnno, state.eventoEra);
      if (eventoParsed === INVALID_DATA) {
        setErrors({ _form: ERROR_MESSAGES.data_non_valida });
        return;
      }
      if (eventoParsed !== undefined) {
        date = { kind: "puntuale", data: eventoParsed };
      }
    } else if (tipo === "periodo") {
      const inizioParsed = parseDataStorica(
        state.periodoInizioAnno,
        state.periodoInizioEra,
      );
      const fineParsed = parseDataStorica(
        state.periodoFineAnno,
        state.periodoFineEra,
      );
      if (inizioParsed === INVALID_DATA || fineParsed === INVALID_DATA) {
        setErrors({ _form: ERROR_MESSAGES.data_non_valida });
        return;
      }
      // Both present → build range. Partial (one side) → leave date undefined.
      if (inizioParsed !== undefined && fineParsed !== undefined) {
        date = { kind: "range", inizio: inizioParsed, fine: fineParsed };
      }
    }

    const result = normalizeElementoInput({
      titolo: state.titolo,
      descrizione: state.descrizione,
      tags: state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tipo,
      nascita: tipo === "personaggio" ? nascitaParsed : undefined,
      morte: tipo === "personaggio" ? morteParsed : undefined,
      date,
      tribu: tipo === "personaggio" ? (state.tribu || undefined) : undefined,
      ruoli:
        tipo === "personaggio"
          ? state.ruoli
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean)
          : undefined,
      fazioni: tipo === "guerra" ? (state.fazioni || undefined) : undefined,
      esito: tipo === "guerra" ? (state.esito || undefined) : undefined,
      statoProfezia:
        tipo === "profezia" ? (state.statoProfezia || undefined) : undefined,
      dettagliRegno:
        tipo === "regno" ? (state.dettagliRegno || undefined) : undefined,
      regione: tipo === "luogo" ? (state.regione || undefined) : undefined,
    });

    result.match(
      () => {
        // Validation passed — close editor (no persistence in prototype)
        stopEditing();
      },
      (error) => {
        const msg = ERROR_MESSAGES[error.type] ?? "Errore di validazione";
        if (error.type === "titolo_vuoto") {
          setErrors({ titolo: msg });
        } else {
          setErrors({ _form: msg });
        }
      },
    );
  }

  function handleCancel() {
    stopEditing();
  }

  const tipo = element.tipo;

  return (
    <div className="flex flex-col gap-3 text-[13px]">
      {/* ── Shared Fields ── */}
      <SectionHeading>Generale</SectionHeading>

      <TextField
        value={state.titolo}
        onChange={(v: string) => set("titolo", v)}
        isRequired
        isInvalid={!!errors.titolo}
      >
        <Label className="font-body text-[12px] text-ink-lo">Titolo</Label>
        <Input className="min-h-[44px] text-[13px]" />
        {errors.titolo && (
          <FieldError className="mt-1 text-xs text-red-600">
            {errors.titolo}
          </FieldError>
        )}
      </TextField>

      <TextField
        value={state.descrizione}
        onChange={(v: string) => set("descrizione", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">Descrizione</Label>
        <TextArea className="min-h-[88px] text-[13px] resize-y" />
      </TextField>

      <TextField
        value={state.tags}
        onChange={(v: string) => set("tags", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">
          Tag (separati da virgola)
        </Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>

      {/* ── Type-Specific Fields (exhaustive over ElementoTipo) ── */}
      {renderTypeSpecificFields(tipo, state, set)}

      {/* ── Form-level error ── */}
      {errors._form && (
        <p className="text-xs text-red-600" role="alert">
          {errors._form}
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 pt-2 border-t border-primary/6">
        <Button
          variant="primary"
          className="min-h-[44px] gap-1.5 bg-accent px-4 text-[13px] font-semibold text-white"
          onPress={handleSave}
        >
          <Save className="h-3.5 w-3.5" /> Salva
        </Button>
        <Button
          variant="ghost"
          className="min-h-[44px] gap-1.5 px-4 text-[13px] font-medium text-ink-lo"
          onPress={handleCancel}
        >
          <X className="h-3.5 w-3.5" /> Annulla
        </Button>
      </div>
    </div>
  );
}

// ── Type-specific field groups ──

interface FieldGroupProps {
  state: EditorState;
  set: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
}

function PersonaggioFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Personaggio</SectionHeading>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          value={state.nascitaAnno}
          onChange={(v: string) => set("nascitaAnno", v)}
        >
          <Label className="font-body text-[12px] text-ink-lo">
            Nascita (anno)
          </Label>
          <Input className="min-h-[44px] text-[13px]" inputMode="numeric" />
        </TextField>

        <Select
          selectedKey={state.nascitaEra}
          onSelectionChange={(key) => {
            if (key === "aev" || key === "ev") set("nascitaEra", key);
          }}
        >
          <Label className="font-body text-[12px] text-ink-lo">Era nascita</Label>
          <Select.Trigger className="min-h-[44px] text-[13px]">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="aev" textValue="a.e.v.">a.e.v.</ListBox.Item>
              <ListBox.Item id="ev" textValue="e.v.">e.v.</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          value={state.morteAnno}
          onChange={(v: string) => set("morteAnno", v)}
        >
          <Label className="font-body text-[12px] text-ink-lo">
            Morte (anno)
          </Label>
          <Input className="min-h-[44px] text-[13px]" inputMode="numeric" />
        </TextField>

        <Select
          selectedKey={state.morteEra}
          onSelectionChange={(key) => {
            if (key === "aev" || key === "ev") set("morteEra", key);
          }}
        >
          <Label className="font-body text-[12px] text-ink-lo">Era morte</Label>
          <Select.Trigger className="min-h-[44px] text-[13px]">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="aev" textValue="a.e.v.">a.e.v.</ListBox.Item>
              <ListBox.Item id="ev" textValue="e.v.">e.v.</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <TextField
        value={state.tribu}
        onChange={(v: string) => set("tribu", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">Tribù</Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>

      <TextField
        value={state.ruoli}
        onChange={(v: string) => set("ruoli", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">
          Ruoli (separati da virgola)
        </Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>
    </>
  );
}

function GuerraFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Guerra</SectionHeading>

      <TextField
        value={state.fazioni}
        onChange={(v: string) => set("fazioni", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">Fazioni</Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>

      <TextField
        value={state.esito}
        onChange={(v: string) => set("esito", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">Esito</Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>
    </>
  );
}

function ProfeziaFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Profezia</SectionHeading>

      <Select
        selectedKey={state.statoProfezia}
        onSelectionChange={(key) => {
          if (key === "adempiuta" || key === "in corso" || key === "futura") {
            set("statoProfezia", key);
          }
        }}
      >
        <Label className="font-body text-[12px] text-ink-lo">
          Stato profezia
        </Label>
        <Select.Trigger className="min-h-[44px] text-[13px]">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="adempiuta" textValue="Adempiuta">
              Adempiuta
            </ListBox.Item>
            <ListBox.Item id="in corso" textValue="In corso">
              In corso
            </ListBox.Item>
            <ListBox.Item id="futura" textValue="Futura">
              Futura
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    </>
  );
}

function RegnoFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Regno</SectionHeading>

      <TextField
        value={state.dettagliRegno}
        onChange={(v: string) => set("dettagliRegno", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">
          Dettagli regno
        </Label>
        <TextArea className="min-h-[88px] text-[13px] resize-y" />
      </TextField>
    </>
  );
}

function LuogoFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Luogo</SectionHeading>

      <TextField
        value={state.regione}
        onChange={(v: string) => set("regione", v)}
      >
        <Label className="font-body text-[12px] text-ink-lo">Regione</Label>
        <Input className="min-h-[44px] text-[13px]" />
      </TextField>
    </>
  );
}

function EventoFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Evento</SectionHeading>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          value={state.eventoAnno}
          onChange={(v: string) => set("eventoAnno", v)}
        >
          <Label className="font-body text-[12px] text-ink-lo">Anno</Label>
          <Input className="min-h-[44px] text-[13px]" inputMode="numeric" />
        </TextField>

        <Select
          selectedKey={state.eventoEra}
          onSelectionChange={(key) => {
            if (key === "aev" || key === "ev") set("eventoEra", key);
          }}
        >
          <Label className="font-body text-[12px] text-ink-lo">Era</Label>
          <Select.Trigger className="min-h-[44px] text-[13px]">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="aev" textValue="a.e.v.">a.e.v.</ListBox.Item>
              <ListBox.Item id="ev" textValue="e.v.">e.v.</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </>
  );
}

function PeriodoFields({ state, set }: FieldGroupProps) {
  return (
    <>
      <SectionHeading>Periodo</SectionHeading>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          value={state.periodoInizioAnno}
          onChange={(v: string) => set("periodoInizioAnno", v)}
        >
          <Label className="font-body text-[12px] text-ink-lo">
            Inizio (anno)
          </Label>
          <Input className="min-h-[44px] text-[13px]" inputMode="numeric" />
        </TextField>

        <Select
          selectedKey={state.periodoInizioEra}
          onSelectionChange={(key) => {
            if (key === "aev" || key === "ev") set("periodoInizioEra", key);
          }}
        >
          <Label className="font-body text-[12px] text-ink-lo">Era inizio</Label>
          <Select.Trigger className="min-h-[44px] text-[13px]">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="aev" textValue="a.e.v.">a.e.v.</ListBox.Item>
              <ListBox.Item id="ev" textValue="e.v.">e.v.</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          value={state.periodoFineAnno}
          onChange={(v: string) => set("periodoFineAnno", v)}
        >
          <Label className="font-body text-[12px] text-ink-lo">
            Fine (anno)
          </Label>
          <Input className="min-h-[44px] text-[13px]" inputMode="numeric" />
        </TextField>

        <Select
          selectedKey={state.periodoFineEra}
          onSelectionChange={(key) => {
            if (key === "aev" || key === "ev") set("periodoFineEra", key);
          }}
        >
          <Label className="font-body text-[12px] text-ink-lo">Era fine</Label>
          <Select.Trigger className="min-h-[44px] text-[13px]">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="aev" textValue="a.e.v.">a.e.v.</ListBox.Item>
              <ListBox.Item id="ev" textValue="e.v.">e.v.</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </>
  );
}

function AnnotazioneFields() {
  return (
    <>
      <SectionHeading>Annotazione</SectionHeading>
      <p className="text-[12px] italic text-ink-lo">
        (Nessun campo aggiuntivo per questo tipo)
      </p>
    </>
  );
}

// ── Exhaustive dispatcher over ElementoTipo ──
// Constitution Principle V-bis (Open/Closed): switch on the discriminated
// union and end with `const _exhaustive: never = tipo` so the compiler flags
// any future ElementoTipo variant that is added without an editor branch.
function renderTypeSpecificFields(
  tipo: ElementoTipo,
  state: EditorState,
  set: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void,
): JSX.Element | null {
  switch (tipo) {
    case "personaggio":
      return <PersonaggioFields state={state} set={set} />;
    case "guerra":
      return <GuerraFields state={state} set={set} />;
    case "profezia":
      return <ProfeziaFields state={state} set={set} />;
    case "regno":
      return <RegnoFields state={state} set={set} />;
    case "luogo":
      return <LuogoFields state={state} set={set} />;
    case "evento":
      return <EventoFields state={state} set={set} />;
    case "periodo":
      return <PeriodoFields state={state} set={set} />;
    case "annotazione":
      return <AnnotazioneFields />;
    default: {
      const _exhaustive: never = tipo;
      throw new Error(`Unhandled ElementoTipo: ${String(_exhaustive)}`);
    }
  }
}
