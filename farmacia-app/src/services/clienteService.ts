import { http } from '../api/http';
import { Cliente, ClienteRequest } from '../types/cliente';

export const clienteService = {
  getAll: async (): Promise<Cliente[]> => {
    const { data } = await http.get<Cliente[]>('/api/cliente');
    return data;
  },

  getById: async (id: number): Promise<Cliente> => {
    const { data } = await http.get<Cliente>(`/api/cliente/${id}`);
    return data;
  },

  create: async (payload: ClienteRequest): Promise<Cliente> => {
    const { data } = await http.post<Cliente>('/api/cliente', payload);
    return data;
  },

  update: async (id: number, payload: ClienteRequest): Promise<Cliente> => {
    const { data } = await http.put<Cliente>(`/api/cliente/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/cliente/${id}`);
  },
};
