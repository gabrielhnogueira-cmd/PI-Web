import { useState } from "react";

interface SiteHeaderProps {
  onRequest: () => void;
}

const navigation = [
  { href: "#inicio", label: "Início" },
  { href: "#solucoes", label: "Produtos" },
  { href: "#empresa", label: "A empresa" },
  { href: "#contato", label: "Contato" },
];

export default function SiteHeader({ onRequest }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white shadow-md">
      <nav className="mx-auto flex min-h-16 w-[min(100%-2rem,1160px)] items-center justify-between gap-5" aria-label="Navegação principal">
        <a className="flex shrink-0 items-center gap-2 text-ink no-underline" href="#inicio" onClick={closeMenu}>
          <img className="h-11 w-11 object-contain" src="/assets/images/image-Photoroom.png" alt="" />
          <span className="flex flex-col font-display text-[0.92rem] font-bold leading-none">
            CERÂMICA GRAMANSE
            <small className="mt-1.5 font-display text-[0.55rem] tracking-[0.16em] text-copper">REFRATÁRIOS TÉCNICOS</small>
          </span>
        </a>

        <button
          className="grid h-10 w-10 place-items-center text-ink md:hidden"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="flex w-5 flex-col gap-1" aria-hidden="true">
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>

        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-5 border-b border-line bg-white px-6 py-6 shadow-md md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {navigation.map((item) => (
            <a
              key={item.href}
              className="font-display text-xs uppercase tracking-[0.1em] text-[#55534f] no-underline transition-colors hover:text-copper"
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <button
            className="min-h-10 bg-copper px-4 font-display text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#c95620]"
            type="button"
            onClick={() => {
              closeMenu();
              onRequest();
            }}
          >
            Solicitar orçamento <span aria-hidden="true">↗</span>
          </button>
        </div>
      </nav>
    </header>
  );
}