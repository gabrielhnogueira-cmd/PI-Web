import { useState } from "react";
import ProductRow from "../components/ProductRow";
import type { Product, Segment } from "../data/catalog";
import { brl } from "../lib/format";
import { Link, navigate } from "../lib/router";
import type { CartLine, Order, OrderService, User } from "../services/types";

interface ShopPageProps {
  segments: Segment[];
  products: Product[];
  cart: CartLine[];
  user: User | null;
  orders: OrderService;
  onAdd: (productId: number) => void;
  onSetQty: (productId: number, qty: number) => void;
  onClear: () => void;
  onQuote: (productName: string) => void;
}

export default function ShopPage({ segments, products, cart, user, orders, onAdd, onSetQty, onClear, onQuote }: ShopPageProps) {
  const [filter, setFilter] = useState("todos");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [done, setDone] = useState<Order | null>(null);

  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = cart.flatMap((line) => { const product = byId.get(line.productId); return product ? [{ product, qty: line.qty }] : []; });
  const visible = filter === "todos" ? products : products.filter((product) => product.segmentId === filter);
  const total = lines.every((line) => line.product.price !== undefined) ? lines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.qty, 0) : null;

  const send = async () => {
    if (!user) return navigate("/entrar");
    setStatus("sending");
    try {
      const order = await orders.create(user, lines.map(({ product, qty }) => ({ productId: product.id, name: product.name, qty })), note.trim() || undefined);
      setDone(order);
      setNote("");
      setStatus("idle");
      onClear();
    } catch {
      setStatus("error");
    }
  };

  const pill = (active: boolean) => `min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${active ? "border-carvao bg-carvao text-fundo" : "border-edge text-ink hover:border-ink"}`;
  const step = "grid h-11 w-11 place-items-center rounded-full border border-edge text-lg hover:border-ink";

  return (
    <section className="mx-auto w-[min(100%-2rem,1160px)] pb-28 pt-10 sm:pt-16">
      <h1 className="m-0 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Monte seu pedido</h1>
      <p className="mb-0 mt-3 max-w-lg text-base leading-relaxed text-soft">Escolha as peças e as quantidades. Para peças fora do catálogo, use o pedido de orçamento.</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por segmento">
            <button className={pill(filter === "todos")} type="button" aria-pressed={filter === "todos"} onClick={() => setFilter("todos")}>Todas</button>
            {segments.map((segment) => (
              <button key={segment.id} className={pill(filter === segment.id)} type="button" aria-pressed={filter === segment.id} onClick={() => setFilter(segment.id)}>{segment.title}</button>
            ))}
          </div>
          {visible.map((product) => <ProductRow key={product.id} product={product} onAdd={onAdd} onQuote={onQuote} />)}
          <div className="border-t border-edge/40" />
        </div>

        <aside className="h-fit rounded-b-md rounded-t-[2.5rem] bg-chamote p-7 lg:sticky lg:top-24" aria-label="Resumo do pedido">
          {done ? (
            <div role="status">
              <h2 className="m-0 font-display text-2xl font-bold">Pedido enviado</h2>
              <p className="mb-0 mt-3 text-sm leading-relaxed text-soft">O pedido <strong className="text-ink">{done.id}</strong> foi registrado. Você acompanha o andamento na sua conta.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link className="btn-dark" to="/conta">Ver meus pedidos</Link>
                <button className="min-h-11 text-sm font-semibold underline underline-offset-4" type="button" onClick={() => setDone(null)}>Novo pedido</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="m-0 font-display text-2xl font-bold">Seu pedido</h2>
              {lines.length === 0 ? (
                <p className="mb-0 mt-3 text-sm text-soft">Adicione peças para montar o pedido.</p>
              ) : (
                <>
                  <ul className="m-0 mt-4 list-none divide-y divide-ink/15 p-0">
                    {lines.map(({ product, qty }) => (
                      <li className="flex items-center justify-between gap-3 py-3" key={product.id}>
                        <span className="text-sm font-semibold">{product.name}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          <button className={step} type="button" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => onSetQty(product.id, qty - 1)}>−</button>
                          <span className="w-6 text-center text-sm" aria-live="polite">{qty}</span>
                          <button className={step} type="button" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => onSetQty(product.id, qty + 1)}>+</button>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {total !== null && <p className="mb-0 mt-3 text-right text-sm font-semibold">Total: {brl(total)}</p>}
                  <label className="form-label mt-4">Observações (opcional)
                    <textarea className="form-control min-h-20 resize-y" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Dimensões, regime de trabalho…" />
                  </label>
                  {status === "error" && <p className="mb-0 mt-3 text-sm font-semibold text-copper-deep" role="alert">Não foi possível enviar. Tente novamente.</p>}
                  <button className="btn-dark mt-5 w-full" type="button" disabled={status === "sending"} onClick={send}>
                    {status === "sending" ? "Enviando…" : user ? "Enviar pedido" : "Entrar para enviar o pedido"}
                  </button>
                  <button className="mt-2 min-h-11 w-full text-sm font-semibold underline underline-offset-4" type="button" onClick={onClear}>Esvaziar pedido</button>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}