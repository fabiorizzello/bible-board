import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useAuth } from "@/app/auth-context";

/**
 * DemoAuth — full-page login screen.
 * Single-field name entry; creates a local Jazz account on first login.
 *
 * Uses HeroUI v3 TextField composition: TextField > Label + Input + FieldError
 */
export function DemoAuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function validate(value: string): string | null {
    if (value.trim().length === 0) {
      return "Il nome è obbligatorio";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErr = validate(nome);
    if (validationErr) {
      setErrore(validationErr);
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      await login(nome.trim());
      navigate("/", { replace: true });
    } catch {
      setErrore("Errore durante il login. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  function handleBlur() {
    setTouched(true);
    setErrore(validate(nome));
  }

  function handleChange(value: string) {
    setNome(value);
    if (touched) {
      setErrore(validate(value));
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm rounded-2xl bg-panel p-8 shadow-lg"
      >
        <h1 className="font-heading text-2xl font-semibold text-ink text-center">
          Timeline Board
        </h1>
        <p className="mt-2 text-center text-sm text-ink-md">
          Accedi per iniziare
        </p>

        <div className="mt-8">
          <TextField
            value={nome}
            onChange={handleChange}
            isRequired
            isInvalid={touched && !!errore}
            isDisabled={loading}
            autoComplete="name"
          >
            <Label className="font-body text-sm text-ink-md">Il tuo nome</Label>
            <Input
              ref={inputRef}
              placeholder="es. Marco"
              onBlur={handleBlur}
              className="min-h-[44px]"
            />
            {touched && errore && (
              <FieldError className="mt-1 text-xs text-red-600">{errore}</FieldError>
            )}
          </TextField>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full min-h-[44px] bg-accent text-white font-body font-medium"
          variant="primary"
          size="sm"
          isDisabled={loading}
          isLoading={loading}
        >
          {loading ? "Accesso in corso…" : "Accedi"}
        </Button>
      </form>
    </div>
  );
}
