import React, { useState, useEffect } from 'react';
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
  PaymentRequest,
} from '../types';
import { OntologicalStore, DEFAULT_WEBHOOK_URL, PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ClientTrafficStatusBadge } from './ClientTrafficStatusBadge';
import { ClientDirectoryTable } from './ClientDirectoryTable';
import { ExecutiveMetricsBar } from './ExecutiveMetricsBar';
import { ClientWorkstationView } from './ClientWorkstationView';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
import { CrmPipelineManager } from './CrmPipelineManager';
import { ProgramsAndEventsManager } from './ProgramsAndEventsManager';
import { PaymentValidationManager } from './PaymentValidationManager';
import { AdminAcademicManager, AcademicAdminSubTab } from './admin/AdminAcademicManager';
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
  Banknote,
  Smartphone,
  GraduationCap,
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
  // Navigation tabs: CRM Funnel vs Clientes Ancla vs Validación de Pagos vs Eventos & Cronograma vs Google Workspace Hub vs Gemini AI vs Admin Académico
  const [activeMainTab, setActiveMainTab] = useState<'crm' | 'clients' | 'payments' | 'events' | 'workspace' | 'gemini' | 'academic'>('clients');
  const [academicInitialSubTab, setAcademicInitialSubTab] = useState<AcademicAdminSubTab>('courses');

  // Sub-view inside 'clients' tab: Directory (table/scale 20-30+) vs Workstation (1 on 1 session view)
  const [clientsViewMode, setClientsViewMode] = useState<'directory' | 'workstation'>('directory');

  // Payment Requests (Cash & Bre-B Nu Validation)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() =>
    OntologicalStore.getPaymentRequests()
  );
  const pendingPaymentCount = paymentRequests.filter((r) => r.status === 'pending').length;

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
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const res = OntologicalStore.getProspects();
    return Array.isArray(res) ? res : [];
  });
  const [clients, setClients] = useState<User[]>(() => {
    const users = OntologicalStore.getUsers();
    return Array.isArray(users) ? users.filter((u) => u && u.role === 'client') : [];
  });

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

  // Sync clients when prop changes from parent (App.tsx)
  useEffect(() => {
    if (Array.isArray(initialClients) && initialClients.length > 0) {
      setClients(initialClients.filter((u) => u && u.role === 'client'));
    }
  }, [initialClients]);

  // Keep forms, insights, and sessions strictly synchronized with selectedClientId
  useEffect(() => {
    if (selectedClient?.uid) {
      setForms(OntologicalStore.getFormsForClient(selectedClient.uid));
      setInsights(OntologicalStore.getInsightsForClient(selectedClient.uid));
      setSessions(OntologicalStore.getSessionsForClient(selectedClient.uid));
    }
  }, [selectedClientId, clients]);

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
  const handleGenerateAIAnalysis = async (targetClientId?: string, customForm?: any) => {
    const clientToProcess = (targetClientId ? clients.find((c) => c.uid === targetClientId) : null) || selectedClient;
    if (!clientToProcess) return;

    let formToProcess = customForm || latestForm;
    if (!formToProcess) {
      formToProcess = OntologicalStore.submitForm({
        clientId: clientToProcess.uid,
        sessionId: sessions[0]?.id || 'sess-baseline',
        sessionStep: clientToProcess.programProgress || 1,
        level:
          (clientToProcess.programProgress || 1) <= 2
            ? 'Nivel I'
            : (clientToProcess.programProgress || 1) <= 4
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
    } else if (customForm && !customForm.id) {
      formToProcess = OntologicalStore.submitForm(customForm);
      setForms(OntologicalStore.getFormsForClient(clientToProcess.uid));
    }

    setIsGeneratingAI(true);
    setGenerationFeedback(null);

    try {
      const result = await OntologicalStore.triggerAIAnalysisWebhook(
        clientToProcess.uid,
        formToProcess
      );

      const updatedInsights = OntologicalStore.getInsightsForClient(
        clientToProcess.uid
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

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {/* Sub-Header Navigation: Consola del Consultor Ontológico (Título Centrado y Funciones Lineales Delgadas) */}
      <div className="glass-panel-sheer border-b border-white/50 dark:border-white/10 px-4 sm:px-8 py-5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-3.5">
          {/* Centered Title & Description */}
          <div className="space-y-1 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white tracking-tight leading-tight">
              Consola del Consultor Ontológico
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
              Supervisión estratégica de clientes, gestión de embudo ontológico, validación financiera y facilitación directiva.
            </p>
          </div>

          {/* Funciones de la Consola: Botones delgados, lineales y con altura compacta */}
          <div className="w-full pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-2.5 w-full max-w-7xl mx-auto">
              {/* Función 1: Pipeline CRM */}
              <button
                id="coach-nav-crm-btn"
                type="button"
                onClick={() => setActiveMainTab('crm')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'crm'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'crm'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
                }`}>
                  <Kanban className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Pipeline CRM</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'crm'
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200'
                    }`}>
                      {prospects.length}
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'crm' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Embudo & Registros
                  </span>
                </div>
              </button>

              {/* Función 2: Clientes Ancla */}
              <button
                id="coach-nav-clients-btn"
                type="button"
                onClick={() => setActiveMainTab('clients')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'clients'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'clients'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Clientes Ancla</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'clients'
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {clients.length}
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'clients' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Directorio & 1 a 1
                  </span>
                </div>
              </button>

              {/* Función 3: Espacio Académico */}
              <button
                id="coach-nav-academic-btn"
                type="button"
                onClick={() => {
                  setAcademicInitialSubTab('courses');
                  setActiveMainTab('academic');
                }}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'academic'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'academic'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Académico</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'academic'
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                    }`}>
                      6 Mód.
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'academic' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Cursos & Meet
                  </span>
                </div>
              </button>

              {/* Función 4: Eventos & Talleres */}
              <button
                id="coach-nav-events-btn"
                type="button"
                onClick={() => setActiveMainTab('events')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'events'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'events'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                }`}>
                  <Ticket className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Eventos</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'events'
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                    }`}>
                      Agenda
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'events' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Talleres & Registro
                  </span>
                </div>
              </button>

              {/* Función 5: Validación Pagos */}
              <button
                id="coach-nav-payments-btn"
                type="button"
                onClick={() => setActiveMainTab('payments')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'payments'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'payments'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                }`}>
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Pagos</span>
                    {pendingPaymentCount > 0 ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500 text-white animate-pulse shrink-0 shadow-xs">
                        {pendingPaymentCount} pend.
                      </span>
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                        activeMainTab === 'payments'
                          ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                      }`}>
                        {paymentRequests.length}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'payments' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Bre-B Nu & Efectivo
                  </span>
                </div>
              </button>

              {/* Función 6: Google Workspace */}
              <button
                id="coach-nav-workspace-btn"
                type="button"
                onClick={() => setActiveMainTab('workspace')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'workspace'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'workspace'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Workspace</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Sync</span>
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'workspace' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Drive, Sheets, Forms
                  </span>
                </div>
              </button>

              {/* Función 7: Gemini 3.7 Copiloto */}
              <button
                id="coach-nav-gemini-btn"
                type="button"
                onClick={() => setActiveMainTab('gemini')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'gemini'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'gemini'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Gemini 3.7</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'gemini'
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200'
                    }`}>
                      IA Flash
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'gemini' ? 'text-white/80 dark:text-black/70' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Copiloto Ontológico
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING PAYMENTS NOTIFICATION BANNER */}
      {pendingPaymentCount > 0 && activeMainTab !== 'payments' && (
        <div className="mx-4 sm:mx-10 mt-4 max-w-7xl mx-auto p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
            </span>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {pendingPaymentCount} solicitud(es) de pago en espera de validación
              </span>
              <span className="text-amber-800 dark:text-amber-300 font-light block sm:inline sm:ml-1">
                (Efectivo en sesión o transferencia Bre-B Nu @ASL775).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveMainTab('payments')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-98 shadow-xs shrink-0"
          >
            <span>Revisar y Validar Pagos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            handleSelectClient(cid, true);
            setActiveMainTab('clients');
          }}
          onOpenMakeModal={() => {
            setAcademicInitialSubTab('automations');
            setActiveMainTab('academic');
          }}
          onOpenRegistrationPortal={onOpenRegistrationPortal}
        />
      ) : activeMainTab === 'payments' ? (
        /* ========================================================================= */
        /* VIEW: GESTIÓN & VALIDACIÓN DE PAGOS (EFECTIVO & BRE-B NU)                  */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <PaymentValidationManager
            requests={paymentRequests}
            clients={clients}
            coachName={coach.name}
            onRequestUpdated={() => {
              setPaymentRequests(OntologicalStore.getPaymentRequests());
              handleRefreshClientsList();
            }}
            onClientUnlocked={() => {
              handleRefreshClientsList();
            }}
          />
        </div>
      ) : activeMainTab === 'clients' ? (
        /* ========================================================================= */
        /* VIEW 2: CLIENTES ANCLA (DIRECTORIO GERENCIAL & FICHA DE TRABAJO 1 A 1)    */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Executive KPI & Health Barometer (Visible ONLY in Directory mode for macro view, avoiding clutter in 1-on-1 session) */}
          {clientsViewMode === 'directory' && (
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
          )}

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
                  <>Ficha de Consulta 1 a 1: <strong className="font-semibold">{selectedClient?.name || 'Cliente'}</strong></>
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
              client={selectedClient}
              selectedClient={selectedClient}
              clients={clients}
              forms={forms}
              insights={insights}
              sessions={sessions}
              isGeneratingAI={isGeneratingAI}
              generationFeedback={generationFeedback}
              onSelectClient={(clientId) => handleSelectClient(clientId, true)}
              onBackToDirectory={() => setClientsViewMode('directory')}
              onGenerateAI={handleGenerateAIAnalysis}
              onGenerateAIAnalysis={handleGenerateAIAnalysis}
              onOpenNewSession={() => setShowNewSessionModal(true)}
              onOpenNewSessionModal={() => setShowNewSessionModal(true)}
              onAdvanceStep={(clientId) => handleAdvanceStep(clientId || selectedClient.uid)}
              onUpdateStatus={handleUpdateClientStatus}
              onUpdateClientStatus={(status) => handleUpdateClientStatus(selectedClient.uid, status)}
              onUpdateBreakdown={handleUpdateClientBreakdown}
              onUpdateClientBreakdown={(breakdown) => handleUpdateClientBreakdown(selectedClient.uid, breakdown)}
              onUpdateInvested={handleUpdateClientInvested}
              onUpdateClientInvested={(invested) => handleUpdateClientInvested(selectedClient.uid, invested)}
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
        /* VIEW 3: GESTIÓN INTEGRAL DE EVENTOS, TALLERES & CONVOCATORIA (AGENDA)      */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <ProgramsAndEventsManager
            cronogramaEvents={cronogramaEvents}
            programs={programs}
            eventRegistrations={eventRegistrations}
            onRefreshEvents={handleRefreshEvents}
            onRefreshPrograms={handleRefreshPrograms}
            onRefreshRegistrations={handleRefreshRegistrations}
            onOpenRegistrationPortal={onOpenRegistrationPortal}
          />
        </div>
      ) : activeMainTab === 'workspace' ? (
        /* ========================================================================= */
        /* VIEW 4: GOOGLE WORKSPACE HUB (DRIVE, SHEETS, FORMS, CALENDAR & MEET)     */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <GoogleWorkspaceHub
            clients={clients}
            sessions={allSessions}
            onOpenClient={(cid) => {
              handleSelectClient(cid, true);
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
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-hidden"
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.name} ({c.company || 'Directivo'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <GeminiOntologicalCopilot
            currentClient={clients.find((c) => c.uid === selectedClientId) || clients[0]}
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
      ) : activeMainTab === 'academic' ? (
        /* ========================================================================= */
        /* VIEW 6: ESPACIO ADMINISTRADOR ACADÉMICO (CURSOS, TEMARIOS, PASOS, PREGUNTAS) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <AdminAcademicManager initialSubTab={academicInitialSubTab} />
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
    </div>
  );
};
