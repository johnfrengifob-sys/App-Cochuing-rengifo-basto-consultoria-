import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Sparkles,
  CreditCard,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  BookOpen,
  Banknote,
  Send,
  AlertCircle,
  Smartphone,
  MapPin,
} from 'lucide-react';
import { User, ProgramNodeInfo, PaymentStatus, PaymentRequest } from '../types';
import { OntologicalStore, COMPANY_INFO, BRE_B_NU_CONFIG } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';
import { BreBNuPaymentCard } from './BreBNuPaymentCard';

interface PaymentUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: ProgramNodeInfo;
  client: User;
  onUnlocked: (updatedUser: User) => void;
}

export const PaymentUnlockModal: React.FC<PaymentUnlockModalProps> = ({
  isOpen,
  onClose,
  node,
  client,
  onUnlocked,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'level' | 'full'>('level');
  const [paymentMethod, setPaymentMethod] = useState<'bre_b_nu' | 'efectivo' | 'online_card'>('bre_b_nu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Electronic Bre-B Nu proof states
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Cash payment note
  const [cashNotes, setCashNotes] = useState('');

  // Existing pending request for this node
  const [existingRequest, setExistingRequest] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      const clientRequests = OntologicalStore.getPaymentRequestsForClient(client.uid);
      const pendingForNode = clientRequests.find(
        (r) => r.targetStep === node.step && r.status === 'pending'
      );
      setExistingRequest(pendingForNode || null);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, node.step, client.uid]);

  if (!isOpen) return null;

  const paymentUrl = OntologicalStore.getNextLevelPaymentUrl();
  const currentAmount = selectedPlan === 'full' ? '$1.500.000 COP' : '$500.000 COP';
  const conceptText =
    selectedPlan === 'full'
      ? 'Programa Completo Certeza Ontológica (12 Semanas)'
      : `Desbloqueo ${node.level}: ${node.sessionTitle} (Sesión ${node.step})`;

  // Submit payment request for admin validation
  const handleSubmitPaymentForValidation = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (paymentMethod === 'bre_b_nu') {
        const newReq = OntologicalStore.submitPaymentRequest({
          clientId: client.uid,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone || COMPANY_INFO.phone,
          amount: currentAmount,
          concept: conceptText,
          targetStep: node.step,
          planType: selectedPlan,
          method: 'bre_b_nu',
          proofImageUrl: proofImage || undefined,
          whatsappContacted: whatsappSent,
          notes: whatsappSent
            ? 'Comprobante enviado al WhatsApp oficial +57 323 464 2257.'
            : proofImage
            ? 'Comprobante cargado directamente en la plataforma.'
            : 'Transferencia por Llave Nu @ASL775.',
        });

        setExistingRequest(newReq);
        setSuccessMessage(
          '¡Comprobante de pago electrónico registrado! Tu solicitud está en espera de validación por el administrador John Rengifo.'
        );
      } else if (paymentMethod === 'efectivo') {
        const newReq = OntologicalStore.submitPaymentRequest({
          clientId: client.uid,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone || COMPANY_INFO.phone,
          amount: currentAmount,
          concept: `Pago en Efectivo: ${conceptText}`,
          targetStep: node.step,
          planType: selectedPlan,
          method: 'efectivo',
          notes: cashNotes.trim() || 'Pago en efectivo presencial acordado con el consultor.',
        });

        setExistingRequest(newReq);
        setSuccessMessage(
          '¡Solicitud de pago en efectivo registrada! El consultor John Rengifo validará el pago en su panel de administración para habilitar tu acceso.'
        );
      }

      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
      setErrorMessage('No fue posible registrar la solicitud. Por favor intenta nuevamente.');
    }
  };

  // Instant developer / direct unlock test handler
  const handleInstantUnlock = async () => {
    setIsProcessing(true);
    try {
      const paymentStatus: PaymentStatus =
        selectedPlan === 'full' ? 'Pago Único' : 'Cuota 1 de 2';

      const updated = OntologicalStore.unlockNodeForClient(
        client.uid,
        node.step,
        paymentStatus
      );

      await OntologicalStore.triggerMakePhase3PaymentConversion({
        name: client.name,
        email: client.email,
        whatsapp: client.phone,
        amount: currentAmount,
        paymentStatus,
        paymentGateway: 'Aprobación Inmediata / Consola',
        programName: 'Certeza, Fronteras & Dirección Personal',
      });

      setSuccessMessage(
        `¡Tu Próximo Nivel (${node.level}) ha sido habilitado con éxito!`
      );

      setTimeout(() => {
        if (updated) {
          onUnlocked(updated);
        }
        setIsProcessing(false);
        onClose();
      }, 1200);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white/90 dark:bg-[#151518]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/80 dark:border-white/10 shadow-2xl space-y-6 my-6 animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Tu Próximo Nivel • Desbloqueo de Espacio
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
            Desbloquea {node.level}: {node.sessionTitle}
          </h2>

          <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
            Habilita tus sesiones quincenales 1-a-1 de consultoría ontológica, tus cuadernos de trabajo en PDF, la bitácora somática y el pack de refuerzo personalizado.
          </p>
        </div>

        {/* Alert: Existing Pending Request */}
        {existingRequest && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                Pago en Revisión por Administración
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                Pendiente de Validación
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-light">
              Ya registraste una solicitud de pago por <strong>{existingRequest.amount}</strong> mediante{' '}
              <strong>{existingRequest.method === 'efectivo' ? 'Efectivo en Sesión' : 'Bre-B Nu'}</strong>.{' '}
              El consultor John Rengifo la validará en su panel de administración para habilitar tu acceso.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://wa.me/${COMPANY_INFO.phone}?text=${encodeURIComponent(
                  `Hola John, tengo mi pago de ${existingRequest.amount} para ${node.level} pendiente de validación en la plataforma. Mi correo es ${client.email}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Notificar por WhatsApp (+57 323 464 2257)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Level Overview Box */}
        <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1C1C20] border border-gray-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-black dark:text-white">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-black dark:text-white stroke-[1.5]" />
              {node.level} • {node.weekLabel}
            </span>
            <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
              Nodo {node.step} de 6
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-light text-gray-700 dark:text-neutral-300">
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
              <span>Sesiones 1-a-1 Quincenales (60 min)</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
              <span>Cuaderno de Trabajo en PDF del Nivel</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
              <span>Audio-Guías y Micro-Prácticas Somáticas</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
              <span>Bitácora Confidencial y Quiebres</span>
            </div>
          </div>
        </div>

        {/* Pricing Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
            1. Selecciona tu Modalidad de Inversión
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan('level')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPlan === 'level'
                  ? 'bg-white dark:bg-[#222226] border-black dark:border-white ring-1 ring-black/10 dark:ring-white/10'
                  : 'bg-[#F9F9F9] dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-black dark:text-white">
                  Pago por Nivel
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500">
                  Cuota {node.level === 'Nivel II' ? '2' : '3'}
                </span>
              </div>
              <div className="text-lg font-bold text-black dark:text-white mt-1">
                $500.000 COP
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 mt-1">
                Acceso completo al {node.level} (Semanas {node.weekLabel})
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('full')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPlan === 'full'
                  ? 'bg-white dark:bg-[#222226] border-black dark:border-white ring-1 ring-black/10 dark:ring-white/10'
                  : 'bg-[#F9F9F9] dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-black dark:text-white">
                  Programa Completo
                </span>
                <span className="text-[10px] font-semibold bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded-full uppercase">
                  Ahorro
                </span>
              </div>
              <div className="text-lg font-bold text-black dark:text-white mt-1">
                $1.500.000 COP
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 mt-1">
                Desbloquea los 3 Niveles y los 6 Nodos completos
              </p>
            </button>
          </div>
        </div>

        {/* Payment Method Switcher Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
            2. Elige tu Método de Pago
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('bre_b_nu')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'bre_b_nu'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500/20'
                  : 'bg-[#F9F9F9] dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300 text-gray-700 dark:text-neutral-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold">Bre-B | Nu (Llave)</span>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                Transferencia o QR
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('efectivo')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'efectivo'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/20'
                  : 'bg-[#F9F9F9] dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300 text-gray-700 dark:text-neutral-300'
              }`}
            >
              <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold">Pago en Efectivo</span>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                Presencial en Sesión
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('online_card')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'online_card'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/20'
                  : 'bg-[#F9F9F9] dark:bg-[#1A1A1E] border-gray-100 dark:border-neutral-800 hover:border-gray-300 text-gray-700 dark:text-neutral-300'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold">Pasarela / PSE</span>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                Tarjeta o Wompi
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content 1: Bre-B | Nu */}
        {paymentMethod === 'bre_b_nu' && (
          <div className="space-y-4">
            <BreBNuPaymentCard
              amount={currentAmount}
              concept={conceptText}
              clientName={client.name}
              clientEmail={client.email}
              proofImage={proofImage}
              onProofImageChange={setProofImage}
              whatsappSent={whatsappSent}
              onWhatsappSentToggle={setWhatsappSent}
            />

            {/* Submit Proof to Administrator Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSubmitPaymentForValidation}
                className="w-full py-3.5 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-purple-400 dark:text-purple-600" />
                <span>
                  {isProcessing
                    ? 'Enviando comprobante...'
                    : 'Reportar Pago Electrónico y Esperar Confirmación de Administrador'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: Pago en Efectivo */}
        {paymentMethod === 'efectivo' && (
          <div className="space-y-4 p-5 rounded-3xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  Pago en Efectivo Presencial al Consultor
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/90 font-light leading-relaxed">
                  Puedes cancelar el valor en efectivo directamente a John Fredy Rengifo Basto al inicio de tu próxima sesión presencial o en el consultorio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1C22] border border-amber-200/60 dark:border-amber-900/30 space-y-1">
                <span className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-semibold block">
                  Monto a Entregar en Efectivo
                </span>
                <strong className="text-base font-extrabold text-amber-900 dark:text-amber-300 block">
                  {currentAmount}
                </strong>
                <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                  Concepto: {conceptText}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1C22] border border-amber-200/60 dark:border-amber-900/30 space-y-1">
                <span className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-semibold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  Lugar de Entrega
                </span>
                <strong className="text-xs font-bold text-black dark:text-white block">
                  {COMPANY_INFO.address}
                </strong>
                <span className="text-[10px] text-gray-500 dark:text-neutral-400 block">
                  {COMPANY_INFO.city} • Consultorio Rengifo Basto Consultoría Ontológica
                </span>
              </div>
            </div>

            {/* Note / Date input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider block">
                Observación o fecha de entrega presencial (opcional)
              </label>
              <input
                type="text"
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                placeholder="Ejemplo: Entregaré el efectivo este jueves en la sesión de las 4:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1C22] text-xs text-black dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/* Register Cash Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSubmitPaymentForValidation}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Registrando solicitud...'
                  : 'Registrar Pago en Efectivo y Solicitar Validación de Administrador'}
              </span>
            </button>
          </div>
        )}

        {/* Tab Content 3: Pasarela en Línea */}
        {paymentMethod === 'online_card' && (
          <div className="space-y-4 p-5 rounded-3xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                Pago en Línea con Tarjeta de Crédito, Débito o PSE
              </h4>
              <p className="text-xs text-blue-900/80 dark:text-blue-300/90 font-light leading-relaxed">
                Si prefieres pagar mediante pasarela electrónica con tarjeta de crédito o cuenta bancaria PSE, puedes abrir el enlace de pago seguro a continuación.
              </p>
            </div>

            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block"
            >
              <LiquidGlassButton
                className="w-full justify-center"
                icon={<CreditCard className="w-4 h-4 stroke-[1.5]" />}
              >
                <span className="flex items-center gap-1.5">
                  Ir al Enlace de Pago en Línea (Wompi / PSE / Tarjetas)
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </span>
              </LiquidGlassButton>
            </a>

            <p className="text-[11px] text-gray-500 dark:text-neutral-400 text-center font-light">
              Una vez realizado tu pago, puedes enviar el comprobante al WhatsApp oficial{' '}
              <strong className="text-black dark:text-white">+57 323 464 2257</strong> para validación.
            </p>
          </div>
        )}

        {/* Feedback Messages */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer WhatsApp Direct Concierge & Instant Test Activation */}
        <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/${COMPANY_INFO.phone}?text=${encodeURIComponent(
              `Hola John, deseo consultar sobre las opciones de pago para ${node.level} (${currentAmount}) en Rengifo Basto Consultoría Ontológica. Mi correo es ${client.email}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Asistencia por WhatsApp (+57 323 464 2257)</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleInstantUnlock}
            title="Activar de forma directa (Modo Demostración / Desbloqueo en Vivo)"
            className="text-[11px] font-medium text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>{isProcessing ? 'Activando...' : 'Desbloqueo Inmediato (Demo)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
