import React, { useState, useEffect } from 'react';
import {
  User,
  Session,
  GoogleWorkspaceConfig,
  DriveExportedFile,
  GoogleCalendarEventItem,
} from '../types';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { OntologicalStore } from '../services/store';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  Calendar,
  Video,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Copy,
  Plus,
  Trash2,
  Share2,
  Check,
  ShieldCheck,
  Zap,
  Download,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface GoogleWorkspaceHubProps {
  clients: User[];
  sessions?: Session[];
  onOpenClient?: (clientId: string) => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  clients,
  sessions = [],
  onOpenClient,
}) => {
  const [config, setConfig] = useState<GoogleWorkspaceConfig>(() =>
    GoogleWorkspaceService.getConfig()
  );
  const [exportedFiles, setExportedFiles] = useState<DriveExportedFile[]>(() =>
    GoogleWorkspaceService.getExportedFiles()
  );
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'forms' | 'calendar'>('drive');

  // Loading & action states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isCreatingDrive, setIsCreatingDrive] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSchedulingEvent, setIsSchedulingEvent] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // New Event Modal / Form State
  const [selectedClientForEvent, setSelectedClientForEvent] = useState<string>(
    clients[0]?.uid || ''
  );
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventStep, setEventStep] = useState<number>(1);
  const [eventNotes, setEventNotes] = useState<string>('');

  useEffect(() => {
    loadCalendarEvents();
  }, [config.isConnected]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showNotice(`¡Enlace copiado al portapapeles: ${label}!`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const loadCalendarEvents = async () => {
    try {
      const events = await GoogleWorkspaceService.fetchUpcomingCalendarEvents();
      setCalendarEvents(events);
    } catch {
      // ignore
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await GoogleWorkspaceService.connectGoogleAccount();
      const newConfig = GoogleWorkspaceService.getConfig();
      setConfig(newConfig);
      showNotice(`¡Google Workspace conectado exitosamente con ${res.email}!`);
      loadCalendarEvents();
    } catch (err: any) {
      showNotice(`Error al conectar: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const updated = GoogleWorkspaceService.disconnect();
    setConfig(updated);
    showNotice('Sesión de Google Workspace desconectada.');
  };

  const handleSetupDrive = async () => {
    setIsCreatingDrive(true);
    try {
      const res = await GoogleWorkspaceService.setupDriveStructure();
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice('¡Estructura jerárquica de carpetas creada y verificada en Google Drive!');
    } catch (err: any) {
      showNotice(`Error en Google Drive: ${err.message}`);
    } finally {
      setIsCreatingDrive(false);
    }
  };

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const currentClients = OntologicalStore.getUsers();
      const res = await GoogleWorkspaceService.syncClientsToGoogleSheet(currentClients);
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice(`¡${res.rowCount} clientes sincronizados en Google Sheets (${res.spreadsheetUrl})!`);
    } catch (err: any) {
      showNotice(`Error al sincronizar Sheets: ${err.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCreateForm = async () => {
    setIsCreatingForm(true);
    try {
      const res = await GoogleWorkspaceService.createOntologicalForm();
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice('¡Cuestionario ontológico oficial generado en Google Forms!');
    } catch (err: any) {
      showNotice(`Error en Google Forms: ${err.message}`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.uid === selectedClientForEvent);
    if (!targetClient) return;

    setIsSchedulingEvent(true);
    try {
      const res = await GoogleWorkspaceService.scheduleCoachingCalendarEvent(
        targetClient,
        new Date(eventDate).toISOString(),
        eventStep,
        eventNotes
      );
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      await loadCalendarEvents();
      showNotice(
        `¡Sesión ${eventStep} agendada en Google Calendar para ${targetClient.name} con sala Google Meet!`
      );
      setEventNotes('');
    } catch (err: any) {
      showNotice(`Error en Calendar: ${err.message}`);
    } finally {
      setIsSchedulingEvent(false);
    }
  };

  const handleDeleteFile = (id: string, name: string) => {
    GoogleWorkspaceService.deleteExportedFile(id);
    setExportedFiles(GoogleWorkspaceService.getExportedFiles());
    showNotice(`Archivo removido del registro: ${name}`);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold tracking-wide border border-neutral-700 dark:border-neutral-200 animate-slide-up">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Header / Ecosystem Brain Banner */}
      <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cerebro Operativo Google Workspace Conectado</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Ecosistema Google Workspace
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 max-w-2xl font-light leading-relaxed">
              Cuenta Ancla Master:{' '}
              <span className="font-semibold text-black dark:text-white font-mono">
                {config.accountEmail}
              </span>
              . Sincronización bidireccional de clientes en{' '}
              <span className="font-semibold text-black dark:text-white">Google Sheets</span>,
              archivo automático de reportes PDF en{' '}
              <span className="font-semibold text-black dark:text-white">Google Drive</span>,
              cuestionarios en{' '}
              <span className="font-semibold text-black dark:text-white">Google Forms</span> y
              sesiones 1 a 1 en{' '}
              <span className="font-semibold text-black dark:text-white">
                Google Calendar & Meet
              </span>
              .
            </p>
          </div>

          {/* Connection Controller Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {config.isConnected ? (
              <>
                <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-left">
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider block font-bold">
                    Estado de Cuenta
                  </span>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Autorizado & Activo</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 rounded-2xl border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                  <span>{isConnecting ? 'Re-sincronizando...' : 'Re-autorizar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2.5 shadow-lg shadow-black/10 cursor-pointer"
              >
                <HardDrive className="w-4 h-4" />
                <span>{isConnecting ? 'Conectando...' : 'Conectar con rengifobastoco@gmail.com'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Barometer for Google Ecosystem */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800/80">
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Documentos en Drive
            </span>
            <div className="text-lg font-black text-black dark:text-white mt-1">
              {exportedFiles.length}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
              Informes PDF y matrices
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Registros Sheets
            </span>
            <div className="text-lg font-black text-black dark:text-white mt-1">
              {clients.length} Clientes
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Matriz 100% al día</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Cuestionarios Forms
            </span>
            <div className="text-lg font-black text-black dark:text-white mt-1">
              {config.forms.activeFormId ? '1 Activo' : '0'}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
              5 preguntas somáticas
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Calendar & Meet
            </span>
            <div className="text-lg font-black text-black dark:text-white mt-1">
              {calendarEvents.length} Sesiones
            </div>
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
              Salas Google Meet activas
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Services */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-neutral-800 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('drive')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Google Drive ({exportedFiles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets (Directorio)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Google Forms (Reflexiones)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Google Calendar & Meet</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GOOGLE DRIVE & ARCHIVOS EXPORTADOS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'drive' && (
        <div className="space-y-6 animate-fade-in">
          {/* Drive Folders Architecture Card */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Estructura en la Nube
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Jerarquía de Carpetas en Drive
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Organización centralizada en Google Drive ({config.accountEmail}).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSetupDrive}
                  disabled={isCreatingDrive}
                  className="px-4 py-2 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCreatingDrive ? 'animate-spin' : ''}`} />
                  <span>{isCreatingDrive ? 'Verificando...' : 'Verificar / Crear Carpetas'}</span>
                </button>

                <a
                  href="https://drive.google.com/drive/u/0/my-drive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Abrir Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Folder Branches Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                    PDFs
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  01_Reportes_e_Informes_PDF
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Archivado automático al emitir diagnósticos ontológicos por sesión.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Sheets
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  02_Directorio_y_Matriz_Maestra
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Hoja de cálculo bidireccional con estados semáforo y quiebres.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                    Forms
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  03_Cuestionarios_y_Reflexiones
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Formularios para registro somático y compromisos de coachees.
                </p>
              </div>
            </div>
          </div>

          {/* Exported Documents Table */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-black dark:text-white">
                  Archivos & Reportes Sincronizados ({exportedFiles.length})
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                  Documentos almacenados en la cuenta {config.accountEmail}.
                </p>
              </div>
            </div>

            {exportedFiles.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Folder className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No hay documentos registrados en Drive aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 border-b border-gray-100 dark:border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Nombre del Documento</th>
                      <th className="py-3.5 px-4 font-semibold">Tipo</th>
                      <th className="py-3.5 px-4 font-semibold">Cliente Asociado</th>
                      <th className="py-3.5 px-4 font-semibold">Fecha de Subida</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {exportedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            {file.category === 'pdf_report' ? (
                              <FileText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            ) : file.category === 'sheet' ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-black dark:text-white line-clamp-1">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                            {file.sizeFormatted || 'Archivo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">
                          {file.clientName || 'General / Master'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 dark:text-neutral-500 font-mono text-[11px]">
                          {new Date(file.uploadedAt).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <span>Abrir</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                              title="Eliminar del registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE SHEETS (DIRECTORIO MAESTRO)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'sheets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Matriz Central de Datos
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Directorio Maestro en Google Sheets
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Sincroniza en tiempo real los {clients.length} clientes, quiebres ontológicos y
                  montos invertidos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncSheets}
                  disabled={isSyncingSheets}
                  className="px-5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingSheets
                      ? 'Sincronizando...'
                      : `Sincronizar ${clients.length} Clientes`}
                  </span>
                </button>

                <a
                  href={
                    config.sheets.masterSpreadsheetUrl ||
                    'https://docs.google.com/spreadsheets/u/0/'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Abrir en Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Sync Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">
                    Sincronización Bidireccional Habilitada
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-light text-[11px]">
                    Última sincronización:{' '}
                    {config.sheets.lastSyncedAt
                      ? new Date(config.sheets.lastSyncedAt).toLocaleString('es-CO')
                      : 'Reciente'}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold">
                {clients.length} Registros Activos
              </span>
            </div>

            {/* Live Table Preview of Google Sheet Data */}
            <div className="rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-neutral-900 px-5 py-3 border-b border-gray-200/80 dark:border-neutral-800 text-xs font-bold text-black dark:text-white flex items-center justify-between">
                <span>Vista Previa de Columnas en Google Sheets</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Hoja: "Clientes Activos"
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white dark:bg-[#151518] text-gray-400 border-b border-gray-100 dark:border-neutral-800 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Cliente</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-4">Quiebre Ontológico Principal</th>
                      <th className="py-2.5 px-3">Total Invertido</th>
                      <th className="py-2.5 px-3">Progreso</th>
                      <th className="py-2.5 px-3">Cuenta Google</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 bg-white dark:bg-[#151518]">
                    {clients.map((c) => (
                      <tr
                        key={c.uid}
                        className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-black dark:text-white">
                          {c.name}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {c.email}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : c.status === 'waiting'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {c.status === 'active'
                              ? '🟢 ACTIVO'
                              : c.status === 'waiting'
                              ? '🟡 EN ESPERA'
                              : '⚪ INACTIVO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-neutral-300 max-w-xs truncate">
                          {c.primaryBreakdown || 'En indagación inicial'}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-black dark:text-white">
                          {c.totalInvested || c.programFee || '$1.500.000 COP'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-medium">
                          Sesión {c.programProgress || 1}/6
                        </td>
                        <td className="py-3 px-3 text-[10px] font-mono text-gray-400">
                          {config.accountEmail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOOGLE FORMS (REFLEXIONES & CUESTIONARIOS)                          */}
      {/* ========================================================================= */}
      {activeTab === 'forms' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Indagación & Calibración Somática
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Cuestionario Ontológico en Google Forms
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Formulario oficial para el registro somático, declaraciones y quiebres de cada
                  coachee.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateForm}
                  disabled={isCreatingForm}
                  className="px-5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingForm ? 'Generando...' : 'Crear Nuevo Formulario'}</span>
                </button>
              </div>
            </div>

            {/* Active Form Card with Links */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-neutral-900 border border-purple-200/60 dark:border-purple-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      Cuestionario Ontológico Post-Sesión (Certeza & Fronteras)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      5 preguntas clave: Mapeo somático, quiebre lingüístico, compromisos y escala
                      de certeza.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 self-start sm:self-auto">
                  ✓ Formulario Oficial Activo
                </span>
              </div>

              {/* Action Buttons: Open, Edit, Copy */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={config.forms.activeFormUrl || 'https://docs.google.com/forms/u/0/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Formulario (Vista Coachee)</span>
                </a>

                <a
                  href={config.forms.activeFormEditUrl || 'https://docs.google.com/forms/u/0/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Editar en Google Forms</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      config.forms.activeFormUrl || 'https://docs.google.com/forms/u/0/',
                      'Enlace del Formulario para WhatsApp'
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? '¡Copiado!' : 'Copiar Enlace para Enviar'}</span>
                </button>
              </div>
            </div>

            {/* Questions Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider block">
                Estructura de Preguntas del Formulario:
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      Nombre y Apellidos del Coachee
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Identificación precisa en el sistema.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      Emoción y Centro Somático Predominante
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Paz, Alivio, Tensión contenida, Frustración, Miedo o Certeza.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      Indagación del Quiebre y Juicios Inconscientes
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Conversaciones automáticas que emergieron en la sesión.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    4
                  </span>
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      Declaración de Fronteras & Acuerdos de Acción
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Compromisos y límites que el coachee sostendrá.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    5
                  </span>
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      Escala de Certeza y Claridad (1 a 5)
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Métrica de transformación e impacto del proceso.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE CALENDAR & GOOGLE MEET                                       */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Schedule Session Form */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Agendamiento Directo
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Programar Sesión en Google Calendar & Google Meet
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Crea el evento en el calendario de {config.accountEmail}, genera la sala de Google
                  Meet e invita al cliente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <a
                  href={OntologicalStore.getCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Página de agendamiento de sesiones 1 a 1 en Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Agendamiento 1 a 1</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>

                <a
                  href="https://calendar.google.com/calendar/u/0/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Abrir Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Cliente Coachee
                </label>
                <select
                  value={selectedClientForEvent}
                  onChange={(e) => setSelectedClientForEvent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Fecha & Hora de la Sesión
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Nodo / Sesión del Programa
                </label>
                <select
                  value={eventStep}
                  onChange={(e) => setEventStep(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                >
                  <option value={1}>Sesión 1: Mapeo de la Transparencia</option>
                  <option value={2}>Sesión 2: Deconstrucción de Creencias</option>
                  <option value={3}>Sesión 3: Re-configuración Lingüística</option>
                  <option value={4}>Sesión 4: Arquitectura de Fronteras</option>
                  <option value={5}>Sesión 5: Sabiduría y Disposición Corporal</option>
                  <option value={6}>Sesión 6: Cierre y Dirección Personal</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Foco de Indagación u Observaciones
                </label>
                <input
                  type="text"
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Ej: Trabajar quiebre de reactividad con subordinados y acuerdos de límites..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSchedulingEvent}
                  className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {isSchedulingEvent
                      ? 'Agendando...'
                      : 'Crear Evento en Google Calendar & Generar Meet'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-black dark:text-white">
                  Próximas Sesiones Agendadas ({calendarEvents.length})
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                  Eventos vinculados en el calendario de {config.accountEmail}.
                </p>
              </div>
              <button
                type="button"
                onClick={loadCalendarEvents}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                title="Actualizar eventos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {calendarEvents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Calendar className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No hay sesiones próximas agendadas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <h5 className="font-bold text-xs sm:text-sm text-black dark:text-white">
                          {evt.summary}
                        </h5>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 font-light flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {evt.start.dateTime
                            ? new Date(evt.start.dateTime).toLocaleString('es-CO', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Fecha programada'}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-light line-clamp-1 max-w-xl">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      {evt.hangoutLink && (
                        <a
                          href={evt.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Entrar a Google Meet</span>
                        </a>
                      )}
                      <a
                        href={evt.htmlLink || 'https://calendar.google.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <span>Ver en Calendar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
