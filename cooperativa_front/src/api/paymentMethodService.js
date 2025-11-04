import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Configurar axios con las credenciales y CSRF
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar CSRF token
api.interceptors.request.use(
  (config) => {
    // Solo agregar CSRF token para peticiones que no sean de login
    if (!config.url.includes('/api/auth/login/') && !config.url.includes('/api/auth/csrf/')) {
      // Obtener CSRF token del localStorage o cookie
      let csrfToken = localStorage.getItem('csrf_token');

      // Si no está en localStorage, intentar obtenerlo de las cookies
      if (!csrfToken) {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('csrftoken='));
        if (csrfCookie) {
          csrfToken = csrfCookie.split('=')[1];
        }
      }

      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
        console.log('CSRF token agregado a paymentMethodService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para paymentMethodService:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    // Guardar CSRF token si viene en la respuesta
    if (response.data && response.data.csrf_token) {
      localStorage.setItem('csrf_token', response.data.csrf_token);
    }

    // También guardar CSRF token de las cookies si existe
    const cookies = document.cookie.split('; ');
    const csrfFromCookie = cookies.find(row => row.startsWith('csrftoken='));
    if (csrfFromCookie) {
      const csrfToken = csrfFromCookie.split('=')[1];
      localStorage.setItem('csrf_token', csrfToken);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Error de autenticación en paymentMethodService:', error.response?.status, error.response?.data);
      // Solo redirigir si no estamos en la página de login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Servicio para gestión de métodos de pago
export const paymentMethodService = {
  // Obtener todos los métodos de pago
  async getPaymentMethods(params = {}) {
    try {
      const response = await api.get('/api/payment-methods/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      throw error;
    }
  },

  // Obtener método de pago por ID
  async getPaymentMethod(id) {
    try {
      const response = await api.get(`/api/payment-methods/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener método de pago:', error);
      throw error;
    }
  },

  // Crear método de pago
  async createPaymentMethod(paymentMethodData) {
    try {
      const response = await api.post('/api/payment-methods/', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error al crear método de pago:', error);
      throw error;
    }
  },

  // Actualizar método de pago
  async updatePaymentMethod(id, paymentMethodData) {
    try {
      const response = await api.put(`/api/payment-methods/${id}/`, paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
      throw error;
    }
  },

  // Actualizar parcialmente método de pago
  async partialUpdatePaymentMethod(id, paymentMethodData) {
    try {
      const response = await api.patch(`/api/payment-methods/${id}/`, paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar parcialmente método de pago:', error);
      throw error;
    }
  },

  // Eliminar método de pago
  async deletePaymentMethod(id) {
    try {
      const response = await api.delete(`/api/payment-methods/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      throw error;
    }
  },

  // Activar/desactivar método de pago
  async toggleActivation(id, activo) {
    try {
      const response = await api.patch(`/api/payment-methods/${id}/activar-desactivar/`, { activo });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del método de pago:', error);
      throw error;
    }
  },

  // Obtener métodos de pago activos
  async getActivePaymentMethods() {
    try {
      const response = await api.get('/api/payment-methods/activos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de pago activos:', error);
      throw error;
    }
  },

  // Obtener métodos de pago para dropdown
  async getPaymentMethodsDropdown() {
    try {
      const response = await api.get('/api/payment-methods/dropdown/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de pago para dropdown:', error);
      throw error;
    }
  },

  // Reordenar métodos de pago
  async reorderPaymentMethods(metodos) {
    try {
      const response = await api.post('/api/payment-methods/reordenar/', { metodos });
      return response.data;
    } catch (error) {
      console.error('Error al reordenar métodos de pago:', error);
      throw error;
    }
  },

  // Obtener estadísticas de métodos de pago
  async getPaymentMethodsStats() {
    try {
      const response = await api.get('/api/payment-methods/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de métodos de pago:', error);
      throw error;
    }
  },

  // Buscar métodos de pago avanzado
  async searchPaymentMethods(params = {}) {
    try {
      const response = await api.get('/api/payment-methods/buscar-avanzado/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al buscar métodos de pago:', error);
      throw error;
    }
  },

  // Validar eliminación de método de pago
  async validateDeletion(id) {
    try {
      const response = await api.get(`/api/payment-methods/${id}/validar-eliminacion/`);
      return response.data;
    } catch (error) {
      console.error('Error al validar eliminación de método de pago:', error);
      throw error;
    }
  },

  // Obtener métodos de pago por tipo
  async getPaymentMethodsByType(tipo) {
    try {
      const response = await api.get(`/api/payment-methods/?tipo=${tipo}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de pago por tipo:', error);
      throw error;
    }
  }
};

// Servicio para tipos de métodos de pago (constantes)
export const paymentMethodTypes = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  CHEQUE: 'CHEQUE',
  DIGITAL: 'DIGITAL',
  OTRO: 'OTRO'
};

// Servicio para obtener opciones de tipos de métodos de pago
export const paymentMethodOptions = {
  getTypes() {
    return [
      { value: paymentMethodTypes.EFECTIVO, label: 'Efectivo' },
      { value: paymentMethodTypes.TRANSFERENCIA, label: 'Transferencia Bancaria' },
      { value: paymentMethodTypes.TARJETA_CREDITO, label: 'Tarjeta de Crédito' },
      { value: paymentMethodTypes.TARJETA_DEBITO, label: 'Tarjeta de Débito' },
      { value: paymentMethodTypes.CHEQUE, label: 'Cheque' },
      { value: paymentMethodTypes.DIGITAL, label: 'Pago Digital' },
      { value: paymentMethodTypes.OTRO, label: 'Otro' }
    ];
  },

  getTypeDisplay(tipo) {
    const typeMap = {
      [paymentMethodTypes.EFECTIVO]: 'Efectivo',
      [paymentMethodTypes.TRANSFERENCIA]: 'Transferencia Bancaria',
      [paymentMethodTypes.TARJETA_CREDITO]: 'Tarjeta de Crédito',
      [paymentMethodTypes.TARJETA_DEBITO]: 'Tarjeta de Débito',
      [paymentMethodTypes.CHEQUE]: 'Cheque',
      [paymentMethodTypes.DIGITAL]: 'Pago Digital',
      [paymentMethodTypes.OTRO]: 'Otro'
    };
    return typeMap[tipo] || tipo;
  },

  getTypeColor(tipo) {
    const colorMap = {
      [paymentMethodTypes.EFECTIVO]: 'bg-green-500/20 text-green-200',
      [paymentMethodTypes.TRANSFERENCIA]: 'bg-blue-500/20 text-blue-200',
      [paymentMethodTypes.TARJETA_CREDITO]: 'bg-purple-500/20 text-purple-200',
      [paymentMethodTypes.TARJETA_DEBITO]: 'bg-indigo-500/20 text-indigo-200',
      [paymentMethodTypes.CHEQUE]: 'bg-yellow-500/20 text-yellow-200',
      [paymentMethodTypes.DIGITAL]: 'bg-cyan-500/20 text-cyan-200',
      [paymentMethodTypes.OTRO]: 'bg-gray-500/20 text-gray-200'
    };
    return colorMap[tipo] || 'bg-gray-500/20 text-gray-200';
  },

  getTypeIcon(tipo) {
    const iconClass = "w-4 h-4 mr-1";
    const icons = {
      [paymentMethodTypes.EFECTIVO]: '💵',
      [paymentMethodTypes.TRANSFERENCIA]: '🏦',
      [paymentMethodTypes.TARJETA_CREDITO]: '💳',
      [paymentMethodTypes.TARJETA_DEBITO]: '💳',
      [paymentMethodTypes.CHEQUE]: '📄',
      [paymentMethodTypes.DIGITAL]: '📱',
      [paymentMethodTypes.OTRO]: '🔧'
    };
    return icons[tipo] || '💳';
  }
};

// Servicio para validaciones de métodos de pago
export const paymentMethodValidation = {
  // Validar nombre del método de pago
  validateNombre(nombre) {
    if (!nombre || nombre.trim() === '') {
      return { isValid: false, message: 'El nombre no puede estar vacío' };
    }
    
    if (nombre.length < 2) {
      return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (nombre.length > 100) {
      return { isValid: false, message: 'El nombre no puede exceder los 100 caracteres' };
    }
    
    const pattern = /^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/;
    if (!pattern.test(nombre)) {
      return { 
        isValid: false, 
        message: 'Nombre solo puede contener letras, números, espacios, guiones, puntos y paréntesis' 
      };
    }
    
    return { isValid: true };
  },

  // Validar configuración específica por tipo
  validateConfiguracion(tipo, configuracion) {
    if (!configuracion || Object.keys(configuracion).length === 0) {
      return { isValid: true };
    }

    if (tipo === paymentMethodTypes.TARJETA_CREDITO || tipo === paymentMethodTypes.TARJETA_DEBITO) {
      const requiredFields = ['procesador', 'comision_porcentaje'];
      const missingFields = requiredFields.filter(field => !(field in configuracion));
      
      if (missingFields.length > 0) {
        return {
          isValid: false,
          message: `Para tarjetas, los siguientes campos son requeridos: ${missingFields.join(', ')}`
        };
      }

      // Validar comisión porcentual
      const comision = configuracion.comision_porcentaje;
      if (comision !== undefined && comision !== null) {
        const comisionNum = parseFloat(comision);
        if (isNaN(comisionNum) || comisionNum < 0 || comisionNum > 100) {
          return {
            isValid: false,
            message: 'La comisión porcentual debe ser un número entre 0 y 100'
          };
        }
      }
    }

    return { isValid: true };
  },

  // Validar orden
  validateOrden(orden) {
    if (orden < 0) {
      return { isValid: false, message: 'El orden no puede ser negativo' };
    }
    
    if (orden > 1000) {
      return { isValid: false, message: 'El orden no puede ser mayor a 1000' };
    }
    
    return { isValid: true };
  }
};

export default api;