// front/src/features/foto-del-dia/components/MainContent.jsx
import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { favoritoService } from '../../favoritos/services/favoritoService';

// Fecha de hoy en formato "yyyy-MM-dd", en hora local del usuario
function getTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Limpia artefactos que MyMemory deja en los títulos al traducir,
// como "USGS Astrogeology", "JPL", "NASA/", números entre paréntesis, etc.
function limpiarTitulo(titulo) {
  if (!titulo) return titulo;
  return titulo
    // Quitar sufijos técnicos comunes de la NASA que no se traducen
    .replace(/\s*[-–|\/]\s*(NASA|JPL|ESA|USGS|STScI|HST|APOD|ESO|NOAA)[^\w]*/gi, '')
    .replace(/\s*(NASA|JPL|ESA|USGS|STScI|HST|APOD|ESO|NOAA)\s*$/gi, '')
    // Quitar créditos entre paréntesis al final: "(Image: NASA/JPL)"
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .trim();
}

// Extrae el ID de video de una URL de YouTube (watch?v=ID o youtu.be/ID)
function extraerYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function MainContent({ data, onPrevDay, onNextDay, onNavigate }) {
  const { title, imageUrl, description, date, credits, mediaType } = data || {};
  const { isAuthenticated, addFavorite, removeFavorite, isFavorite: checkIsFavorite } = useAuth();
  const [savingFavorite, setSavingFavorite] = useState(false);

  // Si la foto mostrada es la de hoy, no tiene sentido ofrecer "día siguiente"
  const isToday = date === getTodayIso();

  // Título limpio sin artefactos de traducción
  const tituloPresentable = limpiarTitulo(title);

  // Crédito a mostrar: si la NASA no incluye copyright, la imagen es de dominio público
  const creditoPresentable = credits?.trim() || 'NASA / Dominio Público';

  // Id estable para esta foto del día (una por fecha)
  const favoriteId = `apod-${date}`;
  const isFavorite = isAuthenticated && checkIsFavorite(favoriteId);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    if (savingFavorite) return;

    setSavingFavorite(true);
    try {
      if (isFavorite) {
        await favoritoService.eliminar(favoriteId);
        removeFavorite(favoriteId);
      } else {
        const imagenPayload = {
          nasaId: favoriteId,
          title: tituloPresentable,
          description,
          url: imageUrl,
          dateCreated: date || null,
          center: creditoPresentable,
          mediaType: 'image',
          keywords: [],
        };
        await favoritoService.agregar(imagenPayload);
        addFavorite({ id: favoriteId, title: tituloPresentable, url: imageUrl, author: creditoPresentable, category: 'Foto del día' });
      }
    } catch (err) {
      console.error('No fue posible actualizar el favorito', err);
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <main className="main-content-area">
      <div className="photo-view-shell expanded-shell">
        <button className="nav-arrow-btn prev" onClick={onPrevDay} aria-label="Día anterior">
          &#10094;
        </button>
        <section className="photo-stacked-card modular-card-large">
          <div className="photo-image-panel">
            {mediaType === 'video' ? (
              <iframe
                className="showcase-img showcase-video"
                src={`https://www.youtube.com/embed/${extraerYoutubeId(imageUrl) || ''}`}
                title={tituloPresentable}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={imageUrl} alt={tituloPresentable} className="showcase-img" />
            )}
          </div>
          <div className="photo-info-panel">
            <h2>{tituloPresentable}</h2>
            <p>{description}</p>
            <div className="photo-actions">
              <button
                className={`action-pill primary ${!isAuthenticated ? 'locked' : ''} ${isFavorite ? 'is-favorite' : ''}`}
                style={{ width: '100%', maxWidth: '280px' }}
                onClick={handleFavoriteClick}
                disabled={savingFavorite}
                title={!isAuthenticated ? 'Inicia sesión para agregar a favoritos' : ''}
              >
                {!isAuthenticated
                  ? 'Inicia sesión para agregar a favoritos'
                  : savingFavorite
                    ? 'Guardando...'
                    : isFavorite
                      ? '★ Agregado a favoritos'
                      : 'Agregar a favoritos'}
              </button>
            </div>
            <div className="photo-details">
              <div>
                <span>Fecha</span>
                <strong>{date}</strong>
              </div>
              <div>
                <span>Créditos</span>
                <strong>{creditoPresentable}</strong>
              </div>
            </div>
          </div>
        </section>
        {!isToday && (
          <button className="nav-arrow-btn next" onClick={onNextDay} aria-label="Día siguiente">
            &#10095;
          </button>
        )}
      </div>
    </main>
  );
}