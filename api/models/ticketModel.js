const { all, get, run } = require('../database');
const { formatId, toIso } = require('../format');

async function listTickets(db, { userId = null, id = null } = {}) {
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

function findOrderOwner(db, id) {
	return get(db, 'SELECT id, user_id AS userId FROM pedidos WHERE id = ?', [id]);
}

async function createTicket(db, ticket) {
	const created = await run(db, `
		INSERT INTO chamados (user_id, pedido_id, subject, message) VALUES (?, ?, ?, ?)
	`, [ticket.userId, ticket.orderId, ticket.subject, ticket.message]);
	return created.lastID;
}

async function updateTicketStatus(db, id, status) {
	const result = await run(db, 'UPDATE chamados SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
	return result.changes > 0;
}

module.exports = { createTicket, findOrderOwner, listTickets, updateTicketStatus };
