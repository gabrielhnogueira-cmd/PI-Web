import { useState } from "react";
import CompanySection from "./components/CompanySection";
import HeroSection from "./components/HeroSection";
import ProductSection from "./components/ProductSection";
import RequestDialog from "./components/RequestDialog";
import SegmentSection from "./components/SegmentSection";
import SiteHeader from "./components/SiteHeader";
import { products, segments } from "./data/catalog";

export default function App() {
  const [selectedSegment, setSelectedSegment] = useState(segments[0].id);
  const [requestProduct, setRequestProduct] = useState("Peça técnica personalizada");
  const [requestOpen, setRequestOpen] = useState(false);

  const openRequest = (productName = "Peça técnica personalizada") => {
    setRequestProduct(productName);
    setRequestOpen(true);
  };

  return (
    <div className="min-h-screen overflow-hidden text-paper">
      <SiteHeader onRequest={() => openRequest()} />
      <main>
        <HeroSection onRequest={() => openRequest()} />
        <SegmentSection segments={segments} selectedSegment={selectedSegment} onSelect={setSelectedSegment} />
        <ProductSection products={products} segments={segments} selectedSegment={selectedSegment} onSelectSegment={setSelectedSegment} onRequest={openRequest} />
        <CompanySection />
        <section className="mx-auto w-[min(100%-2rem,1160px)] py-20 sm:py-28" id="orcamento">
          <p className="eyebrow">Vamos conversar</p>
          <h2 className="section-title">Precisa de uma<br /><em>peça específica?</em></h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">Envie sua especificação e nossa equipe retorna com o orçamento e as orientações técnicas.</p>
          <button className="action-button mt-5" type="button" onClick={() => openRequest()}>Solicitar orçamento <span aria-hidden="true">↗</span></button>
        </section>
      </main>
      <footer className="border-t border-line bg-[#191916]" id="contato">
        <div className="mx-auto grid w-[min(100%-2rem,1160px)] gap-8 py-9 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <a className="font-display text-lg font-bold tracking-[0.08em] text-paper no-underline" href="#inicio"><span className="text-copper">G</span>RAMANSE</a>
            <p className="mb-0 mt-2 text-sm text-muted">Refratários técnicos para a indústria de base.</p>
          </div>
          <div className="flex flex-col gap-2 font-display text-xs uppercase tracking-[0.08em]">
            <span className="mb-1 text-copper">Contato</span>
            <a className="text-paper no-underline hover:text-copper" href="mailto:contato@gramanse.com.br">contato@gramanse.com.br</a>
            <a className="text-paper no-underline hover:text-copper" href="tel:+5500000000000">(00) 0000-0000</a>
          </div>
          <p className="mb-0 border-t border-line pt-5 font-display text-[0.65rem] uppercase tracking-[0.1em] text-muted sm:col-span-2">© {new Date().getFullYear()} Cerâmica Gramanse Ltda.</p>
        </div>
      </footer>
      {requestOpen && <RequestDialog initialProduct={requestProduct} onClose={() => setRequestOpen(false)} />}
    </div>
  );
}