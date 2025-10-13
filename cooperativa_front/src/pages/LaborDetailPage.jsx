// src/pages/LaborDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  User, 
  Edit,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  XCircle,
  FileText
} from 'lucide-react';
import laborService from '../api/labor';
import { 
  getEstadoBadgeVariant, 
  getTipoLaborBadgeVariant, 
  formatDuracion, 
  formatMoneda 
} from '../utils/laborUtils';

const LaborDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [labor, setLabor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('informacion');

  useEffect(() => {
    cargarLabor();
  }, [id]);

  const cargarLabor = async () => {
    try {
      setLoading(true);
      const response = await laborService.getLaborById(id);
      setLabor(response);
    } catch (error) {
      console.error('Error al cargar labor:', error);
      setError('Error al cargar los detalles de la labor');

      // Datos de ejemplo para desarrollo
      const mockData = {
        id: parseInt(id),
        fecha_labor: '2024-01-15',
        labor: 'SIEMBRA',
        tipo_labor_display: 'Siembra',
        estado: 'COMPLETADA',
        campaña_nombre: 'Campaña Maíz 2024',
        parcela_nombre: 'Parcela Norte',
        socio_nombre: 'Juan Pérez',
        insumo_nombre: 'Semilla Maíz Híbrido',
        cantidad_insumo: 50,
        descripcion: 'Siembra de maíz en parcela norte con sembradora mecánica. Se utilizó semilla híbrida de alta productividad.',
        observaciones: 'Tierra en buen estado, clima favorable. Se completó en el tiempo estimado.',
        costo_estimado: 1500,
        duracion_horas: 8,
        duracion_display: '8 horas',
        costo_total: 1800,
        responsable_nombre: 'María García',
        creado_en: '2024-01-10T08:00:00Z',
        actualizado_en: '2024-01-15T18:00:00Z',
        puede_descontar_insumo: true,
        // Campos adicionales para mostrar
        campaña: 1,
        parcela: 1,
        insumo: 1,
        responsable: 1
      };
      setLabor(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!window.confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado.replace('_', ' ')}"?`)) {
      return;
    }

    try {
      await laborService.cambiarEstado(id, nuevoEstado);
      cargarLabor(); // Recargar datos
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  };

  const renderEstadoBadge = (estado) => {
    const variant = getEstadoBadgeVariant(estado);
    const iconos = {
      'PLANIFICADA': <Clock className="w-4 h-4" />,
      'EN_PROCESO': <PlayCircle className="w-4 h-4" />,
      'COMPLETADA': <CheckCircle className="w-4 h-4" />,
      'CANCELADA': <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-${variant}/20 text-${variant}-200`}>
        {iconos[estado]}
        <span className="ml-1">{estado.replace('_', ' ')}</span>
      </span>
    );
  };

  const renderTipoBadge = (tipo) => {
    const variant = getTipoLaborBadgeVariant(tipo);
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-${variant}/20 text-${variant}-200`}>
        {tipo}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles de la labor...</span>
        </div>
      </div>
    );
  }

  if (error && !labor) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/labores')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Labores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/labores')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles de la Labor Agrícola</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa de la labor #{labor?.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/labores/editar/${labor?.id}`)}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar Labor</span>
          </button>
        </div>
      </div>

      {/* Alertas de Acción Rápida */}
      {labor?.estado !== 'COMPLETADA' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 font-medium">Acciones Rápidas</span>
            </div>
            <div className="flex space-x-2">
              {labor?.estado !== 'EN_PROCESO' && labor?.estado !== 'COMPLETADA' && (
                <button
                  onClick={() => handleCambiarEstado('EN_PROCESO')}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 text-sm font-medium py-1 px-3 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <PlayCircle className="w-3 h-3" />
                  <span>En Proceso</span>
                </button>
              )}
              {labor?.estado !== 'COMPLETADA' && (
                <button
                  onClick={() => handleCambiarEstado('COMPLETADA')}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-200 text-sm font-medium py-1 px-3 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Completar</span>
                </button>
              )}
              {labor?.estado !== 'CANCELADA' && (
                <button
                  onClick={() => handleCambiarEstado('CANCELADA')}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium py-1 px-3 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs de Navegación */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
        <div className="border-b border-white/20">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('informacion')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'informacion'
                  ? 'border-emerald-500 text-emerald-200'
                  : 'border-transparent text-emerald-200/60 hover:text-emerald-200 hover:border-white/30'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Información General</span>
            </button>
            <button
              onClick={() => setActiveTab('recursos')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'recursos'
                  ? 'border-emerald-500 text-emerald-200'
                  : 'border-transparent text-emerald-200/60 hover:text-emerald-200 hover:border-white/30'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Recursos y Costos</span>
            </button>
            <button
              onClick={() => setActiveTab('auditoria')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'auditoria'
                  ? 'border-emerald-500 text-emerald-200'
                  : 'border-transparent text-emerald-200/60 hover:text-emerald-200 hover:border-white/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Auditoría</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Información General */}
          {activeTab === 'informacion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Tractor className="w-5 h-5 mr-2 text-emerald-400" />
                    Información Básica
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Fecha de Labor
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <p className="text-white text-lg font-medium">{formatDate(labor?.fecha_labor)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Tipo de Labor
                      </label>
                      <div className="flex items-center space-x-2">
                        {renderTipoBadge(labor?.labor)}
                        <span className="text-white">{labor?.tipo_labor_display}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Estado
                      </label>
                      {renderEstadoBadge(labor?.estado)}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Descripción
                      </label>
                      <p className="text-white bg-white/5 rounded-lg p-3 min-h-[80px]">
                        {labor?.descripcion || 'Sin descripción'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Observaciones
                      </label>
                      <p className="text-white bg-white/5 rounded-lg p-3 min-h-[60px]">
                        {labor?.observaciones || 'Sin observaciones'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ubicación y Responsable */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                    Ubicación y Responsable
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Ubicación
                      </label>
                      <div className="space-y-2">
                        {labor?.campaña_nombre && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">Campaña: {labor.campaña_nombre}</span>
                          </div>
                        )}
                        {labor?.parcela_nombre && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">Parcela: {labor.parcela_nombre}</span>
                          </div>
                        )}
                        {!labor?.campaña_nombre && !labor?.parcela_nombre && (
                          <span className="text-white">Sin ubicación específica</span>
                        )}
                      </div>
                    </div>

                    {labor?.socio_nombre && (
                      <div>
                        <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                          Socio
                        </label>
                        <p className="text-white">{labor.socio_nombre}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Responsable
                      </label>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{labor?.responsable_nombre || 'No asignado'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Recursos y Costos */}
          {activeTab === 'recursos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recursos Utilizados */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-400" />
                    Recursos Utilizados
                  </h3>

                  <div className="space-y-4">
                    {labor?.insumo_nombre ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                            Insumo
                          </label>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-green-400" />
                            <span className="text-white text-lg font-medium">{labor.insumo_nombre}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                            Cantidad de Insumo
                          </label>
                          <p className="text-white">
                            {labor.cantidad_insumo} unidades
                          </p>
                          {labor.puede_descontar_insumo && (
                            <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-green-500/20 text-green-200">
                              Descuenta del inventario
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-emerald-200/60 italic">No se utilizaron insumos en esta labor</p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Duración
                      </label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-lg font-medium">
                          {labor?.duracion_display || 'N/A'}
                        </span>
                        {labor?.duracion_horas && (
                          <span className="text-emerald-200/60 text-sm">
                            ({labor.duracion_horas} horas)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Costos */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                    Costos
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Costo Estimado
                      </label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-lg font-medium">
                          {formatMoneda(labor?.costo_estimado || 0)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Costo Total
                      </label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-white text-lg font-medium">
                          {formatMoneda(labor?.costo_total || 0)}
                        </span>
                      </div>
                    </div>

                    {labor?.costo_total !== labor?.costo_estimado && labor?.costo_estimado && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-200 text-sm">
                          {labor.costo_total > labor.costo_estimado ? (
                            <>El costo total excede el estimado en {formatMoneda(labor.costo_total - labor.costo_estimado)}</>
                          ) : (
                            <>El costo total es menor al estimado en {formatMoneda(labor.costo_estimado - labor.costo_total)}</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Auditoría */}
          {activeTab === 'auditoria' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de Auditoría */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-400" />
                    Información de Auditoría
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Fecha de Creación
                      </label>
                      <p className="text-white">{formatDateTime(labor?.creado_en)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        Última Modificación
                      </label>
                      <p className="text-white">{formatDateTime(labor?.actualizado_en)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                        ID de la Labor
                      </label>
                      <p className="text-white font-mono">{labor?.id}</p>
                    </div>
                  </div>
                </div>

                {/* Resumen de Estado */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Resumen de Estado
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200/80">Estado Actual:</span>
                      {renderEstadoBadge(labor?.estado)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200/80">Tipo de Labor:</span>
                      {renderTipoBadge(labor?.labor)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200/80">Ubicación:</span>
                      <span className="text-white text-right">
                        {labor?.campaña_nombre || labor?.parcela_nombre || 'No especificada'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200/80">Uso de Insumos:</span>
                      <span className="text-white">
                        {labor?.insumo_nombre ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Acciones Laterales */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* El contenido principal ya está en los tabs */}
        </div>
        
        <div className="space-y-4">
          {/* Acciones Rápidas */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">Acciones</h4>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/labores/editar/${labor?.id}`)}
                className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar Labor</span>
              </button>
              
              <button
                onClick={() => navigate('/labores')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Listado</span>
              </button>
            </div>
          </div>

          {/* Información de Estado */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Estado Actual</h4>
            <div className="text-center">
              {renderEstadoBadge(labor?.estado)}
            </div>
            <p className="text-emerald-200/60 text-sm mt-2 text-center">
              {labor?.estado === 'COMPLETADA' && 'Labor finalizada exitosamente'}
              {labor?.estado === 'EN_PROCESO' && 'Labor en ejecución'}
              {labor?.estado === 'PLANIFICADA' && 'Labor programada para ejecución'}
              {labor?.estado === 'CANCELADA' && 'Labor cancelada'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborDetailPage;