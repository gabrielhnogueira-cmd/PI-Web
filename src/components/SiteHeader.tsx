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
  const linkClass = "relative flex min-h-11 items-center px-3 text-sm font-semibold text-soft transition-colors hover:text-copper-deep";
  const activeLinkClass = "text-ink after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-copper";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/15 bg-fundo">
      <div className="h-1 bg-copper" aria-hidden="true" />
      <nav className="relative mx-auto flex min-h-[4.5rem] w-[min(100%-2rem,1160px)] items-center justify-between gap-4 sm:min-h-[5rem]" aria-label="Navegação principal">
        <Link className="flex min-w-0 shrink-0 items-center gap-2.5 text-ink no-underline sm:gap-3" to="/" onClick={closeMenu}>
          <img className="h-14 w-14 shrink-0 object-contain" src="/assets/images/gramanse-mark.png" alt="" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-base font-bold uppercase tracking-[0.04em] sm:text-lg">Cerâmica Gramanse</span>
            <span className="mt-1 font-display text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-copper-deep sm:text-[0.62rem]">Refratários técnicos</span>
          </span>
        </Link>

        <button className="grid h-11 w-11 shrink-0 place-items-center text-ink transition-colors hover:text-copper-deep lg:hidden" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="flex w-6 flex-col gap-[5px]" aria-hidden="true">
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>

        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-[-1rem] right-[-1rem] top-full z-40 flex-col border-b border-ink/15 bg-fundo px-4 pb-5 pt-3 lg:static lg:flex lg:flex-row lg:items-center lg:justify-end lg:gap-2 lg:border-0 lg:p-0`}>
          {navigation.map((item) => (
            <Link key={item.to} className={`${linkClass} ${path === item.to ? activeLinkClass : ""}`} to={item.to} aria-current={path === item.to ? "page" : undefined} onClick={closeMenu}>{item.label}</Link>
          ))}
          <span className="my-2 h-px bg-ink/10 lg:mx-2 lg:my-0 lg:h-7 lg:w-px" aria-hidden="true" />
          <Link className={`${linkClass} ${path === "/conta" || path === "/entrar" ? activeLinkClass : ""}`} to={user ? "/conta" : "/entrar"} aria-current={path === "/conta" || path === "/entrar" ? "page" : undefined} onClick={closeMenu}>
            {user ? user.name.split(" ")[0] : "Entrar"}
          </Link>
          <Link className={`${linkClass} ${path === "/loja" ? activeLinkClass : ""}`} to="/loja" aria-current={path === "/loja" ? "page" : undefined} onClick={closeMenu}>
            <span aria-live="polite">Pedido</span>
            <span className={`ml-2 border-b-2 px-1 font-display text-xs font-bold ${cartCount > 0 ? "border-copper text-copper-deep" : "border-transparent text-soft"}`}>{cartCount}</span>
          </Link>
          <button className="group mt-3 inline-flex min-h-11 w-full items-center justify-center gap-3 border border-carvao bg-carvao px-5 font-display text-xs font-bold uppercase tracking-[0.08em] text-fundo transition-colors hover:border-copper hover:bg-copper hover:text-ink lg:ml-3 lg:mt-0 lg:w-auto" type="button" onClick={() => { closeMenu(); onRequest(); }}>
            Solicitar orçamento <span className="text-copper transition-colors group-hover:text-ink" aria-hidden="true">↗</span>
          </button>
        </div>
      </nav>
    </header>
  );
}