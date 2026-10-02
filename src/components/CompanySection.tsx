const values = [
  { number: "01", title: "Resistência térmica", description: "Peças formuladas para operar em regimes de alta temperatura." },
  { number: "02", title: "Precisão dimensional", description: "Produção conforme dimensões e requisitos de cada aplicação." },
  { number: "03", title: "Foco industrial", description: "Atendimento a fundições, metalurgia e laboratórios de análise." },
  { number: "04", title: "Atendimento técnico", description: "Suporte direto na especificação e no envio do orçamento." },
];

export default function CompanySection() {
  return (
    <>
      <section className="border-y border-line bg-[#191916]" id="empresa">
        <div className="mx-auto grid w-[min(100%-2rem,1160px)] gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="relative min-h-64 overflow-hidden border border-line sm:min-h-80">
            <img className="absolute inset-0 h-full w-full object-cover opacity-80" src="/assets/images/Inicio.png" alt="Peças cerâmicas fabricadas pela Gramanse" />
            <span className="absolute bottom-4 left-4 bg-ink/90 px-3 py-2 font-display text-[0.62rem] uppercase tracking-[0.14em] text-paper">Produção cerâmica especializada</span>
          </div>
          <div>
            <p className="eyebrow">O que nos diferencia</p>
            <h2 className="section-title">Da matéria-prima<br /><em>ao componente técnico.</em></h2>
            <p className="max-w-lg text-base leading-relaxed text-muted">Experiência e controle em cada etapa para entregar peças que acompanham a exigência do seu processo.</p>
            <a className="mt-4 inline-block font-display text-xs font-bold uppercase tracking-[0.1em] text-paper no-underline transition-colors hover:text-copper" href="#contato">Conheça a Gramanse <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-[min(100%-2rem,1160px)] py-10 sm:grid-cols-2 lg:grid-cols-4" aria-label="Diferenciais da Gramanse">
        {values.map((value) => (
          <article className="border-b border-line py-6 sm:px-5 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0" key={value.number}>
            <strong className="font-display text-xs font-normal tracking-[0.1em] text-copper">{value.number}</strong>
            <h3 className="mb-2 mt-5 font-display text-base font-bold uppercase text-paper">{value.title}</h3>
            <p className="mb-0 max-w-xs text-sm leading-relaxed text-muted">{value.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}