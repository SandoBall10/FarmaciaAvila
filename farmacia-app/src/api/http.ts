import axios from 'axios';
import { clearSession, getToken } from '../auth/authStorage';
import { notifyUnauthorized } from './sessionEvents';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8010';

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isAuthenticateRequest(url?: string): boolean {
  return Boolean(url && url.includes('/authenticate'));
}

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;

    if (status === 401 && !isAuthenticateRequest(requestUrl)) {
      clearSession();
      notifyUnauthorized();
    }

    return Promise.reject(error);
  }
);
