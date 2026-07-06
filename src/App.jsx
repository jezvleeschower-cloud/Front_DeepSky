import { useState } from 'react'
import AstronomyDashboard from './features/foto-del-dia/pages/AstronomyDashboard'
import LoginView from './features/auth/LoginView'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard') // 'dashboard' o 'login'

  return (
    <>
      {currentScreen === 'dashboard' ? (
        <AstronomyDashboard onNavigate={setCurrentScreen} />
      ) : (
        <LoginView onNavigate={setCurrentScreen} />
      )}
    </>
  )
}

export default App