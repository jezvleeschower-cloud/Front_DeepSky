import menuIcon from '../../../assets/menuPrinsipal.png';

export default function Navbar({ onToggleMenu, currentViewName, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="menu-trigger-btn" onClick={onToggleMenu}>
          <img src={menuIcon} alt="Menú Principal" className="menu-icon-img" />
        </button>
        <div className="brand-location">
          <span className="brand-text">DeepSky</span>
          <span className="location-separator">|</span>
          <span className="location-text">{currentViewName.toUpperCase()}</span>
        </div>
      </div>
      <button className="account-btn" onClick={() => onNavigate('login')}>
        👤 MI CUENTA
      </button>
    </nav>
  )
}
