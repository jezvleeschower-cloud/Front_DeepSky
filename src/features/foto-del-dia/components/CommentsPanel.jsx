import { useState, useRef, useEffect } from 'react'

export default function CommentsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  return (
    <section className={`comments-drawer ${isExpanded ? 'expanded' : ''}`}>
      <div className="drawer-trigger" onClick={() => setIsExpanded(prev => !prev)} role="button" aria-expanded={isExpanded}>
        <span>Comentarios</span>
        <span className={`arrow-indicator ${isExpanded ? 'down' : 'up'}`}></span>
      </div>
      
      <div className="drawer-body" style={{ display: isExpanded ? 'flex' : 'none' }}>
        <div className="comments-scroll-area">
          {/* Aquí se renderizarán los comentarios provenientes de la base de datos MySQL más adelante */}
          <p className="no-comments-placeholder">Comunidad de DeepSky - Escribe un comentario abajo.</p>
        </div>
        
        <div className="comment-input-form">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Escribe un comentario..." 
            className="custom-comment-input"
          />
          <button className="submit-comment-btn">➔</button>
        </div>
      </div>
    </section>
  )
}
