import { apiClient } from '../../../services/apiClient';
import { authService } from '../../../services/authService';

export const retoService = {
	listarRetos: async () => {
		return apiClient.get('/api/retos');
	},

	crearReto: async ({ titulo, descripcion, fechaLimite, usuarioId, imagenFile } = {}) => {
		let uid = usuarioId;
		if (!uid) {
			const me = await authService.me();
			uid = me?.id || me?.usuarioId || null;
		}
		if (!uid) throw new Error('Usuario no autenticado');
		if (!imagenFile) throw new Error('Debes adjuntar una imagen de referencia/portada');

		const form = new FormData();
		form.append('usuarioId', String(uid));
		form.append('titulo', titulo || '');
		form.append('descripcion', descripcion || '');
		form.append('fechaLimite', fechaLimite || '');
		form.append('imagen', imagenFile, imagenFile.name);

		return apiClient.request('/api/retos', { method: 'POST', body: form });
	},

	participar: async ({ retoId, usuarioId, titulo, imagenFile }) => {
		let uid = usuarioId;
		if (!uid) {
			const me = await authService.me();
			uid = me?.id || me?.usuarioId || null;
		}
		if (!uid) throw new Error('Usuario no autenticado');

		const form = new FormData();
		form.append('usuarioId', String(uid));
		form.append('titulo', titulo || '');
		if (imagenFile) form.append('imagen', imagenFile, imagenFile.name);

		return apiClient.request(`/api/retos/${retoId}/participaciones`, { method: 'POST', body: form });
	},

	listarParticipaciones: async (retoId) => {
		return apiClient.get(`/api/retos/${retoId}/participaciones`);
	},

	darLike: async (participacionId, usuarioId) => {
		if (!usuarioId) {
			const me = await authService.me();
			usuarioId = me?.id || me?.usuarioId || null;
		}
		if (!usuarioId) throw new Error('Usuario no autenticado');
		return apiClient.request(`/api/participaciones/${participacionId}/like?usuarioId=${usuarioId}`, { method: 'POST' });
	},

	eliminarParticipacion: async (retoId, participacionId) => {
		return apiClient.request(`/api/retos/${retoId}/participaciones/${participacionId}`, { method: 'DELETE' });
	},

	eliminarReto: async (retoId) => {
		return apiClient.request(`/api/retos/${retoId}`, { method: 'DELETE' });
	},

	finalizar: async (retoId) => {
		return apiClient.request(`/api/retos/${retoId}/finalizar`, { method: 'PUT' });
	}
};

export default retoService;