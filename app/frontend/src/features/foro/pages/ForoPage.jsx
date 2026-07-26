// front/src/features/foro/pages/ForoPage.jsx
import { useState, useEffect } from 'react';
import './ForoPage.css';

import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import useAuth from '../../../hooks/useAuth';
import { foroService } from '../services/foroService';

export default function ForoPage({ onNavigate, activeView = 'forum' }) {
  const { isAuthenticated, role, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [errorTopics, setErrorTopics] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Preguntas');
  const [newMessage, setNewMessage] = useState('');
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);

  const filteredTopics = currentCategory === 'Todos'
    ? topics
    : topics.filter(t => t.category === currentCategory);

  const canModerateComments = isAuthenticated && role === 'divulgador';

  const handleCreateTopicClick = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (role !== 'divulgador') return;
    setIsCreatingTopic(true);
  };

  const handleCreateTopicSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated || role !== 'divulgador') return;
    if (!newTitle.trim()) return;
    foroService.crearHilo({ titulo: newTitle, contenido: newContent, categoria: newCategory })
      .then((res) => {
        if (res && res.hilo) loadTopics();
        setNewTitle('');
        setNewContent('');
        setIsCreatingTopic(false);
      })
      .catch((err) => {
        console.error('Error creando hilo', err);
        alert('No se pudo crear el hilo: ' + (err.message || String(err)));
      });
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (!newMessage.trim()) return;
    foroService.comentarHilo({ foroId: selectedTopic.id, contenido: newMessage })
      .then((res) => {
        if (res && res.comentario) loadCommentsForSelectedTopic(selectedTopic.id);
        setNewMessage('');
      })
      .catch((err) => {
        console.error('Error publicando comentario', err);
        alert('No se pudo publicar el comentario: ' + (err.message || String(err)));
      });
  };

  const confirmDeleteComment = () => {
    if (!canModerateComments || !commentToDelete) return;
    foroService.eliminarComentario(selectedTopic.id, commentToDelete.id)
      .then(() => {
        loadCommentsForSelectedTopic(selectedTopic.id);
        setCommentToDelete(null);
      })
      .catch((err) => {
        console.error('Error eliminando comentario', err);
        alert('No se pudo eliminar: ' + (err.message || String(err)));
      });
  };

  const confirmDeleteTopic = () => {
    if (!topicToDelete) return;
    foroService.eliminarHilo(topicToDelete.id)
      .then(() => {
        setTopics(prev => prev.filter(t => t.id !== topicToDelete.id));
        setTopicToDelete(null);
      })
      .catch((err) => {
        console.error('Error eliminando hilo', err);
        alert('No se pudo eliminar: ' + (err.message || String(err)));
        setTopicToDelete(null);
      });
  };

  const loadTopics = () => {
    setLoadingTopics(true);
    setErrorTopics(null);
    foroService.listarHilos()
      .then((res) => {
        const mapped = (res || []).map(h => ({
          id: h.idForo || h.id,
          title: h.titulo || h.title,
          author: h.usuarioNombre || ('Usuario-' + (h.usuarioId || 'N/A')),
          posts: 0,
          lastActivity: h.fechaCreacion || '',
          category: h.categoriaNombre || 'General',
          comments: []
        }));
        setTopics(mapped);
      })
      .catch((err) => {
        console.error('Error cargando temas', err);
        setErrorTopics(err.message || String(err));
      })
      .finally(() => setLoadingTopics(false));
  };

  useEffect(() => { loadTopics(); }, []);

  const loadCommentsForSelectedTopic = (topicId) => {
    foroService.obtenerComentarios(topicId)
      .then((res) => {
        const mapped = (res || []).map(c => ({ id: c.idComentario || c.id, author: c.usuarioNombre || ('Usuario-' + c.usuarioId), text: c.contenido }));
        setSelectedTopic((prev) => prev ? { ...prev, comments: mapped } : prev);
        setTopics((prev) => prev.map(t => t.id === topicId ? { ...t, comments: mapped } : t));
      })
      .catch((err) => console.warn('No se pudieron cargar comentarios', err));
  };

  return (
    <div className="foro-page-container">
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
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú de navegación">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">FORO COMUNITARIO</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-btn-shared" onClick={() => onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
          </button>
        </div>
      </nav>

      <main className="foro-main-content">
        <div className="foro-page-inner">
          <div className="foro-breadcrumb">
            <span className="breadcrumb-path">Foro / Inicio</span>
          </div>

          <section className="foro-hero-banner">
            <h1>Foro Comunitario</h1>
            <p>Comparte tus hallazgos, dudas y opiniones relacionados con el espacio profundo y la astronomía.</p>
          </section>

          {/* Vista: Crear tema */}
          {isCreatingTopic && role === 'divulgador' && (
            <section key="view-create" className="forum-form-section">
              <button className="back-forum-btn" onClick={() => setIsCreatingTopic(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Cancelar y volver
              </button>
              <h2>Crear un nuevo tema de discusión</h2>
              <form onSubmit={handleCreateTopicSubmit} className="forum-creation-form">
                <div className="form-group">
                  <label>Título del tema</label>
                  <input
                    type="text"
                    placeholder="Escribe un título claro..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contenido</label>
                  <textarea
                    placeholder="Contenido inicial..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Descubrimientos">Descubrimientos</option>
                    <option value="Imágenes">Imágenes</option>
                    <option value="Telescopios">Telescopios</option>
                    <option value="Preguntas">Preguntas</option>
                  </select>
                </div>
                <button type="submit" className="save-topic-btn">Publicar tema</button>
              </form>
            </section>
          )}

          {/* Vista: Detalle de topic */}
          {!isCreatingTopic && selectedTopic && (
            <section key={`view-topic-${selectedTopic.id}`} className="topic-detail-view">
              <button className="back-forum-btn" onClick={() => setSelectedTopic(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Volver a los temas
              </button>
              <div className="selected-topic-header">
                <h2>{selectedTopic.title}</h2>
                <p>Creado por: <strong>{selectedTopic.author}</strong> • Categoría: {selectedTopic.category}</p>
              </div>

              <div className="topic-messages-list">
                {selectedTopic.comments.length > 0 ? (
                  selectedTopic.comments.map((comment) => (
                    <article key={comment.id} className="message-item-card">
                      <div className="message-item-content">
                        {comment.text && <p>{comment.text}</p>}
                        <span className="message-author-tag">
                          <svg className="author-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
                          Por {comment.author}
                        </span>
                      </div>
                      {canModerateComments && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => setCommentToDelete(comment)}
                          title="Eliminar comentario"
                        >
                          Eliminar
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <article className="message-item-card">
                    <div className="message-item-content">
                      <p>Este espacio está listo para recibir tus preguntas y respuestas.</p>
                      <span className="message-author-tag">Por {selectedTopic.author}</span>
                    </div>
                  </article>
                )}
              </div>

              <div className="new-message-form-box">
                <textarea
                  placeholder={isAuthenticated ? 'Escribe tu comentario aquí...' : 'Inicia sesión para comentar'}
                  value={newMessage}
                  disabled={!isAuthenticated}
                  onFocus={() => { if (!isAuthenticated) onNavigate && onNavigate('login'); }}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className={`send-message-btn ${!isAuthenticated ? 'locked' : ''}`}
                  onClick={handleSendMessage}
                >
                  Enviar
                </button>
              </div>
            </section>
          )}

          {/* Vista: Lista de temas */}
          {!isCreatingTopic && !selectedTopic && (
            <section key="view-list" className="forum-topics-section">
              <div className="section-topics-header">
                <h2>Temas recientes</h2>
                <button
                  className={`create-topic-btn ${role !== 'divulgador' ? 'locked' : ''}`}
                  onClick={handleCreateTopicClick}
                  title={!isAuthenticated ? 'Inicia sesión para crear un tema' : role !== 'divulgador' ? 'Solo administradores pueden crear temas' : ''}
                >
                  {!isAuthenticated ? 'Inicia sesión para crear un tema' : role !== 'divulgador' ? 'Solo administradores' : 'Crear nuevo tema'}
                </button>
              </div>

              <div className="forum-categories-bar">
                {['Todos', 'Imágenes', 'Telescopios', 'Descubrimientos', 'Preguntas'].map(cat => (
                  <button
                    key={cat}
                    className={`category-pill-btn ${currentCategory === cat ? 'active' : ''}`}
                    onClick={() => setCurrentCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="topics-rows-container">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map(topic => (
                    <article
                      key={topic.id}
                      className="topic-row-card"
                      onClick={() => { setSelectedTopic(topic); loadCommentsForSelectedTopic(topic.id); }}
                    >
                      <div className="topic-row-main">
                        <h3>{topic.title}</h3>
                        <span className="topic-row-author-name">Por {topic.author}</span>
                      </div>
                      <div className="topic-row-meta">
                        <span className="posts-count-badge">{topic.comments.length} publicaciones</span>
                        <span className="activity-time-tag">{topic.lastActivity}</span>
                        {role === 'divulgador' && (
                          <button
                            className="delete-comment-btn"
                            onClick={(e) => { e.stopPropagation(); setTopicToDelete(topic); }}
                            title="Eliminar hilo"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="no-topics-found">No hay temas en esta categoría.</p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL: Confirmar eliminación de comentario */}
      {commentToDelete && (
        <div className="modal-overlay" onClick={() => setCommentToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar este comentario?</h3>
            <p>
              El comentario de <strong>{commentToDelete.author}</strong> se eliminará permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setCommentToDelete(null)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={confirmDeleteComment}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar eliminación de hilo */}
      {topicToDelete && (
        <div className="modal-overlay" onClick={() => setTopicToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar este hilo?</h3>
            <p>
              El hilo <strong>{topicToDelete.title}</strong> y todos sus comentarios se eliminarán permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setTopicToDelete(null)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={confirmDeleteTopic}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}