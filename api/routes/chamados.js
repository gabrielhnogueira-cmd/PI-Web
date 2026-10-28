const express = require('express');
const { all, get, run } = require('../database');
const { requireAuth } = require('../auth');
const { cleanText, formatId, parseId, toIso } = require('../format');

const statuses = ['Aberto', 'Respondido', 'Encerrado'];

async function fetchTickets(db, { userId = null, id = null } = {}) {
	const conditions = [];
	const params = [];
	if (userId !== null) { conditions.push('c.user_id = ?'); params.push(userId); }
	if (id !== null) { conditions.push('c.id = ?'); params.push(id); }
	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const tickets = await all(db, `
		SELECT c.id, c.user_id AS userId, u.name AS userName, c.subject, c.pedido_id AS orderId,
			c.message, c.status, c.created_at AS createdAt
		FROM chamados c JOIN usuarios u ON u.id = c.user_id
		${where} ORDER BY c.id DESC
	`, params);
	return tickets.map((ticket) => ({
		id: formatId('chamado', ticket.id),
		userId: String(ticket.userId),
		userName: ticket.userName,
		subject: ticket.subject,
		orderId: ticket.orderId ? formatId('pedido', ticket.orderId) : undefined,
		message: ticket.message,
		status: ticket.status,
		createdAt: toIso(ticket.createdAt),
	}));
}

function createTicketsRouter(db) {
	const router = express.Router();

	router.get('/', requireAuth(db), async (request, response) => {
		const tickets = await fetchTickets(db, { userId: request.user.role === 'equipe' ? null : request.user.id });
		response.json(tickets);
	});

	router.post('/', requireAuth(db), async (request, response) => {
		const body = request.body;
		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return response.status(400).json({ erro: 'Dados do chamado inválidos.', campos: { body: 'Envie um objeto JSON.' } });
		}

		const errors = {};
		const subject = cleanText(body.subject, 120);
		if (!subject) errors.subject = 'Informe o assunto com até 120 caracteres.';
		const message = cleanText(body.message, 2000);
		if (!message) errors.message = 'Informe a mensagem com até 2000 caracteres.';

		let orderId = null;
		if (body.orderId !== undefined && body.orderId !== null && body.orderId !== '') {
			orderId = parseId('pedido', body.orderId);
			const order = orderId && await get(db, 'SELECT id, user_id FROM pedidos WHERE id = ?', [orderId]);
			if (!order || (request.user.role !== 'equipe' && order.user_id !== request.user.id)) {
				errors.orderId = 'Pedido não encontrado.';
			}
		}
		if (Object.keys(errors).length > 0) return response.status(400).json({ erro: 'Dados do chamado inválidos.', campos: errors });

		const created = await run(db, `
			INSERT INTO chamados (user_id, pedido_id, subject, message) VALUES (?, ?, ?, ?)
		`, [request.user.id, orderId, subject, message]);
		const [ticket] = await fetchTickets(db, { id: created.lastID });
		response.location(`/api/chamados/${ticket.id}`).status(201).json(ticket);
	});

	router.patch('/:id/status', requireAuth(db, 'equipe'), async (request, response) => {
		const id = parseId('chamado', request.params.id);
		if (!id) return response.status(400).json({ erro: 'ID inválido.' });
		const status = request.body?.status;
		if (!statuses.includes(status)) {
			return response.status(400).json({ erro: `Status inválido. Use: ${statuses.join(', ')}.` });
		}

		const result = await run(db, 'UPDATE chamados SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
		if (result.changes === 0) return response.status(404).json({ erro: 'Chamado não encontrado.' });
		const [ticket] = await fetchTickets(db, { id });
		response.json(ticket);
	});

	return router;
}

module.exports = { createTicketsRouter, statuses };
