import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import { User } from '../types/Auth';
import logo from '../assets/FarmaciaAvilaLogoLogin.png';
import iconCatalogo from '../assets/icon-catalogo.svg';
import iconClientes from '../assets/icon-clientes.svg';
import iconVentas from '../assets/icon-ventas.svg';
import iconInventario from '../assets/icon-inventario.svg';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const FEATURES = [
  { label: 'catálogo', icon: iconCatalogo },
  { label: 'clientes', icon: iconClientes },
  { label: 'ventas', icon: iconVentas },
  { label: 'inventario', icon: iconInventario },
] as const;

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryHint, setRecoveryHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRecoveryHint(false);
    try {
      const user = await AuthService.login(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch {
      setError('No pudimos iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-brand" aria-label="Presentación Farmacia Ávila">
        <div className="login-brand-content">
          <div className="login-brand-logo-wrap">
            <img src={logo} alt="Farmacia Ávila" className="login-brand-logo" />
          </div>
          <p className="login-brand-copy">
            Sistema de gestión para el día a día de la farmacia: catálogo, clientes, ventas e inventario.
          </p>
        </div>
        <ul className="login-features">
          {FEATURES.map((feature) => (
            <li key={feature.label}>
              <img src={feature.icon} alt="" className="login-feature-icon" />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h1 className="login-card-title">INICIAR SESIÓN | Farmacia Avila</h1>
          <p className="login-card-subtitle">Ingresa con tu usuario de trabajo.</p>

          {error && (
            <div className="login-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Usuario</label>
              <div className="login-input">
                <i className="fa fa-user" aria-hidden="true"></i>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Usuario"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <div className="login-input">
                <i className="fa fa-lock" aria-hidden="true"></i>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Contraseña"
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
            </button>
          </form>

          <button
            type="button"
            className="login-forgot"
            onClick={() => setRecoveryHint(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
          {recoveryHint && (
            <p className="login-recovery-hint" role="status">
              Para restablecer el acceso, contacta al administrador de la farmacia.
            </p>
          )}
        </div>

        <p className="login-footer">
          Farmacia Avila © 2026. Todos los derechos reservados. Acceso restringido.
        </p>
      </section>
    </div>
  );
};

export default Login;
