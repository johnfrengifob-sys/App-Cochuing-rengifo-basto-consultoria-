import React, { useState } from 'react';
import {
  User,
  FormSubmission,
  AIInsight,
  Session,
  Prospect,
  PaymentStatus,
  ClientStatus,
  ProgramNodeInfo,
  CronogramaEvent,
  EventRegistration,
  OntologicalProgram,
} from '../types';
import { OntologicalStore, DEFAULT_WEBHOOK_URL, PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { WebhookConfigModal } from './WebhookConfigModal';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ClientTrafficStatusBadge } from './ClientTrafficStatusBadge';
import { ClientDirectoryTable } from './ClientDirectoryTable';
import { ExecutiveMetricsBar } from './ExecutiveMetricsBar';
import { ClientWorkstationView } from './ClientWorkstationView';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
import { CrmPipelineManager } from './CrmPipelineManager';
import { ProgramsAndEventsManager } from './ProgramsAndEventsManager';
import {
  Users,
  Sparkles,
  Calendar,
  FileText,
  HeartPulse,
  Brain,
  ShieldCheck,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Video,
  Quote,
  Kanban,
  UserCheck,
  Phone,
  ArrowRight,
  Lock,
  Clock,
  DollarSign,
  MessageSquare,
  Filter,
  Check,
  X,
  Layers,
  Workflow,
  Copy,
  Ticket,
  CheckCheck,
  Link2,
  Download,
  FileDown,
  LayoutList,
  UserCircle2,
  HardDrive,
  BookOpen,
} from 'lucide-react';

interface CoachDashboardProps {
  coach: User;
  clients: User[];
  onRefreshClients?: () => void;
  onOpenRegistrationPortal?: () => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  coach,
  clients: initialClients,
  onRefreshClients,
  onOpenRegistrationPortal,
}) => {
  // Navigation tabs: CRM Funnel vs Clientes Ancla vs Eventos & Cronograma vs Google Workspace Hub vs Gemini AI
  const [activeMainTab, setActiveMainTab] = useState<'crm' | 'clients' | 'events' | 'workspace' | 'gemini'>('clients');

  // Sub-view inside 'clients' tab: Directory (table/scale 20-30+) vs Workstation (1 on 1 session view)
  const [clientsViewMode, setClientsViewMode] = useState<'directory' | 'workstation'>('directory');

  // Events & Programs State
  const [cronogramaEvents, setCronogramaEvents] = useState<CronogramaEvent[]>(() =>
    OntologicalStore.getCronogramaEvents()
  );
  const [programs, setPrograms] = useState<OntologicalProgram[]>(() =>
    OntologicalStore.getPrograms()
  );

  // Pre-Registrations & RSVP state
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() =>
    OntologicalStore.getEventRegistrations()
  );

  // CRM State
  const [prospects, setProspects] = useState<Prospect[]>(() =>
    OntologicalStore.getProspects()
  );
  const [clients, setClients] = useState<User[]>(() =>
    OntologicalStore.getUsers().filter((u) => u.role === 'client')
  );

  // Modal States
  const [showMakeModal, setShowMakeModal] = useState(false);

  // Active Client Selection State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.uid || ''
  );
  const selectedClient =
    clients.find((c) => c.uid === selectedClientId) || clients[0];

  const [forms, setForms] = useState<FormSubmission[]>(() =>
    selectedClient ? OntologicalStore.getFormsForClient(selectedClient.uid) : []
  );

  const [insights, setInsights] = useState<AIInsight[]>(() =>
    selectedClient ? OntologicalStore.getInsightsForClient(selectedClient.uid) : []
  );

  const [sessions, setSessions] = useState<Session[]>(() =>
    selectedClient ? OntologicalStore.getSessionsForClient(selectedClient.uid) : []
  );

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    payloadPreview?: string;
  } | null>(null);

  // New session modal state
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionFocus, setNewSessionFocus] = useState('');
  const [newSessionNumber, setNewSessionNumber] = useState<number>(
    (selectedClient?.programProgress || 1)
  );

  // All insights across all clients for executive bar
  const allInsights = OntologicalStore.getAIInsights();
  const allSessions = OntologicalStore.getSessions();

  // Refresh handlers
  const handleRefreshProspects = () => {
    setProspects(OntologicalStore.getProspects());
  };

  const handleRefreshEvents = () => {
    setCronogramaEvents(OntologicalStore.getCronogramaEvents());
  };

  const handleRefreshPrograms = () => {
    setPrograms(OntologicalStore.getPrograms());
  };

  const handleRefreshRegistrations = () => {
    setEventRegistrations(OntologicalStore.getEventRegistrations());
  };

  const handleRefreshClientsList = () => {
    const refreshed = OntologicalStore.getUsers().filter((u) => u.role === 'client');
    setClients(refreshed);
    if (onRefreshClients) onRefreshClients();
  };

  // Handle client selection switch
  const handleSelectClient = (clientId: string, openWorkstation: boolean = true) => {
    setSelectedClientId(clientId);
    setForms(OntologicalStore.getFormsForClient(clientId));
    setInsights(OntologicalStore.getInsightsForClient(clientId));
    setSessions(OntologicalStore.getSessionsForClient(clientId));
    setGenerationFeedback(null);
    if (openWorkstation) {
      setClientsViewMode('workstation');
    }
  };

  // Client Mutations
  const handleUpdateClientStatus = (clientId: string, status: ClientStatus) => {
    OntologicalStore.updateClientStatus(clientId, status);
    handleRefreshClientsList();
  };

  const handleUpdateClientBreakdown = (clientId: string, breakdown: string) => {
    OntologicalStore.updateClientBreakdown(clientId, breakdown);
    handleRefreshClientsList();
  };

  const handleUpdateClientInvested = (clientId: string, invested: string) => {
    OntologicalStore.updateClientInvested(clientId, invested);
    handleRefreshClientsList();
  };

  const latestForm = forms[0] || null;

  // Trigger Webhook and generate Ontological AI Analysis
  const handleGenerateAIAnalysis = async () => {
    if (!selectedClient) return;

    let formToProcess = latestForm;
    if (!formToProcess) {
      formToProcess = OntologicalStore.submitForm({
        clientId: selectedClient.uid,
        sessionId: sessions[0]?.id || 'sess-baseline',
        sessionStep: selectedClient.programProgress || 1,
        level:
          (selectedClient.programProgress || 1) <= 2
            ? 'Nivel I'
            : (selectedClient.programProgress || 1) <= 4
            ? 'Nivel II'
            : 'Nivel III',
        bodyEmotion:
          'Sensación de pesadez en los hombros y respiración superficial al abordar metas de liderazgo trimestrales.',
        reflections:
          'Observo tendencia a no solicitar compromisos explícitos a mi equipo, esperando que adivinen los estándares de calidad.',
        levelSpecificAnswer:
          'He postergado la conversación de renegociación de alcance con el cliente principal.',
      });
      setForms([formToProcess]);
    }

    setIsGeneratingAI(true);
    setGenerationFeedback(null);

    try {
      const result = await OntologicalStore.triggerAIAnalysisWebhook(
        selectedClient.uid,
        formToProcess
      );

      const updatedInsights = OntologicalStore.getInsightsForClient(
        selectedClient.uid
      );
      setInsights(updatedInsights);

      const payloadString = JSON.stringify(
        {
          clientId: formToProcess.clientId,
          program: 'Certeza, Fronteras & Dirección Personal',
          sessionStep: formToProcess.sessionStep,
          level: formToProcess.level,
          bodyEmotion: formToProcess.bodyEmotion,
          reflections: formToProcess.reflections,
          levelSpecificAnswer: formToProcess.levelSpecificAnswer,
          webhookEndpoint: OntologicalStore.getWebhookUrl(),
        },
        null,
        2
      );

      if (result.webhookDispatched) {
        setGenerationFeedback({
          type: 'success',
          message:
            'Análisis generado y Webhook despachado exitosamente a Make.com (HTTP 200 OK).',
          payloadPreview: payloadString,
        });
      } else {
        setGenerationFeedback({
          type: 'info',
          message: `Análisis Ontológico generado localmente (Coherencia Somática, Emocional y Lingüística). Webhook placeholder despachado (${
            result.error || 'Listo para recibir URL productiva'
          }).`,
          payloadPreview: payloadString,
        });
      }
    } catch {
      setGenerationFeedback({
        type: 'error',
        message: 'Ocurrió un inconveniente al procesar la solicitud.',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionDate) return;

    const allSessions = OntologicalStore.getSessions();
    const newSess: Session = {
      id: 'sess-' + Date.now(),
      clientId: selectedClientId,
      sessionNumber: Number(newSessionNumber),
      date: new Date(newSessionDate).toISOString(),
      meetLink: `https://meet.google.com/rbc-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`,
      status: 'scheduled',
      ontologicalFocus: newSessionFocus.trim() || undefined,
    };

    OntologicalStore.saveSessions([...allSessions, newSess]);
    setSessions(OntologicalStore.getSessionsForClient(selectedClientId));
    setShowNewSessionModal(false);
    setNewSessionDate('');
    setNewSessionFocus('');
  };

  const handleAdvanceStep = (clientId: string) => {
    const updated = OntologicalStore.advanceClientProgress(clientId);
    if (updated) {
      const refreshed = OntologicalStore.getUsers().filter((u) => u.role === 'client');
      setClients(refreshed);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Group prospects into Kanban columns
  const columnMatriz = prospects.filter((p) => p.status === 'matriz_enviada');
  const columnSesion20 = prospects.filter((p) => p.status === 'sesion_20min_agendada');
  const columnDecision = prospects.filter(
    (p) => p.status === 'convertido' || p.status === 'descartado'
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {/* Sub-Header Navigation: CRM Funnel vs Clientes Ancla */}
      <div className="border-b border-gray-100 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#151518] px-4 sm:px-10 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
            <div>
              <h1 className="text-base font-semibold text-black dark:text-white tracking-tight">
                Consola del Consultor Ontológico
              </h1>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                Embudo Comercial & Gestión del Programa Certeza (12 Semanas)
              </p>
            </div>
          </div>

          {/* Master View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1E1E22] rounded-2xl sm:rounded-full border border-gray-200/80 dark:border-neutral-700 shadow-2xs self-stretch sm:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveMainTab('crm')}
              className={`px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeMainTab === 'crm'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline CRM</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeMainTab === 'crm'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                {prospects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('clients')}
              className={`px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeMainTab === 'clients'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes Ancla</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeMainTab === 'clients'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                {clients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('events')}
              className={`px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeMainTab === 'events'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Programas & Eventos</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeMainTab === 'events'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                {programs.length + cronogramaEvents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('workspace')}
              className={`px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeMainTab === 'workspace'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs font-semibold'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              <span>Google Workspace Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveMainTab('gemini')}
              className={`px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeMainTab === 'gemini'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs font-semibold'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.7 Copiloto</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                IA
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CRM ONTO-KANBAN PIPELINE (COMPACTO, AGRUPADO Y CONVERSIÓN)        */}
      {/* ========================================================================= */}
      {activeMainTab === 'crm' ? (
        <CrmPipelineManager
          prospects={prospects}
          clients={clients}
          eventRegistrations={eventRegistrations}
          onRefreshProspects={handleRefreshProspects}
          onRefreshClients={handleRefreshClientsList}
          onSelectClientAndOpenWorkstation={(cid) => {
            setSelectedClientId(cid);
            setActiveMainTab('clients');
            setClientsViewMode('workstation');
          }}
          onOpenMakeModal={() => setShowMakeModal(true)}
          onOpenRegistrationPortal={onOpenRegistrationPortal}
        />
      ) : activeMainTab === 'clients' ? (
        /* ========================================================================= */
        /* VIEW 2: CLIENTES ANCLA (DIRECTORIO GERENCIAL & FICHA DE TRABAJO 1 A 1)    */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Executive KPI & Health Barometer (Visible for instant operational overview) */}
          <ExecutiveMetricsBar
            clients={clients}
            prospects={prospects}
            allInsights={allInsights}
            sessions={allSessions}
            onGoToClients={() => {
              setActiveMainTab('clients');
              setClientsViewMode('directory');
            }}
            onGoToCRM={() => setActiveMainTab('crm')}
            onGoToEvents={() => setActiveMainTab('events')}
          />

          {/* View Mode Switcher Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-[10px] font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                <Users className="w-3 h-3 text-black dark:text-white" />
                Programa Certeza, Fronteras & Dirección
              </div>
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white tracking-tight">
                {clientsViewMode === 'directory' ? (
                  <>Directorio Central de <strong className="font-semibold">Clientes Activos ({clients.length})</strong></>
                ) : (
                  <>Ficha de Consulta: <strong className="font-semibold">{selectedClient?.name || 'Cliente'}</strong></>
                )}
              </h2>
            </div>

            {/* Toggle Modes */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#F5F5F7] dark:bg-neutral-800 border border-gray-200/60 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setClientsViewMode('directory')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  clientsViewMode === 'directory'
                    ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs font-semibold'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Directorio (Escala)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300">
                  {clients.length}
                </span>
              </button>

              {selectedClient && (
                <button
                  type="button"
                  onClick={() => setClientsViewMode('workstation')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    clientsViewMode === 'workstation'
                      ? 'bg-white dark:bg-[#1A1A1E] text-black dark:text-white shadow-2xs font-semibold'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <UserCircle2 className="w-3.5 h-3.5" />
                  <span>Ficha 1 a 1 ({selectedClient.name.split(' ')[0]})</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-View Content */}
          {clientsViewMode === 'directory' ? (
            <ClientDirectoryTable
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={(clientId) => handleSelectClient(clientId, true)}
              onQuickSelect={(clientId) => handleSelectClient(clientId, false)}
              onUpdateStatus={handleUpdateClientStatus}
              onUpdateBreakdown={handleUpdateClientBreakdown}
              onUpdateInvested={handleUpdateClientInvested}
              onOpenNewSession={(clientId) => {
                handleSelectClient(clientId, false);
                setShowNewSessionModal(true);
              }}
            />
          ) : selectedClient ? (
            <ClientWorkstationView
              selectedClient={selectedClient}
              clients={clients}
              forms={forms}
              insights={insights}
              sessions={sessions}
              isGeneratingAI={isGeneratingAI}
              generationFeedback={generationFeedback}
              onSelectClient={(clientId) => handleSelectClient(clientId, false)}
              onBackToDirectory={() => setClientsViewMode('directory')}
              onGenerateAI={handleGenerateAIAnalysis}
              onOpenNewSession={() => setShowNewSessionModal(true)}
              onAdvanceStep={(clientId) => handleAdvanceStep(clientId)}
              onUpdateStatus={handleUpdateClientStatus}
              onUpdateBreakdown={handleUpdateClientBreakdown}
              onUpdateInvested={handleUpdateClientInvested}
            />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#151518] rounded-3xl border border-gray-100 dark:border-neutral-800">
              <Users className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-black dark:text-white">No hay clientes seleccionados.</p>
              <button
                type="button"
                onClick={() => setClientsViewMode('directory')}
                className="mt-3 text-xs font-medium text-black dark:text-white underline cursor-pointer"
              >
                Volver al Directorio
              </button>
            </div>
          )}
        </div>
      ) : activeMainTab === 'events' ? (
        /* ========================================================================= */
        /* VIEW 3: GESTIÓN INTEGRAL DE PROGRAMAS, CUPOS, PARTICIPANTES Y EVENTOS   */
        /* ========================================================================= */
        <ProgramsAndEventsManager
          events={cronogramaEvents}
          programs={programs}
          registrations={eventRegistrations}
          onRefreshEvents={handleRefreshEvents}
          onRefreshPrograms={handleRefreshPrograms}
          onRefreshRegistrations={handleRefreshRegistrations}
          onOpenRegistrationPortal={onOpenRegistrationPortal}
        />
      ) : activeMainTab === 'workspace' ? (
        /* ========================================================================= */
        /* VIEW 4: GOOGLE WORKSPACE HUB (DRIVE, SHEETS, FORMS, CALENDAR & MEET)     */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <GoogleWorkspaceHub
            clients={clients}
            sessions={allSessions}
            onOpenClient={(cid) => {
              setSelectedClientId(cid);
              setClientsViewMode('workstation');
              setActiveMainTab('clients');
            }}
          />
        </div>
      ) : activeMainTab === 'gemini' ? (
        /* ========================================================================= */
        /* VIEW 5: GOOGLE GEMINI 3.7 AI ONTOLÓGICO COPILOTO & SIMULADOR             */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 block">
                Google AI Studio • Modelo Gemini 3.7 Flash
              </span>
              <h2 className="text-2xl font-light text-black dark:text-white tracking-tight mt-0.5">
                Copiloto Ontológico, Simulador de Conversaciones & Copys
              </h2>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1 max-w-2xl">
                Supervisión asistida con inteligencia artificial ontológica, role-play directivo de quiebres, redacción de publicidad y generación de diagnósticos ejecutivos.
              </p>
            </div>

            {/* Quick client selector if coach wants to anchor context */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-light">Cliente en Foco:</span>
              <select
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(e.target.value || null)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-hidden"
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Directivo'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <GeminiOntologicalCopilot
            currentClient={clients.find((c) => c.id === selectedClientId) || clients[0]}
            userRole="coach"
            onApplyInsightToClient={(diag) => {
              if (selectedClientId) {
                OntologicalStore.saveAIInsight({
                  id: 'insight-gemini-' + Date.now(),
                  clientId: selectedClientId,
                  sessionId: 'session-gemini',
                  sessionStep: 1,
                  linguisticBarriers: diag.linguisticBarriers,
                  somaticIndicators: diag.somaticIndicators,
                  recommendedShift: diag.recommendedShift,
                  powerfulQuestions: diag.powerfulQuestions,
                  confidenceScore: diag.somaticScore,
                  generatedAt: new Date().toISOString(),
                });
                onRefreshClients?.();
              }
            }}
          />
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* MODAL: AGENDAR NUEVA SESIÓN QUINCENAL */}
      {/* ========================================================================= */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-neutral-800 shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight mb-1">
              Agendar Sesión en Programa
            </h3>
            <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
              Para {selectedClient?.name} • Programa Certeza (12 Semanas)
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2">
                  Número de Sesión en el Roadmap (1 al 6)
                </label>
                <select
                  value={newSessionNumber}
                  onChange={(e) => setNewSessionNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  {PROGRAM_NODES.map((n) => (
                    <option key={n.step} value={n.step} className="bg-white dark:bg-[#202024] text-black dark:text-white">
                      Sesión {n.step}: {n.sessionTitle} ({n.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2">
                  Foco Ontológico de la Sesión
                </label>
                <textarea
                  rows={3}
                  value={newSessionFocus}
                  onChange={(e) => setNewSessionFocus(e.target.value)}
                  placeholder="Ej. Revisión de mandatos de autoexigencia y diseño de conversaciones..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-y"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <LiquidGlassButton type="submit">
                  Confirmar y Generar Meet
                </LiquidGlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: MAKE.COM CONFIGURATION & LIVE TESTER */}
      {/* ========================================================================= */}
      <WebhookConfigModal
        isOpen={showMakeModal}
        onClose={() => setShowMakeModal(false)}
        onProspectAdded={() => setProspects(OntologicalStore.getProspects())}
      />
    </div>
  );
};
