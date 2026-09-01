import React, { useState } from 'react';
import {
  User,
  FormSubmission,
  AIInsight,
  Session,
  Prospect,
  ProspectStatus,
  PaymentStatus,
  ProgramNodeInfo,
  CronogramaEvent,
  EventRegistration,
} from '../types';
import { OntologicalStore, DEFAULT_WEBHOOK_URL, PROGRAM_NODES } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PulseBadge } from './PulseBadge';
import { WebhookConfigModal } from './WebhookConfigModal';
import { PromotionalEventBanner } from './PromotionalEventBanner';
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
  // Navigation tabs: CRM Funnel vs Clientes Ancla vs Eventos & Cronograma
  const [activeMainTab, setActiveMainTab] = useState<'crm' | 'clients' | 'events'>('crm');

  // Events & Cronograma State
  const [cronogramaEvents, setCronogramaEvents] = useState<CronogramaEvent[]>(() =>
    OntologicalStore.getCronogramaEvents()
  );

  // Pre-Registrations & RSVP state
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() =>
    OntologicalStore.getEventRegistrations()
  );
  const [copiedLinkFeedback, setCopiedLinkFeedback] = useState(false);

  // CRM State
  const [prospects, setProspects] = useState<Prospect[]>(() =>
    OntologicalStore.getProspects()
  );
  const [clients, setClients] = useState<User[]>(() =>
    OntologicalStore.getUsers().filter((u) => u.role === 'client')
  );

  // New Prospect Modal State
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [showMakeModal, setShowMakeModal] = useState(false);
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectNotes, setProspectNotes] = useState('');

  // Conversion Modal State
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('Completado');

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

  // Handle client selection switch
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setForms(OntologicalStore.getFormsForClient(clientId));
    setInsights(OntologicalStore.getInsightsForClient(clientId));
    setSessions(OntologicalStore.getSessionsForClient(clientId));
    setGenerationFeedback(null);
  };

  const latestForm = forms[0] || null;
  const latestInsight = insights[0] || null;

  // --- CRM ACTIONS ---
  const handleStatusChange = (prospectId: string, newStatus: ProspectStatus) => {
    OntologicalStore.updateProspectStatus(prospectId, newStatus);
    setProspects(OntologicalStore.getProspects());
  };

  const handleAddProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim() || !prospectPhone.trim()) return;

    OntologicalStore.addProspect({
      name: prospectName.trim(),
      whatsapp: prospectPhone.trim(),
      email: prospectEmail.trim() || undefined,
      notes: prospectNotes.trim() || 'Participante de Conversatorio Raíz y Balance',
      status: 'matriz_enviada',
      origin: 'Conversatorio Raíz y Balance',
      matrixSentAt: new Date().toISOString(),
    });

    setProspects(OntologicalStore.getProspects());
    setProspectName('');
    setProspectPhone('');
    setProspectEmail('');
    setProspectNotes('');
    setShowAddProspectModal(false);
  };

  const handleConfirmConversion = () => {
    if (!convertingProspect) return;
    const newClient = OntologicalStore.convertProspectToClient(
      convertingProspect.id,
      selectedPaymentStatus
    );

    if (newClient) {
      const updatedClients = OntologicalStore.getUsers().filter(
        (u) => u.role === 'client'
      );
      setClients(updatedClients);
      setProspects(OntologicalStore.getProspects());
      setSelectedClientId(newClient.uid);
      setForms(OntologicalStore.getFormsForClient(newClient.uid));
      setInsights(OntologicalStore.getInsightsForClient(newClient.uid));
      setSessions(OntologicalStore.getSessionsForClient(newClient.uid));
      setConvertingProspect(null);
      setActiveMainTab('clients');
      if (onRefreshClients) onRefreshClients();
    }
  };

  const handleCopyRegistrationLink = () => {
    const url = `${window.location.origin}/?view=registro`;
    navigator.clipboard.writeText(url);
    setCopiedLinkFeedback(true);
    setTimeout(() => setCopiedLinkFeedback(false), 2500);
  };

  const handleConfirmAttendance = (ticketCodeOrId: string) => {
    OntologicalStore.confirmEventAttendance(ticketCodeOrId);
    setEventRegistrations(OntologicalStore.getEventRegistrations());
    setProspects(OntologicalStore.getProspects());
    const refreshedClients = OntologicalStore.getUsers().filter((u) => u.role === 'client');
    setClients(refreshedClients);
    if (onRefreshClients) onRefreshClients();
  };

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
          message: `Análisis Ontológico generado localmente (Norberto Levý Framework). Webhook placeholder despachado (${
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
      meetLink: `https://meet.google.com/rbc-${Math.random()
        .toString(36)
        .substring(2, 7)}`,
      status: 'scheduled',
      notes:
        newSessionFocus ||
        `Sesión ${newSessionNumber}: Indagación ontológica y diseño de acuerdos.`,
    };

    localStorage.setItem('rbc_sessions_v2', JSON.stringify([...allSessions, newSess]));
    setSessions([...sessions, newSess]);
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
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#202024] rounded-full border border-gray-200/80 dark:border-neutral-700 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveMainTab('crm')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'crm'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Pipeline CRM (Raíz & Balance)
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'clients'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Clientes Ancla (Programa 1 a 1)
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'events'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Cronograma & Eventos IA
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeMainTab === 'events'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                {cronogramaEvents.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CRM ONTO-KANBAN PIPELINE */}
      {/* ========================================================================= */}
      {activeMainTab === 'crm' ? (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
          {/* CRM Top Bar info & Quick Add */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-neutral-800 gap-4">
            <div>
              <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400 dark:text-neutral-500 block">
                Fase 1 & 2 • Embudo de Conversión
              </span>
              <h2 className="text-2xl font-light text-black dark:text-white tracking-tight mt-0.5">
                Pipeline de Exploración:{' '}
                <strong className="font-semibold">Conversatorio Raíz y Balance</strong>
              </h2>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1 max-w-2xl">
                Automatiza la transición de los asistentes del conversatorio que solicitaron la matriz vía WhatsApp hacia la sesión de 20 minutos y el cierre en el programa de 12 semanas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMakeModal(true)}
                className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1A1A1E] hover:bg-[#F9F9F9] dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-black dark:hover:border-neutral-500"
              >
                <Workflow className="w-3.5 h-3.5 text-black dark:text-white" />
                Automatización Make (Fases 1, 2 & 3)
              </button>

              <LiquidGlassButton
                onClick={() => setShowAddProspectModal(true)}
                icon={<Plus className="w-4 h-4 stroke-[1.5]" />}
              >
                Nuevo Prospecto (WhatsApp)
              </LiquidGlassButton>
            </div>
          </div>

          {/* Enlace Público de Pre-Inscripción de Inicio Rápido & Consentimiento */}
          <div className="p-6 rounded-3xl bg-black text-white dark:bg-[#151518] dark:text-white border border-black dark:border-neutral-800 shadow-lg space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 text-[10px] uppercase font-semibold tracking-wider text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Link de Inicio Rápido para Invitados
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Espacio de Registro Independiente para Asistentes al Conversatorio
                </h3>
                <p className="text-xs font-light text-neutral-300 dark:text-neutral-400 max-w-3xl leading-relaxed">
                  Comparte este enlace directo en tus grupos o redes. Los usuarios reservan su cupo con su cuenta de Google, aceptan el marco ético y de confidencialidad de la <strong>ICF</strong> y la privacidad de Gemini, y obtienen su ticket digital con código único. <em>Solo al confirmar su asistencia podrán ingresar al portal directivo completo</em>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyRegistrationLink}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedLinkFeedback ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link de Registro</span>
                    </>
                  )}
                </button>

                {onOpenRegistrationPortal && (
                  <button
                    type="button"
                    onClick={onOpenRegistrationPortal}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Probar Landing de Registro</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live RSVP Pre-registered attendees preview */}
            <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-white">
                  {eventRegistrations.length} Participantes Pre-Inscritos con Ticket Digital (RSVP):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {eventRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs"
                  >
                    <span className="font-semibold text-white">{reg.userName}</span>
                    <span className="font-mono text-[10px] text-amber-300">{reg.ticketCode}</span>
                    {reg.attendanceConfirmed ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                        Asistió &bull; Acceso Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmAttendance(reg.ticketCode)}
                        title="Confirmar asistencia durante el evento para activar su acceso al portal"
                        className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 cursor-pointer transition-all"
                      >
                        Confirmar Asistencia
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Make.com Scenario Interactive Status Banner */}
          <div className="p-5 rounded-3xl bg-[#F9F9F9] dark:bg-[#151518] border border-gray-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
                <Workflow className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    Ciclo Autónomo Make.com & Google Cloud Firestore
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-neutral-200 font-medium">
                    Fases 1, 2 & 3 Activas
                  </span>
                </div>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                  <strong>1. Atracción:</strong> Webhook &rarr; Firestore Create &rarr; WhatsApp | <strong>2. Agendamiento:</strong> Calendly &rarr; Firestore Search &rarr; Update (<code>sesion_20min_agendada</code>) | <strong>3. Cierre:</strong> Pasarela de Pago &rarr; <code>prospects</code> (convertido) &rarr; <code>users</code> (client, Nodo 1) &rarr; Gmail/WhatsApp (Bienvenida).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowMakeModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                Configurar Escenarios
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
            {/* COLUMN 1: MATRIZ ENVIADA */}
            <div className="bg-[#F9F9F9] dark:bg-[#151518] rounded-3xl p-5 border border-gray-200/80 dark:border-neutral-800 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    1. Matriz Enviada
                  </h3>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-neutral-700">
                  {columnMatriz.length}
                </span>
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                Solicitaron el ejercicio ontológico vía WhatsApp post-conversatorio.
              </p>

              <div className="space-y-3">
                {columnMatriz.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#1A1A1E] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-400 dark:text-neutral-500">
                    No hay prospectos en esta etapa.
                  </div>
                ) : (
                  columnMatriz.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-[#1A1A1E] rounded-2xl p-4.5 border border-gray-100 dark:border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-black dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
                            {p.origin}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                          {formatDate(p.createdAt)}
                        </span>
                      </div>

                      {p.notes && (
                        <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                          {p.notes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-black dark:text-neutral-200 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-black dark:text-white" />
                          {p.whatsapp}
                        </a>

                        <button
                          onClick={() =>
                            handleStatusChange(p.id, 'sesion_20min_agendada')
                          }
                          className="px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Agendar 20m <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: SESIÓN 20 MIN */}
            <div className="bg-[#F9F9F9] dark:bg-[#151518] rounded-3xl p-5 border border-gray-200/80 dark:border-neutral-800 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    2. Sesión 20 min
                  </h3>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-neutral-700">
                  {columnSesion20.length}
                </span>
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                Agendados en Google Calendar para exploración y diagnóstico.
              </p>

              <div className="space-y-3">
                {columnSesion20.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#1A1A1E] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-400 dark:text-neutral-500">
                    No hay sesiones de 20 min agendadas.
                  </div>
                ) : (
                  columnSesion20.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-[#1A1A1E] rounded-2xl p-4.5 border border-gray-100 dark:border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-black dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-light text-gray-400 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-black dark:text-white" />
                            {p.session20minDate
                              ? formatDate(p.session20minDate)
                              : 'Por coordinar'}
                          </div>
                        </div>
                      </div>

                      {p.notes && (
                        <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300 bg-[#F9F9F9] dark:bg-[#202024] p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                          {p.notes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleStatusChange(p.id, 'descartado')}
                          className="text-[10px] text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white font-light cursor-pointer"
                        >
                          Descartar
                        </button>

                        <button
                          onClick={() => setConvertingProspect(p)}
                          className="px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          Convertir a Programa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: DECISIÓN / CIERRE */}
            <div className="bg-[#F9F9F9] dark:bg-[#151518] rounded-3xl p-5 border border-gray-200/80 dark:border-neutral-800 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    3. Decisión & Cierre
                  </h3>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-neutral-700">
                  {columnDecision.length}
                </span>
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                Convertidos al programa 1 a 1 o derivados.
              </p>

              <div className="space-y-3">
                {columnDecision.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#1A1A1E] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-400 dark:text-neutral-500">
                    Sin decisiones registradas aún.
                  </div>
                ) : (
                  columnDecision.map((p) => {
                    const isConverted = p.status === 'convertido';
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl p-4.5 border space-y-2.5 transition-all ${
                          isConverted
                            ? 'bg-white dark:bg-[#1A1A1E] border-black/20 dark:border-neutral-700 shadow-xs'
                            : 'bg-white/60 dark:bg-[#1A1A1E]/60 border-gray-200 dark:border-neutral-800 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs font-semibold text-black dark:text-white">
                              {p.name}
                            </div>
                            <div className="text-[10px] font-light text-gray-400 dark:text-neutral-500">
                              {p.origin}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${
                              isConverted
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                            }`}
                          >
                            {isConverted ? 'Convertido 1 a 1' : 'Descartado'}
                          </span>
                        </div>

                        {p.notes && (
                          <p className="text-[11px] font-light text-gray-600 dark:text-neutral-300">
                            {p.notes}
                          </p>
                        )}

                        <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-light flex items-center justify-between pt-1">
                          <span>
                            {p.convertedAt
                              ? `Cierre: ${formatDate(p.convertedAt)}`
                              : 'Concluido'}
                          </span>
                          {isConverted && (
                            <button
                              onClick={() => {
                                const matchedClient = clients.find(
                                  (c) => c.name === p.name
                                );
                                if (matchedClient) {
                                  setSelectedClientId(matchedClient.uid);
                                  setActiveMainTab('clients');
                                }
                              }}
                              className="text-black dark:text-white font-medium underline text-[10px] cursor-pointer"
                            >
                              Ver en Clientes
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeMainTab === 'clients' ? (
        /* ========================================================================= */
        /* VIEW 2: CLIENTES ANCLA (PROGRAMA 1 A 1: CERTEZA, FRONTERAS & DIRECCIÓN) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Sidebar: Lista de Clientes Activos */}
          <aside className="w-full lg:w-80 bg-[#F9F9F9] dark:bg-[#151518] border-r border-gray-100 dark:border-neutral-800 p-6 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400 dark:text-neutral-500 block">
                    Programa Certeza
                  </span>
                  <h2 className="text-base font-semibold text-black dark:text-white tracking-tight mt-0.5">
                    Clientes Activos
                  </h2>
                </div>
                <span className="text-xs font-light text-gray-400 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-gray-200/60 dark:border-neutral-700">
                  {clients.length}
                </span>
              </div>

              {/* Client Navigation List */}
              <nav className="space-y-2">
                {clients.map((client) => {
                  const isSelected = client.uid === selectedClientId;
                  const clientFormsCount = OntologicalStore.getFormsForClient(
                    client.uid
                  ).length;
                  const clientLatestInsight = OntologicalStore.getLatestInsightForClient(
                    client.uid
                  );
                  const progress = client.programProgress || 1;

                  return (
                    <button
                      key={client.uid}
                      onClick={() => handleSelectClient(client.uid)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center gap-3.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-white dark:bg-[#202024] border-gray-200/80 dark:border-neutral-700 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={client.avatarUrl}
                          alt={client.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shadow-xs ring-1 ring-gray-200/60 dark:ring-neutral-700"
                        />
                        {clientLatestInsight && (
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <PulseBadge
                              flag={clientLatestInsight.pulseFlag}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-black dark:text-white truncate tracking-tight">
                          {client.name}
                        </div>
                        <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>Nodo {progress}/6</span>
                          <span>•</span>
                          <span className="text-black dark:text-neutral-200 font-medium">
                            {client.paymentStatus || 'Completado'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-black dark:text-white translate-x-0.5' : 'text-gray-300 dark:text-neutral-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Program Info Card in Sidebar */}
            <div className="pt-6 mt-6 border-t border-gray-200/60 dark:border-neutral-800 space-y-3">
              <div className="bg-white dark:bg-[#1A1A1E] p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs text-xs space-y-1.5">
                <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Estructura del Programa
                </div>
                <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                  12 Semanas • 6 Sesiones Quincenales distribuidas en 3 Niveles ontológicos (I. Transparencia, II. Corporalidad, III. Dirección).
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area: Client Roadmap & Ontological Diagnosis */}
          <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-6xl">
            {selectedClient ? (
              <div className="space-y-10">
                {/* Client Profile Header with Payment Status and Program Node */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-gray-100 dark:border-neutral-800 gap-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={selectedClient.avatarUrl}
                      alt={selectedClient.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-gray-100 dark:ring-neutral-800"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-white">
                          {selectedClient.name}
                        </h1>
                        {latestInsight && (
                          <PulseBadge flag={latestInsight.pulseFlag} size="sm" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                        <span>{selectedClient.email}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-medium text-black dark:text-white">
                          Estado de Pago: {selectedClient.paymentStatus || 'Completado'}
                        </span>
                        <span>•</span>
                        <span className="text-black dark:text-white font-semibold">
                          Nodo Actual: Sesión {selectedClient.programProgress || 1} de 6
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNewSessionModal(true)}
                      className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-[#F9F9F9] dark:hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agendar Sesión
                    </button>

                    <LiquidGlassButton
                      onClick={handleGenerateAIAnalysis}
                      isLoading={isGeneratingAI}
                      icon={<Sparkles className="w-4 h-4 stroke-[1.5]" />}
                    >
                      Generar Diagnóstico IA
                    </LiquidGlassButton>
                  </div>
                </div>

                {/* 12-Week Roadmap Progression Bar for Coach */}
                <div className="bg-[#F9F9F9] dark:bg-[#151518] rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 block">
                        Progreso en el Programa (12 Semanas)
                      </span>
                      <h3 className="text-sm font-semibold text-black dark:text-white mt-0.5">
                        Certeza, Fronteras & Dirección Personal
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-black dark:text-white">
                        Sesión {selectedClient.programProgress || 1} de 6 (
                        {Math.round(((selectedClient.programProgress || 1) / 6) * 100)}%)
                      </span>
                      <button
                        onClick={() => handleAdvanceStep(selectedClient.uid)}
                        className="block text-[11px] font-medium text-black dark:text-neutral-200 hover:underline mt-0.5 cursor-pointer"
                      >
                        Avanzar al siguiente nodo &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Visual 6-Step Stepper */}
                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {PROGRAM_NODES.map((node) => {
                      const currentProgress = selectedClient.programProgress || 1;
                      const isDone = node.step < currentProgress;
                      const isCurrent = node.step === currentProgress;

                      return (
                        <div
                          key={node.step}
                          className={`p-3 rounded-2xl text-center border transition-all ${
                            isDone
                              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                              : isCurrent
                              ? 'bg-white dark:bg-[#202024] border-black dark:border-white shadow-xs text-black dark:text-white'
                              : 'bg-white/40 dark:bg-neutral-800/40 border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-600'
                          }`}
                        >
                          <div className="text-[10px] font-medium uppercase tracking-wider">
                            S{node.step}
                          </div>
                          <div className="text-[9px] font-light truncate mt-0.5">
                            {node.level}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Webhook & Generation Feedback Banner */}
                {generationFeedback && (
                  <div
                    className={`p-5 rounded-3xl border transition-all text-xs ${
                      generationFeedback.type === 'success'
                        ? 'bg-[#F9F9F9] dark:bg-[#151518] border-black dark:border-neutral-500 text-black dark:text-white'
                        : generationFeedback.type === 'info'
                        ? 'bg-[#F9F9F9] dark:bg-[#151518] border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-200'
                        : 'bg-[#F9F9F9] dark:bg-[#151518] border-gray-300 dark:border-neutral-700 text-black dark:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {generationFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-xs leading-relaxed">
                          {generationFeedback.message}
                        </p>
                        {generationFeedback.payloadPreview && (
                          <details className="text-[11px] font-mono text-gray-600 dark:text-neutral-400">
                            <summary className="cursor-pointer font-sans font-medium text-black dark:text-white hover:underline">
                              Ver Payload JSON transmitido
                            </summary>
                            <pre className="mt-2 p-3 bg-white dark:bg-[#1A1A1E] rounded-xl border border-gray-100 dark:border-neutral-800 overflow-x-auto text-[10px] leading-tight text-black dark:text-neutral-200">
                              {generationFeedback.payloadPreview}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid Layout: Ontological Analysis Panel (Main) & Form History (Side) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  {/* Main Panel: Análisis Ontológico */}
                  <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                      {/* Panel Header */}
                      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100 dark:border-neutral-800">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
                            <Brain className="w-3.5 h-3.5 text-black dark:text-white" />
                            Diagnóstico Ontológico (Norberto Levý)
                          </div>
                          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">
                            Informe Ontológico Confidencial
                          </h2>
                        </div>

                        {latestInsight && (
                          <div className="text-right">
                            <PulseBadge flag={latestInsight.pulseFlag} size="md" />
                            <span className="text-[10px] font-light text-gray-400 dark:text-neutral-500 block mt-1">
                              Actualizado {formatDate(latestInsight.generatedAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {latestInsight ? (
                        <div className="space-y-8">
                          {/* Section 1: Sabiduría Emocional (Norberto Levý) */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <HeartPulse className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                              Sabiduría Emocional (Modelo Norberto Levý)
                            </h3>
                            <div className="p-6 rounded-2xl bg-[#F9F9F9] dark:bg-[#1A1A1E] border border-gray-100/90 dark:border-neutral-800 text-xs sm:text-sm font-light text-gray-700 dark:text-neutral-300 leading-relaxed relative">
                              <Quote className="w-6 h-6 text-gray-200 dark:text-neutral-700 absolute top-4 right-4 stroke-[1]" />
                              <p className="pr-6">{latestInsight.emotionalWisdom}</p>
                            </div>
                          </div>

                          {/* Section 2: Barreras Lingüísticas */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <FileText className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                              Barreras Lingüísticas & Quiebres
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                              {latestInsight.linguisticBarriers.map(
                                (barrier, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 text-xs font-light text-gray-700 dark:text-neutral-300"
                                  >
                                    <span className="w-5 h-5 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 flex items-center justify-center text-[10px] font-semibold text-black dark:text-white shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{barrier}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Section 3: Creencias Limitantes */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <Brain className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                              Creencias Limitantes y Mandatos
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                              {latestInsight.limitingBeliefs.map(
                                (belief, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1A1A1E] border border-gray-100 dark:border-neutral-800 text-xs font-light text-gray-800 dark:text-neutral-200 leading-relaxed italic"
                                  >
                                    {belief}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Integration Meta Footer */}
                          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-light text-gray-400 dark:text-neutral-500">
                            <span>
                              Integración Webhook:{' '}
                              <strong className="font-medium text-black dark:text-white">
                                Make.com / Ontological AI
                              </strong>
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 dark:text-neutral-500 truncate max-w-xs">
                              {DEFAULT_WEBHOOK_URL}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16 space-y-4">
                          <Brain className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto stroke-[1]" />
                          <div className="max-w-md mx-auto">
                            <h3 className="text-sm font-semibold text-black dark:text-white">
                              Sin diagnóstico ontológico generado
                            </h3>
                            <p className="text-xs font-light text-gray-400 dark:text-neutral-500 mt-1">
                              Procesa las reflexiones del cliente con el marco de Norberto Levý y sincroniza con Make.com.
                            </p>
                          </div>
                          <LiquidGlassButton
                            onClick={handleGenerateAIAnalysis}
                            isLoading={isGeneratingAI}
                            icon={<Sparkles className="w-4 h-4 stroke-[1.5]" />}
                          >
                            Generar Análisis Ahora
                          </LiquidGlassButton>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Side Column: Historial de Formularios & Sesiones */}
                  <div className="xl:col-span-4 space-y-6">
                    {/* Card: Historial de Formularios Post-Sesión */}
                    <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
                        <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                          Formularios Enviados
                        </h3>
                        <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                          {forms.length}
                        </span>
                      </div>

                      {forms.length === 0 ? (
                        <p className="text-xs font-light text-gray-400 dark:text-neutral-500 py-4 text-center">
                          El cliente aún no ha enviado formularios.
                        </p>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {forms.map((f, idx) => (
                            <div
                              key={f.id}
                              className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1A1A1E] border border-gray-100 dark:border-neutral-800 space-y-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 font-light">
                                <span className="font-medium text-black dark:text-white">
                                  Sesión #{f.sessionStep || forms.length - idx} •{' '}
                                  {f.level}
                                </span>
                                <span>{formatDate(f.submittedAt)}</span>
                              </div>

                              <div className="space-y-1">
                                <div className="text-[10px] font-semibold text-black dark:text-white uppercase tracking-wider">
                                  Emoción Somática:
                                </div>
                                <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                                  {f.bodyEmotion}
                                </p>
                              </div>

                              {f.levelSpecificAnswer && (
                                <div className="space-y-1 pt-1 border-t border-gray-200/50 dark:border-neutral-800">
                                  <div className="text-[10px] font-semibold text-black dark:text-white uppercase tracking-wider">
                                    Respuesta Específica del Nivel:
                                  </div>
                                  <p className="text-gray-700 dark:text-neutral-300 font-light leading-relaxed">
                                    {f.levelSpecificAnswer}
                                  </p>
                                </div>
                              )}

                              <div className="space-y-1 pt-1 border-t border-gray-200/50 dark:border-neutral-800">
                                <div className="text-[10px] font-semibold text-black dark:text-white uppercase tracking-wider">
                                  Reflexión / Quiebre:
                                </div>
                                <p className="text-gray-600 dark:text-neutral-400 font-light leading-relaxed">
                                  {f.reflections}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card: Sesiones Agendadas */}
                    <div className="bg-[#F9F9F9] dark:bg-[#151518] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-neutral-800">
                        <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
                          Sesiones del Cliente
                        </h3>
                        <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                          {sessions.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 bg-white dark:bg-[#1A1A1E] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-black dark:text-white capitalize">
                                {s.sessionNumber ? `Sesión ${s.sessionNumber}: ` : ''}
                                {formatDate(s.date)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                                  s.status === 'scheduled'
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                                }`}
                              >
                                {s.status === 'scheduled'
                                  ? 'Agendada'
                                  : 'Completada'}
                              </span>
                            </div>

                            {s.notes && (
                              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                                {s.notes}
                              </p>
                            )}

                            <a
                              href={s.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-medium hover:underline pt-1"
                            >
                              <Video className="w-3 h-3" />
                              Sala Google Meet <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 3: CRONOGRAMA & PUBLICIDAD IA (EVENTOS & CONVERSATORIOS)            */
        /* ========================================================================= */
        <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-neutral-800 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-[10px] font-semibold text-black dark:text-white uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Inteligencia Artificial & Cronograma
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-black dark:text-white tracking-tight">
                Espacio Publicitario IA &{' '}
                <strong className="font-semibold">Próximo Evento en Cronograma</strong>
              </h2>
              <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Este visual publicitario ha sido sintetizado por IA y se presenta automáticamente a todos los visitantes en la pantalla de inicio y a los clientes en su portal directivo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-neutral-500 font-light hidden sm:inline">
                {cronogramaEvents.length} Eventos en Agenda
              </span>
            </div>
          </div>

          {/* Section: Live AI Generated Advertising Banner Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Vista Previa en Vivo (Pantalla de Inicio & Portal de Clientes)
              </h3>
              <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
                Renderizado automático en 16:9 con tipografía suiza
              </span>
            </div>

            <PromotionalEventBanner />
          </div>

          {/* Section: Scheduled Events in Cronograma */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                  Eventos Programados en la Agenda
                </h3>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                  Selecciona cuál evento debe anunciarse en el banner publicitario principal del inicio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cronogramaEvents.map((evt) => {
                const isFeatured = evt.featured;
                return (
                  <div
                    key={evt.id}
                    className={`rounded-3xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                      isFeatured
                        ? 'bg-white dark:bg-[#1A1A1E] border-black dark:border-white shadow-md ring-1 ring-black dark:ring-white'
                        : 'bg-[#F9F9F9] dark:bg-[#151518] border-gray-200/80 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#1A1A1E] hover:border-gray-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white">
                          {evt.category}
                        </span>

                        {isFeatured ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" />
                            Activo en Inicio
                          </span>
                        ) : (
                          <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                            En espera
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-semibold text-black dark:text-white tracking-tight leading-snug">
                        {evt.title}
                      </h4>
                      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 line-clamp-2">
                        {evt.subtitle}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-100 dark:border-neutral-800">
                          <span className="text-[9px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
                            Fecha
                          </span>
                          <span className="font-medium text-black dark:text-white truncate block">
                            {evt.displayDate}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-100 dark:border-neutral-800">
                          <span className="text-[9px] uppercase font-semibold text-gray-400 dark:text-neutral-500 block">
                            Horario
                          </span>
                          <span className="font-medium text-black dark:text-white truncate block">
                            {evt.time}
                          </span>
                        </div>
                      </div>

                      {/* AI Prompt Metadata Note */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-[11px] font-light text-gray-500 dark:text-neutral-400 space-y-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-black dark:text-white flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          Prompt de Imagen IA Utilizado
                        </span>
                        <p className="italic text-gray-400 dark:text-neutral-500 line-clamp-2">
                          &quot;{evt.aiPromptUsed || 'Luxury minimalist ontological coaching banner...'}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <a
                        href={evt.meetUrl || 'https://meet.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 font-light"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Google Meet
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {!isFeatured && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cronogramaEvents.map((e) => ({
                              ...e,
                              featured: e.id === evt.id,
                            }));
                            setCronogramaEvents(updated);
                            OntologicalStore.saveCronogramaEvents(updated);
                          }}
                          className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs"
                        >
                          Fijar en el Inicio
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NUEVO PROSPECTO (WHATSAPP) */}
      {/* ========================================================================= */}
      {showAddProspectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-neutral-800 shadow-2xl animate-fade-in space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-[10px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
                Conversatorio Raíz y Balance
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white tracking-tight">
                Registrar Solicitud de Matriz
              </h3>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                Ingresa los datos del participante que solicitó el ejercicio vía WhatsApp.
              </p>
            </div>

            <form onSubmit={handleAddProspect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Gómez"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="+57 300 000 0000"
                  value={prospectPhone}
                  onChange={(e) => setProspectPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  Notas / Quiebre Inicial
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Manifestó agotamiento en delegación y necesidad de fijar límites..."
                  value={prospectNotes}
                  onChange={(e) => setProspectNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-light focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-y"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProspectModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <LiquidGlassButton type="submit">
                  Guardar en Pipeline
                </LiquidGlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONVERTIR PROSPECTO EN CLIENTE 1 A 1 */}
      {/* ========================================================================= */}
      {convertingProspect && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-neutral-800 shadow-2xl animate-fade-in space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9F9F9] dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-[10px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
                Cierre de Conversión
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white tracking-tight">
                Vincular al Programa 1 a 1
              </h3>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-1">
                Convertir a <strong>{convertingProspect.name}</strong> al programa{' '}
                <em>"Certeza, Fronteras & Dirección Personal"</em> (12 Semanas).
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                Modalidad de Pago Acordada
              </label>

              {(
                ['Completado', 'Cuota 1 de 2', 'Pago Único'] as PaymentStatus[]
              ).map((status) => (
                <label
                  key={status}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentStatus === status
                      ? 'border-black dark:border-white bg-[#F9F9F9] dark:bg-[#202024]'
                      : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#151518] hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={selectedPaymentStatus === status}
                      onChange={() => setSelectedPaymentStatus(status)}
                      className="accent-black dark:accent-white"
                    />
                    <span className="text-xs font-medium text-black dark:text-white">{status}</span>
                  </div>
                  <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
                    $1.500.000 COP
                  </span>
                </label>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 text-[11px] font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
              Al confirmar, se creará el perfil del cliente, se habilitará su Roadmap de 12 semanas (Nodo 1) y se creará su primer enlace cifrado de Google Meet.
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConvertingProspect(null)}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <LiquidGlassButton onClick={handleConfirmConversion}>
                Confirmar Cierre y Matricular
              </LiquidGlassButton>
            </div>
          </div>
        </div>
      )}

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
