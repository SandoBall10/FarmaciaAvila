import React from 'react';
import { User } from '../../types/Auth';
import logo from '../../assets/FarmaciaAvilaLogo.png';

interface TopbarProps {
  user: User | null;
  onMenu: () => void;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenu, onLogout }) => {
  const initials = `${user?.nombre?.[0] ?? ''}${user?.apellido?.[0] ?? ''}`.toUpperCase() || 'FA';
  const rol = user?.role === 'ADMIN' ? 'Administrador' : 'Vendedor';

  return (
    <header className="app-topbar">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary d-lg-none"
          onClick={onMenu}
          aria-label="Abrir menú"
        >
          <i className="fa fa-bars"></i>
        </button>
        <img src={logo} alt="Farmacia Ávila" className="brand-logo brand-logo-sm d-lg-none" />
        <div className="d-none d-lg-block text-secondary">Gestión farmacéutica</div>
      </div>
      <div className="dropdown">
        <button
          className="btn user-chip"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label="Menú de usuario"
        >
          <span className="user-avatar">{initials}</span>
          <span className="text-start d-none d-sm-block">
            <strong>{user?.nombre} {user?.apellido}</strong>
            <small>{rol}</small>
          </span>
          <i className="fa fa-angle-down" aria-hidden="true"></i>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li className="dropdown-item-text text-secondary small">{user?.email}</li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button type="button" className="dropdown-item" onClick={onLogout}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Topbar;
