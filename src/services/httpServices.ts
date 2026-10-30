import type { Order, Quote, Services, Ticket, User } from "./types";
import { ApiError, createApiClient } from "./http";
import type { Product } from "../data/catalog";

const USER_KEY = "gramanse.session";

interface ApiProduct { id: number; name: string; segmentId: string; material: string; description: string; price: number | null }
interface AuthResponse { token: string; user: User }

const toProduct = ({ price, ...product }: ApiProduct): Product => ({ ...product, ...(price === null ? {} : { price }) });
const toBody = (input: Omit<Product, "id">) => ({ ...input, price: input.price ?? null });

// Todas as telas falam com a API Express; contas, pedidos, orçamentos, chamados e produtos ficam no SQLite.
export function createHttpServices(baseUrl: string): Services {
  const api = createApiClient(baseUrl);

  const cachedUser = (): User | null => {
    if (!api.hasToken()) return null;
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null") as User | null; } catch { return null; }
  };
  const startSession = ({ token, user }: AuthResponse) => {
    api.setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  };

  return {
    account: {
      current: cachedUser,
      async refresh() {
        if (!api.hasToken()) return null;
        try {
          const { user } = await api.request<{ user: User }>("/auth/me");
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          return user;
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) { api.setToken(null); return null; }
          return cachedUser();
        }
      },
      async register(input) {
        return startSession(await api.request<AuthResponse>("/auth/register", { method: "POST", body: input }));
      },
      async login(input) {
        return startSession(await api.request<AuthResponse>("/auth/login", { method: "POST", body: input }));
      },
      logout() {
        void api.request("/auth/logout", { method: "POST" }).catch(() => undefined);
        api.setToken(null);
      },
    },
    orders: {
      create: (_user, lines, note) => api.request<Order>("/pedidos", {
        method: "POST",
        body: { lines: lines.map(({ productId, qty }) => ({ productId, qty })), note },
      }),
      list: () => api.request<Order[]>("/pedidos"),
      updateStatus: (id, status) => api.request<Order>(`/pedidos/${id}/status`, { method: "PATCH", body: { status } }),
    },
    quotes: {
      create: (input) => api.request<Quote>("/orcamentos", { method: "POST", body: input }),
      list: () => api.request<Quote[]>("/orcamentos"),
      respond: (id, input) => api.request<Quote>(`/orcamentos/${id}/resposta`, { method: "PATCH", body: input }),
      updateStatus: (id, status) => api.request<Quote>(`/orcamentos/${id}/status`, { method: "PATCH", body: { status } }),
      decide: (id, status) => api.request<Quote>(`/orcamentos/${id}/decisao`, { method: "PATCH", body: { status } }),
    },
    support: {
      open: (_user, input) => api.request<Ticket>("/chamados", { method: "POST", body: input }),
      list: () => api.request<Ticket[]>("/chamados"),
      updateStatus: (id, status) => api.request<Ticket>(`/chamados/${id}/status`, { method: "PATCH", body: { status } }),
    },
    catalog: {
      async list() { return (await api.request<ApiProduct[]>("/produtos")).map(toProduct); },
      async create(input) { return toProduct(await api.request<ApiProduct>("/produtos", { method: "POST", body: toBody(input) })); },
      async update(id, input) { return toProduct(await api.request<ApiProduct>(`/produtos/${id}`, { method: "PUT", body: toBody(input) })); },
      remove: (id) => api.request<void>(`/produtos/${id}`, { method: "DELETE" }),
    },
  };
}