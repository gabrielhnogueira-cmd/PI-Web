// Silhuetas simples das peças, usadas enquanto não há foto real (campo imageUrl).
interface PieceArtProps { segmentId: string; className?: string }

export default function PieceArt({ segmentId, className = "" }: PieceArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor" aria-hidden="true">
      {segmentId === "fundicao" && <path d="M16 104V56a44 44 0 0 1 88 0v48H78V56a18 18 0 0 0-36 0v48z" />}
      {segmentId === "laboratorio" && <path d="M30 24h60l-8 62a22 22 0 0 1-44 0z" />}
      {segmentId === "analise" && <path d="M10 50h100l-10 26a14 14 0 0 1-13 9H33a14 14 0 0 1-13-9z" />}
      {segmentId !== "fundicao" && segmentId !== "laboratorio" && segmentId !== "analise" && (
        <>
          <mask id="poros">
            <rect width="120" height="120" fill="white" />
            <circle cx="48" cy="48" r="7" fill="black" />
            <circle cx="74" cy="58" r="9" fill="black" />
            <circle cx="52" cy="78" r="6" fill="black" />
            <circle cx="82" cy="34" r="4" fill="black" />
          </mask>
          <circle cx="60" cy="60" r="46" mask="url(#poros)" />
        </>
      )}
    </svg>
  );
}