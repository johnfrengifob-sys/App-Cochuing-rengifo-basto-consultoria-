import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
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
  Database,
  UserCheck,
  MessageSquare,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
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

const GOOGLE_SHEETS_PRESETS = [
  {
    title: 'Base de Datos de Coachees & Seguimiento 1 a 1 (Principal)',
    url: 'https://docs.google.com/spreadsheets/d/1rbc-master-database-coachees/edit#gid=0',
    description: 'Matriz centralizada para sincronizar inscritos, respuestas de quiebre y estatus de seguimiento coachee a coachee.',
  },
  {
    title: 'Registro y Asistencia en Vivo de Talleres',
    url: 'https://docs.google.com/spreadsheets/d/1rbc-asistencia-talleres-en-vivo/edit#gid=0',
    description: 'Planilla de control de ingreso a sala Meet, entrega de cuadernos y observaciones ontológicas.',
  },
];

export const EventIntegratedResourcesSection: React.FC<EventIntegratedResourcesSectionProps> = ({
  event,
  onChange,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState(false);
  const [expandedTrigger, setExpandedTrigger] = useState<'welcome' | 'reminder' | 'survey' | 'webhook' | null>('welcome');

  const handleCopy = async (text: string, label: string) => {
    await safeCopyToClipboard(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formsUrl = event.googleFormsUrl || '';
  const sheetsUrl = event.googleSheetsUrl || '';
  const driveFolderUrl = event.googleDriveFolderUrl || '';
  const meetUrl = event.meetUrl || '';
  const triggersActive = event.triggersEnabled ?? true;

  // Custom triggers state
  const customTriggers = event.customTriggers || {
    welcomeImmediate: true,
    welcomeMessage: `¡Hola! Tu cupo para "${event.title || 'el Taller Ontológico'}" ha sido confirmado exitosamente. Tu pase de acceso, enlace exclusivo de Google Meet y cuaderno preparatorio en PDF han sido activados.`,
    reminder24h: true,
    reminderMessage: `Recordatorio: Nos encontraremos mañana a las ${event.time || '7:00 PM'} en la sala de Google Meet para nuestro taller "${event.title || 'Raíz y Balance'}". Te recomendamos preparar tu espacio en silencio.`,
    postSurveyDispatched: true,
    postSurveyMessage: `Apreciado participante, gracias por ser parte de este espacio. Te invitamos a diligenciar la evaluación y quiebres para consolidar tu cuaderno descargable de memorias en PDF.`,
    customWebhookUrl: '',
  };

  const updateTrigger = (key: string, value: any) => {
    const updated = {
      ...customTriggers,
      [key]: value,
    };
    onChange({
      customTriggers: updated,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado Unificado */}
      <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Ecosistema Integral del Taller</span>
        </div>
        <h3 className="text-lg font-bold text-white mt-1">
          Formularios, Base de Datos Google Sheets y Activadores de Seguimiento 1 a 1
        </h3>
        <p className="text-xs text-neutral-300 font-light mt-0.5 max-w-3xl">
          Configura en un solo lugar la conexión con tus hojas de Google Sheets para alimentar la base de datos de coachees, formularios de Google Forms y personaliza las reglas automáticas de seguimiento para este evento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: BASE DE DATOS GOOGLE SHEETS PARA SEGUIMIENTO 1 A 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-200/80 dark:border-emerald-900/40 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                  <span>Base de Datos en Google Sheets</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono font-semibold">
                    Seguimiento 1 a 1
                  </span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Captura de participantes y construcción de base de datos
                </p>
              </div>
            </div>

            {sheetsUrl && (
              <a
                href={sheetsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Hoja</span>
              </a>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              URL de la Hoja de Google Sheets para este Evento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => onChange({ googleSheetsUrl: e.target.value })}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              {sheetsUrl && (
                <button
                  type="button"
                  onClick={() => handleCopy(sheetsUrl, 'sheets')}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  {copiedLink === 'sheets' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Plantillas rápidas de Google Sheets */}
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 block mb-2">
              Plantillas o Hojas Oficiales del Ecosistema RBC:
            </span>
            <div className="space-y-2">
              {GOOGLE_SHEETS_PRESETS.map((preset) => (
                <div
                  key={preset.title}
                  onClick={() => onChange({ googleSheetsUrl: preset.url })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    sheetsUrl === preset.url
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40'
                      : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black dark:text-white truncate">
                      {preset.title}
                    </span>
                    {sheetsUrl === preset.url && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-light leading-relaxed">
              <strong>Impacto en Seguimiento 1 a 1:</strong> Cada coachee registrado a través del formulario se incorpora directamente a esta hoja para que el Master Coach pueda diagnosticar su quiebre, preparar la sesión sincrónica y llevar su bitácora individualizada.
            </p>
          </div>
        </div>

        {/* BLOQUE 2: FORMULARIOS DE GOOGLE (GOOGLE FORMS) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Formulario de Captación / Diagnóstico (Google Forms)
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Enlace público para inscripción previa o evaluación de cierre
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
              Plantillas oficiales de Google Forms:
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
      </div>

      {/* BLOQUE 3: ACTIVADORES DE SEGUIMIENTO PERSONALIZADOS (POR EVENTO) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-amber-200/90 dark:border-amber-900/40 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-black dark:text-white">
                  Personalización de Activadores de Seguimiento
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                  Por Evento
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Adapta el contenido de los mensajes, canales y disparadores automáticos específicos para este taller.
              </p>
            </div>
          </div>

          {/* Switch maestro de activadores */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {triggersActive ? 'Activadores Habilitados' : 'Activadores Pausados'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={triggersActive}
                onChange={(e) => onChange({ triggersEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>
        </div>

        {triggersActive && (
          <div className="space-y-3.5">
            {/* Activador 1: Confirmación Inmediata */}
            <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50/50 dark:bg-neutral-800/30">
              <div
                onClick={() => setExpandedTrigger(expandedTrigger === 'welcome' ? null : 'welcome')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black dark:text-white block">
                      Activador 1: Confirmación Inmediata de Inscripción
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Envía código único, pase de acceso, enlace de Meet y cuaderno preparatorio al coachee.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customTriggers.welcomeImmediate !== false}
                      onChange={(e) => updateTrigger('welcomeImmediate', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                  {expandedTrigger === 'welcome' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedTrigger === 'welcome' && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    Mensaje Personalizado de Confirmación (Email / WhatsApp):
                  </label>
                  <textarea
                    rows={3}
                    value={customTriggers.welcomeMessage || ''}
                    onChange={(e) => updateTrigger('welcomeMessage', e.target.value)}
                    placeholder="Escribe el mensaje con el tono y quiebre de este taller específico..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Activador 2: Recordatorio 24 Horas Antes */}
            <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50/50 dark:bg-neutral-800/30">
              <div
                onClick={() => setExpandedTrigger(expandedTrigger === 'reminder' ? null : 'reminder')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black dark:text-white block">
                      Activador 2: Recordatorio 24 Horas Antes del Taller
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Disparo previo para centramiento, revisión del temario y acceso a Google Meet.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customTriggers.reminder24h !== false}
                      onChange={(e) => updateTrigger('reminder24h', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                  </label>
                  {expandedTrigger === 'reminder' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedTrigger === 'reminder' && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    Mensaje Personalizado de Recordatorio:
                  </label>
                  <textarea
                    rows={3}
                    value={customTriggers.reminderMessage || ''}
                    onChange={(e) => updateTrigger('reminderMessage', e.target.value)}
                    placeholder="Recordatorio y pautas de centramiento para el coachee..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Activador 3: Cuestionario Post-Taller y Cuaderno PDF */}
            <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50/50 dark:bg-neutral-800/30">
              <div
                onClick={() => setExpandedTrigger(expandedTrigger === 'survey' ? null : 'survey')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black dark:text-white block">
                      Activador 3: Envío de Cuestionario Post-Taller y Cuaderno de Memorias PDF
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Recoge la cosecha, actualiza el Google Sheets de seguimiento y genera el cuaderno en PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customTriggers.postSurveyDispatched !== false}
                      onChange={(e) => updateTrigger('postSurveyDispatched', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                  {expandedTrigger === 'survey' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedTrigger === 'survey' && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    Mensaje de Cierre y Solicitud de Cuestionario:
                  </label>
                  <textarea
                    rows={3}
                    value={customTriggers.postSurveyMessage || ''}
                    onChange={(e) => updateTrigger('postSurveyMessage', e.target.value)}
                    placeholder="Mensaje de gratitud ontológica y llamado a diligenciar el cuestionario..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Activador 4: Webhook Personalizado para este Evento */}
            <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50/50 dark:bg-neutral-800/30">
              <div
                onClick={() => setExpandedTrigger(expandedTrigger === 'webhook' ? null : 'webhook')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black dark:text-white block">
                      Activador 4: Webhook Personalizado de Automatización (Make.com / CRM)
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Reenvío instantáneo de cada inscripción a tu flujo webhook o CRM externo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {expandedTrigger === 'webhook' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedTrigger === 'webhook' && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                    URL del Webhook Específico (Opcional):
                  </label>
                  <input
                    type="url"
                    value={customTriggers.customWebhookUrl || ''}
                    onChange={(e) => updateTrigger('customWebhookUrl', e.target.value)}
                    placeholder="https://hook.eu1.make.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-light">
                    Si se deja vacío, utilizará el webhook global configurado en el sistema RBC.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BLOQUE 4: RECURSOS COMPARTIDOS (GOOGLE DRIVE Y GOOGLE MEET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carpeta Google Drive */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-black dark:text-white">
              Carpeta de Google Drive para este Taller
            </span>
          </div>
          <input
            type="url"
            value={driveFolderUrl}
            onChange={(e) => onChange({ googleDriveFolderUrl: e.target.value })}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white font-mono"
          />
        </div>

        {/* Sala de Google Meet */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-black dark:text-white">
              Sala de Google Meet de este Taller
            </span>
          </div>
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => onChange({ meetUrl: e.target.value })}
            placeholder="https://meet.google.com/..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white font-mono"
          />
        </div>
      </div>
    </div>
  );
};
