export default function MainContent({ data }) {
  const {
    title,
    imageUrl,
    description,
    date,
    location,
    credits,
    tags = [],
    stats = []
  } = data || {}

  return (
    <main className="main-content-area">
      <div className="photo-view-shell">
        <section className="photo-stacked-card">
          <div className="photo-image-panel">
            <img src={imageUrl} alt={title} className="showcase-img" />
            <div className="photo-overlay-badges">
              <span className="photo-chip">Foto del día</span>
              <span className="photo-chip alt">Explora</span>
            </div>
          </div>

          <div className="photo-info-panel">
            <div className="photo-meta-top">
              <span className="photo-chip">Astrofotografía</span>
              <span className="photo-chip alt">Destacada</span>
            </div>

            <h2>{title}</h2>
            <p>{description}</p>

            <div className="photo-actions">
              <button className="action-pill primary">Guardar</button>
              <button className="action-pill">Agregar a favoritos</button>
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

            <div className="photo-stats">
              {stats.map((stat) => (
                <div key={stat} className="stat-pill">{stat}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
