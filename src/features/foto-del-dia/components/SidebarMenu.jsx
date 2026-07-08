import logoTelescopio from '../../../assets/logo-deepSky.png';
import logoNombre from '../../../assets/logo-DeepSky-nombre.png';

export default function SidebarMenu({ isOpen, onClose, onNavigate, activeView }) {
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
          <button className="close-sidebar-btn" onClick={onClose} aria-label="Cerrar menú">Cerrar</button>
        </div>

        <nav className="sidebar-nav-links">
          <button className={`nav-item ${activeView === 'search' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('search'); onClose(); }}>Búsqueda</button>
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('dashboard'); onClose(); }}>Foto del Día</button>
          <button className={`nav-item ${activeView === 'forum' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('forum'); onClose(); }}>Foro Comunitario</button>
          <button className={`nav-item ${activeView === 'events' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('events'); onClose(); }}>Calendario</button>
          <button className={`nav-item ${activeView === 'challenge' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('challenge'); onClose(); }}>Retos</button>
          <button className={`nav-item ${activeView === 'neos' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('neos'); onClose(); }}>NEOs</button>
          <button className={`nav-item ${activeView === '3d' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('3d'); onClose(); }}>Modelo 3D</button>
          <hr />
          <button className={`nav-item ${activeView === 'favorites' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('favorites'); onClose(); }}>Favoritos</button>
        </nav>
      </div>
    </aside>
  )
}
