import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useAuth } from "@/app/auth-context";

/**
 * DemoAuth — full-page login screen.
 * Single-field name entry for mock authentication (R001 placeholder).
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(nome);
    if (err) {
      setErrore(err);
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
    // flushSync ensures the auth state is committed before navigation triggers
    // RequireAuth guards — otherwise React batching defers the update.
    flushSync(() => login(nome.trim()));
    navigate("/", { replace: true });
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
        >
          Accedi
        </Button>
      </form>
    </div>
  );
}
