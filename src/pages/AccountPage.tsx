import { useEffect, useState } from "react";
import { formatDate } from "../lib/format";
import { Link } from "../lib/router";
import type { Order, OrderService, SupportService, Ticket, User } from "../services/types";

interface AccountPageProps {
  user: User | null;
  orders: OrderService;
  support: SupportService;
  onLogout: () => void;
}

const Status = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-copper" aria-hidden="true" />{text}</span>
);

export default function AccountPage({ user, orders, support, onLogout }: AccountPageProps) {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    Promise.all([orders.list(user), support.list(user)]).then(([o, t]) => { if (alive) { setOrderList(o); setTickets(t); } });
    return () => { alive = false; };
  }, [user, orders, support]);

  if (!user) {
    return (
      <section className="mx-auto w-[min(100%-2rem,1160px)] pb-28 pt-16">
        <h1 className="m-0 font-display text-4xl font-bold">Sua conta</h1>
        <p className="mt-3 text-soft">Entre para ver seus pedidos e chamados.</p>
        <Link className="btn-dark" to="/entrar">Entrar</Link>
      </section>
    );
  }

  const team = user.role === "equipe";
  return (
    <section className="mx-auto w-[min(100%-2rem,1160px)] pb-28 pt-10 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Olá, {user.name.split(" ")[0]}</h1>
          <p className="mb-0 mt-2 text-soft">{team ? "Visão da equipe: todos os pedidos e chamados." : user.company ?? user.email}</p>
        </div>
        <button className="min-h-11 text-sm font-semibold underline underline-offset-4 hover:text-copper-deep" type="button" onClick={onLogout}>Sair</button>
      </div>

      <div className="mt-12 grid gap-14 lg:grid-cols-2">
        <section aria-labelledby="pedidos-title">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="m-0 font-display text-2xl font-bold" id="pedidos-title">Pedidos</h2>
            {!team && <Link className="text-sm font-semibold underline underline-offset-4" to="/loja">Novo pedido</Link>}
          </div>
          {orderList.length === 0 && <p className="border-t border-edge/40 pt-4 text-soft">Nenhum pedido ainda.</p>}
          {orderList.map((order) => (
            <article className="border-t border-edge/40 py-5" key={order.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 font-display text-lg font-bold">{order.id}</p>
                <Status text={order.status} />
              </div>
              <p className="m-0 mt-1 text-sm text-soft">{formatDate(order.createdAt)}{team && ` · ${order.userName}`}</p>
              <p className="mb-0 mt-2 text-sm">{order.lines.map((line) => `${line.qty}× ${line.name}`).join(", ")}</p>
              {order.note && <p className="mb-0 mt-1 text-sm text-soft">Obs.: {order.note}</p>}
            </article>
          ))}
        </section>

        <section aria-labelledby="chamados-title">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="m-0 font-display text-2xl font-bold" id="chamados-title">Chamados</h2>
            <Link className="text-sm font-semibold underline underline-offset-4" to="/suporte">Abrir chamado</Link>
          </div>
          {tickets.length === 0 && <p className="border-t border-edge/40 pt-4 text-soft">Nenhum chamado aberto.</p>}
          {tickets.map((ticket) => (
            <article className="border-t border-edge/40 py-5" key={ticket.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 font-display text-lg font-bold">{ticket.subject}</p>
                <Status text={ticket.status} />
              </div>
              <p className="m-0 mt-1 text-sm text-soft">{ticket.id} · {formatDate(ticket.createdAt)}{team && ` · ${ticket.userName}`}{ticket.orderId && ` · ${ticket.orderId}`}</p>
              <p className="mb-0 mt-2 text-sm">{ticket.message}</p>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}