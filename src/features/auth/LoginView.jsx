import { useState } from 'react'
import logoTelescopio from '../../assets/logo-deepSky.png';
import logoNombre from '../../assets/logo-DeepSky-nombre.png';
import menuForo from '../../assets/menu-foro.png';
import SidebarMenu from '../foto-del-dia/components/SidebarMenu';
import useAuth from '../../hooks/useAuth';
import './Auth.css'

export default function LoginView({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    register({ username: form.username, email: form.email });
    onNavigate('dashboard');
  };

  return (
    <div className="auth-page-container">
      <button className="login-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menuForo} alt="Menú" />
      </button>
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => { if (onNavigate) onNavigate(screen); setIsMenuOpen(false) }}
        activeView="login"
      />
      <header className="auth-header">
        <div className="auth-logo-wrapper" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <img src={logoTelescopio} alt="Telescopio" className="auth-logo-ico" />
          <img src={logoNombre} alt="DeepSky" className="auth-logo-text" />
        </div>
      </header>

      <main className="auth-form-card">
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            INICIO DE SESIÓN
          </button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            REGISTRO
          </button>
        </div>

        {activeTab === 'login' && (
          <form className="real-auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-field-group">
              <label>NOMBRE DE USUARIO</label>
              <input type="text" placeholder="usuario" className="auth-text-input" />
            </div>
            <div className="input-field-group">
              <label>CONTRASEÑA</label>
              <div className="password-input-container">
                <input type="password" placeholder="••••••••" className="auth-text-input" />
                <span className="password-visibility-eye"> </span>
              </div>
            </div>
            <a href="#recover" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
            <button type="submit" className="action-auth-submit">INICIAR SESIÓN</button>
          </form>
        )}

        {activeTab === 'register' && (
          <form className="real-auth-form" onSubmit={handleRegisterSubmit}>
            <div className="input-field-group">
              <label>NOMBRE DE USUARIO</label>
              <input
                type="text"
                name="username"
                placeholder="usuario"
                className="auth-text-input"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div className="input-field-group">
              <label>CORREO</label>
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                className="auth-text-input"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-field-group">
              <label>CONTRASEÑA</label>
              <div className="password-input-container">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="auth-text-input"
                  value={form.password}
                  onChange={handleChange}
                />
                <span className="password-visibility-eye"> </span>
              </div>
            </div>
            <div className="input-field-group">
              <label>CONFIRMAR CONTRASEÑA</label>
              <div className="password-input-container">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="auth-text-input"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <span className="password-visibility-eye"> </span>
              </div>
            </div>

            {error && <p className="auth-error-message">{error}</p>}

            <button type="submit" className="action-auth-submit">CREAR CUENTA</button>
          </form>
        )}

        <p className="auth-footer-redirect">
          {activeTab === 'login' ? (
            <>¿No tienes cuenta? <span className="redirect-action-span" onClick={() => setActiveTab('register')}>Regístrate</span></>
          ) : (
            <>¿Ya tienes cuenta? <span className="redirect-action-span" onClick={() => setActiveTab('login')}>Inicia sesión</span></>
          )}
        </p>
      </main>
    </div>
  )
}