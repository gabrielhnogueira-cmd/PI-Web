# API no Azure App Service

Este roteiro publica somente a API Express como aplicação Node.js Linux. O SQLite fica em `/home/data/catalogo.db`, dentro do armazenamento persistente do App Service. Para produção com várias instâncias, substitua SQLite por Azure Database for PostgreSQL ou outro banco gerenciado.

## Ambiente provisionado

- App Service: `pi-web-gramanse-api-2026`;
- grupo de recursos: `rg-pi-web-gramanse`;
- assinatura: Azure for Students;
- região: Brazil South;
- runtime: Node.js 22 LTS em Linux;
- plano atual: Basic B1, 1 vCPU, 1,75 GB de memória e 10 GB de armazenamento;
- URL: `https://pi-web-gramanse-api-2026-dagge8hbemava7bu.brazilsouth-01.azurewebsites.net`.

O Web App foi implantado pelo Kudu usando o ZIP `pi-web-api-deploy.zip`. A implantação final terminou com sucesso após atualizar para `sqlite3@5.1.7`. O health remoto respondeu `{"status":"ok","database":"connected"}`; a validação remota criou, atualizou e excluiu um produto de teste, recebendo `204` no DELETE e `404` na consulta posterior.

O F1 gratuito atingiu a cota da assinatura e desabilitou o site. O App Service foi então escalado para B1, que o portal estimou em **US$ 0,02/hora ou US$ 14,60/mês**. Com US$ 100 de crédito, isso representa cerca de seis meses completos se ficar ligado continuamente; confira o consumo no Cost Management. O plano continua faturável mesmo sem tráfego. Para suspender o consumo, reduza para F1 se a cota permitir ou exclua o plano/recurso.

## Pré-requisitos

- Azure CLI instalado;
- assinatura Azure com permissão para criar Resource Group e App Service Plan;
- Node.js 22 local para testes;
- nome globalmente único para o Web App.

## Criar os recursos

No PowerShell, autentique e selecione a assinatura:

```powershell
az login
az account set --subscription "<ID-OU-NOME-DA-ASSINATURA>"

$resourceGroup = "rg-pi-gramanse"
$location = "brazilsouth"
$plan = "plan-pi-gramanse"
$app = "pi-web-gramanse-api-<sufixo-unico>"

az group create --name $resourceGroup --location $location
az appservice plan create --name $plan --resource-group $resourceGroup --location $location --sku B1 --is-linux
az webapp create --name $app --resource-group $resourceGroup --plan $plan --runtime "NODE:22-lts"
```

O B1 é pago. O preço observado no portal foi US$ 14,60/mês estimado na região e assinatura atuais; preços podem mudar. Confirme o custo mostrado no portal antes de criar ou escalar recursos.

## Configurar banco, inicialização e CORS

```powershell
az webapp config appsettings set --name $app --resource-group $resourceGroup --settings `
  DB_PATH="/home/data/catalogo.db" `
  WEBSITES_ENABLE_APP_SERVICE_STORAGE="true" `
  SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
  CORS_ORIGIN="<ORIGEM-DO-FRONT-END>"

az webapp config set --name $app --resource-group $resourceGroup --startup-file "npm start"
```

Não use `*` em `CORS_ORIGIN` quando publicar a aplicação. Informe a origem exata do front-end; para testes locais, configure `http://localhost:5173`.

## Publicar e testar

Na raiz do repositório, gere um ZIP com a API, fontes do front-end e configurações necessárias ao build remoto. Não inclua `node_modules`, `dist` nem `database/catalogo.db`, pois o build roda no App Service e o banco deve ser criado no armazenamento persistente.

```powershell
$zipPath = Join-Path $env:TEMP "pi-web-api-deploy.zip"
Compress-Archive -Path api,src,assets,index.html,package.json,package-lock.json,vite.config.ts,tailwind.config.js,postcss.config.js,tsconfig.json -DestinationPath $zipPath -Force
az webapp deploy --name $app --resource-group $resourceGroup --src-path $zipPath --type zip
```

Confirme a API e a conexão SQLite:

```powershell
$baseUrl = "https://$app.azurewebsites.net"
Invoke-RestMethod "$baseUrl/api/health"
Invoke-RestMethod "$baseUrl/api/produtos"
```

A resposta de `/api/health` deve conter `"status": "ok"` e `"database": "connected"`. Use a coleção `insomnia/PI-Web-API.json` para executar o CRUD contra `$baseUrl` após trocar `base_url` no ambiente do Insomnia.

O driver do projeto está fixado em `sqlite3@5.1.7`: o `sqlite3@6.0.1` produziu um binário nativo que exigia `GLIBC_2.38`, indisponível na imagem Linux do App Service. A versão fixada foi validada pelo CRUD local e pelo build Oryx no Azure.

## Logs e evidências

Habilite logs da aplicação e acompanhe a inicialização e as requisições:

```powershell
az webapp log config --name $app --resource-group $resourceGroup --application-logging filesystem --level information
az webapp log tail --name $app --resource-group $resourceGroup
```

Para o relatório, registre capturas de: Resource Group e App Service no portal; configuração `DB_PATH`; saída de `/api/health`; requisições GET/POST/PUT/DELETE no Insomnia; e logs `[db]`/`[api]` do comando `az webapp log tail`. O deploy e essas capturas precisam ser realizados na assinatura da equipe.

## Persistência e limite do SQLite

O App Service mantém os arquivos abaixo de `/home` quando `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`. Não coloque o arquivo de banco no diretório temporário da aplicação. SQLite atende a esta demonstração com uma única instância; não é adequado para escrita concorrente entre várias instâncias ou alta disponibilidade.