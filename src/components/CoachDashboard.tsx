import React, { useState, useEffect, Suspense } from 'react';
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
  Banknote,
  Smartphone,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';
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
import { FirebaseFirestoreMonitor } from './FirebaseFirestoreMonitor';
import { SecurityAuditModal } from './SecurityAuditModal';
import { ClientExportSummaryModal } from './ClientExportSummaryModal';
import type { AcademicAdminSubTab } from './admin/AdminAcademicManager';
import { ClientWorkstationView } from './ClientWorkstationView';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { GeminiOntologicalCopilot } from './GeminiOntologicalCopilot';
import { CrmPipelineManager } from './CrmPipelineManager';
import { PaymentValidationManager } from './PaymentValidationManager';
import { ExecutiveAnalyticsCharts } from './ExecutiveAnalyticsCharts';
import { AdminAcademicManager } from './admin/AdminAcademicManager';
import { AdminSessionsManager } from './admin/AdminSessionsManager';
import { ExperienceEditorManager } from './admin/ExperienceEditorManager';

function SectionLoadingFallback({ title = 'Cargando Módulo...' }: { title?: string }) {
  return (
    <div className="p-8 rounded-2xl glass-panel-opal border border-white/60 dark:border-white/10 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tracking-wider uppercase animate-pulse">
        {title}
      </span>
    </div>
  );
}

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
  // Navigation tabs: Clientes vs Eventos y Talleres vs Sesiones de Consultoría vs Pagos vs Gemini AI
  const [activeMainTab, setActiveMainTab] = useState<'clients' | 'crm' | 'events_sessions' | 'academic' | 'events' | 'sessions' | 'payments' | 'workspace' | 'gemini' | 'experiences'>('clients');
  const [academicInitialSubTab, setAcademicInitialSubTab] = useState<AcademicAdminSubTab>('events');

  // Sub-view inside 'clients' tab: Pipeline (CRM Kan-Ban & Gestión de Coachees) vs Workstation (Ficha 1 a 1)
  const [clientsViewMode, setClientsViewMode] = useState<'pipeline' | 'workstation'>('pipeline');

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
  const [showSecurityAuditModal, setShowSecurityAuditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
    const refreshed = OntologicalStore.getUsers().filter((u) => u && u.role === 'client');
    setClients(refreshed);
    if (onRefreshClients) onRefreshClients();
  };

  // Sync clients when prop changes from parent (App.tsx)
  useEffect(() => {
    if (Array.isArray(initialClients)) {
      setClients(initialClients.filter((u) => u && u.role === 'client'));
    }
  }, [initialClients]);

  // Real-time synchronization with all OntologicalStore and window events
  useEffect(() => {
    const handleStoreSync = () => {
      const refreshedUsers = OntologicalStore.getUsers();
      setClients(refreshedUsers.filter((u) => u && u.role === 'client'));
      setCronogramaEvents(OntologicalStore.getCronogramaEvents());
      setPrograms(OntologicalStore.getPrograms());
      setEventRegistrations(OntologicalStore.getEventRegistrations());
      setProspects(OntologicalStore.getProspects());
    };

    window.addEventListener('rbc-users-updated', handleStoreSync);
    window.addEventListener('rbc-event-registrations-updated', handleStoreSync);
    window.addEventListener('rbc-prospects-updated', handleStoreSync);
    window.addEventListener('rbc-sessions-updated', handleStoreSync);
    window.addEventListener('storage', handleStoreSync);

    return () => {
      window.removeEventListener('rbc-users-updated', handleStoreSync);
      window.removeEventListener('rbc-event-registrations-updated', handleStoreSync);
      window.removeEventListener('rbc-prospects-updated', handleStoreSync);
      window.removeEventListener('rbc-sessions-updated', handleStoreSync);
      window.removeEventListener('storage', handleStoreSync);
    };
  }, []);

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

  const handleDeleteClient = (clientId: string) => {
    handleRefreshClientsList();
    if (selectedClientId === clientId) {
      const remaining = OntologicalStore.getClients();
      if (remaining.length > 0) {
        setSelectedClientId(remaining[0].uid);
      } else {
        setSelectedClientId('');
      }
    }
  };

  const handleAddClient = (newClient: User) => {
    handleRefreshClientsList();
    setSelectedClientId(newClient.uid);
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

          {/* Funciones de la Consola: 4 Botones Principales Unificados */}
          <div className="w-full pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 w-full max-w-7xl mx-auto">
              {/* Función 1: Clientes CRM (Pipeline & Directorio) */}
              <button
                id="coach-nav-clients-btn"
                type="button"
                onClick={() => {
                  setActiveMainTab('clients');
                }}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'clients' || activeMainTab === 'crm'
                    ? 'bg-white dark:bg-[#1E1E24] text-neutral-900 dark:text-white shadow-md ring-2 ring-emerald-500/50 border border-emerald-500/30 font-bold'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'clients' || activeMainTab === 'crm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Clientes CRM</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'clients' || activeMainTab === 'crm'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {clients.length} Act.
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'clients' || activeMainTab === 'crm' ? 'text-neutral-600 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Pipeline ({prospects.length}) & Directorio
                  </span>
                </div>
              </button>

              {/* Función 2: Eventos y Talleres */}
              <button
                id="coach-nav-events-btn"
                type="button"
                onClick={() => {
                  setAcademicInitialSubTab('events');
                  setActiveMainTab('events');
                }}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'events' || activeMainTab === 'academic' || activeMainTab === 'events_sessions'
                    ? 'bg-white dark:bg-[#1E1E24] text-neutral-900 dark:text-white shadow-md ring-2 ring-rose-500/50 border border-rose-500/30 font-bold'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'events' || activeMainTab === 'academic' || activeMainTab === 'events_sessions'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Eventos y Talleres</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'events' || activeMainTab === 'academic' || activeMainTab === 'events_sessions'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                    }`}>
                      {cronogramaEvents.length} En Vivo
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'events' || activeMainTab === 'academic' || activeMainTab === 'events_sessions' ? 'text-neutral-600 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Afiche, Catálogo & Forms
                  </span>
                </div>
              </button>

              {/* Función 3: Validación Pagos */}
              <button
                id="coach-nav-payments-btn"
                type="button"
                onClick={() => setActiveMainTab('payments')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'payments'
                    ? 'bg-white dark:bg-[#1E1E24] text-neutral-900 dark:text-white shadow-md ring-2 ring-amber-500/50 border border-amber-500/30 font-bold'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'payments'
                    ? 'bg-amber-500 text-white shadow-xs'
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
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                      }`}>
                        {paymentRequests.length}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'payments' ? 'text-neutral-600 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Bre-B Nu & Efectivo
                  </span>
                </div>
              </button>

              {/* Función 5: Gemini 3.7 Copiloto */}
              <button
                id="coach-nav-gemini-btn"
                type="button"
                onClick={() => setActiveMainTab('gemini')}
                className={`group px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2.5 w-full ${
                  activeMainTab === 'gemini'
                    ? 'bg-white dark:bg-[#1E1E24] text-neutral-900 dark:text-white shadow-md ring-2 ring-purple-500/50 border border-purple-500/30 font-bold'
                    : 'glass-panel-opal hover:bg-white/90 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-white/10 shadow-2xs hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  activeMainTab === 'gemini'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate leading-tight">Gemini 3.7</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      activeMainTab === 'gemini'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                        : 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200'
                    }`}>
                      IA Flash
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-light leading-tight mt-0.5 ${
                    activeMainTab === 'gemini' ? 'text-neutral-600 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    Copiloto Ontológico
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FIREBASE FIRESTORE REAL-TIME MONITOR */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 mt-4">
        <FirebaseFirestoreMonitor />
      </div>

      {/* PENDING PAYMENTS NOTIFICATION BANNER */}
      {pendingPaymentCount > 0 && activeMainTab !== 'payments' && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 mt-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: CLIENTES (UNIFICADO: PIPELINE CRM, DIRECTORIO ACTIVO & 1 A 1)      */}
      {/* ========================================================================= */}
      {activeMainTab === 'clients' || activeMainTab === 'crm' ? (
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Executive KPI & Health Barometer */}
          {clientsViewMode === 'pipeline' && (
            <ExecutiveMetricsBar
              clients={clients}
              prospects={prospects}
              allInsights={allInsights}
              sessions={allSessions}
              onGoToClients={() => {
                setActiveMainTab('clients');
                setClientsViewMode('pipeline');
              }}
              onGoToCRM={() => {
                setActiveMainTab('clients');
                setClientsViewMode('pipeline');
              }}
              onGoToEvents={() => {
                setAcademicInitialSubTab('events');
                setActiveMainTab('academic');
              }}
            />
          )}

          {/* Workstation Header (only when inspecting an individual client) */}
          {clientsViewMode === 'workstation' && (
            <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white tracking-tight">
                    Ficha Integral del Coachee: <strong className="font-semibold">{selectedClient?.name || 'Cliente'}</strong>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                    Ficha individualizada de acompañamiento, quiebre ontológico central, bitácora y sesiones ejecutivas.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    id="btn-export-client-summary-header"
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-gray-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Exportar informe de progreso y sesiones en formato JSON o texto formateado"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Exportar Progreso y Sesiones</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientsViewMode('pipeline')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Clientes CRM</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View Content */}
          {clientsViewMode === 'pipeline' ? (
            <Suspense fallback={<SectionLoadingFallback title="Cargando Pipeline CRM..." />}>
              <CrmPipelineManager
                embedded={true}
                prospects={prospects}
                clients={clients}
                sessions={allSessions}
                eventRegistrations={eventRegistrations}
                onRefreshProspects={handleRefreshProspects}
                onRefreshClients={handleRefreshClientsList}
                onUpdateClientStatus={(clientId, newStatus) => {
                  handleUpdateClientStatus(clientId, newStatus);
                }}
                onDeleteClient={(clientId) => {
                  handleDeleteClient(clientId);
                }}
                onSelectClientAndOpenWorkstation={(cid) => {
                  handleSelectClient(cid, true);
                  setClientsViewMode('workstation');
                }}
                onOpenMakeModal={() => {
                  setAcademicInitialSubTab('automations');
                  setActiveMainTab('academic');
                }}
              />
            </Suspense>
          ) : selectedClient ? (
            <Suspense fallback={<SectionLoadingFallback title="Cargando Estación de Trabajo Directiva..." />}>
              <ClientWorkstationView
                client={selectedClient}
                selectedClient={selectedClient}
                clients={clients}
                forms={forms}
                insights={insights}
                sessions={sessions}
                isGeneratingAI={isGeneratingAI}
                generationFeedback={generationFeedback}
                onRefreshClients={handleRefreshClientsList}
                onSelectClient={(clientId) => handleSelectClient(clientId, true)}
                onBackToDirectory={() => setClientsViewMode('pipeline')}
                onOpenExportModal={() => setShowExportModal(true)}
                onGoToEvents={(subTab) => {
                  setAcademicInitialSubTab(subTab as any || 'events');
                  setActiveMainTab('academic');
                }}
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
            </Suspense>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#151518] rounded-3xl border border-gray-100 dark:border-neutral-800">
              <Users className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-black dark:text-white">No hay clientes seleccionados.</p>
              <button
                type="button"
                onClick={() => setClientsViewMode('pipeline')}
                className="mt-3 text-xs font-medium text-black dark:text-white underline cursor-pointer"
              >
                Volver al Pipeline CRM
              </button>
            </div>
          )}
        </div>
      ) : activeMainTab === 'payments' ? (
        /* ========================================================================= */
        /* VIEW 2: GESTIÓN & VALIDACIÓN DE PAGOS (EFECTIVO & BRE-B NU)                */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
          <Suspense fallback={<SectionLoadingFallback title="Cargando Métricas y Validación de Pagos..." />}>
            {/* Executive Analytics: Ingresos, Proyecciones & Validación de Pagos */}
            <ExecutiveAnalyticsCharts
              clients={clients}
              paymentRequests={paymentRequests}
              sessions={allSessions}
            />

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
          </Suspense>
        </div>
      ) : activeMainTab === 'events' || activeMainTab === 'academic' || activeMainTab === 'events_sessions' ? (
        /* ========================================================================= */
        /* VIEW 3: EVENTOS Y SESIONES (MEET EN VIVO, PROGRAMAS, FORMACIÓN & AGENDA)  */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <Suspense fallback={<SectionLoadingFallback title="Cargando Gestión Académica, Enlaces & Espacios..." />}>
            <AdminAcademicManager
              initialSubTab={academicInitialSubTab || 'events'}
              cronogramaEvents={cronogramaEvents}
              programs={programs}
              eventRegistrations={eventRegistrations}
              onRefreshEvents={handleRefreshEvents}
              onRefreshPrograms={handleRefreshPrograms}
              onRefreshRegistrations={handleRefreshRegistrations}
              onOpenRegistrationPortal={onOpenRegistrationPortal}
            />
          </Suspense>
        </div>
      ) : activeMainTab === 'sessions' ? (
        /* ========================================================================= */
        /* VIEW: SESIONES DE CONSULTORÍA (1 A 1) & ROADMAP EJECUTIVO                 */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <Suspense fallback={<SectionLoadingFallback title="Cargando Módulos de Consultoría y Roadmap..." />}>
            <AdminSessionsManager onRefreshParent={handleRefreshEvents} />
          </Suspense>
        </div>
      ) : activeMainTab === 'workspace' ? (
        /* ========================================================================= */
        /* VIEW 4: GOOGLE WORKSPACE HUB (DRIVE, SHEETS, FORMS, CALENDAR & MEET)     */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <Suspense fallback={<SectionLoadingFallback title="Cargando Google Workspace Hub..." />}>
            <GoogleWorkspaceHub
              clients={clients}
              sessions={allSessions}
              onOpenClient={(cid) => {
                handleSelectClient(cid, true);
                setActiveMainTab('clients');
              }}
            />
          </Suspense>
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

          <Suspense fallback={<SectionLoadingFallback title="Iniciando Copiloto Ontológico Gemini 3.7..." />}>
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
          </Suspense>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* VIEW: CONSTRUCTOR / EDITOR DE EXPERIENCIAS (LIENZO B&W)                   */}
      {/* ========================================================================= */}
      {activeMainTab === 'experiences' ? (
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          <Suspense fallback={<SectionLoadingFallback title="Cargando Constructor de Experiencias B&W..." />}>
            <ExperienceEditorManager />
          </Suspense>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* MODAL: AGENDAR NUEVA SESIÓN QUINCENAL */}
      {/* ========================================================================= */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-neutral-800 shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight mb-1">
              Agendar Sesión
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
                    <option key={`coach-session-node-${n.step}`} value={n.step} className="bg-white dark:bg-[#202024] text-black dark:text-white">
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

      {/* Modal de Auditoría de Seguridad y Monitoreo de Automatizaciones (Regla de 30 Días e Inscripción) */}
      <SecurityAuditModal
        isOpen={showSecurityAuditModal}
        onClose={() => setShowSecurityAuditModal(false)}
        onRefreshClients={handleRefreshClientsList}
      />

      {/* Modal de Exportación de Informe de Progreso y Sesiones (JSON / Texto Formateado) */}
      {showExportModal && selectedClient && (
        <ClientExportSummaryModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          client={selectedClient}
          clients={clients}
          onSelectClient={(clientId) => {
            handleSelectClient(clientId, false);
          }}
          sessions={sessions}
          forms={forms}
          insights={insights}
        />
      )}
    </div>
  );
};
