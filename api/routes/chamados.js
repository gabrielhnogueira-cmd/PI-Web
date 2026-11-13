const express = require('express');
const { createTicketController, statuses } = require('../controllers/ticketController');
const { requireAuth } = require('../auth');

function createTicketsRouter(db) {
	const router = express.Router();
	const controller = createTicketController(db);

	router.get('/', requireAuth(db), controller.list);
	router.post('/', requireAuth(db), controller.create);
	router.patch('/:id/status', requireAuth(db, 'equipe'), controller.updateStatus);

	return router;
}

module.exports = { createTicketsRouter, statuses };
