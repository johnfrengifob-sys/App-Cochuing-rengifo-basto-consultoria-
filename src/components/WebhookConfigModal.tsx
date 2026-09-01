import React, { useState } from 'react';
import {
  OntologicalStore,
  DEFAULT_WEBHOOK_URL,
  DEFAULT_MAKE_PHASE1_WEBHOOK,
  DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK,
  DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK,
  DEFAULT_CALENDAR_URL,
  DEFAULT_MATRIX_URL,
  DEFAULT_PORTAL_URL,
  DEFAULT_WELCOME_MESSAGE_TEMPLATE,
} from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  X,
  Workflow,
  Sparkles,
  Phone,
  Database,
  Send,
  ExternalLink,
  Copy,
  Check,
  Play,
  ArrowRight,
  MessageSquare,
  FileText,
  Calendar,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  CreditCard,
  Mail,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { PaymentStatus } from '../types';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProspectAdded?: () => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
  onProspectAdded,
}) => {
  const [activeTab, setActiveTab] = useState<
    'phase1_funnel' | 'phase2_calendly' | 'phase3_payment' | 'phase4_ai'
  >('phase3_payment');

  // Phase 1 (Funnel) Config State
  const [phase1WebhookUrl, setPhase1WebhookUrl] = useState(() =>
    OntologicalStore.getPhase1WebhookUrl()
  );
  const [whatsAppTemplate, setWhatsAppTemplate] = useState(() =>
    OntologicalStore.getWhatsAppTemplate()
  );
  const [calendarUrl, setCalendarUrl] = useState(() =>
    OntologicalStore.getCalendarUrl()
  );
  const [matrixUrl, setMatrixUrl] = useState(() =>
    OntologicalStore.getMatrixUrl()
  );

  // Phase 2 (Calendly Booking) Config State
  const [phase2CalendlyWebhookUrl, setPhase2CalendlyWebhookUrl] = useState(() =>
    OntologicalStore.getPhase2CalendlyWebhookUrl()
  );

  // Phase 3 (High-Value Payment & Onboarding) Config State
  const [phase3PaymentWebhookUrl, setPhase3PaymentWebhookUrl] = useState(() =>
    OntologicalStore.getPhase3PaymentWebhookUrl()
  );
  const [welcomeTemplate, setWelcomeTemplate] = useState(() =>
    OntologicalStore.getWelcomeTemplate()
  );
  const [portalUrl, setPortalUrl] = useState(() =>
    OntologicalStore.getPortalUrl()
  );

  // Phase 4 (AI Ontological Coherence) Config State
  const [aiWebhookUrl, setAiWebhookUrl] = useState(() =>
    OntologicalStore.getWebhookUrl()
  );

  // Live Test State - Phase 1 (Inbound Webhook)
  const [testName, setTestName] = useState('Camila Morales');
  const [testPhone, setTestPhone] = useState('+57 315 889 4411');
  const [isTestingInbound, setIsTestingInbound] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    messageSent: string;
    docId: string;
    webhookDispatched: boolean;
  } | null>(null);

  // Live Test State - Phase 2 (Calendly Invitee Created)
  const [calendlyTestName, setCalendlyTestName] = useState('Camila Morales');
  const [calendlyTestPhone, setCalendlyTestPhone] = useState('+57 315 889 4411');
  const [calendlyTestEmail, setCalendlyTestEmail] = useState('camila.morales@ejemplo.com');
  const [calendlyEventName, setCalendlyEventName] = useState(
    'Sesión de Exploración / Integración (20 min)'
  );
  const [isTestingCalendly, setIsTestingCalendly] = useState(false);
  const [calendlyTestResult, setCalendlyTestResult] = useState<{
    success: boolean;
    matchedProspectName: string;
    docId: string;
    previousStatus?: string;
    newStatus: string;
    webhookDispatched: boolean;
  } | null>(null);

  // Live Test State - Phase 3 (Payment Gateway & Onboarding)
  const [paymentTestName, setPaymentTestName] = useState('Camila Morales');
  const [paymentTestEmail, setPaymentTestEmail] = useState('camila.morales@ejemplo.com');
  const [paymentTestPhone, setPaymentTestPhone] = useState('+57 315 889 4411');
  const [paymentGateway, setPaymentGateway] = useState('Wompi');
  const [paymentTier, setPaymentTier] = useState<PaymentStatus>('Pago Único');
  const [paymentAmount, setPaymentAmount] = useState('$1.500.000 COP');
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [paymentTestResult, setPaymentTestResult] = useState<{
    success: boolean;
    matchedProspect: boolean;
    prospectDocId?: string;
    userDocId: string;
    welcomeMessageSent: string;
    paymentStatus: string;
    amount: string;
    webhookDispatched: boolean;
  } | null>(null);

  const [saved, setSaved] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedWelcome, setCopiedWelcome] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    OntologicalStore.setPhase1WebhookUrl(phase1WebhookUrl.trim());
    OntologicalStore.setPhase2CalendlyWebhookUrl(phase2CalendlyWebhookUrl.trim());
    OntologicalStore.setPhase3PaymentWebhookUrl(phase3PaymentWebhookUrl.trim());
    OntologicalStore.setWhatsAppTemplate(whatsAppTemplate.trim());
    OntologicalStore.setWelcomeTemplate(welcomeTemplate.trim());
    OntologicalStore.setCalendarUrl(calendarUrl.trim());
    OntologicalStore.setMatrixUrl(matrixUrl.trim());
    OntologicalStore.setPortalUrl(portalUrl.trim());
    OntologicalStore.setWebhookUrl(aiWebhookUrl.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const handleResetAll = () => {
    setPhase1WebhookUrl(DEFAULT_MAKE_PHASE1_WEBHOOK);
    setPhase2CalendlyWebhookUrl(DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK);
    setPhase3PaymentWebhookUrl(DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK);
    setAiWebhookUrl(DEFAULT_WEBHOOK_URL);
    setCalendarUrl(DEFAULT_CALENDAR_URL);
    setMatrixUrl(DEFAULT_MATRIX_URL);
    setPortalUrl(DEFAULT_PORTAL_URL);
    setWelcomeTemplate(DEFAULT_WELCOME_MESSAGE_TEMPLATE);

    OntologicalStore.setPhase1WebhookUrl(DEFAULT_MAKE_PHASE1_WEBHOOK);
    OntologicalStore.setPhase2CalendlyWebhookUrl(DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK);
    OntologicalStore.setPhase3PaymentWebhookUrl(DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK);
    OntologicalStore.setWebhookUrl(DEFAULT_WEBHOOK_URL);
    OntologicalStore.setCalendarUrl(DEFAULT_CALENDAR_URL);
    OntologicalStore.setMatrixUrl(DEFAULT_MATRIX_URL);
    OntologicalStore.setPortalUrl(DEFAULT_PORTAL_URL);
    OntologicalStore.setWelcomeTemplate(DEFAULT_WELCOME_MESSAGE_TEMPLATE);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(whatsAppTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleCopyWelcome = () => {
    navigator.clipboard.writeText(welcomeTemplate);
    setCopiedWelcome(true);
    setTimeout(() => setCopiedWelcome(false), 2000);
  };

  const handleRunInboundTest = async () => {
    if (!testName.trim() || !testPhone.trim()) return;
    setIsTestingInbound(true);
    setTestResult(null);

    const res = await OntologicalStore.triggerMakePhase1Inbound({
      name: testName,
      whatsapp: testPhone,
      notes: 'Test en vivo de automatización Make (Módulo 1 -> 2 -> 3)',
    });

    setTestResult({
      success: true,
      messageSent: res.messageSent,
      docId: res.firestoreDocCreated.docId,
      webhookDispatched: res.webhookDispatched,
    });

    setIsTestingInbound(false);
    if (onProspectAdded) onProspectAdded();
  };

  const handleRunCalendlyTest = async () => {
    if (!calendlyTestPhone.trim() && !calendlyTestName.trim()) return;
    setIsTestingCalendly(true);
    setCalendlyTestResult(null);

    const res = await OntologicalStore.triggerMakePhase2CalendlyBooking({
      name: calendlyTestName,
      whatsapp: calendlyTestPhone,
      email: calendlyTestEmail,
      eventName: calendlyEventName,
    });

    setCalendlyTestResult({
      success: true,
      matchedProspectName: res.matchedProspect?.name || calendlyTestName,
      docId: res.docId,
      previousStatus: res.previousStatus || 'matriz_enviada',
      newStatus: res.newStatus,
      webhookDispatched: res.webhookDispatched,
    });

    setIsTestingCalendly(false);
    if (onProspectAdded) onProspectAdded();
  };

  const handleRunPaymentTest = async () => {
    if (!paymentTestName.trim() || !paymentTestEmail.trim()) return;
    setIsTestingPayment(true);
    setPaymentTestResult(null);

    const res = await OntologicalStore.triggerMakePhase3PaymentConversion({
      name: paymentTestName,
      email: paymentTestEmail,
      whatsapp: paymentTestPhone,
      paymentStatus: paymentTier,
      amount: paymentAmount,
      paymentGateway,
    });

    setPaymentTestResult({
      success: true,
      matchedProspect: !!res.matchedProspect,
      prospectDocId: res.prospectDocId,
      userDocId: res.userDocId,
      welcomeMessageSent: res.welcomeMessageSent,
      paymentStatus: paymentTier,
      amount: paymentAmount,
      webhookDispatched: res.webhookDispatched,
    });

    setIsTestingPayment(false);
    if (onProspectAdded) onProspectAdded();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-gray-100 dark:border-neutral-800 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-[#F9F9F9] dark:hover:bg-neutral-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1">
          <Workflow className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
          Arquitectura de Automatización Make.com & Google Cloud Firestore
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">
          Centro de Escenarios & Automatizaciones
        </h2>
        <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mb-5 leading-relaxed">
          Flujos autónomos para la captación en conversatorio, agendamiento en Calendly, cierre de pagos de alto valor y migración al portal de 12 semanas.
        </p>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#F9F9F9] dark:bg-[#202024] rounded-2xl border border-gray-200/60 dark:border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab('phase1_funnel')}
            className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'phase1_funnel'
                ? 'bg-white dark:bg-[#151518] text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Atracción (WhatsApp)</span>
          </button>

          <button
            onClick={() => setActiveTab('phase2_calendly')}
            className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'phase2_calendly'
                ? 'bg-white dark:bg-[#151518] text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Calendly &rarr; Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('phase3_payment')}
            className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'phase3_payment'
                ? 'bg-white dark:bg-[#151518] text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Cierre & Onboarding</span>
          </button>

          <button
            onClick={() => setActiveTab('phase4_ai')}
            className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'phase4_ai'
                ? 'bg-white dark:bg-[#151518] text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">4. Diagnóstico IA</span>
          </button>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-black/10 dark:border-white/10 flex items-center gap-2 text-xs text-black dark:text-white animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" />
            <span>Configuración sincronizada y guardada exitosamente.</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: FASE 1 MAKE SCENARIO (WEBHOOK -> FIRESTORE CREATE -> WHATSAPP) */}
        {/* ========================================================================= */}
        {activeTab === 'phase1_funnel' && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-5 bg-[#F9F9F9] dark:bg-[#202024] rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 block">
                Escenario 1 en Make.com: Captación & Entrega de Matriz
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center">
                      1
                    </span>
                    Webhooks
                  </div>
                  <div className="text-[10px] font-medium text-gray-700 dark:text-neutral-300">
                    Custom Webhook
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Disparador al final del conversatorio. Recibe: <code>nombre</code> y <code>numero_whatsapp</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center">
                      2
                    </span>
                    Firestore
                  </div>
                  <div className="text-[10px] font-medium text-gray-700 dark:text-neutral-300">
                    Create a Document
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Colección <code>prospects</code> &rarr; Columna inicial <code>matriz_enviada</code> en el Kanban.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center">
                      3
                    </span>
                    WhatsApp Cloud
                  </div>
                  <div className="text-[10px] font-medium text-gray-700 dark:text-neutral-300">
                    Send a Message
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Entrega de la Matriz + Enlace a Sesión de 20 min en Google Calendar.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  URL del Custom Webhook (Make.com - Módulo 1)
                </label>
                <input
                  type="url"
                  value={phase1WebhookUrl}
                  onChange={(e) => setPhase1WebhookUrl(e.target.value)}
                  placeholder="https://hook.us1.make.com/..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Enlace de Agendamiento (Sesión 20 min)
                  </label>
                  <input
                    type="url"
                    value={calendarUrl}
                    onChange={(e) => setCalendarUrl(e.target.value)}
                    placeholder="https://calendar.app.google/..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Enlace Descarga Matriz Ontológica (PDF)
                  </label>
                  <input
                    type="url"
                    value={matrixUrl}
                    onChange={(e) => setMatrixUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    Cuerpo del Mensaje WhatsApp Business (Módulo 3)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="text-[11px] text-black dark:text-white font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-3 h-3 text-black dark:text-white" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar texto
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={whatsAppTemplate}
                  onChange={(e) => setWhatsAppTemplate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="p-5 bg-black dark:bg-[#101012] text-white rounded-3xl border dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-200 dark:text-neutral-300">
                  <Play className="w-3.5 h-3.5 text-white" />
                  Simulador de Captación en Vivo (Prueba Escenario 1)
                </div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                  Poblará la Columna 1 del CRM
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Nombre del asistente"
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="WhatsApp (+57...)"
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <button
                type="button"
                onClick={handleRunInboundTest}
                disabled={isTestingInbound || !testName.trim() || !testPhone.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-medium text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingInbound ? 'Disparando flujo...' : 'Probar Escenario 1 (Webhook -> Firestore -> WhatsApp)'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {testResult && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Prospecto digitalizado en <code>prospects</code> (ID: {testResult.docId})
                  </div>
                  <pre className="p-2.5 bg-black/50 rounded-xl text-[10px] font-mono text-gray-200 whitespace-pre-wrap leading-tight">
                    {testResult.messageSent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FASE 2 MAKE SCENARIO (CALENDLY -> FIRESTORE SEARCH -> FIRESTORE UPDATE) */}
        {/* ========================================================================= */}
        {activeTab === 'phase2_calendly' && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-5 bg-[#F9F9F9] dark:bg-[#202024] rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 block">
                  Escenario 2 en Make.com: Agendamiento Calendly & Avance en Kanban
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#151518] border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium">
                  3 Módulos Lineales
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Calendly
                  </div>
                  <div className="text-[11px] font-semibold text-gray-800 dark:text-neutral-200">
                    Watch Events / Invitee Created
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Disparador. Evento: <strong>"Sesión de Exploración / Integración (20 min)"</strong>. Captura nombre, correo y WhatsApp.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    Firestore
                  </div>
                  <div className="text-[11px] font-semibold text-gray-800 dark:text-neutral-200">
                    Search Documents
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Colección: <code>prospects</code>. Condición: <code>whatsapp</code> o <code>email</code> igual a las variables de Calendly (Paso 1).
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    Firestore
                  </div>
                  <div className="text-[11px] font-semibold text-gray-800 dark:text-neutral-200">
                    Update a Document
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Doc ID: <code>&#123;&#123;2.id&#125;&#125;</code>. Campo <code>status</code> con valor exacto: <code>sesion_20min_agendada</code>.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                URL del Webhook de Calendly en Make (Opcional si usas Custom Webhook)
              </label>
              <input
                type="url"
                value={phase2CalendlyWebhookUrl}
                onChange={(e) => setPhase2CalendlyWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="p-5 bg-black dark:bg-[#101012] text-white rounded-3xl border dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-200 dark:text-neutral-300">
                  <Play className="w-3.5 h-3.5 text-white" />
                  Simulador de Agendamiento Calendly (Módulo 1 &rarr; 2 &rarr; 3)
                </div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                  Moverá la tarjeta a la Columna 2 del Kanban
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={calendlyTestName}
                  onChange={(e) => setCalendlyTestName(e.target.value)}
                  placeholder="Nombre en Calendly"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <input
                  type="tel"
                  value={calendlyTestPhone}
                  onChange={(e) => setCalendlyTestPhone(e.target.value)}
                  placeholder="WhatsApp (+57...)"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <input
                  type="email"
                  value={calendlyTestEmail}
                  onChange={(e) => setCalendlyTestEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <button
                type="button"
                onClick={handleRunCalendlyTest}
                disabled={isTestingCalendly || (!calendlyTestPhone.trim() && !calendlyTestName.trim())}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-medium text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingCalendly ? 'Buscando y actualizando en Firestore...' : 'Simular Agendamiento Calendly (Ejecutar Módulos 1, 2 y 3)'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {calendlyTestResult && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>
                      ¡Documento <code>{calendlyTestResult.docId}</code> actualizado exitosamente!
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 space-y-1">
                    <div>
                      <strong>Prospecto:</strong> {calendlyTestResult.matchedProspectName}
                    </div>
                    <div>
                      <strong>Transición de Estado:</strong>{' '}
                      <span className="font-mono text-gray-400">
                        {calendlyTestResult.previousStatus}
                      </span>{' '}
                      &rarr;{' '}
                      <span className="font-mono text-emerald-300 font-semibold">
                        {calendlyTestResult.newStatus}
                      </span>{' '}
                      (Columna 2: Sesión 20 min)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FASE 3 MAKE SCENARIO ("CIERRE DE ALTO VALOR" - 4 MÓDULOS) */}
        {/* ========================================================================= */}
        {activeTab === 'phase3_payment' && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {/* Visual 4-Module Schematic in Make */}
            <div className="p-5 bg-[#F9F9F9] dark:bg-[#202024] rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 block">
                  Escenario 3 en Make.com: Cierre de Alto Valor & Activación de Portal (4 Módulos)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#151518] border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium">
                  Autonomous Onboarding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Module 1: Payment Gateway */}
                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Pasarela de Pago
                  </div>
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-neutral-200 truncate">
                    Watch Payments / Webhook
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Stripe / Wompi / ePayco / Hotmart. Captura pago ($1.500.000 COP o Cuota 1).
                  </p>
                </div>

                {/* Module 2: Firestore Update Prospects */}
                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    Firestore (Prospects)
                  </div>
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-neutral-200 truncate">
                    Update a Document
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Colección <code>prospects</code> &rarr; <code>status: convertido</code> (Columna 3 de Éxito).
                  </p>
                </div>

                {/* Module 3: Firestore Create/Update Users */}
                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    Firestore (Users)
                  </div>
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-neutral-200 truncate">
                    Create/Update User
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Colección <code>users</code> &rarr; <code>role: client</code>, <code>progress: 1</code>.
                  </p>
                </div>

                {/* Module 4: Gmail / WhatsApp */}
                <div className="p-3.5 bg-white dark:bg-[#151518] rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                      4
                    </span>
                    Gmail / WhatsApp
                  </div>
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-neutral-200 truncate">
                    Send Welcome Message
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-neutral-400 leading-tight">
                    Encuadre inicial + Enlace al Client Portal para las 12 semanas.
                  </p>
                </div>
              </div>
            </div>

            {/* Firestore Field Mapping Reference for Module 3 */}
            <div className="p-4 bg-white dark:bg-[#202024] rounded-2xl border border-gray-200/70 dark:border-neutral-700 text-xs space-y-2">
              <div className="font-semibold text-black dark:text-white flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-black dark:text-white" />
                Mapeo de Activación en Google Cloud Firestore (Módulo 3: Users)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#F9F9F9] dark:bg-[#151518] rounded-xl border border-gray-100 dark:border-neutral-800">
                  <div className="text-gray-400 dark:text-neutral-500 text-[10px]">role</div>
                  <div className="font-semibold text-black dark:text-white">client</div>
                </div>
                <div className="p-2 bg-[#F9F9F9] dark:bg-[#151518] rounded-xl border border-gray-100 dark:border-neutral-800">
                  <div className="text-gray-400 dark:text-neutral-500 text-[10px]">programProgress</div>
                  <div className="font-semibold text-black dark:text-white">1 (Nodo 1 Activo)</div>
                </div>
                <div className="p-2 bg-[#F9F9F9] dark:bg-[#151518] rounded-xl border border-gray-100 dark:border-neutral-800">
                  <div className="text-gray-400 dark:text-neutral-500 text-[10px]">paymentStatus</div>
                  <div className="text-black dark:text-neutral-200 truncate">Pago Único / Cuota 1</div>
                </div>
                <div className="p-2 bg-[#F9F9F9] dark:bg-[#151518] rounded-xl border border-gray-100 dark:border-neutral-800">
                  <div className="text-gray-400 dark:text-neutral-500 text-[10px]">programName</div>
                  <div className="text-black dark:text-neutral-200 truncate">Certeza, Fronteras...</div>
                </div>
              </div>
            </div>

            {/* Endpoints & URLs Config */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  URL del Webhook de Pago (Make.com - Módulo 1)
                </label>
                <input
                  type="url"
                  value={phase3PaymentWebhookUrl}
                  onChange={(e) => setPhase3PaymentWebhookUrl(e.target.value)}
                  placeholder="https://hook.us1.make.com/rbc-payment-..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-1.5">
                  URL del Portal del Cliente (Acceso de 12 semanas)
                </label>
                <input
                  type="url"
                  value={portalUrl}
                  onChange={(e) => setPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Welcome Message Template (Module 4) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    Cuerpo del Mensaje de Bienvenida / Encuadre (Módulo 4: Gmail o WhatsApp)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyWelcome}
                    className="text-[11px] text-black dark:text-white font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWelcome ? (
                      <>
                        <Check className="w-3 h-3 text-black dark:text-white" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar texto
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={welcomeTemplate}
                  onChange={(e) => setWelcomeTemplate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-[10px] font-light text-gray-400 dark:text-neutral-500">
                  Variables dinámicas: <code>&#123;&#123;name&#125;&#125;</code>, <code>&#123;&#123;email&#125;&#125;</code>, <code>&#123;&#123;paymentStatus&#125;&#125;</code>, <code>&#123;&#123;portalUrl&#125;&#125;</code>.
                </span>
              </div>
            </div>

            {/* LIVE TESTER: PAYMENT GATEWAY TRIGGER & HIGH VALUE CLOSING */}
            <div className="p-5 bg-black dark:bg-[#101012] text-white rounded-3xl border dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-200 dark:text-neutral-300">
                  <Play className="w-3.5 h-3.5 text-white" />
                  Simulador de Pago de Alto Valor (Cierre & Onboarding en Vivo)
                </div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                  Migra de Prospecto a Cliente con Portal Activo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={paymentTestName}
                  onChange={(e) => setPaymentTestName(e.target.value)}
                  placeholder="Nombre del comprador"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <input
                  type="email"
                  value={paymentTestEmail}
                  onChange={(e) => setPaymentTestEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <input
                  type="tel"
                  value={paymentTestPhone}
                  onChange={(e) => setPaymentTestPhone(e.target.value)}
                  placeholder="WhatsApp (+57...)"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">Pasarela</label>
                  <select
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none"
                  >
                    <option value="Wompi" className="bg-neutral-900 text-white">Wompi (Bancolombia)</option>
                    <option value="Stripe" className="bg-neutral-900 text-white">Stripe (USD/Global)</option>
                    <option value="ePayco" className="bg-neutral-900 text-white">ePayco</option>
                    <option value="Hotmart" className="bg-neutral-900 text-white">Hotmart</option>
                    <option value="PayPal" className="bg-neutral-900 text-white">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">Estructura de Inversión</label>
                  <select
                    value={paymentTier}
                    onChange={(e) => {
                      const tier = e.target.value as PaymentStatus;
                      setPaymentTier(tier);
                      if (tier === 'Pago Único') setPaymentAmount('$1.500.000 COP');
                      else if (tier === 'Cuota 1 de 2') setPaymentAmount('$750.000 COP');
                      else setPaymentAmount('$350 USD');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none"
                  >
                    <option value="Pago Único" className="bg-neutral-900 text-white">Pago Único ($1.500.000 COP)</option>
                    <option value="Cuota 1 de 2" className="bg-neutral-900 text-white">Acuerdo ICF - Cuota 1 de 2 ($750.000 COP)</option>
                    <option value="Completado" className="bg-neutral-900 text-white">Internacional ($350 USD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">Monto Registrado</label>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunPaymentTest}
                disabled={isTestingPayment || !paymentTestName.trim() || !paymentTestEmail.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-medium text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingPayment
                  ? 'Procesando Módulos 1, 2, 3 y 4...'
                  : 'Simular Cierre de Pago (Disparar Webhook, Activar Cliente y Enviar Bienvenida)'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {paymentTestResult && (
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-2.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      ¡Cierre completado! Cliente formalizado con ID: <code>{paymentTestResult.userDocId}</code>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-300 pt-1">
                    <div className="p-2 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block text-[10px]">Prospects (Módulo 2)</span>
                      <strong className="text-white">status: convertido</strong>
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block text-[10px]">Users (Módulo 3)</span>
                      <strong className="text-white">role: client (Nodo 1)</strong>
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block text-[10px]">Inversión</span>
                      <strong className="text-white">{paymentTestResult.amount} ({paymentTestResult.paymentStatus})</strong>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                      Mensaje de Bienvenida & Llaves de Acceso (Módulo 4: Gmail/WhatsApp):
                    </span>
                    <pre className="p-2.5 bg-black/60 rounded-xl text-[10px] font-mono text-gray-200 whitespace-pre-wrap leading-tight">
                      {paymentTestResult.welcomeMessageSent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FASE 4 DIAGNOSTICO IA (COHERENCIA ONTOLÓGICA & ICF) */}
        {/* ========================================================================= */}
        {activeTab === 'phase4_ai' && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-4 bg-[#F9F9F9] dark:bg-[#202024] rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs space-y-2">
              <div className="font-semibold text-black dark:text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                Diagnóstico & Coherencia Ontológica (Dominios Somático, Emocional y Lingüístico)
              </div>
              <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                Cuando el Coach o el Cliente genera el diagnóstico en la plataforma, se procesa la decodificación somática, los juicios y los quiebres para evaluación y síntesis de coherencia ontológica según los estándares de consultoría transformacional y competencias ICF.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2">
                URL del Webhook de Diagnóstico IA (Make.com)
              </label>
              <input
                type="url"
                required
                value={aiWebhookUrl}
                onChange={(e) => setAiWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/..."
                className="w-full px-4 py-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="p-4 bg-[#F9F9F9] dark:bg-[#202024] rounded-2xl border border-gray-100 dark:border-neutral-800 text-[11px] font-light text-gray-600 dark:text-neutral-400 space-y-1">
              <strong className="font-medium text-black dark:text-white block">
                Estructura del Payload JSON (Sesión & Nivel):
              </strong>
              <pre className="font-mono text-[10px] text-gray-600 dark:text-neutral-400 pt-1">
{`{
  "clientId": "client-1",
  "program": "Certeza, Fronteras & Dirección Personal",
  "sessionStep": 1,
  "level": "Nivel I",
  "bodyEmotion": "Sensación de opresión en el pecho...",
  "reflections": "Observo juicios automáticos sobre...",
  "levelSpecificAnswer": "Límite no dicho...",
  "submittedAt": "2026-08-31T..."
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs font-light text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Restaurar por defecto
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
            <LiquidGlassButton onClick={handleSave}>
              Guardar Configuración
            </LiquidGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
