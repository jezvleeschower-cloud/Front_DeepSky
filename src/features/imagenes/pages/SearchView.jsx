import React, { useMemo, useState } from 'react'
import './SearchView.css'
import ImageCard from '../../../components/common/ImageCard'
import { favoritesService } from '../../../services/favoritesService'
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu'
import fondo1 from '../../../assets/fondo-1-DeepSks.png'
import fondo4 from '../../../assets/fondo-4-DeepSks.png'
import menuLupa from '../../../assets/menu-lupa.png'
import botonBusqueda from '../../../assets/boton-busqueda.png'
import botonFavoritos from '../../../assets/boton-favoritos.png'
import selecCategoria from '../../../assets/selec-categoria.png'
import categoriaNoSelec from '../../../assets/categoria-no-selec.png'

const MOCK_IMAGES = [
  { id: '1', title: 'Galaxia Espiral', author: 'Cerqueira', category: 'Galaxias', url: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg' },
  { id: '2', title: 'Estrella Gigante', author: 'Arnaud Girault', category: 'Estrellas', url: 'https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg' },
  { id: '3', title: 'Nebulosa Verde-Azul', author: 'Steve Gribble', category: 'Nebulosas', url: 'https://images-assets.nasa.gov/image/PIA14293/PIA14293~medium.jpg' },
  { id: '4', title: 'Sistema Solar', author: 'NASA Hubble', category: 'Planetas', url: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg' }
]

export default function SearchView({ onNavigate }){
  const [activeTab, setActiveTab] = useState('busqueda')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [favoritesList, setFavoritesList] = useState(() => favoritesService.getAll().map(i=>i.id))
  const [selectedImageDetail, setSelectedImageDetail] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const categories = ['Todos','Galaxias','Nebulosas','Planetas','Estrellas']

  function toggleFavorite(id){
    const exists = favoritesList.includes(id)
    if (exists){ favoritesService.remove(id) }
    else { const item = MOCK_IMAGES.find(m=>m.id===id); if(item) favoritesService.add(item) }
    setFavoritesList(favoritesService.getAll().map(i=>i.id))
  }

  const filtered = useMemo(()=>{
    let arr = MOCK_IMAGES.slice()
    if (activeTab === 'favoritos') arr = arr.filter(i=>favoritesList.includes(i.id))
    if (selectedCategory !== 'Todos') arr = arr.filter(i=>i.category===selectedCategory)
    if (searchQuery.trim()) arr = arr.filter(i=>i.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    return arr
  },[activeTab, selectedCategory, searchQuery, favoritesList])

  return (
    <div className="search-view" style={{backgroundImage: selectedImageDetail ? `url(${fondo4})` : `url(${fondo1})`, backgroundSize: 'cover'}}>
      <button className="search-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menuLupa} alt="Menú" />
      </button>
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen)
          setIsMenuOpen(false)
        }}
      />
      {selectedImageDetail ? (
        <div className="detail-view">
          <button onClick={()=>setSelectedImageDetail(null)}>Cerrar</button>
          <div className="detail-media">
            <img src={selectedImageDetail.url} alt={selectedImageDetail.title} style={{maxWidth:'100%',height:'auto'}} />
          </div>
          <h2>{selectedImageDetail.title}</h2>
          <p>Descripción técnica simulada de la imagen por la NASA para pruebas.</p>
          <button onClick={() => toggleFavorite(selectedImageDetail.id)}>
            {favoritesList.includes(selectedImageDetail.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
          </button>
        </div>
      ) : (
        <div className="gallery-view">
          <header className="search-module-header">
            <div className="left-controls">
              <img src={menuLupa} alt="menu" style={{height:32}} />
            </div>
            <div className="right-controls">
              <button onClick={()=>{}} className="account-access">Mi cuenta</button>
            </div>
          </header>

          <div className="tabs">
            <button className={`tab-btn ${activeTab==='busqueda' ? 'active' : ''}`} onClick={() => setActiveTab('busqueda') }>
              <img src={botonBusqueda} alt="buscar" />
            </button>
            <button className={`tab-btn ${activeTab==='favoritos' ? 'active' : ''}`} onClick={() => setActiveTab('favoritos') }>
              <img src={botonFavoritos} alt="favoritos" /> {` ${favoritesList.length}`}
            </button>
          </div>

          {activeTab === 'busqueda' && (
            <div className="search-bar-frame">
              <input className="nasa-text-input" placeholder="Buscar..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
            </div>
          )}

          <div className="category-filters">
            {categories.map(cat => (
              <button key={cat} className={`cat-btn ${selectedCategory===cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)} style={{backgroundImage: `url(${selectedCategory===cat ? selecCategoria : categoriaNoSelec})`}}>{cat}</button>
            ))}
          </div>

          <div className="gallery-results-container">
            {filtered.length>0 ? (
              <div className="astro-images-grid">
                {filtered.map(img => (
                  <ImageCard key={img.id} image={img} isFavorite={favoritesList.includes(img.id)} onToggleFavorite={toggleFavorite} onSelectImage={setSelectedImageDetail} />
                ))}
              </div>
            ) : (
              <div className="empty-results-fallback">No se encontraron resultados.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
