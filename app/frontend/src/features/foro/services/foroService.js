import { apiClient } from '../../../services/apiClient';

export const foroService = {
	listarHilos: async () => {
		return apiClient.get('/api/foro');
	},

	crearHilo: async ({ titulo, contenido, categoria, imagenFile }) => {
		const form = new FormData();
		form.append('titulo', titulo);
		form.append('contenido', contenido);
		form.append('categoria', categoria);
		if (imagenFile) form.append('imagen', imagenFile, imagenFile.name);

		// usar apiClient.request para permitir multipart
		return apiClient.request('/api/foro', { method: 'POST', body: form });
	},

	comentarHilo: async ({ foroId, contenido, imagenFile }) => {
		const form = new FormData();
		form.append('contenido', contenido);
		if (imagenFile) form.append('imagen', imagenFile, imagenFile.name);
		return apiClient.request(`/api/foro/${foroId}/comentarios`, { method: 'POST', body: form });
	},

	obtenerComentarios: async (foroId) => {
		return apiClient.get(`/api/foro/${foroId}/comentarios`);
	},

	eliminarComentario: async (foroId, comentarioId) => {
		return apiClient.request(`/api/foro/${foroId}/comentarios/${comentarioId}`, { method: 'DELETE' });
	},
	
	eliminarHilo: async (foroId) => {
    return apiClient.request(`/api/foro/${foroId}`, { method: 'DELETE' });
},
};

export default foroService;
