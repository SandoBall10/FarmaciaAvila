export interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface ClienteRequest {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}
