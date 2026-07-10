import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

const MOCK_USERS = {
  user: {
    username: 'astro_fan22',
    email: 'astrofan22@example.com',
    joinDate: '03/2025',
  },
  admin: {
    username: 'admin_deepsky',
    email: 'admin@deepsky.com',
    joinDate: '01/2024',
  },
};

export default function AuthProvider({ children }) {
  const [role, setRole] = useState('guest'); // 'guest' | 'user' | 'admin'

  const login = (selectedRole) => setRole(selectedRole);
  const logout = () => setRole('guest');
  const register = (formData) => {
    // Simulado: en el futuro esto se conecta al backend real.
    // Por ahora solo guardamos el username/email que el usuario escribió
    // y lo logueamos automáticamente como 'user'.
    MOCK_USERS.user = {
      username: formData.username,
      email: formData.email,
      joinDate: new Date().toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' }),
    };
    setRole('user');
  };
  

  const value = {
    role,
    isAuthenticated: role !== 'guest',
    userData: role !== 'guest' ? MOCK_USERS[role] : null,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
