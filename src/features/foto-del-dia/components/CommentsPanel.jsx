import { useState, useRef, useEffect } from 'react'
import useAuth from '../../../hooks/useAuth';

export default function CommentsPanel({ onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef(null)
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isExpanded && inputRef.current && isAuthenticated) {
      inputRef.current.focus()
    }
  }, [isExpanded, isAuthenticated])

  const handleInputFocus = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
    }
  };

  return (
    <section className={`comments-drawer ${isExpanded ? 'expanded' : ''}`}>
      <div className="drawer-trigger" onClick={() => setIsExpanded(prev => !prev)} role="button" aria-expanded={isExpanded}>
        <span>Comentarios</span>
        <span className={`arrow-indicator ${isExpanded ? 'down' : 'up'}`}></span>
      </div>
      <div className="drawer-body" style={{ display: isExpanded ? 'flex' : 'none' }}>
        <div className="comments-scroll-area">
          <p className="no-comments-placeholder">Comunidad de DeepSky - Escribe un comentario abajo.</p>
        </div>
        <div className="comment-input-form">
          <input
            ref={inputRef}
            type="text"
            placeholder={isAuthenticated ? 'Escribe un comentario...' : 'Inicia sesión para comentar'}
            className="custom-comment-input"
            disabled={!isAuthenticated}
            onFocus={handleInputFocus}
          />
          <button
            className="submit-comment-btn"
            disabled={!isAuthenticated}
            onClick={!isAuthenticated ? () => onNavigate && onNavigate('login') : undefined}
          >
            Enviar
          </button>
        </div>
      </div>
    </section>
  )
}