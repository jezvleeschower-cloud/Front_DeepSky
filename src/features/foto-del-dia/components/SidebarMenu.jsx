import logoTelescopio from '../../../assets/logo-deepSky.png';
import logoNombre from '../../../assets/logo-DeepSky-nombre.png';

export default function SidebarMenu({ isOpen, onClose }) {
  return (
    <aside
      className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <div className="sidebar-logo-group">
            <img src={logoTelescopio} alt="Telescopio" className="logo-telescopio" />
            <img src={logoNombre} alt="DeepSky" className="logo-nombre" />
          </div>
          <button className="close-sidebar-btn" onClick={onClose} aria-label="Cerrar menú">✕</button>
        </div>
        
        <nav className="sidebar-nav-links">
          <a href="#search" className="nav-item">🔍 Búsqueda</a>
          <a href="#apod" className="nav-item active">📷 Foto del Día</a>
          <a href="#forum" className="nav-item">👥 Foro Comunitario</a>
          <a href="#events" className="nav-item">📅 Calendario de Eventos</a>
          <a href="#challenge" className="nav-item">🏆 Reto Astronómico</a>
          <a href="#neos" className="nav-item">☄️ Objetos NEOs</a>
          <a href="#3d" className="nav-item">📦 Modelo 3D</a>
        </nav>
      </div>
    </aside>
  )
}
