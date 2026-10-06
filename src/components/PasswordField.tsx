import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  minLength?: number;
}

export default function PasswordField({ id, autoComplete, hint, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-semibold" htmlFor={id}>Senha</label>
      <div className="relative">
        <input className="form-control pr-24" id={id} name="password" type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} aria-describedby={hint ? `${id}-hint` : undefined} required />
        <button className="absolute right-1 top-0 min-h-11 px-3 text-sm font-semibold text-copper-deep underline underline-offset-4" type="button" aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {hint && <p className="m-0 text-sm text-soft" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}