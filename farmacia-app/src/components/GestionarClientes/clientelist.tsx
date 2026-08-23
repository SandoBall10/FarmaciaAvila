import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import ClienteForm from './clienteform';
import AlertMessage from '../common/AlertMessage';
import ConfirmModal from '../common/ConfirmModal';
import PageHeader from '../ui/PageHeader';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { getApiError } from '../../utils/apiError';
import { dataTableEs } from '../../utils/inventory';
import { Cliente } from '../../types/cliente';
import { clienteService } from '../../services/clienteService';
import { getCurrentUser } from '../../auth/authStorage';
import 'datatables.net-responsive';

const ClienteList: React.FC = () => {
  const isAdmin = getCurrentUser()?.role === 'ADMIN';
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { cargarClientes(); }, []);

  useEffect(() => {
    if (clientes.length > 0) {
      if ($.fn.DataTable.isDataTable('#tablaCliente')) {
        $('#tablaCliente').DataTable().destroy();
      }
      $('#tablaCliente').DataTable({ language: dataTableEs, responsive: true });
    }
  }, [clientes]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clienteService.getAll();
      setClientes(response);
    } catch (err) {
      setError(getApiError(err, 'No pudimos cargar los clientes.'));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  const confirmarEliminar = async () => {
    if (idEliminar == null) return;
    try {
      await clienteService.delete(idEliminar);
      setIdEliminar(null);
      setMensaje('Cliente eliminado correctamente');
      cargarClientes();
    } catch (err) {
      setMensaje(getApiError(err, 'Error al eliminar el cliente'));
      setIdEliminar(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Administra los clientes registrados."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => { setClienteSeleccionado(null); setShowModal(true); }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Nuevo cliente
          </button>
        }
      />
      {mensaje && <AlertMessage type={mensaje.includes('Error') ? 'danger' : 'success'} message={mensaje} onClose={() => setMensaje('')} />}
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={cargarClientes} />}
      {!loading && !error && clientes.length === 0 && (
        <EmptyState
          icon="fa-users"
          title="No hay clientes registrados"
          description="Agrega tu primer cliente para comenzar."
          action={<button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>Nuevo cliente</button>}
        />
      )}
      {!loading && !error && clientes.length > 0 && (
        <div className="surface-card table-shell p-3">
          <table id="tablaCliente" className="table-app table dataTable">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td><strong>{cliente.nombre} {cliente.apellidos}</strong></td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <button type="button" className="btn btn-outline-secondary btn-sm me-1" onClick={() => { setClienteSeleccionado(cliente); setShowModal(true); }}>Editar</button>
                    {isAdmin && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setIdEliminar(cliente.id)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.35)' }}>
          <div className="modal-dialog">
            <ClienteForm
              cliente={clienteSeleccionado}
              onClose={closeModal}
              onSaved={() => {
                closeModal();
                setMensaje(clienteSeleccionado ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
                cargarClientes();
              }}
            />
          </div>
        </div>
      )}
      <ConfirmModal
        show={idEliminar != null}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente?"
        onConfirm={confirmarEliminar}
        onCancel={() => setIdEliminar(null)}
      />
    </div>
  );
};

export default ClienteList;
