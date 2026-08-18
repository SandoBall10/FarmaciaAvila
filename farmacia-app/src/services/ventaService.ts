import { http } from '../api/http';
import { Venta, VentaRequest } from '../types/venta';

export const ventaService = {
  getAll: async (): Promise<Venta[]> => {
    const { data } = await http.get<Venta[]>('/api/venta');
    return data;
  },

  getById: async (id: number): Promise<Venta> => {
    const { data } = await http.get<Venta>(`/api/venta/${id}`);
    return data;
  },

  create: async (payload: VentaRequest): Promise<Venta> => {
    const { data } = await http.post<Venta>('/api/venta', payload);
    return data;
  },
};
