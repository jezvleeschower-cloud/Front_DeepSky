import logoTelescopio from '../../../assets/logo-deepSky.png';
import logoNombre from '../../../assets/logo-DeepSky-nombre.png';

const icons = {
  search: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  dashboard: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  forum: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  events: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  challenge: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  neos: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.5 6.5L21 9l-5 4.5L17 21l-5-3.5L7 21l1-7.5L3 9l6.5-.5z"/></svg>,
  '3d': <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  favorites: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
};

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
          <button className={`nav-item ${activeView === 'search' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('search'); onClose(); }}>
            {icons.search}<span>Búsqueda</span>
          </button>
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('dashboard'); onClose(); }}>
            {icons.dashboard}<span>Foto del Día</span>
          </button>
          <button className={`nav-item ${activeView === 'forum' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('forum'); onClose(); }}>
            {icons.forum}<span>Foro Comunitario</span>
          </button>
          <button className={`nav-item ${activeView === 'events' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('events'); onClose(); }}>
            {icons.events}<span>Calendario</span>
          </button>
          <button className={`nav-item ${activeView === 'challenge' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('challenge'); onClose(); }}>
            {icons.challenge}<span>Retos</span>
          </button>
          <button className={`nav-item ${activeView === 'neos' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('neos'); onClose(); }}>
            {icons.neos}<span>NEOs</span>
          </button>
          <button className={`nav-item ${activeView === '3d' ? 'active' : ''}`} onClick={() => { onNavigate && onNavigate('3d'); onClose(); }}>
            {icons['3d']}<span>Modelo 3D</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}