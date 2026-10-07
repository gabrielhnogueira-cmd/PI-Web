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
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
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
  const step = "grid h-10 w-9 place-items-center border border-edge/30 text-lg text-ink transition-colors hover:border-copper hover:bg-copper hover:text-ink focus-visible:outline-offset-2";

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
          {visible.map((product) => <ProductRow key={product.id} product={product} quantity={cart.find((line) => line.productId === product.id)?.qty ?? 0} onAdd={onAdd} onQuote={onQuote} />)}
          <div className="border-t border-edge/40" />
        </div>

        <aside className="relative h-fit overflow-hidden border border-edge/25 border-l-4 border-l-copper bg-white px-5 pb-6 pt-6 text-ink shadow-[0_14px_36px_rgba(38,41,44,0.07)] sm:px-7 sm:pb-7 sm:pt-8 lg:sticky lg:top-24" aria-label="Resumo do pedido">
          {done ? (
            <div role="status">
              <p className="eyebrow mb-2">Solicitação registrada</p>
              <h2 className="m-0 font-display text-2xl font-bold text-ink">Pedido enviado</h2>
              <p className="mb-0 mt-3 text-sm leading-relaxed text-soft">O pedido <strong className="text-copper-deep">{done.id}</strong> foi registrado. Você acompanha o andamento na sua conta.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link className="btn-copper" to="/conta">Ver meus pedidos</Link>
                <button className="min-h-11 text-sm font-semibold text-soft underline underline-offset-4 hover:text-ink" type="button" onClick={() => setDone(null)}>Novo pedido</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-5">
                <div>
                  <p className="eyebrow mb-2 text-[0.58rem]">Em montagem</p>
                  <h2 className="m-0 font-display text-3xl font-bold leading-none text-ink">Seu pedido</h2>
                </div>
                <div className="flex items-baseline gap-2 text-right" aria-live="polite">
                  <span className="font-display text-3xl font-bold leading-none tabular-nums text-copper">{String(itemCount).padStart(2, "0")}</span>
                  <span className="font-display text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-soft">{itemCount === 1 ? "peça" : "peças"}</span>
                </div>
              </div>
              {lines.length === 0 ? (
                <div className="mt-5 border-b border-ink/15 py-5">
                  <p className="mb-1 font-display text-base font-bold text-ink">Ainda sem itens</p>
                  <p className="mb-0 text-sm leading-relaxed text-soft">Adicione uma peça do catálogo para iniciar sua solicitação.</p>
                </div>
              ) : (
                <>
                  <ul className="m-0 list-none p-0">
                    {lines.map(({ product, qty }, index) => (
                      <li className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 border-b border-ink/15 py-4 last:border-b-0" key={product.id}>
                        <span className="pt-0.5 font-display text-[0.6rem] font-bold tracking-[0.1em] text-copper">{String(index + 1).padStart(2, "0")}</span>
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold leading-snug text-ink">{product.name}</span>
                            <span className="mt-1 block font-display text-[0.58rem] uppercase tracking-[0.1em] text-soft">{product.material}</span>
                          </div>
                          <span className="flex shrink-0 items-center border border-edge/30 bg-fundo/50">
                            <button className={step} type="button" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => onSetQty(product.id, qty - 1)}>−</button>
                            <span className="grid h-10 w-8 place-items-center font-display text-sm font-bold tabular-nums text-ink" aria-live="polite">{qty}</span>
                            <button className={step} type="button" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => onSetQty(product.id, qty + 1)}>+</button>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between gap-3 border-y border-ink/15 py-4">
                    <div>
                      <span className="block font-display text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-soft">{total === null ? "Total estimado" : "Subtotal"}</span>
                      {total === null && <span className="mt-1 block text-xs text-soft">Confirmação após análise técnica</span>}
                    </div>
                    <span className="font-display text-lg font-bold tabular-nums text-copper">{total === null ? "Sob consulta" : brl(total)}</span>
                  </div>
                  <label className="mt-5 grid gap-2 text-sm font-semibold text-ink">Observações <span className="font-normal text-soft">Opcional</span>
                    <textarea className="min-h-24 w-full resize-y border border-edge/40 bg-white px-3 py-2.5 text-sm font-normal text-ink placeholder:text-soft/70 focus:border-copper focus:outline-none" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Dimensões, regime de trabalho…" />
                  </label>
                  {status === "error" && <p className="mb-0 mt-3 text-sm font-semibold text-copper-deep" role="alert">Não foi possível enviar. Tente novamente.</p>}
                  <button className="btn-copper mt-5 w-full gap-3" type="button" disabled={status === "sending"} onClick={send}>
                    {status === "sending" ? "Enviando…" : user ? "Enviar pedido" : "Entrar para enviar o pedido"}
                    <span className="font-bold" aria-hidden="true">↗</span>
                  </button>
                  <button className="mt-3 min-h-10 w-full text-xs font-semibold text-soft underline decoration-ink/25 underline-offset-4 transition-colors hover:text-copper-deep hover:decoration-copper" type="button" onClick={onClear}>Esvaziar pedido</button>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}