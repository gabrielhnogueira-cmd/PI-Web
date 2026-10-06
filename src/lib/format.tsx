const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const brl = (value: number) => currency.format(value);
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");