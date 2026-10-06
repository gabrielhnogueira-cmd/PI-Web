import type { Product, Segment } from "../data/catalog";
import ProductRow from "./ProductRow";

interface SolutionsSectionProps {
  segments: Segment[];
  products: Product[];
  selectedSegment: string;
  onSelectSegment: (segmentId: string) => void;
  onAdd: (productId: number) => void;
  onQuote: (productName: string) => void;
}

export default function SolutionsSection({ segments, products, selectedSegment, onSelectSegment, onAdd, onQuote }: SolutionsSectionProps) {
  const selected = segments.find((segment) => segment.id === selectedSegment);
  const visible = products.filter((product) => product.segmentId === selectedSegment);

  return (
    <section className="sheet on-dark bg-carvao pt-16 text-fundo sm:pt-24" id="solucoes" aria-labelledby="solucoes-title">
      <div className="mx-auto w-[min(100%-2rem,1160px)] pb-24 sm:pb-28">
        <h2 className="block-title m-0 max-w-xl" id="solucoes-title">Qual é a sua aplicação?</h2>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2" role="group" aria-label="Segmentos atendidos">
          {segments.map((segment) => {
            const active = segment.id === selectedSegment;
            return (
              <button key={segment.id} type="button" aria-pressed={active} onClick={() => onSelectSegment(segment.id)}
                className={`min-h-11 border-b-4 pb-1 text-left font-display text-lg font-bold transition-colors sm:text-xl ${active ? "border-copper text-fundo" : "border-transparent text-chamote/70 hover:text-fundo"}`}>
                {segment.title}
              </button>
            );
          })}
        </div>
        <p className="mb-8 mt-4 max-w-lg text-chamote" aria-live="polite">{selected?.description}</p>

        {visible.map((product) => <ProductRow key={product.id} product={product} dark onAdd={onAdd} onQuote={onQuote} />)}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
          <p className="m-0 max-w-md text-chamote">Não encontrou a peça? Fabricamos conforme as dimensões e o regime de trabalho da sua aplicação.</p>
          <button className="btn-copper" type="button" onClick={() => onQuote("Peça técnica personalizada")}>Enviar especificação</button>
        </div>
      </div>
    </section>
  );
}