// src/pages/LaborFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, Package, Clock, DollarSign, User, AlertTriangle } from 'lucide-react';
import laborService from '../api/labor';
import { TIPOS_LABOR, ESTADOS_LABOR } from '../utils/laborUtils';

const LaborFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Campos básicos
    fecha_labor: '',
    labor: '',
    estado: 'PLANIFICADA',
    descripcion: '',
    observaciones: '',

    // Ubicación
    campaña: '',
    parcela: '',

    // Insumos
    insumo: '',
    cantidad_insumo: '',

    // Costos y duración
    costo_estimado: '',
    duracion_horas: '',

    // Responsable
    responsable: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [campanas, setCampanas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [campanaAlert, setCampanaAlert] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosMaestros();
    if (isEditing) {
      cargarLabor();
    } else {
      // Establecer fecha por defecto (hoy)
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, fecha_labor: today }));
    }
  }, [id]);

  // Cargar datos maestros
  const cargarDatosMaestros = async () => {
    try {
      const [campanasData, parcelasData, insumosData, responsablesData] = await Promise.all([
        laborService.getCampanas(),
        laborService.getParcelas(),
        laborService.getInsumos(),
        laborService.getResponsables()
      ]);

      setCampanas(campanasData);
      setParcelas(parcelasData);
      setInsumos(insumosData);
      setResponsables(responsablesData);
    } catch (error) {
      console.error('Error cargando datos maestros:', error);
      
      // Datos de ejemplo para desarrollo
      setCampanas([
        { id: 1, nombre: 'Campaña Maíz 2024', fecha_inicio: '2024-01-01', fecha_fin: '2024-06-30' },
        { id: 2, nombre: 'Campaña Trigo 2024', fecha_inicio: '2024-07-01', fecha_fin: '2024-12-31' }
      ]);
      
      setParcelas([
        { id: 1, nombre: 'Parcela Norte', estado: 'ACTIVA' },
        { id: 2, nombre: 'Parcela Sur', estado: 'ACTIVA' },
        { id: 3, nombre: 'Parcela Este', estado: 'INACTIVA' }
      ]);
      
      setInsumos([
        { id: 1, nombre: 'Semilla Maíz Híbrido', cantidad_disponible: 100, unidad_medida: 'kg' },
        { id: 2, nombre: 'Fertilizante NPK', cantidad_disponible: 500, unidad_medida: 'kg' },
        { id: 3, nombre: 'Herbicida Glifosato', cantidad_disponible: 50, unidad_medida: 'L' }
      ]);
      
      setResponsables([
        { id: 1, get_full_name: 'María García' },
        { id: 2, get_full_name: 'Pedro Martínez' },
        { id: 3, get_full_name: 'Ana López' }
      ]);
    }
  };

  // Cargar labor existente
  const cargarLabor = async () => {
    try {
      setLoading(true);
      const response = await laborService.getLaborById(id);
      
      // Formatear datos para el formulario
      const formattedData = {
        fecha_labor: response.fecha_labor,
        labor: response.labor,
        estado: response.estado,
        descripcion: response.descripcion || '',
        observaciones: response.observaciones || '',
        campaña: response.campaña || '',
        parcela: response.parcela || '',
        insumo: response.insumo || '',
        cantidad_insumo: response.cantidad_insumo || '',
        costo_estimado: response.costo_estimado || '',
        duracion_horas: response.duracion_horas || '',
        responsable: response.responsable || ''
      };

      setFormData(formattedData);
    } catch (error) {
      console.error('Error al cargar labor:', error);
      setError('Error al cargar los datos de la labor');
      
      // Datos de ejemplo para desarrollo
      const mockData = {
        fecha_labor: '2024-01-15',
        labor: 'SIEMBRA',
        estado: 'COMPLETADA',
        descripcion: 'Siembra de maíz en parcela norte',
        observaciones: 'Tierra en buen estado, clima favorable',
        campaña: 1,
        parcela: 1,
        insumo: 1,
        cantidad_insumo: 50,
        costo_estimado: 1500,
        duracion_horas: 8,
        responsable: 1
      };
      
      setFormData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validar fecha de campaña en tiempo real
    if (name === 'fecha_labor' || name === 'campaña') {
      validarFechaCampana();
    }

    // Resetear cantidad de insumo si se quita el insumo
    if (name === 'insumo' && !value) {
      setFormData(prev => ({ ...prev, cantidad_insumo: '' }));
    }
  };

  // Validar fecha con campaña
  const validarFechaCampana = async () => {
    const campanaId = formData.campaña;
    const fechaLabor = formData.fecha_labor;

    if (!campanaId || !fechaLabor) {
      setCampanaAlert('');
      return;
    }

    try {
      const campana = campanas.find(c => c.id == campanaId);
      if (campana) {
        const fecha = new Date(fechaLabor);
        const inicio = new Date(campana.fecha_inicio);
        const fin = campana.fecha_fin ? new Date(campana.fecha_fin) : null;

        if (fecha < inicio) {
          setCampanaAlert(`La fecha no puede ser anterior al inicio de la campaña (${inicio.toLocaleDateString('es-ES')})`);
        } else if (fin && fecha > fin) {
          setCampanaAlert(`La fecha no puede ser posterior al fin de la campaña (${fin.toLocaleDateString('es-ES')})`);
        } else {
          setCampanaAlert('');
        }
      }
    } catch (error) {
      console.error('Error validando fecha de campaña:', error);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    // Validaciones básicas
    if (!formData.fecha_labor) {
      errors.fecha_labor = 'La fecha de labor es requerida';
    } else if (formData.fecha_labor > today) {
      errors.fecha_labor = 'La fecha de labor no puede ser en el futuro';
    }

    if (!formData.labor) {
      errors.labor = 'El tipo de labor es requerido';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }

    // Validación de ubicación (al menos campaña o parcela)
    if (!formData.campaña && !formData.parcela) {
      errors.campaña = 'Debe especificar al menos una campaña o parcela';
      errors.parcela = 'Debe especificar al menos una campaña o parcela';
    }

    // Validación de insumos
    if (formData.insumo && !formData.cantidad_insumo) {
      errors.cantidad_insumo = 'Debe especificar la cantidad de insumo utilizada';
    } else if (formData.cantidad_insumo && formData.cantidad_insumo <= 0) {
      errors.cantidad_insumo = 'La cantidad debe ser mayor a 0';
    }

    // Validación de cantidades numéricas
    if (formData.costo_estimado && formData.costo_estimado < 0) {
      errors.costo_estimado = 'El costo estimado no puede ser negativo';
    }

    if (formData.duracion_horas && formData.duracion_horas <= 0) {
      errors.duracion_horas = 'La duración debe ser mayor a 0';
    }

    // Validación de stock de insumo
    if (formData.insumo && formData.cantidad_insumo) {
      const insumoSeleccionado = insumos.find(i => i.id == formData.insumo);
      if (insumoSeleccionado && formData.cantidad_insumo > insumoSeleccionado.cantidad_disponible) {
        errors.cantidad_insumo = `Stock insuficiente. Disponible: ${insumoSeleccionado.cantidad_disponible} ${insumoSeleccionado.unidad_medida || 'unidades'}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        campaña: formData.campaña || null,
        parcela: formData.parcela || null,
        insumo: formData.insumo || null,
        cantidad_insumo: formData.cantidad_insumo ? parseFloat(formData.cantidad_insumo) : null,
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null,
        duracion_horas: formData.duracion_horas ? parseFloat(formData.duracion_horas) : null,
        responsable: formData.responsable || null
      };

      if (isEditing) {
        await laborService.updateLabor(id, dataToSend);
      } else {
        await laborService.crearLabor(dataToSend);
      }

      navigate('/labores', {
        state: {
          message: `Labor ${isEditing ? 'actualizada' : 'creada'} exitosamente`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error al guardar labor:', error);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la labor: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Obtener información del stock del insumo seleccionado
  const getStockInfo = () => {
    if (!formData.insumo) return null;
    
    const insumoSeleccionado = insumos.find(i => i.id == formData.insumo);
    if (!insumoSeleccionado) return null;

    return `Stock disponible: ${insumoSeleccionado.cantidad_disponible} ${insumoSeleccionado.unidad_medida || 'unidades'}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando datos de la labor...</span>
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
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Labor Agrícola' : 'Nueva Labor Agrícola'}
            </h1>
            <p className="text-emerald-100/80 mt-1">
              {isEditing ? 'Modificar la información de la labor' : 'Registrar una nueva labor agrícola'}
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
        {/* Información Básica */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
            Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Fecha de Labor *
              </label>
              <input
                type="date"
                name="fecha_labor"
                value={formData.fecha_labor}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.fecha_labor ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {validationErrors.fecha_labor && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.fecha_labor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Tipo de Labor *
              </label>
              <select
                name="labor"
                value={formData.labor}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.labor ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Seleccionar tipo...</option>
                {TIPOS_LABOR.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor} className="bg-gray-800">
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
              {validationErrors.labor && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.labor}</p>
              )}
            </div>

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
                {ESTADOS_LABOR.map(estado => (
                  <option key={estado.valor} value={estado.valor} className="bg-gray-800">
                    {estado.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-emerald-200/80 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                validationErrors.descripcion ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Describa detalladamente la labor a realizar..."
            />
            {validationErrors.descripcion && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.descripcion}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-emerald-200/80 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-400" />
            Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Campaña
              </label>
              <select
                name="campaña"
                value={formData.campaña}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.campaña ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Sin campaña</option>
                {campanas.map(campana => (
                  <option key={campana.id} value={campana.id} className="bg-gray-800">
                    {campana.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.campaña && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.campaña}</p>
              )}
              {campanaAlert && (
                <p className="text-yellow-400 text-sm mt-1">{campanaAlert}</p>
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
                <option value="" className="bg-gray-800">Sin parcela</option>
                {parcelas
                  .filter(parcela => parcela.estado === 'ACTIVA')
                  .map(parcela => (
                    <option key={parcela.id} value={parcela.id} className="bg-gray-800">
                      {parcela.nombre}
                    </option>
                  ))
                }
              </select>
              {validationErrors.parcela && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.parcela}</p>
              )}
              <p className="text-emerald-200/60 text-sm mt-1">
                Solo se muestran parcelas activas
              </p>
            </div>
          </div>
        </div>

        {/* Insumos y Recursos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-400" />
            Insumos y Recursos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Insumo
              </label>
              <select
                name="insumo"
                value={formData.insumo}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" className="bg-gray-800">Sin insumo</option>
                {insumos.map(insumo => (
                  <option key={insumo.id} value={insumo.id} className="bg-gray-800">
                    {insumo.nombre}
                  </option>
                ))}
              </select>
              {getStockInfo() && (
                <p className="text-emerald-200/60 text-sm mt-1">{getStockInfo()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Cantidad de Insumo
              </label>
              <input
                type="number"
                name="cantidad_insumo"
                value={formData.cantidad_insumo}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={!formData.insumo}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.cantidad_insumo ? 'border-red-500' : 'border-white/20'
                } ${!formData.insumo ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
              {validationErrors.cantidad_insumo && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.cantidad_insumo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Responsable
              </label>
              <select
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" className="bg-gray-800">Sin responsable</option>
                {responsables.map(responsable => (
                  <option key={responsable.id} value={responsable.id} className="bg-gray-800">
                    {responsable.get_full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Costos y Duración */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
            Costos y Duración
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Costo Estimado ($)
              </label>
              <input
                type="number"
                name="costo_estimado"
                value={formData.costo_estimado}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.costo_estimado ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="0.00"
              />
              {validationErrors.costo_estimado && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.costo_estimado}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Duración (horas)
              </label>
              <input
                type="number"
                name="duracion_horas"
                value={formData.duracion_horas}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.duracion_horas ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="0.0"
              />
              {validationErrors.duracion_horas && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.duracion_horas}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Validación */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">Información Importante</h3>
          <ul className="text-blue-100/80 space-y-2 text-sm">
            <li>• Los campos marcados con * son obligatorios</li>
            <li>• Debe especificar al menos una campaña o parcela</li>
            <li>• Si utiliza insumos, debe especificar la cantidad</li>
            <li>• La fecha de labor no puede ser futura</li>
            <li>• Las parcelas deben estar activas para ser seleccionadas</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/labores')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Actualizar Labor' : 'Crear Labor'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LaborFormPage;