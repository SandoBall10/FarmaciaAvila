import React, { useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './styles/theme.css';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Principal from './components/Principal';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { setUnauthorizedHandler } from './api/sessionEvents';
import AuthService from './services/AuthService';
import { User } from './types/Auth';
import ClientList from './components/GestionarClientes/clientelist';
import ProductoList from './components/GestionarProductos/productolist';
import InventarioList from './components/Inventario/tablainventario';
import VentaList from './components/RealizarVentas/tablaventas';
import UsuarioList from './components/GestionarUsuario/usuariolist';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="app-shell">
          <div
            className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar
            user={currentUser}
            open={sidebarOpen}
            onNavigate={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
          <div className="app-main">
            <Topbar
              user={currentUser}
              onMenu={() => setSidebarOpen((open) => !open)}
              onLogout={handleLogout}
            />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Principal user={currentUser} />} />
                <Route path="/clientes" element={<ClientList />} />
                <Route path="/ventas" element={<VentaList />} />
                <Route path="/inventarios" element={<InventarioList />} />
                <Route path="/usuarios" element={isAdmin ? <UsuarioList /> : <Navigate to="/" replace />} />
                <Route path="/productos" element={isAdmin ? <ProductoList /> : <Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;
