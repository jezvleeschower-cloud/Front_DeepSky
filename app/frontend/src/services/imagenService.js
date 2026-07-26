import { apiClient } from './apiClient';

export const imagenService = {
	buscar: async (q) => {
		if (!q || !q.trim()) return [];
		const encoded = encodeURIComponent(q.trim());
		const res = await apiClient.get(`/api/imagenes/search?q=${encoded}`);
		return Array.isArray(res) ? res : [];
	},
	obtenerPorId: async (id) => {
		if (!id) throw new Error('id requerido');
		return apiClient.get(`/api/imagenes/${id}`);
	}
};
