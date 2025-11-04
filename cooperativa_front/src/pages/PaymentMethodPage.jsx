import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';
import { paymentMethodService } from '../api/paymentMethodService';

const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    tipo: '',
    activo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarMetodosPago();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(response.results || response || []);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      // Fallback a datos simulados si hay error
      setPaymentMethods([
        {
          id: 1,
          nombre: 'Efectivo',
          tipo: 'EFECTIVO',
          activo: true,
          orden: 1,
          descripcion: 'Pago en efectivo directo',
          configuracion: null,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
          puede_eliminarse: false
        },
        {
          id: 2,
          nombre: 'Transferencia Bancaria',
          tipo: 'TRANSFERENCIA',
          activo: true,
          orden: 2,
          descripcion: 'Transferencia entre cuentas bancarias',
          configuracion: null,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
          puede_eliminarse: false
        },
        {
          id: 3,
          nombre: 'Tarjeta de Crédito',
          tipo: 'TARJETA_CREDITO',
          activo: false,
          orden: 3,
          descripcion: 'Pago con tarjeta de crédito',
          configuracion: {
            procesador: 'Stripe',
            comision_porcentaje: 3.5
          },
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
          puede_eliminarse: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivarDesactivar = async (methodId, activoActual) => {
    const accion = activoActual ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${accion} este método de pago?`)) {
      try {
        await paymentMethodService.activarDesactivar(methodId, !activoActual);
        await cargarMetodosPago();
      } catch (error) {
        console.error(`Error al ${accion} método de pago:`, error);
        alert(`Error al ${accion} método de pago`);
      }
    }
  };

  const handleDelete = async (methodId, methodName) => {
    if (window.confirm(`¿Está seguro de eliminar el método de pago "${methodName}"?`)) {
      try {
        await paymentMethodService.deletePaymentMethod(methodId);
        await cargarMetodosPago();
      } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        alert('Error al eliminar método de pago');
      }
    }
  };

  const handleReordenar = async (methodId, nuevaDireccion) => {
    try {
      // Obtener el método actual
      const metodoActual = paymentMethods.find(m => m.id === methodId);
      const indiceActual = paymentMethods.findIndex(m => m.id === methodId);
      
      if ((nuevaDireccion === 'up' && indiceActual === 0) || 
          (nuevaDireccion === 'down' && indiceActual === paymentMethods.length - 1)) {
        return; // No hacer nada si está en el límite
      }

      const indiceObjetivo = nuevaDireccion === 'up' ? indiceActual - 1 : indiceActual + 1;
      const metodoObjetivo = paymentMethods[indiceObjetivo];

      // Intercambiar órdenes
      await paymentMethodService.updatePaymentMethod(methodId, {
        ...metodoActual,
        orden: metodoObjetivo.orden
      });

      await paymentMethodService.updatePaymentMethod(metodoObjetivo.id, {
        ...metodoObjetivo,
        orden: metodoActual.orden
      });

      await cargarMetodosPago();
    } catch (error) {
      console.error('Error al reordenar:', error);
      alert('Error al reordenar método de pago');
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'EFECTIVO': return 'bg-green-500/20 text-green-200';
      case 'TRANSFERENCIA': return 'bg-blue-500/20 text-blue-200';
      case 'TARJETA_CREDITO': return 'bg-purple-500/20 text-purple-200';
      case 'TARJETA_DEBITO': return 'bg-orange-500/20 text-orange-200';
      case 'CHEQUE': return 'bg-yellow-500/20 text-yellow-200';
      case 'DIGITAL': return 'bg-teal-500/20 text-teal-200';
      case 'OTRO': return 'bg-gray-500/20 text-gray-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'EFECTIVO': return '💰';
      case 'TRANSFERENCIA': return '🏦';
      case 'TARJETA_CREDITO': return '💳';
      case 'TARJETA_DEBITO': return '💳';
      case 'CHEQUE': return '📄';
      case 'DIGITAL': return '📱';
      case 'OTRO': return '🔧';
      default: return '❓';
    }
  };

  const getTipoDisplay = (tipo) => {
    const tipos = {
      'EFECTIVO': 'Efectivo',
      'TRANSFERENCIA': 'Transferencia',
      'TARJETA_CREDITO': 'Tarjeta Crédito',
      'TARJETA_DEBITO': 'Tarjeta Débito',
      'CHEQUE': 'Cheque',
      'DIGITAL': 'Digital',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = searchTerm === '' ||
      method.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoDisplay(method.tipo)?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = filtros.tipo === '' || method.tipo === filtros.tipo;
    const matchesActivo = filtros.activo === '' || 
      (filtros.activo === 'activo' && method.activo) ||
      (filtros.activo === 'inactivo' && !method.activo);

    return matchesSearch && matchesTipo && matchesActivo;
  });

  const tiposUnicos = [...new Set(paymentMethods.map(m => m.tipo).filter(Boolean))];

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
          <h1 className="text-2xl font-bold text-white">Gestión de Métodos de Pago</h1>
          <p className="text-emerald-100/80 mt-1">
            Administrar métodos de pago disponibles para transacciones
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/payment-methods/nuevo')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Método</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar métodos de pago por nombre, descripción o tipo..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20 mt-4">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo} className="bg-gray-800">
                  {getTipoDisplay(tipo)}
                </option>
              ))}
            </select>

            <select
              value={filtros.activo}
              onChange={(e) => setFiltros({...filtros, activo: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Estados</option>
              <option value="activo" className="bg-gray-800">Solo Activos</option>
              <option value="inactivo" className="bg-gray-800">Solo Inactivos</option>
            </select>

            <button
              onClick={() => setFiltros({tipo: '', activo: ''})}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Total Métodos</p>
              <p className="text-2xl font-bold text-white">{paymentMethods.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Activos</p>
              <p className="text-2xl font-bold text-green-200">
                {paymentMethods.filter(m => m.activo).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Inactivos</p>
              <p className="text-2xl font-bold text-red-200">
                {paymentMethods.filter(m => !m.activo).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Tipos Diferentes</p>
              <p className="text-2xl font-bold text-blue-200">
                {tiposUnicos.length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Métodos de Pago ({filteredMethods.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMethods
                .sort((a, b) => a.orden - b.orden)
                .map((method, index) => (
                <tr key={method.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold bg-emerald-500/20 rounded-full w-8 h-8 flex items-center justify-center">
                        {method.orden}
                      </span>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleReordenar(method.id, 'up')}
                          disabled={index === 0}
                          className={`text-emerald-400 hover:text-emerald-300 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Mover arriba"
                        >
                          <ArrowUpDown className="w-3 h-3 rotate-180" />
                        </button>
                        <button
                          onClick={() => handleReordenar(method.id, 'down')}
                          disabled={index === filteredMethods.length - 1}
                          className={`text-emerald-400 hover:text-emerald-300 transition-colors ${index === filteredMethods.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Mover abajo"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white font-semibold">
                        {method.nombre}
                      </div>
                      {method.descripcion && (
                        <div className="text-emerald-200/60 text-sm mt-1 max-w-md">
                          {method.descripcion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(method.tipo)}`}>
                      <span className="mr-2">{getTipoIcon(method.tipo)}</span>
                      {getTipoDisplay(method.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${method.activo ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                      {method.activo ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white text-sm">
                      {formatDate(method.creado_en)}
                    </div>
                    <div className="text-emerald-200/60 text-xs">
                      Actualizado: {formatDate(method.actualizado_en)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/payment-methods/${method.id}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/payment-methods/${method.id}/editar`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActivarDesactivar(method.id, method.activo)}
                        className={`transition-colors ${method.activo ? 'text-orange-300 hover:text-orange-200' : 'text-green-300 hover:text-green-200'}`}
                        title={method.activo ? 'Desactivar' : 'Activar'}
                      >
                        {method.activo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      {method.puede_eliminarse && (
                        <button
                          onClick={() => handleDelete(method.id, method.nombre)}
                          className="text-red-300 hover:text-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">
              {searchTerm ? 'No se encontraron métodos de pago con ese criterio de búsqueda' : 'No hay métodos de pago registrados'}
            </p>
            <button
              onClick={() => navigate('/payment-methods/nuevo')}
              className="mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Método</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodPage;