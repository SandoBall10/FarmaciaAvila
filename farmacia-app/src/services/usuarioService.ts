import { http } from '../api/http';
import { Usuario, UsuarioRequest } from '../types/usuario';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await http.get<Usuario[]>('/api/users');
    return data;
  },

  create: async (payload: UsuarioRequest): Promise<Usuario> => {
    const { data } = await http.post<Usuario>('/api/users', payload);
    return data;
  },

  update: async (id: number, payload: UsuarioRequest): Promise<Usuario> => {
    const { data } = await http.put<Usuario>(`/api/users/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/users/${id}`);
  },
};
