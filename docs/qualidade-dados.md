# Qualidade, validação e integração dos dados

## Objetivo e escopo

Este documento descreve como os dados usados pela aplicação são recebidos, validados, normalizados, persistidos e devolvidos. O catálogo, as contas, os pedidos e os chamados são persistidos pela API Express no SQLite. As categorias/segmentos são definições estáticas do front-end. O formulário de orçamento ainda é apenas uma demonstração e não envia nem persiste informações.

## Fluxo de integração

```text
React (telas e serviços HTTP) / Insomnia
        │ JSON; token Bearer nas rotas protegidas
        ▼
Express: limite de 100 KB, log de rota e tratamento de erro
        ▼
Rotas: autenticação/autorização + validação + normalização
        ▼
SQLite: SQL parametrizado, chaves estrangeiras, CHECKs e triggers
        ▼
SELECT com aliases camelCase + conversão de IDs/datas
        ▼
Resposta JSON para os serviços HTTP do React / Insomnia
```

O front-end usa `VITE_API_URL` (padrão `/api`) e, em desenvolvimento, o Vite encaminha `/api` para `http://localhost:3000`. As credenciais de sessão e o carrinho também ficam no `localStorage`; o banco continua sendo a fonte dos dados persistidos. Se a API não carregar o catálogo, a interface sinaliza que a cópia estática exibida é demonstrativa e pode estar desatualizada.

O banco padrão é `database/catalogo.db`; `DB_PATH` pode apontar para outro arquivo. `initializeDatabase` cria as tabelas e índices com `IF NOT EXISTS`. Cinco produtos demonstrativos são inseridos somente quando `produtos` está vazia; usuários, pedidos e chamados não recebem dados de demonstração. A conta da equipe é criada na inicialização somente quando `ADMIN_EMAIL` e `ADMIN_PASSWORD` estão configurados.

| Fonte/entidade | Entrada e persistência | Transformação de saída |
| --- | --- | --- |
| Produtos | GET público; criação, atualização e exclusão exigem equipe; tabela `produtos` | `segment_id`, `created_at` e `updated_at` são expostos como `segmentId`, `createdAt` e `updatedAt`; `price: null` significa preço sob consulta |
| Usuários | Cadastro público cria apenas `cliente`; a equipe vem das variáveis de ambiente; tabela `usuarios` | E-mail em minúsculas; senha nunca é devolvida; `password_hash` não é parte do objeto público |
| Sessões | Login cria token aleatório; tabela `sessoes` guarda apenas seu SHA-256 e validade | O token é enviado uma vez ao cliente e usado como `Authorization: Bearer ...`; expira em sete dias |
| Pedidos e itens | Usuário autenticado envia produtos e quantidades; tabelas `pedidos` e `pedido_itens` | IDs numéricos viram `PED-000001`; nome e preço são lidos do catálogo no servidor; nome e preço unitário ficam congelados no item do pedido |
| Chamados | Usuário autenticado envia assunto, mensagem e, opcionalmente, pedido; tabela `chamados` | IDs numéricos viram `CHM-000001`; associação a pedido é validada quanto à existência e propriedade |
| Segmentos | IDs definidos no código da aplicação, não há CRUD/tabela de segmentos | IDs aceitos: `fundicao`, `laboratorio`, `analise`, `aquario` |
| Orçamento | O diálogo atual só valida campos obrigatórios no navegador | Não há rota montada nem gravação; o diálogo informa que os dados não foram enviados |

O item de pedido guarda `unit_price` para preservar o valor vigente quando foi criado, inclusive se o preço do catálogo mudar ou o produto for excluído. A listagem atual de pedidos devolve nome, ID do produto e quantidade, mas não expõe `unit_price`.

## Regras de validação e negócio

As validações da API acontecem antes da escrita. As regras essenciais também são protegidas por `CHECK`, chaves estrangeiras ou triggers SQLite, para rejeitar valores inválidos mesmo se a gravação não vier das rotas HTTP.

| Dado | Normalização e regra | Tratamento de inconsistência |
| --- | --- | --- |
| JSON HTTP | Corpo limitado a 100 KB; espera-se objeto JSON nas rotas de escrita | JSON malformado: `400`; corpo acima do limite: `413`; objeto/tipo inválido: `400` |
| Nome de produto | Texto Unicode NFC, espaços externos removidos e espaços internos consecutivos reduzidos; 1–120 caracteres | Campo ausente, vazio, tipo incorreto ou acima do limite: `400` |
| Material de produto | Mesma normalização de texto; 1–100 caracteres | Inválido: `400` |
| Descrição de produto | Mesma normalização de texto; 1–500 caracteres | Inválida: `400` |
| Segmento de produto | `trim` e minúsculas usando locale `pt-BR`; exige um dos quatro IDs canônicos | Segmento desconhecido: `400` |
| Preço de produto | Opcional (`null` = sob consulta); número ou string decimal com ponto/vírgula, sem sinal negativo e com até duas casas; normalizado para centavos | Vazio, texto não numérico, negativo, infinito ou precisão excessiva: `400` |
| ID de produto | Número inteiro positivo seguro | Formato inválido: `400`; válido sem registro: `404` |
| Cadastro | Nome em NFC e espaços compactados (1–120); e-mail trim, minúsculas, formato básico e até 254; empresa opcional (1–120); senha de 8–128 caracteres | Campo inválido: `400`; e-mail duplicado, inclusive diferenças de caixa: `409` |
| Login | E-mail trim/minúsculas; senha comparada com hash scrypt | Credenciais ou perfil solicitados não correspondem: mensagem genérica e `401`; 5 falhas por IP/e-mail em 15 minutos: `429` |
| Pedido | 1–50 linhas; `productId` inteiro positivo seguro; `qty` inteiro de 1–1000; nota opcional até 500 caracteres | Linhas duplicadas do mesmo produto são consolidadas; produto inexistente: `400`; pedido de cliente criado com status inicial `Aguardando confirmação` |
| Preço/nome do pedido | Não se confia em preço ou nome enviados pelo navegador; a API consulta `produtos` e guarda snapshot no item | Falha ao inserir itens remove o pedido recém-criado; o item não depende de chave estrangeira do produto para manter o histórico |
| Acesso a pedido | Cliente consulta apenas seus pedidos; equipe consulta todos e altera status | Token ausente/inválido: `401`; perfil sem permissão: `403` |
| Status de pedido | `Aguardando confirmação`, `Em produção` ou `Enviado` | Status desconhecido: `400`; pedido inexistente: `404` |
| Chamado | Assunto 1–120; mensagem 1–2000; pedido relacionado opcional | Texto vazio/excedente ou pedido inexistente/de outra pessoa: `400` |
| Acesso/status de chamado | Cliente lista os próprios chamados; equipe lista todos e altera status | Acesso sem permissão: `401`/`403`; status deve ser `Aberto`, `Respondido` ou `Encerrado`, caso contrário `400` |
| Datas | SQLite grava `CURRENT_TIMESTAMP` em UTC sem sufixo de fuso | A API acrescenta `Z` e retorna datas ISO 8601 |
| SQL | Consultas usam parâmetros para valores; tabelas/colunas não são montadas a partir de entrada externa | Violações de constraints conhecidas retornam `400`; erros inesperados retornam `500` genérico e detalhe fica no log |

## Tratamento de inconsistências e integridade

- **Duplicidade de cadastro:** a API consulta antes de inserir e o índice `UNIQUE COLLATE NOCASE` no e-mail cobre concorrência entre requisições. A resposta é `409`, sem criar uma segunda conta.
- **Preço incoerente:** o servidor aceita somente valor não negativo com até duas casas; triggers de produto repetem a regra no SQLite. O preço que vale no pedido é lido novamente do banco, não do carrinho.
- **Referências inválidas:** chaves estrangeiras ligam pedido e chamado a usuários e itens a pedidos. Um chamado só pode referenciar pedido existente e pertencente ao cliente que o abriu; a equipe também pode associar pedidos existentes.
- **Histórico de pedido:** `pedido_itens.produto_id` não é FK de propósito. A exclusão do produto não apaga o snapshot histórico do pedido. A exclusão do pedido remove seus itens; a exclusão do usuário remove pedidos e chamados conforme `ON DELETE CASCADE`.
- **Erro parcial ao montar pedido:** se a inserção de qualquer item falhar, a rota exclui o pedido pai; a FK em cascata elimina os itens que já tinham sido gravados. O erro é encaminhado ao middleware da API.
- **Falha da API:** rotas inexistentes retornam `404`; JSON inválido `400`; payload grande `413`; restrição de integridade `400`; erro inesperado `500` sem detalhes internos na resposta. O servidor registra método/rota e erros inesperados para diagnóstico.
- **Dados de demonstração:** a carga inicial só preenche catálogo vazio e não sobrescreve produtos existentes. Ela não é uma migração de dados externos.

## Evidências de validação

Execute na raiz do projeto:

```powershell
npm run test:api
```

Os testes usam um SQLite em memória (`:memory:`), portanto não alteram `database/catalogo.db`. A suíte automatiza estas evidências:

| Evidência | Teste/asserção |
| --- | --- |
| Banco e API acessíveis | `GET /api/health` retorna `200`, `status: ok` e `database: connected` |
| Transformação de produto | `api/tests/produtos.test.js`: compacta espaços, normaliza segmento e preço string para número |
| Rejeição e ausência de gravação | Mesmo teste: rejeita nome vazio/excedente, segmento inválido, preço vazio/textual/negativo/com mais de duas casas; confirma que produto inválido não foi inserido |
| Transporte e integridade | Mesmo teste: JSON malformado `400`, payload acima de 100 KB `413`, gravação SQL inválida rejeitada por trigger, update inválido não altera registro, ID inexistente `404` |
| Credenciais e sessões | `api/tests/auth.test.js`: cadastro normalizado, e-mail duplicado `409`, hash scrypt no banco, hash não exposto, login/role inválidos `401`, sessão autenticada e logout invalidando o token |
| Limitação de login | Cinco falhas em sequência retornam `401`; nova tentativa dentro da janela retorna `429` |
| Pedidos e autorização | Consolidação de linhas duplicadas, rejeição de quantidade/produto inválidos, isolamento entre clientes, leitura pela equipe, mudança de status apenas pela equipe |
| Chamados e referências | Criação/listagem isoladas, associação do próprio pedido, rejeição de pedido de outra pessoa, transição de status pela equipe |
| Persistência no domínio | O teste consulta diretamente o SQLite em memória e confirma que os itens foram gravados |

Para evidência manual no Insomnia:

1. Inicie a API e confirme `GET /api/health` (`200`).
2. Faça login da equipe e use o token como Bearer; crie/atualize um produto e teste também uma escrita sem token (`401`) e com token de cliente (`403`).
3. Cadastre ou autentique cliente; crie pedido, liste com token do cliente e da equipe, abra chamado e atualize status como equipe.
4. Envie dados inválidos (preço `1.234`, segmento desconhecido, quantidade zero, pedido de outro cliente) e registre os códigos e corpos JSON de erro.
5. Atualize as tabelas no DBeaver e compare produto, usuário, pedido, itens, chamado e status com as respostas HTTP.

Para relatório/apresentação, registre capturas do terminal de `npm run test:api`, das respostas de sucesso e erro no Insomnia e das tabelas correspondentes no DBeaver. Não inclua token Bearer, senha, hash de senha ou dados pessoais nas capturas. Para testes locais com registros reais, configure `DB_PATH` para um banco descartável; não use `database/catalogo.db` em testes destrutivos.

## Limites conhecidos

- O formulário de orçamento não grava dados, pois não existe rota de orçamento montada.
- Os segmentos são estáticos e não têm tabela/CRUD próprio.
- Se a API do catálogo falhar, o front-end mantém os produtos de demonstração, mas agora exibe um aviso de que os valores podem estar desatualizados.
- A limitação de tentativas de login é mantida em memória por processo; reiniciar a API limpa os contadores e múltiplas instâncias não compartilham o limite.
- SQLite é apropriado para esta demonstração com uma instância. Para escrita concorrente ou múltiplas instâncias, recomenda-se banco gerenciado.
