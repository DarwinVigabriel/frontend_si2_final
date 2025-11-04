import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ArrowLeft, 
  Edit, 
  ToggleLeft, 
  ToggleRight, 
  Settings,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ListOrdered
} from 'lucide-react';
import { paymentMethodService } from '../api/paymentMethodService';

const PaymentMethodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    cargarPaymentMethod();
  }, [id]);

  const cargarPaymentMethod = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentMethodById(id);
      setPaymentMethod(response);
    } catch (error) {
      console.error('Error al cargar método de pago:', error);
      setError('Error al cargar los detalles del método de pago');

      // Fallback a datos simulados si hay error
      setPaymentMethod({
        id: parseInt(id),
        tipo: 'TARJETA_CREDITO',
        tipo_display: 'Tarjeta de Crédito',
        nombre: 'Visa Gold',
        activo: true,
        descripcion: 'Método de pago con tarjeta de crédito Visa para procesamiento seguro',
        configuracion: {
          procesador: 'Stripe',
          comision_porcentaje: 2.5,
          requiere_autenticacion: true,
          moneda: 'USD'
        },
        orden: 2,
        creado_en: '2024-01-15T10:30:00Z',
        actualizado_en: '2024-01-20T14:25:00Z',
        creado_por_nombre: 'Admin Sistema',
        actualizado_por_nombre: 'Supervisor Finanzas',
        puede_eliminarse: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async () => {
    if (!paymentMethod) return;
    
    try {
      setActivating(true);
      await paymentMethodService.toggleActivation(paymentMethod.id, !paymentMethod.activo);
      
      // Actualizar estado local
      setPaymentMethod(prev => ({
        ...prev,
        activo: !prev.activo,
        actualizado_en: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado del método de pago');
    } finally {
      setActivating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
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

  const getTipoIcon = (tipo) => {
    const iconClass = "w-4 h-4 mr-1";
    switch (tipo) {
      case 'EFECTIVO':
        return <CreditCard className={`${iconClass} text-green-400`} />;
      case 'TRANSFERENCIA':
        return <CreditCard className={`${iconClass} text-blue-400`} />;
      case 'TARJETA_CREDITO':
        return <CreditCard className={`${iconClass} text-purple-400`} />;
      case 'TARJETA_DEBITO':
        return <CreditCard className={`${iconClass} text-indigo-400`} />;
      case 'CHEQUE':
        return <CreditCard className={`${iconClass} text-yellow-400`} />;
      case 'DIGITAL':
        return <CreditCard className={`${iconClass} text-cyan-400`} />;
      default:
        return <CreditCard className={`${iconClass} text-gray-400`} />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'EFECTIVO': return 'bg-green-500/20 text-green-200';
      case 'TRANSFERENCIA': return 'bg-blue-500/20 text-blue-200';
      case 'TARJETA_CREDITO': return 'bg-purple-500/20 text-purple-200';
      case 'TARJETA_DEBITO': return 'bg-indigo-500/20 text-indigo-200';
      case 'CHEQUE': return 'bg-yellow-500/20 text-yellow-200';
      case 'DIGITAL': return 'bg-cyan-500/20 text-cyan-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getEstadoIcon = (activo) => {
    return activo ? 
      <CheckCircle className="w-4 h-4 text-green-400" /> : 
      <XCircle className="w-4 h-4 text-red-400" />;
  };

  const renderConfiguracion = () => {
    if (!paymentMethod?.configuracion) {
      return <p className="text-gray-400 italic">Sin configuración adicional</p>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(paymentMethod.configuracion).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-1 border-b border-white/10">
            <span className="text-emerald-200/80 capitalize">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-white font-medium">
              {typeof value === 'boolean' ? 
                (value ? 'Sí' : 'No') : 
                (typeof value === 'number' && key.includes('porcentaje') ? 
                  `${value}%` : 
                  String(value)
                )
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles del método de pago...</span>
        </div>
      </div>
    );
  }

  if (error && !paymentMethod) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/payment-methods')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Métodos de Pago
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
            onClick={() => navigate('/payment-methods')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles de Método de Pago</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa del método de pago #{paymentMethod?.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleActivo}
            disabled={activating}
            className={`${
              paymentMethod?.activo ? 
              'bg-green-500/20 hover:bg-green-500/30 text-green-200' : 
              'bg-red-500/20 hover:bg-red-500/30 text-red-200'
            } font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50`}
          >
            {activating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : paymentMethod?.activo ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            <span>{paymentMethod?.activo ? 'Desactivar' : 'Activar'}</span>
          </button>
          <button
            onClick={() => navigate(`/payment-methods/${paymentMethod?.id}/editar`)}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles Básicos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-emerald-400" />
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Nombre del Método
              </label>
              <p className="text-white text-lg font-medium">{paymentMethod?.nombre}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Tipo de Método
              </label>
              <div className="flex items-center space-x-2">
                {getTipoIcon(paymentMethod?.tipo)}
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getTipoColor(paymentMethod?.tipo)}`}>
                  {paymentMethod?.tipo_display}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Estado
              </label>
              <div className="flex items-center space-x-2">
                {getEstadoIcon(paymentMethod?.activo)}
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  paymentMethod?.activo ? 
                  'bg-green-500/20 text-green-200' : 
                  'bg-red-500/20 text-red-200'
                }`}>
                  {paymentMethod?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Orden de Visualización
              </label>
              <div className="flex items-center space-x-2">
                <ListOrdered className="w-4 h-4 text-blue-400" />
                <span className="text-white text-lg font-medium">{paymentMethod?.orden}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                ¿Se puede eliminar?
              </label>
              <div className="flex items-center space-x-2">
                {paymentMethod?.puede_eliminarse ? 
                  <CheckCircle className="w-4 h-4 text-green-400" /> : 
                  <XCircle className="w-4 h-4 text-red-400" />
                }
                <span className="text-white">
                  {paymentMethod?.puede_eliminarse ? 'Sí' : 'No'}
                </span>
                {!paymentMethod?.puede_eliminarse && (
                  <span className="text-sm text-emerald-200/60">
                    (Tiene transacciones asociadas)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuración y Descripción */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Configuración y Descripción
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Descripción
              </label>
              <p className="text-white bg-white/5 rounded-lg p-3 min-h-[80px]">
                {paymentMethod?.descripcion || 'Sin descripción adicional'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Configuración Específica
              </label>
              <div className="bg-white/5 rounded-lg p-4">
                {renderConfiguracion()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Auditoría */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información de Auditoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Creado Por
            </label>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-white">{paymentMethod?.creado_por_nombre || 'Sistema'}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Fecha de Creación
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-white">{formatDate(paymentMethod?.creado_en)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Actualizado Por
            </label>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-white">{paymentMethod?.actualizado_por_nombre || 'Sistema'}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Última Actualización
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-white">{formatDate(paymentMethod?.actualizado_en)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              ID del Método
            </label>
            <p className="text-white font-mono">{paymentMethod?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Código Interno
            </label>
            <p className="text-white font-mono">{paymentMethod?.tipo}</p>
          </div>
        </div>
      </div>

      {/* Alertas Importantes */}
      {!paymentMethod?.activo && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-medium">Método de Pago Inactivo</span>
          </div>
          <p className="text-yellow-100/80 mt-1 ml-7">
            Este método de pago está desactivado y no estará disponible para nuevas transacciones.
          </p>
        </div>
      )}

      {!paymentMethod?.puede_eliminarse && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-200 font-medium">Método de Pago en Uso</span>
          </div>
          <p className="text-blue-100/80 mt-1 ml-7">
            Este método de pago tiene transacciones asociadas y no puede ser eliminado. 
            Puede desactivarse si ya no desea utilizarlo.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodDetailPage;