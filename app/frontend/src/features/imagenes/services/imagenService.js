import { apiClient } from '../../../services/apiClient';

class ImagenService {
  constructor(client) {
    this.client = client;
  }

  // Busca en el backend (que traduce y consulta la NASA internamente)
  async search(query, category) {
    if (!query || query.trim() === '') return [];
    let url = `/api/imagenes/search?q=${encodeURIComponent(query.trim())}`;
    if (category && category.trim() !== '' && category.toLowerCase() !== 'todo' && category.toLowerCase() !== 'todos') {
      url += `&category=${encodeURIComponent(category.trim())}`;
    }
    const res = await this.client.get(url);
    // soporte para respuesta { api: {...}, results: [...] }
    const payload = (res && res.results) ? res.results : res;
    return this.mapList(payload);
  }

  async getById(nasaId) {
    const res = await this.client.get(`/api/imagenes/${encodeURIComponent(nasaId)}`);
    return this.mapItem(res);
  }

  mapList(payload) {
    if (!Array.isArray(payload)) return [];
    return payload.map(p => this.mapItem(p));
  }

  mapItem(p) {
    if (!p) return null;
    return {
      id: p.nasaId || p.nasa_id || null,
      url: p.url || p.urlImagen || null,
      title: p.title || p.titulo || '',
      description: p.description || p.descripcion || '',
      dateCreated: p.dateCreated || p.fecha_creacion || null,
      center: p.center || null,
      keywords: p.keywords || [],
      mediaType: p.mediaType || p.media_type || 'image'
    };
  }
}

export const imagenService = new ImagenService(apiClient);
