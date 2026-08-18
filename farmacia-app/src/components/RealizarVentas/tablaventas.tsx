import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import 'datatables.net';
import VentaForm from './registroventas';
import { formatInTimeZone } from 'date-fns-tz';
import AlertMessage from '../common/AlertMessage';
import PageHeader from '../ui/PageHeader';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import StatusBadge from '../ui/StatusBadge';
import { dataTableEs } from '../../utils/inventory';
import { getApiError } from '../../utils/apiError';
import { Cliente } from '../../types/cliente';
import { Venta } from '../../types/venta';
import { clienteService } from '../../services/clienteService';
import { ventaService } from '../../services/ventaService';

const TablaVentas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');

  const timeZone = 'America/Lima'; // Cambia esto a tu zona horaria deseada

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (ventas.length > 0) {
      initializeDataTable();
    }
  }, [ventas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [clientesResponse, ventasResponse] = await Promise.all([
        clienteService.getAll(),
        ventaService.getAll()
      ]);
      setClientes(clientesResponse);
      setVentas(ventasResponse);
    } catch (error) {
      setError(getApiError(error, 'Error al cargar los datos'));
    } finally {
      setLoading(false);
    }
  };

  const initializeDataTable = () => {
    if ($.fn.DataTable.isDataTable("#tablaVentas")) {
      $("#tablaVentas").DataTable().destroy();
    }

    $('#tablaVentas').DataTable({
      language: dataTableEs,
      responsive: true,
    });
  };

  const verDetalle = async (venta: Venta) => {
    try {
      setLoading(true);
      setError(null);
      const ventaResponse = await ventaService.getById(venta.id);
      setVentaSeleccionada(ventaResponse);
      setShowDetalleModal(true);
    } catch (error) {
      setError(getApiError(error, 'Error al cargar los detalles de la venta'));
    } finally {
      setLoading(false);
    }
  };

  const addNuevaVenta = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading && !ventaSeleccionada && ventas.length === 0) {
    return <LoadingState label="Cargando ventas..." />;
  }

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle="Registra y consulta las ventas del mostrador."
        actions={
          <button type="button" className="btn btn-primary" onClick={addNuevaVenta}>
            <i className="fa fa-plus" aria-hidden="true"></i> Nueva venta
          </button>
        }
      />
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {mensaje && <AlertMessage type="success" message={mensaje} onClose={() => setMensaje('')} />}

      {ventas.length === 0 && !loading ? (
        <EmptyState
          icon="fa-shopping-cart"
          title="No hay ventas registradas"
          description="Registra la primera venta para comenzar."
          action={<button type="button" className="btn btn-primary" onClick={addNuevaVenta}>Nueva venta</button>}
        />
      ) : (
        <div className="surface-card table-shell p-3">
          <table id="tablaVentas" className="table-app table dataTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => {
                const cliente = clientes.find(c => c.id === venta.idcliente);
                return (
                  <tr key={venta.id}>
                    <td>{venta.id}</td>
                    <td>{cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Desconocido'}</td>
                    <td>{formatInTimeZone(new Date(venta.fechaRegistro), timeZone, 'dd/MM/yyyy HH:mm:ss')}</td>
                    <td>S/ {venta.precioTotal.toFixed(2)}</td>
                    <td><StatusBadge label="Registrada" tone="ok" /></td>
                    <td>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => verDetalle(venta)}
                        disabled={loading}
                      >
                        Ver detalle
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.35)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <VentaForm
            onClose={closeModal}
            onSaved={() => {
              closeModal();
              setMensaje('Venta registrada correctamente');
              cargarDatos();
            }}
          />
          </div>
        </div>
      )}

      {showDetalleModal && ventaSeleccionada && ventaSeleccionada.detalles && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.35)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle de Venta #{ventaSeleccionada.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetalleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6>Información del Cliente</h6>
                        <p>
                          <strong>Nombre:</strong> {ventaSeleccionada.cliente?.nombre} {ventaSeleccionada.cliente?.apellidos}<br />
                          <strong>Email:</strong> {ventaSeleccionada.cliente?.email}<br />
                          <strong>Teléfono:</strong> {ventaSeleccionada.cliente?.telefono}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6>Información de la Venta</h6>
                        <p>
                          <strong>Fecha:</strong> {formatInTimeZone(new Date(ventaSeleccionada.fechaRegistro), timeZone, 'dd/MM/yyyy')}<br />
                          <strong>Hora:</strong> {formatInTimeZone(new Date(ventaSeleccionada.fechaRegistro), timeZone, 'HH:mm:ss')}<br />
                          <strong>Total:</strong> S/.{ventaSeleccionada.precioTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <h6>Productos</h6>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.detalles.map((detalle) => (
                          <tr key={detalle.id}>
                            <td>{detalle.producto?.nombre || 'N/A'}</td>
                            <td>{detalle.cantidad}</td>
                            <td>S/.{(detalle.precioUnitario ?? 0).toFixed(2)}</td>
                            <td>S/.{(detalle.subtotal ?? 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetalleModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaVentas;
