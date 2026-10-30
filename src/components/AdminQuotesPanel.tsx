import { useEffect, useState, type FormEvent } from "react";
import { brl, formatDate } from "../lib/format";
import type { Quote, QuoteService, QuoteStatus, User } from "../services/types";

interface AdminQuotesPanelProps {
  quotes: QuoteService;
  user: User;
}

const STATUSES: QuoteStatus[] = ["Recebido", "Em análise", "Enviado", "Aprovado", "Recusado"];
const DECIDED: QuoteStatus[] = ["Aprovado", "Recusado"];
const dateOnly = (value: string) => value.split("-").reverse().join("/");
const todayLocal = () => new Date().toLocaleDateString("en-CA");

export default function AdminQuotesPanel({ quotes, user }: AdminQuotesPanelProps) {
  const [list, setList] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<QuoteStatus | "todos">("todos");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    quotes.list(user).then((result) => { if (alive) setList(result); }).catch(() => { if (alive) setError("Não foi possível carregar os orçamentos."); });
    return () => { alive = false; };
  }, [quotes, user]);

  const replace = (updated: Quote) => setList((items) => items.map((item) => (item.id === updated.id ? updated : item)));

  const changeStatus = async (quote: Quote, status: QuoteStatus) => {
    setBusy(quote.id);
    setError("");
    try { replace(await quotes.updateStatus(quote.id, status)); }
    catch { setError("Não foi possível alterar o status."); }
    finally { setBusy(null); }
  };

  const reply = async (quote: Quote, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const note = String(data.get("note") ?? "").trim();
    const totalText = String(data.get("total") ?? "").trim();
    const validUntil = String(data.get("validUntil") ?? "").trim();
    const total = totalText === "" ? undefined : Math.round(Number(totalText) * 100) / 100;
    setBusy(quote.id);
    setError("");
    try {
      replace(await quotes.respond(quote.id, { responseNote: note || undefined, responseTotal: total, validUntil: validUntil || undefined }));
      setReplyingTo(null);
    } catch {
      setError("Não foi possível enviar a resposta. Informe o valor ou uma observação e confira a validade.");
    } finally {
      setBusy(null);
    }
  };

  const visible = filter === "todos" ? list : list.filter((quote) => quote.status === filter);
  const pending = list.filter((quote) => quote.status === "Recebido" || quote.status === "Em análise").length;

  return (
    <section className="mx-auto w-[min(100%-2rem,1160px)] pb-28" aria-labelledby="admin-orcamentos-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-4">
        <div>
          <h2 className="m-0 font-display text-3xl font-bold" id="admin-orcamentos-title">Orçamentos</h2>
          <p className="mb-0 mt-1 text-sm text-soft" aria-live="polite">{pending} aguardando resposta · {list.length} no total</p>
        </div>
        <label className="grid gap-1 text-sm font-semibold">Filtrar por status
          <select className="min-h-11 border border-edge/40 bg-white px-3 text-sm font-normal focus:border-copper focus:outline-none" value={filter} onChange={(event) => setFilter(event.target.value as QuoteStatus | "todos")}>
            <option value="todos">Todos</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="mb-0 mt-4 text-sm font-semibold text-copper-deep" role="alert">{error}</p>}
      {visible.length === 0 && !error && <p className="mt-4 text-soft">Nenhum orçamento neste filtro.</p>}

      {visible.map((quote) => {
        const closed = DECIDED.includes(quote.status);
        return (
          <article className="border-b border-edge/30 py-6" key={quote.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="m-0 font-display text-lg font-bold">{quote.id} <span className="font-normal text-soft">· {quote.userName}</span></p>
                <p className="m-0 mt-1 text-sm text-soft">
                  {formatDate(quote.createdAt)} · <a className="underline underline-offset-4 hover:text-copper-deep" href={`mailto:${quote.userEmail}`}>{quote.userEmail}</a>
                  {quote.phone && ` · ${quote.phone}`}
                </p>
                {(quote.company || quote.cnpj) && <p className="m-0 mt-1 text-sm text-soft">{[quote.company, quote.cnpj].filter(Boolean).join(" · ")}</p>}
              </div>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-soft">Status
                <select className="min-h-11 border border-edge/40 bg-white px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-copper focus:outline-none" value={quote.status} disabled={busy === quote.id} onChange={(event) => changeStatus(quote, event.target.value as QuoteStatus)}>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>

            <ul className="m-0 mt-3 list-none p-0 text-sm">
              {quote.lines.map((line, index) => (
                <li key={index}>{line.qty}× {line.name}{line.productId === undefined && <span className="text-copper-deep"> (fora do catálogo)</span>}{line.specs && <span className="text-soft"> — {line.specs}</span>}</li>
              ))}
            </ul>
            {quote.desiredDeadline && <p className="mb-0 mt-2 text-sm text-soft">Prazo desejado: {dateOnly(quote.desiredDeadline)}</p>}

            {(quote.responseTotal !== undefined || quote.responseNote) && (
              <div className="mt-3 border border-edge/30 border-l-4 border-l-copper bg-white/70 p-4 text-sm">
                <p className="m-0 font-display text-[0.62rem] font-bold uppercase tracking-[0.12em] text-copper-deep">Resposta enviada</p>
                {quote.responseTotal !== undefined && <p className="mb-0 mt-2 font-display text-lg font-bold tabular-nums">{brl(quote.responseTotal)}</p>}
                {quote.responseNote && <p className="mb-0 mt-2 leading-relaxed">{quote.responseNote}</p>}
                {quote.validUntil && <p className="mb-0 mt-2 text-soft">Válido até {dateOnly(quote.validUntil)}</p>}
              </div>
            )}

            {!closed && replyingTo !== quote.id && (
              <button className="btn-dark mt-4" type="button" onClick={() => setReplyingTo(quote.id)}>{quote.status === "Enviado" ? "Atualizar resposta" : "Responder orçamento"}</button>
            )}
            {!closed && replyingTo === quote.id && (
              <form className="mt-4 grid gap-4 border border-edge/30 bg-white/70 p-4 sm:grid-cols-2" onSubmit={(event) => reply(quote, event)}>
                <label className="form-label">Valor total (R$)
                  <input className="form-control" type="number" name="total" min={0} step="0.01" inputMode="decimal" defaultValue={quote.responseTotal ?? ""} />
                </label>
                <label className="form-label">Válido até
                  <input className="form-control" type="date" name="validUntil" min={todayLocal()} defaultValue={quote.validUntil ?? ""} />
                </label>
                <label className="form-label sm:col-span-2">Observações para o cliente
                  <textarea className="form-control min-h-24 resize-y" name="note" rows={3} maxLength={2000} defaultValue={quote.responseNote ?? ""} placeholder="Prazo de produção, condições de pagamento, frete…" />
                </label>
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <button className="btn-copper" type="submit" disabled={busy === quote.id}>{busy === quote.id ? "Enviando…" : "Enviar resposta"}</button>
                  <button className="min-h-11 text-sm font-semibold text-soft underline underline-offset-4 hover:text-ink" type="button" onClick={() => setReplyingTo(null)}>Cancelar</button>
                </div>
              </form>
            )}
          </article>
        );
      })}
    </section>
  );
}