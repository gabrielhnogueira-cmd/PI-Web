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
export interface Services { account: AccountService; orders: OrderService; support: SupportService; catalog: CatalogService }