import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:4000/denuncias';
const DEBUG = false;

// Sencillo caché en memoria para categorías
let _categoryCache = null;
let _categoryCacheTime = 0;
const CATEGORY_TTL_MS = 5 * 60 * 1000; // 5 minutos

class ReportService {
  async create(report) {
    const token = await AsyncStorage.getItem('userToken');
    const resp = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(report),
    });
    let data; try { data = await resp.json(); } catch { data = {}; }
    if (!resp.ok) throw new Error(data?.error || data?.message || 'Error al crear la denuncia');
    return data;
  }

  async getCategories() {
    const now = Date.now();
    if (_categoryCache && (now - _categoryCacheTime) < CATEGORY_TTL_MS) {
      return _categoryCache;
    }
    try {
      const resp = await fetch('http://localhost:4000/categorias');
      const data = await resp.json();
      if (Array.isArray(data)) {
        _categoryCache = data;
        _categoryCacheTime = now;
        return data;
      }
      return [];
    } catch {
      return _categoryCache || [];
    }
  }

  async getCategoryNameById(id) {
    if (!id) return undefined;
    const cats = await this.getCategories();
    const found = cats.find(c => String(c.id) === String(id));
    return found?.nombre || found?.name;
  }

  async getOne(id) {
    const token = await AsyncStorage.getItem('userToken');
    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    let data; try { data = await resp.json(); } catch { data = {}; }
    if (!resp.ok) throw new Error(data?.error || data?.message || 'Error al obtener denuncia');
    return data;
  }

  async listMine() {
    const token = await AsyncStorage.getItem('userToken');
    let resp = await fetch(`${API_BASE_URL}/misDenuncias`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    let data;
    try { data = await resp.json(); } catch { data = []; }
    if (DEBUG) console.log('[listMine] status:', resp.status, 'items:', Array.isArray(data)?data.length: 'n/a');
    if (!resp.ok) throw new Error(data?.error || data?.message || 'Error al cargar denuncias');
    return Array.isArray(data) ? data : [];
  }

  async list({ sort = 'recent' } = {}) {
    const token = await AsyncStorage.getItem('userToken');
    const resp = await fetch(`${API_BASE_URL}?sort=${encodeURIComponent(sort)}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    let data; try { data = await resp.json(); } catch { data = []; }
    if (!resp.ok) throw new Error(data?.error || 'Error al listar denuncias');
    return Array.isArray(data) ? data : [];
  }

  async vote(id, value) {
    const token = await AsyncStorage.getItem('userToken');
    const resp = await fetch(`${API_BASE_URL}/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ value })
    });
    let data; try { data = await resp.json(); } catch { data = {}; }
    if (!resp.ok) throw new Error(data?.error || 'Error al votar');
    return data;
  }
}

export const reportService = new ReportService();