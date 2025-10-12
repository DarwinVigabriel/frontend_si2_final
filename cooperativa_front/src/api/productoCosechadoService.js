import axios from 'axios';

// Configuración base de axios
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si no está autenticado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productoCosechadoService = {
  // =============================================
  // CRUD BÁSICO - PRODUCTOS COSECHADOS
  // =============================================

  /**
   * Listar productos cosechados con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @returns Promise
   */
  listar: (filtros = {}) => 
    apiClient.get('/api/productos-cosechados/', { params: filtros }),

  /**
   * Obtener un producto cosechado por ID
   * @param {number} id - ID del producto
   * @returns Promise
   */
  obtener: (id) => 
    apiClient.get(`/api/productos-cosechados/${id}/`),

  /**
   * Crear un nuevo producto cosechado
   * @param {Object} data - Datos del producto
   * @returns Promise
   */
  crear: (data) => 
    apiClient.post('/api/productos-cosechados/', data),

  /**
   * Actualizar un producto cosechado existente
   * @param {number} id - ID del producto
   * @param {Object} data - Datos actualizados
   * @returns Promise
   */
  actualizar: (id, data) => 
    apiClient.put(`/api/productos-cosechados/${id}/`, data),

  /**
   * Eliminar un producto cosechado
   * @param {number} id - ID del producto
   * @returns Promise
   */
  eliminar: (id) => 
    apiClient.delete(`/api/productos-cosechados/${id}/`),

  // =============================================
  // ACCIONES ESPECIALES
  // =============================================

  /**
   * Vender un producto cosechado
   * @param {number} id - ID del producto
   * @param {Object} data - { cantidad_vendida, observaciones }
   * @returns Promise
   */
  vender: (id, data) => 
    apiClient.post(`/api/productos-cosechados/${id}/vender_producto/`, data),

  /**
   * Cambiar estado de un producto cosechado
   * @param {number} id - ID del producto
   * @param {Object} data - { nuevo_estado, observaciones }
   * @returns Promise
   */
  cambiarEstado: (id, data) => 
    apiClient.post(`/api/productos-cosechados/${id}/cambiar_estado/`, data),

  // =============================================
  // CONSULTAS Y UTILIDADES
  // =============================================

  /**
   * Obtener lista de estados disponibles
   * @returns Promise
   */
  estadosDisponibles: () => 
    apiClient.get('/api/productos-cosechados/estados_disponibles/'),

  /**
   * Obtener productos próximos a vencer
   * @param {number} diasUmbral - Días umbral para considerar próximo a vencer
   * @returns Promise
   */
  productosPorVencer: (diasUmbral = 30) => 
    apiClient.get('/api/productos-cosechados/productos_por_vencer/', {
      params: { dias_umbral: diasUmbral }
    }),

  /**
   * Obtener productos que pueden ser vendidos
   * @returns Promise
   */
  productosVendibles: () => 
    apiClient.get('/api/productos-cosechados/productos_vendibles/'),

  /**
   * Obtener reporte completo del inventario
   * @returns Promise
   */
  reporteInventario: () => 
    apiClient.get('/api/productos-cosechados/reporte_inventario/'),

  /**
   * Validar si un número de lote ya existe
   * @param {number|string} lote - Número de lote a validar
   * @returns Promise
   */
  validarLote: (lote) => 
    apiClient.get('/api/productos-cosechados/validar_lote/', {
      params: { lote }
    }),

  // =============================================
  // ENDPOINTS ADICIONALES
  // =============================================

  /**
   * Crear producto cosechado de forma rápida
   * @param {Object} data - Datos mínimos del producto
   * @returns Promise
   */
  crearRapido: (data) => 
    apiClient.post('/api/productos-cosechados/crear-rapido/', data),

  /**
   * Búsqueda avanzada con múltiples filtros
   * @param {Object} filtros - Filtros de búsqueda avanzada
   * @returns Promise
   */
  buscarAvanzado: (filtros = {}) => 
    apiClient.get('/api/productos-cosechados/buscar-avanzado/', {
      params: filtros
    }),

  /**
   * Reporte de productos cosechados por período
   * @param {string} fechaDesde - Fecha inicio (YYYY-MM-DD)
   * @param {string} fechaHasta - Fecha fin (YYYY-MM-DD)
   * @returns Promise
   */
  reportePorPeriodo: (fechaDesde, fechaHasta) => 
    apiClient.get('/api/productos-cosechados/reporte-por-periodo/', {
      params: {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      }
    }),
};

// =============================================
// CONSTANTES Y CONFIGURACIONES
// =============================================

/**
 * Opciones de estados para productos cosechados
 */
export const ESTADOS_PRODUCTO = [
  { valor: 'En Almacén', etiqueta: 'En Almacén' },
  { valor: 'Vendido', etiqueta: 'Vendido' },
  { valor: 'Procesado', etiqueta: 'Procesado' },
  { valor: 'Vencido', etiqueta: 'Vencido' },
  { valor: 'En revision', etiqueta: 'En revisión' }
];

/**
 * Filtros disponibles para búsqueda
 */
export const FILTROS_DISPONIBLES = {
  fecha_cosecha_desde: { tipo: 'date', label: 'Fecha Cosecha Desde' },
  fecha_cosecha_hasta: { tipo: 'date', label: 'Fecha Cosecha Hasta' },
  cultivo_id: { tipo: 'number', label: 'Cultivo' },
  campania_id: { tipo: 'number', label: 'Campaña' },
  parcela_id: { tipo: 'number', label: 'Parcela' },
  estado: { tipo: 'select', label: 'Estado', opciones: ESTADOS_PRODUCTO },
  lote: { tipo: 'number', label: 'Lote' },
  calidad: { tipo: 'text', label: 'Calidad' },
  labor_id: { tipo: 'number', label: 'Labor' },
  socio_id: { tipo: 'number', label: 'Socio' },
  especie: { tipo: 'text', label: 'Especie' },
  unidad_medida: { tipo: 'text', label: 'Unidad Medida' },
  ubicacion_almacen: { tipo: 'text', label: 'Ubicación Almacén' }
};

/**
 * Campos para creación rápida
 */
export const CAMPOS_CREACION_RAPIDA = [
  'fecha_cosecha',
  'cantidad',
  'unidad_medida',
  'calidad',
  'cultivo',
  'labor',
  'lote',
  'ubicacion_almacen'
];

export default productoCosechadoService;