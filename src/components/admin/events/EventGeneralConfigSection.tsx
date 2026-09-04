import React, { useRef } from 'react';
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  Video,
  Layers,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { CronogramaEvent } from '../../../types';

interface EventGeneralConfigSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
}

const PRESET_EVENT_TYPES = [
  'Taller',
  'Sesión',
  'Workshop',
  'Conversatorio',
  'Masterclass',
  'Programa Intensivo',
  'Círculo de Liderazgo',
];

const PRESET_COVERS = [
  {
    label: 'Círculo Zen Botánico',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Editorial Minimalista',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Espacio Somático & Serenidad',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Arquitectura & Liderazgo',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
  },
];

export const EventGeneralConfigSection: React.FC<EventGeneralConfigSectionProps> = ({
  event,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for base64 local storage)
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 3MB. Por favor sube una imagen más ligera o usa una URL directa.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange({
          imageUrl: base64,
          coverImage: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const currentCover = event.coverImage || event.imageUrl || PRESET_COVERS[0].url;
  const isShowOnHome = event.showOnHome ?? true;
  const capacityType = event.capacityType || (event.totalSpots === 1 ? 'individual' : 'grupal');
  const priceAmount = event.priceAmount ?? (event.price && !event.price.toLowerCase().includes('libre') ? 180000 : 0);

  return (
    <div className="space-y-6">
      {/* Encabezado descriptivo de la sección */}
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>1. Configuración General del Evento / Sesión</span>
        </div>
        <h3 className="text-lg font-bold text-black dark:text-white mt-1">
          Identidad, Visibilidad, Capacidad & Cronograma
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
          Define el nombre personalizable, la imagen de portada con control de visibilidad en la Home, cupos y valor de inversión.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: Nombre, Tipo, Visibilidad y Capacidad */}
        <div className="space-y-5">
          {/* Tipo de Módulo / Evento Personalizable */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Tipo o Módulo Personalizable
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ eventType: type })}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    (event.eventType || 'Taller') === type
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={event.eventType || ''}
              onChange={(e) => onChange({ eventType: e.target.value })}
              placeholder="Ej: Taller, Sesión, Workshop, Conversatorio..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Nombre / Título del Evento */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Nombre del Evento / Sesión <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={event.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ej: Taller de Deconstrucción Somática & Soberanía Directiva"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-semibold text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subtítulo o Enfoque */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Subtítulo u Objetivo Ontológico
            </label>
            <input
              type="text"
              value={event.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Ej: Fronteras, Límites No Dichos & Decodificación Somática"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Facilitador */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Facilitador / Coach Responsable
            </label>
            <input
              type="text"
              value={event.facilitator || 'John Fredy Rengifo Basto'}
              onChange={(e) => onChange({ facilitator: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* TOGGLE / CASILLA DE VERIFICACIÓN: VISIBILIDAD HOME */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black dark:text-white">
                    Publicación en Portada Principal (Home)
                  </span>
                  {isShowOnHome ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Eye className="w-3 h-3" />
                      Visible en Portada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                      <EyeOff className="w-3 h-3" />
                      Solo Interno / Privado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                  Decide si este taller se destaca en la portada principal de la app para todos los visitantes, o si se mantiene solo de forma interna para el administrador y participantes registrados.
                </p>
              </div>

              {/* Casilla de verificación tipo toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isShowOnHome}
                  onChange={(e) =>
                    onChange({
                      showOnHome: e.target.checked,
                      featured: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* CAPACIDAD: INDIVIDUAL O GRUPAL */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
            <label className="block text-xs font-semibold text-black dark:text-white">
              Capacidad y Modalidad de Participación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    capacityType: 'individual',
                    capacity: 1,
                    totalSpots: 1,
                    spotsLeft: 1,
                  })
                }
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  capacityType === 'individual'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Individual (1 a 1)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    capacityType: 'grupal',
                    capacity: event.capacity && event.capacity > 1 ? event.capacity : 25,
                    totalSpots: event.totalSpots && event.totalSpots > 1 ? event.totalSpots : 25,
                    spotsLeft: event.spotsLeft && event.spotsLeft > 1 ? event.spotsLeft : 25,
                  })
                }
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  capacityType === 'grupal'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Grupal / Taller</span>
              </button>
            </div>

            {capacityType === 'grupal' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-neutral-400 mb-1">
                    Límite Total de Cupos
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="500"
                    value={event.capacity || event.totalSpots || 25}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 25;
                      onChange({
                        capacity: val,
                        totalSpots: val,
                        spotsLeft: Math.min(val, event.spotsLeft ?? val),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-neutral-400 mb-1">
                    Cupos Disponibles Actuales
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={event.capacity || 25}
                    value={event.spotsLeft ?? 25}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onChange({ spotsLeft: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PRECIO / VALOR */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-black dark:text-white">
                Precio / Valor de Inversión
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      priceAmount: 0,
                      price: 'Acceso Libre con Pre-Registro',
                    })
                  }
                  className={`text-[10px] px-2 py-0.5 rounded-md cursor-pointer ${
                    priceAmount === 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                  }`}
                >
                  Gratuito / Libre
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      priceAmount: 180000,
                      price: '$180.000 COP',
                    })
                  }
                  className={`text-[10px] px-2 py-0.5 rounded-md cursor-pointer ${
                    priceAmount > 0
                      ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                  }`}
                >
                  De Pago ($)
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="5000"
                value={priceAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChange({
                    priceAmount: val,
                    price: val === 0 ? 'Acceso Libre con Pre-Registro' : `$${val.toLocaleString()} COP`,
                  });
                }}
                placeholder="0"
                className="w-full pl-9 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-semibold text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs text-gray-400 font-mono">
                COP
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-light">
              Etiqueta que verán los participantes: <span className="font-medium text-black dark:text-white">{event.price || (priceAmount === 0 ? 'Acceso Libre' : `$${priceAmount.toLocaleString()} COP`)}</span>
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Portada e Imagen, Fechas y Sala Virtual */}
        <div className="space-y-5">
          {/* PORTADA E IMAGEN REPRESENTATIVA */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>Portada e Imagen Representativa</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white cursor-pointer font-medium"
              >
                <Upload className="w-3 h-3" />
                <span>Subir Imagen</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Vista previa de portada */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-gray-200 dark:border-neutral-700 group shadow-xs">
              <img
                src={currentCover}
                alt="Portada del evento"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono">
                    {event.eventType || 'Taller'}
                  </span>
                  {isShowOnHome ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-xs font-semibold">
                      Destacado en Home
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800/80 backdrop-blur-xs font-semibold">
                      Solo Interno
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold truncate mt-1">{event.title || 'Nombre del taller'}</p>
              </div>
            </div>

            {/* Input URL directa */}
            <div>
              <label className="block text-[11px] text-gray-500 dark:text-neutral-400 mb-1">
                URL directa de la imagen
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={event.coverImage || event.imageUrl || ''}
                  onChange={(e) =>
                    onChange({
                      coverImage: e.target.value,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Biblioteca de imágenes predefinidas recomendadas */}
            <div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 block mb-1.5">
                O elige una estética de la biblioteca RBC:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      onChange({
                        coverImage: preset.url,
                        imageUrl: preset.url,
                      })
                    }
                    className={`text-left p-1.5 rounded-lg border text-[11px] flex items-center gap-2 cursor-pointer transition-all ${
                      currentCover === preset.url
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                    <span className="truncate text-black dark:text-white">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FECHAS Y HORAS: LANZAMIENTO Y REALIZACIÓN */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3.5">
            <label className="block text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Cronograma: Lanzamiento & Realización</span>
            </label>

            {/* Fecha de lanzamiento / convocatoria */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-neutral-300 mb-1">
                Fecha de Lanzamiento / Convocatoria
              </label>
              <input
                type="date"
                value={event.launchDate || (event.date ? event.date.split('T')[0] : '')}
                onChange={(e) => onChange({ launchDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 font-light mt-0.5 block">
                Momento en que se abre la inscripción y difusión pública.
              </span>
            </div>

            {/* Fecha y hora de Realización */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Fecha de Realización <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={event.date ? event.date.split('T')[0] : ''}
                  onChange={(e) => {
                    const newDateStr = e.target.value;
                    const fullIso = newDateStr ? new Date(`${newDateStr}T19:00:00`).toISOString() : '';
                    onChange({
                      date: fullIso,
                      eventDate: fullIso,
                      displayDate: newDateStr,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Horario de Realización
                </label>
                <input
                  type="text"
                  value={event.time || '7:00 PM - 8:30 PM (GMT-5)'}
                  onChange={(e) => onChange({ time: e.target.value })}
                  placeholder="Ej: 7:00 PM - 8:30 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sala Virtual Google Meet */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enlace de Sala Virtual Google Meet</span>
              </label>
              <input
                type="url"
                value={event.meetUrl || ''}
                onChange={(e) => onChange({ meetUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
