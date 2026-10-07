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
