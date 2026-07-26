import React, { useState, useEffect } from 'react';
import './NeosPage.css';
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu';

import useAuth from '../../../hooks/useAuth';
import fondoDeepSky from '../../../assets/fondo-5-DeepSks.png';
import { asteroideService } from '../../../services/asteroideService';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// NEOs en "seguimiento activo" (esto luego se reemplaza con la respuesta real
// de la API NeoWs de la NASA; mientras tanto se muestran datos estáticos).
const MOCK_NEOS = [];

// Formatea números grandes con separador de miles y decimales fijos, en español
function formatNumero(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—';
  return Number(valor).toLocaleString('es-MX', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

const COLOR_PELIGROSO = '#ef4444';
const COLOR_NORMAL    = '#8b5cf6';

// Tooltip del bubble chart
function BubbleTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="neo-chart-tooltip">
      <strong>{d.name}</strong>
      <span>Distancia: {Number(d.x).toLocaleString('es-MX', { maximumFractionDigits: 0 })} km</span>
      <span>Velocidad: {Number(d.y).toLocaleString('es-MX', { maximumFractionDigits: 0 })} km/h</span>
      <span>Diámetro: {d.z != null ? `${Number(d.z).toLocaleString('es-MX', { maximumFractionDigits: 0 })} m` : '—'}</span>
      {d.peligroso && <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠ Potencialmente peligroso</span>}
    </div>
  );
}

export default function NeosPage({ onNavigate, activeView }) {
  const { isAuthenticated, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [neos, setNeos] = useState(MOCK_NEOS);
  const [selectedNeo, setSelectedNeo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  // Load NEOs from backend on mount
  useEffect(() => {
    let mounted = true;
    asteroideService.obtenerAsteroides()
      .then((list) => {
        if (!mounted || !Array.isArray(list)) return;
        // Map backend model to frontend shape used in UI
        const mapped = list.map((a, idx) => {
          // compute numeric distance in km if available
          const rawDist = a.distanciaTierraKm || a.distancia || null;
          let numericDist = null;
          if (rawDist != null) {
            const cleaned = String(rawDist).replace(/,/g, '').match(/[-0-9.]+/);
            numericDist = cleaned ? parseFloat(cleaned[0]) : null;
          }

          // RADIO = distancia real en escala logarítmica (cerca → centro, lejos → borde)
          const MIN_DIST_KM = 50000;
          const MAX_DIST_KM = 75000000;
          const logMin = Math.log10(MIN_DIST_KM);
          const logMax = Math.log10(MAX_DIST_KM);
          const logDist = numericDist
            ? Math.log10(Math.max(MIN_DIST_KM, Math.min(MAX_DIST_KM, numericDist)))
            : (logMin + logMax) / 2;
          const radiusPercent = 10 + ((logDist - logMin) / (logMax - logMin)) * 34;

          // ÁNGULO = derivado del ID numérico del asteroide (dato real único)
          // Esto distribuye los puntos de forma irregular y natural en el radar
          const idNum = parseInt(String(a.id || idx).replace(/\D/g, '').slice(-6) || idx, 10);
          const angle = ((idNum % 1000) / 1000) * 2 * Math.PI;

          const chartX = 50 + Math.cos(angle) * radiusPercent;
          const chartY = 50 + Math.sin(angle) * radiusPercent;

          return {
            id: a.id || String(idx),
            name: a.nombre || a.name || `NEO-${idx}`,
            magnitude: a.magnitudAbsoluta != null ? Number(a.magnitudAbsoluta) : null,
            speedKmh: a.velocidadKmh != null ? parseFloat(String(a.velocidadKmh).replace(/,/g, '')) : null,
            distanceKm: a.distanciaTierraKm != null ? parseFloat(String(a.distanciaTierraKm).replace(/,/g, '')) : null,
            distanceLunar: a.distanciaLunar != null ? parseFloat(String(a.distanciaLunar).replace(/,/g, '')) : null,
            diameterMinM: a.diametroMinimoKm != null ? Math.round(Number(a.diametroMinimoKm) * 1000) : null,
            diameterMaxM: a.diametroMaximoKm != null ? Math.round(Number(a.diametroMaximoKm) * 1000) : null,
            diameterMeters: a.diametroMaximoKm ? Math.round(Number(a.diametroMaximoKm) * 1000) : (a.diameterMeters || null),
            approachDate: a.fechaAproximacion || a.approachDate || null,
            esPeligroso: Boolean(a.esPeligroso),
            rarityLabel: a.rarityLabel || '',
            description: a.descripcion || '',
            chartX,
            chartY
          };
        });

        setNeos(mapped);
        if (mapped.length) setSelectedNeo(mapped[0]);
      })
      .catch((err) => {
        console.warn('No se pudo cargar NEOs desde backend, usando valores por defecto.', err);
        setNeos(MOCK_NEOS);
        if (MOCK_NEOS.length) setSelectedNeo(MOCK_NEOS[0]);
      });

    return () => { mounted = false; };
  }, []);

  if (!selectedNeo) {
    return (
      <div className="neos-page" style={{ backgroundImage: `url(${fondoDeepSky})` }}>
        <nav className="navbar-shared">
          <div className="nav-left-shared">
            <div className="brand-location-shared">
              <span className="brand-text-shared">DeepSky</span>
              <span className="separator-shared">|</span>
              <span className="location-text-shared">OBJETOS CERCANOS A LA TIERRA</span>
            </div>
          </div>
        </nav>
        <main className="neos-content-wrapper">
          <header className="neos-hero-section">
            <h2>Cargando objetos cercanos a la Tierra...</h2>
          </header>
        </main>
      </div>
    );
  }

  return (
    <div
      className="neos-page"
      style={{ backgroundImage: `url(${fondoDeepSky})` }}
    >
      {/* Cabecera oficial compartida de DeepSky */}
      <nav className="navbar-shared">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared">
            <span className="brand-text-shared">DeepSky</span>
            <span className="separator-shared">|</span>
            <span className="location-text-shared">OBJETOS CERCANOS A LA TIERRA</span>
          </div>
        </div>
        <div className="nav-right-shared">
          <button className="account-access" onClick={() => onNavigate && onNavigate(isAuthenticated ? 'account' : 'register')}>
            <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            {isAuthenticated && userData ? userData.username.toUpperCase() : 'REGISTRARSE'}
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
          {/* Columna Izquierda: Radar y Gráfica Comparativa */}
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
                {neos.map(neo => (
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

            {/* Bubble chart: Distancia vs. Velocidad, tamaño = diámetro */}
            <div className="anomaly-chart-card">
              <h3>Distancia vs. Velocidad de Aproximación</h3>
              <p className="radar-instruction">
                Cada burbuja es un NEO: cuanto más a la <strong>izquierda</strong> y más <strong>arriba</strong>,
                más cerca y más rápido — los que más hay que vigilar.
                El <strong>tamaño</strong> de la burbuja refleja el diámetro estimado del objeto.
              </p>

              <div className="chart-legend">
                <span><i style={{ background: COLOR_PELIGROSO }} /> Potencialmente peligroso</span>
                <span><i style={{ background: COLOR_NORMAL }} /> Sin riesgo significativo</span>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 16, right: 24, bottom: 40, left: 16 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.10)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Distancia"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    tickFormatter={v => `${(v/1000000).toFixed(1)}M`}
                    label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Velocidad"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`}
                    label={{ value: 'Velocidad (km/h)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 800]} name="Diámetro" />
                  <Tooltip content={<BubbleTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    data={neos
                      .filter(n => n.distanceKm != null && n.speedKmh != null)
                      .map(n => ({
                        x: n.distanceKm,
                        y: n.speedKmh,
                        z: n.diameterMaxM ?? n.diameterMeters ?? 50,
                        name: n.name,
                        peligroso: n.esPeligroso,
                      }))}
                    onClick={(d) => {
                      const neo = neos.find(n => n.name === d.name);
                      if (neo) setSelectedNeo(neo);
                    }}
                  >
                    {neos
                      .filter(n => n.distanceKm != null && n.speedKmh != null)
                      .map((n) => (
                        <Cell
                          key={n.id}
                          fill={n.esPeligroso ? COLOR_PELIGROSO : COLOR_NORMAL}
                          fillOpacity={selectedNeo?.id === n.id ? 1 : 0.72}
                          stroke={selectedNeo?.id === n.id ? '#fff' : 'none'}
                          strokeWidth={2}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="radar-instruction" style={{ marginTop: 6, fontSize: '0.75rem' }}>
                Haz clic en una burbuja para ver sus detalles en el panel lateral.
              </p>
            </div>
          </section>

          {/* Columna Derecha: Tarjeta de Detalles y Métricas en Tiempo Real */}
          <section className="neos-details-panel">
            <div className="neo-data-card">
              <div className="neo-nav-controls">
                <button
                  type="button"
                  className="neo-nav-btn"
                  onClick={() => {
                    const idx = neos.findIndex(n => n.id === selectedNeo.id);
                    const prevIdx = (idx - 1 + neos.length) % neos.length;
                    setSelectedNeo(neos[prevIdx]);
                  }}
                  disabled={neos.length < 2}
                  aria-label="Objeto anterior"
                >
                  ‹ Anterior
                </button>
                <span className="neo-nav-counter">
                  {neos.findIndex(n => n.id === selectedNeo.id) + 1} / {neos.length}
                </span>
                <button
                  type="button"
                  className="neo-nav-btn"
                  onClick={() => {
                    const idx = neos.findIndex(n => n.id === selectedNeo.id);
                    const nextIdx = (idx + 1) % neos.length;
                    setSelectedNeo(neos[nextIdx]);
                  }}
                  disabled={neos.length < 2}
                  aria-label="Siguiente objeto"
                >
                  Siguiente ›
                </button>
              </div>

              <span className="tracking-badge">MÉTRICAS DEL ASTEROIDE</span>
              <h2 className="neo-name-heading">{selectedNeo.name}</h2>

              <div className="neo-stats-grid">
                <div className="stat-box">
                  <span className="stat-title">Magnitud Absoluta</span>
                  <strong className="stat-number">{formatNumero(selectedNeo.magnitude, 2)} H</strong>
                  <span className="stat-subtitle neo-explain">
                    Brillo intrínseco del asteroide: cuanto menor el número, más grande y brillante es el objeto.
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Velocidad Relativa</span>
                  <strong className="stat-number">{formatNumero(selectedNeo.speedKmh, 2)} km/h</strong>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Distancia de Aproximación</span>
                  <strong className="stat-number">{formatNumero(selectedNeo.distanceKm, 0)} km</strong>
                  {selectedNeo.distanceLunar != null && (
                    <span className="stat-subtitle neo-lunar-distance">
                      ≈ {formatNumero(selectedNeo.distanceLunar, 1)} veces la distancia a la Luna
                    </span>
                  )}
                </div>
                <div className="stat-box">
                  <span className="stat-title">Diámetro Estimado</span>
                  <strong className="stat-number">
                    {formatNumero(selectedNeo.diameterMinM ?? selectedNeo.diameterMeters, 0)} – {formatNumero(selectedNeo.diameterMaxM ?? selectedNeo.diameterMeters, 0)} m
                  </strong>
                  <span className="stat-subtitle neo-explain">mínimo – máximo estimado</span>
                </div>
              </div>

              <div className="stat-box full-width-stat">
                <span className="stat-title">Fecha Próxima de Acercamiento</span>
                <span className="stat-subtitle">Cuándo pasará este objeto más cerca de la Tierra en su órbita</span>
                <strong className="stat-number">{selectedNeo.approachDate || '—'}</strong>
              </div>

              <div className="stat-box full-width-stat">
                <span className="stat-title">Clasificación NASA</span>
                <span className="stat-subtitle">
                  {selectedNeo.esPeligroso
                    ? 'La NASA lo marca como "potencialmente peligroso" por su tamaño y cercanía orbital — no significa que vaya a impactar la Tierra.'
                    : 'No cumple los criterios de tamaño/cercanía que usa la NASA para marcar un objeto como potencialmente peligroso.'}
                </span>
                <strong className={`stat-number ${selectedNeo.esPeligroso ? 'anomaly-text' : 'safe-text'}`}>
                  {selectedNeo.esPeligroso ? 'Potencialmente peligroso' : 'Sin riesgo significativo'}
                </strong>
              </div>


            </div>
          </section>
        </div>
      </main>
    </div>
  );
}