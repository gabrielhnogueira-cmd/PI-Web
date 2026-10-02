import type { Product, Segment } from "../data/catalog";

interface ProductSectionProps {
  products: Product[];
  segments: Segment[];
  selectedSegment: string;
  onSelectSegment: (segmentId: string) => void;
  onRequest: (productName: string) => void;
}

export default function ProductSection({ products, segments, selectedSegment, onSelectSegment, onRequest }: ProductSectionProps) {
  const visibleProducts = products.filter((product) => product.segmentId === selectedSegment);
  const selectedName = segments.find((segment) => segment.id === selectedSegment)?.title ?? "Produtos";

  return (
    <section className="border-y border-line bg-white/[0.025]" aria-labelledby="product-title">
      <div className="mx-auto w-[min(100%-2rem,1160px)] py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Catálogo em destaque</p>
            <h2 className="section-title" id="product-title">Conheça nossas<br /><em>linhas técnicas.</em></h2>
          </div>
          <label className="flex flex-col gap-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">
            Filtrar por segmento
            <select className="min-h-11 min-w-64 border border-line bg-ink px-3 text-sm tracking-normal text-paper outline-none focus:border-copper" value={selectedSegment} onChange={(event) => onSelectSegment(event.target.value)}>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.title}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-9 flex items-center justify-between border-b border-line pb-3">
          <p className="mb-0 font-display text-xs uppercase tracking-[0.1em] text-muted">{selectedName}</p>
          <p className="mb-0 font-display text-xs text-muted">{visibleProducts.length.toString().padStart(2, "0")} {visibleProducts.length === 1 ? "item" : "itens"}</p>
        </div>
        <div className="grid sm:grid-cols-2">
          {visibleProducts.map((product, index) => (
            <article className="flex min-h-52 flex-col justify-between border-b border-line py-6 sm:px-5 sm:odd:border-r sm:odd:pl-0 sm:even:pr-0" key={product.id}>
              <div className="flex items-start justify-between gap-4">
                <span className="font-display text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span className="border border-line px-2 py-1 font-display text-[0.58rem] uppercase tracking-[0.1em] text-copper">{product.material}</span>
              </div>
              <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold uppercase text-paper">{product.name}</h3>
                  <p className="mb-0 max-w-sm text-sm leading-relaxed text-muted">{product.description}</p>
                </div>
                <button className="shrink-0 self-start font-display text-xs font-bold uppercase tracking-[0.08em] text-paper transition-colors hover:text-copper sm:self-auto" type="button" onClick={() => onRequest(product.name)}>
                  Consultar <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}