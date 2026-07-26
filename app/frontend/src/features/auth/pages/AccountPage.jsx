import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import logoDeepSky from '../../../assets/logo-deepsky-login.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import '../Auth.css';

export default function AccountPage({ onNavigate }) {
  const { userData, role, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  return (
    <div className="auth-page-container">
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView="account"
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />
      <nav className="navbar-shared auth-navbar">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
            <img src={logoDeepSky} alt="DeepSky" className="auth-logo-header" />
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">MI CUENTA</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
          </button>
        </div>
      </nav>

      <main className="auth-form-card account-card">
        <button type="button" className="account-close-btn" title="Salir" aria-label="Salir" onClick={() => onNavigate('dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="account-card-heading">
          <div className="account-avatar-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
          </div>
          <div>
            <h2>Mi cuenta</h2>
            <p className="account-role-subtitle">{role === 'divulgador' ? 'Divulgador' : 'Usuario'}</p>
          </div>
        </div>

        <div className="account-data-list">
          <div className="input-field-group">
            <label>NOMBRE DE USUARIO</label>
            <p className="account-data-value">{userData?.username}</p>
          </div>
          <div className="input-field-group">
            <label>CORREO</label>
            <p className="account-data-value">{userData?.email}</p>
          </div>
          <div className="input-field-group">
            <label>TIPO DE CUENTA</label>
            <p className="account-data-value">{role === 'divulgador' ? 'Divulgador' : 'Usuario'}</p>
          </div>
        </div>

        <div className="account-logout-row">
          <button type="button" className="action-auth-submit logout-btn" onClick={handleLogout}>
            <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            CERRAR SESIÓN
          </button>
        </div>
      </main>
    </div>
  );
}