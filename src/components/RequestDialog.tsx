import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

interface RequestDialogProps {
  initialProduct: string;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function RequestDialog({ initialProduct, onClose }: RequestDialogProps) {
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  // Foco inicial, bloqueio de rolagem e retorno do foco ao fechar.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") return onClose();
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} onKeyDown={handleKeyDown} className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-bloco bg-fundo p-6 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <button className="absolute right-3 top-3 grid h-11 w-11 place-items-center text-2xl text-soft transition-colors hover:text-ink" type="button" aria-label="Fechar formulário" onClick={onClose}>×</button>
        {submitted ? (
          <div className="py-6" role="status">
            <h2 className="block-title m-0" id="request-title">Obrigado pelo seu contato</h2>
            <p className="mb-0 mt-4 max-w-md text-base leading-relaxed text-soft">Sua solicitação foi registrada neste protótipo. A equipe Gramanse poderá retornar com as orientações técnicas.</p>
            <button className="btn-dark mt-6" type="button" onClick={onClose}>Concluir</button>
          </div>
        ) : (
          <>
            <h2 className="block-title m-0 pr-10" id="request-title">Solicitar orçamento</h2>
            <p className="mb-0 mt-3 text-base leading-relaxed text-soft">Conte um pouco sobre a peça e nossa equipe retorna com as orientações técnicas.</p>
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="form-label">Nome ou empresa
                <input className="form-control" name="name" autoComplete="organization" required />
              </label>
              <label className="form-label">E-mail para contato
                <input className="form-control" type="email" name="email" autoComplete="email" required />
              </label>
              <label className="form-label">Produto de interesse
                <input className="form-control" name="product" defaultValue={initialProduct} required />
              </label>
              <label className="form-label">Especificações ou dúvidas (opcional)
                <textarea className="form-control min-h-24 resize-y" name="details" rows={3} placeholder="Aplicação, dimensões ou temperatura de trabalho" />
              </label>
              <button className="btn-dark mt-1 justify-self-start" type="submit">Enviar solicitação</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
