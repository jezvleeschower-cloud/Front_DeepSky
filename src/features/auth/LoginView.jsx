import logoTelescopio from '../../assets/logo-deepSky.png';
import logoNombre from '../../assets/logo-DeepSky-nombre.png';
import './Auth.css'

export default function LoginView({ onNavigate }) {
  return (
    <div className="auth-page-container">
      <header className="auth-header">
        <div className="auth-logo-wrapper" onClick={() => onNavigate('dashboard')} style={{cursor: 'pointer'}}>
          <img src={logoTelescopio} alt="Telescopio" className="auth-logo-ico" />
          <img src={logoNombre} alt="DeepSky" className="auth-logo-text" />
        </div>
      </header>

      <main className="auth-form-card">
        <div className="auth-tabs">
          <button className="tab-btn active">INICIO DE SESIÓN</button>
          <button className="tab-btn">REGISTRO</button>
        </div>

        <form className="real-auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field-group">
            <label>NOMBRE DE USUARIO</label>
            <input type="text" placeholder="usuario" className="auth-text-input" />
          </div>

          <div className="input-field-group">
            <label>CONTRASEÑA</label>
            <div className="password-input-container">
              <input type="password" placeholder="••••••••" className="auth-text-input" />
              <span className="password-visibility-eye">👁️</span>
            </div>
          </div>

          <a href="#recover" className="forgot-password-link">¿Olvidaste tu contraseña?</a>

          <button type="submit" className="action-auth-submit">INICIAR SESIÓN</button>
        </form>

        <p className="auth-footer-redirect">
          ¿No tienes cuenta? <span className="redirect-action-span">Regístrate</span>
        </p>
      </main>
    </div>
  )
}