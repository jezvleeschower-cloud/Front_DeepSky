//front/src/features/calendario/pages/CalendarioPage.jsx
import { useState, useEffect, useRef } from 'react';
import './CalendarioPage.css';

import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import useAuth from '../../../hooks/useAuth';
import { calendarioService } from '../services/calendarioService';

function mapEvento(ev) {
  const { date: fecha, time } = parseFechaHora(ev.fechaHora);
  return {
    id: ev.idEvento || ev.id || null,
    usuarioId: ev.usuarioId,
    date: fecha,
    title: ev.titulo || ev.title || 'Sin título',
    time,
    type: ev.usuarioId === 1 ? 'Oficial' : 'Comunidad',
    description: ev.descripcion || ev.description || ''
  };
}

function parseFechaHora(fh) {
  if (Array.isArray(fh)) {
    const [y, mo, d, h = 0, mi = 0] = fh;
    return {
      date: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
      time: `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`
    };
  }
  const str = String(fh);
  return {
    date: str.split('T')[0],
    time: str.split('T')[1] ? str.split('T')[1].substring(0,5) : '00:00'
  };
}

export default function CalendarioPage({ onNavigate, activeView = 'events' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, role, userData } = useAuth();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorLoading, setErrorLoading] = useState(null);
  const [favoritedEventIds, setFavoritedEventIds] = useState([]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const timeInputRef = useRef(null);
  const [draftDescription, setDraftDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const YEARS = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 2 + i);

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingEvents(true);
      setErrorLoading(null);
      try {
        const resp = await calendarioService.obtenerEventosPorMes(year, month + 1);
        if (!mounted) return;
        setEvents((resp || []).map(mapEvento));
      } catch (err) {
        console.error('Error cargando eventos del calendario', err);
        setErrorLoading(err.message || String(err));
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [year, month]);

  const firstWeekdayOfMonth = new Date(year, month, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekdayOfMonth }, (_, i) => ({ key: `blank-${i}`, blank: true }));

  const todayStr = today.toISOString().split('T')[0];

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dayNum = i + 1;
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    return {
      key: dateKey,
      dayNumber: dayNum,
      date: new Date(year, month, dayNum)
    };
  });

  const refreshEvents = async () => {
    try {
      const resp = await calendarioService.obtenerEventosPorMes(year, month + 1);
      setEvents((resp || []).map(mapEvento));
    } catch (err) {
      console.warn('No se pudo refrescar eventos', err);
    }
  };

  const resetDraftForm = () => {
    setDraftTitle('');
    setDraftTime('');
    setDraftDescription('');
    setEditingEventId(null);
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated || role !== 'divulgador') return;
    if (!draftTitle.trim()) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const fechaHora = `${dateStr}T${(draftTime || '00:00')}:00`;
    const payload = {
      usuarioId: userData?.id || null,
      titulo: draftTitle,
      descripcion: draftDescription,
      fechaHora
    };

    const request = editingEventId
      ? calendarioService.actualizarEvento(editingEventId, payload, role)
      : calendarioService.crearEvento(payload, role);

    request
      .then(() => {
        refreshEvents();
        resetDraftForm();
      })
      .catch((err) => {
        console.error(editingEventId ? 'Error modificando evento' : 'Error creando evento', err);
        alert((editingEventId ? 'Error modificando evento: ' : 'Error creando evento: ') + (err.message || String(err)));
      });
  };

  const handleEditarEvento = (event) => {
    setEditingEventId(event.id);
    setDraftTitle(event.title);
    setDraftDescription(event.description);
    setDraftTime(event.time);
  };

  const handleCancelarEdicion = () => {
    resetDraftForm();
  };

  const handleEliminarEvento = async (eventoId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este evento?')) return;
    try {
      await calendarioService.eliminarEvento(eventoId, role);
      if (editingEventId === eventoId) resetDraftForm();
      refreshEvents();
    } catch (err) {
      console.error('Error eliminando evento', err);
      alert('No se pudo eliminar el evento: ' + (err.message || String(err)));
    }
  };

  const handleFijarFavorito = async (eventoId) => {
    try {
      await calendarioService.fijarFavorito(eventoId);
      setFavoritedEventIds((prev) => prev.includes(eventoId) ? prev : [...prev, eventoId]);
    } catch (err) {
      console.error('Error fijando favorito', err);
      alert('No se pudo fijar como favorito: ' + (err.message || String(err)));
    }
  };

  const handleDesfijarFavorito = async (eventoId) => {
    try {
      await calendarioService.desfijarFavorito(eventoId);
      setFavoritedEventIds((prev) => prev.filter((id) => id !== eventoId));
    } catch (err) {
      console.error('Error desfijando favorito', err);
      alert('No se pudo eliminar de favoritos: ' + (err.message || String(err)));
    }
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
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">CALENDARIO ASTRONÓMICO</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-btn-shared" onClick={() => onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
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
                <span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span>
              </div>

              <div className="calendar-days-container">
                {leadingBlanks.map(blank => (
                  <span key={blank.key} className="calendar-day-blank" aria-hidden="true" />
                ))}
                {daysInMonth.map(day => {
                  const dayStr = day.date.toISOString().split('T')[0];
                  const hasEvent = events.some(e => e.date === dayStr);
                  const isSelected = dayStr === selectedDateStr;
                  const isToday = dayStr === todayStr;
                  return (
                    <button
                      key={day.key}
                      className={`calendar-day-btn ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''} ${isToday ? 'is-today' : ''}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span>{day.dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="calendar-detail-box">
              <h3>{selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              
              <div className="selected-events-list">
                {loadingEvents && <p>Cargando eventos...</p>}
                {errorLoading && <p className="error-text">Error: {errorLoading}</p>}
                {selectedEvents.length > 0 ? (
                  selectedEvents.map(event => {
                    const isLongDescription = event.description && event.description.length > 40;
                    const truncatedDesc = isLongDescription ? `${event.description.substring(0, 40)}...` : event.description;
                    const isLongTitle = event.title && event.title.length > 40;
                    const truncatedTitle = isLongTitle ? `${event.title.substring(0, 40)}...` : event.title;
                    const needsExpandBtn = isLongDescription || isLongTitle;
                    const isOwner = isAuthenticated && role === 'divulgador' && userData?.id != null && event.usuarioId === userData.id;

                    return (
                      <div key={event.id} className="event-pill-card">
                        <div className="event-pill-header">
                          <strong className="event-pill-title">{truncatedTitle}</strong>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <span className="event-meta-time">{event.time} - {event.type}</span>
                            {isAuthenticated && (
                              favoritedEventIds.includes(event.id) ? (
                                <button type="button" className="icon-action-btn is-active" title="Quitar de favoritos" onClick={() => handleDesfijarFavorito(event.id)}>
                                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M12 20.6 4.9 13.8C2.7 11.7 2.6 8.3 4.7 6.2c2-2 5.3-2 7.3.1.4.4.8.9 1 1.4.2-.5.6-1 1-1.4 2-2.1 5.3-2.1 7.3-.1 2.1 2.1 2 5.5-.2 7.6z"/></svg>
                                </button>
                              ) : (
                                <button type="button" className="icon-action-btn" title="Guardar en favoritos" onClick={() => handleFijarFavorito(event.id)}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.6 4.9 13.8C2.7 11.7 2.6 8.3 4.7 6.2c2-2 5.3-2 7.3.1.4.4.8.9 1 1.4.2-.5.6-1 1-1.4 2-2.1 5.3-2.1 7.3-.1 2.1 2.1 2 5.5-.2 7.6z"/></svg>
                                </button>
                              )
                            )}
                            {isOwner && (
                              <>
                                <button type="button" className="icon-action-btn" title="Editar evento" onClick={() => handleEditarEvento(event)}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                </button>
                                <button type="button" className="icon-action-btn is-danger" title="Eliminar evento" onClick={() => handleEliminarEvento(event.id)}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"/><path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"/><path d="M6 6l1 14.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 6"/><path d="M10 10.5v7"/><path d="M14 10.5v7"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {event.description && (
                          <div className="event-pill-body-truncated">
                            <p className="event-pill-desc">{truncatedDesc}</p>
                          </div>
                        )}
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

              {role === 'divulgador' && (
                <form className="add-event-form" onSubmit={handleAddEventSubmit}>
                  <h4>{editingEventId ? 'Editar evento' : 'Añadir fecha'}</h4>
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
                    <div
                      className="time-input-wrapper"
                      onClick={() => {
                        const el = timeInputRef.current;
                        if (!el) return;
                        if (typeof el.showPicker === 'function') el.showPicker();
                        else el.focus();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        ref={timeInputRef}
                        type="time"
                        value={draftTime}
                        onChange={(e) => setDraftTime(e.target.value)}
                        required
                      />
                      <span className="time-input-hint">Seleccionar hora</span>
                    </div>
                    <button type="submit" className="submit-event-btn">
                      {editingEventId ? 'Guardar cambios' : 'Agregar'}
                    </button>
                    {editingEventId && (
                      <button type="button" className="submit-event-btn" onClick={handleCancelarEdicion}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

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