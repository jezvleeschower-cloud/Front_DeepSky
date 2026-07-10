// front/src/features/foro/pages/ForoPage.jsx
import { useState } from 'react';
import './ForoPage.css';
import menuIcon from '../../../assets/menu-foro.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import useAuth from '../../../hooks/useAuth';

export default function ForoPage({ onNavigate, activeView = 'forum' }) {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topics, setTopics] = useState([
    { id: 1, title: 'Descubrimientos recientes', author: 'AstronomaNova', posts: 12, lastActivity: 'Hace 10 min', category: 'Descubrimientos', image: null },
    { id: 2, title: 'Cómo procesar imágenes astronómicas', author: 'CosmosPixel', posts: 8, lastActivity: 'Hace 1 hora', category: 'Imágenes', image: null },
    { id: 3, title: 'Telescopios recomendados para principiantes', author: 'Stargazer99', posts: 24, lastActivity: 'Hace 2 días', category: 'Telescopios', image: null }
  ]);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Preguntas');
  const [newImage, setNewImage] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const filteredTopics = currentCategory === 'Todos'
    ? topics
    : topics.filter(t => t.category === currentCategory);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreateTopicClick = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    setIsCreatingTopic(true);
  };

  const handleCreateTopicSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (!newTitle.trim()) return;

    const newTopic = {
      id: topics.length + 1,
      title: newTitle,
      author: 'MiUsuario',
      posts: 0,
      lastActivity: 'Ahora mismo',
      category: newCategory,
      image: newImage
    };
    setTopics([newTopic, ...topics]);
    setNewTitle('');
    setNewImage(null);
    setIsCreatingTopic(false);
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (!newMessage.trim()) return;
    // lógica real de guardado de mensaje, más adelante
    setNewMessage('');
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
            <img src={menuIcon} alt="Menú Principal" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">FORO COMUNITARIO</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-btn-shared" onClick={() => onNavigate(isAuthenticated ? 'account' : 'login')}>
            MI CUENTA
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

          {isCreatingTopic && isAuthenticated ? (
            <section className="forum-form-section">
              <button className="back-forum-btn" onClick={() => setIsCreatingTopic(false)}>
                ← Cancelar y volver
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
                  <label>Categoría</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Descubrimientos">Descubrimientos</option>
                    <option value="Imágenes">Imágenes</option>
                    <option value="Telescopios">Telescopios</option>
                    <option value="Preguntas">Preguntas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Añadir fotografía <span className="optional-tag">(Opcional)</span></label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input-custom" />
                  {newImage && (
                    <div className="image-preview-box">
                      <img src={newImage} alt="Vista previa" />
                    </div>
                  )}
                </div>
                <button type="submit" className="save-topic-btn">Publicar tema</button>
              </form>
            </section>
          ) : selectedTopic ? (
            <section className="topic-detail-view">
              <button className="back-forum-btn" onClick={() => setSelectedTopic(null)}>
                ← Volver a los temas
              </button>
              <div className="selected-topic-header">
                <h2>{selectedTopic.title}</h2>
                <p>Creado por: <strong>{selectedTopic.author}</strong> • Categoría: {selectedTopic.category}</p>
              </div>
              {selectedTopic.image && (
                <div className="topic-attached-image">
                  <img src={selectedTopic.image} alt={selectedTopic.title} />
                </div>
              )}
              <div className="topic-messages-list">
                <article className="message-item-card">
                  <p>Este espacio está listo para recibir tus preguntas y respuestas.</p>
                  <span className="message-author-tag">Por {selectedTopic.author}</span>
                </article>
              </div>
              <div className="new-message-form-box">
                <textarea
                  placeholder={isAuthenticated ? 'Escribe tu comentario aquí...' : 'Inicia sesión para comentar'}
                  value={newMessage}
                  disabled={!isAuthenticated}
                  onFocus={() => { if (!isAuthenticated) onNavigate && onNavigate('login'); }}
                  onChange={(e) => setNewMessage(e.target.value)}
                ></textarea>
                <button
                  className={`send-message-btn ${!isAuthenticated ? 'locked' : ''}`}
                  onClick={handleSendMessage}
                >
                  Enviar
                </button>
              </div>
            </section>
          ) : (
            <section className="forum-topics-section">
              <div className="section-topics-header">
                <h2>Temas recientes</h2>
                <button
                  className={`create-topic-btn ${!isAuthenticated ? 'locked' : ''}`}
                  onClick={handleCreateTopicClick}
                  title={!isAuthenticated ? 'Inicia sesión para crear un tema' : ''}
                >
                  {isAuthenticated ? 'Crear nuevo tema' : 'Inicia sesión para crear un tema'}
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
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <div className="topic-row-main">
                        <h3>{topic.title}</h3>
                        <span className="topic-row-author-name">Por {topic.author}</span>
                      </div>
                      <div className="topic-row-meta">
                        <span className="posts-count-badge">{topic.posts} publicaciones</span>
                        <span className="activity-time-tag">{topic.lastActivity}</span>
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
    </div>
  );
}