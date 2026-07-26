// En Vite se utiliza import.meta.env en lugar de process.env
const API_URL = import.meta.env?.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/asteroides`
  : 'http://localhost:7001/api/asteroides';

export const asteroideService = {
  /**
   * Obtiene la lista de asteroides desde el backend de Java
   * @returns {Promise<Array>}
   */
  obtenerAsteroides: async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al conectar con la API de asteroides:', error);
      throw error;
    }
  }
};