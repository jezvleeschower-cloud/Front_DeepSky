import { useState } from 'react'

export default function CommentsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className={`comments-drawer ${isExpanded ? 'expanded' : ''}`}>
      <div className="drawer-trigger" onClick={() => setIsExpanded(!isExpanded)}>
        <span>Comentarios</span>
        <span className={`arrow-indicator ${isExpanded ? 'down' : 'up'}`}></span>
      </div>
      
      {isExpanded && (
        <div className="drawer-body">
          <div className="comments-scroll-area">
            {/* Aquí se renderizarán los comentarios provenientes de la base de datos MySQL más adelante */}
            <p className="no-comments-placeholder">Comunidad de DeepSky - Escribe un comentario abajo.</p>
          </div>
          
          <div className="comment-input-form">
            <input 
              type="text" 
              placeholder="Escribe un comentario..." 
              className="custom-comment-input"
            />
            <button className="submit-comment-btn">➔</button>
          </div>
        </div>
      )}
    </section>
  )
}