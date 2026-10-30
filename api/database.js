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

// Migração única do catálogo (controlada pela tabela `migracoes`).
// - Define preço apenas nos produtos originais que ainda estão sem preço (não sobrescreve edições do admin).
// - Insere os produtos novos que ainda não existem (comparação por nome).
// ATENÇÃO: preços, materiais e descrições são valores de partida e devem ser validados com a Gramanse.
const catalogMigration = {
	id: '2026-11-catalogo-precos',
	priceFixes: [
		['Canal de vazamento', 120.00],
		['Bucha cerâmica', 38.00],
		['Cadinho de análise', 16.50],
		['Barqueta de combustão', 18.50],
		['Mídia biológica', 34.90],
	],
	products: [
		['Cadinho de argila-grafita 5 kg', 'fundicao', 'Argila-grafita', 'Cadinho para fusão e manutenção de metais em fornos de fundição. Capacidade nominal de 5 kg; formatos e limites de temperatura sob consulta.', 189.00],
		['Copo de vazamento refratário', 'fundicao', 'Refratário sílico-aluminoso', 'Funil moldado para alimentar o molde durante o vazamento do metal líquido.', 42.00],
		['Tubo de proteção para termopar', 'fundicao', 'Alumina sinterizada', 'Protege o sensor de temperatura em fornos e banhos metálicos. Comprimentos e diâmetros sob consulta.', 78.00],
		['Filtro cerâmico de espuma 50×50×22 mm', 'fundicao', 'Espuma cerâmica', 'Retém impurezas do metal líquido no sistema de canais, melhorando a qualidade da peça fundida.', 14.50],
		['Placa refratária 200×200×20 mm', 'fundicao', 'Refratário de alta alumina', 'Placa para revestimento e apoio em fornos e estufas de alta temperatura.', 96.00],
		['Cadinho de porcelana 30 mL', 'laboratorio', 'Porcelana', 'Cadinho para calcinação e secagem de amostras em mufla.', 12.90],
		['Cápsula de evaporação 100 mL', 'laboratorio', 'Porcelana', 'Para evaporação de soluções e concentração de amostras.', 24.00],
		['Almofariz com pistilo 100 mm', 'laboratorio', 'Porcelana', 'Conjunto para trituração e homogeneização de amostras sólidas.', 58.00],
		['Tubo de combustão de alumina', 'laboratorio', 'Alumina', 'Tubo para fornos tubulares em ensaios a alta temperatura. Dimensões sob consulta.', 165.00],
		['Cadinho para analisador C/S (pacote com 25)', 'analise', 'Cerâmica refratária', 'Cadinho para análise de carbono e enxofre por combustão. Confirme o modelo do equipamento antes do pedido.', 185.00],
		['Cadinho C/S pré-queimado (pacote com 100)', 'analise', 'Cerâmica refratária pré-queimada', 'Cadinho queimado previamente, pronto para uso nos ensaios de carbono e enxofre. Confirme o modelo do equipamento antes do pedido.', 590.00],
		['Tampa para cadinho C/S (pacote com 25)', 'analise', 'Cerâmica refratária', 'Tampa cerâmica para cadinhos de análise de carbono e enxofre.', 150.00],
		['Anéis cerâmicos de filtragem (1 kg)', 'aquario', 'Cerâmica porosa', 'Meio filtrante poroso para colonização de bactérias benéficas em filtros biológicos.', 29.90],
		['Bolas cerâmicas porosas (1 kg)', 'aquario', 'Cerâmica porosa', 'Esferas porosas para filtragem biológica em aquários e lagos ornamentais.', 34.90],
		['Mídia cerâmica sinterizada (5 kg)', 'aquario', 'Cerâmica porosa sinterizada', 'Embalagem econômica de mídia filtrante para aquários de maior volume.', 119.00],
		['Caverna cerâmica para aquário (P)', 'aquario', 'Cerâmica', 'Esconderijo cerâmico para peixes, tamanho pequeno.', 39.90],
		['Tubo cerâmico esconderijo', 'aquario', 'Cerâmica', 'Tubo cerâmico usado como abrigo para peixes de fundo.', 24.90],
	],
};

async function applyCatalogMigration(db) {
	const applied = await get(db, 'SELECT 1 AS ok FROM migracoes WHERE id = ?', [catalogMigration.id]);
	if (applied) return;

	await run(db, 'BEGIN');
	try {
		for (const [name, price] of catalogMigration.priceFixes) {
			await run(db, 'UPDATE produtos SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ? AND price IS NULL', [price, name]);
		}
		for (const product of catalogMigration.products) {
			const exists = await get(db, 'SELECT id FROM produtos WHERE name = ?', [product[0]]);
			if (!exists) {
				await run(db, 'INSERT INTO produtos (name, segment_id, material, description, price) VALUES (?, ?, ?, ?, ?)', product);
			}
		}
		await run(db, 'INSERT INTO migracoes (id) VALUES (?)', [catalogMigration.id]);
		await run(db, 'COMMIT');
	} catch (error) {
		await run(db, 'ROLLBACK');
		throw error;
	}
}

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
	await run(db, `
		CREATE TABLE IF NOT EXISTS migracoes (
			id TEXT PRIMARY KEY,
			applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	// Orçamentos: fluxo próprio (separado do pedido), com protocolo, status e resposta da equipe.
	await run(db, `
		CREATE TABLE IF NOT EXISTS orcamentos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
			company TEXT CHECK (company IS NULL OR length(company) <= 120),
			cnpj TEXT CHECK (cnpj IS NULL OR length(cnpj) <= 18),
			phone TEXT CHECK (phone IS NULL OR length(phone) <= 20),
			desired_deadline TEXT CHECK (desired_deadline IS NULL OR length(desired_deadline) <= 10),
			message TEXT CHECK (message IS NULL OR length(message) <= 2000),
			status TEXT NOT NULL DEFAULT 'Recebido'
				CHECK (status IN ('Recebido', 'Em análise', 'Enviado', 'Aprovado', 'Recusado')),
			response_note TEXT CHECK (response_note IS NULL OR length(response_note) <= 2000),
			response_total REAL CHECK (response_total IS NULL OR response_total >= 0),
			valid_until TEXT CHECK (valid_until IS NULL OR length(valid_until) <= 10),
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	// produto_id nulo = peça fora do catálogo (descrita em name/specs).
	await run(db, `
		CREATE TABLE IF NOT EXISTS orcamento_itens (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
			produto_id INTEGER,
			name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
			qty INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 100000),
			specs TEXT CHECK (specs IS NULL OR length(specs) <= 500)
		)
	`);
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_orcamentos_user ON orcamentos(user_id)');
	await run(db, 'CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orc ON orcamento_itens(orcamento_id)');
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
		await applyCatalogMigration(db);
	}

	if (log) console.info(`[db] SQLite conectado em ${filename}`);
}

module.exports = { all, closeDatabase, get, initializeDatabase, openDatabase, run };