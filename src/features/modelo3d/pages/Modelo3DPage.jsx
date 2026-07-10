import React, { useState } from 'react';
import './Modelo3DPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import menuLupa from '../../../assets/menu-lupa.png';

// Constantes estáticas con datos de los planetas y propiedades de simulación orbital
const PLANETS_DATA = [
  { id: 1, name: 'Mercurio', color: '#a1a1a1', size: 10, orbitX: 90, orbitY: 35, duration: 8, description: 'El planeta más cercano al Sol, con temperaturas extremas y una superficie llena de cráteres.', curiosities: ['No tiene atmósfera.', 'Un año dura solo 88 días terrestres.'] },
  { id: 2, name: 'Venus', color: '#e3bb76', size: 14, orbitX: 130, orbitY: 50, duration: 12, description: 'Envuelto en densas nubes de ácido sulfúrico que provocan un efecto invernadero desbocado.', curiosities: ['Gira en dirección contraria a la mayoría de los planetas.', 'Es el planeta más caliente del sistema solar.'] },
  { id: 3, name: 'Tierra', color: '#4d94ff', size: 16, orbitX: 180, orbitY: 70, duration: 16, description: 'Nuestro hogar, con agua líquida y una atmósfera única que permite el desarrollo de la vida.', curiosities: ['Tiene una gran luna ideal para la observación.', 'La vida existe en casi todos sus ecosistemas conocidos.'] },
  { id: 4, name: 'Marte', color: '#cf533c', size: 13, orbitX: 230, orbitY: 90, duration: 20, description: 'El planeta rojo, caracterizado por su óxido de hierro superficial y sus gigantescos volcanes extintos.', curiosities: ['Alberga el Monte Olimpo, el volcán más alto del sistema solar.', 'Tiene dos lunas pequeñas llamadas Fobos y Deimos.'] },
  { id: 5, name: 'Júpiter', color: '#d4a373', size: 26, orbitX: 290, orbitY: 115, duration: 26, description: 'El gigante gaseoso domina el sistema solar con su gran tamaño y su tormenta atmosférica persistente.', curiosities: ['Tiene una gran mancha roja.', 'Cuenta con más de 90 lunas conocidas mapeadas de forma activa.'] },
  { id: 6, name: 'Saturno', color: '#e3c16f', size: 22, orbitX: 350, orbitY: 140, duration: 32, description: 'Con sus impresionantes anillos formados por hielo y roca, Saturno es un espectáculo astronómico.', curiosities: ['Sus anillos están compuestos por miles de fragmentos.', 'Podría flotar en el agua debido a su baja densidad global.'] }
];

export default function Modelo3DPage({ onNavigate, activeView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS_DATA[2]); // Tierra por defecto
  const [curiosities, setCuriosities] = useState(PLANETS_DATA.reduce((acc, p) => ({ ...acc, [p.id]: p.curiosities }), {}));
  const [newCuriosity, setNewCuriosity] = useState('');

  // Control funcional para añadir comentarios de curiosidad
  const handleAddCuriosity = (e) => {
    e.preventDefault();
    if (!newCuriosity.trim()) return;

    setCuriosities(prev => ({
      ...prev,
      [selectedPlanet.id]: [...prev[selectedPlanet.id], newCuriosity.trim()]
    }));
    setNewCuriosity('');
  };

  return (
    <div className="modelo3d-page">
      
      {/* Cabecera compartida oficial de DeepSky - Sin doble logo */}
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <img src={menuLupa} alt="Menú Principal" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">MODELO 3D / SISTEMA SOLAR</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate('login')}>
            MI CUENTA
          </button>
        </div>
      </nav>

      {/* Menú de navegación lateral oficial */}
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      {/* Contenedor del panel principal */}
      <main className="modelo3d-page-inner">
        <header className="modelo3d-hero">
          <h2>Explora el sistema solar</h2>
          <p>Simula un recorrido por los planetas con órbitas animadas inclinadas en perspectiva y descubre curiosidades compartidas por la comunidad.</p>
        </header>

        <div className="modelo3d-layout">
          
          {/* Panel Izquierdo: Simulación del Sistema Solar en Pseudo-3D */}
          <section className="solar-system-card">
            <div className="space-viewport">
              <div className="stars-background-layer"></div>
              
              {/* Estructura del Universo con Inclinación de Perspectiva */}
              <div className="solar-system-3d-container">
                
                {/* Estrella Central: El Sol */}
                <div className="sun-body">
                  <div className="sun-glow"></div>
                </div>

                {/* Renderizado Dinámico de Órbitas Elípticas y Planetas */}
                {PLANETS_DATA.map((planet) => (
                  <div
                    key={`orbit-${planet.id}`}
                    className="orbit-ellipse"
                    style={{
                      width: `${planet.orbitX * 2}px`,
                      height: `${planet.orbitY * 2}px`,
                      animationDuration: `${planet.duration}s`
                    }}
                  >
                    {/* Cuerpo celeste acoplado a la línea orbital */}
                    <button
                      type="button"
                      className={`planet-marker ${selectedPlanet.id === planet.id ? 'active' : ''}`}
                      style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        backgroundColor: planet.color,
                        boxShadow: `0 0 12px ${planet.color}`
                      }}
                      onClick={() => setSelectedPlanet(planet)}
                      title={planet.name}
                    />
                  </div>
                ))}

              </div>
            </div>
          </section>

          {/* Panel Derecho: Tarjeta Dinámica de Detalles e Interacción Comunitaria */}
          <section className="planet-detail-card">
            <div className="planet-detail-header">
              <div>
                <p className="retos-eyebrow">PLANETA SELECCIONADO</p>
                <h2>{selectedPlanet.name}</h2>
              </div>
              <div 
                className="planet-preview" 
                style={{ 
                  backgroundColor: selectedPlanet.color,
                  boxShadow: `0 0 20px ${selectedPlanet.color}` 
                }} 
              />
            </div>

            <p className="planet-description">{selectedPlanet.description}</p>

            {/* Listado de Curiosidades */}
            <div className="curiosities-card">
              <h3>Curiosidades</h3>
              <ul>
                {curiosities[selectedPlanet.id]?.map((curiosity, idx) => (
                  <li key={idx}>{curiosity}</li>
                ))}
              </ul>
            </div>

            {/* Formulario para añadir aportaciones */}
            <form className="curiosity-form" onSubmit={handleAddCuriosity}>
              <textarea
                placeholder="Añade una curiosidad para este planeta..."
                value={newCuriosity}
                onChange={(e) => setNewCuriosity(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="add-curiosity-btn">
                Agregar curiosidad
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
}