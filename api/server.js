const { createApp } = require('./app');
const { closeDatabase, initializeDatabase, openDatabase } = require('./database');

async function start() {
  const port = Number(process.env.PORT) || 3000;
  const dbPath = process.env.DB_PATH || 'database/catalogo.db';
  const db = openDatabase(dbPath);

  try {
    await initializeDatabase(db, { filename: dbPath });
    const server = createApp(db).listen(port, () => {
      console.info(`[api] Express executando na porta ${port}`);
    });

    const shutdown = () => server.close(async () => {
      await closeDatabase(db);
      process.exit(0);
    });
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    return server;
  } catch (error) {
    console.error(`[api] Falha ao iniciar: ${error.message}`);
    await closeDatabase(db);
    process.exitCode = 1;
  }
}

if (require.main === module) start();

module.exports = { start };