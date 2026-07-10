import React, { useState } from 'react';
import './RetosPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import menuLupa from '../../../assets/menu-lupa.png';
import fondo from '../../../assets/fondo-8-DeepSks.png';

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Reto de Astrofotografía: Luna y cielo nocturno',
    description: 'Captura la luna con detalles y comparte tu mejor toma del cielo nocturno.',
    author: 'Marta',
    date: 'Hasta 20/07/2026',
    imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=600', 
    topEntries: [
      { id: 't1', title: 'Luz lunar', user: 'Niko', likes: 42, url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500' },
      { id: 't2', title: 'Cielo de verano', user: 'LunaX', likes: 38, url: 'https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?w=500' },
      { id: 't3', title: 'Brillo nocturno', user: 'Sofia', likes: 25, url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500' }
    ],
    userGallery: [
      { id: 'g1', title: 'Luz lunar', user: 'Niko', likes: 42, url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500' },
      { id: 'g2', title: 'Cielo de verano', user: 'LunaX', likes: 38, url: 'https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?w=500' },
      { id: 'g3', title: 'Brillo nocturno', user: 'Sofia', likes: 25, url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500' }
    ]
  },
  {
    id: 2,
    title: 'Reto de Nebulosas',
    description: 'Enfoca las estructuras de gas profundo en el espacio exterior y destaca las tonalidades de hidrógeno.',
    author: 'Dario',
    date: 'Hasta 15/08/2026',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600',
    topEntries: [],
    userGallery: []
  }
];

export default function RetosPage({ onNavigate, activeView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null); 

  // Estados de los modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Estados para formularios
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', date: 'Hasta 30/08/2026' });
  const [challengeFile, setChallengeFile] = useState(null); 
  
  const [newParticipation, setNewParticipation] = useState({ title: '' });
  const [selectedFile, setSelectedFile] = useState(null); 

  const handleLike = (photoId) => {
    const updatedEvents = events.map(evt => {
      if (evt.id !== selectedEvent.id) return evt;
      
      const updatedGallery = evt.userGallery.map(img => 
        img.id === photoId ? { ...img, likes: img.likes + 1 } : img
      );

      const updatedTop = [...updatedGallery]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);

      return { ...evt, userGallery: updatedGallery, topEntries: updatedTop };
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
  };

  const submitCreateChallenge = (e) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description || !challengeFile) return;

    const challengeImgUrl = URL.createObjectURL(challengeFile);

    const created = {
      id: Date.now(),
      title: newChallenge.title,
      description: newChallenge.description,
      author: 'Tú',
      date: newChallenge.date,
      imageUrl: challengeImgUrl, 
      topEntries: [],
      userGallery: []
    };

    setEvents([created, ...events]);
    setSelectedEvent(created); 
    setNewChallenge({ title: '', description: '', date: 'Hasta 30/08/2026' });
    setChallengeFile(null);
    setShowCreateModal(false);
  };

  const submitParticipation = (e) => {
    e.preventDefault();
    if (!newParticipation.title || !selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);

    const updatedEvents = events.map(evt => {
      if (evt.id !== selectedEvent.id) return evt;

      const newPhoto = {
        id: Date.now(),
        title: newParticipation.title,
        user: 'Tú',
        likes: 0,
        url: objectUrl
      };

      const updatedGallery = [newPhoto, ...evt.userGallery];
      const updatedTop = [...updatedGallery].sort((a, b) => b.likes - a.likes).slice(0, 3);

      return { ...evt, userGallery: updatedGallery, topEntries: updatedTop };
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find(e => e.id === selectedEvent.id));
    setNewParticipation({ title: '' });
    setSelectedFile(null);
    setShowUploadModal(false);
  };

  return (
    /* Cambiado: Clase de fondo fondo-8-DeepSks asignada */
    <div className="retos-page fondo-8-DeepSks">
      
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <img src={menuLupa} alt="Menú Principal" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">RETOS / ASTROFOTOGRAFÍA</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate('login')}>
            MI CUENTA
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
              <button className="create-challenge-btn-large" onClick={() => setShowCreateModal(true)}>
                + Crear un nuevo reto
              </button>
            </div>

            <div className="forum-grid-stack">
              {events.map((evt) => (
                <article key={evt.id} className="forum-challenge-card" onClick={() => setSelectedEvent(evt)}>
                  {evt.imageUrl && (
                    <div className="forum-card-cover">
                      <img src={evt.imageUrl} alt={evt.title} />
                    </div>
                  )}
                  <div className="forum-card-body">
                    <div className="card-top">
                      <span className="forum-badge-date">{evt.date}</span>
                      <h4>{evt.title}</h4>
                      <p>{evt.description.substring(0, 110)}...</p>
                    </div>
                    <div className="card-bottom">
                      <span className="author-tag">Por {evt.author}</span>
                      <span className="action-link">Ver reto e inscripciones →</span>
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
                ← Volver al listado de retos
              </button>
            </div>

            <div className="focus-card-header">
              <div>
                <span className="status-eyebrow">EVENTO ACTIVO</span>
                <h2>{selectedEvent.title}</h2>
                <p className="event-credits">
                  Creado por {selectedEvent.author} • <span className="date-highlight">{selectedEvent.date}</span>
                </p>
              </div>
              
              <button className="upload-participation-btn" onClick={() => setShowUploadModal(true)}>
                Subir tu participación
              </button>
            </div>

            <p className="event-full-description">{selectedEvent.description}</p>

            {/* Top 3 */}
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

            {/* Galería */}
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
                        <button className="heart-btn" onClick={() => handleLike(entry.id)}>
                          ❤ <span className="like-counter">{entry.likes}</span>
                        </button>
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
                <input 
                  type="text" 
                  placeholder="Ej. Reto de Cúmulos Estelares"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  placeholder="Describe los requisitos técnicos..."
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Imagen de referencia / Portada</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setChallengeFile(e.target.files[0])}
                  className="file-input-custom"
                  required
                />
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
                <input 
                  type="text" 
                  placeholder="Ej. Vía Láctea desde el hemisferio sur"
                  value={newParticipation.title}
                  onChange={(e) => setNewParticipation({...newParticipation, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Selecciona tu fotografía</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="file-input-custom"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Subir foto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}