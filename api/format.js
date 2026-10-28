const prefixes = { pedido: 'PED', chamado: 'CHM' };

function formatId(kind, id) {
	return `${prefixes[kind]}-${String(id).padStart(6, '0')}`;
}

function parseId(kind, value) {
	const match = new RegExp(`^${prefixes[kind]}-(\\d{1,12})$`, 'i').exec(String(value));
	const id = match ? Number(match[1]) : NaN;
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// O SQLite grava CURRENT_TIMESTAMP em UTC, sem fuso; a API devolve ISO 8601.
const toIso = (value) => `${String(value).replace(' ', 'T')}Z`;

function cleanText(value, max) {
	if (typeof value !== 'string') return null;
	const text = value.normalize('NFC').trim();
	return text.length > 0 && text.length <= max ? text : null;
}

module.exports = { cleanText, formatId, parseId, toIso };
