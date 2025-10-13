// src/api/labor.js
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
        console.log('CSRF token agregado a laborService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para laborService:', config.url);
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
      console.error('Error de autenticación en laborService:', error.response?.status, error.response?.data);
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

// Servicio para gestión de labores agrícolas
export const laborService = {
  // ============================================================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================================================

  // Obtener todas las labores con paginación y filtros
  async getLabores(params = {}) {
    try {
      const response = await api.get('/api/labores/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener labores:', error);
      throw this.handleError(error);
    }
  },

  // Obtener labor por ID
  async getLaborById(id) {
    try {
      const response = await api.get(`/api/labores/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener labor:', error);
      throw this.handleError(error);
    }
  },

  // Crear nueva labor
  async crearLabor(laborData) {
    try {
      const response = await api.post('/api/labores/', laborData);
      return response.data;
    } catch (error) {
      console.error('Error al crear labor:', error);
      throw this.handleError(error);
    }
  },

  // Actualizar labor existente
  async updateLabor(id, laborData) {
    try {
      const response = await api.put(`/api/labores/${id}/`, laborData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar labor:', error);
      throw this.handleError(error);
    }
  },

  // Eliminar labor
  async deleteLabor(id) {
    try {
      const response = await api.delete(`/api/labores/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar labor:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // ACCIONES ESPECIALES DEL VIEWSET
  // ============================================================================

  // Cambiar estado de una labor
  async cambiarEstado(id, estado, observaciones = '') {
    try {
      const response = await api.post(`/api/labores/${id}/cambiar_estado/`, {
        estado,
        observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de labor:', error);
      throw this.handleError(error);
    }
  },

  // Actualizar insumo utilizado en la labor
  async actualizarInsumo(id, insumoId, cantidad) {
    try {
      const response = await api.post(`/api/labores/${id}/actualizar_insumo/`, {
        insumo_id: insumoId,
        cantidad_insumo: cantidad
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar insumo de labor:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // ENDPOINTS ADICIONALES
  // ============================================================================

  // Crear labor rápida (sin campos opcionales)
  async crearLaborRapida(laborData) {
    try {
      const response = await api.post('/api/labores/crear-rapida/', laborData);
      return response.data;
    } catch (error) {
      console.error('Error al crear labor rápida:', error);
      throw this.handleError(error);
    }
  },

  // Búsqueda avanzada de labores
  async buscarLaboresAvanzado(params = {}) {
    try {
      const response = await api.get('/api/labores/buscar-avanzado/', { params });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda avanzada de labores:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // ENDPOINTS DE CONFIGURACIÓN Y UTILIDADES
  // ============================================================================

  // Obtener lista de tipos de labor disponibles
  async getTiposLabor() {
    try {
      const response = await api.get('/api/labores/tipos_labor/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de labor:', error);
      throw this.handleError(error);
    }
  },

  // Obtener lista de estados disponibles para labores
  async getEstadosLabor() {
    try {
      const response = await api.get('/api/labores/estados_labor/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados de labor:', error);
      throw this.handleError(error);
    }
  },

  // Obtener labores que pueden descontar insumos
  async getLaboresConInsumos() {
    try {
      const response = await api.get('/api/labores/labores_con_insumos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener labores con insumos:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // REPORTES Y ESTADÍSTICAS
  // ============================================================================

  // Reporte de labores por período
  async getReporteLaboresPorPeriodo(fechaDesde, fechaHasta) {
    try {
      const response = await api.get('/api/labores/reporte_labores_por_periodo/', {
        params: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de labores:', error);
      throw this.handleError(error);
    }
  },

  // Validar si una fecha está dentro del rango de una campaña
  async validarFechaCampana(campañaId, fecha) {
    try {
      const response = await api.get('/api/labores/validar_fecha_campaña/', {
        params: {
          campaña_id: campañaId,
          fecha: fecha
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar fecha de campaña:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // SERVICIOS AUXILIARES (PARA LOS SELECTS DEL FORMULARIO)
  // ============================================================================

  // Obtener campañas (asumiendo que existe un servicio para campañas)
  async getCampanas() {
    try {
      const response = await api.get('/api/campanas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      throw this.handleError(error);
    }
  },

  // Obtener parcelas (asumiendo que existe un servicio para parcelas)
  async getParcelas() {
    try {
      const response = await api.get('/api/parcelas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcelas:', error);
      throw this.handleError(error);
    }
  },

  // Obtener insumos (asumiendo que existe un servicio para insumos)
  async getInsumos() {
    try {
      const response = await api.get('/api/insumos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener insumos:', error);
      throw this.handleError(error);
    }
  },

  // Obtener responsables (asumiendo que existe un servicio para usuarios)
  async getResponsables() {
    try {
      const response = await api.get('/api/usuarios/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener responsables:', error);
      throw this.handleError(error);
    }
  },

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  // Formatear errores de validación del backend
  formatValidationErrors(errorData) {
    if (errorData.response && errorData.response.data) {
      const backendErrors = errorData.response.data;
      
      // Si es un objeto con campos de validación
      if (typeof backendErrors === 'object' && !Array.isArray(backendErrors)) {
        const errors = [];
        for (let field in backendErrors) {
          if (Array.isArray(backendErrors[field])) {
            errors.push(`${this.formatFieldName(field)}: ${backendErrors[field].join(', ')}`);
          } else {
            errors.push(`${this.formatFieldName(field)}: ${backendErrors[field]}`);
          }
        }
        return errors.join('; ');
      }
      
      // Si es un string o array simple
      if (typeof backendErrors === 'string') {
        return backendErrors;
      }
      
      if (Array.isArray(backendErrors)) {
        return backendErrors.join('; ');
      }
    }
    
    return 'Error desconocido del servidor';
  },

  // Formatear nombres de campos para mostrar
  formatFieldName(fieldName) {
    const fieldMap = {
      'fecha_labor': 'Fecha de labor',
      'labor': 'Tipo de labor',
      'estado': 'Estado',
      'campaña': 'Campaña',
      'parcela': 'Parcela',
      'insumo': 'Insumo',
      'cantidad_insumo': 'Cantidad de insumo',
      'descripcion': 'Descripción',
      'observaciones': 'Observaciones',
      'costo_estimado': 'Costo estimado',
      'duracion_horas': 'Duración en horas',
      'responsable': 'Responsable'
    };
    
    return fieldMap[fieldName] || fieldName;
  },

  // Manejar errores de manera consistente
  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const message = this.formatValidationErrors(error);
      
      switch (status) {
        case 400:
          return new Error(`Datos inválidos: ${message}`);
        case 401:
          return new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        case 403:
          return new Error('No tiene permisos para realizar esta acción.');
        case 404:
          return new Error('Recurso no encontrado.');
        case 500:
          return new Error('Error interno del servidor. Por favor, intente más tarde.');
        default:
          return new Error(`Error del servidor (${status}): ${message}`);
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Algo pasó en la configuración de la petición
      return new Error(`Error de configuración: ${error.message}`);
    }
  },

  // Utilidad para construir parámetros de búsqueda
  buildSearchParams(filters) {
    const params = {};
    
    // Mapear nombres de campos del frontend al backend
    const fieldMap = {
      fechaDesde: 'fecha_labor_desde',
      fechaHasta: 'fecha_labor_hasta',
      tipo: 'labor_tipo',
      estado: 'estado',
      campana: 'campaña_id',
      parcela: 'parcela_id',
      responsable: 'responsable_id',
      insumo: 'insumo_id',
      socio: 'socio_id'
    };
    
    for (let key in filters) {
      if (filters[key] && fieldMap[key]) {
        params[fieldMap[key]] = filters[key];
      }
    }
    
    return params;
  },

  // Utilidad para validar datos antes de enviar
  validateLaborData(laborData) {
    const errors = [];
    
    // Validaciones básicas
    if (!laborData.fecha_labor) {
      errors.push('La fecha de labor es obligatoria');
    }
    
    if (!laborData.labor) {
      errors.push('El tipo de labor es obligatorio');
    }
    
    if (!laborData.descripcion) {
      errors.push('La descripción es obligatoria');
    }
    
    if (!laborData.campaña && !laborData.parcela) {
      errors.push('Debe especificar al menos una campaña o parcela');
    }
    
    if (laborData.insumo && !laborData.cantidad_insumo) {
      errors.push('Debe especificar la cantidad de insumo utilizada');
    }
    
    // Validación de fecha futura
    if (laborData.fecha_labor) {
      const today = new Date().toISOString().split('T')[0];
      if (laborData.fecha_labor > today) {
        errors.push('La fecha de labor no puede ser en el futuro');
      }
    }
    
    // Validación de cantidades numéricas
    if (laborData.cantidad_insumo && laborData.cantidad_insumo <= 0) {
      errors.push('La cantidad de insumo debe ser mayor a 0');
    }
    
    if (laborData.costo_estimado && laborData.costo_estimado < 0) {
      errors.push('El costo estimado no puede ser negativo');
    }
    
    if (laborData.duracion_horas && laborData.duracion_horas <= 0) {
      errors.push('La duración debe ser mayor a 0');
    }
    
    return errors;
  }
};

export default laborService;