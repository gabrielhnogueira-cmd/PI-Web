const { createApp } = require('./app');
const { ensureAdmin } = require('./auth');
const { closeDatabase, initializeDatabase, openDatabase } = require('./database');

async function start() {
  const port = Number(process.env.PORT) || 3000;
  const dbPath = process.env.DB_PATH || 'database/catalogo.db';
  const db = openDatabase(dbPath);

  try {
    await initializeDatabase(db, { filename: dbPath });
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const outcome = await ensureAdmin(db, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
      console.info(`[auth] Conta da equipe (${process.env.ADMIN_EMAIL}): ${outcome}`);
    } else {
      console.warn('[auth] ADMIN_EMAIL/ADMIN_PASSWORD não definidos: nenhuma conta da equipe será criada.');
    }
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