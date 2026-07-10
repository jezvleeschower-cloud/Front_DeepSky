import React, { useState } from 'react';
import './Modelo3DPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import menuLupa from '../../../assets/menu-lupa.png';

const PLANETS_DATA = [
  { id: 1, name: 'Mercurio', color: '#a1a1a1', size: 10, rx: 50, ry: 20, duration: 4, description: 'El planeta más cercano al Sol, con temperaturas extremas y una superficie llena de cráteres.', curiosities: ['No tiene atmósfera.', 'Un año dura solo 88 días terrestres.'] },
  { id: 2, name: 'Venus', color: '#e3bb76', size: 14, rx: 75, ry: 30, duration: 7, description: 'Envuelto en densas nubes de ácido sulfúrico que provocan un efecto invernadero desbocado.', curiosities: ['Gira en dirección contraria a la mayoría de los planetas.', 'Es el planeta más caliente del sistema solar.'] },
  { id: 3, name: 'Tierra', color: '#4d94ff', size: 15, rx: 105, ry: 42, duration: 10, description: 'Nuestro hogar, con agua líquida y una atmósfera única que permite el desarrollo de la vida.', curiosities: ['Tiene una gran luna ideal para la observación.', 'La vida existe en casi todos sus ecosistemas conocidos.'] },
  { id: 4, name: 'Marte', color: '#cf533c', size: 12, rx: 135, ry: 54, duration: 14, description: 'El planeta rojo, caracterizado por su óxido de hierro superficial y sus gigantescos volcanes extintos.', curiosities: ['Alberga el Monte Olimpo, el volcán más alto del sistema solar.', 'Tiene dos lunas pequeñas llamadas Fobos y Deimos.'] },
  { id: 5, name: 'Júpiter', color: '#d4a373', size: 24, rx: 175, ry: 70, duration: 20, description: 'El gigante gaseoso domina el sistema solar con su gran tamaño y su tormenta atmosférica persistente.', curiosities: ['Tiene una gran mancha roja.', 'Cuenta con más de 90 lunas conocidas mapeadas de forma activa.'] },
  { id: 6, name: 'Saturno', color: '#e3c16f', size: 21, rx: 220, ry: 88, duration: 26, description: 'Con sus impresionantes anillos formados por hielo y roca, Saturno es un espectáculo astronómico.', curiosities: ['Sus anillos están compuestos por miles de fragmentos.', 'Podría flotar en el agua debido a su baja densidad global.'] },
  { id: 7, name: 'Urano', color: '#b3e5fc', size: 17, rx: 265, ry: 106, duration: 32, description: 'Un gigante de hielo que se caracteriza por tener un eje de rotación extremadamente inclinado.', curiosities: ['Gira prácticamente de lado.', 'Tiene anillos tenues pero perfectamente definidos de forma vertical.'] },
  { id: 8, name: 'Neptuno', color: '#3f51b5', size: 16, rx: 305, ry: 122, duration: 38, description: 'El planeta más distante del sistema solar, azotado por los vientos más fuertes y dinámicos del cosmos.', curiosities: ['Su color azul profundo se debe al metano atmosférico.', 'Fue descubierto mediante cálculos matemáticos antes de ser visto por telescopio.'] }
];

export default function Modelo3DPage({ onNavigate, activeView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS_DATA[2]); // Tierra por defecto
  const [curiosities, setCuriosities] = useState(PLANETS_DATA.reduce((acc, p) => ({ ...acc, [p.id]: p.curiosities }), {}));
  const [newCuriosity, setNewCuriosity] = useState('');

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
      
      {/* Cabecera compartida oficial de DeepSky */}
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

      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      <main className="modelo3d-page-inner">
        <header className="modelo3d-hero">
          <h2>Explora el sistema solar</h2>
          <p>Simula un recorrido por los 8 planetas con órbitas elípticas escaladas y esferas alineadas perfectamente al frente.</p>
        </header>

        <div className="modelo3d-layout">
          
          {/* Panel Izquierdo: Selector + Visor Redimensionado */}
          <section className="solar-system-card">
            
            <div className="planets-selector-menu">
              {PLANETS_DATA.map((planet) => (
                <button
                  key={`btn-${planet.id}`}
                  type="button"
                  className={`selector-tab-btn ${selectedPlanet.id === planet.id ? 'active-tab' : ''}`}
                  onClick={() => setSelectedPlanet(planet)}
                >
                  {planet.name}
                </button>
              ))}
            </div>

            <div className="space-viewport">
              <div className="stars-background-layer"></div>
              
              <div className="solar-system-3d-container">
                {/* Sol central */}
                <div className="sun-body">
                  <div className="sun-glow"></div>
                </div>

                {/* Renderizado de órbitas y planetas */}
                {PLANETS_DATA.map((planet) => {
                  const pathString = `M ${-planet.rx},0 a ${planet.rx},${planet.ry} 0 1,0 ${planet.rx * 2},0 a ${planet.rx},${planet.ry} 0 1,0 ${-planet.rx * 2},0`;

                  return (
                    <div
                      key={`orbit-layer-${planet.id}`}
                      className="orbit-ellipse-static"
                      style={{
                        '--rx': `${planet.rx}px`,
                        '--ry': `${planet.ry}px`
                      }}
                    >
                      <button
                        type="button"
                        className={`moving-planet-sphere ${selectedPlanet.id === planet.id ? 'active' : ''}`}
                        style={{
                          width: `${planet.size}px`,
                          height: `${planet.size}px`,
                          /* Gradiente esférico con la iluminación fija viendo siempre al frente */
                          background: `radial-gradient(circle at 35% 35%, ${planet.color} 0%, #161233 75%, #000000 100%)`,
                          boxShadow: selectedPlanet.id === planet.id 
                            ? `0 0 16px ${planet.color}, inset -2px -2px 6px rgba(0,0,0,0.8)` 
                            : `0 0 4px rgba(255,255,255,0.15), inset -2px -2px 5px rgba(0,0,0,0.8)`,
                          animationDuration: `${planet.duration}s`,
                          offsetPath: `path('${pathString}')`
                        }}
                        onClick={() => setSelectedPlanet(planet)}
                        title={planet.name}
                      />
                    </div>
                  );
                })}

              </div>
            </div>
          </section>

          {/* Panel Derecho: Detalles del Planeta */}
          <section className="planet-detail-card">
            <div className="planet-detail-header">
              <div>
                <p className="retos-eyebrow">PLANETA SELECCIONADO</p>
                <h2>{selectedPlanet.name}</h2>
              </div>
              <div 
                className="planet-preview" 
                style={{ 
                  background: `radial-gradient(circle at 35% 35%, ${selectedPlanet.color} 0%, #161233 75%, #000000 100%)`,
                  boxShadow: `0 0 20px ${selectedPlanet.color}` 
                }} 
              />
            </div>

            <p className="planet-description">{selectedPlanet.description}</p>

            <div className="curiosities-card">
              <h3>Curiosidades</h3>
              <ul>
                {curiosities[selectedPlanet.id]?.map((curiosity, idx) => (
                  <li key={idx}>{curiosity}</li>
                ))}
              </ul>
            </div>

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