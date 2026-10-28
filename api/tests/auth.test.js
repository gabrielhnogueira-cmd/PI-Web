const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('../app');
const { createUser, ensureAdmin } = require('../auth');
const { closeDatabase, get, initializeDatabase, openDatabase } = require('../database');

async function setup(context) {
  const db = openDatabase(':memory:');
  await initializeDatabase(db, { log: false });
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  context.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await closeDatabase(db);
  });

  const call = async (method, path, { token, body } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  };
  return { db, call };
}

test('cadastro, login e sessão guardam usuários no banco com senha protegida', async (context) => {
  const { db, call } = await setup(context);

  const invalid = await call('POST', '/api/auth/register', { body: { name: '', email: 'x', password: '123' } });
  assert.equal(invalid.status, 400);
  assert.ok(invalid.body.campos.name && invalid.body.campos.email && invalid.body.campos.password);

  const registered = await call('POST', '/api/auth/register', {
    body: { name: '  Maria  Silva ', email: 'Maria@Empresa.com', company: 'Fundição X', password: 'senha-segura-1' },
  });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.user.email, 'maria@empresa.com');
  assert.equal(registered.body.user.name, 'Maria Silva');
  assert.equal(registered.body.user.role, 'cliente');
  assert.equal(registered.body.user.password_hash, undefined);

  const stored = await get(db, 'SELECT password_hash FROM usuarios WHERE email = ?', ['maria@empresa.com']);
  assert.match(stored.password_hash, /^scrypt\$/);
  assert.ok(!stored.password_hash.includes('senha-segura-1'));

  const duplicate = await call('POST', '/api/auth/register', {
    body: { name: 'Outra', email: 'MARIA@empresa.com', password: 'outra-senha-1' },
  });
  assert.equal(duplicate.status, 409);

  const wrongPassword = await call('POST', '/api/auth/login', { body: { email: 'maria@empresa.com', password: 'errada-errada' } });
  assert.equal(wrongPassword.status, 401);
  const wrongRole = await call('POST', '/api/auth/login', {
    body: { email: 'maria@empresa.com', password: 'senha-segura-1', role: 'equipe' },
  });
  assert.equal(wrongRole.status, 401);

  const login = await call('POST', '/api/auth/login', {
    body: { email: 'maria@empresa.com', password: 'senha-segura-1', role: 'cliente' },
  });
  assert.equal(login.status, 200);
  const me = await call('GET', '/api/auth/me', { token: login.body.token });
  assert.equal(me.body.user.email, 'maria@empresa.com');

  assert.equal((await call('GET', '/api/auth/me')).status, 401);
  assert.equal((await call('POST', '/api/auth/logout', { token: login.body.token })).status, 204);
  assert.equal((await call('GET', '/api/auth/me', { token: login.body.token })).status, 401);
});

test('login bloqueia tentativas repetidas com senha errada', async (context) => {
  const { db, call } = await setup(context);
  await createUser(db, { name: 'Ana', email: 'ana@teste.com', password: 'senha-da-ana-1' });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const failed = await call('POST', '/api/auth/login', { body: { email: 'ana@teste.com', password: 'senha-errada-1' } });
    assert.equal(failed.status, 401);
  }
  const blocked = await call('POST', '/api/auth/login', { body: { email: 'ana@teste.com', password: 'senha-da-ana-1' } });
  assert.equal(blocked.status, 429);
});

test('pedidos e chamados são gravados no banco e respeitam permissões', async (context) => {
  const { db, call } = await setup(context);
  assert.equal(await ensureAdmin(db, { email: 'Equipe@Gramanse.com', password: 'senha-da-equipe' }), 'created');
  assert.equal(await ensureAdmin(db, { email: 'equipe@gramanse.com', password: 'senha-da-equipe' }), 'unchanged');
  const admin = (await call('POST', '/api/auth/login', {
    body: { email: 'equipe@gramanse.com', password: 'senha-da-equipe', role: 'equipe' },
  })).body;

  const client = async (name, email) => (await call('POST', '/api/auth/register', {
    body: { name, email, password: 'senha-do-cliente' },
  })).body;
  const maria = await client('Maria', 'maria@teste.com');
  const joao = await client('João', 'joao@teste.com');

  assert.equal((await call('POST', '/api/pedidos', { body: { lines: [{ productId: 1, qty: 1 }] } })).status, 401);
  for (const lines of [[], [{ productId: 1, qty: 0 }], [{ productId: 999, qty: 1 }], 'x']) {
    const rejected = await call('POST', '/api/pedidos', { token: maria.token, body: { lines } });
    assert.equal(rejected.status, 400);
  }

  const created = await call('POST', '/api/pedidos', {
    token: maria.token,
    body: { lines: [{ productId: 1, qty: 2 }, { productId: 1, qty: 1 }, { productId: 3, qty: 4 }], note: ' Urgente ' },
  });
  assert.equal(created.status, 201);
  assert.match(created.body.id, /^PED-\d{6}$/);
  assert.equal(created.body.userName, 'Maria');
  assert.equal(created.body.status, 'Aguardando confirmação');
  assert.equal(created.body.note, 'Urgente');
  assert.deepEqual(created.body.lines, [
    { productId: 1, name: 'Canal de vazamento', qty: 3 },
    { productId: 3, name: 'Cadinho de análise', qty: 4 },
  ]);

  const mariaOrders = (await call('GET', '/api/pedidos', { token: maria.token })).body;
  const joaoOrders = (await call('GET', '/api/pedidos', { token: joao.token })).body;
  const adminOrders = (await call('GET', '/api/pedidos', { token: admin.token })).body;
  assert.equal(mariaOrders.length, 1);
  assert.equal(joaoOrders.length, 0);
  assert.equal(adminOrders.length, 1);

  const clientStatus = await call('PATCH', `/api/pedidos/${created.body.id}/status`, {
    token: maria.token,
    body: { status: 'Enviado' },
  });
  assert.equal(clientStatus.status, 403);
  const badStatus = await call('PATCH', `/api/pedidos/${created.body.id}/status`, { token: admin.token, body: { status: 'Pago' } });
  assert.equal(badStatus.status, 400);
  const updated = await call('PATCH', `/api/pedidos/${created.body.id}/status`, { token: admin.token, body: { status: 'Em produção' } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'Em produção');
  assert.equal((await call('PATCH', '/api/pedidos/PED-999999/status', { token: admin.token, body: { status: 'Enviado' } })).status, 404);

  const foreignTicket = await call('POST', '/api/chamados', {
    token: joao.token,
    body: { subject: 'Dúvida', message: 'Sobre o pedido', orderId: created.body.id },
  });
  assert.equal(foreignTicket.status, 400);

  const ticket = await call('POST', '/api/chamados', {
    token: maria.token,
    body: { subject: 'Acompanhar um pedido', message: 'Qual o prazo?', orderId: created.body.id },
  });
  assert.equal(ticket.status, 201);
  assert.match(ticket.body.id, /^CHM-\d{6}$/);
  assert.equal(ticket.body.orderId, created.body.id);
  assert.equal(ticket.body.status, 'Aberto');
  assert.equal((await call('POST', '/api/chamados', { token: maria.token, body: { subject: ' ', message: '' } })).status, 400);

  assert.equal((await call('GET', '/api/chamados', { token: maria.token })).body.length, 1);
  assert.equal((await call('GET', '/api/chamados', { token: joao.token })).body.length, 0);
  assert.equal((await call('GET', '/api/chamados', { token: admin.token })).body.length, 1);

  assert.equal((await call('PATCH', `/api/chamados/${ticket.body.id}/status`, { token: maria.token, body: { status: 'Encerrado' } })).status, 403);
  const answered = await call('PATCH', `/api/chamados/${ticket.body.id}/status`, { token: admin.token, body: { status: 'Respondido' } });
  assert.equal(answered.body.status, 'Respondido');

  assert.equal((await call('DELETE', '/api/produtos/1', { token: maria.token })).status, 403);
  const persisted = await get(db, 'SELECT COUNT(*) AS total FROM pedido_itens');
  assert.equal(persisted.total, 2);
});
