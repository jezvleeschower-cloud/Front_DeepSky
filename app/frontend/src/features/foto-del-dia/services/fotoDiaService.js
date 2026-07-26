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

class ComentarioFotoDiaService {
	constructor(client) {
		this.client = client;
	}

	mapItem(p) {
		if (!p) return null;
		return {
			id: p.idComentario ?? p.id ?? Date.now(),
			usuarioId: p.usuarioId ?? null,
			usuarioNombre: p.usuarioNombre ?? null,
			text: p.contenido ?? '',
			fecha: p.fechaComentario ?? null,
		};
	}

	async listar(fecha) {
		if (!fecha) return [];
		const res = await this.client.get(`/api/comentarios/foto-del-dia?fecha=${encodeURIComponent(fecha)}`);
		return Array.isArray(res) ? res.map(p => this.mapItem(p)) : [];
	}

	async publicar(fecha, contenido) {
		const usuarioId = await getUserId();
		if (!usuarioId) throw new Error('No autorizado');
		if (!fecha) throw new Error('Fecha inválida');
		// Enviamos "fecha" como query param (no en el body) para evitar que el backend
		// intente parsearla como LocalDateTime al deserializar el body.
		return this.client.post(`/api/comentarios/foto-del-dia?fecha=${encodeURIComponent(fecha)}`, {
			usuarioId,
			contenido,
		});
	}

	async eliminar(idComentario) {
		return this.client.request(`/api/comentarios/foto-del-dia/${idComentario}`, { method: 'DELETE' });
	}
}

export const comentarioService = new ComentarioFotoDiaService(apiClient);

export const fotoDiaService = {
  getLatest: async () => {
    const res = await apiClient.get('/api/foto-del-dia');
    return mapFoto(res);
  },
  getByDate: async (fecha) => {
    const res = await apiClient.get(`/api/foto-del-dia?fecha=${encodeURIComponent(fecha)}`);
    return mapFoto(res);
  }
};

function mapFoto(p) {
  if (!p) return null;
  return {
    title: p.titulo,
    imageUrl: p.urlImagen,
    description: p.descripcion,
    date: p.fecha,
    credits: p.copyright,
    mediaType: p.mediaType,
  };
}