import React, { useState } from 'react';
import { getApiError } from '../../utils/apiError';
import { Cliente, ClienteRequest } from '../../types/cliente';
import { clienteService } from '../../services/clienteService';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onClose, onSaved }) => {
  const [clienteState, setCliente] = useState<ClienteRequest>(
    cliente
      ? { nombre: cliente.nombre, apellidos: cliente.apellidos, email: cliente.email, telefono: cliente.telefono }
      : { nombre: '', apellidos: '', email: '', telefono: '' }
  );
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(clienteState.nombre)) {
      setError('El nombre solo puede contener letras');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(clienteState.apellidos)) {
      setError('Los apellidos solo pueden contener letras');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clienteState.email)) {
      setError('El email debe ser un correo válido.');
      return;
    }

    if (!/^\d{9}$/.test(clienteState.telefono)) {
      setError('El teléfono debe tener 9 dígitos y solo contener números');
      return;
    }

    try {
      setSaving(true);
      if (cliente?.id) {
        await clienteService.update(cliente.id, clienteState);
      } else {
        await clienteService.create(clienteState);
      }
      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Hubo un error al guardar el cliente'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </h5>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="clienteNombre" className="form-label">Nombre</label>
            <input
              id="clienteNombre"
              type="text"
              className="form-control"
              name="nombre"
              value={clienteState.nombre}
              onChange={(e) => setCliente({ ...clienteState, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="clienteApellidos" className="form-label">Apellidos</label>
            <input
              id="clienteApellidos"
              type="text"
              className="form-control"
              name="apellidos"
              value={clienteState.apellidos}
              onChange={(e) => setCliente({ ...clienteState, apellidos: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="clienteEmail" className="form-label">Correo</label>
            <input
              id="clienteEmail"
              type="email"
              className="form-control"
              name="email"
              value={clienteState.email}
              onChange={(e) => setCliente({ ...clienteState, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="clienteTelefono" className="form-label">Teléfono</label>
            <input
              id="clienteTelefono"
              type="tel"
              className="form-control"
              name="telefono"
              inputMode="numeric"
              value={clienteState.telefono}
              onChange={(e) => setCliente({ ...clienteState, telefono: e.target.value })}
              required
            />
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;
