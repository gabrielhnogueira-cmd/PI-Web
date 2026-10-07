const cors = require('cors');
const express = require('express');
const { get } = require('./database');
const { createProductsRouter } = require('./routes/produtos');

function createApp(db) {
  const app = express();
  const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use(cors(configuredOrigins?.length ? { origin: configuredOrigins } : undefined));
  app.use(express.json({ limit: '100kb' }));
  app.use((request, response, next) => {
    console.info(`[api] ${request.method} ${request.path}`);
    next();
  });

  app.get('/api/health', async (request, response) => {
    await get(db, 'SELECT 1 AS connected');
    response.json({ status: 'ok', database: 'connected' });
  });
  app.use('/api/produtos', createProductsRouter(db));

  app.use((request, response) => {
    response.status(404).json({ erro: 'Rota não encontrada.' });
  });

  app.use((error, request, response, next) => {
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ erro: 'JSON inválido.' });
    }
    console.error(`[api] ${error.message}`);
    response.status(500).json({ erro: 'Erro interno da API.' });
  });

  return app;
}

module.exports = { createApp };