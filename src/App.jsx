import { useState } from 'react'
import AstronomyDashboard from './features/foto-del-dia/pages/AstronomyDashboard'
import LoginView from './features/auth/LoginView'
import SearchView from './features/imagenes/pages/SearchView'
import ForoPage from './features/foro/pages/ForoPage'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard') // 'dashboard' | 'login' | 'search' | 'favorites'

  return (
    <>
      {currentScreen === 'dashboard' && (
        <AstronomyDashboard onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'login' && (
        <LoginView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'search' && (
        <SearchView />
      )}

      {currentScreen === 'favorites' && (
        <SearchView />
      )}

      {currentScreen === 'forum' && (
        <ForoPage />
      )}
    </>
  )
}

export default App