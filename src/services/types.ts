import type { Product } from "../data/catalog";

export type Role = "cliente" | "equipe";

export interface User { id: string; name: string; email: string; role: Role; company?: string }
export interface CartLine { productId: number; qty: number }
export interface OrderLine { productId: number; name: string; qty: number }

export interface Order {
  id: string; userId: string; userName: string; lines: OrderLine[]; note?: string;
  status: "Aguardando confirmação" | "Em produção" | "Enviado"; createdAt: string;
}
export interface Ticket {
  id: string; userId: string; userName: string; subject: string; orderId?: string; message: string;
  status: "Aberto" | "Respondido" | "Encerrado"; createdAt: string;
}

export type QuoteStatus = "Recebido" | "Em análise" | "Enviado" | "Aprovado" | "Recusado";
export interface QuoteLine { productId?: number; name: string; qty: number; specs?: string }
export interface Quote {
  id: string; userId: string; userName: string; userEmail: string; company?: string; cnpj?: string; phone?: string;
  desiredDeadline?: string; message?: string; lines: QuoteLine[]; status: QuoteStatus;
  responseNote?: string; responseTotal?: number; validUntil?: string; createdAt: string; updatedAt?: string;
}
export interface QuoteInput {
  lines: QuoteLine[]; company?: string; cnpj?: string; phone?: string; desiredDeadline?: string; message?: string;
}
export interface QuoteResponseInput { responseNote?: string; responseTotal?: number; validUntil?: string }

export interface AccountService {
  current(): User | null;
  refresh(): Promise<User | null>;
  register(input: { name: string; email: string; company?: string; password: string }): Promise<User>;
  login(input: { email: string; password: string; role: Role }): Promise<User>;
  logout(): void;
}
export interface OrderService {
  create(user: User, lines: OrderLine[], note?: string): Promise<Order>;
  list(user: User): Promise<Order[]>;
  updateStatus(orderId: string, status: Order["status"]): Promise<Order>;
}
export interface QuoteService {
  create(input: QuoteInput): Promise<Quote>;
  list(user: User): Promise<Quote[]>;
  /** Equipe: responde com valor/validade; o orçamento passa a "Enviado". */
  respond(quoteId: string, input: QuoteResponseInput): Promise<Quote>;
  /** Equipe: move o orçamento entre as etapas. */
  updateStatus(quoteId: string, status: QuoteStatus): Promise<Quote>;
  /** Cliente: aprova ou recusa um orçamento "Enviado". */
  decide(quoteId: string, status: "Aprovado" | "Recusado"): Promise<Quote>;
}
export interface SupportService {
  open(user: User, input: { subject: string; orderId?: string; message: string }): Promise<Ticket>;
  list(user: User): Promise<Ticket[]>;
  updateStatus(ticketId: string, status: Ticket["status"]): Promise<Ticket>;
}
export interface CatalogService {
  list(): Promise<Product[]>;
  create(input: Omit<Product, "id">): Promise<Product>;
  update(id: number, input: Omit<Product, "id">): Promise<Product>;
  remove(id: number): Promise<void>;
}
// Contrato único que as telas recebem por props; a implementação usa a API Express/SQLite.
export interface Services { account: AccountService; orders: OrderService; quotes: QuoteService; support: SupportService; catalog: CatalogService }