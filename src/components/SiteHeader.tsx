import { useState } from "react";
import { Link } from "../lib/router";
import type { User } from "../services/types";

interface SiteHeaderProps {
  path: string;
  user: User | null;
  cartCount: number;
  onRequest: () => void;
}

const navigation = [
  { to: "/", label: "Início" },
  { to: "/loja", label: "Loja" },
  { to: "/empresa", label: "Empresa" },
  { to: "/suporte", label: "Suporte" },
];

export default function SiteHeader({ path, user, cartCount, onRequest }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const linkClass = "flex min-h-11 items-center text-sm font-semibold text-soft transition-colors hover:text-copper-deep aria-[current=page]:text-ink";

  return (
    <header className="sticky top-0 z-30 border-b border-edge/40 bg-fundo">
      <nav className="mx-auto flex min-h-16 w-[min(100%-2rem,1160px)] items-center justify-between gap-5" aria-label="Navegação principal">
        <Link className="flex shrink-0 items-center gap-3 text-ink" to="/" onClick={closeMenu}>
          <img className="h-11 w-11 object-contain" src="/assets/images/image-Photoroom.png" alt="" />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold">Cerâmica Gramanse</span>
            <span className="text-xs text-soft">Refratários técnicos</span>
          </span>
        </Link>

        <button className="grid h-11 w-11 place-items-center text-ink md:hidden" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="flex w-5 flex-col gap-1" aria-hidden="true">
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </span>
        </button>

        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-edge/40 bg-fundo px-4 py-4 md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}>
          {navigation.map((item) => (
            <Link key={item.to} className={linkClass} to={item.to} aria-current={path === item.to ? "page" : undefined} onClick={closeMenu}>{item.label}</Link>
          ))}
          <Link className={linkClass} to={user ? "/conta" : "/entrar"} aria-current={path === "/conta" || path === "/entrar" ? "page" : undefined} onClick={closeMenu}>
            {user ? user.name.split(" ")[0] : "Entrar"}
          </Link>
          <Link className={linkClass} to="/loja" onClick={closeMenu}>
            <span aria-live="polite">Pedido{cartCount > 0 ? ` (${cartCount})` : ""}</span>
          </Link>
          <button className="btn-dark" type="button" onClick={() => { closeMenu(); onRequest(); }}>Solicitar orçamento</button>
        </div>
      </nav>
    </header>
  );
}