import { useState, type FormEvent } from "react";

interface RequestDialogProps {
  initialProduct: string;
  onClose: () => void;
}

export default function RequestDialog({ initialProduct, onClose }: RequestDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-line bg-ink p-6 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center text-2xl text-muted transition-colors hover:text-paper" type="button" aria-label="Fechar formulário" onClick={onClose}>×</button>
        {submitted ? (
          <div className="py-8" role="status">
            <p className="eyebrow">Solicitação registrada</p>
            <h2 className="section-title" id="request-title">Obrigado pelo<br /><em>seu contato.</em></h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">Sua solicitação foi registrada neste protótipo. A equipe Gramanse poderá retornar com as orientações técnicas.</p>
            <button className="action-button mt-5" type="button" onClick={onClose}>Concluir</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Vamos conversar</p>
            <h2 className="section-title" id="request-title">Solicite um<br /><em>orçamento.</em></h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">Conte um pouco sobre a peça e nossa equipe retorna com as orientações técnicas.</p>
            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="form-label">Nome ou empresa
                <input className="form-control" name="name" autoComplete="organization" required />
              </label>
              <label className="form-label">E-mail para contato
                <input className="form-control" type="email" name="email" autoComplete="email" required />
              </label>
              <label className="form-label">Produto de interesse
                <input className="form-control" name="product" defaultValue={initialProduct} required />
              </label>
              <label className="form-label">Especificações ou dúvidas
                <textarea className="form-control min-h-24 resize-y" name="details" rows={3} placeholder="Aplicação, dimensões ou outras informações relevantes" />
              </label>
              <button className="action-button mt-2 justify-self-start" type="submit">Enviar solicitação <span aria-hidden="true">↗</span></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}