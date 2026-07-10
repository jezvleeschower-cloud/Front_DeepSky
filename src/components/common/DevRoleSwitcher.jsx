import useAuth from '../../hooks/useAuth';
import './DevRoleSwitcher.css';

export default function DevRoleSwitcher() {
  const { role, login, logout } = useAuth();

  const handleChange = (e) => {
    const value = e.target.value;
    value === 'guest' ? logout() : login(value);
  };

  return (
    <div className="dev-role-switcher">
      <span>DEV</span>
      <select value={role} onChange={handleChange}>
        <option value="guest">Invitado</option>
        <option value="user">Usuario</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}