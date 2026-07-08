import { useState } from 'react';
import fondo1 from '../../../assets/fondo-1-DeepSks.png';
import menuAstro from '../../../assets/menu-astroFoto.png';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import '../../foto-del-dia/Astronomy.css';
import './NeosPage.css';

const NEO_ITEMS = [
  {
    id: 1,
    name: '2024 YR4',
    magnitude: '21.7',
    distance: '0.034 AU',
    velocity: '12.4 km/s',
    approach: '14 ago 2026',
    hazard: true,
    description: 'Este objeto ha captado la atención por su trayectoria cercana y su posible riesgo orbital en un futuro próximo.',
    radarX: 64,
    radarY: 42
  },
  {
    id: 2,
    name: '2023 CX1',
    magnitude: '19.8',
    distance: '0.048 AU',
    velocity: '8.9 km/s',
    approach: '22 sep 2026',
    hazard: false,
    description: 'Un asteroide de tamaño moderado que ofrece una excelente oportunidad para seguimiento con telescopios profesionales.',
    radarX: 38,
    radarY: 68
  },
  {
    id: 3,
    name: '2022 AP7',
    magnitude: '22.1',
    distance: '0.061 AU',
    velocity: '15.2 km/s',
    approach: '01 oct 2026',
    hazard: false,
    description: 'Objeto relativamente pequeño, pero muy útil para estudiar trayectorias de paso cercano a la Tierra.',
    radarX: 76,
    radarY: 74
  }
];

export default function NeosPage({ onNavigate, activeView = 'neos' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNeo, setSelectedNeo] = useState(NEO_ITEMS[0]);

  return (
    <main className="neos-page" style={{ backgroundImage: `url(${fondo1})` }}>
      <button className="forum-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menuAstro} alt="Menú" />
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

      <div className="foro-page-inner neos-page-inner">
        <section className="foro-hero neos-hero">
          <div className="foro-menu-location">
            <img src={menuAstro} alt="NEOs" />
            <span>NEOs / Seguimiento</span>
          </div>
          <h1>Objetos Cercanos a la Tierra</h1>
          <p>Consulta los cuerpos más cercanos al planeta, su velocidad, distancia y nivel de seguimiento.</p>
        </section>

        <section className="neos-grid">
          <div className="neos-radar-panel">
            <div className="radar-scope">
              <div className="radar-grid" />
              <div className="radar-line" />
              <div className="radar-center" />
              {NEO_ITEMS.map((neo) => (
                <button
                  key={neo.id}
                  className={`radar-blip ${selectedNeo.id === neo.id ? 'selected' : ''}`}
                  style={{ top: `${neo.radarY}%`, left: `${neo.radarX}%` }}
                  onClick={() => setSelectedNeo(neo)}
                  aria-label={neo.name}
                />
              ))}
            </div>
            <p className="radar-caption">Haz clic sobre un punto del radar para ver la información del NEO.</p>
          </div>

          <aside className="neos-detail-card">
            <div className="neos-detail-header">
              <div>
                <p className="retos-eyebrow">Seguimiento activo</p>
                <h2>{selectedNeo.name}</h2>
              </div>
              <span className={`neos-risk ${selectedNeo.hazard ? 'danger' : 'safe'}`}>
                {selectedNeo.hazard ? 'Potencialmente peligroso' : 'Sin riesgo detectado'}
              </span>
            </div>

            <div className="neos-highlight-grid">
              <div className="neos-metric">
                <span>Magnitud</span>
                <strong>{selectedNeo.magnitude}</strong>
              </div>
              <div className="neos-metric">
                <span>Distancia</span>
                <strong>{selectedNeo.distance}</strong>
              </div>
              <div className="neos-metric">
                <span>Velocidad</span>
                <strong>{selectedNeo.velocity}</strong>
              </div>
              <div className="neos-metric">
                <span>Próximo paso</span>
                <strong>{selectedNeo.approach}</strong>
              </div>
            </div>

            <p className="neos-description">{selectedNeo.description}</p>

            <div className="neos-activity-card">
              <h3>Observación recomendada</h3>
              <p>Se recomienda mantener seguimiento con telescopios de campo amplio durante la semana anterior al acercamiento.</p>
            </div>

            <div className="neos-timeline-card">
              <h3>Timeline de acercamientos</h3>
              <div className="neos-timeline">
                <div className="timeline-step active">
                  <span>01</span>
                  <strong>Detección</strong>
                </div>
                <div className="timeline-step active">
                  <span>02</span>
                  <strong>Seguimiento</strong>
                </div>
                <div className="timeline-step active">
                  <span>03</span>
                  <strong>Acercamiento</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
