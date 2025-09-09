// src/services/authServices.js
const API_BASE_URL = 'http://localhost:3000/api'; // Cambiar por tu URL del backend cuando esté listo

class AuthService {
  async registerUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error) {
      // Si no hay conexión con el backend, simular respuesta exitosa
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.warn('Backend no disponible, simulando registro exitoso');
        return {
          success: true,
          message: 'Usuario registrado (modo prueba)',
          user: {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
          }
        };
      }
      throw error;
    }
  }

  async loginUser(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      // Si no hay conexión con el backend, simular respuesta exitosa para desarrollo
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.warn('Backend no disponible, simulando login exitoso');
        return {
          success: true,
          token: 'mock-token-' + Date.now(),
          user: {
            id: 1,
            name: 'Usuario de Prueba',
            email: credentials.email,
          }
        };
      }
      throw error;
    }
  }
}

export default new AuthService();