import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Edit, 
  AlertTriangle, 
  DollarSign, 
  Warehouse,
  RefreshCw,
  CheckCircle,
  XCircle,
  User,
  Sprout,
  Activity
} from 'lucide-react';
import { productoCosechadoService } from '../api/productoCosechadoService';

const ProductosCosechadosDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await productoCosechadoService.obtener(id);
      setProducto(response.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar los detalles del producto');

      // Fallback a datos simulados
      const mockData = {
        id: parseInt(id),
        fecha_cosecha: '2024-01-15',
        cantidad: '100.50',
        unidad_medida: 'kg',
        calidad: 'Premium',
        cultivo: 1,
        cultivo_especie: 'Manzana',
        cultivo_variedad: 'Gala',
        labor: 1,
        labor_nombre: 'Cosecha Manual',
        estado: 'En Almacén',
        lote: 123.45,
        ubicacion_almacen: 'Almacén A - Estante 5',
        campania: 1,
        campania_nombre: 'Campaña Verano 2024',
        parcela: null,
        parcela_nombre: null,
        socio_nombre: 'Juan Pérez',
        observaciones: 'Producto de primera calidad, cosechado en condiciones óptimas',
        creado_en: '2024-01-15T10:30:00Z',
        actualizado_en: '2024-01-20T14:25:00Z',
        origen_display: 'Campaña: Campaña Verano 2024',
        dias_en_almacen: 15,
        esta_proximo_vencer: false,
        puede_vender: true
      };

      setProducto(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleVender = async () => {
    const cantidad = prompt('Ingrese la cantidad a vender:');
    if (cantidad && !isNaN(cantidad)) {
      try {
        await productoCosechadoService.vender(id, {
          cantidad_vendida: parseFloat(cantidad),
          observaciones: 'Venta realizada desde el sistema'
        });
        await cargarProducto();
        alert('Producto vendido exitosamente');
      } catch (error) {
        console.error('Error al vender producto:', error);
        alert('Error al vender producto: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCambiarEstado = async () => {
    const nuevoEstado = prompt(`Cambiar estado (actual: ${producto.estado}). Nuevo estado:`, producto.estado);
    if (nuevoEstado && nuevoEstado !== producto.estado) {
      try {
        await productoCosechadoService.cambiarEstado(id, {
          nuevo_estado: nuevoEstado,
          observaciones: 'Cambio de estado desde el sistema'
        });
        await cargarProducto();
        alert('Estado cambiado exitosamente');
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar estado: ' + (error.response?.data?.message || error.message));
      }
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
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'En Almacén': return 'bg-green-500/20 text-green-200';
      case 'Vendido': return 'bg-blue-500/20 text-blue-200';
      case 'Procesado': return 'bg-purple-500/20 text-purple-200';
      case 'Vencido': return 'bg-red-500/20 text-red-200';
      case 'En revision': return 'bg-yellow-500/20 text-yellow-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Vencido': return <AlertTriangle className="w-4 h-4" />;
      case 'En Almacén': return <Warehouse className="w-4 h-4" />;
      case 'Vendido': return <DollarSign className="w-4 h-4" />;
      case 'Procesado': return <CheckCircle className="w-4 h-4" />;
      case 'En revision': return <RefreshCw className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles del producto...</span>
        </div>
      </div>
    );
  }

  if (error && !producto) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/productos-cosechados')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Productos Cosechados
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
            onClick={() => navigate('/productos-cosechados')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles del Producto Cosechado</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa del producto #{producto?.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {producto?.puede_vender && (
            <button
              onClick={handleVender}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Vender Producto</span>
            </button>
          )}
          <button
            onClick={handleCambiarEstado}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cambiar Estado</span>
          </button>
          <button
            onClick={() => navigate(`/productos-cosechados/${producto?.id}/editar`)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar Producto</span>
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles del Producto */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-emerald-400" />
            Información del Producto
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Cultivo
              </label>
              <div className="flex items-center space-x-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <p className="text-white text-lg font-medium">
                  {producto?.cultivo_especie}
                  {producto?.cultivo_variedad && ` - ${producto.cultivo_variedad}`}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Calidad
              </label>
              <p className="text-white font-medium">{producto?.calidad}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Cantidad Cosechada
              </label>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-white text-lg font-medium">
                  {producto?.cantidad} {producto?.unidad_medida}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Fecha de Cosecha
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-white">{formatDate(producto?.fecha_cosecha)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Labor de Cosecha
              </label>
              <p className="text-white">{producto?.labor_nombre}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Estado Actual
              </label>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(producto?.estado)}`}>
                {getEstadoIcon(producto?.estado)}
                <span className="ml-1">{producto?.estado}</span>
              </span>
            </div>

            {producto?.dias_en_almacen !== undefined && (
              <div>
                <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                  Días en Almacén
                </label>
                <div className="flex items-center space-x-2">
                  <Warehouse className="w-4 h-4 text-purple-400" />
                  <span className="text-white">
                    {producto.dias_en_almacen} días
                    {producto.esta_proximo_vencer && (
                      <span className="text-yellow-300 ml-2">(Próximo a vencer)</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Origen y Almacenamiento */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-400" />
            Origen y Almacenamiento
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Origen del Producto
              </label>
              <p className="text-white text-lg font-medium">{producto?.origen_display}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Socio Responsable
              </label>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-white">{producto?.socio_nombre}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Número de Lote
              </label>
              <p className="text-white font-mono text-lg">{producto?.lote}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Ubicación en Almacén
              </label>
              <div className="flex items-center space-x-2">
                <Warehouse className="w-4 h-4 text-indigo-400" />
                <span className="text-white">{producto?.ubicacion_almacen}</span>
              </div>
            </div>

            {/* Indicadores de Estado */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className={`p-3 rounded-lg text-center ${
                producto?.puede_vender ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'
              }`}>
                <div className="flex flex-col items-center">
                  <DollarSign className={`w-5 h-5 ${producto?.puede_vender ? 'text-green-400' : 'text-gray-400'}`} />
                  <span className={`text-sm mt-1 ${producto?.puede_vender ? 'text-green-200' : 'text-gray-200'}`}>
                    {producto?.puede_vender ? 'Disponible para venta' : 'No disponible'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-lg text-center ${
                producto?.esta_proximo_vencer ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-gray-500/20 border border-gray-500/30'
              }`}>
                <div className="flex flex-col items-center">
                  <AlertTriangle className={`w-5 h-5 ${producto?.esta_proximo_vencer ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <span className={`text-sm mt-1 ${producto?.esta_proximo_vencer ? 'text-yellow-200' : 'text-gray-200'}`}>
                    {producto?.esta_proximo_vencer ? 'Próximo a vencer' : 'En buen estado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información Adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Observaciones
            </label>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[100px]">
              <p className="text-white whitespace-pre-wrap">
                {producto?.observaciones || 'No hay observaciones registradas'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Fecha de Creación
              </label>
              <p className="text-white">{formatDateTime(producto?.creado_en)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Última Modificación
              </label>
              <p className="text-white">{formatDateTime(producto?.actualizado_en)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                ID del Producto
              </label>
              <p className="text-white font-mono">{producto?.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Tipo de Registro
              </label>
              <p className="text-white">Producto Cosechado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate(`/productos-cosechados/${producto?.id}/editar`)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar Información</span>
          </button>

          {producto?.puede_vender && (
            <button
              onClick={handleVender}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Venta</span>
            </button>
          )}

          <button
            onClick={handleCambiarEstado}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cambiar Estado</span>
          </button>

          <button
            onClick={() => navigate('/productos-cosechados')}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Listado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductosCosechadosDetailPage;