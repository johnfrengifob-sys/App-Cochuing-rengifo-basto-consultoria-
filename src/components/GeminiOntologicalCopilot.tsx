import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  MessageSquare,
  ShieldAlert,
  BrainCircuit,
  Layers,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { GeminiService, GeminiChatMessage, GeminiRoleplayResult, GeminiMarketingResult } from '../services/geminiService';
import { User as UserType } from '../types';

interface GeminiOntologicalCopilotProps {
  currentClient?: UserType | null;
  userRole?: 'coach' | 'client';
  onApplyInsightToClient?: (insightData: any) => void;
  className?: string;
}

export const GeminiOntologicalCopilot: React.FC<GeminiOntologicalCopilotProps> = ({
  currentClient,
  userRole = 'coach',
  onApplyInsightToClient,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'roleplay' | 'diagnose' | 'marketing'>('chat');
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      role: 'assistant',
      content:
        userRole === 'coach'
          ? `Hola Coach. Soy tu Copiloto de Inteligencia Artificial Ontológica (Gemini 3.7 Flash) para Rengifo Basto Consultoría Ontológica. ¿En qué caso directivo o diseño conversacional podemos profundizar hoy?`
          : `Bienvenido a tu espacio de Indagación y Mentoría Ontológica con Gemini 3.7. Aquí puedes explorar tus quiebres, preparar conversaciones difíciles y calibrar tu coherencia somática.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Roleplay state
  const [roleplayScenario, setRoleplayScenario] = useState('Poner un límite directivo firme ante una demanda desmedida de un socio');
  const [counterpartyRole, setCounterpartyRole] = useState('Socio Director / Cliente Clave');
  const [roleplayHistory, setRoleplayHistory] = useState<Array<{ role: string; content: string; feedback?: string }>>([]);
  const [roleplayInput, setRoleplayInput] = useState('');
  const [roleplayLoading, setRoleplayLoading] = useState(false);

  // Marketing state
  const [mktEventTitle, setMktEventTitle] = useState('Certeza, Fronteras & Dirección Personal');
  const [mktEventDate, setMktEventDate] = useState('Próximo Jueves, 7:00 PM (Bogotá)');
  const [mktResult, setMktResult] = useState<GeminiMarketingResult | null>(null);
  const [mktLoading, setMktLoading] = useState(false);

  // Diagnosis quick state
  const [diagEmotion, setDiagEmotion] = useState(currentClient?.notes || 'Tensión cervical y agobio por exceso de compromisos');
  const [diagReflection, setDiagReflection] = useState('Siento que si no controlo cada detalle las cosas salen mal, lo cual me deja sin energía');
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, roleplayHistory]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: GeminiChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await GeminiService.sendChatMessage(
        newHistory,
        {
          clientContext: currentClient
            ? {
                name: currentClient.name,
                company: currentClient.company,
                programStep: currentClient.programStep,
                status: currentClient.status,
              }
            : null,
          role: userRole,
        },
        userRole
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No fue posible completar la consulta con Gemini. Por favor intenta nuevamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleplaySubmit = async () => {
    if (!roleplayInput.trim() || roleplayLoading) return;

    const userText = roleplayInput.trim();
    setRoleplayInput('');
    setRoleplayLoading(true);

    const updatedHistory = [...roleplayHistory, { role: 'Tú', content: userText }];
    setRoleplayHistory(updatedHistory);

    try {
      const result: GeminiRoleplayResult = await GeminiService.simulateRoleplay({
        scenario: roleplayScenario,
        counterpartyRole,
        userMessage: userText,
        conversationHistory: updatedHistory,
      });

      setRoleplayHistory((prev) => [
        ...prev,
        {
          role: counterpartyRole,
          content: result.counterpartyReply,
          feedback: result.coachFeedback,
        },
      ]);
    } catch {
      // Handled in service fallback
    } finally {
      setRoleplayLoading(false);
    }
  };

  const handleGenerateDiagnosis = async () => {
    setDiagLoading(true);
    try {
      const result = await GeminiService.generateDeepDiagnosis({
        clientName: currentClient?.name || 'Cliente Ejecutivo',
        bodyEmotion: diagEmotion,
        reflections: diagReflection,
        sessionStep: currentClient?.programStep || 1,
        level: (currentClient?.programStep || 1) <= 2 ? 'Nivel I' : 'Nivel II',
      });
      setDiagResult(result);
      if (onApplyInsightToClient) {
        onApplyInsightToClient(result);
      }
    } finally {
      setDiagLoading(false);
    }
  };

  const handleGenerateMarketing = async () => {
    setMktLoading(true);
    try {
      const res = await GeminiService.generateMarketing({
        eventTitle: mktEventTitle,
        eventDate: mktEventDate,
      });
      setMktResult(res);
    } finally {
      setMktLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const PROMPT_SUGGESTIONS = [
    '¿Cómo distinguir si este quiebre es un juicio o una afirmación fáctica?',
    'Sugiéreme 3 preguntas de quiebre para un líder con exceso de perfeccionismo.',
    '¿Qué micro-práctica somática ayuda a desarticular la tensión cervical?',
    'Ayúdame a redactar un "No" directivo limpio sin disculpas innecesarias.',
  ];

  return (
    <div
      className={`bg-white dark:bg-[#151518] rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs flex flex-col overflow-hidden ${className}`}
    >
      {/* Header with Gemini Branding & Account details */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-800/80 bg-gradient-to-r from-gray-50/70 via-white to-gray-50/70 dark:from-neutral-900/50 dark:via-[#151518] dark:to-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Google Gemini 3.7 AI Ontológico
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>En vivo</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light flex items-center gap-1.5">
              <span>Cuenta vinculada:</span>
              <strong className="text-gray-700 dark:text-neutral-300 font-medium">rengifobastoco@gmail.com</strong>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-neutral-900 p-1 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Copiloto</span>
          </button>

          <button
            onClick={() => setActiveTab('roleplay')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roleplay'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulador</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnose')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diagnose'
                ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Diagnóstico</span>
          </button>

          {userRole === 'coach' && (
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'marketing'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Marketing IA</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: COPILOTO CHAT INTERACTIVO */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[480px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-normal rounded-tr-xs'
                      : 'bg-gray-100/90 dark:bg-neutral-900/90 text-gray-800 dark:text-neutral-200 border border-gray-200/60 dark:border-neutral-800 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      m.role === 'user' ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-neutral-500'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(m.content, `chat-${idx}`)}
                        className="hover:text-black dark:hover:text-white cursor-pointer ml-2 flex items-center gap-1"
                        title="Copiar respuesta"
                      >
                        {copiedId === `chat-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === `chat-${idx}` ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    )}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 flex items-center justify-center shrink-0 text-xs font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-xs text-gray-400">
                <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 border border-gray-200/50 dark:border-neutral-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-bounce [animation-delay:0.4s]" />
                  <span>Gemini 3.7 procesando indagación ontológica...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-gray-50/50 dark:bg-neutral-900/30 border-t border-gray-100 dark:border-neutral-800/60 overflow-x-auto flex gap-2">
            {PROMPT_SUGGESTIONS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-[11px] text-gray-600 dark:text-neutral-300 hover:border-black dark:hover:border-white whitespace-nowrap cursor-pointer transition-all shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-white dark:bg-[#151518] border-t border-gray-100 dark:border-neutral-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu consulta, quiebre o escenario de coaching..."
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SIMULADOR DE CONVERSACIONES DIFÍCILES (ROLEPLAY) */}
      {activeTab === 'roleplay' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Configuración del Escenario
              </span>
              <span className="text-[11px] text-gray-400">Simulación interactiva con Gemini 3.7</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1">
                  Escenario de Quiebre o Conversación:
                </label>
                <input
                  type="text"
                  value={roleplayScenario}
                  onChange={(e) => setRoleplayScenario(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-gray-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1">
                  Rol de la Contraparte a Simular:
                </label>
                <input
                  type="text"
                  value={counterpartyRole}
                  onChange={(e) => setCounterpartyRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-gray-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          </div>

          {/* Dialogue Feed */}
          <div className="space-y-4 min-h-[220px] max-h-[360px] overflow-y-auto pr-1">
            {roleplayHistory.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl text-gray-400 text-xs">
                <Zap className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>Comienza escribiendo tu apertura o declaración para iniciar la práctica guiada.</p>
              </div>
            ) : (
              roleplayHistory.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                      item.role === 'Tú'
                        ? 'bg-black text-white dark:bg-white dark:text-black ml-8 rounded-tr-xs'
                        : 'bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white mr-8 border border-gray-200 dark:border-neutral-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="font-bold text-[10px] mb-1 opacity-70 uppercase tracking-wider">{item.role}:</div>
                    <p className="whitespace-pre-line">{item.content}</p>
                  </div>
                  {item.feedback && (
                    <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 ml-4 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Feedback del Coach Ontológico (Gemini):</strong> {item.feedback}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {roleplayLoading && (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-900 text-xs text-gray-500 animate-pulse">
                Gemini formulando respuesta y evaluación ontológica...
              </div>
            )}
          </div>

          {/* Interactive Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={roleplayInput}
              onChange={(e) => setRoleplayInput(e.target.value)}
              placeholder={`Escribe lo que le dirías a "${counterpartyRole}"...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              disabled={roleplayLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRoleplaySubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleRoleplaySubmit}
              disabled={!roleplayInput.trim() || roleplayLoading}
              className="px-5 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              Responder
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNÓSTICO PROFUNDO CON GEMINI */}
      {activeTab === 'diagnose' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                  Emoción & Sensación Corporal Reportada:
                </label>
                <textarea
                  rows={2}
                  value={diagEmotion}
                  onChange={(e) => setDiagEmotion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                  placeholder="Ej: Opresión en el pecho, autoexigencia implacable..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                  Reflexión o Quiebre Declarado:
                </label>
                <textarea
                  rows={2}
                  value={diagReflection}
                  onChange={(e) => setDiagReflection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                  placeholder="Ej: Me cuesta delegar y siento que debo responder por todo..."
                />
              </div>
            </div>

            <button
              onClick={handleGenerateDiagnosis}
              disabled={diagLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className={`w-4 h-4 ${diagLoading ? 'animate-spin' : ''}`} />
              <span>{diagLoading ? 'Generando Diagnóstico con Gemini 3.7...' : 'Generar Diagnóstico Ontológico Gemini'}</span>
            </button>
          </div>

          {/* Diagnosis Result Card */}
          {diagResult && (
            <div className="p-5 rounded-3xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-500" />
                  Informe Sintético Gemini 3.7
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-300 dark:border-emerald-800">
                  Coherencia Somática: {diagResult.somaticScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60 space-y-1">
                  <span className="font-semibold text-gray-800 dark:text-neutral-200 block">Barreras Lingüísticas:</span>
                  <p className="text-gray-600 dark:text-neutral-300 leading-relaxed font-light">{diagResult.linguisticBarriers}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60 space-y-1">
                  <span className="font-semibold text-gray-800 dark:text-neutral-200 block">Patrones Somáticos:</span>
                  <p className="text-gray-600 dark:text-neutral-300 leading-relaxed font-light">{diagResult.somaticIndicators}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60 space-y-1">
                  <span className="font-semibold text-gray-800 dark:text-neutral-200 block">Reencuadre Sugerido:</span>
                  <p className="text-gray-600 dark:text-neutral-300 leading-relaxed font-light">{diagResult.recommendedShift}</p>
                </div>
              </div>

              {diagResult.powerfulQuestions && diagResult.powerfulQuestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60 space-y-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                    Preguntas Poderosas para la Sesión:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-neutral-300 list-disc list-inside">
                    {diagResult.powerfulQuestions.map((q: string, idx: number) => (
                      <li key={idx} className="font-light italic">
                        "{q}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MARKETING & CONVERSATORIOS CON GEMINI */}
      {activeTab === 'marketing' && userRole === 'coach' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
              Generador de Publicidad y Convocatorias con Gemini
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1">
                  Título del Conversatorio / Evento:
                </label>
                <input
                  type="text"
                  value={mktEventTitle}
                  onChange={(e) => setMktEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-gray-800 dark:text-neutral-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1">
                  Fecha y Hora del Evento:
                </label>
                <input
                  type="text"
                  value={mktEventDate}
                  onChange={(e) => setMktEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-gray-800 dark:text-neutral-200"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateMarketing}
              disabled={mktLoading}
              className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mktLoading ? 'Redactando con Gemini...' : 'Generar Copys de Captación'}</span>
            </button>
          </div>

          {mktResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* WhatsApp copy */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Guion Directivo para WhatsApp
                  </span>
                  <button
                    onClick={() => copyToClipboard(mktResult.whatsappScript, 'mkt-wa')}
                    className="text-xs text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    {copiedId === 'mkt-wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'mkt-wa' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-700 dark:text-neutral-300 whitespace-pre-line font-mono bg-white/70 dark:bg-neutral-900/70 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  {mktResult.whatsappScript}
                </p>
              </div>

              {/* LinkedIn post */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Publicación Reflexiva para LinkedIn
                  </span>
                  <button
                    onClick={() => copyToClipboard(mktResult.linkedinPost, 'mkt-li')}
                    className="text-xs text-blue-800 dark:text-blue-300 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    {copiedId === 'mkt-li' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'mkt-li' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-700 dark:text-neutral-300 whitespace-pre-line font-mono bg-white/70 dark:bg-neutral-900/70 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  {mktResult.linkedinPost}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
