import { useState, type FormEvent } from "react";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import { Link, navigate } from "../lib/router";
import type { AccountService, User } from "../services/types";

interface RegisterPageProps {
  account: AccountService;
  hasCart: boolean;
  onAuth: (user: User) => void;
}

export default function RegisterPage({ account, hasCart, onAuth }: RegisterPageProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      const user = await account.register({
        name: String(data.get("name")),
        company: String(data.get("company") ?? ""),
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      onAuth(user);
      navigate(hasCart ? "/loja" : "/conta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Criar conta" intro="Cadastro rápido para enviar pedidos e acompanhar o andamento." art="laboratorio">
      <form className="grid gap-5" onSubmit={submit}>
        <label className="form-label">Seu nome
          <input className="form-control" name="name" autoComplete="name" required />
        </label>
        <label className="form-label">Empresa (opcional)
          <input className="form-control" name="company" autoComplete="organization" />
        </label>
        <label className="form-label">E-mail
          <input className="form-control" type="email" name="email" autoComplete="email" required />
        </label>
        <PasswordField id="new-password" autoComplete="new-password" minLength={8} hint="Mínimo de 8 caracteres." />
        {error && <p className="m-0 text-sm font-semibold text-copper-deep" role="alert">{error}</p>}
        <button className="btn-dark justify-self-start" type="submit" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</button>
      </form>
      <p className="mb-0 mt-8 text-sm text-soft">Já tem conta? <Link className="font-semibold text-ink underline underline-offset-4" to="/entrar">Entrar</Link>.</p>
    </AuthLayout>
  );
}