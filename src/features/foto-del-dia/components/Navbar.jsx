import menuIcon from '../../../assets/menuPrinsipal.png';

export default function Navbar({ onToggleMenu, currentViewName, onNavigate }) {
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
        <button className="icon-btn" onClick={() => onNavigate('search')} aria-label="Buscar">
          Buscar
        </button>
        <button className="account-btn" onClick={() => onNavigate('login')}>
        👤 MI CUENTA
        </button>
      </div>
    </nav>
  )
}
