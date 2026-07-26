// front/src/features/foto-del-dia/components/MainContent.jsx
import useAuth from '../../../hooks/useAuth';

export default function MainContent({ data, onPrevDay, onNextDay, onNavigate }) {
  const { title, imageUrl, description, date, location, credits, tags = [] } = data || {};
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    // lógica real de favoritos, más adelante
  };

  return (
    <main className="main-content-area">
      <div className="photo-view-shell expanded-shell">
        <button className="nav-arrow-btn prev" onClick={onPrevDay} aria-label="Día anterior">
          &#10094;
        </button>
        <section className="photo-stacked-card modular-card-large">
          <div className="photo-image-panel">
            <img src={imageUrl} alt={title} className="showcase-img" />
          </div>
          <div className="photo-info-panel">
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="photo-actions">
              <button
                className={`action-pill primary ${!isAuthenticated ? 'locked' : ''}`}
                style={{ width: '100%', maxWidth: '280px' }}
                onClick={handleFavoriteClick}
                title={!isAuthenticated ? 'Inicia sesión para agregar a favoritos' : ''}
              >
                {isAuthenticated ? 'Agregar a favoritos' : 'Inicia sesión para agregar a favoritos'}
              </button>
            </div>
            <div className="photo-details">
              <div>
                <span>Fecha</span>
                <strong>{date}</strong>
              </div>
              <div>
                <span>Ubicación</span>
                <strong>{location}</strong>
              </div>
              <div>
                <span>Créditos</span>
                <strong>{credits}</strong>
              </div>
            </div>
            <div className="photo-tags">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
        </section>
        <button className="nav-arrow-btn next" onClick={onNextDay} aria-label="Día siguiente">
          &#10095;
        </button>
      </div>
    </main>
  );
}