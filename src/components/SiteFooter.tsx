import { contact } from "../data/site";
import { Link } from "../lib/router";

export default function SiteFooter() {
  const link = "text-fundo underline underline-offset-4 hover:text-copper";
  return (
    <footer className="sheet on-dark bg-carvao pt-16 text-fundo">
      <div className="mx-auto grid w-[min(100%-2rem,1160px)] gap-10 pb-10 sm:grid-cols-3">
        <div>
          <p className="m-0 font-display text-xl font-bold">Cerâmica Gramanse</p>
          <p className="mb-0 mt-2 max-w-xs text-sm text-chamote">Refratários técnicos para a indústria de base.</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Rodapé">
          <Link className={link} to="/loja">Loja</Link>
          <Link className={link} to="/suporte">Suporte</Link>
          <Link className={link} to="/entrar">Entrar</Link>
          <Link className={link} to="/cadastro">Criar conta</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <a className={link} href={`mailto:${contact.email}`}>{contact.email}</a>
          <a className={link} href={contact.phoneHref}>{contact.phone}</a>
        </div>
        <p className="m-0 border-t border-white/15 pt-4 text-xs text-chamote sm:col-span-3">© {new Date().getFullYear()} Cerâmica Gramanse Ltda.</p>
      </div>
    </footer>
  );
}