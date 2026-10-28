const express = require('express');
const { all, get, run } = require('../database');
const { requireAuth } = require('../auth');
const { cleanText, formatId, parseId, toIso } = require('../format');

const statuses = ['Aguardando confirmação', 'Em produção', 'Enviado'];
const MAX_LINES = 50;
const MAX_QTY = 1000;

async function fetchOrders(db, { userId = null, id = null } = {}) {
	const conditions = [];
	const params = [];
	if (userId !== null) { conditions.push('p.user_id = ?'); params.push(userId); }
	if (id !== null) { conditions.push('p.id = ?'); params.push(id); }
	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const orders = await all(db, `
		SELECT p.id, p.user_id AS userId, u.name AS userName, p.note, p.status, p.created_at AS createdAt
		FROM pedidos p JOIN usuarios u ON u.id = p.user_id
		${where} ORDER BY p.id DESC
	`, params);
	const items = await all(db, `
		SELECT i.pedido_id AS orderId, i.produto_id AS productId, i.name, i.qty
		FROM pedido_itens i JOIN pedidos p ON p.id = i.pedido_id
		${where} ORDER BY i.id
	`, params);

	const linesByOrder = new Map();
	for (const { orderId, ...line } of items) {
		if (!linesByOrder.has(orderId)) linesByOrder.set(orderId, []);
		linesByOrder.get(orderId).push(line);
	}
	return orders.map((order) => ({
		id: formatId('pedido', order.id),
		userId: String(order.userId),
		userName: order.userName,
		lines: linesByOrder.get(order.id) ?? [],
		note: order.note ?? undefined,
		status: order.status,
		createdAt: toIso(order.createdAt),
	}));
}

function validateOrder(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { errors: { body: 'Envie um objeto JSON com os dados do pedido.' } };
	}

	const errors = {};
	const quantities = new Map();
	if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > MAX_LINES) {
		errors.lines = `Informe de 1 a ${MAX_LINES} itens.`;
	} else {
		for (const line of body.lines) {
			const productId = line?.productId;
			const qty = line?.qty;
			if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
				errors.lines = `Cada item precisa de um produto válido e quantidade de 1 a ${MAX_QTY}.`;
				break;
			}
			quantities.set(productId, (quantities.get(productId) ?? 0) + qty);
		}
	}

	let note = null;
	if (body.note !== undefined && body.note !== null && body.note !== '') {
		note = cleanText(body.note, 500);
		if (!note) errors.note = 'As observações devem ter até 500 caracteres.';
	}

	if (Object.keys(errors).length > 0) return { errors };
	return { value: { quantities, note } };
}

function createOrdersRouter(db) {
	const router = express.Router();

	router.get('/', requireAuth(db), async (request, response) => {
		const orders = await fetchOrders(db, { userId: request.user.role === 'equipe' ? null : request.user.id });
		response.json(orders);
	});

	router.post('/', requireAuth(db), async (request, response) => {
		const validation = validateOrder(request.body);
		if (validation.errors) return response.status(400).json({ erro: 'Dados do pedido inválidos.', campos: validation.errors });

		const { quantities, note } = validation.value;
		const lines = [];
		for (const [productId, qty] of quantities) {
			const product = await get(db, 'SELECT id, name, price FROM produtos WHERE id = ?', [productId]);
			if (!product) return response.status(400).json({ erro: `Produto ${productId} não existe no catálogo.` });
			lines.push({ product, qty });
		}

		const created = await run(db, 'INSERT INTO pedidos (user_id, note) VALUES (?, ?)', [request.user.id, note]);
		try {
			for (const { product, qty } of lines) {
				await run(db, `
					INSERT INTO pedido_itens (pedido_id, produto_id, name, qty, unit_price) VALUES (?, ?, ?, ?, ?)
				`, [created.lastID, product.id, product.name, qty, product.price]);
			}
		} catch (error) {
			await run(db, 'DELETE FROM pedidos WHERE id = ?', [created.lastID]);
			throw error;
		}

		const [order] = await fetchOrders(db, { id: created.lastID });
		response.location(`/api/pedidos/${order.id}`).status(201).json(order);
	});

	router.patch('/:id/status', requireAuth(db, 'equipe'), async (request, response) => {
		const id = parseId('pedido', request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });
		const status = request.body?.status;
		if (!statuses.includes(status)) {
			return response.status(400).json({ erro: `Status inválido. Use: ${statuses.join(', ')}.` });
		}

		const result = await run(db, 'UPDATE pedidos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
		if (result.changes === 0) return response.status(404).json({ erro: 'Pedido não encontrado.' });
		const [order] = await fetchOrders(db, { id });
		response.json(order);
	});

	return router;
}

module.exports = { createOrdersRouter, statuses };
