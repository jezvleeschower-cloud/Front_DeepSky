import menuIcon from '../../../assets/menuPrinsipal.png';
import useAuth from '../../../hooks/useAuth';

export default function Navbar({ onToggleMenu, currentViewName, onNavigate }) {
  const { isAuthenticated, userData } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="menu-trigger-btn" onClick={onToggleMenu} aria-label="Abrir menú">
          <img src={menuIcon} alt="Menú Principal" className="menu-icon-img" />
        </button>
        <div className="brand-location">
          <span className="brand-text">DeepSky</span>
          <span className="location-separator">|</span>
          <span className="location-text">{currentViewName.toUpperCase()}</span>
        </div>
      </div>
      <div className="nav-right-actions">
        <button className="account-btn" onClick={() => onNavigate(isAuthenticated ? 'account' : 'login')}>
          {isAuthenticated ? userData.username.toUpperCase() : 'MI CUENTA'}
        </button>
      </div>
    </nav>
  );
}