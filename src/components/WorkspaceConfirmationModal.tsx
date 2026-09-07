import React from 'react';
import { AlertCircle, CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface WorkspaceConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger' | 'success';
}

export const WorkspaceConfirmationModal: React.FC<WorkspaceConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar Operación',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
      <div className="bg-white dark:bg-[#151518] rounded-3xl max-w-md w-full p-6 sm:p-7 border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-5 relative my-8">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed font-light">
              {description}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-[11px] text-gray-600 dark:text-neutral-400 space-y-1">
          <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Seguridad y Gobernanza de Datos Workspace:</span>
          </div>
          <p>
            Esta acción sincroniza el recurso generado por Gemini con la cuenta oficial{' '}
            <span className="font-mono text-purple-600 dark:text-purple-400">
              rengifobastoco@gmail.com
            </span>{' '}
            y lo indexa en la base de datos de la plataforma.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-2xl border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
