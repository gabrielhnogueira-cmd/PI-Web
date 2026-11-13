const { all, get, run } = require('../database');

const productFields = `
	id,
	name,
	segment_id AS segmentId,
	material,
	description,
	price,
	created_at AS createdAt,
	updated_at AS updatedAt
`;

function listProducts(db) {
	return all(db, `SELECT ${productFields} FROM produtos ORDER BY id`);
}

function findProductById(db, id) {
	return get(db, `SELECT ${productFields} FROM produtos WHERE id = ?`, [id]);
}

async function createProduct(db, product) {
	const result = await run(db, `
		INSERT INTO produtos (name, segment_id, material, description, price)
		VALUES (?, ?, ?, ?, ?)
	`, [product.name, product.segmentId, product.material, product.description, product.price]);
	return findProductById(db, result.lastID);
}

async function updateProduct(db, id, product) {
	await run(db, `
		UPDATE produtos
		SET name = ?, segment_id = ?, material = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, [product.name, product.segmentId, product.material, product.description, product.price, id]);
	return findProductById(db, id);
}

async function deleteProduct(db, id) {
	return run(db, 'DELETE FROM produtos WHERE id = ?', [id]);
}

module.exports = { createProduct, deleteProduct, findProductById, listProducts, updateProduct };
