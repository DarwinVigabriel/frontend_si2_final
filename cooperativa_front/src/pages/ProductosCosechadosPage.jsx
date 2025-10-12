import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  DollarSign, 
  Warehouse,
  TrendingUp,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { productoCosechadoService, ESTADOS_PRODUCTO } from '../api/productoCosechadoService';

const ProductosCosechadosPage = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    campania: '',
    parcela: '',
    cultivo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarEstados();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoCosechadoService.listar();
      setProductos(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar productos cosechados:', error);
      // Fallback a datos simulados si hay error
      setProductos([
        {
          id: 1,
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
          observaciones: 'Producto de primera calidad',
          creado_en: '2024-01-15T10:30:00Z',
          origen_display: 'Campaña: Campaña Verano 2024',
          dias_en_almacen: 15,
          esta_proximo_vencer: false,
          puede_vender: true
        },
        {
          id: 2,
          fecha_cosecha: '2024-01-10',
          cantidad: '75.25',
          unidad_medida: 'kg',
          calidad: 'Estándar',
          cultivo: 2,
          cultivo_especie: 'Naranja',
          cultivo_variedad: 'Valencia',
          labor: 2,
          labor_nombre: 'Cosecha Mecánica',
          estado: 'Vendido',
          lote: 123.46,
          ubicacion_almacen: 'Almacén B - Estante 3',
          campania: null,
          campania_nombre: null,
          parcela: 1,
          parcela_nombre: 'Parcela Norte',
          socio_nombre: 'María García',
          observaciones: 'Vendido a mercado local',
          creado_en: '2024-01-10T08:15:00Z',
          origen_display: 'Parcela: Parcela Norte',
          dias_en_almacen: 20,
          esta_proximo_vencer: false,
          puede_vender: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstados = async () => {
    try {
      const response = await productoCosechadoService.estadosDisponibles();
      setEstados(response.data);
    } catch (error) {
      console.error('Error al cargar estados:', error);
      setEstados(ESTADOS_PRODUCTO);
    }
  };

  const handleVenderProducto = async (id) => {
    const cantidad = prompt('Ingrese la cantidad a vender:');
    if (cantidad && !isNaN(cantidad)) {
      try {
        await productoCosechadoService.vender(id, {
          cantidad_vendida: parseFloat(cantidad),
          observaciones: 'Venta realizada desde el sistema'
        });
        await cargarProductos();
      } catch (error) {
        console.error('Error al vender producto:', error);
        alert('Error al vender producto: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = prompt(`Cambiar estado (actual: ${estadoActual}). Nuevo estado:`, estadoActual);
    if (nuevoEstado && nuevoEstado !== estadoActual) {
      try {
        await productoCosechadoService.cambiarEstado(id, {
          nuevo_estado: nuevoEstado,
          observaciones: 'Cambio de estado desde el sistema'
        });
        await cargarProductos();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar estado: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto cosechado?')) {
      try {
        await productoCosechadoService.eliminar(id);
        await cargarProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto');
      }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = searchTerm === '' ||
      producto.cultivo_especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.cultivo_variedad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.lote?.toString().includes(searchTerm) ||
      producto.ubicacion_almacen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.socio_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtros.estado === '' || producto.estado === filtros.estado;
    const matchesCampania = filtros.campania === '' || producto.campania_nombre === filtros.campania;
    const matchesParcela = filtros.parcela === '' || producto.parcela_nombre === filtros.parcela;
    const matchesCultivo = filtros.cultivo === '' || producto.cultivo_especie === filtros.cultivo;

    // Filtro por fecha
    let matchesFecha = true;
    if (filtros.fecha_desde) {
      matchesFecha = matchesFecha && producto.fecha_cosecha >= filtros.fecha_desde;
    }
    if (filtros.fecha_hasta) {
      matchesFecha = matchesFecha && producto.fecha_cosecha <= filtros.fecha_hasta;
    }

    return matchesSearch && matchesEstado && matchesCampania && matchesParcela && matchesCultivo && matchesFecha;
  });

  // Obtener valores únicos para los filtros
  const campaniasUnicas = [...new Set(productos.map(p => p.campania_nombre).filter(Boolean))];
  const parcelasUnicas = [...new Set(productos.map(p => p.parcela_nombre).filter(Boolean))];
  const cultivosUnicos = [...new Set(productos.map(p => p.cultivo_especie).filter(Boolean))];

  const getStats = () => {
    const enAlmacen = productos.filter(p => p.estado === 'En Almacén').length;
    const vendidos = productos.filter(p => p.estado === 'Vendido').length;
    const proximosVencer = productos.filter(p => p.esta_proximo_vencer).length;
    const totalCantidad = productos.reduce((sum, p) => sum + parseFloat(p.cantidad || 0), 0);

    return { enAlmacen, vendidos, proximosVencer, totalCantidad };
  };

  const stats = getStats();

  if (loading) {
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
          <h1 className="text-2xl font-bold text-white">Productos Cosechados</h1>
          <p className="text-emerald-100/80 mt-1">
            Gestión de productos cosechados por campaña y parcela
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/productos-cosechados/nuevo')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos por cultivo, lote, ubicación o socio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 pt-4 border-t border-white/20 mt-4">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Estados</option>
              {estados.map(estado => (
                <option key={estado.valor} value={estado.valor} className="bg-gray-800">
                  {estado.etiqueta}
                </option>
              ))}
            </select>

            <select
              value={filtros.campania}
              onChange={(e) => setFiltros({...filtros, campania: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Campañas</option>
              {campaniasUnicas.map(campania => (
                <option key={campania} value={campania} className="bg-gray-800">{campania}</option>
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

            <select
              value={filtros.cultivo}
              onChange={(e) => setFiltros({...filtros, cultivo: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Cultivos</option>
              {cultivosUnicos.map(cultivo => (
                <option key={cultivo} value={cultivo} className="bg-gray-800">{cultivo}</option>
              ))}
            </select>

            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="Fecha desde"
            />

            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="Fecha hasta"
            />

            <div className="md:col-span-2 lg:col-span-6 flex justify-end">
              <button
                onClick={() => setFiltros({
                  estado: '', campania: '', parcela: '', cultivo: '', fecha_desde: '', fecha_hasta: ''
                })}
                className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-white">{productos.length}</p>
            </div>
            <Package className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">En Almacén</p>
              <p className="text-2xl font-bold text-green-200">{stats.enAlmacen}</p>
            </div>
            <Warehouse className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-yellow-200">{stats.proximosVencer}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Cantidad Total</p>
              <p className="text-2xl font-bold text-blue-200">{stats.totalCantidad.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Inventario de Productos Cosechados ({filteredProductos.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Fecha Cosecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Lote / Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white font-semibold">
                        {producto.cultivo_especie}
                      </div>
                      {producto.cultivo_variedad && (
                        <div className="text-emerald-200/60 text-sm">
                          Variedad: {producto.cultivo_variedad}
                        </div>
                      )}
                      <div className="text-emerald-200/60 text-sm">
                        Calidad: {producto.calidad}
                      </div>
                      <div className="text-emerald-200/60 text-sm">
                        Socio: {producto.socio_nombre}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {producto.origen_display}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      Labor: {producto.labor_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {producto.cantidad} {producto.unidad_medida}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      {producto.dias_en_almacen} días en almacén
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {formatDate(producto.fecha_cosecha)}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      {producto.esta_proximo_vencer && (
                        <span className="text-yellow-300">Próximo a vencer</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      Lote: {producto.lote}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      {producto.ubicacion_almacen}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(producto.estado)}`}>
                      {getEstadoIcon(producto.estado)}
                      <span className="ml-1">{producto.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/productos-cosechados/${producto.id}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/productos-cosechados/${producto.id}/editar`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {producto.puede_vender && (
                        <button
                          onClick={() => handleVenderProducto(producto.id)}
                          className="text-green-300 hover:text-green-200 transition-colors"
                          title="Vender producto"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCambiarEstado(producto.id, producto.estado)}
                        className="text-orange-300 hover:text-orange-200 transition-colors"
                        title="Cambiar estado"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
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

        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">
              {searchTerm ? 'No se encontraron productos con ese criterio de búsqueda' : 'No hay productos cosechados registrados'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosCosechadosPage;