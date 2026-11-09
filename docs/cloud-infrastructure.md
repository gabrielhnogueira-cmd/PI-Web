# Infraestrutura em Nuvem - PI-Web

## Visão Geral

O projeto PI-Web está hospedado na plataforma **Microsoft Azure**, utilizando o serviço **Azure App Service** para hospedar tanto a API backend (Node.js/Express) quanto o frontend (React + Vite). O banco de dados utilizado é SQLite em armazenamento persistente.

---

## Informações do Ambiente

### **Azure App Service**

| Item | Detalhes |
|------|----------|
| **Nome do recurso** | `pi-web-gramanse-api-2026` |
| **Tipo de recurso** | Aplicação Web (Web App) |
| **Grupo de recursos** | `rg-pi-web-gramanse` |
| **Assinatura** | Azure for Students |
| **Região** | Brazil South (São Paulo) |
| **URL de produção** | https://pi-web-gramanse-api-2026-dagge8hbemava7bu.brazilsouth-01.azurewebsites.net |
| **URL do Kudu (gerenciamento)** | https://pi-web-gramanse-api-2026.scm.azurewebsites.net |

### **Especificações do Plano**

| Item | Detalhes |
|------|----------|
| **Plano de Serviço** | Basic B1 |
| **Sistema Operacional** | Linux |
| **Runtime** | Node.js 22 LTS |
| **vCPU** | 1 core |
| **Memória RAM** | 1,75 GB |
| **Armazenamento** | 10 GB |
| **Custo estimado** | US$ 14,60/mês (~R$ 84/mês) ou US$ 0,02/hora |

---

## Arquitetura da Aplicação

### **Stack Tecnológico**

**Backend (API):**
- Node.js 22 LTS
- Express 5.2.1
- SQLite 3 (versão 5.1.7 - fixada para compatibilidade com Azure)
- CORS habilitado para origens configuradas

**Frontend:**
- React 19.0.0
- TypeScript 5.7.2
- Vite 6.4.1 (build tool)
- Tailwind CSS 3.4.17

### **Estrutura de Arquivos no Azure**

```
/home/site/wwwroot/
├── api/                    # Backend Express
│   ├── app.js             # Configuração do Express
│   ├── server.js          # Servidor principal
│   ├── auth.js            # Autenticação
│   ├── database.js        # Gerenciamento do SQLite
│   ├── format.js          # Utilitários
│   └── routes/            # Rotas da API
│       ├── auth.js
│       ├── chamados.js
│       ├── pedidos.js
│       └── produtos.js
├── dist/                  # Frontend compilado (React build)
├── src/                   # Código-fonte React
├── assets/                # Recursos estáticos
├── node_modules/          # Dependências instaladas
├── package.json           # Configuração npm
└── /home/data/
    └── catalogo.db        # Banco de dados SQLite (persistente)
```

---

## Banco de Dados

### **SQLite**

| Item | Detalhes |
|------|----------|
| **Tipo** | SQLite 3 |
| **Localização** | `/home/data/catalogo.db` |
| **Persistência** | Armazenamento persistente do Azure (via `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`) |
| **Versão do driver** | sqlite3@5.1.7 (fixada para compatibilidade) |

**Observações importantes:**
- O SQLite é adequado para demonstração e desenvolvimento
- **Não recomendado para produção com múltiplas instâncias** (concorrência limitada)
- Para ambientes de produção escaláveis, considere migrar para:
  - Azure Database for PostgreSQL
  - Azure SQL Database
  - MySQL no Azure

### **Tabelas do Banco**

O banco contém as seguintes entidades:
- `produtos` - Catálogo de produtos
- `usuarios` - Usuários do sistema
- `pedidos` - Pedidos realizados
- `chamados` - Tickets de suporte

---

## Configuração do Ambiente

### **Variáveis de Ambiente**

As seguintes variáveis estão configuradas no App Service:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DB_PATH` | `/home/data/catalogo.db` | Caminho do banco SQLite |
| `WEBSITES_ENABLE_APP_SERVICE_STORAGE` | `true` | Habilita armazenamento persistente |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Executa build durante deploy |
| `CORS_ORIGIN` | `<origem-do-frontend>` | Origem permitida para CORS |
| `PORT` | `3000` (padrão) | Porta da aplicação |
| `ADMIN_EMAIL` | (configurado) | Email do administrador |
| `ADMIN_PASSWORD` | (configurado) | Senha do administrador |

### **Startup Command**

```bash
npm start
```

Executa o comando definido em `package.json`:
```json
"scripts": {
  "start": "node api/server.js"
}
```

---

## Endpoints da API

### **Health Check**
```
GET /api/health
```
Retorna o status da aplicação e conexão com banco de dados.

**Resposta de sucesso:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### **Autenticação**
```
POST /api/auth/login
POST /api/auth/register
```

### **Produtos**
```
GET    /api/produtos          # Listar todos
GET    /api/produtos/:id      # Buscar por ID
POST   /api/produtos          # Criar novo
PUT    /api/produtos/:id      # Atualizar
DELETE /api/produtos/:id      # Remover
```

### **Pedidos**
```
GET    /api/pedidos           # Listar pedidos
POST   /api/pedidos           # Criar pedido
GET    /api/pedidos/:id       # Detalhes do pedido
PUT    /api/pedidos/:id       # Atualizar pedido
DELETE /api/pedidos/:id       # Cancelar pedido
```

### **Chamados (Suporte)**
```
GET    /api/chamados          # Listar chamados
POST   /api/chamados          # Criar chamado
GET    /api/chamados/:id      # Detalhes do chamado
PUT    /api/chamados/:id      # Atualizar chamado
DELETE /api/chamados/:id      # Fechar chamado
```

---

## Processo de Deploy

### **Método Atual: Deploy Manual via ZIP**

O deploy é realizado através do Kudu (serviço de gerenciamento do Azure) enviando um arquivo ZIP com o código da aplicação.

#### **Pré-requisitos:**
- Azure CLI instalado (ou acesso ao portal Azure)
- Código compilado (frontend buildado)
- Credenciais de deploy do App Service

#### **Passos para Deploy:**

**1. Build do Frontend**
```bash
cd C:\Users\gabri\PI-Web
npm run build
```

**2. Criar arquivo ZIP**
```powershell
$zipPath = Join-Path $env:TEMP "pi-web-deploy.zip"
Compress-Archive -Path api,src,assets,dist,index.html,package.json,package-lock.json,vite.config.ts,tailwind.config.js,postcss.config.js,tsconfig.json -DestinationPath $zipPath -Force
```

**3. Deploy via Azure CLI**
```powershell
az webapp deploy --name pi-web-gramanse-api-2026 --resource-group rg-pi-web-gramanse --src-path $zipPath --type zip
```

**Ou via Portal Azure:**
1. Acessar: https://pi-web-gramanse-api-2026.scm.azurewebsites.net/ZipDeployUI
2. Fazer upload do arquivo ZIP
3. Aguardar processamento (2-5 minutos)

### **Deploy via Git (Alternativa)**

É possível configurar deploy contínuo a partir do repositório GitHub:

1. No Portal Azure, acessar **Deployment Center**
2. Selecionar **GitHub** como fonte
3. Autorizar acesso ao repositório
4. Selecionar branch (main)
5. Configurar build automático

---

## Monitoramento e Logs

### **Visualizar Logs em Tempo Real**

**Via Azure CLI:**
```bash
az webapp log tail --name pi-web-gramanse-api-2026 --resource-group rg-pi-web-gramanse
```

**Via Portal Azure:**
1. Acessar App Service → **Log stream**
2. Ou via Kudu: **Logs → Log Stream**

### **Configurar Nível de Log**

```bash
az webapp log config --name pi-web-gramanse-api-2026 --resource-group rg-pi-web-gramanse --application-logging filesystem --level information
```

### **Logs Importantes**

O servidor Node.js gera logs com prefixos:
- `[api]` - Requisições HTTP e inicialização
- `[db]` - Operações de banco de dados
- `[auth]` - Autenticação de usuários

**Exemplo de log de sucesso:**
```
[api] Express executando na porta 8080
[db] Banco de dados conectado: /home/data/catalogo.db
[auth] Conta da equipe (admin@gramanse.com): já existe
[api] GET /api/health
[api] GET /api/produtos
```

---

## Segurança

### **SSL/HTTPS**
- ✅ Certificado SSL gerenciado automaticamente pelo Azure
- ✅ HTTPS habilitado por padrão
- ✅ Redirecionamento HTTP → HTTPS configurado

### **CORS (Cross-Origin Resource Sharing)**
- Configurado via variável de ambiente `CORS_ORIGIN`
- Apenas origens autorizadas podem fazer requisições
- **Não usar `*` em produção**

### **Autenticação**
- Sistema de login com email e senha
- Senhas não são armazenadas em texto plano (implementar hashing)
- Token de sessão para manter usuário autenticado

### **Credenciais de Deploy**

**Application Scope (recomendado):**
- Username: `$pi-web-gramanse-api-2026`
- Password: Disponível no Portal Azure → Deployment Center → FTPS credentials

**User Scope:**
- Credenciais do usuário Azure (nível de assinatura)

---

## Custos e Otimização

### **Custo Atual**
- **Plano B1:** US$ 14,60/mês (~R$ 84/mês)
- **Faturamento:** 24/7 (mesmo sem tráfego)
- **Créditos Azure for Students:** US$ 100 (dura ~6-7 meses com uso contínuo)

### **Opções de Redução de Custos**

1. **Free Tier (F1):**
   - Grátis, mas com limitações (60 min/dia de CPU, sem sempre-ativo)
   - Pode atingir cota da assinatura

2. **Desligar quando não usar:**
   - Parar o App Service manualmente
   - Economiza custos, mas site fica offline

3. **Migrar para serverless:**
   - Azure Functions + Static Web Apps
   - Paga apenas pelo uso (mais barato para baixo tráfego)

### **Escalabilidade**

**Scale Up (Vertical):**
- Aumentar para B2, S1, P1V2 conforme necessidade
- Mais CPU, RAM e recursos

**Scale Out (Horizontal):**
- Adicionar múltiplas instâncias
- Requer migração do SQLite para banco gerenciado

---

## Troubleshooting

### **Problemas Comuns**

#### **1. Erro 503 - Service Unavailable**
- **Causa:** App não iniciou corretamente
- **Solução:** Verificar logs, checar se `npm start` funciona localmente

#### **2. Erro de GLIBC ao usar sqlite3@6.x**
- **Causa:** Binário incompatível com imagem Linux do Azure
- **Solução:** Usar `sqlite3@5.1.7` (versão fixada no projeto)

#### **3. Banco de dados vazio após restart**
- **Causa:** `WEBSITES_ENABLE_APP_SERVICE_STORAGE` não está configurado
- **Solução:** Configurar variável e reiniciar

#### **4. CORS Error no frontend**
- **Causa:** Origem não autorizada
- **Solução:** Adicionar origem em `CORS_ORIGIN`

#### **5. Deploy falha no build**
- **Causa:** Erro de TypeScript ou dependências
- **Solução:** Rodar `npm run build` localmente primeiro

---

## Melhorias Futuras

### **Recomendações para Produção**

1. **Banco de Dados:**
   - Migrar para Azure Database for PostgreSQL
   - Ou Azure SQL Database
   - Habilitar backups automáticos

2. **Autenticação:**
   - Implementar JWT (JSON Web Tokens)
   - Adicionar refresh tokens
   - Integrar com Azure AD B2C

3. **Cache:**
   - Implementar Redis (Azure Cache for Redis)
   - Cache de consultas frequentes

4. **CDN:**
   - Usar Azure CDN para assets estáticos
   - Melhorar performance global

5. **Monitoramento:**
   - Configurar Azure Application Insights
   - Alertas de erro e performance
   - Dashboards de métricas

6. **CI/CD:**
   - GitHub Actions para deploy automático
   - Testes automatizados antes do deploy
   - Ambientes staging e production

7. **Segurança:**
   - Implementar rate limiting
   - Adicionar WAF (Web Application Firewall)
   - Escanear vulnerabilidades regularmente

---

## Repositório e Versionamento

| Item | Detalhes |
|------|----------|
| **Repositório GitHub** | https://github.com/gabrielhnogueira-cmd/PI-Web.git |
| **Branch principal** | `main` |
| **Último deploy** | Manual via ZIP |

---

## Contato e Suporte

Para questões relacionadas à infraestrutura Azure:
- **Portal Azure:** https://portal.azure.com
- **Documentação Azure:** https://docs.microsoft.com/azure/app-service/
- **Suporte Azure for Students:** https://aka.ms/azureforeducation

---

## Histórico de Alterações

| Data | Versão | Alterações |
|------|--------|------------|
| 2026-11-05 | 1.0 | Deploy inicial no Azure App Service B1 |
| 2026-11-05 | 1.1 | Configuração de frontend para ser servido pelo Express |
| 2026-11-05 | 1.2 | Fix: Correção de props do RequestDialog |

---

**Documento criado em:** 05/11/2026  
**Última atualização:** 05/11/2026  
**Responsável:** Equipe PI-Web Gramanse
