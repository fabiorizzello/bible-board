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

import type { Elemento } from "@/features/elemento/elemento.model";
import { normalizeElementoInput } from "@/features/elemento/elemento.rules";
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
}

function initState(el: Elemento): EditorState {
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
  };
}

// ── Error messages ──

const ERROR_MESSAGES: Record<string, string> = {
  titolo_vuoto: "Il titolo è obbligatorio",
  data_non_valida: "Data non valida",
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
    const result = normalizeElementoInput({
      titolo: state.titolo,
      descrizione: state.descrizione,
      tags: state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tipo: element.tipo,
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

      {/* ── Type-Specific Fields ── */}
      {tipo === "personaggio" && (
        <PersonaggioFields state={state} set={set} />
      )}
      {tipo === "guerra" && <GuerraFields state={state} set={set} />}
      {tipo === "profezia" && <ProfeziaFields state={state} set={set} />}
      {tipo === "regno" && <RegnoFields state={state} set={set} />}
      {tipo === "luogo" && <LuogoFields state={state} set={set} />}

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
          onSelectionChange={(key) =>
            set("nascitaEra", key as "aev" | "ev")
          }
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
          onSelectionChange={(key) =>
            set("morteEra", key as "aev" | "ev")
          }
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
        onSelectionChange={(key) =>
          set("statoProfezia", String(key))
        }
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
