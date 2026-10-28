const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { get, run } = require('./database');

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
	await run(db, "DELETE FROM sessoes WHERE expires_at <= datetime('now')");
	await run(
		db,
		`INSERT INTO sessoes (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`,
		[hashToken(token), userId],
	);
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
		const user = await get(db, `
			SELECT u.id, u.name, u.email, u.company, u.role
			FROM sessoes s JOIN usuarios u ON u.id = s.user_id
			WHERE s.token_hash = ? AND s.expires_at > datetime('now')
		`, [tokenHash]);
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
	const result = await run(db, `
		INSERT INTO usuarios (name, email, company, role, password_hash) VALUES (?, ?, ?, ?, ?)
	`, [name, email, company, role, passwordHash]);
	return get(db, 'SELECT id, name, email, company, role FROM usuarios WHERE id = ?', [result.lastID]);
}

// Cria a conta da equipe a partir de variáveis de ambiente, sem senha no código-fonte.
async function ensureAdmin(db, { email, password, name = 'Equipe Gramanse' }) {
	const normalizedEmail = String(email).trim().toLowerCase();
	if (String(password).length < PASSWORD_MIN || String(password).length > PASSWORD_MAX) {
		throw new Error(`ADMIN_PASSWORD deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`);
	}
	const existing = await get(db, 'SELECT id, role FROM usuarios WHERE email = ?', [normalizedEmail]);
	if (!existing) {
		await createUser(db, { name, email: normalizedEmail, password, role: 'equipe' });
		return 'created';
	}
	if (existing.role !== 'equipe') {
		await run(db, "UPDATE usuarios SET role = 'equipe' WHERE id = ?", [existing.id]);
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
