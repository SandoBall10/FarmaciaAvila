import React, { useState } from 'react';
import { getApiError } from '../../utils/apiError';
import { Role, Usuario, UsuarioRequest } from '../../types/usuario';
import { usuarioService } from '../../services/usuarioService';

interface UsuarioFormState {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Role[];
}

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onClose: () => void;
  onSaved: () => void;
}

function toFormState(usuario?: Usuario | null): UsuarioFormState {
  if (!usuario) {
    return {
      username: '',
      password: '',
      nombre: '',
      apellido: '',
      email: '',
      roles: [{ id: 1, name: 'ADMIN' }],
    };
  }
  return {
    username: usuario.username,
    password: '',
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    roles: usuario.roles?.length ? usuario.roles : [{ id: 1, name: 'ADMIN' }],
  };
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario, onClose, onSaved }) => {
  const [usuarioState, setUsuario] = useState<UsuarioFormState>(toFormState(usuario));
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleId = Number(event.target.value);
    const roleName = selectedRoleId === 1 ? 'ADMIN' : 'Vendedor';
    setUsuario({
      ...usuarioState,
      roles: [{ id: selectedRoleId, name: roleName }],
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(usuarioState.nombre)) {
      setError('El nombre solo puede contener letras');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(usuarioState.apellido)) {
      setError('Los apellidos solo pueden contener letras');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(usuarioState.email)) {
      setError('El email debe ser un correo válido.');
      return;
    }

    if (!usuario && !usuarioState.password) {
      setError('La contraseña es obligatoria');
      return;
    }

    try {
      setSaving(true);
      const payload: UsuarioRequest = {
        username: usuarioState.username,
        nombre: usuarioState.nombre,
        apellido: usuarioState.apellido,
        email: usuarioState.email,
        roles: usuarioState.roles,
      };
      if (usuarioState.password) {
        payload.password = usuarioState.password;
      }
      if (usuario) {
        await usuarioService.update(usuario.id, payload);
      } else {
        await usuarioService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Hubo un error al guardar el usuario'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {usuario ? 'Editar usuario' : 'Nuevo usuario'}
          </h5>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="usuarioUsername" className="form-label">Usuario</label>
            <input
              id="usuarioUsername"
              type="text"
              className="form-control"
              name="usuario"
              autoComplete="username"
              value={usuarioState.username}
              onChange={(e) => setUsuario({ ...usuarioState, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuarioPassword" className="form-label">{usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
            <input
              id="usuarioPassword"
              type="password"
              className="form-control"
              name="password"
              autoComplete={usuario ? 'new-password' : 'current-password'}
              value={usuarioState.password}
              onChange={(e) => setUsuario({ ...usuarioState, password: e.target.value })}
              placeholder={usuario ? 'Dejar en blanco para mantener la contraseña actual' : ''}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuarioNombre" className="form-label">Nombre</label>
            <input
              id="usuarioNombre"
              type="text"
              className="form-control"
              name="nombre"
              value={usuarioState.nombre}
              onChange={(e) => setUsuario({ ...usuarioState, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuarioApellido" className="form-label">Apellidos</label>
            <input
              id="usuarioApellido"
              type="text"
              className="form-control"
              name="apellidos"
              value={usuarioState.apellido}
              onChange={(e) => setUsuario({ ...usuarioState, apellido: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuarioEmail" className="form-label">Correo</label>
            <input
              id="usuarioEmail"
              type="email"
              className="form-control"
              name="email"
              value={usuarioState.email}
              onChange={(e) => setUsuario({ ...usuarioState, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuarioRol" className="form-label">Rol</label>
            <select
              id="usuarioRol"
              className="form-select"
              value={usuarioState.roles[0]?.id || ''}
              onChange={handleRoleChange}
              required
            >
              <option value="1">ADMIN</option>
              <option value="2">Vendedor</option>
            </select>
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

export default UsuarioForm;
