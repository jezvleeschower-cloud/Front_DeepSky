import useAuth from '../../../hooks/useAuth';
import logoTelescopio from '../../../assets/logo-deepSky.png';
import logoNombre from '../../../assets/logo-DeepSky-nombre.png';
import '../Auth.css';

export default function AccountPage({ onNavigate }) {
  const { userData, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  return (
    <div className="auth-page-container">
      <header className="auth-header">
        <div className="auth-logo-wrapper" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <img src={logoTelescopio} alt="Telescopio" className="auth-logo-ico" />
          <img src={logoNombre} alt="DeepSky" className="auth-logo-text" />
        </div>
      </header>

      <main className="auth-form-card">
        <div className="auth-tabs">
          <button className="tab-btn active">MI CUENTA</button>
        </div>

        <div className="account-data-list">
          <div className="input-field-group">
            <label>NOMBRE DE USUARIO</label>
            <p className="account-data-value">{userData?.username}</p>
          </div>
          <div className="input-field-group">
            <label>CORREO</label>
            <p className="account-data-value">{userData?.email}</p>
          </div>
          <div className="input-field-group">
            <label>MIEMBRO DESDE</label>
            <p className="account-data-value">{userData?.joinDate}</p>
          </div>
          <div className="input-field-group">
            <label>TIPO DE CUENTA</label>
            <p className="account-data-value">{role === 'admin' ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>

        <button type="button" className="action-auth-submit" onClick={handleLogout}>
          CERRAR SESIÓN
        </button>
      </main>
    </div>
  );
}