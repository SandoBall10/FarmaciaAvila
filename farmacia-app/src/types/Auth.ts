export interface User {
  id?: number;
  username: string;
  token?: string;
  nombre: string;
  apellido: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id?: number;
    username: string;
    nombre: string;
    apellido: string;
    email: string;
    role: string;
  };
}
