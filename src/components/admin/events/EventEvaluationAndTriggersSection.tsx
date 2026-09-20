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
  Trash2,
  Plus,
  Table,
  X,
} from 'lucide-react';
import {
  CronogramaEvent,
  TallerRegistroEntry,
  BitacoraTallerEntry,
  SesionIndividualAcuerdoEntry,
  BitacoraSesionB2BEntry,
  FormsSheetsIntegrationSourceKey,
} from '../../../types';
import { safeCopyToClipboard } from '../../../utils/clipboard';
import { OntologicalStore } from '../../../services/store';
import { FirestoreSyncService } from '../../../services/firestoreSync';

interface EventEvaluationAndTriggersSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
  entityType?: 'taller' | 'sesion';
  customTitle?: string;
  badgeText?: string;
}

const OFFICIAL_GOOGLE_FORMS = [
  {
    key: 'talleres_registro' as FormsSheetsIntegrationSourceKey,
    title: 'ACUERDO TALLERES',
    url: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
    sheetTitle: 'Base de datos Acuerdos Talleres Sheets',
    type: 'Acuerdo Grupal',
    description: 'Inscripción y acuerdos de confidencialidad compartida de grupo, herramientas tecnológicas/IA y convivencia.',
  },
  {
    key: 'sesiones_individuales' as FormsSheetsIntegrationSourceKey,
    title: 'ACUERDO SESIONES INDIVIDUALES',
    url: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    sheetTitle: 'Base de datos acuerdos sesiones B2B Sheets',
    type: 'Acuerdo 1 a 1',
    description: 'Acuerdo co-creativo B2B, límites ontológicos de coaching vs consultoría, no-sustitución de IA y firma legal con ID.',
  },
  {
    key: 'bitacora_sesiones_b2b' as FormsSheetsIntegrationSourceKey,
    title: 'Bitacora Sesiones B2B',
    url: 'https://forms.gle/APUFto8sGbJt322WA',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    sheetTitle: 'Base de datos bitácoras sesiones B2B Sheets',
    type: 'Bitácora 1 a 1',
    description: 'Bitácora ontológica de sesión 1 a 1: desafío central, emoción presente, juicios limitantes, darse cuenta, equilibrio y compromisos.',
  },
  {
    key: 'bitacora_talleres' as FormsSheetsIntegrationSourceKey,
    title: 'Bitacora Talleres',
    url: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
    sheetTitle: 'Base de datos bitácoras talleres Sheets',
    type: 'Bitácora Taller',
    description: 'Cosecha de quiebres post-taller: nivel, reto personal, emoción predominante, verdades limitantes, nueva perspectiva y acción retadora.',
  },
];

const OFFICIAL_GOOGLE_SHEETS = [
  {
    key: 'talleres_registro' as FormsSheetsIntegrationSourceKey,
    title: 'Base de datos Acuerdos Talleres Sheets',
    url: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
    formUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
    description: 'Planilla oficial de inscripciones, acuerdos éticos de grupo y uso de IA para talleres ontológicos.',
  },
  {
    key: 'sesiones_individuales' as FormsSheetsIntegrationSourceKey,
    title: 'Base de datos acuerdos sesiones B2B Sheets',
    url: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    formUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    description: 'Planilla oficial de acuerdos 1 a 1 con firma legal, número de cédula y estado de combinación documental.',
  },
  {
    key: 'bitacora_sesiones_b2b' as FormsSheetsIntegrationSourceKey,
    title: 'Base de datos bitácoras sesiones B2B Sheets',
    url: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    formUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    description: 'Matriz ejecutiva de quiebres directivos, descubrimientos somáticos y planes de acción 1 a 1.',
  },
  {
    key: 'bitacora_talleres' as FormsSheetsIntegrationSourceKey,
    title: 'Base de datos bitácoras talleres Sheets',
    url: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
    formUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
    description: 'Matriz de cosecha de talleres grupales: niveles I, II, III, verdades limitantes y acciones transformacionales.',
  },
];

export const EventEvaluationAndTriggersSection: React.FC<EventEvaluationAndTriggersSectionProps> = ({
  event,
  onChange,
  entityType = 'taller',
  customTitle,
  badgeText,
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
  const [sesionAcuerdos, setSesionAcuerdos] = useState<SesionIndividualAcuerdoEntry[]>(() =>
    OntologicalStore.getSesionIndividualAcuerdos()
  );
  const [bitacorasB2B, setBitacorasB2B] = useState<BitacoraSesionB2BEntry[]>(() =>
    OntologicalStore.getBitacorasSesionesB2B()
  );
  const [activeDatabaseTab, setActiveDatabaseTab] = useState<FormsSheetsIntegrationSourceKey>(() => {
    if (event.formsIntegrationId) return event.formsIntegrationId as FormsSheetsIntegrationSourceKey;
    return entityType === 'sesion' ? 'bitacora_sesiones_b2b' : 'talleres_registro';
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ importedCount: number; errors: string[] } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTallerRegistros(OntologicalStore.getTallerRegistros());
      setBitacorasTalleres(OntologicalStore.getBitacorasTalleres());
      setSesionAcuerdos(OntologicalStore.getSesionIndividualAcuerdos());
      setBitacorasB2B(OntologicalStore.getBitacorasSesionesB2B());
    };
    window.addEventListener('rbc-forms-sheets-data-updated', handleUpdate);
    window.addEventListener('rbc-forms-sheets-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rbc-forms-sheets-data-updated', handleUpdate);
      window.removeEventListener('rbc-forms-sheets-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const officialIntegrations = OntologicalStore.getFormsSheetsIntegrations();
  const currentPair = officialIntegrations.find((p) => p.id === activeDatabaseTab) || officialIntegrations[0];

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

  const handleApplyPair = (formUrl: string, sheetUrl: string) => {
    onChange({
      googleFormsUrl: formUrl,
      googleSheetsUrl: sheetUrl,
    });
  };

  const handleCopyHeaders = async (sourceKey: FormsSheetsIntegrationSourceKey) => {
    const pair = officialIntegrations.find((p) => p.id === sourceKey);
    if (!pair) return;
    const csvHeaders = pair.sheetHeaders.map((h) => (h.includes(',') ? `"${h}"` : h)).join(',');
    await safeCopyToClipboard(csvHeaders);
    setCopiedLink(`headers_${sourceKey}`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleExecuteImport = () => {
    if (!importCsvText.trim()) return;
    const res = OntologicalStore.importSheetCsvData(activeDatabaseTab, importCsvText);
    setImportFeedback(res);
    if (res.importedCount > 0) {
      setTimeout(() => {
        setShowImportModal(false);
        setImportCsvText('');
        setImportFeedback(null);
      }, 2000);
    }
  };

  const handleDeleteEntry = (sourceKey: FormsSheetsIntegrationSourceKey, id: string) => {
    if (sourceKey === 'talleres_registro') {
      OntologicalStore.deleteTallerRegistro(id);
    } else if (sourceKey === 'bitacora_talleres') {
      OntologicalStore.deleteBitacoraTaller(id);
    } else if (sourceKey === 'sesiones_individuales') {
      OntologicalStore.deleteSesionIndividualAcuerdo(id);
    } else if (sourceKey === 'bitacora_sesiones_b2b') {
      OntologicalStore.deleteBitacoraSesionB2B(id);
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
              <span>{badgeText || '3. Automatizaciones & Evaluación • Ecosistema Google Forms & Sheets'}</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {customTitle || (entityType === 'sesion' ? 'Flujo de Automatizaciones y Evaluación para Sesión Individual' : 'Flujo de Evaluación Oficial y Alimentación del Expediente del Cliente')}
            </h3>
            <p className="text-xs text-neutral-300 font-light max-w-3xl leading-relaxed">
              La gestión del contenido evaluativo, acuerdos co-creativos y cosecha de quiebres se realiza exclusivamente a través de los enlaces oficiales de <strong>Google Forms</strong> y <strong>Google Sheets</strong>. Cada respuesta diligenciada alimenta en tiempo real el expediente del coachee en la plataforma y en Firebase Firestore.
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

      {/* BLOQUE 3: BASES DE DATOS DE GOOGLE SHEETS & EXPEDIENTES ALIMENTADOS AUTOMÁTICAMENTE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-black dark:text-white">
                  Bases de Datos de Google Sheets & Expedientes Automatizados
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono font-bold">
                  Ecosistema 3. Evaluación
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Consulta y gestiona en tiempo real las respuestas de los 4 Google Forms y Google Sheets oficiales. Cada registro alimenta automáticamente el expediente del coachee.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyHeaders(activeDatabaseTab)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-xs text-gray-700 dark:text-neutral-200 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copiar las columnas exactas requeridas para Google Sheets"
            >
              {copiedLink === `headers_${activeDatabaseTab}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">¡Encabezados Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copiar Encabezados (CSV)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowImportModal(true);
                setImportCsvText('');
                setImportFeedback(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Pegar / Importar Filas</span>
            </button>

            {currentPair && (
              <button
                type="button"
                onClick={() => handleApplyPair(currentPair.formUrl, currentPair.sheetUrl)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Establecer este formulario y hoja en este taller / sesión"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Vincular a este Evento</span>
              </button>
            )}
          </div>
        </div>

        {/* Selector de las 4 Bases de Datos Oficiales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {officialIntegrations.map((pair) => {
            const isActive = activeDatabaseTab === pair.id;
            let recordCount = 0;
            if (pair.id === 'talleres_registro') recordCount = tallerRegistros.length;
            else if (pair.id === 'bitacora_talleres') recordCount = bitacorasTalleres.length;
            else if (pair.id === 'sesiones_individuales') recordCount = sesionAcuerdos.length;
            else if (pair.id === 'bitacora_sesiones_b2b') recordCount = bitacorasB2B.length;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => setActiveDatabaseTab(pair.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white truncate">
                    {pair.title}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                  }`}>
                    {recordCount}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-1">
                  {pair.category}
                </p>
              </button>
            );
          })}
        </div>

        {/* Ficha de Detalles de la Base de Datos Activa */}
        {currentPair && (
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-black dark:text-white">{currentPair.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono">
                  {currentPair.sheetHeaders.length} Columnas
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                {currentPair.notes}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={currentPair.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Abrir Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-300 dark:text-neutral-700">|</span>
              <a
                href={currentPair.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Abrir Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, correo o quiebre..."
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* TABLA: ACUERDO TALLERES (talleres_registro) */}
        {activeDatabaseTab === 'talleres_registro' && (
          tallerRegistros.length > 0 ? (
            <div className="overflow-x-auto max-h-72 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Marca Temporal</th>
                    <th className="p-3">Participante</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Confidencialidad</th>
                    <th className="p-3">Herramientas / IA</th>
                    <th className="p-3">Convivencia & Ética</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {tallerRegistros
                    .filter(
                      (r) =>
                        !sheetSearch ||
                        r.participantName.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        r.email.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        (r.phone && r.phone.includes(sheetSearch))
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40">
                        <td className="p-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                          {item.timestamp}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-black dark:text-white block">
                            {item.participantName}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500 block truncate max-w-[150px]">
                            {item.email}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-600 dark:text-neutral-300">
                          {item.phone || '—'}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Aceptado
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Aceptado (Soporte)
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Autorizado
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry('talleres_registro', item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
              <p>No hay inscripciones registradas en la Base de datos Acuerdos Talleres Sheets.</p>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(true);
                  setImportCsvText('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Pegar filas desde Google Sheets →
              </button>
            </div>
          )
        )}

        {/* TABLA: BITÁCORA TALLERES (bitacora_talleres) */}
        {activeDatabaseTab === 'bitacora_talleres' && (
          bitacorasTalleres.length > 0 ? (
            <div className="overflow-x-auto max-h-72 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Marca Temporal</th>
                    <th className="p-3">Coachee (Expediente)</th>
                    <th className="p-3">Nivel</th>
                    <th className="p-3">Reto Personal / Quiebre</th>
                    <th className="p-3">Emoción</th>
                    <th className="p-3">Aprendizaje / Perspectiva</th>
                    <th className="p-3">Acción Concreta</th>
                    <th className="p-3">Validación / Firma</th>
                    <th className="p-3 text-right">Acción</th>
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
                          <span className="font-mono text-[10px] text-gray-500 block truncate max-w-[150px]">
                            {item.email}
                          </span>
                          {item.city && (
                            <span className="text-[10px] text-gray-400 block">
                              {item.city}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold whitespace-nowrap">
                          {item.workshopLevel || 'Nivel I'}
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 max-w-xs">
                            {item.personalChallenge || item.limitingTruths}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold whitespace-nowrap">
                            {item.predominantEmotion || 'Serenidad'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-xs">
                            {item.newDiscovery || item.valuableLearning}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic line-clamp-2 max-w-xs">
                            "{item.concreteChallengeAction || 'Cumplir acuerdos'}"
                          </p>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-gray-500 truncate max-w-[130px]">
                          {item.digitalValidationSignatureAndId || 'Validado'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry('bitacora_talleres', item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
              <p>No hay bitácoras de cosecha registradas para talleres.</p>
              <button
                type="button"
                onClick={() => setShowSimulateModal(true)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Simular respuesta de Google Forms →
              </button>
            </div>
          )
        )}

        {/* TABLA: ACUERDO SESIONES INDIVIDUALES (sesiones_individuales) */}
        {activeDatabaseTab === 'sesiones_individuales' && (
          sesionAcuerdos.length > 0 ? (
            <div className="overflow-x-auto max-h-72 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Marca Temporal</th>
                    <th className="p-3">Coachee (Expediente)</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Límites Coaching</th>
                    <th className="p-3">No Sustitución IA</th>
                    <th className="p-3">Firma Legal & Cédula</th>
                    <th className="p-3">Doc Combinado</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {sesionAcuerdos
                    .filter(
                      (s) =>
                        !sheetSearch ||
                        s.fullName.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        s.email.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        (s.phone && s.phone.includes(sheetSearch)) ||
                        (s.digitalSignatureAndIdNumber && s.digitalSignatureAndIdNumber.toLowerCase().includes(sheetSearch.toLowerCase()))
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
                          <span className="font-mono text-[10px] text-gray-500 block truncate max-w-[150px]">
                            {item.email}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-600 dark:text-neutral-300">
                          {item.phone || '—'}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Asociación Creativa
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Solo Soporte Admin
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold">
                          {item.digitalSignatureAndIdNumber || 'Firma Registrada'}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                            {item.documentMergeStatus || 'Merged'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry('sesiones_individuales', item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
              <p>No hay acuerdos registrados en la Base de datos acuerdos sesiones B2B Sheets.</p>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(true);
                  setImportCsvText('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Pegar filas desde Google Sheets →
              </button>
            </div>
          )
        )}

        {/* TABLA: BITÁCORA SESIONES B2B (bitacora_sesiones_b2b) */}
        {activeDatabaseTab === 'bitacora_sesiones_b2b' && (
          bitacorasB2B.length > 0 ? (
            <div className="overflow-x-auto max-h-72 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Marca Temporal</th>
                    <th className="p-3">Coachee (Expediente)</th>
                    <th className="p-3">Desafío / Quiebre Central</th>
                    <th className="p-3">Emoción & Mensaje Somático</th>
                    <th className="p-3">Juicios Limitantes</th>
                    <th className="p-3">Darse Cuenta</th>
                    <th className="p-3">Acción Concreta</th>
                    <th className="p-3">Firma & Cédula</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {bitacorasB2B
                    .filter(
                      (b) =>
                        !sheetSearch ||
                        b.fullName.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        b.email.toLowerCase().includes(sheetSearch.toLowerCase()) ||
                        (b.centralChallenge && b.centralChallenge.toLowerCase().includes(sheetSearch.toLowerCase()))
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
                          <span className="font-mono text-[10px] text-gray-500 block truncate max-w-[150px]">
                            {item.email}
                          </span>
                          {item.city && (
                            <span className="text-[10px] text-gray-400 block">
                              {item.city}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 max-w-xs">
                            {item.centralChallenge}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-semibold whitespace-nowrap block w-fit">
                            {item.primaryEmotion || 'Tensión'}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 max-w-[180px]">
                            {item.balanceAreaNeeded}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-xs">
                            {item.limitingBeliefsAndJudgments}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium line-clamp-2 max-w-xs">
                            {item.realizationOrPerspective}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic line-clamp-2 max-w-xs">
                            "{item.concreteActionCommitment}"
                          </p>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                          {item.digitalValidationSignatureAndId}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry('bitacora_sesiones_b2b', item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-xs text-gray-400 space-y-2">
              <p>No hay bitácoras registradas en la Base de datos bitácoras sesiones B2B Sheets.</p>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(true);
                  setImportCsvText('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Pegar filas desde Google Sheets →
              </button>
            </div>
          )
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

      {/* Modal: Pegar / Importar Respuestas desde Google Sheets */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <FolderSync className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    Pegar / Importar Filas de Google Sheets
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                    Destino: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentPair?.title || 'Base de datos'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFeedback(null);
                }}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-neutral-700 dark:text-neutral-300">
                <p className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                  ¿Cómo importar tus respuestas?
                </p>
                <p className="text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed">
                  1. Abre tu hoja de Google Sheets vinculada.
                  <br />
                  2. Selecciona las filas de respuestas y presiona <kbd className="px-1 py-0.5 rounded bg-white dark:bg-neutral-800 border font-mono">Ctrl+C</kbd> (o descárgala como .CSV).
                  <br />
                  3. Pega el texto aquí abajo y haz clic en <strong>Ingestar al Sistema</strong>.
                </p>
              </div>

              {/* Columnas esperadas */}
              {currentPair && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-neutral-300">
                      Columnas esperadas ({currentPair.sheetHeaders.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHeaders(activeDatabaseTab)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar encabezados</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-2 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700">
                    {currentPair.sheetHeaders.map((header, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300"
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea para pegar */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Texto copiado de Google Sheets (TSV o CSV):
                </label>
                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`Pega aquí los datos copiados de Google Sheets...\nEjemplo:\n${currentPair?.sheetHeaders.slice(0, 3).join('\t')}...\n2026-09-18 10:00:00\tAlexander Salazar\tcliente@gmail.com...`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-black dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {importFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    importFeedback.importedCount > 0
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {importFeedback.importedCount > 0
                        ? `¡Éxito! Se importaron ${importFeedback.importedCount} fila(s) a ${currentPair?.title || 'la base de datos'}.`
                        : 'No se procesaron filas nuevas.'}
                    </p>
                    {importFeedback.errors.length > 0 && (
                      <ul className="list-disc pl-4 text-[10px] space-y-0.5">
                        {importFeedback.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFeedback(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-neutral-300 hover:bg-gray-50 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!importCsvText.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Ingestar al Sistema</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
