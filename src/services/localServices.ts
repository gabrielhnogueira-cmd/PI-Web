import type { Order, Services, Ticket, User } from "./types";

type StoredUser = User & { passHash: string };

const KEYS = { users: "gramanse.users", session: "gramanse.session", orders: "gramanse.orders", tickets: "gramanse.tickets" };

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

async function hash(text: string) {
  const bytes = new TextEncoder().encode(text);
  if (!globalThis.crypto?.subtle) return Array.from(bytes, (b) => b.toString(16)).join("");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const publicUser = ({ id, name, email, role, company }: StoredUser): User => ({ id, name, email, role, company });

// Conta de demonstração da equipe: e-mail equipe@gramanse.com.br / senha gramanse-demo
const SEED = { id: "equipe-demo", name: "Equipe Gramanse", email: "equipe@gramanse.com.br", role: "equipe" as const };

// ATENÇÃO: protótipo. Tudo fica no navegador (localStorage) e não é seguro.
// Autenticação real precisa de servidor.
export function createLocalServices(): Services {
  const allUsers = async () => {
    const list = read<StoredUser[]>(KEYS.users, []);
    if (!list.some((u) => u.id === SEED.id)) {
      list.push({ ...SEED, passHash: await hash("gramanse-demo") });
      write(KEYS.users, list);
    }
    return list;
  };

  return {
    account: {
      current: () => read<User | null>(KEYS.session, null),
      async register({ name, email, company, password }) {
        const list = await allUsers();
        const mail = email.trim().toLowerCase();
        if (list.some((u) => u.email === mail)) throw new Error("Este e-mail já tem cadastro. Tente entrar.");
        const user: StoredUser = { id: uid("cli"), name: name.trim(), email: mail, company: company?.trim() || undefined, role: "cliente", passHash: await hash(password) };
        write(KEYS.users, [...list, user]);
        write(KEYS.session, publicUser(user));
        return publicUser(user);
      },
      async login({ email, password, role }) {
        const found = (await allUsers()).find((u) => u.email === email.trim().toLowerCase() && u.role === role);
        if (!found || found.passHash !== (await hash(password))) throw new Error("E-mail ou senha não conferem.");
        write(KEYS.session, publicUser(found));
        return publicUser(found);
      },
      logout: () => localStorage.removeItem(KEYS.session),
    },
    orders: {
      async create(user, lines, note) {
        const order: Order = { id: uid("ped"), userId: user.id, userName: user.name, lines, note, status: "Aguardando confirmação", createdAt: new Date().toISOString() };
        write(KEYS.orders, [order, ...read<Order[]>(KEYS.orders, [])]);
        return order;
      },
      async list(user) {
        const all = read<Order[]>(KEYS.orders, []);
        return user.role === "equipe" ? all : all.filter((o) => o.userId === user.id);
      },
    },
    support: {
      async open(user, { subject, orderId, message }) {
        const ticket: Ticket = { id: uid("chm"), userId: user.id, userName: user.name, subject, orderId, message, status: "Aberto", createdAt: new Date().toISOString() };
        write(KEYS.tickets, [ticket, ...read<Ticket[]>(KEYS.tickets, [])]);
        return ticket;
      },
      async list(user) {
        const all = read<Ticket[]>(KEYS.tickets, []);
        return user.role === "equipe" ? all : all.filter((t) => t.userId === user.id);
      },
    },
  };
}