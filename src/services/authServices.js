import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Ajusta según dónde pruebas:
// 1) Web / iOS simulador: localhost
// 2) Emulador Android: 10.0.2.2
// 3) Dispositivo físico: tu IP LAN (ej: 192.168.1.9)
const PC_LAN_IP = 'http://192.168.1.9:4000/usuarios';

const API_BASE_URL =
  Platform.OS === 'android'
    ? PC_LAN_IP        // Cambia a 'http://10.0.2.2:4000/usuarios' si es EMULADOR
    : 'http://localhost:4000/usuarios';

class AuthService {
  async registerUser(userData) {
    console.log('[register] POST', `${API_BASE_URL}/register`, userData);
    try {
      const resp = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const rawText = await resp.text();
  let data = {};
      try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { _raw: rawText }; }

      console.log('[register] status:', resp.status, 'raw:', rawText, 'parsed:', data);

      if (!resp.ok) {
        let backendMsg = '';
        if (typeof data === 'object') backendMsg = data.message || data.error || '';
        if (!backendMsg) backendMsg = rawText || '';

        let msg = backendMsg.trim();
        if (!msg) msg = resp.status === 409 ? 'Conflicto: duplicado' : 'Error en el registro';

        // Normalizaciones duplicados
        if (/usuario.*ya existe/i.test(msg)) msg = 'El usuario ya existe';
        else if (/(correo|email).*ya (est[aá])|email.*already/i.test(msg)) msg = 'El correo ya está registrado';
        else if (/correo.*existe/i.test(msg)) msg = 'El correo ya está registrado';
        else if (resp.status === 409 && !/usuario|correo/i.test(msg)) msg = 'El usuario o correo ya existe';

        const errorObj = new Error(msg);
        errorObj.status = resp.status;
        errorObj.raw = rawText;
        errorObj.backendMessage = backendMsg;
        if (resp.status === 409 || /ya existe|ya est[aá]|duplicate|already/i.test(backendMsg)) errorObj.code = 'DUPLICATE';
        throw errorObj;
      }
      return data;
    } catch (e) {
      if (e.message === 'Network request failed') {
        throw new Error('No se pudo conectar al servidor. Verifica IP y red.');
      }
      throw e;
    }
  }

  async loginUser(credentials) {
    console.log('[login] POST', `${API_BASE_URL}/login`, credentials.email);
    try {
      const resp = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      let data;
      try { data = await resp.json(); } catch { data = {}; }

      console.log('[login] status:', resp.status, 'body:', data);

      if (!resp.ok) {
        const msg = resp.status === 401
          ? 'Correo o contraseña inválidos'
          : (data?.message || 'Error en el login');
        throw new Error(msg);
      }

      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (e) {
      if (e.message === 'Network request failed') {
        throw new Error('No se pudo conectar al servidor. Verifica IP y red.');
      }
      throw e;
    }
  }

  async getToken() {
    return AsyncStorage.getItem('userToken');
  }

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  }
}

export const authService = new AuthService();
