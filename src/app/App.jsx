import { useState } from 'react'
import AuthProvider from './providers/AuthProvider'
import AstronomyDashboard from '../features/foto-del-dia/pages/AstronomyDashboard'
import LoginView from '../features/auth/LoginView'
import AccountPage from '../features/auth/pages/AccountPage'
import SearchView from '../features/imagenes/pages/SearchView'
import ForoPage from '../features/foro/pages/ForoPage'
import CalendarioPage from '../features/calendario/pages/CalendarioPage'
import RetosPage from '../features/retos/pages/RetosPage'
import NeosPage from '../features/neos/pages/NeosPage'
import Modelo3DPage from '../features/modelo3d/pages/Modelo3DPage'
import DevRoleSwitcher from '../components/common/DevRoleSwitcher'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard')

  return (
    <AuthProvider>
      {currentScreen === 'dashboard' && (
        <AstronomyDashboard onNavigate={setCurrentScreen} activeView="dashboard" />
      )}
      {currentScreen === 'login' && (
        <LoginView onNavigate={setCurrentScreen} />
      )}
      {currentScreen === 'account' && (
        <AccountPage onNavigate={setCurrentScreen} />
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
      {currentScreen === '3d' && (
        <Modelo3DPage onNavigate={setCurrentScreen} activeView="3d" />
      )}
      <DevRoleSwitcher />
    </AuthProvider>
  )
}

export default App