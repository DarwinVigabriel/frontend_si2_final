import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Calendar, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { productoCosechadoService, ESTADOS_PRODUCTO } from '../api/productoCosechadoService';

const ProductosCosechadosFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Campos principales
    fecha_cosecha: '',
    cantidad: '',
    unidad_medida: 'kg',
    calidad: '',
    
    // Relaciones foráneas
    cultivo: '',
    labor: '',
    
    // Estado y ubicación
    estado: 'En Almacén',
    lote: '',
    ubicacion_almacen: '',
    
    // Opción 1: Relación con campaña
    campania: '',
    
    // Opción 2: Relación con parcela
    parcela: '',
    
    // Campos adicionales
    observaciones: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [relaciones, setRelaciones] = useState({
    cultivos: [],
    labores: [],
    campanias: [],
    parcelas: []
  });

  useEffect(() => {
    if (isEditing) {
      cargarProducto();
    }
    cargarRelaciones();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await productoCosechadoService.obtener(id);

      // Formatear fecha para input
      const formattedData = {
        ...response.data,
        fecha_cosecha: response.data.fecha_cosecha ?
          new Date(response.data.fecha_cosecha).toISOString().split('T')[0] : '',
        cultivo: response.data.cultivo?.id || '',
        labor: response.data.labor?.id || '',
        campania: response.data.campania?.id || '',
        parcela: response.data.parcela?.id || ''
      };

      setFormData(formattedData);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar los datos del producto');

      // Fallback a datos simulados
      const mockData = {
        fecha_cosecha: '2024-01-15',
        cantidad: '100.50',
        unidad_medida: 'kg',
        calidad: 'Premium',
        cultivo: '1',
        labor: '1',
        estado: 'En Almacén',
        lote: '123.45',
        ubicacion_almacen: 'Almacén A - Estante 5',
        campania: '1',
        parcela: '',
        observaciones: 'Producto de primera calidad'
      };

      setFormData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const cargarRelaciones = async () => {
    try {
      // En un proyecto real, estos datos vendrían de APIs específicas
      // Por ahora usamos datos de ejemplo
      setRelaciones({
        cultivos: [
          { id: 1, nombre: 'Manzana - Gala' },
          { id: 2, nombre: 'Naranja - Valencia' },
          { id: 3, nombre: 'Uva - Thompson' }
        ],
        labores: [
          { id: 1, nombre: 'Cosecha Manual' },
          { id: 2, nombre: 'Cosecha Mecánica' },
          { id: 3, nombre: 'Cosecha Selectiva' }
        ],
        campanias: [
          { id: 1, nombre: 'Campaña Verano 2024' },
          { id: 2, nombre: 'Campaña Otoño 2024' },
          { id: 3, nombre: 'Campaña Invierno 2024' }
        ],
        parcelas: [
          { id: 1, nombre: 'Parcela Norte' },
          { id: 2, nombre: 'Parcela Sur' },
          { id: 3, nombre: 'Parcela Este' }
        ]
      });
    } catch (error) {
      console.error('Error al cargar relaciones:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se selecciona campaña, limpiar parcela y viceversa
    if (name === 'campania' && value) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        parcela: ''
      }));
    } else if (name === 'parcela' && value) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        campania: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error de validación cuando el usuario comienza a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones de campos requeridos
    if (!formData.fecha_cosecha.trim()) {
      errors.fecha_cosecha = 'La fecha de cosecha es requerida';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.unidad_medida.trim()) {
      errors.unidad_medida = 'La unidad de medida es requerida';
    }

    if (!formData.calidad.trim()) {
      errors.calidad = 'La calidad es requerida';
    }

    if (!formData.cultivo) {
      errors.cultivo = 'El cultivo es requerido';
    }

    if (!formData.labor) {
      errors.labor = 'La labor es requerida';
    }

    if (!formData.lote || formData.lote <= 0) {
      errors.lote = 'El lote debe ser mayor a 0';
    }

    if (!formData.ubicacion_almacen.trim()) {
      errors.ubicacion_almacen = 'La ubicación en almacén es requerida';
    }

    // Validación específica: campaña O parcela (una de las dos)
    if (!formData.campania && !formData.parcela) {
      errors.campania = 'Debe especificar al menos una campaña o una parcela';
      errors.parcela = 'Debe especificar al menos una campaña o una parcela';
    }

    // Validación: no pueden tener ambas opciones
    if (formData.campania && formData.parcela) {
      errors.campania = 'Solo puede especificar campaña O parcela, no ambas';
      errors.parcela = 'Solo puede especificar campaña O parcela, no ambas';
    }

    // Validación de fecha futura
    if (formData.fecha_cosecha) {
      const fechaCosecha = new Date(formData.fecha_cosecha);
      const hoy = new Date();
      if (fechaCosecha > hoy) {
        errors.fecha_cosecha = 'La fecha de cosecha no puede ser en el futuro';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarLoteUnico = async (lote) => {
    try {
      const response = await productoCosechadoService.validarLote(lote);
      return !response.data.existe;
    } catch (error) {
      console.error('Error al validar lote:', error);
      return true; // En caso de error, permitimos continuar
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validar lote único (solo en creación)
    if (!isEditing) {
      const loteUnico = await validarLoteUnico(formData.lote);
      if (!loteUnico) {
        setValidationErrors(prev => ({
          ...prev,
          lote: 'El número de lote ya existe'
        }));
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      const dataToSend = {
        ...formData,
        cantidad: parseFloat(formData.cantidad),
        lote: parseFloat(formData.lote),
        campania: formData.campania || null,
        parcela: formData.parcela || null,
        fecha_cosecha: formData.fecha_cosecha
      };

      if (isEditing) {
        await productoCosechadoService.actualizar(id, dataToSend);
      } else {
        await productoCosechadoService.crear(dataToSend);
      }

      navigate('/productos-cosechados', {
        state: {
          message: `Producto cosechado ${isEditing ? 'actualizado' : 'creado'} exitosamente`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.response?.data || error.message;
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto: ${JSON.stringify(errorMessage)}`);
    } finally {
      setSaving(false);
    }
  };

  const getUnidadOptions = () => {
    return [
      { value: 'kg', label: 'Kilogramos' },
      { value: 'ton', label: 'Toneladas' },
      { value: 'qq', label: 'Quintales' },
      { value: 'lb', label: 'Libras' },
      { value: 'saco', label: 'Sacos' },
      { value: 'caja', label: 'Cajas' }
    ];
  };

  const getCalidadOptions = () => {
    return [
      { value: 'Premium', label: 'Premium' },
      { value: 'Estándar', label: 'Estándar' },
      { value: 'Comercial', label: 'Comercial' },
      { value: 'Segunda', label: 'Segunda' },
      { value: 'Descarte', label: 'Descarte' }
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando datos del producto...</span>
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
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar' : 'Crear'} Producto Cosechado
            </h1>
            <p className="text-emerald-100/80 mt-1">
              {isEditing ? 'Modificar la información del producto cosechado' : 'Registrar un nuevo producto cosechado'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 font-medium">Error</span>
          </div>
          <p className="text-red-100/80 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de Cosecha */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
            Información de Cosecha
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Fecha de Cosecha *
              </label>
              <input
                type="date"
                name="fecha_cosecha"
                value={formData.fecha_cosecha}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.fecha_cosecha ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {validationErrors.fecha_cosecha && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.fecha_cosecha}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.cantidad ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="0.00"
              />
              {validationErrors.cantidad && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.cantidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Unidad de Medida *
              </label>
              <select
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.unidad_medida ? 'border-red-500' : 'border-white/20'
                }`}
              >
                {getUnidadOptions().map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.unidad_medida && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.unidad_medida}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Calidad *
              </label>
              <select
                name="calidad"
                value={formData.calidad}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.calidad ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccione calidad</option>
                {getCalidadOptions().map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.calidad && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.calidad}</p>
              )}
            </div>
          </div>
        </div>

        {/* Relaciones */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-400" />
            Relaciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Cultivo *
              </label>
              <select
                name="cultivo"
                value={formData.cultivo}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.cultivo ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccione cultivo</option>
                {relaciones.cultivos.map(cultivo => (
                  <option key={cultivo.id} value={cultivo.id} className="bg-gray-800">
                    {cultivo.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.cultivo && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.cultivo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Labor de Cosecha *
              </label>
              <select
                name="labor"
                value={formData.labor}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.labor ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccione labor</option>
                {relaciones.labores.map(labor => (
                  <option key={labor.id} value={labor.id} className="bg-gray-800">
                    {labor.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.labor && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.labor}</p>
              )}
            </div>
          </div>
        </div>

        {/* Origen (Campaña o Parcela) */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-purple-400" />
            Origen del Producto
          </h2>
          <p className="text-emerald-200/60 mb-4 text-sm">
            Seleccione <strong>campaña</strong> O <strong>parcela</strong> como origen del producto (solo una opción)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Campaña
              </label>
              <select
                name="campania"
                value={formData.campania}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.campania ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccione campaña (opcional)</option>
                {relaciones.campanias.map(campania => (
                  <option key={campania.id} value={campania.id} className="bg-gray-800">
                    {campania.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.campania && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.campania}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Parcela
              </label>
              <select
                name="parcela"
                value={formData.parcela}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.parcela ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccione parcela (opcional)</option>
                {relaciones.parcelas.map(parcela => (
                  <option key={parcela.id} value={parcela.id} className="bg-gray-800">
                    {parcela.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.parcela && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.parcela}</p>
              )}
            </div>
          </div>

          {/* Indicador de selección */}
          {(formData.campania || formData.parcela) && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  Origen seleccionado: <strong>
                    {formData.campania ? 
                      `Campaña: ${relaciones.campanias.find(c => c.id == formData.campania)?.nombre}` : 
                      `Parcela: ${relaciones.parcelas.find(p => p.id == formData.parcela)?.nombre}`
                    }
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Estado y Almacenamiento */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-400" />
            Estado y Almacenamiento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ESTADOS_PRODUCTO.map(estado => (
                  <option key={estado.valor} value={estado.valor} className="bg-gray-800">
                    {estado.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Número de Lote *
              </label>
              <input
                type="number"
                name="lote"
                value={formData.lote}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.lote ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="123.45"
              />
              {validationErrors.lote && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.lote}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Ubicación en Almacén *
              </label>
              <input
                type="text"
                name="ubicacion_almacen"
                value={formData.ubicacion_almacen}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.ubicacion_almacen ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Ej: Almacén A - Estante 5 - Fila 3"
              />
              {validationErrors.ubicacion_almacen && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.ubicacion_almacen}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-emerald-200/80 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Observaciones adicionales sobre el producto cosechado..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/productos-cosechados')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200 mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductosCosechadosFormPage;