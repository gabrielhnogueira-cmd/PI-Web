const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { createApp } = require('../app');
const { createSession, createUser } = require('../auth');
const { closeDatabase, initializeDatabase, openDatabase } = require('../database');
const { normalizeCnpj } = require('../routes/orcamentos');

const VALID_CNPJ = '11.222.333/0001-81';
const futureDate = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

describe('API de orçamentos', () => {
	let db;
	let server;
	let base;
	let client;
	let other;
	let staff;

	const call = async (method, path, token, body) => {
		const response = await fetch(`${base}${path}`, {
			method,
			headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		const text = await response.text();
		return { status: response.status, body: text ? JSON.parse(text) : null };
	};

	before(async () => {
		db = openDatabase(':memory:');
		await initializeDatabase(db, { log: false });
		client = await createSession(db, (await createUser(db, { name: 'Cliente', email: 'cliente@teste.com', password: 'senha-1234' })).id);
		other = await createSession(db, (await createUser(db, { name: 'Outro', email: 'outro@teste.com', password: 'senha-1234' })).id);
		staff = await createSession(db, (await createUser(db, { name: 'Equipe', email: 'equipe@teste.com', password: 'senha-1234', role: 'equipe' })).id);
		server = createApp(db).listen(0);
		base = `http://127.0.0.1:${server.address().port}/api/orcamentos`;
	});

	after(async () => {
		await new Promise((resolve) => server.close(resolve));
		await closeDatabase(db);
	});

	test('valida dígitos verificadores do CNPJ', () => {
		assert.equal(normalizeCnpj('11222333000181'), VALID_CNPJ);
		assert.equal(normalizeCnpj('11.222.333/0001-82'), null);
		assert.equal(normalizeCnpj('11111111111111'), null);
	});

	test('exige autenticação', async () => {
		assert.equal((await call('GET', '/')).status, 401);
		assert.equal((await call('POST', '/', null, { lines: [] })).status, 401);
	});

	test('rejeita dados inválidos com 400', async () => {
		const bad = [
			{},
			{ lines: [] },
			{ lines: [{ qty: 5 }] }, // sem produto e sem descrição
			{ lines: [{ productId: 1, qty: 0 }] },
			{ lines: [{ productId: 1, qty: 1 }], cnpj: '11.222.333/0001-82' },
			{ lines: [{ productId: 1, qty: 1 }], desiredDeadline: '2020-01-01' },
			{ lines: [{ productId: 1, qty: 1 }], phone: 'abc' },
		];
		for (const body of bad) assert.equal((await call('POST', '/', client, body)).status, 400, JSON.stringify(body));
		assert.equal((await call('POST', '/', client, { lines: [{ productId: 9999, qty: 1 }] })).status, 400);
	});

	test('fluxo completo: criar, responder, decidir', async () => {
		const created = await call('POST', '/', client, {
			company: 'Fundição Exemplo',
			cnpj: '11222333000181',
			phone: '(19) 99999-0000',
			desiredDeadline: futureDate(30),
			message: 'Preciso de um lote para teste.',
			lines: [
				{ productId: 1, name: 'nome forjado pelo cliente', qty: 10 },
				{ name: 'Peça técnica personalizada', qty: 5, specs: 'Diâmetro 120 mm, uso até 1400 °C' },
			],
		});
		assert.equal(created.status, 201);
		assert.match(created.body.id, /^ORC-\d{4}$/);
		assert.equal(created.body.status, 'Recebido');
		assert.equal(created.body.cnpj, VALID_CNPJ);
		assert.equal(created.body.lines[0].name, 'Canal de vazamento'); // nome vem do catálogo
		assert.equal(created.body.lines[1].productId, undefined);
		const id = created.body.id;

		// Isolamento: outro cliente não enxerga; equipe enxerga.
		assert.equal((await call('GET', `/${id}`, other)).status, 404);
		assert.equal((await call('GET', '/', other)).body.length, 0);
		assert.equal((await call('GET', `/${id}`, staff)).status, 200);

		// Cliente não responde nem muda status; só decide quando "Enviado".
		assert.equal((await call('PATCH', `/${id}/resposta`, client, { responseTotal: 1 })).status, 403);
		assert.equal((await call('PATCH', `/${id}/status`, client, { status: 'Aprovado' })).status, 403);
		assert.equal((await call('PATCH', `/${id}/decisao`, client, { status: 'Aprovado' })).status, 409);

		assert.equal((await call('PATCH', `/${id}/status`, staff, { status: 'Em análise' })).body.status, 'Em análise');
		assert.equal((await call('PATCH', `/${id}/resposta`, staff, {})).status, 400);
		assert.equal((await call('PATCH', `/${id}/resposta`, staff, { responseTotal: 10.123 })).status, 400);

		const answered = await call('PATCH', `/${id}/resposta`, staff, { responseNote: 'Prazo de 15 dias.', responseTotal: 1850.5, validUntil: futureDate(15) });
		assert.equal(answered.status, 200);
		assert.equal(answered.body.status, 'Enviado');
		assert.equal(answered.body.responseTotal, 1850.5);

		assert.equal((await call('PATCH', `/${id}/decisao`, other, { status: 'Aprovado' })).status, 404);
		assert.equal((await call('PATCH', `/${id}/decisao`, client, { status: 'Qualquer' })).status, 400);
		const decided = await call('PATCH', `/${id}/decisao`, client, { status: 'Aprovado' });
		assert.equal(decided.body.status, 'Aprovado');
		assert.equal((await call('PATCH', `/${id}/decisao`, client, { status: 'Recusado' })).status, 409);
		assert.equal((await call('PATCH', `/${id}/resposta`, staff, { responseNote: 'Reabrir' })).status, 409);
	});

	test('IDs inválidos e inexistentes', async () => {
		assert.equal((await call('GET', '/abc', client)).status, 400);
		assert.equal((await call('GET', '/ORC-9999', client)).status, 404);
		assert.equal((await call('PATCH', '/ORC-9999/status', staff, { status: 'Enviado' })).status, 404);
	});
});