import type { Product, Segment } from "../data/catalog";

export interface QuoteInput { name: string; email: string; product: string; details?: string }

export interface CatalogService {
  listSegments(): Promise<Segment[]>;
  listProducts(): Promise<Product[]>;
  sendQuote(input: QuoteInput): Promise<void>;
}

// Versão HTTP; o catalog.ts atual vira uma versão "estática" da mesma interface
export function createHttpCatalogService(baseUrl = "/api"): CatalogService {
  const json = async <T,>(res: Response): Promise<T> => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };
  return {
    listSegments: () => fetch(`${baseUrl}/segmentos`).then((r) => json<Segment[]>(r)),
    listProducts: () => fetch(`${baseUrl}/produtos`).then((r) => json<Product[]>(r)),
    sendQuote: async (input) => {
      const res = await fetch(`${baseUrl}/orcamentos`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
  };
}