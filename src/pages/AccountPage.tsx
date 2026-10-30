import { useEffect, useState } from "react";
import { brl, formatDate } from "../lib/format";
import { Link } from "../lib/router";
import type { Order, OrderService, Quote, QuoteService, SupportService, Ticket, User } from "../services/types";

interface AccountPageProps {
  user: User | null;
  orders: OrderService;
  quotes: QuoteService;
  support: SupportService;
  onLogout: () => void;
}

// Datas "AAAA-MM-DD" são formatadas sem passar por Date, para não "voltar um dia" no fuso do Brasil.
const dateOnly = (value: string) => value.split("-").reverse().join("/");

const Status = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-copper" aria-hidden="true" />{text}</span>
);

export default function AccountPage({ user, orders, quotes, support, onLogout }: AccountPageProps) {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [quoteList, setQuoteList] = useState<Quote[]>([]);
  const [quoteError, setQuoteError] = useState("");
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    Promise.all([orders.list(user), support.list(user)]).then(([o, t]) => { if (alive) { setOrderList(o); setTickets(t); } });
    return () => { alive = false; };
  }, [user, orders, support]);

  // Carregado à parte: se a rota de orçamentos falhar, pedidos e chamados continuam aparecendo.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    quotes.list(user).then((list) => { if (alive) setQuoteList(list); }).catch(() => { if (alive) setQuoteError("Não foi possível carregar os orçamentos agora."); });
    return () => { alive = false; };
  }, [user, quotes]);

  const decide = async (quote: Quote, status: "Aprovado" | "Recusado") => {
    setDeciding(quote.id);
    setQuoteError("");
    try {
      const updated = await quotes.decide(quote.id, status);
      setQuoteList((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setQuoteError("Não foi possível registrar sua decisão. Tente novamente.");
    } finally {
      setDeciding(null);
    }
  };

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
      {team && <Link className="btn-dark mt-6 inline-flex" to="/admin">Abrir painel administrativo</Link>}

      <div className="mt-12 grid gap-14 lg:grid-cols-2">
        <section className="lg:col-span-2" aria-labelledby="orcamentos-title">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="m-0 font-display text-2xl font-bold" id="orcamentos-title">Orçamentos</h2>
            {!team && <Link className="text-sm font-semibold underline underline-offset-4" to="/loja">Escolher peças</Link>}
          </div>
          {quoteError && <p className="m-0 pb-3 text-sm font-semibold text-copper-deep" role="alert">{quoteError}</p>}
          {quoteList.length === 0 && !quoteError && <p className="border-t border-edge/40 pt-4 text-soft">Nenhum orçamento solicitado ainda.</p>}
          {quoteList.map((quote) => {
            const answered = quote.status === "Enviado" || quote.status === "Aprovado" || quote.status === "Recusado";
            return (
              <article className="border-t border-edge/40 py-5" key={quote.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 font-display text-lg font-bold">{quote.id}</p>
                  <Status text={quote.status} />
                </div>
                <p className="m-0 mt-1 text-sm text-soft">
                  {formatDate(quote.createdAt)}{team && ` · ${quote.userName}`}{quote.desiredDeadline && ` · prazo desejado: ${dateOnly(quote.desiredDeadline)}`}
                </p>
                <ul className="m-0 mt-2 list-none p-0 text-sm">
                  {quote.lines.map((line, index) => (
                    <li key={index}>{line.qty}× {line.name}{line.specs && <span className="text-soft"> — {line.specs}</span>}</li>
                  ))}
                </ul>
                {answered && (quote.responseTotal !== undefined || quote.responseNote) && (
                  <div className="mt-3 border border-edge/30 border-l-4 border-l-copper bg-white/70 p-4 text-sm">
                    <p className="m-0 font-display text-[0.62rem] font-bold uppercase tracking-[0.12em] text-copper-deep">Resposta da equipe</p>
                    {quote.responseTotal !== undefined && <p className="mb-0 mt-2 font-display text-xl font-bold tabular-nums">{brl(quote.responseTotal)}</p>}
                    {quote.responseNote && <p className="mb-0 mt-2 leading-relaxed">{quote.responseNote}</p>}
                    {quote.validUntil && <p className="mb-0 mt-2 text-soft">Válido até {dateOnly(quote.validUntil)}</p>}
                  </div>
                )}
                {!team && quote.status === "Enviado" && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button className="btn-dark" type="button" disabled={deciding === quote.id} onClick={() => decide(quote, "Aprovado")}>Aprovar orçamento</button>
                    <button className="min-h-11 text-sm font-semibold text-soft underline underline-offset-4 hover:text-copper-deep" type="button" disabled={deciding === quote.id} onClick={() => decide(quote, "Recusado")}>Recusar</button>
                  </div>
                )}
              </article>
            );
          })}
        </section>

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