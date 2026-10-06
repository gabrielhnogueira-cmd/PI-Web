import { useSyncExternalStore, type AnchorHTMLAttributes } from "react";

// Roteador por hash (#/loja): funciona em qualquer hospedagem, sem configurar servidor.
const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
const readPath = () => window.location.hash.replace(/^#/, "") || "/";

export const usePath = () => useSyncExternalStore(subscribe, readPath);
export const navigate = (to: string) => { window.location.hash = to; };

type LinkProps = { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;
export function Link({ to, ...props }: LinkProps) {
  return <a href={`#${to}`} {...props} />;
}