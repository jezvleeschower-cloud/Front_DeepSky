import React, { useMemo, useState } from 'react'
import './CalendarioPage.css'
import fondo5 from '../../../assets/fondo-5-DeepSks.png'
import fondo6 from '../../../assets/fondo-6-DeepSks.png'
import menuForo from '../../../assets/menu-foro.png'
import SidebarMenu from '../../foto-del-dia/components/SidebarMenu'

const INITIAL_EVENTS = [
  { id: 1, title: 'Lluvia de meteoros', date: '2026-07-12', time: '22:00', type: 'Observación' },
  { id: 2, title: 'Webinar de astrofotografía', date: '2026-07-18', time: '19:30', type: 'Online' },
  { id: 3, title: 'Noche de telescopios', date: '2026-07-25', time: '21:00', type: 'Presencial' }
]

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatLabel(date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CalendarioPage({ onNavigate }) {
  const [monthDate, setMonthDate] = useState(new Date(2026, 6, 1))
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 12))
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftTime, setDraftTime] = useState('20:00')
  const [draftType, setDraftType] = useState('Observación')

  const selectedDateKey = toKey(selectedDate)
  const selectedEvents = useMemo(() => events.filter(event => event.date === selectedDateKey), [events, selectedDateKey])

  const calendarDays = useMemo(() => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startOffset = firstDay.getDay()
    const prevMonthDays = new Date(year, month, 0).getDate()

    const days = []
    for (let i = startOffset - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i
      const date = new Date(year, month - 1, day)
      days.push({ key: toKey(date), date, isCurrentMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      days.push({ key: toKey(date), date, isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let day = 1; day <= remaining; day += 1) {
      const date = new Date(year, month + 1, day)
      days.push({ key: toKey(date), date, isCurrentMonth: false })
    }

    return days
  }, [monthDate])

  function changeMonth(delta) {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1))
  }

  function addEvent(event) {
    event.preventDefault()
    if (!draftTitle.trim()) return

    const newEvent = {
      id: Date.now(),
      title: draftTitle.trim(),
      date: selectedDateKey,
      time: draftTime,
      type: draftType
    }

    setEvents([newEvent, ...events])
    setDraftTitle('')
    setDraftTime('20:00')
    setDraftType('Observación')
  }

  return (
    <main className="calendario-page" style={{ backgroundImage: `url(${fondo5})` }}>
      <button className="calendar-menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
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

      <div className="calendario-page-inner">
        <section className="calendario-hero">
          <div className="calendario-menu-location">
            <img src={menuForo} alt="Calendario" />
            <span>Calendario / Eventos</span>
          </div>
          <h1>Calendario astronómico</h1>
          <p>Consulta los próximos eventos y actividades comunitarias.</p>
        </section>

        <section className="calendario-content">
          <div className="calendario-panel">
            <div className="month-nav">
              <button className="month-nav-btn" onClick={() => changeMonth(-1)} aria-label="Mes anterior">←</button>
              <h2>{MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}</h2>
              <button className="month-nav-btn" onClick={() => changeMonth(1)} aria-label="Mes siguiente">→</button>
            </div>

            <div className="calendar-weekdays">
              {WEEK_DAYS.map(day => <span key={day}>{day}</span>)}
            </div>

            <div className="calendar-grid">
              {calendarDays.map(day => {
                const hasEvent = events.some(event => event.date === day.key)
                const isSelected = day.key === selectedDateKey
                return (
                  <button
                    key={day.key}
                    className={`calendar-day ${day.isCurrentMonth ? '' : 'muted'} ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setMonthDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1))
                    }}
                  >
                    <span>{day.date.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="calendario-detail" style={{ backgroundImage: `url(${fondo6})` }}>
            <div className="detail-overlay">
              <h3>{formatLabel(selectedDate)}</h3>
              <div className="selected-events">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map(event => (
                    <div key={event.id} className="event-pill">
                      <strong>{event.title}</strong>
                      <span>{event.time} · {event.type}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No hay eventos para esta fecha.</p>
                )}
              </div>

              <form className="add-event-form" onSubmit={addEvent}>
                <h4>Añadir fecha</h4>
                <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Título del evento" />
                <div className="input-row">
                  <input type="time" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} />
                  <input value={draftType} onChange={(e) => setDraftType(e.target.value)} placeholder="Tipo" />
                </div>
                <button type="submit">Agregar fecha</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
