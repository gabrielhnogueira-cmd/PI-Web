import { useState, type FormEvent } from "react";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import { navigate } from "../lib/router";
import type { AccountService, User } from "../services/types";

interface AdminLoginPageProps {
  account: AccountService;
  onAuth: (user: User) => void;
}

export default function AdminLoginPage({ account, onAuth }: AdminLoginPageProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      const user = await account.login({
        email: String(data.get("email")),
        password: String(data.get("password")),
        role: "equipe",
      });
      onAuth(user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Acesso da equipe" intro="Entre para administrar o catálogo, pedidos e chamados." art="fundicao">
      <form className="grid gap-5" onSubmit={submit}>
        <label className="form-label">E-mail
          <input className="form-control" type="email" name="email" autoComplete="username" required />
        </label>
        <PasswordField id="admin-password" autoComplete="current-password" />
        {error && <p className="m-0 text-sm font-semibold text-copper-deep" role="alert">{error}</p>}
        <button className="btn-dark justify-self-start" type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar no painel"}</button>
      </form>
    </AuthLayout>
  );
}
