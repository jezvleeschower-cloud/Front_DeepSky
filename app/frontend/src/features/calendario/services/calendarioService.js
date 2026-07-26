import { apiClient } from '../../../services/apiClient';

function buildAuthHeaders() {
	const headers = {};
	const token = localStorage.getItem('ds_token');
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

async function extraerMensajeError(res, fallback) {
	try {
		const contentType = res.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const payload = await res.json();
			return (payload && (payload.message || payload.error)) || fallback;
		}
		const txt = await res.text();
		return txt || fallback;
	} catch (e) {
		return fallback;
	}
}

export const calendarioService = {
	obtenerEventosPorMes: async (year, month) => {
		const path = `/api/calendario/eventos?year=${year}&month=${month}`;
		return apiClient.get(path);
	},

	crearEvento: async (evento, userRole) => {
		const headers = { ...buildAuthHeaders(), 'X-User-Rol': (userRole || '').toString().toUpperCase() };
		// apiClient.post doesn't accept custom headers currently, so use fetch directly
		const url = (import.meta.env.VITE_API_URL || '') + '/api/calendario/eventos';
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(evento)
		});
		if (!res.ok) {
			throw new Error(await extraerMensajeError(res, 'No se pudo crear el evento.'));
		}
		return res.json();
	},

	actualizarEvento: async (eventoId, evento, userRole) => {
		const headers = { ...buildAuthHeaders(), 'X-User-Rol': (userRole || '').toString().toUpperCase() };
		const url = (import.meta.env.VITE_API_URL || '') + `/api/calendario/eventos/${eventoId}`;
		const res = await fetch(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(evento)
		});
		if (!res.ok) {
			throw new Error(await extraerMensajeError(res, 'No se pudo modificar el evento.'));
		}
		return res.json();
	},

	eliminarEvento: async (eventoId, userRole) => {
		const headers = { ...buildAuthHeaders(), 'X-User-Rol': (userRole || '').toString().toUpperCase() };
		const url = (import.meta.env.VITE_API_URL || '') + `/api/calendario/eventos/${eventoId}`;
		const res = await fetch(url, { method: 'DELETE', headers });
		if (!res.ok) {
			throw new Error(await extraerMensajeError(res, 'No se pudo eliminar el evento.'));
		}
		return res.json();
	},

	fijarFavorito: async (eventoId) => {
		const url = (import.meta.env.VITE_API_URL || '') + `/api/calendario/eventos/${eventoId}/favorito`;
		const headers = buildAuthHeaders();
		const res = await fetch(url, { method: 'POST', headers });
		if (!res.ok) {
			throw new Error(await extraerMensajeError(res, 'No se pudo fijar el evento como favorito.'));
		}
		return res.json();
	},

	desfijarFavorito: async (eventoId) => {
		const url = (import.meta.env.VITE_API_URL || '') + `/api/calendario/eventos/${eventoId}/favorito`;
		const headers = buildAuthHeaders();
		const res = await fetch(url, { method: 'DELETE', headers });
		if (!res.ok) {
			throw new Error(await extraerMensajeError(res, 'No se pudo quitar el evento de favoritos.'));
		}
		return res.json();
	}
};