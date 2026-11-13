const crypto = require('node:crypto');
const { promisify } = require('node:util');
const userModel = require('./models/userModel');

const scrypt = promisify(crypto.scrypt);
const SESSION_DAYS = 7;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

async function hashPassword(password) {
	const salt = crypto.randomBytes(16);
	const key = await scrypt(password, salt, 64);
	return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
	const [scheme, saltHex, keyHex] = String(stored).split('$');
	if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
	const expected = Buffer.from(keyHex, 'hex');
	const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
	return crypto.timingSafeEqual(actual, expected);
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function createSession(db, userId) {
	const token = crypto.randomBytes(32).toString('base64url');
	await userModel.deleteExpiredSessions(db);
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
		.toISOString()
		.replace('T', ' ')
		.slice(0, 19);
	await userModel.saveSession(db, { tokenHash: hashToken(token), userId, expiresAt });
	return token;
}

const publicUser = (row) => ({
	id: String(row.id),
	name: row.name,
	email: row.email,
	role: row.role,
	company: row.company ?? undefined,
});

function requireAuth(db, ...roles) {
	return async (request, response, next) => {
		const match = /^Bearer (\S+)$/.exec(request.get('authorization') || '');
		if (!match) return response.status(401).json({ erro: 'Entre na sua conta para continuar.' });

		const tokenHash = hashToken(match[1]);
		const user = await userModel.findSessionUser(db, tokenHash);
		if (!user) return response.status(401).json({ erro: 'Sessão inválida ou expirada. Entre novamente.' });
		if (roles.length > 0 && !roles.includes(user.role)) {
			return response.status(403).json({ erro: 'Você não tem permissão para esta ação.' });
		}

		request.user = user;
		request.tokenHash = tokenHash;
		next();
	};
}

async function createUser(db, { name, email, company = null, password, role = 'cliente' }) {
	const passwordHash = await hashPassword(password);
	return userModel.createUser(db, { name, email, company, role, passwordHash });
}

// Cria a conta da equipe a partir de variáveis de ambiente, sem senha no código-fonte.
async function ensureAdmin(db, { email, password, name = 'Equipe Gramanse' }) {
	const normalizedEmail = String(email).trim().toLowerCase();
	if (String(password).length < PASSWORD_MIN || String(password).length > PASSWORD_MAX) {
		throw new Error(`ADMIN_PASSWORD deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`);
	}
	const existing = await userModel.findUserByEmail(db, normalizedEmail);
	if (!existing) {
		await createUser(db, { name, email: normalizedEmail, password, role: 'equipe' });
		return 'created';
	}
	if (existing.role !== 'equipe') {
		await userModel.promoteToTeam(db, existing.id);
		return 'promoted';
	}
	return 'unchanged';
}

module.exports = {
	PASSWORD_MAX,
	PASSWORD_MIN,
	createSession,
	createUser,
	ensureAdmin,
	hashPassword,
	publicUser,
	requireAuth,
	verifyPassword,
};
