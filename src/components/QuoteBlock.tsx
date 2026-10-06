interface QuoteBlockProps { onRequest: () => void }

export default function QuoteBlock({ onRequest }: QuoteBlockProps) {
  return (
    <section className="sheet bg-copper pt-16 text-ink sm:pt-24" id="orcamento" aria-labelledby="orcamento-title">
      <div className="mx-auto flex w-[min(100%-2rem,1160px)] flex-col justify-between gap-8 pb-24 sm:flex-row sm:items-end sm:pb-28">
        <div>
          <h2 className="m-0 max-w-xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl" id="orcamento-title">Precisa de uma peça específica?</h2>
          <p className="mb-0 mt-4 max-w-md text-base leading-relaxed">Envie sua especificação e nossa equipe retorna com o orçamento e as orientações técnicas.</p>
        </div>
        <button className="btn-dark shrink-0" type="button" onClick={onRequest}>Solicitar orçamento</button>
      </div>
    </section>
  );
}