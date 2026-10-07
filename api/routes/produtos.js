const express = require('express');
const { all, get, run } = require('../database');

const segmentIds = new Set(['fundicao', 'laboratorio', 'analise', 'aquario']);
const productFields = `
	id,
	name,
	segment_id AS segmentId,
	material,
	description,
	price,
	created_at AS createdAt,
	updated_at AS updatedAt
`;

function parseId(value) {
	if (!/^\d+$/.test(value)) return null;
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateProduct(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { error: 'Envie um objeto JSON com os dados do produto.' };
	}

	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const segmentId = typeof body.segmentId === 'string' ? body.segmentId : '';
	const material = typeof body.material === 'string' ? body.material.trim() : '';
	const description = typeof body.description === 'string' ? body.description.trim() : '';
	const price = body.price === undefined || body.price === null ? null : Number(body.price);

	if (!name || !segmentIds.has(segmentId) || !material || !description) {
		return { error: 'Informe name, segmentId válido, material e description.' };
	}
	if (price !== null && (!Number.isFinite(price) || price < 0)) {
		return { error: 'price deve ser um número maior ou igual a zero, ou null.' };
	}

	return { value: { name, segmentId, material, description, price } };
}

function createProductsRouter(db) {
	const router = express.Router();

	router.get('/', async (request, response) => {
		const products = await all(db, `SELECT ${productFields} FROM produtos ORDER BY id`);
		response.json(products);
	});

	router.get('/:id', async (request, response) => {
		const id = parseId(request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });

		const product = await get(db, `SELECT ${productFields} FROM produtos WHERE id = ?`, [id]);
		if (!product) return response.status(404).json({ erro: 'Produto não encontrado.' });
		response.json(product);
	});

	router.post('/', async (request, response) => {
		const validation = validateProduct(request.body);
		if (validation.error) return response.status(400).json({ erro: validation.error });

		const { name, segmentId, material, description, price } = validation.value;
		const result = await run(db, `
			INSERT INTO produtos (name, segment_id, material, description, price)
			VALUES (?, ?, ?, ?, ?)
		`, [name, segmentId, material, description, price]);
		const product = await get(db, `SELECT ${productFields} FROM produtos WHERE id = ?`, [result.lastID]);
		response.location(`/api/produtos/${result.lastID}`).status(201).json(product);
	});

	router.put('/:id', async (request, response) => {
		const id = parseId(request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });

		const validation = validateProduct(request.body);
		if (validation.error) return response.status(400).json({ erro: validation.error });
		const existing = await get(db, 'SELECT id FROM produtos WHERE id = ?', [id]);
		if (!existing) return response.status(404).json({ erro: 'Produto não encontrado.' });

		const { name, segmentId, material, description, price } = validation.value;
		await run(db, `
			UPDATE produtos
			SET name = ?, segment_id = ?, material = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`, [name, segmentId, material, description, price, id]);
		const product = await get(db, `SELECT ${productFields} FROM produtos WHERE id = ?`, [id]);
		response.json(product);
	});

	router.delete('/:id', async (request, response) => {
		const id = parseId(request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });

		const result = await run(db, 'DELETE FROM produtos WHERE id = ?', [id]);
		if (result.changes === 0) return response.status(404).json({ erro: 'Produto não encontrado.' });
		response.status(204).end();
	});

	return router;
}

module.exports = { createProductsRouter };
