import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, Settings, CheckCircle, XCircle } from 'lucide-react';
import { paymentMethodService } from '../api/paymentMethodService';

const PaymentMethodFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'EFECTIVO',
    activo: true,
    orden: 0,
    descripcion: '',
    configuracion: null
  });

  // Opciones de tipos de método de pago
  const tiposMetodoPago = [
    { value: 'EFECTIVO', label: 'Efectivo', icon: '💰' },
    { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria', icon: '🏦' },
    { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: '💳' },
    { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: '💳' },
    { value: 'CHEQUE', label: 'Cheque', icon: '📄' },
    { value: 'DIGITAL', label: 'Pago Digital', icon: '📱' },
    { value: 'OTRO', label: 'Otro', icon: '🔧' }
  ];

  useEffect(() => {
    if (isEditing) {
      cargarMetodoPago();
    } else {
      // Para nuevos registros, calcular el siguiente orden disponible
      calcularSiguienteOrden();
    }
  }, [id]);

  const cargarMetodoPago = async () => {
    try {
      setLoadingData(true);
      const response = await paymentMethodService.getPaymentMethod(id);
      setFormData({
        nombre: response.nombre || '',
        tipo: response.tipo || 'EFECTIVO',
        activo: response.activo !== undefined ? response.activo : true,
        orden: response.orden || 0,
        descripcion: response.descripcion || '',
        configuracion: response.configuracion || null
      });
    } catch (error) {
      console.error('Error al cargar método de pago:', error);
      alert('Error al cargar los datos del método de pago');
      navigate('/payment-methods');
    } finally {
      setLoadingData(false);
    }
  };

  const calcularSiguienteOrden = async () => {
    try {
      const response = await paymentMethodService.getPaymentMethods(id);
      const metodos = response.results || response || [];
      const maxOrden = metodos.reduce((max, metodo) => Math.max(max, metodo.orden || 0), 0);
      setFormData(prev => ({
        ...prev,
        orden: maxOrden + 1
      }));
    } catch (error) {
      console.error('Error al calcular orden:', error);
      // Si hay error, usar 1 por defecto
      setFormData(prev => ({
        ...prev,
        orden: 1
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Si cambia el tipo, resetear configuración si es necesario
    if (field === 'tipo' && value !== 'TARJETA_CREDITO' && value !== 'TARJETA_DEBITO') {
      setFormData(prev => ({
        ...prev,
        configuracion: null
      }));
    }
  };

  const handleConfiguracionChange = (configField, value) => {
    const nuevaConfiguracion = {
      ...formData.configuracion,
      [configField]: value
    };
    
    setFormData(prev => ({
      ...prev,
      configuracion: nuevaConfiguracion
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo es requerido';
    }

    if (formData.orden < 0) {
      newErrors.orden = 'El orden no puede ser negativo';
    }

    // Validar configuración para tarjetas
    if (['TARJETA_CREDITO', 'TARJETA_DEBITO'].includes(formData.tipo)) {
      if (!formData.configuracion?.procesador) {
        newErrors.configuracion = 'Procesador es requerido para métodos de tarjeta';
      }
      if (!formData.configuracion?.comision_porcentaje) {
        newErrors.configuracion = 'Comisión porcentual es requerida para métodos de tarjeta';
      } else if (isNaN(formData.configuracion.comision_porcentaje) || 
                 formData.configuracion.comision_porcentaje < 0 || 
                 formData.configuracion.comision_porcentaje > 100) {
        newErrors.configuracion = 'La comisión debe ser un porcentaje entre 0 y 100';
      }
    }

    // Validar que la configuración sea JSON válido si se proporciona
    if (formData.configuracion && typeof formData.configuracion !== 'object') {
      try {
        JSON.parse(formData.configuracion);
      } catch (e) {
        newErrors.configuracion = 'La configuración debe ser un JSON válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para el backend
      const methodData = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        activo: formData.activo,
        orden: parseInt(formData.orden),
        descripcion: formData.descripcion.trim() || null,
        configuracion: formData.configuracion || null
      };

      if (isEditing) {
        await paymentMethodService.updatePaymentMethod(id, methodData);
      } else {
        await paymentMethodService.createPaymentMethod(methodData);
      }

      // Redirigir a la lista de métodos de pago
      navigate('/payment-methods');
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
      if (error.response?.data) {
        // Manejar errores del backend
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          setErrors(backendErrors);
        } else if (typeof backendErrors === 'string') {
          setErrors({ general: backendErrors });
        } else {
          setErrors({ general: 'Error desconocido del servidor' });
        }
      } else {
        alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el método de pago. Intente nuevamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    const tipoObj = tiposMetodoPago.find(t => t.value === tipo);
    return tipoObj ? tipoObj.icon : '❓';
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando datos del método de pago...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/payment-methods')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            {isEditing ? 'Modifique la información del método de pago' : 'Complete la información para registrar un nuevo método de pago'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Información Básica</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Nombre *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Efectivo, Transferencia BBVA..."
                />
              </div>
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-400">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {tiposMetodoPago.map(tipo => (
                  <option key={tipo.value} value={tipo.value} className="bg-gray-800">
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-400">{errors.tipo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Orden
              </label>
              <input
                type="number"
                min="0"
                value={formData.orden}
                onChange={(e) => handleInputChange('orden', parseInt(e.target.value) || 0)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="1"
              />
              {errors.orden && (
                <p className="mt-1 text-sm text-red-400">{errors.orden}</p>
              )}
              <p className="mt-1 text-xs text-emerald-200/60">
                Menor número aparece primero en las listas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Estado
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="activo"
                    checked={formData.activo}
                    onChange={() => handleInputChange('activo', true)}
                    className="mr-2 text-emerald-400 focus:ring-emerald-400"
                  />
                  <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-white">Activo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="activo"
                    checked={!formData.activo}
                    onChange={() => handleInputChange('activo', false)}
                    className="mr-2 text-emerald-400 focus:ring-emerald-400"
                  />
                  <XCircle className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-white">Inactivo</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-emerald-200/60">
                Los métodos inactivos no aparecen en los dropdowns de selección
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Descripción adicional del método de pago..."
              />
            </div>
          </div>
        </div>

        {/* Configuración Específica */}
        {['TARJETA_CREDITO', 'TARJETA_DEBITO'].includes(formData.tipo) && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Configuración para Tarjetas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Procesador *
                </label>
                <input
                  type="text"
                  value={formData.configuracion?.procesador || ''}
                  onChange={(e) => handleConfiguracionChange('procesador', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Stripe, PayPal, MercadoPago..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Comisión (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.configuracion?.comision_porcentaje || ''}
                  onChange={(e) => handleConfiguracionChange('comision_porcentaje', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="3.5"
                />
              </div>
            </div>
            {errors.configuracion && (
              <p className="mt-4 text-sm text-red-400">{errors.configuracion}</p>
            )}
          </div>
        )}

        {/* Configuración Avanzada para otros tipos */}
        {!['TARJETA_CREDITO', 'TARJETA_DEBITO'].includes(formData.tipo) && formData.tipo !== 'EFECTIVO' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Configuración Avanzada</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Configuración JSON (Opcional)
              </label>
              <textarea
                value={formData.configuracion ? JSON.stringify(formData.configuracion, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const value = e.target.value.trim();
                    if (value) {
                      const parsed = JSON.parse(value);
                      handleInputChange('configuracion', parsed);
                    } else {
                      handleInputChange('configuracion', null);
                    }
                  } catch (error) {
                    // Mantener el texto aunque no sea JSON válido, la validación se hará al enviar
                    handleInputChange('configuracion', e.target.value);
                  }
                }}
                rows="6"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-sm"
                placeholder='{"campo": "valor", "otro_campo": 123}'
              />
              <p className="mt-1 text-xs text-emerald-200/60">
                Configuración específica en formato JSON. Solo para casos avanzados.
              </p>
            </div>
          </div>
        )}

        {/* Error General */}
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/payment-methods')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : (isEditing ? 'Actualizar Método' : 'Crear Método')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodFormPage;