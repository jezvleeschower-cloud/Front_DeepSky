// front/src/features/foto-del-dia/components/Navbar.jsx
import menuIcon from '../../../assets/menuPrinsipal.png';

export default function Navbar({ onToggleMenu, currentViewName, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Contenedor para reservar el espacio físico del botón fixed */}
        <div className="menu-trigger-container" style={{ width: '80px', height: '100%' }}>
          <button className="menu-trigger-btn" onClick={onToggleMenu} aria-label="Abrir menú">
            <img src={menuIcon} alt="Menú Principal" className="menu-icon-img" />
          </button>
        </div>
        
        <div className="brand-location">
          <span className="brand-text">DeepSky</span>
          <span className="location-separator">|</span>
          <span className="location-text">{currentViewName.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="nav-right-actions">
        <button className="icon-btn" onClick={() => onNavigate('search')} aria-label="Buscar">
          Explorar
        </button>
        <button className="account-btn" onClick={() => onNavigate('login')}>
          MI CUENTA
        </button>
      </div>
    </nav>
  );
}