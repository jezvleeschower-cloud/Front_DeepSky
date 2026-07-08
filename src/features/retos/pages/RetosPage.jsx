import { useState } from 'react';
import fondo1 from '../../../assets/fondo-1-DeepSks.png';
import menuAstro from '../../../assets/menu-astroFoto.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import '../../foto-del-dia/Astronomy.css';
import './RetosPage.css';

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Reto de Astrofotografía: Luna y cielo nocturno',
    description: 'Captura la luna con detalles y comparte tu mejor toma del cielo nocturno.',
    deadline: '20/07/2026',
    creator: 'Marta',
    entries: [
      { id: 1, author: 'LunaX', likes: 42, title: 'Cielo de verano', image: 'https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg' },
      { id: 2, author: 'Niko', likes: 39, title: 'Luz lunar', image: 'https://images-assets.nasa.gov/image/PIA16322/PIA16322~medium.jpg' },
      { id: 3, author: 'Sofía', likes: 35, title: 'Brillo nocturno', image: 'https://images-assets.nasa.gov/image/PIA22194/PIA22194~medium.jpg' }
    ]
  },
  {
    id: 2,
    title: 'Reto de Nebulosas',
    description: 'Muestra una nebulosa en una composición elegante y bien expuesta.',
    deadline: '05/08/2026',
    creator: 'Dario',
    entries: [
      { id: 4, author: 'Ari', likes: 29, title: 'Nebulosa azul', image: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000172/GSFC_20171208_Archive_e000172~medium.jpg' },
      { id: 5, author: 'Mina', likes: 24, title: 'Polvo cósmico', image: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg' }
    ]
  }
];

export default function RetosPage({ onNavigate, activeView = 'challenge' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0]);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [entryForm, setEntryForm] = useState({ title: '', image: '' });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.deadline) return;

    const newEvent = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      deadline: form.deadline,
      creator: 'Tú',
      entries: []
    };

    setEvents([newEvent, ...events]);
    setSelectedEvent(newEvent);
    setForm({ title: '', description: '', deadline: '' });
  };

  const rankedEntries = [...(selectedEvent?.entries || [])].sort((a, b) => b.likes - a.likes).slice(0, 3);

  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!entryForm.title || !entryForm.image) return;

    const newEntry = {
      id: Date.now(),
      author: 'Tú',
      likes: 0,
      title: entryForm.title,
      image: entryForm.image
    };

    const updatedEvents = events.map((event) =>
      event.id === selectedEvent?.id
        ? { ...event, entries: [newEntry, ...(event.entries || [])] }
        : event
    );

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((event) => event.id === selectedEvent?.id));
    setEntryForm({ title: '', image: '' });
  };

  const handleLike = (entryId) => {
    const updatedEvents = events.map((event) => {
      if (event.id !== selectedEvent?.id) return event;

      return {
        ...event,
        entries: event.entries.map((entry) =>
          entry.id === entryId ? { ...entry, likes: entry.likes + 1 } : entry
        )
      };
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((event) => event.id === selectedEvent?.id));
  };

  return (
    <main className="retos-page" style={{ backgroundImage: `url(${fondo1})` }}>
      <button className="forum-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menuAstro} alt="Menú" />
      </button>
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      <div className="foro-page-inner retos-page-inner">
        <section className="foro-hero retos-hero">
          <div className="foro-menu-location">
            <img src={menuAstro} alt="Retos" />
            <span>Retos / Astrofotografía</span>
          </div>
          <h1>Retos de Astrofotografía</h1>
          <p>Crea eventos, comparte tus mejores fotos y descubre las tomas más valoradas por la comunidad.</p>
        </section>

        <section className="retos-create-card">
          <h2>Crear un nuevo reto</h2>
          <form onSubmit={handleCreateEvent} className="reto-form">
            <input
              type="text"
              placeholder="Título del evento"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Breve descripción del evento"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tiempo límite (ej. 20/07/2026)"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <button type="submit">Publicar reto</button>
          </form>
        </section>

        <section className="retos-main-grid">
          <div className="retos-sidebar">
            <h3>Eventos creados</h3>
            <div className="retos-list">
              {events.map((event) => (
                <button key={event.id} className={`reto-event-card ${selectedEvent?.id === event.id ? 'active' : ''}`} onClick={() => setSelectedEvent(event)}>
                  <strong>{event.title}</strong>
                  <span>Hasta {event.deadline}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="retos-content">
            <div className="reto-detail-card">
              <div className="reto-detail-header">
                <div>
                  <p className="retos-eyebrow">Evento activo</p>
                  <h2>{selectedEvent?.title}</h2>
                </div>
                <span className="reto-badge">{selectedEvent?.deadline}</span>
              </div>
              <p>{selectedEvent?.description}</p>
              <p className="reto-meta">Creado por {selectedEvent?.creator}</p>
            </div>

            <div className="upload-card">
              <h3>Subir tu participación</h3>
              <form onSubmit={handleCreateEntry} className="reto-form compact-form">
                <input
                  type="text"
                  placeholder="Título de tu foto"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL de la imagen"
                  value={entryForm.image}
                  onChange={(e) => setEntryForm({ ...entryForm, image: e.target.value })}
                />
                <button type="submit">Subir foto</button>
              </form>
            </div>

            <div className="ranking-card">
              <h3>Top 3 más valoradas</h3>
              <div className="ranking-list">
                {rankedEntries.map((entry, index) => (
                  <article key={entry.id} className="ranking-item">
                    <div className="ranking-position">#{index + 1}</div>
                    <img src={entry.image} alt={entry.title} />
                    <div>
                      <h4>{entry.title}</h4>
                      <p>{entry.author}</p>
                    </div>
                    <button className="heart-btn" onClick={() => handleLike(entry.id)}>❤ {entry.likes}</button>
                  </article>
                ))}
              </div>
            </div>

            <div className="gallery-card">
              <h3>Fotos subidas por los usuarios</h3>
              <div className="gallery-grid">
                {(selectedEvent?.entries || []).map((entry) => (
                  <article key={entry.id} className="gallery-item">
                    <img src={entry.image} alt={entry.title} />
                    <div className="gallery-info">
                      <strong>{entry.title}</strong>
                      <span>{entry.author}</span>
                      <p>❤ {entry.likes}</p>
                    </div>
                    <button className="heart-btn small" onClick={() => handleLike(entry.id)}>Dar corazón</button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
