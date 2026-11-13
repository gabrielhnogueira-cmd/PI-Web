const userModel = require('../models/userModel');
const {
	PASSWORD_MAX,
	PASSWORD_MIN,
	createSession,
	hashPassword,
	publicUser,
	verifyPassword,
} = require('../auth');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const invalidCredentials = 'E-mail ou senha não conferem.';

function validateRegistration(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { errors: { body: 'Envie um objeto JSON com os dados do cadastro.' } };
	}

	const errors = {};
	const name = typeof body.name === 'string' ? body.name.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
	if (!name || name.length > 120) errors.name = 'Informe o nome com até 120 caracteres.';

	const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
	if (!emailPattern.test(email) || email.length > 254) errors.email = 'Informe um e-mail válido.';

	let company = null;
	if (body.company !== undefined && body.company !== null && body.company !== '') {
		company = typeof body.company === 'string' ? body.company.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
		if (!company || company.length > 120) errors.company = 'Informe a empresa com até 120 caracteres.';
	}

	const password = body.password;
	if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
		errors.password = `A senha deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`;
	}

	if (Object.keys(errors).length > 0) return { errors };
	return { value: { name, email, company, password } };
}

function createAuthController(db) {
	const failures = new Map();
	let dummyHash;

	const limiterKey = (request, email) => `${request.ip}|${email}`;
	const isLimited = (key) => {
		const entry = failures.get(key);
		if (!entry) return false;
		if (Date.now() - entry.since > LOGIN_WINDOW_MS) {
			failures.delete(key);
			return false;
		}
		return entry.count >= LOGIN_MAX_FAILURES;
	};
	const registerFailure = (key) => {
		if (failures.size > 10000) failures.clear();
		const entry = failures.get(key);
		if (entry && Date.now() - entry.since <= LOGIN_WINDOW_MS) entry.count += 1;
		else failures.set(key, { count: 1, since: Date.now() });
	};

	return {
		async register(request, response) {
			const validation = validateRegistration(request.body);
			if (validation.errors) {
				return response.status(400).json({ erro: 'Dados de cadastro inválidos.', campos: validation.errors });
			}

			const { name, email, company, password } = validation.value;
			const duplicated = { erro: 'Este e-mail já tem cadastro. Tente entrar.' };
			if (await userModel.findUserByEmail(db, email)) return response.status(409).json(duplicated);

			let user;
			try {
				const passwordHash = await hashPassword(password);
				user = await userModel.createUser(db, { name, email, company, passwordHash });
			} catch (error) {
				if (error.code === 'SQLITE_CONSTRAINT' && /UNIQUE/i.test(error.message)) {
					return response.status(409).json(duplicated);
				}
				throw error;
			}
			const token = await createSession(db, user.id);
			response.status(201).json({ token, user: publicUser(user) });
		},
		async login(request, response) {
			const body = request.body && typeof request.body === 'object' ? request.body : {};
			const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
			const password = typeof body.password === 'string' ? body.password : '';
			const role = body.role === 'equipe' || body.role === 'cliente' ? body.role : null;
			if (!email || !password || password.length > PASSWORD_MAX) {
				return response.status(400).json({ erro: 'Informe e-mail e senha.' });
			}

			const key = limiterKey(request, email);
			if (isLimited(key)) {
				return response.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });
			}

			const user = await userModel.findUserByEmail(db, email);
			dummyHash ??= await hashPassword('senha-inexistente');
			const passwordMatches = await verifyPassword(password, user ? user.password_hash : dummyHash);
			if (!user || !passwordMatches || (role && user.role !== role)) {
				registerFailure(key);
				return response.status(401).json({ erro: invalidCredentials });
			}

			failures.delete(key);
			const token = await createSession(db, user.id);
			response.json({ token, user: publicUser(user) });
		},
		async logout(request, response) {
			await userModel.deleteSession(db, request.tokenHash);
			response.status(204).end();
		},
		me(request, response) {
			response.json({ user: publicUser(request.user) });
		},
	};
}

module.exports = { createAuthController };
