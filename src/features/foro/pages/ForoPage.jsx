import React, { useState } from 'react'
import './ForoPage.css'
import fondo5 from '../../../assets/fondo-5-DeepSks.png'
import fondo8 from '../../../assets/fondo-8-DeepSks.png'
import menuForo from '../../../assets/menu-foro.png'
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu'

const MOCK_TOPICS = [
  { id: 't1', title: 'Descubrimientos recientes', posts: 12, lastActivity: 'Hace 2 horas' },
  { id: 't2', title: 'Cómo procesar imágenes astronómicas', posts: 8, lastActivity: 'Ayer' },
  { id: 't3', title: 'Telescopios recomendados para principiantes', posts: 23, lastActivity: 'Hace 30 min' }
]

export default function ForoPage({ onNavigate }) {
  const [topics] = useState(MOCK_TOPICS)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <main className="foro-page" style={{ backgroundImage: `url(${selectedTopic ? fondo8 : fondo5})` }}>
      <button className="forum-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
        <img src={menuForo} alt="Menú" />
      </button>
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          if (onNavigate) onNavigate(screen)
          setIsMenuOpen(false)
        }}
      />
      <div className="foro-page-inner">
        <section className="foro-hero">
          <div className="foro-menu-location">
            <img src={menuForo} alt="Foro" />
            <span>{selectedTopic ? 'Foro / Tema' : 'Foro / Inicio'}</span>
          </div>
          <h1>Foro Comunitario</h1>
          <p>Comparte dudas, ideas y hallazgos sobre astronomía con otros apasionados.</p>
        </section>

      {selectedTopic ? (
        <section className="topic-detail">
          <button className="back-btn" onClick={() => setSelectedTopic(null)}>Volver al índice</button>
          <h2>{selectedTopic.title}</h2>
          <p className="topic-meta">{selectedTopic.posts} publicaciones · {selectedTopic.lastActivity}</p>
          <div className="topic-messages">
            <article className="message-card">
              <p>Este espacio está listo para recibir tus preguntas y respuestas.</p>
              <span className="message-author">Usuario Anónimo</span>
            </article>
          </div>
          <div className="new-message-box">
            <textarea placeholder="Escribe tu comentario aquí..."></textarea>
            <button>Enviar</button>
          </div>
        </section>
      ) : (
        <section className="topic-list">
          <div className="list-header">
            <h2>Temas recientes</h2>
            <button className="new-topic-btn">Crear nuevo tema</button>
          </div>
          <div className="topics-grid">
            {topics.map(topic => (
              <article key={topic.id} className="topic-card" onClick={() => setSelectedTopic(topic)}>
                <h3>{topic.title}</h3>
                <div className="topic-info">
                  <span>{topic.posts} publicaciones</span>
                  <span>{topic.lastActivity}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      </div>
    </main>
  )
}
