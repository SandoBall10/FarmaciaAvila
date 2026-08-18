import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../../types/Auth';
import logo from '../../assets/FarmaciaAvilaLogo.png';

interface SidebarProps {
  user: User | null;
  open: boolean;
  onNavigate: () => void;
  onLogout: () => void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `app-nav-link${isActive ? ' active' : ''}`;

const Sidebar: React.FC<SidebarProps> = ({ user, open, onNavigate, onLogout }) => {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className={`app-sidebar ${open ? 'open' : ''}`} aria-label="Navegación principal">
      <div className="app-brand">
        <img src={logo} alt="" className="brand-logo" />
        <div className="app-brand-text">
          <strong>FARMACIA</strong>
          <span>ÁVILA</span>
        </div>
      </div>

      <div className="app-nav-section">Principal</div>
      <NavLink to="/" end className={navClass} onClick={onNavigate}>
        <i className="fa fa-home" aria-hidden="true"></i> Dashboard
      </NavLink>

      <div className="app-nav-section">Gestión</div>
      {isAdmin && (
        <NavLink to="/productos" className={navClass} onClick={onNavigate}>
          <i className="fa fa-medkit" aria-hidden="true"></i> Productos
        </NavLink>
      )}
      <NavLink to="/clientes" className={navClass} onClick={onNavigate}>
        <i className="fa fa-users" aria-hidden="true"></i> Clientes
      </NavLink>
      <NavLink to="/ventas" className={navClass} onClick={onNavigate}>
        <i className="fa fa-shopping-cart" aria-hidden="true"></i> Ventas
      </NavLink>
      <NavLink to="/inventarios" className={navClass} onClick={onNavigate}>
        <i className="fa fa-bar-chart" aria-hidden="true"></i> Inventario
      </NavLink>

      {isAdmin && (
        <>
          <div className="app-nav-section">Administración</div>
          <NavLink to="/usuarios" className={navClass} onClick={onNavigate}>
            <i className="fa fa-user" aria-hidden="true"></i> Usuarios
          </NavLink>
        </>
      )}

      <div className="app-sidebar-footer">
        <button type="button" className="btn btn-outline-secondary w-100" onClick={onLogout}>
          <i className="fa fa-sign-out" aria-hidden="true"></i> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
