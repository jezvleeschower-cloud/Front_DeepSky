// front/src/features/foto-del-dia/components/MainContent.jsx
export default function MainContent({ data, onPrevDay, onNextDay }) {
  const { title, imageUrl, description, date, location, credits, tags = [] } = data || {};

  return (
    <main className="main-content-area">
      <div className="photo-view-shell expanded-shell">
        
        {/* Botón Navegación Día Anterior */}
        <button className="nav-arrow-btn prev" onClick={onPrevDay} aria-label="Día anterior">
          &#10094;
        </button>

        {/* Tarjeta principal optimizada en tamaño */}
        <section className="photo-stacked-card modular-card-large">
          <div className="photo-image-panel">
            <img src={imageUrl} alt={title} className="showcase-img" />
          </div>
          
          <div className="photo-info-panel">
            <h2>{title}</h2>
            <p>{description}</p>
            
            <div className="photo-actions">
              <button className="action-pill primary" style={{ width: '100%', maxWidth: '280px' }}>
                Agregar a favoritos
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

        {/* Botón Navegación Día Siguiente */}
        <button className="nav-arrow-btn next" onClick={onNextDay} aria-label="Día siguiente">
          &#10095;
        </button>

      </div>
    </main>
  );
}