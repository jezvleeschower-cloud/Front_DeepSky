import { apiClient } from './apiClient';

class AuthService {
	constructor(client) {
		this.client = client;
	}

	async registerDirect({ nombre, email, password }) {
		const payload = { nombre, email, password };
		return this.client.post('/api/auth/register-direct', payload);
	}

	// registro en dos pasos: crea la cuenta y envía un código de 6 dígitos,
	// sin iniciar sesión todavía (se confirma la propiedad del correo con verificarCodigo)
	async registrar({ nombre, email, password }) {
		const payload = { nombre, email, password };
		return this.client.post('/api/auth/register', payload);
	}

	async loginDirect({ email, password }) {
		const payload = { email, password };
		return this.client.post('/api/auth/login-direct', payload);
	}

	// two-step flow
	async solicitarCodigo({ email, password }) {
		return this.client.post('/api/auth/login', { email, password });
	}

	async verificarCodigo({ email, codigo }) {
		return this.client.post('/api/auth/verify', { email, codigo });
	}

	async me() {
		return this.client.get('/api/auth/me');
	}

	// recuperación de contraseña
	async forgotPassword({ email }) {
		return this.client.post('/api/auth/forgot-password', { email });
	}

	async resetPassword({ email, codigo, nuevaPassword }) {
		return this.client.post('/api/auth/reset-password', { email, codigo, nuevaPassword });
	}
}

export const authService = new AuthService(apiClient);