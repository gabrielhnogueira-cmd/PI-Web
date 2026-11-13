const orderModel = require('../models/orderModel');
const { cleanText, parseId } = require('../format');

const statuses = ['Aguardando confirmação', 'Em produção', 'Enviado'];
const paymentMethods = ['pix', 'cartao', 'boleto'];
const paymentOutcomes = ['approved', 'declined'];
const MAX_LINES = 50;
const MAX_QTY = 1000;

function validateOrder(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { errors: { body: 'Envie um objeto JSON com os dados do pedido.' } };
	}

	const errors = {};
	const quantities = new Map();
	if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > MAX_LINES) {
		errors.lines = `Informe de 1 a ${MAX_LINES} itens.`;
	} else {
		for (const line of body.lines) {
			const productId = line?.productId;
			const qty = line?.qty;
			if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
				errors.lines = `Cada item precisa de um produto válido e quantidade de 1 a ${MAX_QTY}.`;
				break;
			}
			quantities.set(productId, (quantities.get(productId) ?? 0) + qty);
		}
	}

	let note = null;
	if (body.note !== undefined && body.note !== null && body.note !== '') {
		note = cleanText(body.note, 500);
		if (!note) errors.note = 'As observações devem ter até 500 caracteres.';
	}

	let payment;
	if (body.payment !== undefined) {
		if (!body.payment || typeof body.payment !== 'object' || Array.isArray(body.payment)
			|| !paymentMethods.includes(body.payment.method)
			|| !paymentOutcomes.includes(body.payment.outcome)) {
			errors.payment = 'Informe uma forma de pagamento e um resultado de simulação válidos.';
		} else {
			payment = { method: body.payment.method, outcome: body.payment.outcome };
		}
	}

	if (Object.keys(errors).length > 0) return { errors };
	return { value: { quantities, note, payment } };
}

function createOrderController(db) {
	return {
		async list(request, response) {
			const userId = request.user.role === 'equipe' ? null : request.user.id;
			response.json(await orderModel.listOrders(db, { userId }));
		},
		async create(request, response) {
			const validation = validateOrder(request.body);
			if (validation.errors) return response.status(400).json({ erro: 'Dados do pedido inválidos.', campos: validation.errors });
			const { quantities, note, payment } = validation.value;

			const lines = [];
			for (const [productId, qty] of quantities) {
				const product = await orderModel.findProductForOrder(db, productId);
				if (!product) return response.status(400).json({ erro: `Produto ${productId} não existe no catálogo.` });
				lines.push({ product, qty });
			}

			let paymentRecord;
			if (payment) {
				if (lines.some(({ product }) => product.price === null)) {
					return response.status(400).json({ erro: 'Não é possível simular o pagamento: há produtos sem preço definido.' });
				}
				const amountCents = lines.reduce((sum, { product, qty }) => sum + Math.round(product.price * 100) * qty, 0);
				if (!Number.isSafeInteger(amountCents)) {
					return response.status(400).json({ erro: 'O total do pedido excede o limite para simulação.' });
				}
				if (payment.outcome === 'declined') {
					return response.status(402).json({
						erro: 'Pagamento recusado pela simulação do gateway.',
						payment: { method: payment.method, status: 'Recusado' },
					});
				}
				paymentRecord = { method: payment.method, amount: amountCents / 100 };
			}

			const id = await orderModel.createOrder(db, {
				userId: request.user.id,
				note,
				lines,
				payment: paymentRecord,
			});
			const [order] = await orderModel.listOrders(db, { id });
			response.location(`/api/pedidos/${order.id}`).status(201).json(order);
		},
		async updateStatus(request, response) {
			const id = parseId('pedido', request.params.id);
			if (!id) return response.status(400).json({ erro: 'ID inválido.' });
			const status = request.body?.status;
			if (!statuses.includes(status)) {
				return response.status(400).json({ erro: `Status inválido. Use: ${statuses.join(', ')}.` });
			}
			if (!await orderModel.updateOrderStatus(db, id, status)) return response.status(404).json({ erro: 'Pedido não encontrado.' });
			const [order] = await orderModel.listOrders(db, { id });
			response.json(order);
		},
	};
}

module.exports = { createOrderController, statuses };
