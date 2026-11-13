const ticketModel = require('../models/ticketModel');
const { cleanText, parseId } = require('../format');

const statuses = ['Aberto', 'Respondido', 'Encerrado'];

function createTicketController(db) {
	return {
		async list(request, response) {
			const userId = request.user.role === 'equipe' ? null : request.user.id;
			response.json(await ticketModel.listTickets(db, { userId }));
		},
		async create(request, response) {
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
				const order = orderId && await ticketModel.findOrderOwner(db, orderId);
				if (!order || (request.user.role !== 'equipe' && order.userId !== request.user.id)) {
					errors.orderId = 'Pedido não encontrado.';
				}
			}
			if (Object.keys(errors).length > 0) return response.status(400).json({ erro: 'Dados do chamado inválidos.', campos: errors });

			const id = await ticketModel.createTicket(db, {
				userId: request.user.id,
				orderId,
				subject,
				message,
			});
			const [ticket] = await ticketModel.listTickets(db, { id });
			response.location(`/api/chamados/${ticket.id}`).status(201).json(ticket);
		},
		async updateStatus(request, response) {
			const id = parseId('chamado', request.params.id);
			if (!id) return response.status(400).json({ erro: 'ID inválido.' });
			const status = request.body?.status;
			if (!statuses.includes(status)) {
				return response.status(400).json({ erro: `Status inválido. Use: ${statuses.join(', ')}.` });
			}
			if (!await ticketModel.updateTicketStatus(db, id, status)) return response.status(404).json({ erro: 'Chamado não encontrado.' });
			const [ticket] = await ticketModel.listTickets(db, { id });
			response.json(ticket);
		},
	};
}

module.exports = { createTicketController, statuses };
