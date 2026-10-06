export interface Segment {
  id: string;
  title: string;
  description: string;
  featured?: boolean; // bloco âncora do bento (o 1º da lista)
  imageUrl?: string;  // foto opcional do bloco, ex.: "/assets/images/fundicao.webp"
}

export interface Product {
  id: number;
  name: string;
  segmentId: string;
  material: string;
  description: string;
  price?: number; // opcional: sem preço, a loja mostra o pedido como "sob confirmação"
}

export const segments: Segment[] = [
  { id: "fundicao", title: "Peças refratárias para fundição", description: "Para fundições e o setor metalúrgico.", featured: true },
  { id: "laboratorio", title: "Peças para laboratório", description: "Cerâmicas técnicas para uso laboratorial." },
  { id: "analise", title: "Testes de carbono e enxofre", description: "Peças utilizadas em ensaios de análise." },
  { id: "aquario", title: "Peças para aquários", description: "Componentes cerâmicos para aquarismo." },
];

export const products: Product[] = [
  { id: 1, name: "Canal de vazamento", segmentId: "fundicao", material: "Refratário de alta alumina", description: "Componente para condução do metal líquido durante a operação de fundição." },
  { id: 2, name: "Bucha cerâmica", segmentId: "fundicao", material: "Cerâmica técnica", description: "Peça moldada para isolamento e proteção em processos metalúrgicos." },
  { id: 3, name: "Cadinho de análise", segmentId: "laboratorio", material: "Cerâmica para laboratório", description: "Recipiente para procedimentos de análise em laboratório." },
  { id: 4, name: "Barqueta de combustão", segmentId: "analise", material: "Cerâmica refratária", description: "Suporte cerâmico utilizado na preparação de amostras para análise." },
  { id: 5, name: "Mídia biológica", segmentId: "aquario", material: "Cerâmica porosa", description: "Elemento cerâmico desenvolvido para compor sistemas de filtragem de aquários." },
];