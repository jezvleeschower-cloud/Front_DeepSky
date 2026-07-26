import useAuth from '../../../hooks/useAuth';

export default function Navbar({ onToggleMenu, currentViewName, onNavigate }) {
  const { isAuthenticated, userData } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="menu-trigger-btn" onClick={onToggleMenu} aria-label="Abrir menú">
          <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="brand-location">
          <span className="brand-text">DeepSky</span>
          <span className="location-separator">|</span>
          <span className="location-text">{currentViewName.toUpperCase()}</span>
        </div>
      </div>
      <div className="nav-right-actions">
        <button className="account-btn" onClick={() => onNavigate(isAuthenticated ? 'account' : 'register')}>
          <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
          {isAuthenticated ? (userData?.username || userData?.email || 'MI CUENTA').toUpperCase() : 'REGISTRARSE'}
        </button>
      </div>
    </nav>
  );
}