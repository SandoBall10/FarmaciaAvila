import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import ProductoForm from './productoform';
import AlertMessage from '../common/AlertMessage';
import ConfirmModal from '../common/ConfirmModal';
import PageHeader from '../ui/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { getApiError } from '../../utils/apiError';
import { dataTableEs, getStockLabel, isProximoAVencer } from '../../utils/inventory';
import { Producto } from '../../types/producto';
import { productoService } from '../../services/productoService';
import 'datatables.net-responsive';

const ProductoList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      if ($.fn.DataTable.isDataTable('#tablaProducto')) {
        $('#tablaProducto').DataTable().destroy();
      }
      $('#tablaProducto').DataTable({
        language: dataTableEs,
        responsive: true,
      });
    }
  }, [productos]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productoService.getAll();
      setProductos(response);
    } catch (err) {
      setError(getApiError(err, 'No pudimos cargar los productos.'));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  const confirmarEliminar = async () => {
    if (idEliminar == null) return;
    try {
      await productoService.delete(idEliminar);
      setIdEliminar(null);
      setMensaje('Producto eliminado correctamente');
      cargarProductos();
    } catch (err) {
      setMensaje(getApiError(err, 'Error al eliminar el producto'));
      setIdEliminar(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Gestiona el catálogo de medicamentos."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => { setProductoSeleccionado(null); setShowModal(true); }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Nuevo producto
          </button>
        }
      />
      {mensaje && (
        <AlertMessage
          type={mensaje.includes('Error') ? 'danger' : 'success'}
          message={mensaje}
          onClose={() => setMensaje('')}
        />
      )}
      {loading && <LoadingState label="Cargando productos..." />}
      {!loading && error && <ErrorState message={error} onRetry={cargarProductos} />}
      {!loading && !error && productos.length === 0 && (
        <EmptyState
          icon="fa-medkit"
          title="No hay productos registrados"
          description="Agrega tu primer producto para comenzar."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
              Nuevo producto
            </button>
          }
        />
      )}
      {!loading && !error && productos.length > 0 && (
        <div className="surface-card table-shell p-3">
          <table id="tablaProducto" className="table-app table dataTable">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                    <td>S/ {producto.precio.toFixed(2)}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.fechaVencimiento || '—'}</td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <StatusBadge label={stock.label} tone={stock.tone} />
                        {isProximoAVencer(producto.fechaVencimiento) && (
                          <StatusBadge label="Por vencer" tone="warn" />
                        )}
                      </div>
                    </td>
                    <td>
                      <button type="button" className="btn btn-outline-secondary btn-sm me-1" onClick={() => { setProductoSeleccionado(producto); setShowModal(true); }}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setIdEliminar(producto.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.35)' }}>
          <div className="modal-dialog">
            <ProductoForm
              producto={productoSeleccionado}
              onClose={closeModal}
              onSaved={() => {
                closeModal();
                setMensaje(productoSeleccionado ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
                cargarProductos();
              }}
            />
          </div>
        </div>
      )}
      <ConfirmModal
        show={idEliminar != null}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        onConfirm={confirmarEliminar}
        onCancel={() => setIdEliminar(null)}
      />
    </div>
  );
};

export default ProductoList;
