const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const defaultPath = process.env.DB_PATH || path.join(__dirname, '../database/catalogo.db');
const seedProducts = [
	['Canal de vazamento', 'fundicao', 'Refratário de alta alumina', 'Componente para condução do metal líquido durante a operação de fundição.', null],
	['Bucha cerâmica', 'fundicao', 'Cerâmica técnica', 'Peça moldada para isolamento e proteção em processos metalúrgicos.', null],
	['Cadinho de análise', 'laboratorio', 'Cerâmica para laboratório', 'Recipiente para procedimentos de análise em laboratório.', null],
	['Barqueta de combustão', 'analise', 'Cerâmica refratária', 'Suporte cerâmico utilizado na preparação de amostras para análise.', null],
	['Mídia biológica', 'aquario', 'Cerâmica porosa', 'Elemento cerâmico desenvolvido para sistemas de filtragem de aquários.', null],
];

function openDatabase(filename = defaultPath) {
	const resolvedPath = filename === ':memory:' ? filename : path.resolve(filename);
	if (resolvedPath !== ':memory:') {
		fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
	}
	return new sqlite3.Database(resolvedPath);
}

function run(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (error) {
			if (error) reject(error);
			else resolve({ lastID: this.lastID, changes: this.changes });
		});
	});
}

function get(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (error, row) => {
			if (error) reject(error);
			else resolve(row);
		});
	});
}

function all(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (error, rows) => {
			if (error) reject(error);
			else resolve(rows);
		});
	});
}

function closeDatabase(db) {
	return new Promise((resolve, reject) => {
		db.close((error) => {
			if (error) reject(error);
			else resolve();
		});
	});
}

async function initializeDatabase(db, { seed = true, log = true, filename = defaultPath } = {}) {
	await run(db, 'PRAGMA foreign_keys = ON');
	await run(db, `
		CREATE TABLE IF NOT EXISTS produtos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			segment_id TEXT NOT NULL,
			material TEXT NOT NULL,
			description TEXT NOT NULL,
			price REAL CHECK (price IS NULL OR price >= 0),
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await run(db, `
		CREATE TRIGGER IF NOT EXISTS produtos_validar_insert
		BEFORE INSERT ON produtos
		WHEN
			length(trim(NEW.name)) = 0 OR length(NEW.name) > 120 OR
			NEW.segment_id NOT IN ('fundicao', 'laboratorio', 'analise', 'aquario') OR
			length(trim(NEW.material)) = 0 OR length(NEW.material) > 100 OR
			length(trim(NEW.description)) = 0 OR length(NEW.description) > 500 OR
			(NEW.price IS NOT NULL AND (NEW.price < 0 OR round(NEW.price, 2) != NEW.price))
		BEGIN
			SELECT RAISE(ABORT, 'Dados do produto inválidos');
		END
	`);
	await run(db, `
		CREATE TRIGGER IF NOT EXISTS produtos_validar_update
		BEFORE UPDATE ON produtos
		WHEN
			length(trim(NEW.name)) = 0 OR length(NEW.name) > 120 OR
			NEW.segment_id NOT IN ('fundicao', 'laboratorio', 'analise', 'aquario') OR
			length(trim(NEW.material)) = 0 OR length(NEW.material) > 100 OR
			length(trim(NEW.description)) = 0 OR length(NEW.description) > 500 OR
			(NEW.price IS NOT NULL AND (NEW.price < 0 OR round(NEW.price, 2) != NEW.price))
		BEGIN
			SELECT RAISE(ABORT, 'Dados do produto inválidos');
		END
	`);

	await run(db, `
		CREATE TABLE IF NOT EXISTS usuarios (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
			email TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK (length(email) BETWEEN 3 AND 254),
			company TEXT CHECK (company IS NULL OR length(company) <= 120),
			role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'equipe')),
			password_hash TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await run(db, `
		CREATE TABLE IF NOT EXISTS sessoes (
			token_hash TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			expires_at TEXT NOT NULL
		)
	`);
	await run(db, `
		CREATE TABLE IF NOT EXISTS pedidos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
			note TEXT CHECK (note IS NULL OR length(note) <= 500),
			status TEXT NOT NULL DEFAULT 'Aguardando confirmação'
				CHECK (status IN ('Aguardando confirmação', 'Em produção', 'Enviado')),
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	// produto_id não é chave estrangeira: o histórico do pedido sobrevive à exclusão do produto.
	await run(db, `
		CREATE TABLE IF NOT EXISTS pedido_itens (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
			produto_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			qty INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 1000),
			unit_price REAL CHECK (unit_price IS NULL OR unit_price >= 0)
		)
	`);
	await run(db, `
		CREATE TABLE IF NOT EXISTS chamados (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
			pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
			subject TEXT NOT NULL CHECK (length(trim(subject)) BETWEEN 1 AND 120),
			message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 2000),
			status TEXT NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Respondido', 'Encerrado')),
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_sessoes_user ON sessoes(user_id)');
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id)');
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id)');
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_chamados_user ON chamados(user_id)');

	if (seed) {
		const result = await get(db, 'SELECT COUNT(*) AS total FROM produtos');
		if (result.total === 0) {
			for (const product of seedProducts) {
				await run(db, `
					INSERT INTO produtos (name, segment_id, material, description, price)
					VALUES (?, ?, ?, ?, ?)
				`, product);
			}
		}
	}

	if (log) console.info(`[db] SQLite conectado em ${filename}`);
}

module.exports = { all, closeDatabase, get, initializeDatabase, openDatabase, run };
