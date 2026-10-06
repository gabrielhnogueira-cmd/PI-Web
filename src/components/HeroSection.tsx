import { Link } from "../lib/router";

interface HeroSectionProps { onRequest: () => void }

export default function HeroSection({ onRequest }: HeroSectionProps) {
  return (
    <section className="mx-auto grid w-[min(100%-2rem,1160px)] items-center gap-12 pb-24 pt-10 sm:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32" id="inicio" aria-label="Apresentação">
      <div>
        <h1 className="m-0 font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.02] tracking-tight">
          Precisão refratária para a indústria de base.
        </h1>
        <p className="mb-0 mt-6 max-w-lg text-lg leading-relaxed text-soft">
          Fabricamos peças cerâmicas refratárias para fundições e empresas do setor metalúrgico, peças técnicas para laboratórios de análise de carbono e enxofre e peças para aquários.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link className="btn-dark" to="/loja">Montar pedido</Link>
          <button className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4 hover:text-copper-deep" type="button" onClick={onRequest}>Pedir orçamento</button>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="absolute -left-6 bottom-10 h-40 w-40 rounded-full bg-copper sm:h-56 sm:w-56" aria-hidden="true" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-chamote">
          <img className="h-full w-full object-cover" src="/assets/images/Inicio.png" alt="Peça cerâmica refratária fabricada pela Gramanse" width={800} height={1000} />
        </div>
      </div>
    </section>
  );
}