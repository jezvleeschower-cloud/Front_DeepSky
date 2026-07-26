import { useState } from 'react'
import logoDeepSky from '../../assets/logo-deepsky-login.png';
import SidebarMenu from '../foto-del-dia/components/SidebarMenu';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import './Auth.css'

// Icono ojo abierto
const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Icono ojo cerrado
const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Campo de contraseña reutilizable con toggle de visibilidad
function PasswordInput({ name, placeholder, value, onChange, minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-input-container">
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        placeholder={placeholder || '••••••••'}
        className="auth-text-input"
        value={value}
        onChange={onChange}
        minLength={minLength}
      />
      <button
        type="button"
        className="password-visibility-eye"
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}
      >
        {visible ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
}

const MIN_PASSWORD = 8;

export default function LoginView({ onNavigate, initialTab = 'login' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const { registerRequestCode, registerVerifyCode, loginWithCredentials } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [registerStep, setRegisterStep] = useState('form');
  const [registerCodigo, setRegisterCodigo] = useState('');

  const [recoverStep, setRecoverStep] = useState('request');
  const [recoverForm, setRecoverForm] = useState({
    email: '',
    codigo: '',
    nuevaPassword: '',
    confirmNuevaPassword: '',
  });
  const [recoverError, setRecoverError] = useState('');
  const [recoverInfo, setRecoverInfo] = useState('');
  const [recoverSubmitting, setRecoverSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecoverChange = (e) => {
    setRecoverForm({ ...recoverForm, [e.target.name]: e.target.value });
  };

  const goToRecover = () => {
    setRecoverStep('request');
    setRecoverForm({ email: form.email || '', codigo: '', nuevaPassword: '', confirmNuevaPassword: '' });
    setRecoverError('');
    setRecoverInfo('');
    setActiveTab('recover');
  };

  const handleRequestCodeSubmit = async (e) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverInfo('');
    if (!recoverForm.email) { setRecoverError('Ingresa tu correo.'); return; }
    setRecoverSubmitting(true);
    try {
      await authService.forgotPassword({ email: recoverForm.email });
      setRecoverInfo('Te enviamos un código de 6 dígitos a tu correo.');
      setRecoverStep('reset');
    } catch (err) {
      setRecoverError(err?.message || 'No fue posible enviar el código.');
    } finally {
      setRecoverSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverInfo('');
    if (!recoverForm.codigo || !recoverForm.nuevaPassword) { setRecoverError('Completa todos los campos.'); return; }
    if (recoverForm.nuevaPassword.length < MIN_PASSWORD) { setRecoverError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`); return; }
    if (recoverForm.nuevaPassword !== recoverForm.confirmNuevaPassword) { setRecoverError('Las contraseñas no coinciden.'); return; }
    setRecoverSubmitting(true);
    try {
      await authService.resetPassword({
        email: recoverForm.email,
        codigo: recoverForm.codigo,
        nuevaPassword: recoverForm.nuevaPassword,
      });
      setRecoverInfo('¡Contraseña actualizada! Ya puedes iniciar sesión.');
      setForm({ ...form, email: recoverForm.email, password: '' });
      setTimeout(() => { setActiveTab('login'); setError(''); }, 1200);
    } catch (err) {
      setRecoverError(err?.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setRecoverSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Completa todos los campos.'); return; }
    setSubmitting(true);
    try {
      const result = await loginWithCredentials(form.email, form.password);
      if (!result || !result.success) { setError('Correo o contraseña incorrectos.'); return; }
      onNavigate('dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) { setError('Completa todos los campos.'); return; }
    if (form.password.length < MIN_PASSWORD) { setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`); return; }
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setSubmitting(true);
    try {
      const result = await registerRequestCode(form);
      if (!result || !result.success) { setError(result?.message || 'No fue posible iniciar el registro.'); return; }
      setRegisterCodigo('');
      setRegisterStep('verify');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!registerCodigo) { setError('Ingresa el código de 6 dígitos que te enviamos.'); return; }
    setSubmitting(true);
    try {
      const result = await registerVerifyCode({ email: form.email, codigo: registerCodigo, username: form.username });
      if (!result || !result.success) { setError(result?.message || 'No fue posible verificar el código.'); return; }
      onNavigate('dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => { if (onNavigate) onNavigate(screen); setIsMenuOpen(false) }}
        activeView="login"
      />
      <nav className="navbar-shared auth-navbar">
        <div className="nav-left-shared">
          <button className="menu-btn-shared" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú">
            <svg className="menu-icon-svg-shared" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="brand-location-shared" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
            <img src={logoDeepSky} alt="DeepSky" className="auth-logo-header" />
            <span className="brand-text-shared">DeepSky</span>
          </div>
        </div>
      </nav>

      <main className="auth-form-card">
        {activeTab !== 'recover' && (
          <div className="auth-tabs">
            <div className={`auth-tabs-indicator ${activeTab === 'register' ? 'is-register' : ''}`} />
            <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError(''); setRegisterStep('form'); }}>
              INICIO DE SESIÓN
            </button>
            <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setError(''); setRegisterStep('form'); }}>
              REGISTRO
            </button>
          </div>
        )}

        {activeTab === 'recover' && (
          <div className="recover-header">
            <h2 className="recover-title">Recuperar contraseña</h2>
            <p className="recover-subtitle">
              {recoverStep === 'request'
                ? 'Ingresa tu correo y te enviaremos un código de verificación.'
                : 'Ingresa el código que recibiste y define tu nueva contraseña.'}
            </p>
          </div>
        )}

        {activeTab === 'recover' && recoverStep === 'request' && (
          <form key="recover-request-form" className="real-auth-form form-fade-in" onSubmit={handleRequestCodeSubmit}>
            <div className="input-field-group">
              <label>CORREO</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" className="auth-text-input" value={recoverForm.email} onChange={handleRecoverChange} />
            </div>
            {recoverError && <p className="auth-error-message">{recoverError}</p>}
            {recoverInfo && <p className="auth-success-message">{recoverInfo}</p>}
            <button type="submit" className="action-auth-submit" disabled={recoverSubmitting}>
              {recoverSubmitting ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
            </button>
            <button type="button" className="forgot-password-link forgot-password-btn recover-back-btn" onClick={() => { setActiveTab('login'); setError(''); }}>
              ← Volver a inicio de sesión
            </button>
          </form>
        )}

        {activeTab === 'recover' && recoverStep === 'reset' && (
          <form key="recover-reset-form" className="real-auth-form form-fade-in" onSubmit={handleResetPasswordSubmit}>
            <div className="input-field-group">
              <label>CÓDIGO DE 6 DÍGITOS</label>
              <input type="text" inputMode="numeric" maxLength={6} name="codigo" placeholder="123456" className="auth-text-input" value={recoverForm.codigo} onChange={handleRecoverChange} />
            </div>
            <div className="input-field-group">
              <label>NUEVA CONTRASEÑA <span style={{fontSize:'0.75rem', opacity:0.6}}>(mín. {MIN_PASSWORD} caracteres)</span></label>
              <PasswordInput name="nuevaPassword" value={recoverForm.nuevaPassword} onChange={handleRecoverChange} />
            </div>
            <div className="input-field-group">
              <label>CONFIRMAR NUEVA CONTRASEÑA</label>
              <PasswordInput name="confirmNuevaPassword" value={recoverForm.confirmNuevaPassword} onChange={handleRecoverChange} />
            </div>
            {recoverError && <p className="auth-error-message">{recoverError}</p>}
            {recoverInfo && <p className="auth-success-message">{recoverInfo}</p>}
            <button type="submit" className="action-auth-submit" disabled={recoverSubmitting}>
              {recoverSubmitting ? 'GUARDANDO...' : 'RESTABLECER CONTRASEÑA'}
            </button>
            <button type="button" className="forgot-password-link forgot-password-btn recover-back-btn" onClick={() => { setRecoverStep('request'); setRecoverError(''); setRecoverInfo(''); }}>
              ← No recibí el código, reenviar
            </button>
          </form>
        )}

        {activeTab === 'login' && (
          <form key="login-form" className="real-auth-form form-fade-in" onSubmit={handleLoginSubmit}>
            <div className="input-field-group">
              <label>CORREO</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" className="auth-text-input" value={form.email} onChange={handleChange} />
            </div>
            <div className="input-field-group">
              <label>CONTRASEÑA</label>
              <PasswordInput name="password" value={form.password} onChange={handleChange} />
            </div>
            <button type="button" className="forgot-password-link forgot-password-btn" onClick={goToRecover}>
              ¿Olvidaste tu contraseña?
            </button>
            {error && <p className="auth-error-message">{error}</p>}
            <button type="submit" className="action-auth-submit" disabled={submitting}>
              {submitting ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        )}

        {activeTab === 'register' && registerStep === 'form' && (
          <form key="register-form" className="real-auth-form form-fade-in" onSubmit={handleRegisterSubmit}>
            <div className="input-field-group">
              <label>NOMBRE DE USUARIO</label>
              <input type="text" name="username" placeholder="usuario" className="auth-text-input" value={form.username} onChange={handleChange} />
            </div>
            <div className="input-field-group">
              <label>CORREO</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" className="auth-text-input" value={form.email} onChange={handleChange} />
            </div>
            <div className="input-field-group">
              <label>CONTRASEÑA <span style={{fontSize:'0.75rem', opacity:0.6}}>(mín. {MIN_PASSWORD} caracteres)</span></label>
              <PasswordInput name="password" value={form.password} onChange={handleChange} minLength={MIN_PASSWORD} />
            </div>
            <div className="input-field-group">
              <label>CONFIRMAR CONTRASEÑA</label>
              <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} minLength={MIN_PASSWORD} />
            </div>
            {error && <p className="auth-error-message">{error}</p>}
            <button type="submit" className="action-auth-submit" disabled={submitting}>
              {submitting ? 'ENVIANDO CÓDIGO...' : 'CONTINUAR'}
            </button>
          </form>
        )}

        {activeTab === 'register' && registerStep === 'verify' && (
          <form key="register-verify-form" className="real-auth-form form-fade-in" onSubmit={handleRegisterVerifySubmit}>
            <p className="recover-subtitle">
              Te enviamos un código de 6 dígitos a <strong>{form.email}</strong> para confirmar que ese correo es tuyo.
            </p>
            <div className="input-field-group">
              <label>CÓDIGO DE 6 DÍGITOS</label>
              <input type="text" inputMode="numeric" maxLength={6} name="registerCodigo" placeholder="123456" className="auth-text-input" value={registerCodigo} onChange={(e) => setRegisterCodigo(e.target.value)} />
            </div>
            {error && <p className="auth-error-message">{error}</p>}
            <button type="submit" className="action-auth-submit" disabled={submitting}>
              {submitting ? 'VERIFICANDO...' : 'CONFIRMAR Y CREAR CUENTA'}
            </button>
            <button type="button" className="forgot-password-link forgot-password-btn recover-back-btn" onClick={() => { setRegisterStep('form'); setError(''); }}>
              ← No recibí el código, volver
            </button>
          </form>
        )}

        {activeTab !== 'recover' && (
          <p className="auth-footer-redirect">
            {activeTab === 'login' ? (
              <>¿No tienes cuenta? <span className="redirect-action-span" onClick={() => { setActiveTab('register'); setRegisterStep('form'); }}>Regístrate</span></>
            ) : (
              <>¿Ya tienes cuenta? <span className="redirect-action-span" onClick={() => { setActiveTab('login'); setRegisterStep('form'); }}>Inicia sesión</span></>
            )}
          </p>
        )}
      </main>
    </div>
  )
}