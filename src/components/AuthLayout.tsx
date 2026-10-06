import type { ReactNode } from "react";
import PieceArt from "./PieceArt";

interface AuthLayoutProps { title: string; intro: string; art: string; children: ReactNode }

export default function AuthLayout({ title, intro, art, children }: AuthLayoutProps) {
  return (
    <section className="mx-auto grid w-[min(100%-2rem,1160px)] gap-12 pb-28 pt-10 sm:pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div className="relative mx-auto hidden w-full max-w-sm lg:block">
        <div className="absolute -right-8 top-1/4 h-32 w-32 rounded-full bg-copper" aria-hidden="true" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-carvao">
          <PieceArt segmentId={art} className="absolute inset-x-0 bottom-0 mx-auto h-3/5 text-copper" />
        </div>
      </div>
      <div className="max-w-md">
        <h1 className="m-0 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
        <p className="mb-8 mt-3 text-base leading-relaxed text-soft">{intro}</p>
        {children}
      </div>
    </section>
  );
}