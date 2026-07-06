import React from 'react'

export default function ImageCard({ image, isFavorite, onToggleFavorite, onSelectImage }) {
  const author = image.author && image.author.trim() ? image.author : 'NASA'

  function handleFav(e) {
    e.stopPropagation()
    onToggleFavorite && onToggleFavorite(image.id)
  }

  return (
    <article className="space-grid-card">
      <div className="card-image-wrapper" onClick={() => onSelectImage && onSelectImage(image)}>
        <img className="grid-thumbnail-img" src={image.url} alt={image.title} />
      </div>

      <div className="card-bottom-bar">
        <div>
          <div className="card-item-title">{image.title}</div>
          <div className="card-item-author">{author}</div>
        </div>
        <div>
          <button className="favorite-action-btn" onClick={handleFav}>
            {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
          </button>
        </div>
      </div>
    </article>
  )
}
