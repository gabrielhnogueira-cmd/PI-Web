# Qualidade e fluxo dos dados

## Fontes e fluxo atual

```text
Insomnia / cliente HTTP
        ↓ JSON
Express: limite de payload e validação
        ↓ normalização aprovada
Rota /api/produtos
        ↓ SQL parametrizado + triggers de integridade
SQLite: database/catalogo.db (local)
        ou /home/data/catalogo.db (Azure App Service)
        ↓ SELECT com aliases
Resposta JSON em camelCase
```

O arquivo SQLite é a fonte persistida para o CRUD da API. Na primeira inicialização, cinco produtos demonstrativos são inseridos somente se a tabela estiver vazia. A API aceita outro caminho por `DB_PATH`.

Neste estágio, o React ainda apresenta dados simulados em `src/data/catalog.ts`; ele não consome `/api/produtos`. A coleção Insomnia é o cliente usado para testar a integração HTTP com o banco. A interface pode ser ligada à API posteriormente, mantendo a mesma forma dos dados (`id`, `name`, `segmentId`, `material`, `description`, `price`).

## Regras de transformação e validação

| Campo/regra | Tratamento | Rejeição |
| --- | --- | --- |
| Corpo HTTP | Aceita somente objeto JSON; limite de 100 KB | JSON malformado ou corpo não objeto: `400` |
| `name` | Unicode NFC, trim e espaços consecutivos reduzidos a um; máximo 120 caracteres | Ausente, tipo diferente de texto, vazio ou acima do limite: `400` |
| `material` | Unicode NFC, trim e compactação de espaços; máximo 100 caracteres | Ausente, tipo diferente de texto, vazio ou acima do limite: `400` |
| `description` | Unicode NFC, trim e compactação de espaços; máximo 500 caracteres | Ausente, tipo diferente de texto, vazio ou acima do limite: `400` |
| `segmentId` | trim e minúsculas; valor canônico preservado | Deve ser `fundicao`, `laboratorio`, `analise` ou `aquario` |
| `price` | Opcional ou `null`; aceita número ou string decimal com ponto/vírgula e normaliza para número com duas casas | Vazio, não numérico, negativo ou mais de duas casas: `400` |
| `id` | Inteiro positivo seguro | ID malformado: `400`; ID válido sem registro: `404` |

A validação ocorre antes de qualquer `INSERT` ou `UPDATE`. O banco também possui triggers para impedir gravações diretas com texto vazio, limites excedidos, segmento fora da lista ou preço inválido. As consultas usam parâmetros SQL, e a resposta converte `segment_id`, `created_at` e `updated_at` para `segmentId`, `createdAt` e `updatedAt`.

## Contrato de erros

```json
{
  "erro": "Dados do produto inválidos.",
  "campos": {
    "price": "Informe um número não negativo com até duas casas decimais, ou null."
  }
}
```

Erros conhecidos retornam mensagens JSON sem expor stack trace. JSON malformado e regras violadas retornam `400`; ID inexistente retorna `404`; falha inesperada retorna `500` com mensagem genérica, enquanto o detalhe fica no log do servidor. Cada requisição é registrada como `[api] METHOD /rota`; a inicialização registra `[db] SQLite conectado em caminho`.

## Evidências reproduzíveis

Execute `npm run test:api`. O teste usa SQLite em memória e verifica:

- CRUD completo e códigos `201`, `200` e `204`;
- normalização de espaço, Unicode/segmento e preço em string;
- campo obrigatório, tamanho máximo, segmento desconhecido e preço vazio, texto, negativo ou com precisão excessiva;
- JSON malformado, ID inválido e registro inexistente;
- ausência de gravação quando a validação falha e bloqueio por trigger SQLite.

Para evidência manual, importe `insomnia/PI-Web-API.json` e execute Health, Listar, Criar (normalização), Consultar, Atualizar, Excluir e os requests negativos. `/api/health` deve retornar `status: ok` e `database: connected`. No Azure, use o Log Stream do Kudu para capturar os logs `[db]` e `[api]` junto às requisições.