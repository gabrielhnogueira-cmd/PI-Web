const values = [
  { title: "Resistência térmica", description: "Peças formuladas para operar em regimes de alta temperatura." },
  { title: "Precisão dimensional", description: "Produção conforme dimensões e requisitos de cada aplicação." },
  { title: "Foco industrial", description: "Atendimento a fundições, metalurgia e laboratórios de análise." },
  { title: "Atendimento técnico", description: "Suporte direto na especificação e no envio do pedido." },
];

export default function CompanySection() {
  return (
    <section className="sheet bg-chamote pt-16 sm:pt-24" id="empresa" aria-labelledby="empresa-title">
      <div className="mx-auto grid w-[min(100%-2rem,1160px)] gap-12 pb-24 sm:pb-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -right-6 top-12 h-28 w-28 rounded-full bg-copper" aria-hidden="true" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-carvao">
            <img className="h-full w-full object-cover" src="/assets/images/Inicio.png" alt="Peças cerâmicas fabricadas pela Gramanse" width={600} height={800} loading="lazy" />
          </div>
        </div>
        <div>
          <h2 className="block-title m-0 max-w-lg" id="empresa-title">Da matéria-prima ao componente técnico</h2>
          <p className="mb-0 mt-4 max-w-md text-base leading-relaxed text-soft">Experiência e controle em cada etapa para entregar peças que acompanham a exigência do seu processo.</p>
          <dl className="m-0 mt-8 divide-y divide-ink/15 border-y border-ink/15">
            {values.map((value) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6" key={value.title}>
                <dt className="font-display text-lg font-bold">{value.title}</dt>
                <dd className="m-0 text-sm leading-relaxed text-soft">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}