import axios from 'axios';
import { ApiErrorBody } from '../types/api';

export function getApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para esta operación';
    }
    if (error.response?.status === 409) {
      return 'No hay stock suficiente para completar la venta.';
    }
    if (error.response?.status === 401) {
      return 'Sesión expirada. Inicia sesión de nuevo.';
    }
    if (error.response?.status === 404) {
      return 'El recurso solicitado no existe.';
    }
    if (error.response?.status === 400) {
      return 'Los datos enviados no son válidos.';
    }
    if (error.response?.status === 500) {
      return 'Error interno del servidor.';
    }
  }
  return fallback;
}
