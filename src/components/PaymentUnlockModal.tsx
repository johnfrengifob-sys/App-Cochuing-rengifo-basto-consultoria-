import React, { useState } from 'react';
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
} from 'lucide-react';
import { User, ProgramNodeInfo, PaymentStatus } from '../types';
import { OntologicalStore } from '../services/store';
import { LiquidGlassButton } from './LiquidGlassButton';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'level' | 'full'>('level');

  if (!isOpen) return null;

  const paymentUrl = OntologicalStore.getNextLevelPaymentUrl();
  const whatsappNumber = '573158894411';
  const whatsappMessage = encodeURIComponent(
    `Hola John, deseo formalizar el pago para desbloquear mi Próximo Nivel: "${node.level}: ${node.sessionTitle}" (Sesión ${node.step} de 12 semanas) en Raíz y Balance. Mi correo registrado es ${client.email}.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleInstantUnlock = async () => {
    setIsProcessing(true);
    try {
      const paymentStatus: PaymentStatus =
        selectedPlan === 'full' ? 'Pago Único' : 'Cuota 1 de 2';
      const amount =
        selectedPlan === 'full' ? '$1.500.000 COP' : '$500.000 COP';

      // 1. Unlock node in local store
      const updated = OntologicalStore.unlockNodeForClient(
        client.uid,
        node.step,
        paymentStatus
      );

      // 2. Dispatch event to Make scenario 3 (if webhook is active)
      await OntologicalStore.triggerMakePhase3PaymentConversion({
        name: client.name,
        email: client.email,
        whatsapp: client.phone,
        amount,
        paymentStatus,
        paymentGateway: 'Pasarela en Línea / Aprobado',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-neutral-800 shadow-2xl space-y-6 my-8 animate-fade-in">
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

          <h2 className="text-xl sm:text-2xl font-semibold text-black dark:text-white tracking-tight">
            Desbloquea {node.level}: {node.sessionTitle}
          </h2>

          <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 leading-relaxed">
            Habilita tus próximas sesiones quincenales 1-a-1 de consultoría ontológica, tus cuadernos de trabajo en PDF, la bitácora somática y el pack de refuerzo personalizado.
          </p>
        </div>

        {/* Level Overview Box */}
        <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-100 dark:border-neutral-800 space-y-3">
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
            Selecciona tu Modalidad de Inversión
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan('level')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPlan === 'level'
                  ? 'bg-white dark:bg-[#222226] border-black dark:border-white ring-1 ring-black/5 dark:ring-white/5'
                  : 'bg-[#F9F9F9] dark:bg-[#1C1C20] border-gray-100 dark:border-neutral-800'
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
              <div className="text-lg font-semibold text-black dark:text-white mt-1">
                $500.000 COP
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 mt-1">
                Acceso completo al {node.level} (Semanas {node.weeks})
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('full')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPlan === 'full'
                  ? 'bg-white dark:bg-[#222226] border-black dark:border-white ring-1 ring-black/5 dark:ring-white/5'
                  : 'bg-[#F9F9F9] dark:bg-[#1C1C20] border-gray-100 dark:border-neutral-800'
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
              <div className="text-lg font-semibold text-black dark:text-white mt-1">
                $1.500.000 COP
              </div>
              <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 mt-1">
                Desbloquea los 3 Niveles y los 6 Nodos completos
              </p>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons: Payment Link, WhatsApp, & Instant Unlock */}
        <div className="space-y-3 pt-2">
          {/* Primary Online Payment Link */}
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
                Enlace de Pago en Línea (Wompi / PSE / Tarjeta)
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </span>
            </LiquidGlassButton>
          </a>

          {/* WhatsApp Direct Concierge */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#F9F9F9] dark:bg-[#202024] hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700 text-xs font-medium text-black dark:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Coordinar Pago por WhatsApp Oficial</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          {/* Instant Unlock for testing / direct confirmation */}
          <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-light text-gray-400 dark:text-neutral-500">
              ¿Ya realizaste tu transferencia o deseas activar en vivo?
            </span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleInstantUnlock}
              className="text-xs font-medium text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {isProcessing ? 'Activando...' : 'Confirmar y Desbloquear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
