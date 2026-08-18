import { Cliente } from './cliente';

export interface ProductoResumen {
  id: number;
  nombre: string;
}

export interface VentaDetalle {
  id: number;
  idproducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: ProductoResumen;
}

export interface Venta {
  id: number;
  idcliente: number;
  fechaRegistro: string;
  precioTotal: number;
  cliente?: Cliente;
  detalles?: VentaDetalle[];
}

export interface VentaLineaRequest {
  idproducto: number;
  cantidad: number;
}

export interface VentaRequest {
  idcliente: number;
  fechaRegistro?: string;
  detalles: VentaLineaRequest[];
}
