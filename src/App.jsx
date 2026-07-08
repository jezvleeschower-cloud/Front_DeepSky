import { useState } from 'react'
import AstronomyDashboard from './features/foto-del-dia/pages/AstronomyDashboard'
import LoginView from './features/auth/LoginView'
import SearchView from './features/imagenes/pages/SearchView'
import ForoPage from './features/foro/pages/ForoPage'
import CalendarioPage from './features/calendario/pages/CalendarioPage'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard') // 'dashboard' | 'login' | 'search' | 'favorites' | 'forum' | 'events'

  return (
    <>
      {currentScreen === 'dashboard' && (
        <AstronomyDashboard onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'login' && (
        <LoginView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'search' && (
        <SearchView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'favorites' && (
        <SearchView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'forum' && (
        <ForoPage onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'events' && (
        <CalendarioPage onNavigate={setCurrentScreen} />
      )}
    </>
  )
}

export default App