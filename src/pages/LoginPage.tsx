import { useState, type FormEvent } from "react";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import { Link, navigate } from "../lib/router";
import type { AccountService, User } from "../services/types";

interface LoginPageProps {
  account: AccountService;
  hasCart: boolean;
  onAuth: (user: User) => void;
}

export default function LoginPage({ account, hasCart, onAuth }: LoginPageProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Formulário não controlado: os campos continuam preenchidos quando há erro.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      const user = await account.login({ email: String(data.get("email")), password: String(data.get("password")), role: "cliente" });
      onAuth(user);
      navigate(hasCart ? "/loja" : "/conta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Entrar" intro="Acompanhe pedidos e chamados na sua conta." art="fundicao">
      <form className="grid gap-5" onSubmit={submit}>
        <label className="form-label">E-mail
          <input className="form-control" type="email" name="email" autoComplete="email" required />
        </label>
        <PasswordField id="current-password" autoComplete="current-password" />
        {error && <p className="m-0 text-sm font-semibold text-copper-deep" role="alert">{error}</p>}
        <button className="btn-dark justify-self-start" type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
      <p className="mb-0 mt-8 text-sm text-soft">
        Ainda não tem conta? <Link className="font-semibold text-ink underline underline-offset-4" to="/cadastro">Criar conta</Link>.{" "}
        Esqueceu a senha? <Link className="font-semibold text-ink underline underline-offset-4" to="/suporte">Fale com o suporte</Link>.
      </p>
    </AuthLayout>
  );
}