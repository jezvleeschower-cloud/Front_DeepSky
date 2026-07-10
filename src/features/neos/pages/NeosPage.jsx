import React, { useState } from 'react';
import './NeosPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';
import menuLupa from '../../../assets/menu-lupa.png';
import { useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import fondoDeepSky from '../../../assets/fondo-5-DeepSks.png';


const MOCK_NEOS = [
  {
    id: '1', 
    name: '2024 YR4', 
    magnitude: 21.7, 
    speed: '12.4 km/s', 
    distance: '0.034 AU',
    approachDate: '14 ago 2026', 
    description: 'Este objeto ha captado la atención por su trayectoria cercana y su posible riesgo orbital en un futuro próximo.', 
    anomalyLevel: 75, 
    chartX: 30, 
    chartY: 70
  },
  { 
    id: '2', 
    name: 'Apophis 99942', 
    magnitude: 19.2, 
    speed: '30.7 km/s', 
    distance: '0.022 AU', 
    approachDate: '13 abr 2029', 
    description: 'Uno de los asteroides con mayor seguimiento debido a sus aproximaciones históricas recurrentes a la Tierra.',
    anomalyLevel: 90, 
    chartX: 75, 
    chartY: 85
  },
  { 
    id: '3', 
    name: '2026 AS1', 
    magnitude: 24.1, 
    speed: '9.1 km/s', 
    distance: '0.085 AU', 
    approachDate: '22 sep 2026', 
    description: 'Cuerpo menor de reciente detección orbitando el cinturón interior con baja probabilidad de impacto.', 
    anomalyLevel: 35, 
    chartX: 60, 
    chartY: 25 
  }
];

export default function NeosPage({ onNavigate, activeView }) { 
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [selectedNeo, setSelectedNeo] = useState(MOCK_NEOS[0]); 

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    // 2. Aplicamos el fondo dinámicamente usando estilos en línea
    <div 
      className="neos-page"
      style={{ backgroundImage: `url(${fondoDeepSky})` }}
    >
      {/* Cabecera oficial compartida de DeepSky */}
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <img src={menuLupa} alt="Menú Principal" className="menu-icon-shared" />
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">OBJETOS CERCANOS A LA TIERRA</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate('account')}>
            MI CUENTA
          </button>
        </div>
      </nav>

      {/* Menú de navegación lateral */}
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen);
          setIsMenuOpen(false);
        }}
      />

      {/* Contenido principal del módulo NEOs */}
      <main className="neos-content-wrapper">
        <header className="neos-hero-section">
          <h2>Objetos Cercanos a la Tierra</h2>
          <p>Consulta los cuerpos más cercanos al planeta, su velocidad, distancia y nivel de seguimiento orbital en tiempo real.</p>
        </header>

        <div className="neos-dashboard-grid">
          {/* Columna Izquierda: Radar e Interfaz de la Gráfica de Puntos */}
          <section className="neos-visual-panel">
            <div className="radar-card">
              <h3>Radar de Seguimiento Activo</h3>
              <p className="radar-instruction">Haz clic sobre un punto del radar para ver la información del NEO</p>
              
              <div className="radar-screen">
                <div className="radar-sweep"></div>
                <div className="radar-circle circle-1"></div>
                <div className="radar-circle circle-2"></div>
                <div className="radar-circle circle-3"></div>
                <div className="radar-cross-x"></div>
                <div className="radar-cross-y"></div>

                {/* Indicador del planeta Tierra en el centro geométrico */}
                <div className="radar-earth-center" title="Planeta Tierra">
                  <div className="earth-core"></div>
                </div>

                {/* Puntos del radar sincronizados */}
                {MOCK_NEOS.map(neo => (
                  <button
                    key={`radar-${neo.id}`}
                    className={`radar-dot ${selectedNeo.id === neo.id ? 'active' : ''}`}
                    style={{ left: `${neo.chartX}%`, top: `${neo.chartY}%` }}
                    onClick={() => setSelectedNeo(neo)}
                    title={neo.name}
                  />
                ))}
              </div>
            </div>

            {/* Nueva Gráfica Analítica de Dispersión de Asteroides */}
            <div className="anomaly-chart-card">
              <h3>Gráfica Orbital Analítica</h3>
              <p className="radar-instruction">Presiona un punto para cargar sus métricas en el panel derecho</p>
              
              <div className="neo-scatter-plot">
                {/* Líneas de cuadrícula de fondo */}
                <div className="plot-grid-line grid-v-25"></div>
                <div className="plot-grid-line grid-v-50"></div>
                <div className="plot-grid-line grid-v-75"></div>
                <div className="plot-grid-line grid-h-25"></div>
                <div className="plot-grid-line grid-h-50"></div>
                <div className="plot-grid-line grid-h-75"></div>

                {/* Etiquetas de los ejes */}
                <span className="axis-label axis-y-label">Anomalía (%)</span>
                <span className="axis-label axis-x-label">Distancia Relativa</span>

                {/* Renderizado de los asteroides como puntos en la gráfica */}
                {MOCK_NEOS.map(neo => (
                  <div
                    key={`plot-${neo.id}`}
                    className={`plot-point-wrapper ${selectedNeo.id === neo.id ? 'selected-point' : ''}`}
                    style={{ left: `${neo.chartX}%`, bottom: `${neo.chartY}%` }}
                  >
                    <button
                      className="plot-point"
                      onClick={() => setSelectedNeo(neo)}
                      aria-label={`Ver métricas de ${neo.name}`}
                    />
                    <span className="plot-point-name">{neo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Columna Derecha: Tarjeta de Detalles y Métricas en Tiempo Real */}
          <section className="neos-details-panel">
            <div className="neo-data-card">
              <span className="tracking-badge">MÉTRICAS DEL ASTEROIDE</span>
              <h2 className="neo-name-heading">{selectedNeo.name}</h2>
              
              <div className="neo-stats-grid">
                <div className="stat-box">
                  <span className="stat-title">Magnitud Absoluta</span>
                  <strong className="stat-number">{selectedNeo.magnitude} M</strong>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Velocidad Relativa</span>
                  <strong className="stat-number">{selectedNeo.speed}</strong>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Distancia Mínima</span>
                  <strong className="stat-number">{selectedNeo.distance}</strong>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Nivel de Anomalía</span>
                  <strong className="stat-number anomaly-text">{selectedNeo.anomalyLevel}%</strong>
                </div>
              </div>

              <div className="stat-box full-width-stat">
                <span className="stat-title">Fecha Próxima de Acercamiento</span>
                <strong className="stat-number">{selectedNeo.approachDate}</strong>
              </div>

              <div className="neo-extended-description">
                <h3>Análisis de Trayectoria</h3>
                <p className="neos-description">{selectedNeo.description}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}