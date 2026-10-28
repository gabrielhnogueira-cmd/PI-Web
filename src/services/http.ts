const TOKEN_KEY = "gramanse.token";
const USER_KEY = "gramanse.session";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface ApiClient {
  request<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T>;
  hasToken(): boolean;
  setToken(token: string | null): void;
}

export function createApiClient(baseUrl: string): ApiClient {
  return {
    hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
    setToken(token) {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
    },
    async request<T>(path: string, { method = "GET", body }: { method?: string; body?: unknown } = {}) {
      const token = localStorage.getItem(TOKEN_KEY);
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch {
        throw new ApiError("Não foi possível falar com o servidor. Tente novamente.", 0);
      }

      if (response.status === 204) return undefined as T;
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const fields = data?.campos ? Object.values<string>(data.campos) : [];
        throw new ApiError(fields[0] ?? data?.erro ?? `Erro ${response.status}`, response.status);
      }
      return data as T;
    },
  };
}
