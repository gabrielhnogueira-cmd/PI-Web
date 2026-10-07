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

O front-end utiliza React, TypeScript, Vite e Tailwind CSS. A API utiliza Node.js 22, Express e SQLite (`sqlite3` 5.1.7), compatível com a imagem Linux do Azure App Service.

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

## API e testes

A API Express oferece CRUD de produtos em `/api/produtos` e verificação da conexão SQLite em `/api/health`. Na primeira inicialização, a tabela é criada e recebe dados de demonstração caso esteja vazia. O caminho do banco pode ser configurado pela variável `DB_PATH`.

```bash
npm start
```

Em outro terminal, execute o ciclo CRUD automatizado:

```bash
npm run test:api
```

Para demonstrar as requisições no Insomnia, importe `insomnia/PI-Web-API.json`, execute Health, Listar, Criar, Consultar, Atualizar e Excluir nessa ordem. A resposta da criação salva o ID no ambiente para as requisições seguintes.

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/api/health` | Estado da API e do SQLite |
| GET | `/api/produtos` | Lista produtos |
| GET | `/api/produtos/:id` | Consulta um produto |
| POST | `/api/produtos` | Cria produto (`201`) |
| PUT | `/api/produtos/:id` | Atualiza todos os campos editáveis |
| DELETE | `/api/produtos/:id` | Exclui produto (`204`) |

API publicada no Azure App Service (plano B1, Brazil South): [pi-web-gramanse-api-2026.azurewebsites.net](https://pi-web-gramanse-api-2026-dagge8hbemava7bu.brazilsouth-01.azurewebsites.net). A verificação `/api/health` confirma a conexão SQLite; o CRUD foi exercitado remotamente. O custo estimado pelo portal é US$ 14,60/mês enquanto o plano estiver ativo.

Os detalhes do deploy, persistência do banco e captura de logs estão em [docs/azure-app-service.md](docs/azure-app-service.md).

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
