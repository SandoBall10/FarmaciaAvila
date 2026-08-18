import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import { User } from '../types/Auth';
import logo from '../assets/FarmaciaAvilaLogo.png';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
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
      <section className="login-brand">
        <img src={logo} alt="Farmacia Ávila" className="brand-logo brand-logo-login" />
        <p>Sistema de gestión para el día a día de la farmacia: catálogo, clientes, ventas e inventario.</p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <h2 className="mb-1">Iniciar sesión</h2>
          <p className="text-secondary mb-4">Ingresa con tu usuario de trabajo.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Usuario</label>
              <input
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
