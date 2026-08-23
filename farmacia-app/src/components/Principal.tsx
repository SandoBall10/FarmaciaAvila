import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types/Auth';
import { Cliente } from '../types/cliente';
import { Producto } from '../types/producto';
import { Venta } from '../types/venta';
import StatCard from './ui/StatCard';
import StatusBadge from './ui/StatusBadge';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import { STOCK_BAJO, getStockLabel, isProximoAVencer } from '../utils/inventory';
import { getApiError } from '../utils/apiError';
import { clienteService } from '../services/clienteService';
import { productoService } from '../services/productoService';
import { ventaService } from '../services/ventaService';

interface PrincipalProps {
  user: User | null;
}

const saludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const Principal: React.FC<PrincipalProps> = ({ user }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [p, c, v] = await Promise.all([
        productoService.getAll(),
        clienteService.getAll(),
        ventaService.getAll(),
      ]);
      setProductos(p);
      setClientes(c);
      setVentas(v);
    } catch (err) {
      setError(getApiError(err, 'No se pudo cargar el resumen.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading) return <LoadingState label="Cargando resumen de la farmacia..." />;
  if (error) return <ErrorState message={error} onRetry={cargar} />;

  const stockBajo = productos.filter((p) => p.cantidad > 0 && p.cantidad <= STOCK_BAJO);
  const alertas = productos.filter((p) => p.cantidad <= STOCK_BAJO || isProximoAVencer(p.fechaVencimiento));
  const recientes = [...ventas].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="mb-0">{saludo()}, {user?.nombre}</h1>
          <p>Aquí tienes un resumen de la farmacia con datos reales.</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <StatCard label="Productos" value={productos.length} icon="fa-medkit" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Clientes" value={clientes.length} icon="fa-users" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Ventas" value={ventas.length} icon="fa-shopping-cart" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Stock bajo" value={stockBajo.length} icon="fa-exclamation-triangle" hint="Umbral: 10 unidades" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="surface-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Ventas recientes</h3>
              <Link to="/ventas">Ver todas</Link>
            </div>
            {recientes.length === 0 ? (
              <p className="text-secondary mb-0">Aún no hay ventas registradas.</p>
            ) : (
              <div className="table-responsive">
                <table className="table-app w-100">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((venta) => (
                        <tr key={venta.id}>
                          <td>#{venta.id}</td>
                          <td>{venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellidos}` : 'Cliente'}</td>
                          <td>{venta.fechaRegistro}</td>
                          <td>S/ {venta.precioTotal.toFixed(2)}</td>
                          <td><StatusBadge label="Registrada" tone="ok" /></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="surface-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Alertas de inventario</h3>
              <Link to="/inventarios">Inventario</Link>
            </div>
            {alertas.length === 0 ? (
              <p className="text-secondary mb-0">No hay alertas de stock o vencimiento.</p>
            ) : (
              alertas.slice(0, 6).map((producto) => {
                const stock = getStockLabel(producto.cantidad);
                return (
                  <div key={producto.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <strong>{producto.nombre}</strong>
                      <div className="text-secondary small">{producto.cantidad} unidades</div>
                    </div>
                    <div className="d-flex gap-1 flex-wrap justify-content-end">
                      <StatusBadge label={stock.label} tone={stock.tone} />
                      {isProximoAVencer(producto.fechaVencimiento) && (
                        <StatusBadge label="Por vencer" tone="warn" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Principal;
