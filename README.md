# PI-Web

Aplicação web em desenvolvimento para a **Cerâmica Gramanse**, com o objetivo de apresentar a empresa e organizar a visualização de seus produtos e segmentos de atuação.

O projeto busca facilitar o acesso dos clientes às informações sobre as peças cerâmicas produzidas pela empresa e, futuramente, proporcionar uma forma mais prática e organizada de realizar consultas e solicitações de orçamento.

## Sobre o projeto

A proposta do projeto é desenvolver uma aplicação web para a Cerâmica Gramanse, reunindo informações institucionais e uma apresentação organizada de seus produtos.

Atualmente, o projeto conta com uma interface inicial em React, TypeScript e Tailwind CSS. A aplicação apresenta informações sobre a empresa, seus segmentos de atuação, produtos simulados e formas de contato.

Os principais segmentos apresentados na interface atual são:

* Peças refratárias para fundição;
* Peças para laboratório;
* Peças para testes de carbono e enxofre;
* Peças para aquários.

## Objetivo

O objetivo deste projeto é desenvolver uma aplicação web que permita apresentar e organizar o catálogo de produtos cerâmicos da empresa, facilitando o acesso dos clientes às informações sobre as peças e suas aplicações.

Além disso, a aplicação deverá contribuir para melhorar a comunicação entre a empresa e seus clientes, possibilitando consultas e solicitações de orçamento de forma mais prática e organizada.

## Disciplinas envolvidas

O desenvolvimento do projeto envolve conhecimentos das seguintes disciplinas:

* Computação em Nuvem;
* Desenvolvimento de Interfaces de Usuário para Web;
* Integração de Dados;
* Tecnologias para Desenvolvimento Web.

As funcionalidades e tecnologias do projeto serão desenvolvidas e ampliadas conforme o avanço das disciplinas e das etapas de desenvolvimento da aplicação.

## Tecnologias utilizadas

O front-end utiliza React, TypeScript, Vite e Tailwind CSS. O servidor da API existente utiliza Node.js e Express, com SQLite para persistência.

## Estrutura

```text
PI-Web/
├── api/                    # Servidor Express e rotas da API
├── assets/images/          # Imagens locais da interface
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   ├── data/catalog.ts     # Tipos e dados simulados do catálogo
│   ├── App.tsx             # Estado e composição da página
│   ├── index.css           # Tailwind e estilos globais
│   └── main.tsx            # Entrada React
├── index.html              # Documento de entrada do Vite
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

Os produtos apresentados são dados simulados. O formulário de orçamento demonstra o fluxo visual e ainda não envia informações para a API.

## Como iniciar

Instale as dependências do projeto:

```bash
npm install
```

Inicie a interface React com Vite:

```bash
npm run dev
```

Para verificar a versão de produção:

```bash
npm run build
npm run preview
```

O servidor da API continua disponível pelo comando `npm start`.

## Próximos passos

As próximas etapas do projeto serão definidas e desenvolvidas de acordo com os objetivos da aplicação e com os conteúdos abordados nas disciplinas envolvidas.

Entre os objetivos futuros do projeto estão:

1. Ampliar a apresentação e organização do catálogo de produtos;
2. Desenvolver recursos que facilitem a consulta de informações pelos clientes;
3. Implementar uma forma mais organizada para solicitações de orçamento;
4. Realizar a integração de dados necessária para o funcionamento da aplicação;
5. Incorporar recursos relacionados à computação em nuvem;
6. Continuar aprimorando a interface e a experiência do usuário.

## Status do projeto

O projeto encontra-se em desenvolvimento. A interface inicial em React já contempla navegação responsiva, filtro de produtos simulados e formulário demonstrativo de orçamento.

As funcionalidades serão adicionadas progressivamente conforme o desenvolvimento do projeto.
