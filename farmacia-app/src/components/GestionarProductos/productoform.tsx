import React, { useState } from 'react';
import { getApiError } from '../../utils/apiError';
import { Producto, ProductoRequest } from '../../types/producto';
import { productoService } from '../../services/productoService';

interface ProductoFormValues {
  nombre: string;
  precio: string;
  cantidad: string;
  fechaVencimiento: string;
  descripcion: string;
  categoria: string;
}

interface ProductoFormProps {
  producto?: Producto | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm: ProductoFormValues = {
  nombre: '',
  precio: '',
  cantidad: '',
  fechaVencimiento: '',
  descripcion: '',
  categoria: '',
};

function toFormValues(producto?: Producto | null): ProductoFormValues {
  if (!producto) {
    return emptyForm;
  }
  return {
    nombre: producto.nombre,
    precio: String(producto.precio),
    cantidad: String(producto.cantidad),
    fechaVencimiento: producto.fechaVencimiento ?? '',
    descripcion: producto.descripcion ?? '',
    categoria: producto.categoria ?? '',
  };
}

const ProductoForm: React.FC<ProductoFormProps> = ({ producto, onClose, onSaved }) => {
  const [productoState, setProducto] = useState<ProductoFormValues>(toFormValues(producto));
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{1,50}$/.test(productoState.nombre)) {
      setError('El nombre solo puede contener letras, números, espacios, y un máximo de 50 caracteres');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(productoState.precio)) {
      setError('El precio solo puede contener números y debe ser un valor decimal válido');
      return;
    }

    if (!/^\d+$/.test(productoState.cantidad)) {
      setError('La cantidad solo puede contener números');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(productoState.fechaVencimiento)) {
      setError('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
      return;
    }

    if (productoState.descripcion.length > 200) {
      setError('La descripción puede tener un máximo de 200 caracteres');
      return;
    }

    try {
      setSaving(true);
      const payload: ProductoRequest = {
        nombre: productoState.nombre,
        precio: Number(productoState.precio),
        cantidad: Number(productoState.cantidad),
        fechaVencimiento: productoState.fechaVencimiento,
        descripcion: productoState.descripcion,
        categoria: productoState.categoria,
      };
      if (producto?.id) {
        await productoService.update(producto.id, payload);
      } else {
        await productoService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Hubo un error al guardar el producto'));
    } finally {
      setSaving(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedDate = today.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h5>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="productoNombre" className="form-label">Nombre del producto</label>
            <input
              id="productoNombre"
              type="text"
              className="form-control"
              name="nombre"
              value={productoState.nombre}
              onChange={(e) => setProducto({ ...productoState, nombre: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productoPrecio" className="form-label">Precio</label>
            <input
              id="productoPrecio"
              type="text"
              className="form-control"
              name="precio"
              inputMode="decimal"
              value={productoState.precio}
              onChange={(e) => setProducto({ ...productoState, precio: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productoCantidad" className="form-label">Stock</label>
            <input
              id="productoCantidad"
              type="text"
              className="form-control"
              name="cantidad"
              inputMode="numeric"
              value={productoState.cantidad}
              onChange={(e) => setProducto({ ...productoState, cantidad: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productoVencimiento" className="form-label">Fecha de vencimiento</label>
            <input
              id="productoVencimiento"
              type="date"
              className="form-control"
              name="fechaVencimiento"
              value={productoState.fechaVencimiento}
              onChange={(e) => setProducto({ ...productoState, fechaVencimiento: e.target.value })}
              min={formattedDate}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productoDescripcion" className="form-label">Descripción</label>
            <textarea
              id="productoDescripcion"
              className="form-control"
              name="descripcion"
              value={productoState.descripcion}
              onChange={(e) => setProducto({ ...productoState, descripcion: e.target.value })}
              maxLength={200}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productoCategoria" className="form-label">Categoría</label>
            <select
              id="productoCategoria"
              className="form-select"
              name="categoria"
              value={productoState.categoria}
              onChange={(e) => setProducto({ ...productoState, categoria: e.target.value })}
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="Antibioticos">Antibioticos</option>
              <option value="Medicamentos Pediatricos">Medicamentos Pediatricos</option>
              <option value="Antivirales">Antivirales</option>
              <option value="Vitaminas y Suplementos">Vitaminas y Suplementos</option>
              <option value="Dermatologia">Dermatologia</option>
              <option value="Antiinflamatorios y Analgesicos">Antiinflamatorios y Analgesicos</option>
              <option value="Sistema Respiratorio (Broncodilatadores)">Sistema Respiratorio (Broncodilatadores)</option>
              <option value="Productos de Aseo y Cuidado Personal">Productos de Aseo y Cuidado Personal</option>
              <option value="Antigripales y Resfriados">Antigripales y Resfriados</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Gastrointestinales">Gastrointestinales</option>
              <option value="Oftalmologia">Oftalmologia</option>
              <option value="Ginecologia">Ginecologia</option>
            </select>
          </div>
          {error && <div className="alert alert-danger" role="alert" id="productoError">{error}</div>}
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

export default ProductoForm;
