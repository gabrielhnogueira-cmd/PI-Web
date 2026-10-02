interface HeroSectionProps {
  onRequest: () => void;
}

export default function HeroSection({ onRequest }: HeroSectionProps) {
  return (
    <section className="mx-auto grid w-[min(100%-2rem,1160px)] items-center gap-10 py-14 sm:py-20 lg:min-h-[42rem] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20" id="inicio">
      <div className="animate-rise">
        <p className="eyebrow">Cerâmica Gramanse Ltda.</p>
        <h1 className="font-display text-[clamp(2.8rem,10vw,5.8rem)] font-bold uppercase leading-[0.89] sm:text-[5.8rem]">
          Precisão<br />refratária<br /><em className="font-editorial font-normal normal-case text-copper">para a indústria</em><br />de base.
        </h1>
        <p className="mt-7 max-w-lg text-base leading-relaxed text-muted">
          Fabricamos peças cerâmicas refratárias para fundições e empresas do setor metalúrgico, além de peças técnicas para laboratórios de análise de carbono e enxofre e peças destinadas ao uso em aquários.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <button className="action-button" type="button" onClick={onRequest}>Solicitar orçamento <span aria-hidden="true">↗</span></button>
          <a className="font-display text-xs font-bold uppercase tracking-[0.1em] text-paper no-underline transition-colors hover:text-copper" href="#contato">Entre em contato</a>
        </div>
      </div>
      <div className="relative min-h-[23rem] border border-line p-2 sm:min-h-[34rem]">
        <img className="h-[23rem] w-full object-cover saturate-[0.75] sm:h-[33rem]" src="/assets/images/Inicio.png" alt="Peça cerâmica refratária sob luz de laboratório" />
        <span className="absolute bottom-6 right-6 border-l-2 border-copper bg-ink/90 px-4 py-3 font-display text-[0.65rem] uppercase leading-relaxed tracking-[0.12em] text-paper">Engenharia cerâmica<br />para aplicações exigentes</span>
      </div>
    </section>
  );
}