import React, { useState, useEffect, useRef } from 'react';
import './Modelo3DPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import useAuth from '../../../hooks/useAuth';
import { sistemaSolarService } from '../../sistema-solar/services/sistemaSolarService';

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
const { isAuthenticated, role } = useAuth();
const [isMenuOpen, setIsMenuOpen] = useState(false); 

// Formatea los valores numéricos que vienen de la tabla PLANETA para que sean legibles
const formatDato = (valor, sufijo = '') => {
  if (valor === null || valor === undefined || valor === '') return '—';
  const num = Number(valor);
  if (Number.isNaN(num)) return '—';
  const formatted = num >= 1e6 || (num !== 0 && Math.abs(num) < 0.001)
    ? num.toExponential(2)
    : num.toLocaleString('es-MX', { maximumFractionDigits: 4 });
  return `${formatted}${sufijo}`;
};

useEffect(() => {
  if (!isAuthenticated) {
    onNavigate && onNavigate('login');
  }
}, [isAuthenticated]);

if (!isAuthenticated) {
  return null;}
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS_DATA[2]); // Tierra por defecto
  const [planets, setPlanets] = useState([]); // planets from backend
  const [displayPlanets, setDisplayPlanets] = useState(PLANETS_DATA);
  const [curiosities, setCuriosities] = useState(PLANETS_DATA.reduce((acc, p) => ({ ...acc, [p.id]: p.curiosities.map((c) => ({ id: null, texto: c })) }), {}));
  const [newCuriosity, setNewCuriosity] = useState('');

  // Ancho/alto "de diseño" que necesita el sistema solar completo para verse sin recortes
  // (2 * rx y 2 * ry de la órbita de Neptuno, más un margen de seguridad)
  const DESIGN_WIDTH = 660;
  const DESIGN_HEIGHT = 300;

  // Ajuste automático de escala: el sistema solar se reduce para caber entero
  // dentro del visor, sin importar el tamaño de pantalla (nunca se agranda más allá de 1).
  const viewportRef = useRef(null);
  const [orbitScale, setOrbitScale] = useState(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = el;
      if (!clientWidth || !clientHeight) return;
      const nextScale = Math.min(1, clientWidth / DESIGN_WIDTH, clientHeight / DESIGN_HEIGHT);
      setOrbitScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Load planets from backend and merge with local layout template
  useEffect(() => {
    let mounted = true;
    sistemaSolarService.listarPlanetas()
      .then((res) => {
        if (!mounted || !Array.isArray(res)) return;
        setPlanets(res);

        // Merge backend data with layout template (keep visual params from PLANETS_DATA)
        const merged = res.map((p) => {
          const id = p.idPlaneta || p.id || p.id_planeta || null;
          const template = PLANETS_DATA.find((t) => t.id === id) || {};
          return {
            id: id || template.id,
            name: p.nombre || template.name,
            color: template.color,
            size: template.size,
            rx: template.rx,
            ry: template.ry,
            duration: template.duration,
            description: p.descripcion || template.description,
            texturaUrl: p.texturaUrl,
            modelo3dUrl: p.modelo3dUrl,
            masaKg: p.masaKg,
            radioKm: p.radioKm,
            periodoOrbitalDias: p.periodoOrbitalDias,
            distanciaSolUa: p.distanciaSolUa,
            inclinacionAxial: p.inclinacionAxial,
            datosCuriosos: p.datosCuriosos || [],
          };
        });

        setDisplayPlanets(merged.length ? merged : PLANETS_DATA);

        // Select Earth (id 3) if present, otherwise first
        const defaultSel = merged.find((m) => m.id === 3) || merged[0] || PLANETS_DATA[2];
        setSelectedPlanet(defaultSel);

        // Initialize curiosities map from merged data
        const curMap = {};
        (merged.length ? merged : PLANETS_DATA).forEach((pl) => {
          curMap[pl.id] = (pl.datosCuriosos || pl.curiosities || []).map((c) => (
            typeof c === 'string' ? { id: null, texto: c } : { id: c.idDato ?? null, texto: c.dato || '' }
          ));
        });
        setCuriosities(curMap);
      })
      .catch(() => {
        // ignore and keep defaults
      });
    return () => { mounted = false; };
  }, []);

  const handleAddCuriosity = async (e) => {
    e.preventDefault();
    if (!newCuriosity.trim()) return;

    try {
      const res = await sistemaSolarService.agregarCuriosidad(selectedPlanet.id, newCuriosity.trim());
      // backend returns { message, curiosidad }
      const nuevo = res && (res.curiosidad || res);
      setCuriosities((prev) => ({
        ...prev,
        [selectedPlanet.id]: [...(prev[selectedPlanet.id] || []), { id: nuevo.idDato ?? null, texto: nuevo.dato || nuevo }]
      }));
      setNewCuriosity('');
    } catch (err) {
      console.error('Error añadiendo curiosidad', err);
    }
  };

  const handleDeleteCuriosity = async (idDato, planetaId) => {
    if (!idDato) return;
    if (!window.confirm('¿Eliminar esta curiosidad?')) return;
    try {
      await sistemaSolarService.eliminarCuriosidad(idDato);
      setCuriosities((prev) => ({
        ...prev,
        [planetaId]: (prev[planetaId] || []).filter((c) => c.id !== idDato)
      }));
    } catch (err) {
      console.error('Error eliminando curiosidad', err);
      alert('No se pudo eliminar la curiosidad: ' + (err.message || String(err)));
    }
  };

  return (
    <div className="modelo3d-page">
      
      {/* Cabecera compartida oficial de DeepSky */}
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">MODELO 3D / SISTEMA SOLAR</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate('account')}>
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
              {displayPlanets.map((planet) => (
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

            <div className="space-viewport" ref={viewportRef}>
              <div className="stars-background-layer"></div>
              
              <div
                className="solar-system-3d-container"
                style={{ transform: `rotateX(68deg) scale(${orbitScale})` }}
              >
                {/* Sol central */}
                <div className="sun-body">
                  <div className="sun-glow"></div>
                </div>

                {/* Renderizado de órbitas y planetas */}
                {displayPlanets.map((planet) => {
                  const pathString = `M ${-planet.rx},0 a ${planet.rx},${planet.ry} 0 1,0 ${planet.rx * 2},0 a ${planet.rx},${planet.ry} 0 1,0 ${-planet.rx * 2},0`;
                  // Solo se considera "con textura" si es una URL http(s) válida
                  const hasTexture = typeof planet.texturaUrl === 'string' && /^https?:\/\//i.test(planet.texturaUrl.trim());
                  const gradient = `radial-gradient(circle at 35% 35%, ${planet.color || '#8888aa'} 0%, #161233 75%, #000000 100%)`;

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
  ref={(el) => {
    if (el) el.style.setProperty('offset-path', `path('${pathString}')`);
  }}
  className={`moving-planet-sphere ${selectedPlanet.id === planet.id ? 'active' : ''} ${hasTexture ? 'has-texture' : ''}`}
  style={{
    width: `${planet.size}px`,
    height: `${planet.size}px`,
    backgroundImage: hasTexture ? `url(${planet.texturaUrl}), ${gradient}` : gradient,
    backgroundColor: planet.color || '#8888aa',
    boxShadow: selectedPlanet.id === planet.id 
      ? `0 0 16px ${planet.color}, inset -2px -2px 6px rgba(0,0,0,0.8)` 
      : `0 0 4px rgba(255,255,255,0.15), inset -2px -2px 5px rgba(0,0,0,0.8)`,
    animationDuration: `${planet.duration}s, ${planet.duration}s, 6s`,
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
                className={`planet-preview ${selectedPlanet.texturaUrl ? 'has-texture' : ''}`}
                style={{
                  backgroundImage: (typeof selectedPlanet.texturaUrl === 'string' && /^https?:\/\//i.test(selectedPlanet.texturaUrl.trim()))
                    ? `url(${selectedPlanet.texturaUrl}), radial-gradient(circle at 35% 35%, ${selectedPlanet.color || '#8888aa'} 0%, #161233 75%, #000000 100%)`
                    : `radial-gradient(circle at 35% 35%, ${selectedPlanet.color || '#8888aa'} 0%, #161233 75%, #000000 100%)`,
                  backgroundColor: selectedPlanet.color || '#8888aa',
                  boxShadow: `0 0 20px ${selectedPlanet.color || '#8888aa'}`
                }} 
              />
            </div>

            <p className="planet-description">{selectedPlanet.description}</p>

            <div className="curiosities-card">
              <h3>Datos del planeta</h3>
              <ul>
                <li><strong>Masa:</strong> {formatDato(selectedPlanet.masaKg, ' kg')}</li>
                <li><strong>Radio:</strong> {formatDato(selectedPlanet.radioKm, ' km')}</li>
                <li><strong>Período orbital:</strong> {formatDato(selectedPlanet.periodoOrbitalDias, ' días')}</li>
                <li><strong>Distancia al Sol:</strong> {formatDato(selectedPlanet.distanciaSolUa, ' UA')}</li>
                <li><strong>Inclinación axial:</strong> {formatDato(selectedPlanet.inclinacionAxial, '°')}</li>
              </ul>
            </div>

            <div className="curiosities-card">
              <h3>Curiosidades</h3>
              <ul className="curiosities-list">
                {curiosities[selectedPlanet.id]?.map((curiosity, idx) => (
                  <li key={curiosity.id ?? idx} className="curiosity-item">
                    <span>{curiosity.texto}</span>
                    {role === 'divulgador' && curiosity.id != null && (
                      <button
                        type="button"
                        className="delete-curiosity-btn"
                        title="Eliminar curiosidad"
                        onClick={() => handleDeleteCuriosity(curiosity.id, selectedPlanet.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </li>
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