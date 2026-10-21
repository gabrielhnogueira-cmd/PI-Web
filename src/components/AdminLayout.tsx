import type { ReactNode } from "react";
import { Link } from "../lib/router";

interface AdminLayoutProps {
  authenticated: boolean;
  onLogout: () => void;
  children: ReactNode;
}

export default function AdminLayout({ authenticated, onLogout, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-fundo">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-fundo">
        <div className="h-1 bg-copper" aria-hidden="true" />
        <nav className="mx-auto flex min-h-[4.5rem] w-[min(100%-2rem,1160px)] flex-wrap items-center justify-between gap-4 py-3 sm:min-h-[5rem]" aria-label="Navegação administrativa">
          <Link className="flex min-w-0 items-center gap-2.5 text-ink no-underline" to={authenticated ? "/admin" : "/admin/entrar"}>
            <img className="h-12 w-12 shrink-0 object-contain" src="/assets/images/gramanse-mark.png" alt="" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-base font-bold uppercase tracking-[0.04em] sm:text-lg">Cerâmica Gramanse</span>
              <span className="mt-1 font-display text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-copper-deep">Painel administrativo</span>
            </span>
          </Link>
          {authenticated && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <SectionButton sectionId="catalogo">Catálogo</SectionButton>
              <SectionButton sectionId="pedidos">Pedidos</SectionButton>
              <SectionButton sectionId="chamados">Chamados</SectionButton>
              <button className="min-h-10 px-3 text-sm font-semibold text-copper-deep underline underline-offset-4" type="button" onClick={onLogout}>Sair</button>
            </div>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-edge/30 py-6 text-center text-xs text-soft">Cerâmica Gramanse · Área administrativa demonstrativa</footer>
    </div>
  );
}

function SectionButton({ sectionId, children }: { sectionId: string; children: string }) {
  return (
    <button
      className="min-h-10 px-3 text-sm font-semibold text-soft hover:text-ink"
      type="button"
      onClick={() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
    >
      {children}
    </button>
  );
}
