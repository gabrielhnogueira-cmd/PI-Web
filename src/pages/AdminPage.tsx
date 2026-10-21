import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "../data/catalog";
import { segments } from "../data/catalog";
import { brl, formatDate } from "../lib/format";
import type { Order, OrderService, SupportService, Ticket, User } from "../services/types";

interface AdminPageProps {
  user: User;
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  orders: OrderService;
  support: SupportService;
}

const orderStatuses: Order["status"][] = ["Aguardando confirmação", "Em produção", "Enviado"];
const ticketStatuses: Ticket["status"][] = ["Aberto", "Respondido", "Encerrado"];
const fieldClass = "form-control";

export default function AdminPage({ user, products, onProductsChange, orders, support }: AdminPageProps) {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([orders.list(user), support.list(user)])
      .then(([listedOrders, listedTickets]) => {
        if (alive) {
          setOrderList(listedOrders);
          setTickets(listedTickets);
        }
      })
      .catch(() => {
        if (alive) setError("Não foi possível carregar pedidos e chamados.");
      });
    return () => { alive = false; };
  }, [orders, support, user]);

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const segmentId = String(data.get("segmentId") ?? "");
    const material = String(data.get("material") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const rawPrice = String(data.get("price") ?? "").trim();
    let price = rawPrice === "" ? undefined : Number(rawPrice);

    if (!name || !material || !description || !segments.some((segment) => segment.id === segmentId)) {
      setError("Preencha os campos obrigatórios do produto.");
      return;
    }
    if (price !== undefined) {
      const cents = Math.round((price + Number.EPSILON) * 100);
      if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(cents) || Math.abs(price * 100 - cents) > 1e-7) {
        setError("Informe um preço válido, não negativo e com até duas casas decimais.");
        return;
      }
      price = cents / 100;
    }

    const product: Product = {
      id: editing?.id ?? Math.max(0, ...products.map((item) => item.id)) + 1,
      name,
      segmentId,
      material,
      description,
      ...(price === undefined ? {} : { price }),
    };
    onProductsChange(editing
      ? products.map((item) => item.id === editing.id ? product : item)
      : [...products, product]);
    setEditing(null);
    setError("");
    event.currentTarget.reset();
  };

  const removeProduct = (product: Product) => {
    if (!window.confirm(`Excluir "${product.name}" do catálogo?`)) return;
    onProductsChange(products.filter((item) => item.id !== product.id));
    if (editing?.id === product.id) setEditing(null);
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await orders.updateStatus(id, status);
      setOrderList((current) => current.map((order) => order.id === id ? updated : order));
    } catch {
      setError("Não foi possível atualizar o status do pedido.");
    } finally {
      setBusyId("");
    }
  };

  const updateTicketStatus = async (id: string, status: Ticket["status"]) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await support.updateStatus(id, status);
      setTickets((current) => current.map((ticket) => ticket.id === id ? updated : ticket));
    } catch {
      setError("Não foi possível atualizar o status do chamado.");
    } finally {
      setBusyId("");
    }
  };

  const pendingOrders = orderList.filter((order) => order.status === "Aguardando confirmação").length;
  const openTickets = tickets.filter((ticket) => ticket.status === "Aberto").length;

  return (
    <section className="mx-auto w-[min(100%-2rem,1160px)] pb-28 pt-10 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Painel administrativo · protótipo</p>
          <h1 className="m-0 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Olá, {user.name.split(" ")[0]}</h1>
          <p className="mb-0 mt-2 text-soft">Gerencie catálogo, pedidos e chamados nesta demonstração local.</p>
        </div>
      </div>

      <p className="mt-6 border-l-4 border-copper bg-chamote px-4 py-3 text-sm leading-relaxed text-soft">
        Dados e acesso ficam no navegador. Este painel não oferece controle de acesso seguro e não deve ser usado com dados reais em produção.
      </p>
      {error && <p className="mt-5 text-sm font-semibold text-copper-deep" role="alert">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Produtos no catálogo" value={products.length} />
        <Metric label="Pedidos aguardando confirmação" value={pendingOrders} />
        <Metric label="Chamados abertos" value={openTickets} />
      </div>

      <section className="mt-14" id="catalogo" aria-labelledby="catalogo-title">
        <h2 className="font-display text-3xl font-bold" id="catalogo-title">Catálogo e preços</h2>
        <form className="mt-5 grid gap-4 border border-edge/40 bg-white p-5 sm:grid-cols-2 sm:p-7" onSubmit={saveProduct}>
          <h3 className="m-0 font-display text-xl font-bold sm:col-span-2">{editing ? `Editando: ${editing.name}` : "Cadastrar produto"}</h3>
          <label className="form-label">Nome
            <input key={`name-${editing?.id ?? "new"}`} className={fieldClass} name="name" defaultValue={editing?.name ?? ""} maxLength={120} required />
          </label>
          <label className="form-label">Segmento
            <select key={`segment-${editing?.id ?? "new"}`} className={fieldClass} name="segmentId" defaultValue={editing?.segmentId ?? segments[0].id} required>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.title}</option>)}
            </select>
          </label>
          <label className="form-label">Material
            <input key={`material-${editing?.id ?? "new"}`} className={fieldClass} name="material" defaultValue={editing?.material ?? ""} maxLength={100} required />
          </label>
          <label className="form-label">Preço em reais (opcional)
            <input key={`price-${editing?.id ?? "new"}`} className={fieldClass} type="number" name="price" min="0" step="0.01" defaultValue={editing?.price ?? ""} placeholder="Em branco = sob consulta" />
          </label>
          <label className="form-label sm:col-span-2">Descrição
            <textarea key={`description-${editing?.id ?? "new"}`} className={`${fieldClass} min-h-24 resize-y`} name="description" defaultValue={editing?.description ?? ""} maxLength={500} required />
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-dark" type="submit">{editing ? "Salvar alterações" : "Adicionar produto"}</button>
            {editing && <button className="min-h-11 px-3 text-sm font-semibold underline underline-offset-4" type="button" onClick={() => setEditing(null)}>Cancelar edição</button>}
          </div>
        </form>
        <div className="mt-5 grid gap-3">
          {products.map((product) => (
            <article className="flex flex-wrap items-center justify-between gap-4 border border-edge/30 bg-white/70 p-4 sm:px-5" key={product.id}>
              <div className="min-w-0">
                <h3 className="m-0 font-display text-lg font-bold">{product.name}</h3>
                <p className="mb-0 mt-1 text-sm text-soft">{segmentTitle(product.segmentId)} · {product.material}</p>
                <p className="mb-0 mt-1 text-sm font-semibold">{product.price === undefined ? "Sob consulta" : brl(product.price)}</p>
              </div>
              <div className="flex gap-3">
                <button className="min-h-10 px-2 text-sm font-semibold underline underline-offset-4" type="button" onClick={() => { setEditing(product); setError(""); }}>Editar</button>
                <button className="min-h-10 px-2 text-sm font-semibold text-copper-deep underline underline-offset-4" type="button" onClick={() => removeProduct(product)}>Excluir</button>
              </div>
            </article>
          ))}
          {products.length === 0 && <p className="text-soft">Nenhum produto cadastrado.</p>}
        </div>
      </section>

      <section className="mt-16" id="pedidos" aria-labelledby="pedidos-title">
        <h2 className="font-display text-3xl font-bold" id="pedidos-title">Pedidos</h2>
        <div className="mt-5 border-t border-edge/40">
          {orderList.map((order) => (
            <article className="grid gap-3 border-b border-edge/40 py-5 sm:grid-cols-[1fr_auto] sm:items-center" key={order.id}>
              <div>
                <h3 className="m-0 font-display text-lg font-bold">{order.id} <span className="font-sans text-sm font-normal text-soft">· {order.userName}</span></h3>
                <p className="mb-0 mt-1 text-sm text-soft">{formatDate(order.createdAt)} · {order.lines.map((line) => `${line.qty}× ${line.name}`).join(", ")}</p>
                {order.note && <p className="mb-0 mt-1 text-sm text-soft">Obs.: {order.note}</p>}
              </div>
              <label className="form-label sm:w-56">Status
                <select className={fieldClass} value={order.status} disabled={busyId === order.id} onChange={(event) => void updateOrderStatus(order.id, event.target.value as Order["status"])}>
                  {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
            </article>
          ))}
          {orderList.length === 0 && <p className="py-4 text-soft">Nenhum pedido registrado neste navegador.</p>}
        </div>
      </section>

      <section className="mt-16" id="chamados" aria-labelledby="chamados-title">
        <h2 className="font-display text-3xl font-bold" id="chamados-title">Chamados</h2>
        <div className="mt-5 border-t border-edge/40">
          {tickets.map((ticket) => (
            <article className="grid gap-3 border-b border-edge/40 py-5 sm:grid-cols-[1fr_auto] sm:items-center" key={ticket.id}>
              <div>
                <h3 className="m-0 font-display text-lg font-bold">{ticket.subject} <span className="font-sans text-sm font-normal text-soft">· {ticket.userName}</span></h3>
                <p className="mb-0 mt-1 text-sm text-soft">{ticket.id} · {formatDate(ticket.createdAt)}{ticket.orderId ? ` · Pedido ${ticket.orderId}` : ""}</p>
                <p className="mb-0 mt-2 whitespace-pre-wrap text-sm">{ticket.message}</p>
              </div>
              <label className="form-label sm:w-44">Status
                <select className={fieldClass} value={ticket.status} disabled={busyId === ticket.id} onChange={(event) => void updateTicketStatus(ticket.id, event.target.value as Ticket["status"])}>
                  {ticketStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
            </article>
          ))}
          {tickets.length === 0 && <p className="py-4 text-soft">Nenhum chamado registrado neste navegador.</p>}
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-edge/30 bg-white/70 p-5">
      <p className="m-0 text-sm text-soft">{label}</p>
      <p className="mb-0 mt-2 font-display text-3xl font-bold tabular-nums text-copper-deep">{value}</p>
    </article>
  );
}

function segmentTitle(id: string) {
  return segments.find((segment) => segment.id === id)?.title ?? "Segmento não identificado";
}
