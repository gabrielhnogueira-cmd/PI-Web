import { useEffect, useState, type FormEvent } from "react";
import { contact } from "../data/site";
import { Link } from "../lib/router";
import type { Order, OrderService, SupportService, Ticket, User } from "../services/types";

interface SupportPageProps {
  user: User | null;
  orders: OrderService;
  support: SupportService;
}

const faq = [
  { q: "Como faço um pedido?", a: "Escolha as peças na Loja, ajuste as quantidades e envie o pedido. Para enviar, é preciso entrar com a sua conta de cliente." },
  { q: "Posso pedir uma peça que não está no catálogo?", a: "Sim. Use o Pedir orçamento e descreva dimensões, material e temperatura de trabalho da sua aplicação." },
  { q: "Onde acompanho meus pedidos e chamados?", a: "Na sua conta, depois de entrar. Cada pedido mostra o status atual." },
  { q: "Esqueci minha senha.", a: "Abra um chamado informando o e-mail do cadastro, ou fale com a equipe pelos contatos ao lado." },
];

const subjects = ["Dúvida sobre uma peça", "Acompanhar um pedido", "Problema com a conta", "Outro assunto"];

export default function SupportPage({ user, orders, support }: SupportPageProps) {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [sent, setSent] = useState<Ticket | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    orders.list(user).then((list) => { if (alive) setOrderList(list); });
    return () => { alive = false; };
  }, [user, orders]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(false);
    try {
      setSent(await support.open(user, { subject: String(data.get("subject")), orderId: String(data.get("orderId") ?? "") || undefined, message: String(data.get("message")) }));
      form.reset();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto grid w-[min(100%-2rem,1160px)] gap-14 pb-28 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="m-0 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Como podemos ajudar?</h1>
        <div className="mt-10 border-b border-edge/40">
          {faq.map((item) => (
            <details className="group border-t border-edge/40" key={item.q}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-lg font-bold">
                {item.q}
                <span className="text-2xl text-copper-deep transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="m-0 max-w-xl pb-5 text-sm leading-relaxed text-soft">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mb-0 mt-8 text-sm text-soft">
          Prefere falar direto? <a className="font-semibold text-ink underline underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a> ou <a className="font-semibold text-ink underline underline-offset-4" href={contact.phoneHref}>{contact.phone}</a>.
        </p>
      </div>

      <div className="h-fit rounded-b-md rounded-t-[2.5rem] bg-chamote p-7 sm:p-9">
        <h2 className="m-0 font-display text-2xl font-bold">Abrir chamado</h2>
        {!user ? (
          <>
            <p className="mb-5 mt-3 text-sm leading-relaxed text-soft">Entre na sua conta para abrir um chamado e acompanhar a resposta.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link className="btn-dark" to="/entrar">Entrar</Link>
              <Link className="text-sm font-semibold underline underline-offset-4" to="/cadastro">Criar conta</Link>
            </div>
          </>
        ) : sent ? (
          <div role="status">
            <p className="mb-0 mt-3 text-sm leading-relaxed text-soft">Chamado <strong className="text-ink">{sent.id}</strong> registrado. Você acompanha o andamento na sua conta.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link className="btn-dark" to="/conta">Ver meus chamados</Link>
              <button className="min-h-11 text-sm font-semibold underline underline-offset-4" type="button" onClick={() => setSent(null)}>Abrir outro</button>
            </div>
          </div>
        ) : (
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <label className="form-label">Assunto
              <select className="form-control" name="subject" required>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select>
            </label>
            {orderList.length > 0 && (
              <label className="form-label">Pedido relacionado (opcional)
                <select className="form-control" name="orderId" defaultValue="">
                  <option value="">Nenhum</option>
                  {orderList.map((order) => <option key={order.id} value={order.id}>{order.id}</option>)}
                </select>
              </label>
            )}
            <label className="form-label">Mensagem
              <textarea className="form-control min-h-28 resize-y" name="message" rows={4} required />
            </label>
            {error && <p className="m-0 text-sm font-semibold text-copper-deep" role="alert">Não foi possível enviar. Tente novamente.</p>}
            <button className="btn-dark justify-self-start" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar chamado"}</button>
          </form>
        )}
      </div>
    </section>
  );
}