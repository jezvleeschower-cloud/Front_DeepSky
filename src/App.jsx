import { useState } from 'react'
import AstronomyDashboard from './features/foto-del-dia/pages/AstronomyDashboard'
import LoginView from './features/auth/LoginView'
import SearchView from './features/imagenes/pages/SearchView'
import ForoPage from './features/foro/pages/ForoPage'
import CalendarioPage from './features/calendario/pages/CalendarioPage'
import RetosPage from './features/retos/pages/RetosPage'
import NeosPage from './features/neos/pages/NeosPage'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard') // 'dashboard' | 'login' | 'search' | 'favorites' | 'forum' | 'events' | 'challenge' | 'neos'

  return (
    <>
      {currentScreen === 'dashboard' && (
        <AstronomyDashboard onNavigate={setCurrentScreen} activeView="dashboard" />
      )}

      {currentScreen === 'login' && (
        <LoginView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'search' && (
        <SearchView onNavigate={setCurrentScreen} activeView="search" />
      )}

      {currentScreen === 'favorites' && (
        <SearchView onNavigate={setCurrentScreen} activeView="favorites" />
      )}

      {currentScreen === 'forum' && (
        <ForoPage onNavigate={setCurrentScreen} activeView="forum" />
      )}

      {currentScreen === 'events' && (
        <CalendarioPage onNavigate={setCurrentScreen} activeView="events" />
      )}

      {currentScreen === 'challenge' && (
        <RetosPage onNavigate={setCurrentScreen} activeView="challenge" />
      )}

      {currentScreen === 'neos' && (
        <NeosPage onNavigate={setCurrentScreen} activeView="neos" />
      )}
    </>
  )
}

export default App