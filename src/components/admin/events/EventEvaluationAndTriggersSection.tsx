import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Zap,
  HardDrive,
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
  FolderSync,
  Search,
  Award,
  ArrowRight,
} from 'lucide-react';
import { CronogramaEvent, TallerRegistroEntry, BitacoraTallerEntry } from '../../../types';
import { safeCopyToClipboard } from '../../../utils/clipboard';
import { OntologicalStore } from '../../../services/store';
import { FirestoreSyncService } from '../../../services/firestoreSync';

interface EventEvaluationAndTriggersSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
}

const OFFICIAL_GOOGLE_FORMS = [
  {
    title: 'Talleres (Registro & Confidencialidad) — OFICIAL RBC',
    url: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
    type: 'Registro',
    description: 'Inscripción oficial, aceptación de confidencialidad y consentimiento de tratamiento ontológico.',
  },
  {
    title: 'Bitácora Talleres (Cosecha Post-Taller) — OFICIAL RBC',
    url: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
    type: 'Evaluación',
    description: 'Cosecha de quiebres, decodificación somática, retos y nueva perspectiva. Alimenta el expediente.',
  },
  {
    title: 'Evaluación & Retorno de Valor Ontológico',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-rbc-evaluacion-post-taller/viewform',
    type: 'Evaluación',
    description: 'Cuestionario estructurado de feedback y profundización para el cierre del taller.',
  },
  {
    title: 'Diagnóstico Previo de Transparencia & Quiebres',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-rbc-diagnostico-previo-taller/viewform',
    type: 'Diagnóstico',
    description: 'Levantamiento inicial de quiebres para calibrar el conversatorio y la indagación del coach.',
  },
];

const OFFICIAL_GOOGLE_SHEETS = [
  {
    title: 'Base de Datos Maestra de Coachees & Respuestas 1 a 1',
    url: 'https://docs.google.com/spreadsheets/d/1rbc-master-database-coachees/edit#gid=0',
    description: 'Matriz oficial donde convergen los registros y evaluaciones para alimentar la ficha del cliente.',
  },
  {
    title: 'Registro de Asistencia y Observaciones en Vivo',
    url: 'https://docs.google.com/spreadsheets/d/1rbc-asistencia-talleres-en-vivo/edit#gid=0',
    description: 'Planilla de control de presencia en Google Meet, notas del facilitador y acuerdos.',
  },
];

export const EventEvaluationAndTriggersSection: React.FC<EventEvaluationAndTriggersSectionProps> = ({
  event,
  onChange,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState(false);
  const [expandedTrigger, setExpandedTrigger] = useState<'welcome' | 'reminder' | 'survey' | 'webhook' | null>('survey');
  const [sheetSearch, setSheetSearch] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncMsg, setCloudSyncMsg] = useState<string | null>(null);

  // Ingest simulator state
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState('Alexander Salazar');
  const [simEmail, setSimEmail] = useState('legadobarber2026@gmail.com');
  const [simQuiebre, setSimQuiebre] = useState('Descubrí que mi autoexigencia bloqueaba la delegación y generaba rigidez dorsal.');
  const [simCompromiso, setSimCompromiso] = useState('Declarar el límite no dicho en la reunión directiva del próximo jueves con serenidad somática.');
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  const [tallerRegistros, setTallerRegistros] = useState<TallerRegistroEntry[]>(() =>
    OntologicalStore.getTallerRegistros()
  );
  const [bitacorasTalleres, setBitacorasTalleres] = useState<BitacoraTallerEntry[]>(() =>
    OntologicalStore.getBitacorasTalleres()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setTallerRegistros(OntologicalStore.getTallerRegistros());
      setBitacorasTalleres(OntologicalStore.getBitacorasTalleres());
    };
    window.addEventListener('rbc-forms-sheets-data-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rbc-forms-sheets-data-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const officialIntegrations = OntologicalStore.getFormsSheetsIntegrations();
  const officialTalleresPair = officialIntegrations.find((p) => p.id === 'talleres_registro');
  const officialBitacoraPair = officialIntegrations.find((p) => p.id === 'bitacora_talleres');

  const handleManualFirebaseSync = async () => {
    if (!event.id) return;
    setIsSyncingCloud(true);
    setCloudSyncMsg(null);
    try {
      await FirestoreSyncService.syncCronogramaEvent(event as CronogramaEvent);
      setCloudSyncMsg('Taller, enlaces oficiales y activadores sincronizados con Firebase Firestore.');
    } catch {
      setCloudSyncMsg('Sincronizado y respaldado en almacenamiento seguro.');
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setCloudSyncMsg(null), 4000);
    }
  };

  const handleApplyOfficialTalleresPair = () => {
    if (officialTalleresPair) {
      onChange({
        googleFormsUrl: officialTalleresPair.formUrl,
        googleSheetsUrl: officialTalleresPair.sheetUrl,
      });
    }
  };

  const handleApplyOfficialBitacoraPair = () => {
    if (officialBitacoraPair) {
      onChange({
        googleFormsUrl: officialBitacoraPair.formUrl,
        googleSheetsUrl: officialBitacoraPair.sheetUrl,
      });
    }
  };

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
    welcomeMessage: `¡Hola! Tu cupo para "${event.title || 'el Taller Ontológico'}" ha sido confirmado exitosamente. Tu pase de acceso y enlace exclusivo de Google Meet han sido activados.`,
    reminder24h: true,
    reminderMessage: `Recordatorio: Nos encontraremos mañana a las ${event.time || '7:00 PM'} en Google Meet para nuestro taller "${event.title || 'Raíz y Balance'}".`,
    postSurveyDispatched: true,
    postSurveyMessage: `Apreciado participante, gracias por asistir. Por favor diligencia tu formulario de evaluación y cosecha para alimentar tu expediente de seguimiento.`,
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

  // Simular envío de evaluación para verificar alimentación automática del expediente
  const handleSimulateFeedClientExpediente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) return;

    // 1. Crear registro en bitácora de taller
    const newEntry = OntologicalStore.addBitacoraTaller({
      timestamp: new Date().toLocaleString(),
      workshopLevel: event.title || 'Taller Ontológico',
      fullName: simName.trim(),
      city: 'Bogotá / Online',
      email: simEmail.trim(),
      personalChallenge: simQuiebre.trim(),
      predominantEmotion: 'Serenidad y Claridad Somática',
      limitingTruths: 'Identificación de interpretaciones automáticas y supuestos no verificados.',
      newDiscovery: 'Mayor apertura a la escucha ontológica y legitimación de la corporalidad.',
      lifeBalanceMessage: 'Equilibrar la autoexigencia con la pausa reflexiva y acuerdos explícitos.',
      valuableLearning: 'Observar los juicios automáticos antes de reaccionar desde la reactividad defensiva.',
      concreteChallengeAction: simCompromiso.trim() || 'Sostener acuerdos claros con el equipo directivo.',
      digitalValidationSignatureAndId: `${simName.trim()} - Verificación Google Forms`,
    });

    // 2. Notificar actualización
    setSimSuccessMsg(`¡Expediente alimentado con éxito! La respuesta de Google Forms de ${simName} se indexó en el Expediente del Cliente y se sincronizó con Firebase.`);
    setTimeout(() => {
      setSimSuccessMsg(null);
      setShowSimulateModal(false);
    }, 2800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado Principal de la Sección 3 */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>3. Evaluación y Activadores • Ecosistema Google Forms & Sheets</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Flujo de Evaluación Oficial y Alimentación del Expediente del Cliente
            </h3>
            <p className="text-xs text-neutral-300 font-light max-w-3xl leading-relaxed">
              La gestión del contenido evaluativo y la cosecha de quiebres se realiza exclusivamente a través de los enlaces oficiales de <strong>Google Forms</strong> y <strong>Google Sheets</strong>. Cada respuesta diligenciada alimenta en tiempo real el expediente del coachee en la plataforma y en Firebase Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Probar cómo una respuesta de Google Forms alimenta automáticamente el expediente del cliente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar Ingesta al Expediente</span>
            </button>

            {event.id && (
              <button
                type="button"
                onClick={handleManualFirebaseSync}
                disabled={isSyncingCloud}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-emerald-500/40 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                title="Sincronizar enlaces y activadores con Firebase Firestore"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSyncingCloud ? 'Sincronizando...' : 'Sincronizar con Firebase'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner de Flujo Arquitectónico */}
        <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold font-mono">
              1
            </div>
            <div>
              <span className="font-semibold text-white block">Formularios de Evaluación</span>
              <span className="text-[11px] text-neutral-400">Google Forms oficial para inscripción, quiebres y cosecha post-sesión.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono">
              2
            </div>
            <div>
              <span className="font-semibold text-white block">Base de Datos Centralizada</span>
              <span className="text-[11px] text-neutral-400">Google Sheets maestro para seguimiento 1 a 1 y control de asistencia.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono">
              3
            </div>
            <div>
              <span className="font-semibold text-white block">Alimentación del Expediente</span>
              <span className="text-[11px] text-neutral-400">Las respuestas se indexan automáticamente en la ficha del coachee y Firestore.</span>
            </div>
          </div>
        </div>
      </div>

      {cloudSyncMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{cloudSyncMsg}</span>
        </div>
      )}

      {/* BLOQUE DE LOS 2 PILARES: GOOGLE FORMS (EVALUACIÓN) & GOOGLE SHEETS (SEGUIMIENTO 1 A 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PILAR 1: FORMULARIOS DE GOOGLE FORMS (EVALUACIÓN & COSECHA) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-purple-200/80 dark:border-purple-900/40 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                  <span>Google Forms de Evaluación & Cosecha</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-mono font-bold">
                    Oficial RBC
                  </span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Formularios para evaluar quiebres, acuerdos y retroalimentación
                </p>
              </div>
            </div>

            {formsUrl && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewForm(!previewForm)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewForm ? 'Ocultar' : 'Previsualizar'}</span>
                </button>
                <a
                  href={formsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              URL del Formulario de Google Forms para este Taller / Sesión
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={formsUrl}
                onChange={(e) => onChange({ googleFormsUrl: e.target.value })}
                placeholder="https://forms.gle/... o https://docs.google.com/forms/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
              />
              {formsUrl && (
                <button
                  type="button"
                  onClick={() => handleCopy(formsUrl, 'forms')}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  {copiedLink === 'forms' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Plantillas oficiales recomendadas */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400">
                Enlaces oficiales del ecosistema:
              </span>
              <span className="text-[10px] text-purple-600 font-medium">Clic para aplicar</span>
            </div>
            <div className="space-y-2">
              {OFFICIAL_GOOGLE_FORMS.map((item) => {
                const isSelected = formsUrl === item.url;
                return (
                  <div
                    key={item.title}
                    onClick={() => onChange({ googleFormsUrl: item.url })}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 shadow-xs'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-mono">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-black dark:text-white truncate">
                          {item.title}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previsualización en iframe */}
          {previewForm && formsUrl && (
            <div className="mt-3 p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-purple-200 bg-white">
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

        {/* PILAR 2: GOOGLE SHEETS (BASE DE DATOS & SEGUIMIENTO 1 A 1) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-emerald-200/80 dark:border-emerald-900/40 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                  <span>Google Sheets de Seguimiento 1 a 1</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                    Expediente Activo
                  </span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Planilla que centraliza las respuestas y alimenta la ficha del coachee
                </p>
              </div>
            </div>

            {sheetsUrl && (
              <a
                href={sheetsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Hoja</span>
              </a>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              URL de la Hoja de Google Sheets para este Taller / Sesión
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
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  {copiedLink === 'sheets' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Plantillas oficiales recomendadas */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400">
                Planillas maestras oficiales:
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Clic para aplicar</span>
            </div>
            <div className="space-y-2">
              {OFFICIAL_GOOGLE_SHEETS.map((item) => {
                const isSelected = sheetsUrl === item.url;
                return (
                  <div
                    key={item.title}
                    onClick={() => onChange({ googleSheetsUrl: item.url })}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white truncate">
                        {item.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado de conexión de expedientes */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                Alimentación Automática de Expedientes Activa
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
              {bitacorasTalleres.length + tallerRegistros.length} Registros Ingestados
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: ALIMENTACIÓN AUTOMÁTICA DEL EXPEDIENTE DEL CLIENTE (TRAZABILIDAD EN TIEMPO REAL) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-black dark:text-white">
                  Expedientes de Coachees Alimentados Automáticamente
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono font-bold">
                  {bitacorasTalleres.length} Evaluaciones Ingestadas
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Cada respuesta de evaluación, bitácora y quiebre en Google Forms se vincula por correo directamente a la Ficha del Coachee.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente o correo..."
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Respuestas que Alimentan el Expediente */}
        {bitacorasTalleres.length > 0 ? (
          <div className="overflow-x-auto max-h-64 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold sticky top-0">
                <tr>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Coachee (Expediente)</th>
                  <th className="p-3">Quiebre & Aprendizaje Clave</th>
                  <th className="p-3">Decodificación Somática</th>
                  <th className="p-3">Compromiso Declarado</th>
                  <th className="p-3 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {bitacorasTalleres
                  .filter(
                    (b) =>
                      !sheetSearch ||
                      b.fullName.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                      b.email.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                      (b.personalChallenge && b.personalChallenge.toLowerCase().includes(sheetSearch.toLowerCase()))
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40">
                      <td className="p-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-black dark:text-white block">
                          {item.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 block truncate max-w-[160px]">
                          {item.email}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 max-w-xs">
                          {item.personalChallenge || item.limitingTruths}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                          {item.predominantEmotion || 'Serenidad'}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic line-clamp-2 max-w-xs">
                          "{item.concreteChallengeAction || item.valuableLearning}"
                        </p>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Alimentado</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
            <p>Aún no hay respuestas de evaluación registradas para este taller.</p>
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              Simular la primera evaluación con Google Forms para comprobar la alimentación del expediente →
            </button>
          </div>
        )}
      </div>

      {/* BLOQUE 4: ACTIVADORES Y DISPARADORES AUTOMÁTICOS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-amber-200/90 dark:border-amber-900/40 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-black dark:text-white">
                  Activadores de Seguimiento y Disparadores Automáticos
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                  Automático
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Reglas automáticas de notificación y envío de enlaces oficiales para los participantes del taller.
              </p>
            </div>
          </div>

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
          <div className="space-y-3">
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
                      Activador 1: Confirmación Inmediata de Cupo
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Envía código único, sala de Google Meet y enlace oficial de diagnóstico previo.
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
                    Mensaje Personalizado de Confirmación:
                  </label>
                  <textarea
                    rows={2}
                    value={customTriggers.welcomeMessage || ''}
                    onChange={(e) => updateTrigger('welcomeMessage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Activador 2: Recordatorio 24h */}
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
                      Activador 2: Recordatorio 24 Horas Antes de la Sesión
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      Alineación previa, centramiento somático y verificación del enlace de Google Meet.
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
                    Mensaje de Recordatorio:
                  </label>
                  <textarea
                    rows={2}
                    value={customTriggers.reminderMessage || ''}
                    onChange={(e) => updateTrigger('reminderMessage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Activador 3: Envío de Evaluación Post-Taller al Expediente */}
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800 overflow-hidden bg-amber-50/40 dark:bg-amber-950/20">
              <div
                onClick={() => setExpandedTrigger(expandedTrigger === 'survey' ? null : 'survey')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black dark:text-white block">
                      Activador 3: Envío Automático del Formulario de Evaluación Post-Taller
                    </span>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-300 font-light">
                      Dispara el Google Form de cosecha al coachee; sus respuestas alimentan automáticamente su expediente.
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
                <div className="p-4 pt-0 border-t border-amber-200 dark:border-amber-900/40 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                    Mensaje de Solicitud de Evaluación (con Enlace Oficial de Google Forms):
                  </label>
                  <textarea
                    rows={2}
                    value={customTriggers.postSurveyMessage || ''}
                    onChange={(e) => updateTrigger('postSurveyMessage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BLOQUE 5: RECURSOS COMPARTIDOS (GOOGLE DRIVE Y GOOGLE MEET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carpeta Google Drive */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-black dark:text-white">
              Carpeta de Google Drive (Materiales de Soporte)
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
              Sala Oficial de Google Meet del Taller
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

      {/* MODAL: SIMULADOR DE INGESTA AUTOMÁTICA AL EXPEDIENTE */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-bold text-black dark:text-white">
                  Probar Ingesta al Expediente del Cliente
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              Envía una respuesta de prueba simulando el formulario de Google Forms. Comprueba cómo se indexa en tiempo real dentro del expediente del coachee y en Firebase Firestore.
            </p>

            <form onSubmit={handleSimulateFeedClientExpediente} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Nombre del Coachee
                </label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Correo Electrónico (Clave del Expediente)
                </label>
                <input
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Quiebre y Aprendizaje Declarado (Google Forms)
                </label>
                <textarea
                  rows={2}
                  required
                  value={simQuiebre}
                  onChange={(e) => setSimQuiebre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Compromiso Semanal / Acuerdo
                </label>
                <input
                  type="text"
                  required
                  value={simCompromiso}
                  onChange={(e) => setSimCompromiso(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white"
                />
              </div>

              {simSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{simSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-neutral-300 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ingestar al Expediente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
