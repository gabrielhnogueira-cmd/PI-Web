const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('../app');
const { createUser } = require('../auth');
const { closeDatabase, initializeDatabase, openDatabase, run } = require('../database');

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

  // As escritas exigem a equipe: este fetch local acrescenta o token a requisições não-GET.
  let token = null;
  const rawFetch = globalThis.fetch;
  const fetch = (url, options = {}) => options.method && options.method !== 'GET' && token
    ? rawFetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
    : rawFetch(url, options);

  const unauthenticated = await fetch(`${baseUrl}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(unauthenticated.status, 401);

  await createUser(db, { name: 'Equipe', email: 'equipe@teste.com', password: 'senha-da-equipe', role: 'equipe' });
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'equipe@teste.com', password: 'senha-da-equipe', role: 'equipe' }),
  });
  assert.equal(loginResponse.status, 200);
  token = (await loginResponse.json()).token;

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
      name: '  Cadinho   de teste ',
      segmentId: ' LABORATORIO ',
      material: ' Porcelana   de alta alumina ',
      description: ' Peça criada no teste da API. ',
      price: ' 12.50 ',
    }),
  });
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.name, 'Cadinho de teste');
  assert.equal(created.segmentId, 'laboratorio');
  assert.equal(created.material, 'Porcelana de alta alumina');
  assert.equal(created.description, 'Peça criada no teste da API.');
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

  const validFields = {
    name: 'Produto para rejeitar',
    segmentId: 'laboratorio',
    material: 'Alumina',
    description: 'Produto temporário de validação.',
    price: null,
  };
  const invalidCases = [
    { ...validFields, name: '   ' },
    { ...validFields, name: 'x'.repeat(121) },
    { ...validFields, segmentId: null },
    { ...validFields, segmentId: 'segmento-inexistente' },
    { ...validFields, price: '' },
    { ...validFields, price: 'não-numérico' },
    { ...validFields, price: -1 },
    { ...validFields, price: 1.234 },
  ];
  for (const invalidProduct of invalidCases) {
    const invalidResponse = await fetch(`${baseUrl}/api/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidProduct),
    });
    assert.equal(invalidResponse.status, 400);
    assert.equal(typeof (await invalidResponse.json()).erro, 'string');
  }
  const productsAfterRejections = await (await fetch(`${baseUrl}/api/produtos`)).json();
  assert.equal(productsAfterRejections.length, 1);

  const malformedJsonResponse = await fetch(`${baseUrl}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"name":',
  });
  assert.equal(malformedJsonResponse.status, 400);
  assert.equal((await malformedJsonResponse.json()).erro, 'JSON inválido.');

  const oversizedResponse = await fetch(`${baseUrl}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'x'.repeat(101 * 1024) }),
  });
  assert.equal(oversizedResponse.status, 413);
  assert.equal((await oversizedResponse.json()).erro, 'Corpo da requisição excede o limite de 100 KB.');

  await assert.rejects(run(db, `
    INSERT INTO produtos (name, segment_id, material, description, price)
    VALUES (?, ?, ?, ?, ?)
  `, ['Produto inválido', 'segmento-inexistente', 'Alumina', 'Teste de trigger', null]), /Dados do produto inválidos/);

  const invalidUpdateResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validFields, price: -1 }),
  });
  assert.equal(invalidUpdateResponse.status, 400);
  const unchangedResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`);
  assert.equal((await unchangedResponse.json()).name, 'Cadinho atualizado');

  const deleteResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(`${baseUrl}/api/produtos/${created.id}`);
  assert.equal(missingResponse.status, 404);
});