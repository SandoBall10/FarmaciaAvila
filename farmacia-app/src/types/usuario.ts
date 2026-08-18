export interface Role {
  id: number;
  name: string;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Role[];
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Role[];
}
