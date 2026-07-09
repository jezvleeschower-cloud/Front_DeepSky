// front/src/features/calendario/pages/CalendarioPage.jsx
import { useState } from 'react';
import './CalendarioPage.css';
import menuIcon from '../../../assets/menu-calendario.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';

export default function CalendarioPage({ onNavigate, activeView = 'events' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date('2026-07-07'));
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Julio 2026

  // Estado para controlar qué evento se está viendo en detalle en el modal pop-up
  const [activeModalEvent, setActiveModalEvent] = useState(null);

  const [events, setEvents] = useState([
    { id: 1, date: '2026-07-06', title: 'Lluvia de Estrellas', time: '22:00', type: 'Comunidad', description: 'Mejor visibilidad a medianoche lejos de la contaminación lumínica de la ciudad. Se recomienda llevar telescopio o binoculares astronómicos.' },
    { id: 2, date: '2026-07-13', title: 'Conjunción Lunar', time: '04:30', type: 'Oficial', description: 'Visible a simple vista hacia el este.' }
  ]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const YEARS = Array.from({ length: 10 }, (_, i) => 2026 + i);

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dayNum = i + 1;
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    return {
      key: dateKey,
      dayNumber: dayNum,
      date: new Date(year, month, dayNum)
    };
  });

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const newEvent = {
      id: events.length + 1,
      date: dateStr,
      title: draftTitle,
      time: draftTime || '00:00',
      type: 'Comunidad',
      description: draftDescription
    };

    setEvents([...events, newEvent]);
    setDraftTitle('');
    setDraftTime('');
    setDraftDescription('');
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedEvents = events.filter(event => event.date === selectedDateStr);

  return (
    <div className="calendario-page-container">
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />
      
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <img src={menuIcon} alt="Menú Calendario" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">CALENDARIO ASTRONÓMICO</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-btn-shared" onClick={() => onNavigate('login')}>
            MI CUENTA
          </button>
        </div>
      </nav>

      <main className="calendario-main-content">
        <div className="calendario-page-inner">
          
          <section className="calendario-hero-banner">
            <h1>Calendario Astronómico</h1>
            <p>Consulta las fechas de los próximos eventos del cosmos y actividades de nuestra comunidad.</p>
          </section>

          <div className="calendar-grid-layout">
            
            {/* Panel Izquierdo: Cuadrícula del Calendario Estable */}
            <div className="calendar-grid-box">
              <div className="calendar-grid-header-centered">
                <button type="button" className="month-nav-arrow" onClick={handlePrevMonth}>←</button>
                
                <div className="quick-selectors-grp">
                  <select value={month} onChange={handleMonthChange} className="calendar-select-dropdown">
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>{name}</option>
                    ))}
                  </select>
                  
                  <select value={year} onChange={handleYearChange} className="calendar-select-dropdown">
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button type="button" className="month-nav-arrow" onClick={handleNextMonth}>→</button>
              </div>

              <div className="calendar-weekdays">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              <div className="calendar-days-container">
                {daysInMonth.map(day => {
                  const dayStr = day.date.toISOString().split('T')[0];
                  const hasEvent = events.some(e => e.date === dayStr);
                  const isSelected = dayStr === selectedDateStr;

                  return (
                    <button
                      key={day.key}
                      className={`calendar-day-btn ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span>{day.dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Derecho: Detalles del día */}
            <div className="calendar-detail-box">
              <h3>{selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              
              <div className="selected-events-list">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map(event => {
                    // Controlamos si la descripción supera los 40 caracteres
                    const isLongDescription = event.description && event.description.length > 40;
                    const truncatedDesc = isLongDescription 
                      ? `${event.description.substring(0, 40)}...` 
                      : event.description;

                    // Controlamos si el título supera los 40 caracteres
                    const isLongTitle = event.title && event.title.length > 40;
                    const truncatedTitle = isLongTitle 
                      ? `${event.title.substring(0, 40)}...` 
                      : event.title;

                    // El botón se renderizará si el título O la descripción son largos
                    const needsExpandBtn = isLongDescription || isLongTitle;

                    return (
                      <div key={event.id} className="event-pill-card">
                        <div className="event-pill-header">
                          <strong className="event-pill-title">{truncatedTitle}</strong>
                          <span className="event-meta-time">{event.time} - {event.type}</span>
                        </div>
                        
                        {event.description && (
                          <div className="event-pill-body-truncated">
                            <p className="event-pill-desc">{truncatedDesc}</p>
                          </div>
                        )}

                        {/* Botón único de expansión si cualquiera de los campos se truncó */}
                        {needsExpandBtn && (
                          <button 
                            type="button" 
                            className="view-desc-link-btn"
                            onClick={() => setActiveModalEvent(event)}
                          >
                            Ver detalles completos
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-events-text">No hay eventos agendados para esta fecha.</p>
                )}
              </div>

              <form className="add-event-form" onSubmit={handleAddEventSubmit}>
                <h4>Añadir fecha</h4>
                <input 
                  type="text"
                  placeholder="Título del evento" 
                  value={draftTitle} 
                  onChange={(e) => setDraftTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Descripción del evento (opcional)..."
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  className="forum-textarea-custom"
                />
                <div className="form-row-inline">
                  <div className="time-input-wrapper">
                    <input 
                      type="time" 
                      value={draftTime} 
                      onChange={(e) => setDraftTime(e.target.value)}
                      required
                    />
                    <span className="time-input-hint">Seleccionar hora</span>
                  </div>
                  <button type="submit" className="submit-event-btn">Agregar</button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </main>

      {/* Pop-up / Modal de detalle que renderiza el título y la descripción completa sin límites */}
      {activeModalEvent && (
        <div className="calendar-modal-overlay" onClick={() => setActiveModalEvent(null)}>
          <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-event-title-full">{activeModalEvent.title}</h3>
            <span className="modal-event-time">{activeModalEvent.time} - {activeModalEvent.type}</span>
            <hr className="modal-divider" />
            <p className="modal-event-description">{activeModalEvent.description || 'Sin descripción adicional.'}</p>
            <button type="button" className="close-modal-btn" onClick={() => setActiveModalEvent(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}