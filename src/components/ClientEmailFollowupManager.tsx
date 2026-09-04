import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Sparkles,
  Calendar,
  AlertCircle,
  History,
} from 'lucide-react';
import { OntologicalStore, DEFAULT_PORTAL_URL } from '../services/store';
import { User, ClientEmailLog } from '../types';

interface ClientEmailFollowupManagerProps {
  clients?: User[];
  defaultSelectedClientId?: string;
  onClientSelected?: (clientId: string) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: 'coherencia' | 'bienvenida' | 'seguimiento' | 'inactividad';
  subject: string;
  body: string;
}

const PRESET_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-pausa-coherencia',
    name: 'Pausa de Coherencia 3x3 (Mapeo Somático y Quiebres)',
    category: 'coherencia',
    subject: 'Recordatorio Ontológico: Tu Pausa de Coherencia en 3 Tiempos | Rengifo Basto',
    body: `Hola {{name}},

Espero que tu jornada directiva avance con serenidad.

Como parte de tu trabajo en el programa ontológico, te invito a sostener tu micro-práctica cotidiana de anclaje:

🧘 Pausa de Coherencia y Mapeo en 3 Tiempos
(Horarios recomendados: 9:00 AM, 2:00 PM y 6:00 PM)

Detente durante 90 segundos:
1. Inhala profundo en 4 tiempos y siente el apoyo de tus pies en el suelo.
2. Escanea tu cuerpo: ¿mandíbula apretada, hombros tensos, respiración corta?
3. Hazte la pregunta ontológica fundamental: "¿Estoy operando en este momento por convicción o por inercia automática?"

Si identificas algún quiebre oculto o acuerdo tácito no consensuado, anótalo en tu bitácora de tu Espacio Confidencial:
👉 {{portalUrl}}

Un saludo cordial,
John Fredy Rengifo Basto
Rengifo Basto Consultoría Ontológica`,
  },
  {
    id: 'tpl-bienvenida-nodo',
    name: 'Apertura de Espacio Confidencial y Nuevo Nodo',
    category: 'bienvenida',
    subject: 'Tu Espacio Confidencial está habilitado: Nodo {{step}} | Rengifo Basto Consultoría',
    body: `Estimado/a {{name}},

Te damos la bienvenida a una nueva etapa de tu acompañamiento ontológico en "{{program}}".

Tu espacio privado de trabajo e introspección ya se encuentra actualizado en el Nodo {{step}}. Allí podrás acceder a tus autorregistros guiados, lecturas y acuerdos de sesión:
👉 {{portalUrl}}

Recuerda que cada sesión es un espacio de absoluta confidencialidad bajo estándares ICF para examinar tus juicios maestros y construir declaraciones de soberanía.

Nos vemos en nuestra próxima cita agendada.

Un saludo afectuoso,
John Fredy Rengifo Basto
Consultor & Coach Ontológico Directivo`,
  },
  {
    id: 'tpl-bitacora-pendiente',
    name: 'Seguimiento de Bitácora & Cuestionario Reflexivo',
    category: 'seguimiento',
    subject: 'Tu Bitácora Reflexiva post-sesión está lista para ser completada',
    body: `Hola {{name}},

Tras nuestra última conversación, es el momento clave para asentar las distinciones ontológicas trabajadas.

Te agradezco completar tu breve bitácora reflexiva (te tomará menos de 5 minutos):
👉 {{portalUrl}}

Tu reporte nos permite alimentar el Copiloto Gemini y afinar el foco de intervención para nuestra siguiente sesión de trabajo.

Con aprecio,
John Fredy Rengifo Basto
Rengifo Basto Consultoría Ontológica`,
  },
  {
    id: 'tpl-alerta-inactividad',
    name: 'Alerta de Inactividad & Reconexión (+7 días)',
    category: 'inactividad',
    subject: '¿Cómo va tu energía y tus acuerdos ontológicos, {{name}}?',
    body: `Estimado/a {{name}},

He notado que han pasado varios días desde tu último autorregistro en la plataforma. 

Sabemos que la vorágine operativa suele empujarnos a actuar en transparencia automática, postergando la pausa reflexiva. 

Te escribo para invitarte a no soltar tu proceso:
1. Revisa tu cuaderno de trabajo: {{portalUrl}}
2. Si necesitas reprogramar o adelantar una conversación de 20 minutos de alineación, házmelo saber de inmediato.

Estoy a tu entera disposición.

Un saludo atento,
John Fredy Rengifo Basto
Rengifo Basto Consultoría Ontológica | Cel: +57 323 464 2257`,
  },
];

export const ClientEmailFollowupManager: React.FC<ClientEmailFollowupManagerProps> = ({
  clients = [],
  defaultSelectedClientId,
  onClientSelected,
}) => {
  const safeClients = useMemo(() => {
    if (clients.length > 0) return clients;
    return OntologicalStore.getUsers().filter((u) => u.role === 'client');
  }, [clients]);

  const [selectedClientId, setSelectedClientId] = useState<string>(
    defaultSelectedClientId || safeClients[0]?.uid || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-pausa-coherencia');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [emailLogs, setEmailLogs] = useState<ClientEmailLog[]>(() =>
    OntologicalStore.getClientEmailLogs()
  );
  const [copiedBody, setCopiedBody] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'composer' | 'logs'>('composer');
  const [searchTerm, setSearchTerm] = useState('');

  const activeClient = safeClients.find((c) => c.uid === selectedClientId) || safeClients[0];

  // Load template content into fields
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = PRESET_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      const replacedSubject = tpl.subject
        .replace(/{{name}}/g, activeClient?.name || 'Participante')
        .replace(/{{step}}/g, String(activeClient?.programProgress || 1))
        .replace(/{{program}}/g, activeClient?.programName || 'Programa Ontológico');

      const replacedBody = tpl.body
        .replace(/{{name}}/g, activeClient?.name || 'Participante')
        .replace(/{{step}}/g, String(activeClient?.programProgress || 1))
        .replace(/{{program}}/g, activeClient?.programName || 'Programa Ontológico')
        .replace(/{{portalUrl}}/g, DEFAULT_PORTAL_URL);

      setCustomSubject(replacedSubject);
      setCustomBody(replacedBody);
    }
  };

  // Initial load
  React.useEffect(() => {
    handleSelectTemplate(selectedTemplateId);
  }, [selectedClientId]);

  const handleSendAndLog = (openMailto: boolean = true) => {
    if (!activeClient) return;

    const newLog = OntologicalStore.logClientEmail({
      clientId: activeClient.uid,
      clientName: activeClient.name,
      clientEmail: activeClient.email,
      templateType: (selectedTemplateId as any) || 'custom',
      subject: customSubject,
      content: customBody,
      templateName:
        PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Mensaje Personalizado',
      bodyPreview: customBody.slice(0, 180) + '...',
      status: 'sent',
    });

    setEmailLogs(OntologicalStore.getClientEmailLogs());
    setSendSuccessMessage(`Correo registrado exitosamente para ${activeClient.name}`);
    setTimeout(() => setSendSuccessMessage(null), 4000);

    if (openMailto && activeClient.email) {
      const mailtoUrl = `mailto:${encodeURIComponent(activeClient.email)}?subject=${encodeURIComponent(
        customSubject
      )}&body=${encodeURIComponent(customBody)}`;
      window.location.href = mailtoUrl;
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(customBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  // Filtered email logs
  const filteredLogs = useMemo(() => {
    return emailLogs.filter((log) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        log.clientName.toLowerCase().includes(q) ||
        log.clientEmail.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q) ||
        log.templateName.toLowerCase().includes(q)
      );
    });
  }, [emailLogs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Mail className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Seguimiento por Correo Electrónico (Google Workspace & Gmail)
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
            Comunícate con tus coachees mediante protocolos ontológicos, pausas de coherencia e invitaciones seguras.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'composer'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Redactar Mensaje
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial de Envíos ({emailLogs.length})
          </button>
        </div>
      </div>

      {sendSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sendSuccessMessage}</span>
        </div>
      )}

      {/* Composer Tab */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Client & Template Selector */}
          <div className="space-y-4">
            {/* Target Client */}
            <div className="bg-white dark:bg-[#141414] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                Destinatario (Coachee):
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  if (onClientSelected) onClientSelected(e.target.value);
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
              >
                {safeClients.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.name} ({c.email}) - Nodo {c.programProgress || 1}
                  </option>
                ))}
              </select>

              {activeClient && (
                <div className="p-3 bg-gray-50 dark:bg-neutral-900/40 rounded-lg border border-gray-100 dark:border-neutral-800/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-neutral-400">Programa:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {activeClient.programName || 'Certeza Ontológica'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-neutral-400">Quiebre:</span>
                    <span className="text-gray-700 dark:text-neutral-300 truncate max-w-[170px]">
                      {activeClient.primaryBreakdown || 'Sin registrar'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Template Presets */}
            <div className="bg-white dark:bg-[#141414] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Plantillas Ontológicas:
              </label>
              <div className="space-y-1.5">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                      selectedTemplateId === tpl.id
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-xs'
                        : 'bg-gray-50 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800/80 text-gray-800 dark:text-neutral-300 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-semibold">{tpl.name}</p>
                    <p className="text-[10px] opacity-75 truncate mt-0.5">{tpl.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Editor and Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Asunto del Correo:
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                    Cuerpo del Mensaje:
                  </label>
                  <button
                    onClick={handleCopyBody}
                    className="text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedBody ? '¡Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white leading-relaxed resize-y"
                />
              </div>

              {/* Dispatch Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Destino: <strong>{activeClient?.email || 'Sin correo registrado'}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendAndLog(false)}
                    className="px-3.5 py-2 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                  >
                    Solo Registrar en Bitácora
                  </button>
                  <button
                    onClick={() => handleSendAndLog(true)}
                    className="px-4 py-2 text-xs font-semibold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Abrir Gmail & Registrar Envío
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, correo o asunto..."
                className="w-full text-xs bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
              Total mensajes contabilizados: {filteredLogs.length}
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-neutral-400 text-sm">
              No se han registrado envíos de correo aún. Utiliza el redactor para comenzar.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {log.clientName}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        ({log.clientEmail})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                        {log.templateName}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                      {log.subject}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-1">
                      {log.bodyPreview}
                    </p>
                  </div>

                  <div className="text-[11px] text-gray-500 dark:text-neutral-400 shrink-0 flex sm:flex-col sm:items-end justify-between gap-1">
                    <span>{new Date(log.sentAt).toLocaleDateString('es-CO')}</span>
                    <span>{new Date(log.sentAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
