import React, { useState } from 'react';
import {
  Banknote,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Eye,
  Plus,
  Filter,
  Search,
  Check,
  X,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PaymentRequest, User as UserType, ProgramNodeInfo } from '../types';
import { OntologicalStore, BRE_B_NU_CONFIG, PROGRAM_NODES } from '../services/store';

interface PaymentValidationManagerProps {
  requests: PaymentRequest[];
  clients: UserType[];
  coachName: string;
  onRequestUpdated: () => void;
  onClientUnlocked?: (client: UserType) => void;
}

export const PaymentValidationManager: React.FC<PaymentValidationManagerProps> = ({
  requests,
  clients,
  coachName,
  onRequestUpdated,
  onClientUnlocked,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [filterMethod, setFilterMethod] = useState<'all' | 'efectivo' | 'bre_b_nu'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Proof Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{ url: string; clientName: string; concept: string } | null>(null);

  // Reject Modal
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Direct Cash Register Modal
  const [showDirectCashModal, setShowDirectCashModal] = useState(false);
  const [directClientId, setDirectClientId] = useState(clients[0]?.uid || '');
  const [directStep, setDirectStep] = useState<number>(2);
  const [directPlan, setDirectPlan] = useState<'level' | 'full'>('level');
  const [directAmount, setDirectAmount] = useState('$500.000 COP');
  const [directNotes, setDirectNotes] = useState('Pago en efectivo recibido y validado en sesión presencial.');
  const [aperturaSuccessNotice, setAperturaSuccessNotice] = useState<{
    clientName: string;
    amount: string;
    openedSessionNumbers: number[];
  } | null>(null);

  // Statistics
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const cashRequests = requests.filter((r) => r.method === 'efectivo');
  const nuRequests = requests.filter((r) => r.method === 'bre_b_nu');

  // Filtered List
  const filteredRequests = requests.filter((req) => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterMethod !== 'all' && req.method !== filterMethod) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = req.clientName.toLowerCase().includes(q);
      const matchEmail = req.clientEmail.toLowerCase().includes(q);
      const matchConcept = req.concept.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchConcept) return false;
    }
    return true;
  });

  const handleApprove = (reqId: string) => {
    const result = OntologicalStore.approvePaymentRequest(reqId, coachName);
    onRequestUpdated();
    if (result.request) {
      setAperturaSuccessNotice({
        clientName: result.request.clientName,
        amount: result.request.amount,
        openedSessionNumbers: result.request.openedSessionNumbers || [result.request.targetStep],
      });
    }
    if (result.user && onClientUnlocked) {
      onClientUnlocked(result.user);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingReqId) return;
    OntologicalStore.rejectPaymentRequest(
      rejectingReqId,
      rejectionReason.trim() || 'Comprobante no verificado o pendiente de pago.',
      coachName
    );
    setRejectingReqId(null);
    setRejectionReason('');
    onRequestUpdated();
  };

  const handleSaveDirectCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directClientId) return;

    const result = OntologicalStore.registerDirectCashPayment(
      directClientId,
      directStep,
      directPlan,
      directAmount,
      directNotes,
      coachName
    );

    setShowDirectCashModal(false);
    onRequestUpdated();
    if (result.request) {
      setAperturaSuccessNotice({
        clientName: result.request.clientName,
        amount: result.request.amount,
        openedSessionNumbers: result.request.openedSessionNumbers || [result.request.targetStep],
      });
    }
    if (result.user && onClientUnlocked) {
      onClientUnlocked(result.user);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-CO', {
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
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#F9F9F9] dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#820AD1] dark:text-[#C084FC]">
              <Smartphone className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
              Gestión & Validación de Pagos (Efectivo & Bre-B Nu)
            </h2>
          </div>
          <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
            Valida transferencias electrónicas a la Llave Nu <strong className="font-semibold text-[#820AD1] dark:text-[#C084FC]">@ASL775</strong> o pagos recibidos en efectivo en sesión presencial. Al aprobar, el nivel del coachee se desbloquea inmediatamente.
          </p>
        </div>

        {/* Direct Cash Button */}
        <button
          type="button"
          onClick={() => setShowDirectCashModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Banknote className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>Registrar Pago en Efectivo Directo</span>
        </button>
      </div>

      {/* Banner de Feedback: Apertura de Estado en Sesiones */}
      {aperturaSuccessNotice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Apertura de Estado Exitosa en Sesiones
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 text-[10px] font-bold">
                  {aperturaSuccessNotice.amount}
                </span>
              </div>
              <p className="text-xs font-light text-emerald-900 dark:text-emerald-300 leading-relaxed max-w-2xl">
                Se validó el pago de <strong>{aperturaSuccessNotice.clientName}</strong>. En este momento se realizó la <strong>apertura de estado inmediata</strong> para:{' '}
                <strong className="underline font-semibold">
                  {aperturaSuccessNotice.openedSessionNumbers.length > 1
                    ? `Sesiones ${aperturaSuccessNotice.openedSessionNumbers.join(', ')} (Programa de 12 Semanas Completo)`
                    : `Sesión ${aperturaSuccessNotice.openedSessionNumbers[0]}`}
                </strong>
                . El participante y tú ya tienen habilitada la sesión en estado <em>Abierta / Programada</em> con acceso directo a Google Meet, Google Calendar y Cuaderno Ontológico.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAperturaSuccessNotice(null)}
            className="p-1.5 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer shrink-0"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
            <span>Pendientes</span>
            <Clock className={`w-3.5 h-3.5 ${pendingRequests.length > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingRequests.length}
          </div>
          <span className="text-[10px] text-gray-400 block">Requieren tu aprobación</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
            <span>Aprobados</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedRequests.length}
          </div>
          <span className="text-[10px] text-gray-400 block">Niveles desbloqueados</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
            <span>En Efectivo</span>
            <Banknote className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {cashRequests.length}
          </div>
          <span className="text-[10px] text-gray-400 block">Pagos presenciales</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
            <span>Bre-B | Nu</span>
            <Smartphone className="w-3.5 h-3.5 text-[#820AD1]" />
          </div>
          <div className="text-2xl font-black text-[#820AD1] dark:text-[#C084FC]">
            {nuRequests.length}
          </div>
          <span className="text-[10px] text-gray-400 block">Llave @ASL775</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por participante, correo o concepto..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#222226] border border-gray-200/70 dark:border-neutral-700 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#25252A] text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-[#151518] text-amber-700 dark:text-amber-400 font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Pendientes ({pendingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'approved'
                  ? 'bg-white dark:bg-[#151518] text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Aprobados
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-[#151518] text-black dark:text-white font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Todos
            </button>
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#25252A] text-xs">
            <button
              type="button"
              onClick={() => setFilterMethod('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMethod === 'all'
                  ? 'bg-white dark:bg-[#151518] text-black dark:text-white font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterMethod('bre_b_nu')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMethod === 'bre_b_nu'
                  ? 'bg-white dark:bg-[#151518] text-[#820AD1] dark:text-[#C084FC] font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400'
              }`}
            >
              Nu Bre-B
            </button>
            <button
              type="button"
              onClick={() => setFilterMethod('efectivo')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMethod === 'efectivo'
                  ? 'bg-white dark:bg-[#151518] text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-neutral-400'
              }`}
            >
              Efectivo
            </button>
          </div>
        </div>
      </div>

      {/* Requests List / Cards */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#F9F9F9] dark:bg-[#151518] border border-gray-100 dark:border-neutral-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-black dark:text-white">
            No hay solicitudes que coincidan con los filtros
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
            Todas las solicitudes de pago están al día o no se encontraron registros con el término buscado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            // WhatsApp link to coachee (identified as Rengifo Basto Consultoría Ontológica)
            const whatsappMessageText = isApproved
              ? `Hola ${req.clientName}, te escribo de Rengifo Basto Consultoría Ontológica. Te confirmamos que tu solicitud de pago de ${req.amount} para ${req.concept} ha sido validada exitosamente. Tu acceso en la plataforma ya se encuentra completamente habilitado.`
              : isRejected
              ? `Hola ${req.clientName}, te escribo de Rengifo Basto Consultoría Ontológica sobre tu solicitud de pago de ${req.amount} para ${req.concept}. Te comparto la observación de revisión: ${req.rejectionReason || 'Comprobante no verificado o pendiente de confirmación'}.`
              : `Hola ${req.clientName}, te escribo de Rengifo Basto Consultoría Ontológica sobre tu solicitud de pago de ${req.amount} para ${req.concept}.`;

            const coacheeWhatsappUrl = `https://wa.me/${(req.clientPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
              whatsappMessageText
            )}`;

            return (
              <div
                key={req.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-white dark:bg-[#19191D] border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                    : 'bg-white dark:bg-[#161619] border-gray-200/70 dark:border-neutral-800/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Client & Concept */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Method Badge */}
                      {req.method === 'efectivo' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 text-[11px] font-bold">
                          <Banknote className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                          Pago en Efectivo (Presencial)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#820AD1] dark:text-[#C084FC] border border-purple-300/80 dark:border-purple-800 text-[11px] font-bold">
                          <Smartphone className="w-3.5 h-3.5" />
                          Bre-B | Nu (Llave @ASL775)
                        </span>
                      )}

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pendiente de Validación
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprobado & Desbloqueado
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          Rechazado
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-light">
                        {formatDate(req.createdAt)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-black dark:text-white">
                          {req.clientName}
                        </h4>
                        <span className="text-xs text-gray-400 font-light">•</span>
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {req.clientEmail}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200 mt-0.5">
                        {req.concept}
                      </p>
                    </div>

                    {/* Additional Notes or Details */}
                    {req.notes && (
                      <p className="text-[11px] font-light text-gray-600 dark:text-neutral-400 italic bg-gray-50 dark:bg-[#202024] p-2 rounded-xl border border-gray-100 dark:border-neutral-800">
                        "{req.notes}"
                      </p>
                    )}

                    {isRejected && req.rejectionReason && (
                      <p className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl border border-red-200 dark:border-red-900/60">
                        Motivo de rechazo: {req.rejectionReason}
                      </p>
                    )}

                    {isApproved && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Apertura de Estado:{' '}
                              {req.openedSessionNumbers && req.openedSessionNumbers.length > 0
                                ? req.openedSessionNumbers.length > 1
                                  ? `Sesiones 1 a ${Math.max(...req.openedSessionNumbers)} Abiertas`
                                  : `Sesión ${req.openedSessionNumbers[0]} Abierta`
                                : req.planType === 'full'
                                ? 'Sesiones 1 a 6 (Programa Completo) Abiertas'
                                : `Sesión ${req.targetStep} Abierta`}
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                            • Google Meet activo & cuaderno habilitado
                          </span>
                        </div>
                        {req.reviewedBy && (
                          <span className="text-[10px] text-gray-400 block font-light">
                            Validado por {req.reviewedBy} el {formatDate(req.reviewedAt || '')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Amount, Proof, Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-neutral-800">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                        Monto a Validar
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
                        {req.amount}
                      </span>
                    </div>

                    {/* Proof preview or WhatsApp button */}
                    <div className="flex items-center gap-2">
                      {req.proofImageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: req.proofImageUrl!,
                              clientName: req.clientName,
                              concept: req.concept,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-[#820AD1] dark:text-[#C084FC] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Comprobante</span>
                        </button>
                      ) : req.whatsappContacted ? (
                        <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          Enviado al WhatsApp Oficial
                        </span>
                      ) : null}

                      {/* Contact coachee via WhatsApp */}
                      {req.clientPhone && (
                        <a
                          href={coacheeWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-gray-100 dark:bg-[#25252A] hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition-colors"
                          title="Escribir al participante por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </a>
                      )}
                    </div>

                    {/* Actions if Pending */}
                    {isPending && (
                      <div className="flex items-center gap-2 pt-1 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setRejectingReqId(req.id)}
                          className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300 transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar y Desbloquear</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Image Proof Viewer */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#18181B] rounded-3xl p-5 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="text-sm font-bold text-black dark:text-white">
                Comprobante de Pago • {previewImage.clientName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {previewImage.concept}
              </p>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-black flex items-center justify-center">
              <img
                src={previewImage.url}
                alt="Comprobante completo"
                className="max-w-full max-h-[65vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#25252A] text-xs font-semibold text-black dark:text-white hover:bg-gray-200 cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Rejection Reason */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-black dark:text-white">
              Indicar Motivo de Rechazo o Corrección
            </h4>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              El participante verá este motivo y podrá corregir o cargar un nuevo comprobante.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ejemplo: El monto no coincide con la tarifa del nivel o el comprobante es ilegible."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-xs text-black dark:text-white"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReqId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-black cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Direct Cash Payment Register */}
      {showDirectCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveDirectCash}
            className="relative w-full max-w-lg bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-5"
          >
            <button
              type="button"
              onClick={() => setShowDirectCashModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                <Banknote className="w-3.5 h-3.5" /> Registro en Efectivo
              </div>
              <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                Registrar Pago en Efectivo Recibido Presencialmente
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                Aplica cuando el participante te entrega el dinero en efectivo durante la sesión o en consultorio. Al guardar, su nivel quedará desbloqueado.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Client Select */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Participante
                </label>
                <select
                  value={directClientId}
                  onChange={(e) => setDirectClientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-black dark:text-white"
                >
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email}) - Progreso actual: Sesión {c.programProgress || 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Node to unlock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Nivel / Sesión a Habilitar
                  </label>
                  <select
                    value={directStep}
                    onChange={(e) => setDirectStep(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-black dark:text-white"
                  >
                    {PROGRAM_NODES.map((n) => (
                      <option key={n.step} value={n.step}>
                        Sesión {n.step}: {n.level} ({n.sessionTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Modalidad
                  </label>
                  <select
                    value={directPlan}
                    onChange={(e) => {
                      const val = e.target.value as 'level' | 'full';
                      setDirectPlan(val);
                      setDirectAmount(val === 'full' ? '$1.500.000 COP' : '$500.000 COP');
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-black dark:text-white"
                  >
                    <option value="level">Pago por Nivel ($500.000 COP)</option>
                    <option value="full">Programa Completo ($1.500.000 COP)</option>
                  </select>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Monto Recibido en Efectivo
                </label>
                <input
                  type="text"
                  value={directAmount}
                  onChange={(e) => setDirectAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-black dark:text-white font-bold"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Observaciones / Fecha de recepción
                </label>
                <input
                  type="text"
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-[#202024] text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowDirectCashModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-black cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Desbloquear Nivel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
