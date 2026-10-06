import { brl } from "../lib/format";
import type { Product } from "../data/catalog";
import PieceArt from "./PieceArt";

interface ProductRowProps {
  product: Product;
  onAdd: (productId: number) => void;
  onQuote: (productName: string) => void;
  dark?: boolean;
}

export default function ProductRow({ product, onAdd, onQuote, dark = false }: ProductRowProps) {
  return (
    <article className={`grid grid-cols-[4.5rem_1fr] gap-x-5 gap-y-4 border-t py-6 sm:grid-cols-[6rem_1fr_auto] sm:items-center ${dark ? "border-white/15" : "border-edge/40"}`}>
      <div className={`grid h-[4.5rem] w-[4.5rem] place-items-center rounded-t-full sm:h-24 sm:w-24 ${dark ? "bg-white/10 text-copper" : "bg-chamote text-copper-deep"}`}>
        <PieceArt segmentId={product.segmentId} className="h-10 w-10 sm:h-12 sm:w-12" />
      </div>
      <div>
        <p className={`m-0 text-sm font-semibold ${dark ? "text-copper" : "text-copper-deep"}`}>{product.material}</p>
        <h3 className="m-0 mt-1 font-display text-xl font-bold">{product.name}</h3>
        <p className={`m-0 mt-1 max-w-lg text-sm leading-relaxed ${dark ? "text-chamote" : "text-soft"}`}>{product.description}</p>
        {product.price !== undefined && <p className="m-0 mt-2 text-sm font-semibold">{brl(product.price)}</p>}
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:justify-end">
        <button className={dark ? "btn-copper" : "btn-dark"} type="button" onClick={() => onAdd(product.id)}>Adicionar ao pedido</button>
        <button className="min-h-11 px-1 text-sm font-semibold underline underline-offset-4 hover:text-copper" type="button" onClick={() => onQuote(product.name)}>Pedir orçamento</button>
      </div>
    </article>
  );
}