import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import SidebarMenu from '../components/SidebarMenu'
import MainContent from '../components/MainContent'
import CommentsPanel from '../components/CommentsPanel'
import '../Astronomy.css'
import { fotoDiaService } from '../services/fotoDiaService';

// Suma/resta días a una fecha "yyyy-MM-dd" sin usar hora local (evita desfases de zona horaria)
function addDaysToIsoDate(iso, delta) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + delta);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function AstronomyDashboard({ onNavigate, activeView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fotoDiaService.getLatest();
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  const handlePrevDay = async () => {
    if (!data || !data.date) return;
    const iso = addDaysToIsoDate(data.date, -1);
    try {
      setLoading(true);
      const res = await fotoDiaService.getByDate(iso);
      setData(res);
    } catch (err) {
      setError(err.message || 'No disponible');
    } finally {
      setLoading(false);
    }
  };

  const handleNextDay = async () => {
    if (!data || !data.date) return;
    const iso = addDaysToIsoDate(data.date, 1);
    try {
      setLoading(true);
      const res = await fotoDiaService.getByDate(iso);
      setData(res);
    } catch (err) {
      setError(err.message || 'No disponible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar 
        onToggleMenu={() => setIsMenuOpen(v => !v)} 
        currentViewName="Foto del Día" 
        onNavigate={onNavigate}
      />
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} activeView={activeView} />
      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && <MainContent data={data} onNavigate={onNavigate} onPrevDay={handlePrevDay} onNextDay={handleNextDay} />}
      <CommentsPanel onNavigate={onNavigate} fecha={data?.date} />
    </div>
  )
}