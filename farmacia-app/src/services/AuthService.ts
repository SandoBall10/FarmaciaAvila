import { http } from '../api/http';
import { clearSession, getCurrentUser as readSession, setSession } from '../auth/authStorage';
import { LoginResponse, User } from '../types/Auth';

class AuthService {
  async login(username: string, password: string): Promise<User | null> {
    try {
      const response = await http.post<LoginResponse>('/authenticate', { username, password });
      if (!response.data.token) {
        return null;
      }
      const userData: User = {
        username,
        nombre: response.data.user.nombre,
        apellido: response.data.user.apellido,
        email: response.data.user.email,
        role: response.data.user.role,
        token: response.data.token,
      };
      setSession(userData);
      return userData;
    } catch {
      throw new Error('Credenciales inválidas');
    }
  }

  logout(): void {
    clearSession();
  }

  getCurrentUser(): User | null {
    return readSession();
  }
}

export default new AuthService();
