const express = require('express');
const { createOrderController, statuses } = require('../controllers/orderController');
const { requireAuth } = require('../auth');

function createOrdersRouter(db) {
	const router = express.Router();
	const controller = createOrderController(db);

	router.get('/', requireAuth(db), controller.list);
	router.post('/', requireAuth(db), controller.create);
	router.patch('/:id/status', requireAuth(db, 'equipe'), controller.updateStatus);

	return router;
}

module.exports = { createOrdersRouter, statuses };
