const express = require('express');
const { createAuthController } = require('../controllers/authController');
const { requireAuth } = require('../auth');

function createAuthRouter(db) {
	const router = express.Router();
	const controller = createAuthController(db);

	router.post('/register', controller.register);
	router.post('/login', controller.login);
	router.post('/logout', requireAuth(db), controller.logout);
	router.get('/me', requireAuth(db), controller.me);

	return router;
}

module.exports = { createAuthRouter };
