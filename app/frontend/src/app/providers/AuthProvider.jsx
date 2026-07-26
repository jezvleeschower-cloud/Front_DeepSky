import { createContext, useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { favoritoService } from '../../features/favoritos/services/favoritoService';

export const AuthContext = createContext(null);

const BASE_USERS = {
  user: {
    username: 'astro_fan22',
    email: 'astrofan22@example.com',
    joinDate: '03/2025',
  },
  divulgador: {
    username: 'divulgador_deepsky',
    email: '253400@it2id.upchiapas',
    joinDate: '01/2024',
  },
};

export default function AuthProvider({ children }) {
  const [role, setRole] = useState('guest');
  const [customUser, setCustomUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const loginWithCredentials = (email, password) => {
    return authService.loginDirect({ email, password })
      .then(async (res) => {
        if (res && res.token) {
          localStorage.setItem('ds_token', res.token);
          setRole(res.rol === 'DIVULGADOR' ? 'divulgador' : 'user');
          setCustomUser({ email: res.email, username: res.nombre, nombre: res.nombre });
          // login-direct no devuelve el id del usuario; se completa con /api/auth/me
          try {
            const me = await authService.me();
            if (me && me.id) {
              setCustomUser((prev) => ({ ...prev, id: me.id }));
            }
          } catch { /* el id se completará al recargar la página */ }
          // Cargar favoritos al iniciar sesión
          try {
            const favs = await favoritoService.listar();
            setFavorites(
              favs.map(im => ({
                id: im.nasaId || im.nasa_id,
                title: im.title,
                url: im.url,
                author: im.center,
              }))
            );
          } catch {
            setFavorites([]);
          }
          return { success: true, role: res.rol };
        }
        return { success: false };
      })
      .catch((err) => {
        return { success: false, message: err?.message || 'Correo o contraseña incorrectos.' };
      });
  };

  const logout = () => {
    setRole('guest');
    setCustomUser(null);
    setFavorites([]);
    localStorage.removeItem('ds_token');
  };

  // Al recargar la página: restaurar sesión Y cargar favoritos
  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    if (token) {
      authService.me()
        .then(async (res) => {
          if (res && res.email) {
            setRole(res.rol === 'DIVULGADOR' ? 'divulgador' : 'user');
            setCustomUser({ id: res.id, email: res.email, username: res.nombre || res.email.split('@')[0] });
            // ✅ CORRECCIÓN: cargar favoritos del backend al restaurar sesión
            try {
              const favs = await favoritoService.listar();
              setFavorites(
                favs.map(im => ({
                  id: im.nasaId || im.nasa_id,
                  title: im.title,
                  url: im.url,
                  author: im.center,
                }))
              );
            } catch {
              setFavorites([]);
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('ds_token');
          setRole('guest');
        });
    }
  }, []);

  // Paso 1 de registro: crea la cuenta y envía el código de 6 dígitos al correo.
  // Todavía NO inicia sesión: eso pasa hasta que se confirma el código en registerVerifyCode.
  const registerRequestCode = (formData) => {
    return authService.registrar({
      nombre: formData.username,
      email: formData.email,
      password: formData.password,
    })
      .then(() => ({ success: true }))
      .catch((err) => {
        return { success: false, message: err?.message || 'No fue posible iniciar el registro.' };
      });
  };

  // Paso 2 de registro: confirma el código enviado al correo y, si es válido, inicia sesión.
  const registerVerifyCode = ({ email, codigo, username }) => {
    return authService.verificarCodigo({ email, codigo })
      .then(async (res) => {
        if (res && res.token) {
          localStorage.setItem('ds_token', res.token);
          setFavorites([]);
          setRole(res.rol === 'DIVULGADOR' ? 'divulgador' : 'user');
          setCustomUser({
            username: res.nombre || username,
            email: res.email || email,
            joinDate: new Date().toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' }),
          });
          // verify no devuelve el id del usuario; se completa con /api/auth/me
          try {
            const me = await authService.me();
            if (me && me.id) {
              setCustomUser((prev) => ({ ...prev, id: me.id }));
            }
          } catch { /* el id se completará al recargar la página */ }
          return { success: true };
        }
        return { success: false, message: 'No fue posible verificar el código.' };
      })
      .catch((err) => {
        return { success: false, message: err?.message || 'Código incorrecto o expirado.' };
      });
  };

  const addFavorite = (item) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === item.id) ? prev : [item, ...prev]
    );
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const getActiveUserData = () => {
    if (role === 'guest') return null;
    if (customUser) return customUser;
    return BASE_USERS[role] || null;
  };

  const value = {
    role,
    isAuthenticated: role !== 'guest',
    userData: getActiveUserData(),
    loginWithCredentials,
    logout,
    registerRequestCode,
    registerVerifyCode,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}