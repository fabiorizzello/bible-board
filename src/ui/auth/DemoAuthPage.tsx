import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Input } from "@heroui/react";
import { useAuth } from "@/app/auth-context";

/**
 * DemoAuth — full-page login screen.
 * Single-field name entry for mock authentication (R001 placeholder).
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
    login(nome.trim());
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
          <Input
            ref={inputRef}
            label="Il tuo nome"
            placeholder="es. Marco"
            value={nome}
            onValueChange={handleChange}
            onBlur={handleBlur}
            isRequired
            isInvalid={touched && !!errore}
            errorMessage={touched ? errore : undefined}
            variant="bordered"
            size="sm"
            autoComplete="name"
            classNames={{
              inputWrapper: "min-h-[44px]",
              label: "font-body",
            }}
          />
        </div>

        <Button
          type="submit"
          className="mt-6 w-full min-h-[44px] bg-accent text-white font-body font-medium"
          variant="solid"
          size="sm"
        >
          Accedi
        </Button>
      </form>
    </div>
  );
}
