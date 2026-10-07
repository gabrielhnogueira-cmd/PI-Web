import { brl } from "../lib/format";
import type { Product } from "../data/catalog";
import PieceArt from "./PieceArt";

interface ProductRowProps {
  product: Product;
  onAdd: (productId: number) => void;
  onQuote: (productName: string) => void;
  dark?: boolean;
  quantity?: number;
}

export default function ProductRow({ product, onAdd, onQuote, dark = false, quantity = 0 }: ProductRowProps) {
  return (
    <article className={`group relative grid overflow-hidden border transition duration-200 hover:-translate-y-0.5 sm:min-h-48 sm:grid-cols-[7.5rem_minmax(0,1fr)_14rem] sm:items-stretch ${dark ? "border-white/15 bg-white/[0.035] text-fundo hover:border-copper/60 hover:bg-white/[0.07]" : "border-edge/25 bg-white/70 text-ink hover:border-copper/60 hover:bg-white hover:shadow-[0_10px_26px_rgba(38,41,44,0.09)]"}`}>
      <div className={`relative grid min-h-28 place-items-center overflow-hidden sm:min-h-48 ${dark ? "bg-white/[0.06] text-copper" : "bg-chamote/60 text-copper-deep"}`}>
        <span className={`absolute left-3 top-3 font-display text-[0.58rem] font-bold tracking-[0.12em] ${dark ? "text-chamote/70" : "text-soft/70"}`}>{String(product.id).padStart(2, "0")}</span>
        <PieceArt segmentId={product.segmentId} className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14" />
      </div>
      <div className="flex min-w-0 flex-col justify-center p-4 sm:px-6 sm:py-5">
        <div className="flex min-h-5 flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className={`m-0 font-display text-[0.62rem] font-bold uppercase tracking-[0.12em] ${dark ? "text-copper" : "text-copper-deep"}`}>{product.material}</p>
          {product.price !== undefined && <p className="m-0 text-sm font-semibold">{brl(product.price)}</p>}
        </div>
        <h3 className="m-0 mt-1 min-h-[3.25rem] line-clamp-2 font-display text-xl font-bold leading-tight sm:text-2xl">{product.name}</h3>
        <p className={`m-0 mt-2 min-h-10 max-w-xl line-clamp-2 text-sm leading-relaxed ${dark ? "text-chamote" : "text-soft"}`}>{product.description}</p>
        {quantity > 0 && (
          <p className={`mb-0 mt-2 inline-flex min-h-4 items-center gap-2 text-xs font-semibold ${dark ? "text-copper" : "text-copper-deep"}`} aria-live="polite">
            <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
            No seu pedido: {quantity}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-edge/20 px-4 py-3 sm:w-56 sm:flex-col sm:items-stretch sm:justify-center sm:border-l sm:border-t-0 sm:px-4 sm:py-4">
        <button className={`${dark ? "btn-copper" : "btn-dark"} w-full gap-2 whitespace-nowrap`} type="button" aria-label={`Adicionar ${product.name} ao pedido`} onClick={() => onAdd(product.id)}>
          <span aria-hidden="true">+</span>{quantity > 0 ? "Adicionar outro" : "Adicionar ao pedido"}
        </button>
        <button className="min-h-10 px-2 text-left text-sm font-semibold text-soft underline decoration-ink/25 underline-offset-4 transition-colors hover:text-copper-deep hover:decoration-copper" type="button" onClick={() => onQuote(product.name)}>Pedir orçamento <span aria-hidden="true">↗</span></button>
      </div>
    </article>
  );
}