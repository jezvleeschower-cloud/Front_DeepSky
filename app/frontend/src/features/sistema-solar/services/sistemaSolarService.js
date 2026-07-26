import { apiClient } from '../../../services/apiClient';
import { authService } from '../../../services/authService';

export const sistemaSolarService = {
	listarPlanetas: async () => {
		return apiClient.get('/api/sistema-solar');
	},

	obtenerPlaneta: async (id) => {
		return apiClient.get(`/api/sistema-solar/${id}`);
	},

	obtenerCuriosidades: async (planetaId) => {
		return apiClient.get(`/api/sistema-solar/${planetaId}/curiosidades`);
	},

	agregarCuriosidad: async (planetaId, dato) => {
		// apiClient añadirá Authorization si hay token almacenado
		return apiClient.post(`/api/sistema-solar/${planetaId}/curiosidades`, { dato });
	},

	eliminarCuriosidad: async (idDato) => {
		return apiClient.request(`/api/sistema-solar/curiosidades/${idDato}`, { method: 'DELETE' });
	}
};

export default sistemaSolarService;
