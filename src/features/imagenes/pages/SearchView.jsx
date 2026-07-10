import React, { useMemo, useState } from 'react';
import './SearchView.css';
import ImageCard from '../../../components/common/ImageCard';
import { favoritesService } from '../../../services/favoritesService';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import fondo1 from '../../../assets/fondo-1-DeepSks.png';
import fondo4 from '../../../assets/fondo-4-DeepSks.png';
import menuLupa from '../../../assets/menu-lupa.png';

// Datos estáticos de prueba preparados para el renderizado
const MOCK_IMAGES = [
  { id: '1', title: 'Galaxia Espiral', author: 'Cerqueira', category: 'Galaxias', url: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg' },
  { id: '2', title: 'Estrella Gigante', author: 'Arnaud Girault', category: 'Estrellas', url: 'https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg' },
  { id: '3', title: 'Nebulosa Verde-Azul', author: 'Steve Gribble', category: 'Nebulosas', url: 'https://images-assets.nasa.gov/image/PIA14293/PIA14293~medium.jpg' },
  { id: '4', title: 'Sistema Solar', author: 'NASA Hubble', category: 'Planetas', url: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg' }
];

export default function SearchView({ onNavigate, activeView }) {
  const [activeTab, setActiveTab] = useState('busqueda');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesList, setFavoritesList] = useState(() => favoritesService.getAll().map(i => i.id));
  const [selectedImageDetail, setSelectedImageDetail] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ['Todos', 'Galaxias', 'Nebulosas', 'Planetas', 'Estrellas'];

  // Maneja la adición y eliminación de elementos en favoritos
  function toggleFavorite(id) {
    const exists = favoritesList.includes(id);
    if (exists) {
      favoritesService.remove(id);
    } else {
      const item = MOCK_IMAGES.find(m => m.id === id);
      if (item) favoritesService.add(item);
    }
    setFavoritesList(favoritesService.getAll().map(i => i.id));
  }

  // Filtrado lógico de elementos mediante queries y categorías
  const filtered = useMemo(() => {
    let arr = MOCK_IMAGES.slice();
    if (activeTab === 'favoritos') arr = arr.filter(i => favoritesList.includes(i.id));
    if (selectedCategory !== 'Todos') arr = arr.filter(i => i.category === selectedCategory);
    if (searchQuery.trim()) arr = arr.filter(i => i.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    return arr;
  }, [activeTab, selectedCategory, searchQuery, favoritesList]);

  return (
    <div className="search-view" style={{ backgroundImage: selectedImageDetail ? `url(${fondo4})` : `url(${fondo1})` }}>
      
      {/* Cabecera compartida oficial */}
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <img src={menuLupa} alt="Menú Principal" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">BÚSQUEDA Y EXPLORACIÓN</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate('login')}>
            MI CUENTA
          </button>
        </div>
      </nav>

      {/* Menú lateral interactivo de navegación */}
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
            <p>Descripción técnica simulada de la imagen por la NASA para pruebas.</p>
            <button className="favorite-action-btn" onClick={() => toggleFavorite(selectedImageDetail.id)}>
              {favoritesList.includes(selectedImageDetail.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
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
                className={`tab-btn-text ${activeTab === 'favoritos' ? 'active' : ''}`}
                onClick={() => setActiveTab('favoritos')}
              >
                FAVORITOS ({favoritesList.length})
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

            {/* Fila de categorías con botones CSS puros */}
            <div className="category-filters">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`cat-btn-pure ${selectedCategory === cat ? 'active' : ''}`} 
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Grid de resultados controlado para evitar desbordes */}
            <div className="gallery-results-container">
              {filtered.length > 0 ? (
                <div className="astro-images-grid">
                  {filtered.map(img => (
                    <ImageCard 
                      key={img.id} 
                      image={img}
                      isFavorite={favoritesList.includes(img.id)} 
                      onToggleFavorite={toggleFavorite}
                      onSelectImage={setSelectedImageDetail} 
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