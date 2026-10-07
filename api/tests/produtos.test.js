const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('../app');
const { closeDatabase, initializeDatabase, openDatabase } = require('../database');

test('API de produtos executa o ciclo CRUD e valida os dados', async (context) => {
  const db = openDatabase(':memory:');
  await initializeDatabase(db, { seed: false, log: false });
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  context.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await closeDatabase(db);
  });

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: 'ok', database: 'connected' });

  const listResponse = await fetch(`${baseUrl}/api/produtos`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), []);

  const createResponse = await fetch(`${baseUrl}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cadinho de teste',
      segmentId: 'laboratorio',
      material: 'Porcelana de alta alumina',
      description: 'Peça criada no teste da API.',
      price: 12.5,
    }),
  });
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.name, 'Cadinho de teste');
  assert.equal(created.price, 12.5);
  assert.equal(createResponse.headers.get('location'), `/api/produtos/${created.id}`);

  const detailResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`);
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).segmentId, 'laboratorio');

  const updateResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cadinho atualizado',
      segmentId: 'laboratorio',
      material: 'Alumina',
      description: 'Dados revisados.',
      price: null,
    }),
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).name, 'Cadinho atualizado');

  const invalidResponse = await fetch(`${baseUrl}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Produto sem segmento' }),
  });
  assert.equal(invalidResponse.status, 400);

  const deleteResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`);
  assert.equal(missingResponse.status, 404);
});