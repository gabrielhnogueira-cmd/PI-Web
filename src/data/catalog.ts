export interface Segment {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  segmentId: string;
  material: string;
  description: string;
}

export const segments: Segment[] = [
  {
    id: "fundicao",
    number: "01",
    title: "Peças refratárias para fundição",
    description: "Para fundições e o setor metalúrgico.",
  },
  {
    id: "laboratorio",
    number: "02",
    title: "Peças para laboratório",
    description: "Cerâmicas técnicas para uso laboratorial.",
  },
  {
    id: "analise",
    number: "03",
    title: "Testes de carbono e enxofre",
    description: "Peças utilizadas em ensaios de análise.",
  },
  {
    id: "aquario",
    number: "04",
    title: "Peças para aquários",
    description: "Componentes cerâmicos para aquarismo.",
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Canal de vazamento",
    segmentId: "fundicao",
    material: "Refratário de alta alumina",
    description: "Componente para condução do metal líquido durante a operação de fundição.",
  },
  {
    id: 2,
    name: "Bucha cerâmica",
    segmentId: "fundicao",
    material: "Cerâmica técnica",
    description: "Peça moldada para isolamento e proteção em processos metalúrgicos.",
  },
  {
    id: 3,
    name: "Cadinho de análise",
    segmentId: "laboratorio",
    material: "Cerâmica para laboratório",
    description: "Recipiente para procedimentos de análise em laboratório.",
  },
  {
    id: 4,
    name: "Barqueta de combustão",
    segmentId: "analise",
    material: "Cerâmica refratária",
    description: "Suporte cerâmico utilizado na preparação de amostras para análise.",
  },
  {
    id: 5,
    name: "Mídia biológica",
    segmentId: "aquario",
    material: "Cerâmica porosa",
    description: "Elemento cerâmico desenvolvido para compor sistemas de filtragem de aquários.",
  },
];