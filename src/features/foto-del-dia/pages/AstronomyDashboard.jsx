import { useState } from 'react'
import Navbar from '../components/Navbar'
import SidebarMenu from '../components/SidebarMenu'
import MainContent from '../components/MainContent'
import CommentsPanel from '../components/CommentsPanel'
import '../Astronomy.css'

const MOCK_DATA = {
  title: "Los Anillos de Saturno — Sonda Cassini",
  imageUrl: "https://images-assets.nasa.gov/image/PIA11667/PIA11667~medium.jpg",
  description: "Mientras orbitaba Saturno, la sonda Cassini registró con asombroso detalle la disposición de anillos, mapas y sombras del gigante gaseoso. Esta imagen fue capturada en 2005 y revelada por la misión Cassini de la NASA. En la imagen destacada se pueden apreciar lunas como Mimas y Tetis, visibles a ambos lados de los anillos de Saturno, ofreciendo una perspectiva única de este sistema planetario.",
  date: "2005 · 14 de junio",
  location: "Sistema de Saturno",
  credits: "NASA / JPL / Space Science Institute",
  tags: ["Astronomía", "Saturno", "Cassini"],
  stats: ["4.9/5", "120K visualizaciones"]
}

export default function AstronomyDashboard({ onNavigate, activeView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <Navbar 
        onToggleMenu={() => setIsMenuOpen(v => !v)} 
        currentViewName="Foto del Día" 
        onNavigate={onNavigate}
      />
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} activeView={activeView} />
      <MainContent data={MOCK_DATA} />
      <CommentsPanel />
    </div>
  )
}
