import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import UsuarioForm from './usuarioform';
import AlertMessage from '../common/AlertMessage';
import ConfirmModal from '../common/ConfirmModal';
import PageHeader from '../ui/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { getApiError } from '../../utils/apiError';
import { dataTableEs } from '../../utils/inventory';
import { Usuario } from '../../types/usuario';
import { usuarioService } from '../../services/usuarioService';
import 'datatables.net-responsive';

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { cargarUsuario(); }, []);

  useEffect(() => {
    if (usuarios.length > 0) {
      if ($.fn.DataTable.isDataTable('#tablaUsuarios')) {
        $('#tablaUsuarios').DataTable().destroy();
      }
      $('#tablaUsuarios').DataTable({ language: dataTableEs, responsive: true });
    }
  }, [usuarios]);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usuarioService.getAll();
      setUsuarios(response);
    } catch (err) {
      setError(getApiError(err, 'No pudimos cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  const confirmarEliminar = async () => {
    if (idEliminar == null) return;
    try {
      await usuarioService.delete(idEliminar);
      setIdEliminar(null);
      setMensaje('Usuario eliminado correctamente');
      cargarUsuario();
    } catch (err) {
      setMensaje(getApiError(err, 'Error al eliminar el usuario'));
      setIdEliminar(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Administra el acceso del personal."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => { setUsuarioSeleccionado(null); setShowModal(true); }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Nuevo usuario
          </button>
        }
      />
      {mensaje && <AlertMessage type={mensaje.includes('Error') ? 'danger' : 'success'} message={mensaje} onClose={() => setMensaje('')} />}
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={cargarUsuario} />}
      {!loading && !error && usuarios.length === 0 && (
        <EmptyState
          icon="fa-user"
          title="No hay usuarios"
          description="Crea el primer usuario del sistema."
          action={<button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>Nuevo usuario</button>}
        />
      )}
      {!loading && !error && usuarios.length > 0 && (
        <div className="surface-card table-shell p-3">
          <table id="tablaUsuarios" className="table-app table dataTable">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((item) => {
                const rol = item.roles?.[0]?.name || '—';
                return (
                  <tr key={item.id}>
                    <td><strong>{item.nombre} {item.apellido}</strong></td>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                    <td>
                      <StatusBadge label={rol} tone={rol === 'ADMIN' ? 'info' : 'ok'} />
                    </td>
                    <td>
                      {item.id !== 1 && (
                        <>
                          <button type="button" className="btn btn-outline-secondary btn-sm me-1" onClick={() => { setUsuarioSeleccionado(item); setShowModal(true); }}>Editar</button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setIdEliminar(item.id)}>Eliminar</button>
                        </>
                      )}
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
            <UsuarioForm
              usuario={usuarioSeleccionado}
              onClose={closeModal}
              onSaved={() => {
                closeModal();
                setMensaje(usuarioSeleccionado ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                cargarUsuario();
              }}
            />
          </div>
        </div>
      )}
      <ConfirmModal
        show={idEliminar != null}
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        onConfirm={confirmarEliminar}
        onCancel={() => setIdEliminar(null)}
      />
    </div>
  );
};

export default UsuarioList;
