import type { Segment } from "../data/catalog";

interface SegmentSectionProps {
  segments: Segment[];
  selectedSegment: string;
  onSelect: (segmentId: string) => void;
}

export default function SegmentSection({ segments, selectedSegment, onSelect }: SegmentSectionProps) {
  return (
    <section className="mx-auto w-[min(100%-2rem,1160px)] py-20 sm:py-28" id="solucoes">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Segmentos atendidos</p>
          <h2 className="section-title">Soluções cerâmicas<br /><em>para cada aplicação.</em></h2>
        </div>
        <p className="mb-0 max-w-xs text-sm leading-relaxed text-muted">Selecione o segmento de atuação e encontre a linha de produto correspondente.</p>
      </div>
      <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {segments.map((segment) => {
          const isSelected = selectedSegment === segment.id;
          return (
            <button
              className={`group relative min-h-64 border-b border-line p-5 text-left transition-colors sm:border-r lg:min-h-72 ${isSelected ? "bg-panel" : "hover:bg-panel"}`}
              key={segment.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(segment.id)}
            >
              <span className="font-display text-xs tracking-[0.1em] text-muted">{segment.number}</span>
              <h3 className="mt-16 max-w-[14rem] font-display text-xl font-bold uppercase leading-tight text-paper">{segment.title}</h3>
              <p className="mb-0 mt-3 max-w-[14rem] font-display text-xs uppercase tracking-[0.08em] text-muted">{segment.description}</p>
              <span className={`absolute bottom-5 right-5 text-lg transition-colors ${isSelected ? "text-copper" : "text-muted group-hover:text-copper"}`} aria-hidden="true">↗</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}