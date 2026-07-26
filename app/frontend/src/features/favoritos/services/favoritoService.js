import { apiClient } from '../../../services/apiClient';
import { authService } from '../../../services/authService';

async function getUserId() {
	try {
		const me = await authService.me();
		return me?.id || null;
	} catch (e) {
		return null;
	}
}

export const favoritoService = {
	listar: async () => {
		const userId = await getUserId();
		if (!userId) return [];
		return apiClient.get(`/api/favoritos?usuarioId=${userId}`);
	},

	agregar: async (imagen) => {
		const userId = await getUserId();
		if (!userId) throw new Error('No autorizado');
		return apiClient.post('/api/favoritos', { usuarioId: userId, imagen });
	},

	eliminar: async (nasaId) => {
		const userId = await getUserId();
		if (!userId) throw new Error('No autorizado');
		return apiClient.request ? apiClient.request(`/api/favoritos/${nasaId}?usuarioId=${userId}`, { method: 'DELETE' }) : fetch((import.meta.env.VITE_API_URL||'')+`/api/favoritos/${nasaId}?usuarioId=${userId}`, { method: 'DELETE' }).then(r=>r.json());
	}
};
