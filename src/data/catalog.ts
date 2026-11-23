import canalVazamentoImage from "../../assets/images/canal-vazamento.png";
import buchaCeramicaImage from "../../assets/images/bucha-ceramica.png";
import cadinhoAnaliseImage from "../../assets/images/cadinho-analise.png";
import barquetaCombustaoImage from "../../assets/images/barqueta-combustao.png";
import midiaBiologicaImage from "../../assets/images/midia-biologica.png";
import cadinhoArgilaGrafitaImage from "../../assets/images/cadinho-argila.png";
import copoVazamentoImage from "../../assets/images/copo-vazamento.png";
import tuboProtecaoTermoparImage from "../../assets/images/tubo-termopar.png";
import filtroCeramicoEspumaImage from "../../assets/images/filtro-espuma.png";
import placaRefratariaImage from "../../assets/images/placa-refrataria.png";
import cadinhoPorcelanaImage from "../../assets/images/cadinho-porcelana.png";
import capsulaEvaporacaoImage from "../../assets/images/capsula-evaporacao.png";
import almofarizImage from "../../assets/images/almofariz-pistilo.png";
import tuboCombustaoImage from "../../assets/images/tubo-combustao.png";
import cadinhoAnalisadorImage from "../../assets/images/cadinho-analisador.png";
import cadinhoPreImage from "../../assets/images/cadinho-pre-queimado.png";
import tampaCadinhoImage from "../../assets/images/tampa-cadinho.png";
import aneisFiltragemImage from "../../assets/images/aneis-filtragem.png";
import bolasPorosasImage from "../../assets/images/bolas-porosas.png";
import midiaCeramicaImage from "../../assets/images/midia-ceramica.png";
import cavernaAquarioImage from "../../assets/images/caverna-aquario.png";
import tuboEsconderijoImage from "../../assets/images/tubo-esconderijo.png";

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
  imageUrl?: string;
  price?: number; // opcional: sem preço, a loja mostra o pedido como "sob confirmação"
}

export const segments: Segment[] = [
  { id: "fundicao", title: "Peças refratárias para fundição", description: "Para fundições e o setor metalúrgico.", featured: true },
  { id: "laboratorio", title: "Peças para laboratório", description: "Cerâmicas técnicas para uso laboratorial." },
  { id: "analise", title: "Testes de carbono e enxofre", description: "Peças utilizadas em ensaios de análise." },
  { id: "aquario", title: "Peças para aquários", description: "Componentes cerâmicos para aquarismo." },
];

// Os ids 1–22 seguem a ordem de inserção do banco (api/database.js).
// Preços, materiais e descrições são valores de partida: validar com a Gramanse.
export const products: Product[] = [
  { id: 1, name: "Canal de vazamento", segmentId: "fundicao", material: "Refratário de alta alumina", description: "Componente para condução do metal líquido durante a operação de fundição.", imageUrl: canalVazamentoImage, price: 120.0 },
  { id: 2, name: "Bucha cerâmica", segmentId: "fundicao", material: "Cerâmica técnica", description: "Peça moldada para isolamento e proteção em processos metalúrgicos.", imageUrl: buchaCeramicaImage, price: 38.0 },
  { id: 3, name: "Cadinho de análise", segmentId: "laboratorio", material: "Cerâmica para laboratório", description: "Recipiente para procedimentos de análise em laboratório.", imageUrl: cadinhoAnaliseImage, price: 16.5 },
  { id: 4, name: "Barqueta de combustão", segmentId: "analise", material: "Cerâmica refratária", description: "Suporte cerâmico utilizado na preparação de amostras para análise.", imageUrl: barquetaCombustaoImage, price: 18.5 },
  { id: 5, name: "Mídia biológica", segmentId: "aquario", material: "Cerâmica porosa", description: "Elemento cerâmico desenvolvido para compor sistemas de filtragem de aquários.", imageUrl: midiaBiologicaImage, price: 34.9 },

  { id: 6, name: "Cadinho de argila-grafita 5 kg", segmentId: "fundicao", material: "Argila-grafita", description: "Cadinho para fusão e manutenção de metais em fornos de fundição. Capacidade nominal de 5 kg; formatos e limites de temperatura sob consulta.", imageUrl: cadinhoArgilaGrafitaImage, price: 189.0 },
  { id: 7, name: "Copo de vazamento refratário", segmentId: "fundicao", material: "Refratário sílico-aluminoso", description: "Funil moldado para alimentar o molde durante o vazamento do metal líquido.", imageUrl: copoVazamentoImage, price: 42.0 },
  { id: 8, name: "Tubo de proteção para termopar", segmentId: "fundicao", material: "Alumina sinterizada", description: "Protege o sensor de temperatura em fornos e banhos metálicos. Comprimentos e diâmetros sob consulta.", imageUrl: tuboProtecaoTermoparImage, price: 78.0 },
  { id: 9, name: "Filtro cerâmico de espuma 50×50×22 mm", segmentId: "fundicao", material: "Espuma cerâmica", description: "Retém impurezas do metal líquido no sistema de canais, melhorando a qualidade da peça fundida.", imageUrl: filtroCeramicoEspumaImage, price: 14.5 },
  { id: 10, name: "Placa refratária 200×200×20 mm", segmentId: "fundicao", material: "Refratário de alta alumina", description: "Placa para revestimento e apoio em fornos e estufas de alta temperatura.", imageUrl: placaRefratariaImage, price: 96.0 },

  { id: 11, name: "Cadinho de porcelana 30 mL", segmentId: "laboratorio", material: "Porcelana", description: "Cadinho para calcinação e secagem de amostras em mufla.", imageUrl: cadinhoPorcelanaImage, price: 12.9 },
  { id: 12, name: "Cápsula de evaporação 100 mL", segmentId: "laboratorio", material: "Porcelana", description: "Para evaporação de soluções e concentração de amostras.", imageUrl: capsulaEvaporacaoImage, price: 24.0 },
  { id: 13, name: "Almofariz com pistilo 100 mm", segmentId: "laboratorio", material: "Porcelana", description: "Conjunto para trituração e homogeneização de amostras sólidas.", imageUrl: almofarizImage, price: 58.0 },
  { id: 14, name: "Tubo de combustão de alumina", segmentId: "laboratorio", material: "Alumina", description: "Tubo para fornos tubulares em ensaios a alta temperatura. Dimensões sob consulta.", imageUrl: tuboCombustaoImage, price: 165.0 },

  { id: 15, name: "Cadinho para analisador C/S (pacote com 25)", segmentId: "analise", material: "Cerâmica refratária", description: "Cadinho para análise de carbono e enxofre por combustão. Confirme o modelo do equipamento antes do pedido.", imageUrl: cadinhoAnalisadorImage, price: 185.0 },
  { id: 16, name: "Cadinho C/S pré-queimado (pacote com 100)", segmentId: "analise", material: "Cerâmica refratária pré-queimada", description: "Cadinho queimado previamente, pronto para uso nos ensaios de carbono e enxofre. Confirme o modelo do equipamento antes do pedido.", imageUrl: cadinhoPreImage, price: 590.0 },
  { id: 17, name: "Tampa para cadinho C/S (pacote com 25)", segmentId: "analise", material: "Cerâmica refratária", description: "Tampa cerâmica para cadinhos de análise de carbono e enxofre.", imageUrl: tampaCadinhoImage, price: 150.0 },

  { id: 18, name: "Anéis cerâmicos de filtragem (1 kg)", segmentId: "aquario", material: "Cerâmica porosa", description: "Meio filtrante poroso para colonização de bactérias benéficas em filtros biológicos.", imageUrl: aneisFiltragemImage, price: 29.9 },
  { id: 19, name: "Bolas cerâmicas porosas (1 kg)", segmentId: "aquario", material: "Cerâmica porosa", description: "Esferas porosas para filtragem biológica em aquários e lagos ornamentais.", imageUrl: bolasPorosasImage, price: 34.9 },
  { id: 20, name: "Mídia cerâmica sinterizada (5 kg)", segmentId: "aquario", material: "Cerâmica porosa sinterizada", description: "Embalagem econômica de mídia filtrante para aquários de maior volume.", imageUrl: midiaCeramicaImage, price: 119.0 },
  { id: 21, name: "Caverna cerâmica para aquário (P)", segmentId: "aquario", material: "Cerâmica", description: "Esconderijo cerâmico para peixes, tamanho pequeno.", imageUrl: cavernaAquarioImage, price: 39.9 },
  { id: 22, name: "Tubo cerâmico esconderijo", segmentId: "aquario", material: "Cerâmica", description: "Tubo cerâmico usado como abrigo para peixes de fundo.", imageUrl: tuboEsconderijoImage, price: 24.9 },
];