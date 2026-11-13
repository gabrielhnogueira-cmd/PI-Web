const { get, run } = require('../database');

function findUserByEmail(db, email) {
	return get(db, `
		SELECT id, name, email, company, role, password_hash
		FROM usuarios WHERE email = ?
	`, [email]);
}

async function createUser(db, { name, email, company, passwordHash, role = 'cliente' }) {
	const result = await run(db, `
		INSERT INTO usuarios (name, email, company, role, password_hash) VALUES (?, ?, ?, ?, ?)
	`, [name, email, company, role, passwordHash]);
	return get(db, 'SELECT id, name, email, company, role FROM usuarios WHERE id = ?', [result.lastID]);
}

function findUserById(db, id) {
	return get(db, 'SELECT id, name, email, company, role FROM usuarios WHERE id = ?', [id]);
}

function promoteToTeam(db, id) {
	return run(db, "UPDATE usuarios SET role = 'equipe' WHERE id = ?", [id]);
}

function deleteExpiredSessions(db) {
	return run(db, "DELETE FROM sessoes WHERE expires_at <= datetime('now')");
}

function saveSession(db, { tokenHash, userId, expiresAt }) {
	return run(db, `
		INSERT INTO sessoes (token_hash, user_id, expires_at) VALUES (?, ?, ?)
	`, [tokenHash, userId, expiresAt]);
}

async function findSessionUser(db, tokenHash) {
	return get(db, `
		SELECT u.id, u.name, u.email, u.company, u.role
		FROM sessoes s JOIN usuarios u ON u.id = s.user_id
		WHERE s.token_hash = ? AND s.expires_at > datetime('now')
	`, [tokenHash]);
}

function deleteSession(db, tokenHash) {
	return run(db, 'DELETE FROM sessoes WHERE token_hash = ?', [tokenHash]);
}

module.exports = {
	createUser,
	deleteExpiredSessions,
	deleteSession,
	findSessionUser,
	findUserByEmail,
	findUserById,
	promoteToTeam,
	saveSession,
};
