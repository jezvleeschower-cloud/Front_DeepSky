import { useState, useRef, useEffect } from 'react'
import useAuth from '../../../hooks/useAuth';
import { comentarioService } from '../services/fotoDiaService';

export default function CommentsPanel({ onNavigate, fecha }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef(null)
  const { isAuthenticated, role, userData } = useAuth();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Solo un administrador puede borrar comentarios de la Foto del Día
  // El rol 'divulgador' es el único con permisos de moderación en la base de datos
  const canDeleteComment = isAuthenticated && role === 'divulgador';

  useEffect(() => {
    if (isExpanded && inputRef.current && isAuthenticated) {
      inputRef.current.focus()
    }
  }, [isExpanded, isAuthenticated])

  // Cargar comentarios reales desde el backend cada vez que cambia la fecha de la foto mostrada
  useEffect(() => {
    let cancelled = false;
    async function loadComments() {
      if (!fecha) {
        setComments([]);
        return;
      }
      setLoadingComments(true);
      try {
        const res = await comentarioService.listar(fecha);
        if (!cancelled) {
          setComments(res.map(c => ({
            id: c.id,
            author: c.usuarioNombre || (c.usuarioId ? `Usuario #${c.usuarioId}` : 'Usuario'),
            text: c.text,
          })));
        }
      } catch (err) {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setLoadingComments(false);
      }
    }
    loadComments();
    return () => { cancelled = true };
  }, [fecha]);

  const handleInputFocus = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (!newComment.trim()) return;
    if (!fecha) return;

    const contenido = newComment.trim();
    setSubmitError('');
    try {
      await comentarioService.publicar(fecha, contenido);
      // Refrescamos la lista real desde el backend en vez de simular localmente
      const res = await comentarioService.listar(fecha);
      setComments(res.map(c => ({
        id: c.id,
        author: c.usuarioNombre || (c.usuarioId ? `Usuario #${c.usuarioId}` : 'Usuario'),
        text: c.text,
      })));
      setNewComment('');
    } catch (err) {
      setSubmitError(err.message || 'No se pudo publicar el comentario.');
    }
  };

  const confirmDeleteComment = async () => {
    if (!canDeleteComment || !commentToDelete) return;
    try {
      await comentarioService.eliminar(commentToDelete.id);
      setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
    } catch (err) {
      console.error('Error eliminando comentario', err);
    } finally {
      setCommentToDelete(null);
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
          {loadingComments ? (
            <p className="no-comments-placeholder">Cargando comentarios...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <article key={comment.id} className="comment-item-card">
                <div className="comment-item-content">
                  <span className="comment-author-tag">
                    <svg className="author-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
                    {comment.author}
                  </span>
                  <p>{comment.text}</p>
                </div>
                {canDeleteComment && (
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
            <p className="no-comments-placeholder">Comunidad de DeepSky - Escribe un comentario abajo.</p>
          )}
        </div>
        <div className="comment-input-form">
          <input
            ref={inputRef}
            type="text"
            placeholder={isAuthenticated ? 'Escribe un comentario...' : 'Inicia sesión para comentar'}
            className="custom-comment-input"
            disabled={!isAuthenticated}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(); }}
          />
          <button
            className="submit-comment-btn"
            disabled={!isAuthenticated}
            onClick={!isAuthenticated ? () => onNavigate && onNavigate('login') : handleSubmitComment}
          >
            Enviar
          </button>
        </div>
        {submitError && <p className="auth-error-message">{submitError}</p>}
      </div>

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
    </section>
  )
}