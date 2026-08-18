export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  fechaVencimiento: string;
  descripcion: string;
  categoria: string;
}

export interface ProductoRequest {
  nombre: string;
  precio: number;
  cantidad: number;
  fechaVencimiento: string;
  descripcion: string;
  categoria: string;
}
