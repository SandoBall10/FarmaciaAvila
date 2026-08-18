import { http } from '../api/http';
import { Producto, ProductoRequest } from '../types/producto';

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const { data } = await http.get<Producto[]>('/api/producto');
    return data;
  },

  getById: async (id: number): Promise<Producto> => {
    const { data } = await http.get<Producto>(`/api/producto/${id}`);
    return data;
  },

  create: async (payload: ProductoRequest): Promise<Producto> => {
    const { data } = await http.post<Producto>('/api/producto', payload);
    return data;
  },

  update: async (id: number, payload: ProductoRequest): Promise<Producto> => {
    const { data } = await http.put<Producto>(`/api/producto/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/producto/${id}`);
  },
};
