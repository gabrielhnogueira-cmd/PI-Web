# PI-Web

Aplicação web em desenvolvimento para a **Cerâmica Gramanse**, com o objetivo de apresentar a empresa e organizar a visualização de seus produtos e segmentos de atuação.

O projeto busca facilitar o acesso dos clientes às informações sobre as peças cerâmicas produzidas pela empresa e, futuramente, proporcionar uma forma mais prática e organizada de realizar consultas e solicitações de orçamento.

## Sobre o projeto

A proposta do projeto é desenvolver uma aplicação web para a Cerâmica Gramanse, reunindo informações institucionais e uma apresentação organizada de seus produtos.

Atualmente, o projeto conta com uma interface em React, TypeScript e Tailwind CSS, integrada à API para consultar o catálogo, autenticar contas, registrar pedidos e chamados. Os segmentos e o formulário de orçamento ainda são demonstrativos.

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

Usuários, pedidos, chamados e produtos ficam no banco SQLite e são acessados pela API (`/api/auth`, `/api/pedidos`, `/api/chamados`, `/api/produtos`). Tabelas: `usuarios`, `sessoes`, `pedidos`, `pedido_itens`, `chamados` e `produtos`. O formulário de orçamento ainda demonstra apenas o fluxo visual.

## Painel administrativo

Acesse `#/admin/entrar`. A conta da equipe é criada na inicialização da API a partir das variáveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 8 caracteres). O painel permite cadastrar, editar e excluir produtos e preços, consultar pedidos e chamados e alterar seus status. Escritas em `/api/produtos` exigem token de login da equipe (`Authorization: Bearer <token>`, obtido em `POST /api/auth/login`); a coleção Insomnia precisa desse token.

No front-end, `VITE_API_URL` define a URL da API (padrão `/api`, com proxy do Vite para `http://localhost:3000`).

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

A API Express oferece autenticação, CRUD de produtos, pedidos e chamados, além da verificação da conexão SQLite. Na primeira inicialização, as tabelas são criadas e o catálogo recebe dados de demonstração somente se estiver vazio. O caminho do banco pode ser configurado pela variável `DB_PATH`; para criar a conta da equipe, configure `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

```bash
npm start
```

Em outro terminal, execute o ciclo CRUD automatizado:

```bash
npm run test:api
```

Para demonstrar as requisições no Insomnia, importe `insomnia/PI-Web-API.json` e configure `Base Environment` com `base_url=http://localhost:3000` e a senha da equipe. A coleção inclui login, cadastro, produtos, pedidos, chamados, permissões e requisições inválidas. O roteiro de validação, resultados esperados e tratamento de inconsistências está em [docs/qualidade-dados.md](docs/qualidade-dados.md).

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/api/health` | Estado da API e do SQLite |
| POST | `/api/auth/register` | Cadastra cliente |
| POST | `/api/auth/login` | Autentica e retorna token Bearer |
| GET | `/api/auth/me` | Consulta usuário da sessão |
| POST | `/api/auth/logout` | Encerra sessão |
| GET/POST | `/api/produtos` | Lista produtos; equipe cria produto |
| GET/PUT/DELETE | `/api/produtos/:id` | Consulta, atualiza ou exclui produto; escrita exige equipe |
| GET/POST | `/api/pedidos` | Lista pedidos permitidos ao usuário ou cria pedido |
| PATCH | `/api/pedidos/:id/status` | Equipe atualiza status |
| GET/POST | `/api/chamados` | Lista chamados permitidos ao usuário ou cria chamado |
| PATCH | `/api/chamados/:id/status` | Equipe atualiza status |

API publicada no Azure App Service (plano B1, Brazil South): [pi-web-gramanse-api-2026.azurewebsites.net](https://pi-web-gramanse-api-2026-dagge8hbemava7bu.brazilsouth-01.azurewebsites.net). A verificação `/api/health` confirma a conexão SQLite; o CRUD foi exercitado remotamente. O custo estimado pelo portal é US$ 14,60/mês enquanto o plano estiver ativo.

Os detalhes do deploy, persistência do banco e captura de logs estão em [docs/azure-app-service.md](docs/azure-app-service.md).

As regras de normalização, validação, tratamento de inconsistências, testes e o fluxo entre React/Insomnia, Express e SQLite estão documentados em [docs/qualidade-dados.md](docs/qualidade-dados.md).

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

O projeto encontra-se em desenvolvimento. A interface em React contempla navegação responsiva, consulta ao catálogo via API e formulário demonstrativo de orçamento, que ainda não é persistido.

As funcionalidades serão adicionadas progressivamente conforme o desenvolvimento do projeto.
