export default function MainContent({ data }) {
  return (
    <main className="main-content-area">
      <div className="carousel-container">
        <button className="carousel-arrow left-arrow">❮</button>
        
        <article className="space-display-card">
          <div className="image-frame">
            <img src={data.imageUrl} alt={data.title} className="showcase-img" />
          </div>
          <div className="space-card-info">
            <h2>{data.title}</h2>
            <p>{data.description}</p>
          </div>
        </article>
        
        <button className="carousel-arrow right-arrow">❯</button>
      </div>
    </main>
  )
}
