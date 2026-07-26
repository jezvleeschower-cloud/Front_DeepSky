import React, { useMemo, useState, useEffect } from 'react';
import './SearchView.css';
import ImageCard from '../../../components/common/ImageCard';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import useAuth from '../../../hooks/useAuth';
import { imagenService } from '../services/imagenService';
import { favoritoService } from '../../favoritos/services/favoritoService';
import fondo1 from '../../../assets/fondo-1-DeepSks.png';
import fondo4 from '../../../assets/fondo-4-DeepSks.png';


const MOCK_IMAGES = [
  { id: '1', title: 'Galaxia Espiral', author: 'Cerqueira', category: 'Galaxias', url: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg' },
  { id: '2', title: 'Estrella Gigante', author: 'Arnaud Girault', category: 'Estrellas', url: 'https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg' },
  { id: '3', title: 'Nebulosa Verde-Azul', author: 'Steve Gribble', category: 'Nebulosas', url: 'https://images-assets.nasa.gov/image/PIA14293/PIA14293~medium.jpg' },
  { id: '4', title: 'Sistema Solar', author: 'NASA Hubble', category: 'Planetas', url: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg' }
];

export default function SearchView({ onNavigate, activeView }) {
  const { isAuthenticated, userData, favorites, addFavorite, removeFavorite, isFavorite } = useAuth();
  const [activeTab, setActiveTab] = useState(activeView === 'favorites' ? 'favoritos' : 'busqueda');
  // Mantener por defecto la categoría 'Todo' — no mostrar botones de categoría
  const [selectedCategory] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageDetail, setSelectedImageDetail] = useState(null);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // categories UI removed — default 'Todo'

  async function openImageDetail(img) {
    setSelectedImageDetail(img); // mostrar de inmediato con lo que ya tenemos (sin esperar red)
    if (!img.id) return;
    try {
      // El backend traduce título y descripción a español solo para esta imagen
      const detallado = await imagenService.getById(img.id);
      if (detallado) setSelectedImageDetail((prev) => (prev && prev.id === img.id ? { ...img, ...detallado } : prev));
    } catch (e) {
      // Si falla la traducción/consulta, nos quedamos con los datos originales del grid
      console.error('No fue posible obtener el detalle traducido', e);
    }
  }

  async function toggleFavorite(id, image) {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    try {
      if (isFavorite(id)) {
        await favoritoService.eliminar(id);
        removeFavorite(id);
      } else {
        // construir payload compatible con backend
        const imagenPayload = {
          nasaId: image.id,
          title: image.title,
          description: image.description,
          url: image.url,
          dateCreated: image.dateCreated || null,
          center: image.center || null,
          mediaType: image.mediaType || 'image',
          keywords: image.keywords || []
        };
        await favoritoService.agregar(imagenPayload);
        addFavorite({
          id: image.id,
          title: image.title,
          url: image.url,
          author: image.center,
          center: image.center,
          description: image.description,
          dateCreated: image.dateCreated,
          keywords: image.keywords || []
        });
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  }
  async function handleFavoritesTabClick() {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }
    setActiveTab('favoritos');
    try {
      const favs = await favoritoService.listar();
      // sincronizar favoritos locales: limpiar y añadir
      // eliminar actuales
      favorites.forEach(f => removeFavorite(f.id));
      favs.forEach(im => addFavorite({
        id: im.nasaId || im.nasa_id,
        title: im.title,
        url: im.url,
        author: im.center,
        center: im.center,
        description: im.description,
        dateCreated: im.dateCreated,
        keywords: im.keywords || []
      }));
    } catch (e) {
      console.error('No fue posible obtener favoritos', e);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function doSearch() {
      // Usar término por defecto en inglés para evitar depender de la traducción
      const term = (searchQuery && searchQuery.trim() !== '') ? searchQuery.trim() : 'galaxy';
      // Si hay query vacío, mostramos por defecto imágenes de 'galaxia'
      setSearching(true);
      try {
        // No pasamos categoría: backend usará la cadena tal cual
        const res = await imagenService.search(term);
        if (!cancelled) setResults(res);
      } catch (e) {
        console.error('Error buscando imágenes', e);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }
    doSearch();
    return () => { cancelled = true };
  }, [searchQuery]);

  const filtered = useMemo(() => {
    return activeTab === 'favoritos' ? favorites : results;
  }, [activeTab, results, favorites]);

  return (
    <div className="search-view" style={{ backgroundImage: selectedImageDetail ? `url(${fondo4})` : `url(${fondo1})` }}>
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">BÚSQUEDA Y EXPLORACIÓN</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
          </button>
        </div>
      </nav>

      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      <div className="search-content-wrapper">
        {selectedImageDetail ? (
          <div className="detail-view">
            <button className="close-detail-btn" onClick={() => setSelectedImageDetail(null)}>Cerrar</button>
            <div className="detail-media">
              <img src={selectedImageDetail.url} alt={selectedImageDetail.title} />
            </div>
            <h2>{selectedImageDetail.title}</h2>
            <p>{selectedImageDetail.description && selectedImageDetail.description.trim() !== '' ? selectedImageDetail.description : 'Sin descripción disponible para esta imagen.'}</p>
            <div className="detail-meta">
              {selectedImageDetail.center && (
                <div className="detail-meta-item">
                  <span>Centro / Autor</span>
                  <strong>{selectedImageDetail.center}</strong>
                </div>
              )}
              {selectedImageDetail.dateCreated && (
                <div className="detail-meta-item">
                  <span>Fecha</span>
                  <strong>{String(selectedImageDetail.dateCreated).slice(0, 10)}</strong>
                </div>
              )}
              {Array.isArray(selectedImageDetail.keywords) && selectedImageDetail.keywords.length > 0 && (
                <div className="detail-meta-item">
                  <span>Palabras clave</span>
                  <strong>{selectedImageDetail.keywords.join(', ')}</strong>
                </div>
              )}
            </div>
            <button className={`favorite-action-btn ${!isAuthenticated ? 'locked' : ''}`} onClick={() => toggleFavorite(selectedImageDetail.id, selectedImageDetail)}>
              {!isAuthenticated ? 'Inicia sesión para agregar a favoritos' : isFavorite(selectedImageDetail.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
            </button>
          </div>
        ) : (
          <div className="gallery-view">
            <div className="tabs">
              <button
                className={`tab-btn-text ${activeTab === 'busqueda' ? 'active' : ''}`}
                onClick={() => setActiveTab('busqueda')}
              >
                BÚSQUEDA
              </button>
              <button
                className={`tab-btn-text ${activeTab === 'favoritos' ? 'active' : ''} ${!isAuthenticated ? 'locked' : ''}`}
                onClick={handleFavoritesTabClick}
              >
                {isAuthenticated ? `FAVORITOS (${favorites.length})` : 'FAVORITOS 🔒'}
              </button>
            </div>

            {activeTab === 'busqueda' && (
              <div className="search-bar-frame">
                <input
                  className="nasa-text-input"
                  placeholder="Buscar imágenes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* category buttons removed — default 'Todo' */}

            <div className="gallery-results-container">
              {filtered.length > 0 ? (
                <div className="astro-images-grid">
                  {filtered.map(img => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      isFavorite={isFavorite(img.id)}
                      isAuthenticated={isAuthenticated}
                      onToggleFavorite={() => toggleFavorite(img.id, img)}
                      onSelectImage={openImageDetail}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-results-fallback">No se encontraron resultados.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}