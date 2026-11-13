const express = require('express');
const { createProductController } = require('../controllers/productController');
const { requireAuth } = require('../auth');

function createProductsRouter(db) {
	const router = express.Router();
	const controller = createProductController(db);
	const teamOnly = requireAuth(db, 'equipe');

	router.get('/', controller.list);
	router.get('/:id', controller.getById);
	router.post('/', teamOnly, controller.create);
	router.put('/:id', teamOnly, controller.update);
	router.delete('/:id', teamOnly, controller.remove);

	return router;
}

module.exports = { createProductsRouter };
