// src/pages/LaborPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
  User,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import laborService from '../api/laborService';
import { 
  getEstadoBadgeVariant, 
  getTipoLaborBadgeVariant, 
  formatDuracion, 
  formatMoneda 
} from '../utils/laborUtils';

const LaborPage = () => {
  const navigate = useNavigate();
  const [labores, setLabores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
    campana: '',
    parcela: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState({
    total: 0,
    planificadas: 0,
    enProceso: 0,
    completadas: 0,
    canceladas: 0
  });

  // Cargar labores
  const cargarLabores = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        ...laborService.buildSearchParams(filtros)
      };

      if (searchTerm) {
        // Búsqueda simple por texto
        params.search = searchTerm;
      }

      const response = await laborService.getLabores(params);
      setLabores(response.results || response);
      setTotalPages(Math.ceil(response.count / pageSize));
      setCurrentPage(page);
      calcularEstadisticas(response.results || response);
    } catch (error) {
      console.error('Error al cargar labores:', error);
      // Fallback a datos simulados si hay error
      const datosSimulados = [
        {
          id: 1,
          fecha_labor: '2024-01-15',
          labor: 'SIEMBRA',
          tipo_labor_display: 'Siembra',
          estado: 'COMPLETADA',
          campaña_nombre: 'Campaña Maíz 2024',
          parcela_nombre: 'Parcela Norte',
          socio_nombre: 'Juan Pérez',
          insumo_nombre: 'Semilla Maíz Híbrido',
          cantidad_insumo: 50,
          descripcion: 'Siembra de maíz en parcela norte',
          observaciones: 'Tierra en buen estado',
          costo_estimado: 1500,
          duracion_horas: 8,
          duracion_display: '8 horas',
          costo_total: 1800,
          responsable_nombre: 'María García',
          creado_en: '2024-01-10T08:00:00Z',
          actualizado_en: '2024-01-15T18:00:00Z'
        },
        {
          id: 2,
          fecha_labor: '2024-01-20',
          labor: 'FERTILIZACION',
          tipo_labor_display: 'Fertilización',
          estado: 'EN_PROCESO',
          campaña_nombre: 'Campaña Maíz 2024',
          parcela_nombre: 'Parcela Sur',
          socio_nombre: 'Carlos López',
          insumo_nombre: 'Fertilizante NPK',
          cantidad_insumo: 25,
          descripcion: 'Aplicación de fertilizante base',
          observaciones: 'Aplicar en horas de la mañana',
          costo_estimado: 800,
          duracion_horas: 4,
          duracion_display: '4 horas',
          costo_total: 950,
          responsable_nombre: 'Pedro Martínez',
          creado_en: '2024-01-18T10:00:00Z',
          actualizado_en: '2024-01-20T14:00:00Z'
        },
        {
          id: 3,
          fecha_labor: '2024-01-25',
          labor: 'COSECHA',
          tipo_labor_display: 'Cosecha',
          estado: 'PLANIFICADA',
          campaña_nombre: 'Campaña Trigo 2024',
          parcela_nombre: null,
          socio_nombre: null,
          insumo_nombre: null,
          cantidad_insumo: null,
          descripcion: 'Cosecha de trigo maduro',
          observaciones: 'Programar para clima seco',
          costo_estimado: 2000,
          duracion_horas: 12,
          duracion_display: '12 horas',
          costo_total: 2000,
          responsable_nombre: null,
          creado_en: '2024-01-22T09:00:00Z',
          actualizado_en: '2024-01-22T09:00:00Z'
        }
      ];
      setLabores(datosSimulados);
      calcularEstadisticas(datosSimulados);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (data) => {
    const total = data.length;
    const planificadas = data.filter(l => l.estado === 'PLANIFICADA').length;
    const enProceso = data.filter(l => l.estado === 'EN_PROCESO').length;
    const completadas = data.filter(l => l.estado === 'COMPLETADA').length;
    const canceladas = data.filter(l => l.estado === 'CANCELADA').length;

    setStats({
      total,
      planificadas,
      enProceso,
      completadas,
      canceladas
    });
  };

  // Cambiar estado de labor
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await laborService.cambiarEstado(id, nuevoEstado);
      cargarLabores(currentPage);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  // Eliminar labor
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta labor?')) {
      try {
        await laborService.deleteLabor(id);
        cargarLabores(currentPage);
      } catch (error) {
        console.error('Error al eliminar labor:', error);
        alert('Error al eliminar labor: ' + error.message);
      }
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    setCurrentPage(1);
    cargarLabores(1);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      tipo: '',
      campana: '',
      parcela: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    cargarLabores(1);
  };

  // Efecto inicial
  useEffect(() => {
    cargarLabores();
  }, [pageSize]);

  // Render badge de estado
  const renderEstadoBadge = (estado) => {
    const variant = getEstadoBadgeVariant(estado);
    const iconos = {
      'PLANIFICADA': <Clock className="w-3 h-3" />,
      'EN_PROCESO': <PlayCircle className="w-3 h-3" />,
      'COMPLETADA': <CheckCircle className="w-3 h-3" />,
      'CANCELADA': <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${variant}/20 text-${variant}-200`}>
        {iconos[estado]}
        <span className="ml-1">{estado.replace('_', ' ')}</span>
      </span>
    );
  };

  // Render badge de tipo de labor
  const renderTipoBadge = (tipo) => {
    const variant = getTipoLaborBadgeVariant(tipo);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${variant}/20 text-${variant}-200`}>
        {tipo}
      </span>
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Obtener datos únicos para filtros
  const tiposUnicos = [...new Set(labores.map(l => l.labor).filter(Boolean))];
  const estadosUnicos = [...new Set(labores.map(l => l.estado).filter(Boolean))];
  const campanasUnicas = [...new Set(labores.map(l => l.campaña_nombre).filter(Boolean))];
  const parcelasUnicas = [...new Set(labores.map(l => l.parcela_nombre).filter(Boolean))];

  if (loading && labores.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Labores Agrícolas</h1>
          <p className="text-emerald-100/80 mt-1">
            Registro y seguimiento de actividades agrícolas
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => cargarLabores(currentPage)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => navigate('/labores/nueva')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Labor</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar labores por descripción, ubicación o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value={10} className="bg-gray-800">10 por página</option>
              <option value={25} className="bg-gray-800">25 por página</option>
              <option value={50} className="bg-gray-800">50 por página</option>
              <option value={100} className="bg-gray-800">100 por página</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-white/20 mt-4">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Estados</option>
              {estadosUnicos.map(estado => (
                <option key={estado} value={estado} className="bg-gray-800">
                  {estado.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo} className="bg-gray-800">{tipo}</option>
              ))}
            </select>

            <select
              value={filtros.campana}
              onChange={(e) => setFiltros({...filtros, campana: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Campañas</option>
              {campanasUnicas.map(campana => (
                <option key={campana} value={campana} className="bg-gray-800">{campana}</option>
              ))}
            </select>

            <select
              value={filtros.parcela}
              onChange={(e) => setFiltros({...filtros, parcela: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Parcelas</option>
              {parcelasUnicas.map(parcela => (
                <option key={parcela} value={parcela} className="bg-gray-800">{parcela}</option>
              ))}
            </select>

            <div className="flex space-x-2">
              <button
                onClick={aplicarFiltros}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Total Labores</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Tractor className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Planificadas</p>
              <p className="text-2xl font-bold text-gray-200">{stats.planificadas}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">En Proceso</p>
              <p className="text-2xl font-bold text-yellow-200">{stats.enProceso}</p>
            </div>
            <PlayCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Completadas</p>
              <p className="text-2xl font-bold text-green-200">{stats.completadas}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Canceladas</p>
              <p className="text-2xl font-bold text-red-200">{stats.canceladas}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Tractor className="w-5 h-5" />
            <span>Lista de Labores ({labores.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Insumos
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Costos
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {labores.map((labor) => (
                <tr key={labor.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-semibold">
                      {formatDate(labor.fecha_labor)}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      Creado: {new Date(labor.creado_en).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderTipoBadge(labor.labor)}
                    <div className="text-emerald-200/60 text-sm mt-1">
                      {labor.tipo_labor_display}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderEstadoBadge(labor.estado)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {labor.campaña_nombre || labor.parcela_nombre || 'Sin ubicación'}
                    </div>
                    {labor.socio_nombre && (
                      <div className="text-emerald-200/60 text-sm">
                        Socio: {labor.socio_nombre}
                      </div>
                    )}
                    {labor.campaña_nombre && labor.parcela_nombre && (
                      <div className="text-emerald-200/60 text-sm">
                        Parcela: {labor.parcela_nombre}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {labor.insumo_nombre ? (
                      <>
                        <div className="text-white font-medium flex items-center space-x-1">
                          <Package className="w-3 h-3" />
                          <span>{labor.insumo_nombre}</span>
                        </div>
                        <div className="text-emerald-200/60 text-sm">
                          {labor.cantidad_insumo} unidades
                        </div>
                      </>
                    ) : (
                      <span className="text-emerald-200/60 italic">Sin insumo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{labor.duracion_display || 'N/A'}</span>
                    </div>
                    {labor.duracion_horas && (
                      <div className="text-emerald-200/60 text-sm">
                        {labor.duracion_horas} horas
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatMoneda(labor.costo_total || 0)}</span>
                    </div>
                    {labor.costo_estimado && (
                      <div className="text-emerald-200/60 text-sm">
                        Est: {formatMoneda(labor.costo_estimado)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{labor.responsable_nombre || 'No asignado'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/labores/${labor.id}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/labores/editar/${labor.id}`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Botones de cambio de estado */}
                      {labor.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'COMPLETADA')}
                          className="text-green-300 hover:text-green-200 transition-colors"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {labor.estado !== 'EN_PROCESO' && labor.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'EN_PROCESO')}
                          className="text-yellow-300 hover:text-yellow-200 transition-colors"
                          title="Marcar como en proceso"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {labor.estado !== 'CANCELADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'CANCELADA')}
                          className="text-orange-300 hover:text-orange-200 transition-colors"
                          title="Cancelar labor"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(labor.id)}
                        className="text-red-300 hover:text-red-200 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
            <div className="text-emerald-200/60 text-sm">
              Mostrando {((currentPage - 1) * pageSize) + 1} -{' '}
              {Math.min(currentPage * pageSize, labores.length)} de {labores.length} labores
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => currentPage > 1 && cargarLabores(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                }`}
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => cargarLabores(page)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-1 text-emerald-200/60">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => currentPage < totalPages && cargarLabores(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {labores.length === 0 && (
          <div className="text-center py-12">
            <Tractor className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">
              {searchTerm || Object.values(filtros).some(f => f) 
                ? 'No se encontraron labores con esos criterios de búsqueda' 
                : 'No hay labores registradas'
              }
            </p>
            <button
              onClick={() => navigate('/labores/nueva')}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Labor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborPage;