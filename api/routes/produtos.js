const express = require('express');
const { all, get, run } = require('../database');
const { requireAuth } = require('../auth');

const segmentIds = new Set(['fundicao', 'laboratorio', 'analise', 'aquario']);
const fieldLimits = { name: 120, material: 100, description: 500 };
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
		return { errors: { body: 'Envie um objeto JSON com os dados do produto.' } };
	}

	const errors = {};
	const text = {};
	for (const field of Object.keys(fieldLimits)) {
		if (typeof body[field] !== 'string') {
			errors[field] = 'Deve ser um texto.';
			continue;
		}
		text[field] = body[field].normalize('NFC').trim().replace(/\s+/g, ' ');
		if (!text[field]) errors[field] = 'É obrigatório.';
		else if (text[field].length > fieldLimits[field]) errors[field] = `Deve ter no máximo ${fieldLimits[field]} caracteres.`;
	}

	const segmentId = typeof body.segmentId === 'string' ? body.segmentId.trim().toLocaleLowerCase('pt-BR') : '';
	if (typeof body.segmentId !== 'string' || !segmentIds.has(segmentId)) {
		errors.segmentId = `Use um dos segmentos: ${[...segmentIds].join(', ')}.`;
	}

	let price = null;
	if (body.price !== undefined && body.price !== null) {
		let normalizedPrice;
		if (typeof body.price === 'number') {
			normalizedPrice = body.price;
		} else if (typeof body.price === 'string' && /^\d+(?:[.,]\d{1,2})?$/.test(body.price.trim())) {
			normalizedPrice = Number(body.price.trim().replace(',', '.'));
		} else {
			errors.price = 'Informe um número não negativo com até duas casas decimais, ou null.';
		}

		if (normalizedPrice !== undefined) {
			const cents = Math.round((normalizedPrice + Number.EPSILON) * 100);
			if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0 || !Number.isSafeInteger(cents)
				|| Math.abs(normalizedPrice * 100 - cents) > 1e-7) {
				errors.price = 'Informe um número não negativo com até duas casas decimais, ou null.';
			} else {
				price = cents / 100;
			}
		}
	}

	if (Object.keys(errors).length > 0) return { errors };

	return {
		value: {
			name: text.name,
			segmentId,
			material: text.material,
			description: text.description,
			price,
		},
	};
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

	const teamOnly = requireAuth(db, 'equipe');

	router.post('/', teamOnly, async (request, response) => {
		const validation = validateProduct(request.body);
		if (validation.errors) return response.status(400).json({ erro: 'Dados do produto inválidos.', campos: validation.errors });

		const { name, segmentId, material, description, price } = validation.value;
		const result = await run(db, `
			INSERT INTO produtos (name, segment_id, material, description, price)
			VALUES (?, ?, ?, ?, ?)
		`, [name, segmentId, material, description, price]);
		const product = await get(db, `SELECT ${productFields} FROM produtos WHERE id = ?`, [result.lastID]);
		response.location(`/api/produtos/${result.lastID}`).status(201).json(product);
	});

	router.put('/:id', teamOnly, async (request, response) => {
		const id = parseId(request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });

		const validation = validateProduct(request.body);
		if (validation.errors) return response.status(400).json({ erro: 'Dados do produto inválidos.', campos: validation.errors });
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

	router.delete('/:id', teamOnly, async (request, response) => {
		const id = parseId(request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });

		const result = await run(db, 'DELETE FROM produtos WHERE id = ?', [id]);
		if (result.changes === 0) return response.status(404).json({ erro: 'Produto não encontrado.' });
		response.status(204).end();
	});

	return router;
}

module.exports = { createProductsRouter };
