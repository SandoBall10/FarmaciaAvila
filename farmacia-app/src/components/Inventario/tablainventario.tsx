import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { getApiError } from '../../utils/apiError';
import { STOCK_BAJO, dataTableEs, getStockLabel, isProximoAVencer } from '../../utils/inventory';
import { Producto } from '../../types/producto';
import { productoService } from '../../services/productoService';
import 'datatables.net-responsive';

const TablaInventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { cargarInventario(); }, []);

  useEffect(() => {
    if (productos.length > 0) {
      if ($.fn.DataTable.isDataTable('#tablaInventario')) {
        $('#tablaInventario').DataTable().destroy();
      }
      $('#tablaInventario').DataTable({ language: dataTableEs, responsive: true });
    }
  }, [productos]);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productoService.getAll();
      setProductos(response);
    } catch (err) {
      setError(getApiError(err, 'No pudimos cargar el inventario.'));
    } finally {
      setLoading(false);
    }
  };

  const normal = productos.filter((p) => p.cantidad > STOCK_BAJO).length;
  const bajo = productos.filter((p) => p.cantidad > 0 && p.cantidad <= STOCK_BAJO).length;
  const agotado = productos.filter((p) => p.cantidad <= 0).length;
  const porVencer = productos.filter((p) => isProximoAVencer(p.fechaVencimiento)).length;

  return (
    <div>
      <PageHeader title="Inventario" subtitle="Consulta el estado del stock y los vencimientos." />
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={cargarInventario} />}
      {!loading && !error && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-xl"><StatCard label="Total productos" value={productos.length} icon="fa-medkit" /></div>
            <div className="col-md-6 col-xl"><StatCard label="Stock normal" value={normal} icon="fa-check" /></div>
            <div className="col-md-6 col-xl"><StatCard label="Stock bajo" value={bajo} icon="fa-exclamation-triangle" /></div>
            <div className="col-md-6 col-xl"><StatCard label="Sin stock" value={agotado} icon="fa-times-circle" /></div>
            <div className="col-md-6 col-xl"><StatCard label="Por vencer" value={porVencer} icon="fa-clock-o" /></div>
          </div>
          {productos.length === 0 ? (
            <EmptyState icon="fa-bar-chart" title="Inventario vacío" description="Cuando existan productos, verás su estado aquí." />
          ) : (
            <div className="surface-card table-shell p-3">
              <table id="tablaInventario" className="table-app table dataTable">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Umbral alerta</th>
                    <th>Estado</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => {
                    const stock = getStockLabel(producto.cantidad);
                    return (
                      <tr key={producto.id}>
                        <td>
                          <strong>{producto.nombre}</strong>
                          <div className="text-secondary small">{producto.categoria}</div>
                        </td>
                        <td>{producto.cantidad}</td>
                        <td>{STOCK_BAJO}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <StatusBadge label={stock.label} tone={stock.tone} />
                            {isProximoAVencer(producto.fechaVencimiento) && <StatusBadge label="Por vencer" tone="warn" />}
                          </div>
                        </td>
                        <td>{producto.fechaVencimiento || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TablaInventario;
