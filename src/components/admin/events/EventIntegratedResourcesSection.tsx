import React, { useState } from 'react';
import {
  FileText,
  Zap,
  HardDrive,
  Layers,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Video,
  Eye,
  Settings,
  Sparkles,
  Workflow,
  Radio,
  FileCheck,
} from 'lucide-react';
import { CronogramaEvent } from '../../../types';
import { safeCopyToClipboard } from '../../../utils/clipboard';

interface EventIntegratedResourcesSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
}

const GOOGLE_FORMS_PRESETS = [
  {
    title: 'Evaluación y Cosecha Post-Taller Ontológico',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-rbc-evaluacion-post-taller/viewform',
    description: 'Recolección de quiebres, decodificación somática y retroalimentación de la sesión.',
  },
  {
    title: 'Diagnóstico Previo de Transparencia y Quiebres',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-rbc-diagnostico-previo-taller/viewform',
    description: 'Indagación preliminar para calibrar el conversatorio con base en las necesidades de los inscritos.',
  },
  {
    title: 'Matriz de Compromisos y Acuerdos de Cierre',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-rbc-matriz-compromisos/viewform',
    description: 'Declaraciones de dignidad, acuerdos semanales y plan de acción transformacional.',
  },
];

const EXPERIENCE_CANVAS_PRESETS = [
  {
    id: 'somatic_scan',
    name: 'Escaneo Somático & Mapa de Transparencia B&W',
    description: 'Lienzo interactivo para mapear tensiones corporales, emociones contenidas y mandatos automáticos.',
  },
  {
    id: 'breakdown_decoder',
    name: 'Decodificador de Quiebres & Juicios Maestros',
    description: 'Espacio visual para desarticular la narrativa limitante y resignificar la vulnerabilidad.',
  },
  {
    id: 'boundary_declarations',
    name: 'Lienzo de Límites No Dichos & Declaraciones',
    description: 'Protocolo para explicitar acuerdos, diseñar pedidos efectivos y declarar soberanía.',
  },
];

export const EventIntegratedResourcesSection: React.FC<EventIntegratedResourcesSectionProps> = ({
  event,
  onChange,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    await safeCopyToClipboard(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formsUrl = event.googleFormsUrl || '';
  const driveFolderUrl = event.googleDriveFolderUrl || '';
  const triggersActive = event.triggersEnabled ?? true;
  const experienceActive = event.experienceToolEnabled ?? true;
  const selectedCanvas = event.experienceCanvasType || 'somatic_scan';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header explicativo del módulo unificado */}
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Integración Directa: Formularios, Activadores, Enlaces & Experiencias</span>
        </div>
        <h3 className="text-lg font-bold text-black dark:text-white mt-1">
          Configuración Unificada del Ecosistema del Taller
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
          Conecta en un solo flujo los formularios de Google Forms, los activadores de seguimiento automático, las carpetas de Google Drive y las herramientas interactivas de experiencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: FORMULARIOS DE GOOGLE (GOOGLE FORMS) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Formularios & Google Forms
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Enlace directo para diagnóstico o evaluación post-taller
                </p>
              </div>
            </div>
            {formsUrl && (
              <button
                type="button"
                onClick={() => setPreviewForm(!previewForm)}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewForm ? 'Ocultar' : 'Probar'}</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              URL del Formulario de Google Forms
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={formsUrl}
                onChange={(e) => onChange({ googleFormsUrl: e.target.value })}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
              />
              {formsUrl && (
                <a
                  href={formsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                  title="Abrir Google Form en nueva pestaña"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Plantillas rápidas de Google Forms */}
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 block mb-2">
              O selecciona una plantilla oficial RBC:
            </span>
            <div className="space-y-2">
              {GOOGLE_FORMS_PRESETS.map((preset) => (
                <div
                  key={preset.title}
                  onClick={() => onChange({ googleFormsUrl: preset.url })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    formsUrl === preset.url
                      ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black dark:text-white truncate">
                      {preset.title}
                    </span>
                    {formsUrl === preset.url && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {previewForm && formsUrl && (
            <div className="mt-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                  Vista Previa Embebida
                </span>
                <span className="text-[10px] text-purple-600 font-mono">Google Forms</span>
              </div>
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-purple-200/60 bg-white">
                <iframe
                  src={formsUrl}
                  title="Vista Previa de Google Forms"
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOQUE 2: ACTIVADORES AUTOMÁTICOS DE SEGUIMIENTO */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Activadores de Seguimiento
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Reglas automáticas de notificación y recordatorios
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={triggersActive}
                onChange={(e) => onChange({ triggersEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-2.5">
              <Radio className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-black dark:text-white block">
                  Confirmación Inmediata de Inscripción
                </span>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Emite pase de acceso con código único, sala de Google Meet y cuaderno preparatorio en PDF al coachee.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-2.5">
              <Workflow className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-black dark:text-white block">
                  Recordatorio 24 Horas Antes (WhatsApp / Email)
                </span>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Envío automático del enlace directo a Google Meet y recordatorio del centramiento inicial.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-black dark:text-white block">
                  Envío de Cuestionario Post-Taller & Cuaderno
                </span>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Dispara el formulario de Google Forms / Cuestionario para compilar las memorias del taller en PDF.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: CEREBRO & ENLACES (RECURSOS DRIVE Y MEET) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black dark:text-white">
                Cerebro y Enlaces (Recursos Drive)
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                Almacenamiento de memorias, lecturas y grabaciones
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Carpeta de Google Drive para este Evento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={driveFolderUrl}
                onChange={(e) => onChange({ googleDriveFolderUrl: e.target.value })}
                placeholder="https://drive.google.com/drive/folders/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              {driveFolderUrl && (
                <a
                  href={driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                  title="Abrir carpeta en Google Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300">
            <span className="font-semibold block mb-0.5">Sincronización Automática:</span>
            Los cuadernos PDF generados por los participantes se archivan automáticamente bajo la estructura de carpetas de Google Drive de RBC Consultoría.
          </div>
        </div>

        {/* BLOQUE 4: HERRAMIENTAS DE EXPERIENCIA (LIENZO B&W) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Herramientas de Experiencia (Lienzo B&W)
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Espacio interactivo de indagación somática y reflexión
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={experienceActive}
                onChange={(e) => onChange({ experienceToolEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Plantilla de Lienzo para este Taller
            </label>
            <div className="space-y-2">
              {EXPERIENCE_CANVAS_PRESETS.map((canvas) => (
                <div
                  key={canvas.id}
                  onClick={() => onChange({ experienceCanvasType: canvas.id })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanvas === canvas.id
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                      : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black dark:text-white">
                      {canvas.name}
                    </span>
                    {selectedCanvas === canvas.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                    {canvas.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
