const { randomUUID } = require('node:crypto');
const { all, get, run } = require('../database');
const { formatId, toIso } = require('../format');

async function listOrders(db, { userId = null, id = null } = {}) {
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
	const payments = await all(db, `
		SELECT g.pedido_id AS orderId, g.method, g.status, g.amount,
			g.transaction_id AS transactionId, g.created_at AS createdAt
		FROM pagamentos g JOIN pedidos p ON p.id = g.pedido_id
		${where}
	`, params);

	const linesByOrder = new Map();
	for (const { orderId, ...line } of items) {
		if (!linesByOrder.has(orderId)) linesByOrder.set(orderId, []);
		linesByOrder.get(orderId).push(line);
	}
	const paymentsByOrder = new Map(payments.map(({ orderId, createdAt, ...payment }) => [
		orderId,
		{ ...payment, createdAt: toIso(createdAt) },
	]));
	return orders.map((order) => ({
		id: formatId('pedido', order.id),
		userId: String(order.userId),
		userName: order.userName,
		lines: linesByOrder.get(order.id) ?? [],
		...(paymentsByOrder.has(order.id) ? { payment: paymentsByOrder.get(order.id) } : {}),
		note: order.note ?? undefined,
		status: order.status,
		createdAt: toIso(order.createdAt),
	}));
}

function findProductForOrder(db, productId) {
	return get(db, 'SELECT id, name, price FROM produtos WHERE id = ?', [productId]);
}

async function createOrder(db, { userId, note, lines, payment }) {
	const created = await run(db, 'INSERT INTO pedidos (user_id, note) VALUES (?, ?)', [userId, note]);
	try {
		for (const { product, qty } of lines) {
			await run(db, `
				INSERT INTO pedido_itens (pedido_id, produto_id, name, qty, unit_price) VALUES (?, ?, ?, ?, ?)
			`, [created.lastID, product.id, product.name, qty, product.price]);
		}
		if (payment) {
			await run(db, `
				INSERT INTO pagamentos (pedido_id, method, status, amount, transaction_id)
				VALUES (?, ?, 'Aprovado', ?, ?)
			`, [created.lastID, payment.method, payment.amount, `SIM-${randomUUID()}`]);
		}
	} catch (error) {
		await run(db, 'DELETE FROM pedidos WHERE id = ?', [created.lastID]);
		throw error;
	}
	return created.lastID;
}

async function updateOrderStatus(db, id, status) {
	const result = await run(db, 'UPDATE pedidos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
	return result.changes > 0;
}

module.exports = { createOrder, findProductForOrder, listOrders, updateOrderStatus };
