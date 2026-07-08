import { useMemo, useState } from 'react';
import fondo7 from '../../../assets/fondo-7-DeepSks.png';
import menu3D from '../../../assets/menu-3D.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import '../../foto-del-dia/Astronomy.css';
import './Modelo3DPage.css';

const PLANETS = [
  {
    id: 1,
    name: 'Mercurio',
    color: '#b8b4ae',
    size: 14,
    orbit: 70,
    duration: 8,
    description: 'El planeta más cercano al Sol, con temperaturas extremas y una órbita muy rápida.',
    curiosities: ['Tiene una órbita muy corta.', 'No tiene lunas.']
  },
  {
    id: 2,
    name: 'Venus',
    color: '#f2c57c',
    size: 20,
    orbit: 110,
    duration: 12,
    description: 'Con una atmósfera densa y tóxica, Venus es uno de los mundos más hostiles del sistema solar.',
    curiosities: ['Gira muy lentamente.', 'Su rotación es retrógrada.']
  },
  {
    id: 3,
    name: 'Tierra',
    color: '#4f8cff',
    size: 22,
    orbit: 150,
    duration: 16,
    description: 'Nuestro hogar, con agua líquida y una atmósfera única que permite la vida.',
    curiosities: ['Tiene una luna grande.', 'La vida existe en casi todos sus ecosistemas.']
  },
  {
    id: 4,
    name: 'Marte',
    color: '#c96b3d',
    size: 16,
    orbit: 190,
    duration: 20,
    description: 'El planeta rojo fascina por sus montañas, valles y la posibilidad de haber tenido agua.',
    curiosities: ['Tiene el volcán más grande del sistema solar.', 'Posee estaciones muy marcadas.']
  },
  {
    id: 5,
    name: 'Júpiter',
    color: '#d3a35a',
    size: 34,
    orbit: 240,
    duration: 28,
    description: 'El gigante gaseoso domina el sistema solar con su gran tamaño y su tormenta persistente.',
    curiosities: ['Tiene una gran mancha roja.', 'Cuenta con más de 90 lunas conocidas.']
  },
  {
    id: 6,
    name: 'Saturno',
    color: '#e3c16f',
    size: 30,
    orbit: 290,
    duration: 34,
    description: 'Con sus impresionantes anillos, Saturno es uno de los planetas más reconocibles del cielo.',
    curiosities: ['Sus anillos están formados por miles de fragmentos.', 'Tiene lunas con características muy diversas.']
  },
  {
    id: 7,
    name: 'Urano',
    color: '#8fd3ff',
    size: 24,
    orbit: 340,
    duration: 40,
    description: 'Urano gira de lado y es un gigante helado con un color azul verdoso muy característico.',
    curiosities: ['Gira casi de lado.', 'Su atmósfera contiene metano.']
  },
  {
    id: 8,
    name: 'Neptuno',
    color: '#4d6cff',
    size: 24,
    orbit: 390,
    duration: 46,
    description: 'El más alejado del Sol, Neptuno es un gigante helado con vientos extremadamente rápidos.',
    curiosities: ['Tiene vientos muy veloces.', 'Su órbita es muy larga.']
  }
];

export default function Modelo3DPage({ onNavigate, activeView = '3d' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[2]);
  const [curiosities, setCuriosities] = useState(() => {
    const initial = {};
    PLANETS.forEach((planet) => {
      initial[planet.id] = planet.curiosities.slice();
    });
    return initial;
  });
  const [newCuriosity, setNewCuriosity] = useState('');

  const addCuriosity = (e) => {
    e.preventDefault();
    if (!newCuriosity.trim()) return;
    setCuriosities((prev) => ({
      ...prev,
      [selectedPlanet.id]: [...(prev[selectedPlanet.id] || []), newCuriosity.trim()]
    }));
    setNewCuriosity('');
  };

  const planetList = useMemo(() => PLANETS, []);

  return (
    <main className="modelo3d-page" style={{ backgroundImage: `url(${fondo7})` }}>
      <button className="forum-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menu3D} alt="Menú" />
      </button>
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      <div className="foro-page-inner modelo3d-page-inner">
        <section className="foro-hero modelo3d-hero">
          <div className="foro-menu-location">
            <img src={menu3D} alt="Modelo 3D" />
            <span>Modelo 3D / Sistema solar</span>
          </div>
          <h1>Explora el sistema solar</h1>
          <p>Simula un recorrido por los planetas con orbitas animadas y descubre curiosidades compartidas por la comunidad.</p>
        </section>

        <section className="modelo3d-layout">
          <div className="solar-system-card">
            <div className="sun-core" />
            {planetList.map((planet) => (
              <div
                key={planet.id}
                className={`planet-orbit ${selectedPlanet.id === planet.id ? 'active' : ''}`}
                style={{
                  '--orbit': `${planet.orbit}px`,
                  '--duration': `${planet.duration}s`
                }}
              >
                <button
                  type="button"
                  className={`planet-marker ${selectedPlanet.id === planet.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlanet(planet)}
                  aria-label={`Seleccionar ${planet.name}`}
                  style={{
                    '--planet-size': `${planet.size}px`,
                    '--planet-color': planet.color
                  }}
                />
              </div>
            ))}
          </div>

          <aside className="planet-detail-card">
            <div className="planet-detail-header">
              <div>
                <p className="retos-eyebrow">Planeta seleccionado</p>
                <h2>{selectedPlanet.name}</h2>
              </div>
              <div className="planet-preview" style={{ background: selectedPlanet.color }} />
            </div>

            <p className="planet-description">{selectedPlanet.description}</p>

            <div className="curiosities-card">
              <h3>Curiosidades</h3>
              <ul>
                {(curiosities[selectedPlanet.id] || []).map((item, index) => (
                  <li key={`${selectedPlanet.id}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <form className="curiosity-form" onSubmit={addCuriosity}>
              <textarea
                placeholder="Añade una curiosidad para este planeta"
                value={newCuriosity}
                onChange={(e) => setNewCuriosity(e.target.value)}
              />
              <button type="submit">Agregar curiosidad</button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
