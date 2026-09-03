import React, { useState } from 'react';
import {
  Workflow,
  Sliders,
  CheckCircle2,
  RotateCcw,
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
  CreditCard,
  Mail,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import {
  OntologicalStore,
  DEFAULT_MAKE_PHASE1_WEBHOOK,
  DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK,
  DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK,
  DEFAULT_CALENDAR_URL,
  DEFAULT_MATRIX_URL,
  DEFAULT_PORTAL_URL,
  DEFAULT_WHATSAPP_TEMPLATE,
  DEFAULT_WELCOME_MESSAGE_TEMPLATE,
} from '../../services/store';

interface AdminAutomationsManagerProps {
  onRefresh?: () => void;
}

export const AdminAutomationsManager: React.FC<AdminAutomationsManagerProps> = ({
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'phase1_funnel' | 'phase2_calendly' | 'phase3_payment' | 'phase4_ai'
  >('phase1_funnel');

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

  // Live Test State
  const [testName, setTestName] = useState('Camila Morales');
  const [testPhone, setTestPhone] = useState('+57 315 889 4411');
  const [isTestingInbound, setIsTestingInbound] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    messageSent: string;
    docId: string;
    timestamp: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copiado al portapapeles.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    OntologicalStore.setPhase1WebhookUrl(phase1WebhookUrl);
    OntologicalStore.setWhatsAppTemplate(whatsAppTemplate);
    OntologicalStore.setCalendarUrl(calendarUrl);
    OntologicalStore.setMatrixUrl(matrixUrl);

    OntologicalStore.setPhase2CalendlyWebhookUrl(phase2CalendlyWebhookUrl);

    OntologicalStore.setPhase3PaymentWebhookUrl(phase3PaymentWebhookUrl);
    OntologicalStore.setWelcomeTemplate(welcomeTemplate);
    OntologicalStore.setPortalUrl(portalUrl);

    OntologicalStore.setWebhookUrl(aiWebhookUrl);

    showToast('Todas las configuraciones de automatización han sido guardadas.');
    if (onRefresh) onRefresh();
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        '¿Deseas restablecer todas las URLs de webhooks y plantillas a sus valores iniciales recomendados?'
      )
    ) {
      setPhase1WebhookUrl(DEFAULT_MAKE_PHASE1_WEBHOOK);
      setWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATE);
      setCalendarUrl(DEFAULT_CALENDAR_URL);
      setMatrixUrl(DEFAULT_MATRIX_URL);
      setPhase2CalendlyWebhookUrl(DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK);
      setPhase3PaymentWebhookUrl(DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK);
      setWelcomeTemplate(DEFAULT_WELCOME_MESSAGE_TEMPLATE);
      setPortalUrl(DEFAULT_PORTAL_URL);

      OntologicalStore.setPhase1WebhookUrl(DEFAULT_MAKE_PHASE1_WEBHOOK);
      OntologicalStore.setWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATE);
      OntologicalStore.setCalendarUrl(DEFAULT_CALENDAR_URL);
      OntologicalStore.setMatrixUrl(DEFAULT_MATRIX_URL);
      OntologicalStore.setPhase2CalendlyWebhookUrl(DEFAULT_MAKE_PHASE2_CALENDLY_WEBHOOK);
      OntologicalStore.setPhase3PaymentWebhookUrl(DEFAULT_MAKE_PHASE3_PAYMENT_WEBHOOK);
      OntologicalStore.setWelcomeTemplate(DEFAULT_WELCOME_MESSAGE_TEMPLATE);
      OntologicalStore.setPortalUrl(DEFAULT_PORTAL_URL);

      showToast('Valores por defecto restablecidos con éxito.');
      if (onRefresh) onRefresh();
    }
  };

  const handleRunInboundTest = async () => {
    if (!testName.trim() || !testPhone.trim()) return;
    setIsTestingInbound(true);
    setTestResult(null);

    const generatedMsg = whatsAppTemplate
      .replace(/\{\{name\}\}/g, testName)
      .replace(/\{\{calendar_link\}\}/g, calendarUrl)
      .replace(/\{\{matrix_link\}\}/g, matrixUrl);

    setTimeout(() => {
      const mockDocId = `lead_${Math.random().toString(36).substring(2, 9)}`;
      setIsTestingInbound(false);
      setTestResult({
        success: true,
        messageSent: generatedMsg,
        docId: mockDocId,
        timestamp: new Date().toLocaleTimeString(),
      });
      showToast(`Prueba completada. DocId simulado: ${mockDocId}`);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-neutral-950 text-white text-xs shadow-2xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-neutral-900 via-indigo-950 to-neutral-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Workflow className="w-3.5 h-3.5 text-indigo-400" />
              <span>Arquitectura Make.com & Webhooks Cloud</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Centro de Escenarios & Automatizaciones Académicas</span>
            </h3>
            <p className="text-xs md:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed">
              Configura los puntos de integración y webhooks entre la plataforma, Make.com, Calendly, WhatsApp Business y pasarelas de pago para una experiencia fluida sin intervención manual.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all cursor-pointer"
              title="Restablecer valores originales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('phase1_funnel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'phase1_funnel'
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white font-bold shadow-2xs'
              : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-indigo-500" />
          <span>Fase 1: Funnel & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('phase2_calendly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'phase2_calendly'
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white font-bold shadow-2xs'
              : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>Fase 2: Agenda Calendly</span>
        </button>

        <button
          onClick={() => setActiveTab('phase3_payment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'phase3_payment'
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white font-bold shadow-2xs'
              : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-500" />
          <span>Fase 3: Pagos & Onboarding</span>
        </button>

        <button
          onClick={() => setActiveTab('phase4_ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'phase4_ai'
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white font-bold shadow-2xs'
              : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Fase 4: Copiloto IA & Quiebres</span>
        </button>
      </div>

      {/* TAB CONTENT: FASE 1 FUNNEL */}
      {activeTab === 'phase1_funnel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>Fase 1: Entrada de Prospectos & Primer Contacto por WhatsApp</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-700 dark:text-neutral-300">
                Webhook URL Make.com (Recepción Inbound Leads)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={phase1WebhookUrl}
                  onChange={(e) => setPhase1WebhookUrl(e.target.value)}
                  placeholder="https://hook.eu2.make.com/..."
                  className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(phase1WebhookUrl, 'p1_hook')}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200"
                >
                  {copiedKey === 'p1_hook' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Enlace Agenda Calendly Sesión Exploratoria
                </label>
                <input
                  type="url"
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Enlace Matrix Diagnóstico / Lead Magnet
                </label>
                <input
                  type="url"
                  value={matrixUrl}
                  onChange={(e) => setMatrixUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-700 dark:text-neutral-300 flex items-center justify-between">
                <span>Plantilla Mensaje WhatsApp Primer Contacto</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Variables: {'{{name}}'}, {'{{calendar_link}}'}, {'{{matrix_link}}'}
                </span>
              </label>
              <textarea
                rows={5}
                value={whatsAppTemplate}
                onChange={(e) => setWhatsAppTemplate(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-light text-xs"
              />
            </div>
          </div>

          {/* Live Inbound Lead Tester */}
          <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 space-y-4 text-xs">
            <h5 className="font-bold text-black dark:text-white flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-500" />
              <span>Probador de Disparo en Vivo</span>
            </h5>
            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
              Simula el ingreso de un lead para comprobar cómo se formatea el mensaje de WhatsApp y se emula la llamada a Make.
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Nombre Lead:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Teléfono WhatsApp:</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleRunInboundTest}
                disabled={isTestingInbound}
                className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                {isTestingInbound ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Ejecutar Test Inbound</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Disparo Exitoso ({testResult.timestamp})
                </span>
                <p className="text-[11px] text-gray-600 dark:text-neutral-300 font-light line-clamp-3">
                  {testResult.messageSent}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FASE 2 CALENDLY */}
      {activeTab === 'phase2_calendly' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm space-y-5">
          <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Fase 2: Confirmación de Cita Calendly & Sincronización</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl">
            Este webhook recibe el evento <code className="font-mono bg-gray-100 dark:bg-neutral-800 px-1 py-0.5 rounded">invitee.created</code> desde Calendly cuando un prospecto reserva su sesión de indagación previa.
          </p>

          <div className="space-y-1.5 text-xs max-w-2xl">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Webhook URL Make.com (Calendly Booking Listener)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={phase2CalendlyWebhookUrl}
                onChange={(e) => setPhase2CalendlyWebhookUrl(e.target.value)}
                placeholder="https://hook.eu2.make.com/..."
                className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(phase2CalendlyWebhookUrl, 'p2_hook')}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200"
              >
                {copiedKey === 'p2_hook' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FASE 3 PAGOS & ONBOARDING */}
      {activeTab === 'phase3_payment' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm space-y-5">
          <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>Fase 3: Formalización de Pago & Onboarding High-Ticket</span>
          </h4>

          <div className="space-y-1.5 text-xs max-w-2xl">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Webhook URL Make.com (Aprobación de Pago / Pasarela / Nu Bre-B)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={phase3PaymentWebhookUrl}
                onChange={(e) => setPhase3PaymentWebhookUrl(e.target.value)}
                placeholder="https://hook.eu2.make.com/..."
                className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(phase3PaymentWebhookUrl, 'p3_hook')}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200"
              >
                {copiedKey === 'p3_hook' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-xs max-w-2xl">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              URL del Portal del Coachee
            </label>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5 text-xs max-w-3xl">
            <label className="font-semibold text-gray-700 dark:text-neutral-300 flex items-center justify-between">
              <span>Plantilla Mensaje WhatsApp de Bienvenida</span>
              <span className="text-[10px] text-gray-400 font-mono">
                Variables: {'{{name}}'}, {'{{portal_link}}'}
              </span>
            </label>
            <textarea
              rows={4}
              value={welcomeTemplate}
              onChange={(e) => setWelcomeTemplate(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-light text-xs"
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: FASE 4 IA ONTOLÓGICA */}
      {activeTab === 'phase4_ai' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-sm space-y-5">
          <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Fase 4: Sincronización Ontológica con Copiloto IA Gemini 3.7</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl">
            Punto de conexión para despachar síntesis de quiebres directivos, barreras del habla y compromisos no negociables detectados en las respuestas de los cuestionarios.
          </p>

          <div className="space-y-1.5 text-xs max-w-2xl">
            <label className="font-semibold text-gray-700 dark:text-neutral-300">
              Webhook URL IA / Extracción de Quiebres
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={aiWebhookUrl}
                onChange={(e) => setAiWebhookUrl(e.target.value)}
                placeholder="https://hook.eu2.make.com/..."
                className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(aiWebhookUrl, 'p4_hook')}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200"
              >
                {copiedKey === 'p4_hook' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
