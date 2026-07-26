import React, { useState, useEffect, useRef } from 'react';
import './RetosPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';

import fondo from '../../../assets/fondo-8-DeepSks.png';
import useAuth from '../../../hooks/useAuth';
import { retoService } from '../services/retoService';

export default function RetosPage({ onNavigate, activeView }) {
  const { isAuthenticated, role, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let mounted = true;
    retoService.listarRetos()
      .then((list) => {
        if (!mounted || !Array.isArray(list)) return;
        const mapped = list.map(r => ({
          id: r.id,
          title: r.titulo,
          description: r.descripcion,
          author: r.creador,
          date: formatEndDate(r.fechaLimite),
          status: r.finalizado ? 'closed' : 'open',
          imageUrl: r.urlImagen || null,
          topEntries: [],
          userGallery: []
        }));
        setEvents(mapped);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const formatEndDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `Hasta ${day}/${month}/${year}`;
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [retoToDelete, setRetoToDelete] = useState(null);
  const [deletingReto, setDeletingReto] = useState(false);

  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', endDate: '' });
  const endDateInputRef = useRef(null);
  const [challengeFile, setChallengeFile] = useState(null);

  const [newParticipation, setNewParticipation] = useState({ title: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  // Set de IDs de fotos a las que el usuario dio like (permite toggle)
  const [likedPhotoIds, setLikedPhotoIds] = useState(new Set());

  const isCreator = isAuthenticated && role === 'divulgador';
  const canModerateRetos = isAuthenticated && role === 'divulgador';

  const isOwnerAdmin =
    isCreator &&
    selectedEvent &&
    selectedEvent.author === userData?.username;

  const isChallengeOpen = selectedEvent && selectedEvent.status !== 'closed';

  const openEvent = async (evt) => {
    setLikedPhotoIds(new Set()); // resetear likes al abrir un nuevo reto
    try {
      const participaciones = await retoService.listarParticipaciones(evt.id);
      const gallery = participaciones.map(p => ({ id: p.id, title: p.titulo, user: p.autor, likes: p.likes, likedBy: [], url: p.urlImagen }));
      const top = [...gallery].sort((a,b)=> b.likes - a.likes).slice(0,3);
      const updatedEvt = { ...evt, userGallery: gallery, topEntries: top };
      setSelectedEvent(updatedEvt);
      setEvents(prev => prev.map(e => e.id === evt.id ? updatedEvt : e));
    } catch (err) {
      console.error('Error cargando participaciones:', err);
      alert('No se pudieron cargar las participaciones de este reto: ' + (err.message || String(err)));
      setSelectedEvent(evt);
    }
  };

  const handleLike = async (photoId) => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    try {
      const res = await retoService.darLike(photoId);
      const liked = res?.liked ?? true;

      // Actualizar el Set de likes
      setLikedPhotoIds(prev => {
        const next = new Set(prev);
        if (liked) next.add(photoId);
        else next.delete(photoId);
        return next;
      });

      // Refrescar galería con likes actualizados
      if (selectedEvent) {
        const participaciones = await retoService.listarParticipaciones(selectedEvent.id);
        const gallery = participaciones.map(p => ({ id: p.id, title: p.titulo, user: p.autor, likes: p.likes, likedBy: [], url: p.urlImagen }));
        const top = [...gallery].sort((a,b)=> b.likes - a.likes).slice(0,3);
        const updatedEvents = events.map(evt => evt.id === selectedEvent.id ? { ...evt, userGallery: gallery, topEntries: top } : evt);
        setEvents(updatedEvents);
        setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
      }
    } catch (err) {
      console.warn('No fue posible registrar el voto:', err);
    }
  };

  const submitCreateChallenge = (e) => {
    e.preventDefault();
    if (!isCreator) return;
    if (!newChallenge.title || !newChallenge.description || !newChallenge.endDate) return;

    retoService.crearReto({ titulo: newChallenge.title, descripcion: newChallenge.description, fechaLimite: newChallenge.endDate, imagenFile: challengeFile })
      .then((created) => {
        const createdUi = {
          id: created.id,
          title: created.titulo,
          description: created.descripcion,
          author: created.creador,
          date: formatEndDate(created.fechaLimite),
          status: 'open',
          imageUrl: challengeFile ? URL.createObjectURL(challengeFile) : null,
          topEntries: [],
          userGallery: []
        };
        setEvents(prev => [createdUi, ...prev]);
        setSelectedEvent(createdUi);
        setNewChallenge({ title: '', description: '', endDate: '' });
        setChallengeFile(null);
        setShowCreateModal(false);
      })
      .catch((err) => {
        console.error('Error creando reto:', err);
        alert('No se pudo crear el reto: ' + (err.message || String(err)));
      });
  };

  const submitParticipation = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (!isChallengeOpen) return;
    if (!newParticipation.title || !selectedFile) return;

    retoService.participar({ retoId: selectedEvent.id, titulo: newParticipation.title, imagenFile: selectedFile })
      .then((p) => {
        const newPhoto = {
          id: p.id,
          title: p.titulo,
          user: p.autor,
          likes: p.likes,
          likedBy: [],
          url: p.urlImagen
        };

        const updatedEvents = events.map(evt => {
          if (evt.id !== selectedEvent.id) return evt;
          const updatedGallery = [newPhoto, ...evt.userGallery];
          const updatedTop = [...updatedGallery].sort((a,b)=> b.likes - a.likes).slice(0,3);
          return { ...evt, userGallery: updatedGallery, topEntries: updatedTop };
        });

        setEvents(updatedEvents);
        setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
        setNewParticipation({ title: '' });
        setSelectedFile(null);
        setShowUploadModal(false);
      })
      .catch((err) => {
        console.error('Error subiendo participación:', err);
        alert('No se pudo subir tu participación: ' + (err.message || String(err)));
      });
  };

  const confirmDeletePhoto = async () => {
    if (!isOwnerAdmin || !photoToDelete) return;

    try {
      await retoService.eliminarParticipacion(selectedEvent.id, photoToDelete.id);

      const updatedEvents = events.map(evt => {
        if (evt.id !== selectedEvent.id) return evt;
        const updatedGallery = evt.userGallery.filter(img => img.id !== photoToDelete.id);
        const updatedTop = evt.topEntries.filter(img => img.id !== photoToDelete.id);
        return { ...evt, userGallery: updatedGallery, topEntries: updatedTop };
      });

      setEvents(updatedEvents);
      setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
    } catch (err) {
      console.error('Error eliminando participación', err);
    } finally {
      setPhotoToDelete(null);
    }
  };

  const confirmFinalizeChallenge = async () => {
    if (!isOwnerAdmin) return;
    try {
      await retoService.finalizar(selectedEvent.id);
      const updatedEvents = events.map(evt =>
        evt.id === selectedEvent.id ? { ...evt, status: 'closed' } : evt
      );
      setEvents(updatedEvents);
      setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
    } catch (err) {
      alert('No se pudo finalizar el reto: ' + (err.message || String(err)));
    } finally {
      setShowFinalizeConfirm(false);
    }
  };

  const confirmDeleteReto = async () => {
    if (!canModerateRetos || !retoToDelete) return;
    setDeletingReto(true);
    try {
      await retoService.eliminarReto(retoToDelete.id);
      setEvents(prev => prev.filter(evt => evt.id !== retoToDelete.id));
      if (selectedEvent?.id === retoToDelete.id) setSelectedEvent(null);
      setRetoToDelete(null);
    } catch (err) {
      console.error('Error eliminando reto', err);
      alert('No se pudo eliminar el reto: ' + (err.message || String(err)));
    } finally {
      setDeletingReto(false);
    }
  };

  return (
    <div className="retos-page fondo-8-DeepSks">

      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">RETOS / ASTROFOTOGRAFÍA</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
          </button>
        </div>
      </nav>

      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      <main className="retos-page-inner">
        <header className="retos-hero">
          <h2>Retos de Astrofotografía</h2>
          <p>Participa en los eventos activos de la comunidad, sube tus capturas y vota por tus favoritas.</p>
        </header>

        {!selectedEvent ? (
          <section className="forum-list-view">
            <div className="forum-list-header">
              <h3>Eventos creados</h3>
              {isCreator && (
                <button className="create-challenge-btn-large" onClick={() => setShowCreateModal(true)}>
                  + Crear un nuevo reto
                </button>
              )}
            </div>

            <div className="forum-grid-stack">
              {events.map((evt) => (
                <article key={evt.id} className="forum-challenge-card" onClick={() => openEvent(evt)}>
                  {evt.imageUrl && (
                    <div className="forum-card-cover">
                      <img src={evt.imageUrl} alt={evt.title} />
                    </div>
                  )}
                  <div className="forum-card-body">
                    <div className="card-top">
                      <span className="forum-badge-date">
                        {evt.status === 'closed' ? 'Finalizado' : evt.date}
                      </span>
                      <h4>{evt.title}</h4>
                      <p>{evt.description.substring(0, 110)}...</p>
                    </div>
                    <div className="card-bottom">
                      <span className="author-tag">Por {evt.author}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="action-link">Ver reto e inscripciones →</span>
                        {canModerateRetos && (
                          <button
                            className="delete-comment-btn"
                            onClick={(e) => { e.stopPropagation(); setRetoToDelete(evt); }}
                            title="Eliminar reto"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="challenge-focus-card animation-fade-in">
            <div className="back-bar">
              <button className="back-forum-btn" onClick={() => setSelectedEvent(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Volver al listado de retos
              </button>
            </div>

            <div className="focus-card-header">
              <div>
                <span className="status-eyebrow">
                  {selectedEvent.status === 'closed' ? 'RETO FINALIZADO' : 'EVENTO ACTIVO'}
                </span>
                <h2>{selectedEvent.title}</h2>
                <p className="event-credits">
                  Creado por {selectedEvent.author} • <span className="date-highlight">{selectedEvent.date}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {isOwnerAdmin && isChallengeOpen && (
                  <button className="btn-secondary" onClick={() => setShowFinalizeConfirm(true)}>
                    Finalizar reto
                  </button>
                )}
                {canModerateRetos && (
                  <button
                    className="btn-secondary"
                    style={{ color: '#fca5a5', borderColor: 'rgba(248,113,113,0.4)' }}
                    onClick={() => setRetoToDelete(selectedEvent)}
                  >
                    Eliminar reto
                  </button>
                )}
                {isChallengeOpen ? (
                  <button
                    className="upload-participation-btn"
                    onClick={() => {
                      if (!isAuthenticated) { onNavigate && onNavigate('login'); return; }
                      setShowUploadModal(true);
                    }}
                    title={!isAuthenticated ? 'Inicia sesión para participar en este reto' : ''}
                  >
                    {isAuthenticated ? 'Subir tu participación' : 'Inicia sesión para participar'}
                  </button>
                ) : (
                  <button className="upload-participation-btn locked" disabled>
                    Reto finalizado
                  </button>
                )}
              </div>
            </div>

            <p className="event-full-description">{selectedEvent.description}</p>

            {selectedEvent.topEntries.length > 0 && (
              <div className="top-podium-section">
                <h3>Top 3 más valoradas</h3>
                <div className="podium-grid">
                  {selectedEvent.topEntries.map((entry, idx) => (
                    <div key={`top-${entry.id}`} className="podium-card">
                      <div className="rank-badge">#{idx + 1}</div>
                      <div className="podium-img-wrapper">
                        <img src={entry.url} alt={entry.title} />
                      </div>
                      <div className="podium-info">
                        <h4>{entry.title}</h4>
                        <p>por {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="gallery-section">
              <h3>Fotos subidas por los usuarios</h3>
              {selectedEvent.userGallery.length > 0 ? (
                <div className="gallery-grid">
                  {selectedEvent.userGallery.map((entry) => (
                    <article key={entry.id} className="gallery-item-card">
                      <div className="item-img-container">
                        <img src={entry.url} alt={entry.title} />
                      </div>
                      <div className="item-footer">
                        <div className="item-meta">
                          <h4>{entry.title}</h4>
                          <p>{entry.user}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className={`heart-btn ${likedPhotoIds.has(entry.id) ? 'liked' : ''}`}
                            onClick={() => handleLike(entry.id)}
                            title={likedPhotoIds.has(entry.id) ? 'Quitar like' : 'Dar like'}
                          >
                            ❤ <span className="like-counter">{entry.likes}</span>
                          </button>
                          {isOwnerAdmin && isChallengeOpen && (
                            <button
                              className="heart-btn"
                              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                              onClick={() => setPhotoToDelete(entry)}
                              title="Eliminar foto"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-gallery-fallback">
                  <p>Aún no hay participaciones. ¡Sé el primero en subir tu foto seleccionada!</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* MODAL: Crear nuevo reto */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear un nuevo reto</h3>
            <form onSubmit={submitCreateChallenge} className="modal-form">
              <div className="form-group">
                <label>Título del reto</label>
                <input type="text" placeholder="Ej. Reto de Cúmulos Estelares" value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea placeholder="Describe los requisitos técnicos..." value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} required />
              </div>
              <div
                className="form-group"
                onClick={() => {
                  const el = endDateInputRef.current;
                  if (!el) return;
                  if (typeof el.showPicker === 'function') el.showPicker();
                  else el.focus();
                }}
                style={{ cursor: 'pointer' }}
              >
                <label>Fecha de finalización</label>
                <input ref={endDateInputRef} type="date" value={newChallenge.endDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Imagen de referencia / Portada</label>
                <input type="file" accept="image/*" onChange={(e) => setChallengeFile(e.target.files[0])} className="file-input-custom" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Publicar reto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Subir participación */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Subir tu participación</h3>
            <form onSubmit={submitParticipation} className="modal-form">
              <div className="form-group">
                <label>Título de la fotografía</label>
                <input type="text" placeholder="Ej. Vía Láctea desde el hemisferio sur" value={newParticipation.title} onChange={(e) => setNewParticipation({ ...newParticipation, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Selecciona tu fotografía</label>
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="file-input-custom" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Subir foto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar eliminación de foto */}
      {photoToDelete && (
        <div className="modal-overlay" onClick={() => setPhotoToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>¿Eliminar esta foto?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              "{photoToDelete.title}" de {photoToDelete.user} se eliminará permanentemente.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPhotoToDelete(null)}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ background: '#dc2626' }} onClick={confirmDeletePhoto}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar finalización de reto */}
      {showFinalizeConfirm && (
        <div className="modal-overlay" onClick={() => setShowFinalizeConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>¿Finalizar este reto?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              El reto seguirá visible, pero ya nadie podrá subir más fotos ni tú podrás eliminar más participaciones.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowFinalizeConfirm(false)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={confirmFinalizeChallenge}>Finalizar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar eliminación de reto */}
      {retoToDelete && (
        <div className="modal-overlay" onClick={() => !deletingReto && setRetoToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>¿Eliminar este reto?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              El reto <strong>{retoToDelete.title}</strong> y todas sus participaciones se eliminarán permanentemente.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setRetoToDelete(null)} disabled={deletingReto}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ background: '#dc2626' }} onClick={confirmDeleteReto} disabled={deletingReto}>
                {deletingReto ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}