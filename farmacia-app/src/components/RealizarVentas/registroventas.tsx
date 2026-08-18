import React, { useEffect, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { Cliente } from "../../types/cliente";
import { Producto } from "../../types/producto";
import { VentaRequest } from "../../types/venta";
import { clienteService } from "../../services/clienteService";
import { productoService } from "../../services/productoService";
import { ventaService } from "../../services/ventaService";

interface ProductoSeleccionado extends Producto {
  cantidadSeleccionada: number;
}

interface VentaFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const VentaForm: React.FC<VentaFormProps> = ({ onClose, onSaved }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [precioTotal, setPrecioTotal] = useState<number>(0);
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarClientes();
    cargarProductos();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await clienteService.getAll();
      setClientes(response);
    } catch (error) {
      setError(getApiError(error, "Error al cargar los clientes"));
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await productoService.getAll();
      setProductos(response);
    } catch (error) {
      setError(getApiError(error, "Error al cargar los productos"));
    }
  };

  const agregarProducto = (producto: Producto, cantidad: number) => {
    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (cantidad > producto.cantidad) {
      setError(`Solo hay ${producto.cantidad} unidades disponibles`);
      return;
    }

    const productoExistente = productosSeleccionados.find(p => p.id === producto.id);
    if (productoExistente) {
      setError("Este producto ya está en el carrito");
      return;
    }

    const nuevoProductoSeleccionado: ProductoSeleccionado = {
      ...producto,
      cantidadSeleccionada: cantidad
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProductoSeleccionado]);
    setPrecioTotal(prev => prev + (producto.precio * cantidad));
    setError("");
    setMostrarModalProductos(false);
  };

  const eliminarProducto = (idProducto: number) => {
    const producto = productosSeleccionados.find((p) => p.id === idProducto);
    if (producto) {
      setProductosSeleccionados(
        productosSeleccionados.filter((p) => p.id !== idProducto)
      );
      setPrecioTotal(prev => prev - (producto.precio * producto.cantidadSeleccionada));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clienteSeleccionado || productosSeleccionados.length === 0) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const nuevaVenta: VentaRequest = {
      idcliente: clienteSeleccionado.id,
      fechaRegistro: new Date().toISOString().split("T")[0],
      detalles: productosSeleccionados.map((p) => ({
        idproducto: p.id,
        cantidad: p.cantidadSeleccionada
      })),
    };

    try {
      setLoading(true);
      await ventaService.create(nuevaVenta);
      setClienteSeleccionado(null);
      setProductosSeleccionados([]);
      setPrecioTotal(0);
      onSaved();
    } catch (error) {
      setError(getApiError(error, "Error al crear la venta"));
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `${cliente.nombre} ${cliente.apellidos} ${cliente.email}`.toLowerCase();
    return texto.includes(busquedaCliente.toLowerCase().trim());
  });

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim())
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Nueva venta</h5>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="busquedaCliente" className="form-label">Cliente</label>
            <input
              id="busquedaCliente"
              type="search"
              className="form-control mb-2"
              placeholder="Buscar cliente por nombre o correo"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
            />
            <label htmlFor="clienteVenta" className="visually-hidden">Seleccionar cliente</label>
            <select
              className="form-select"
              id="clienteVenta"
              required
              value={clienteSeleccionado?.id ?? ""}
              onChange={(e) => {
                const cliente = clientes.find((c) => c.id === parseInt(e.target.value, 10));
                setClienteSeleccionado(cliente || null);
              }}
            >
              <option value="">Seleccione un cliente</option>
              {clientesFiltrados.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellidos}
                </option>
              ))}
            </select>
            {clienteSeleccionado && (
              <p className="text-secondary small mt-2 mb-0">
                {clienteSeleccionado.email} · {clienteSeleccionado.telefono}
              </p>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Productos</span>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setMostrarModalProductos(true)}
            >
              <i className="fa fa-search" aria-hidden="true"></i> Buscar producto
            </button>
          </div>

          {productosSeleccionados.length === 0 ? (
            <p className="text-secondary small">Aún no hay productos en esta venta.</p>
          ) : (
            <div className="pos-ticket mb-3">
              <div className="pos-line pos-line-head">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Total</span>
                <span className="visually-hidden">Quitar</span>
              </div>
              {productosSeleccionados.map((producto) => (
                <div className="pos-line" key={producto.id}>
                  <div>
                    <strong>{producto.nombre}</strong>
                    <div className="text-secondary small">S/ {producto.precio.toFixed(2)} c/u</div>
                  </div>
                  <span>{producto.cantidadSeleccionada}</span>
                  <span>S/ {(producto.precio * producto.cantidadSeleccionada).toFixed(2)}</span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    aria-label={`Quitar ${producto.nombre}`}
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pos-totals">
            <div>
              <span className="text-secondary">Subtotal estimado</span>
              <strong>S/ {precioTotal.toFixed(2)}</strong>
            </div>
            <div className="pos-total">
              <span>TOTAL</span>
              <strong>S/ {precioTotal.toFixed(2)}</strong>
            </div>
            <p className="text-secondary small mb-0">El servidor confirma el total y el stock al registrar.</p>
          </div>

          {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Registrando venta..." : "Registrar venta"}
          </button>
        </div>

        {mostrarModalProductos && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(15, 23, 42, 0.35)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Agregar producto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setMostrarModalProductos(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <label htmlFor="busquedaProducto" className="form-label">Buscar producto</label>
                  <input
                    id="busquedaProducto"
                    type="search"
                    className="form-control mb-3"
                    placeholder="Nombre del medicamento"
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                  />
                  <div className="table-responsive">
                    <table className="table-app table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th>Cantidad</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosFiltrados.map((producto) => (
                          <tr key={producto.id}>
                            <td>{producto.nombre}</td>
                            <td>S/ {producto.precio.toFixed(2)}</td>
                            <td>{producto.cantidad}</td>
                            <td>
                              <label htmlFor={`cantidad-${producto.id}`} className="visually-hidden">
                                Cantidad de {producto.nombre}
                              </label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="1"
                                max={producto.cantidad}
                                defaultValue="1"
                                id={`cantidad-${producto.id}`}
                                disabled={producto.cantidad === 0}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  const cantidad = parseInt(
                                    (document.getElementById(`cantidad-${producto.id}`) as HTMLInputElement).value,
                                    10
                                  );
                                  agregarProducto(producto, cantidad);
                                }}
                                disabled={producto.cantidad === 0}
                              >
                                {producto.cantidad === 0 ? "Sin stock" : "Agregar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {productosFiltrados.length === 0 && (
                    <p className="text-secondary text-center mb-0">No hay productos que coincidan.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setMostrarModalProductos(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default VentaForm;