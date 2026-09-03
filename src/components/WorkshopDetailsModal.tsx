import React from 'react';
import {
  ProgramNodeInfo,
  User,
  FormSubmission,
  PostSessionForm,
  Session,
} from '../types';
import { PDFGenerator } from '../utils/pdfGenerator';
import {
  X,
  CheckCircle2,
  Calendar,
  FileDown,
  BookOpen,
  Headphones,
  Brain,
  Activity,
  FileText,
  Clock,
  Video,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';

interface WorkshopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: ProgramNodeInfo;
  client: User;
  isViewed: boolean;
  onToggleViewed: () => void;
  form?: FormSubmission | null;
  postSessionForm?: PostSessionForm | null;
  session?: Session | null;
  onOpenForm?: () => void;
}

export const WorkshopDetailsModal: React.FC<WorkshopDetailsModalProps> = ({
  isOpen,
  onClose,
  node,
  client,
  isViewed,
  onToggleViewed,
  form,
  postSessionForm,
  session,
  onOpenForm,
}) => {
  if (!isOpen) return null;

  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="workshop-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div
        id="workshop-details-modal-container"
        className="relative w-full max-w-3xl max-h-[92vh] bg-white/90 dark:bg-[#161618]/90 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-black/5 dark:border-white/10 flex items-start justify-between gap-4 shrink-0 bg-white/40 dark:bg-[#1A1A1E]/40">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                {node.level}: Taller {node.step}
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                {node.weekLabel}
              </span>
              {isViewed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Taller Visto & Asistido</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pendiente de Ver</span>
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white truncate">
              {node.sessionTitle}
            </h3>
            <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
              {node.objective}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Status & Quick Toggle Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isViewed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
              }`}>
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black dark:text-white block">
                  Registro de Asistencia al Taller
                </span>
                <span className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                  {isViewed
                    ? 'Has registrado la visualización de este taller formativo.'
                    : 'Aún no has registrado la visualización de este taller.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleViewed}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-2xs ${
                isViewed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black'
              }`}
            >
              {isViewed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Taller Visto (Clic para desmarcar)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Marcar Taller como Visto</span>
                </>
              )}
            </button>
          </div>

          {/* Associated 1 a 1 Session Connection */}
          {session && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Sesión 1 a 1 Quincenal Vinculada
                </span>
                <p className="font-semibold text-blue-950 dark:text-blue-200">
                  Sesión {session.sessionNumber || node.step} • {formattedDate(session.date)}
                </p>
                <p className="text-[11px] font-light text-blue-800 dark:text-blue-300/80">
                  {session.notes || 'Enfoque de sesión individual con John Fredy Rengifo Basto.'}
                </p>
              </div>

              {session.meetLink && (
                <a
                  href={session.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1E22] border border-blue-200 dark:border-neutral-700 text-blue-700 dark:text-blue-300 font-semibold text-[11px] flex items-center gap-1.5 hover:underline cursor-pointer shrink-0"
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enlace Google Meet</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              )}
            </div>
          )}

          {/* Official Document Downloads & Actions */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-black dark:text-white" />
              Documentos Oficiales del Taller
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cuaderno de Trabajo en PDF */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1D1D20] border border-gray-200/80 dark:border-neutral-700/80 flex flex-col justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Cuaderno de Trabajo PDF
                    </span>
                    {form && (
                      <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                        Con Respuestas
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-black dark:text-white">
                    Cuaderno Ontológico • Taller {node.step}
                  </h4>
                  <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Compendio completo del taller con la metodología de los 3 dominios y tu bitácora integrada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => PDFGenerator.generateLevelWorkbookPDF(node, client, form || undefined)}
                  className="w-full py-2 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Descargar Cuaderno PDF</span>
                </button>
              </div>

              {/* Kit de Refuerzo & Audio Somático */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1D1D20] border border-gray-200/80 dark:border-neutral-700/80 flex flex-col justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                      Kit de Refuerzo & Audio
                    </span>
                    <span className="text-[9px] font-light text-gray-400">
                      {node.reinforcementPack?.audioDuration || '8 min'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-black dark:text-white">
                    {node.reinforcementPack?.title || `Refuerzo Taller ${node.step}`}
                  </h4>
                  <p className="text-[11px] font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Protocolo de autocuidado, prácticas somáticas diarias y transcripción del audio de centramiento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => PDFGenerator.generateReinforcementPackPDF(node, client)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#252529] border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-purple-500" />
                  <span>Descargar Kit de Refuerzo PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Coachee's Completed Questionnaire Responses (if any) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-black dark:text-white" />
                Cuestionario Ontológico del Taller
              </span>

              {form ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    Entregado: {formattedDate(form.submittedAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => PDFGenerator.generateFormSubmissionPDF(form, client, node)}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3 h-3" />
                    <span>Ficha PDF</span>
                  </button>
                </div>
              ) : null}
            </div>

            {form ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 space-y-4 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                      1. Área de Quiebre Declarado
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {form.breakdownArea || 'No especificado'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                      2. Emoción & Sensación Corporal
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {form.currentEmotion || 'No especificado'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                      3. Juicio Maestro & Creencia Raíz
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {form.masterJudgment || form.limitingBelief || 'No especificado'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      4. Compromiso de Acción Acordado
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {form.actionCommitment || 'Compromiso ontológico en desarrollo'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">
                    Cuestionario del Taller pendiente de registro
                  </span>
                  <p className="text-[11px] font-light text-amber-800 dark:text-amber-400/90">
                    Diligencia tus 4 preguntas de autodiagnóstico para incorporar tus reflexiones en el Cuaderno Oficial.
                  </p>
                </div>

                {onOpenForm && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenForm();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Diligenciar Cuestionario</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Study Materials & Diagnostic Matrices */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-black dark:text-white" />
              Guías y Matrices de Estudio del Taller
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {node.studyMaterials?.map((mat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#1F1F22] border border-gray-100 dark:border-neutral-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      {mat.type}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                      {mat.pages}
                    </span>
                  </div>
                  <h5 className="font-bold text-black dark:text-white">
                    {mat.title}
                  </h5>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Micro-Practice */}
          {node.dailyMicroPractice && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Micro-Práctica Cotidiana del Taller
                </span>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  {node.dailyMicroPractice.frequency}
                </span>
              </div>
              <h5 className="font-bold text-emerald-950 dark:text-emerald-200">
                {node.dailyMicroPractice.title}
              </h5>
              <p className="text-[11px] font-light text-emerald-900 dark:text-emerald-300 leading-relaxed">
                {node.dailyMicroPractice.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-neutral-800 bg-[#FBFBFB] dark:bg-[#1A1A1E] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-light text-center sm:text-left">
            Consultoría Ontológica & Liderazgo Ejecutivo • John Fredy Rengifo Basto
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
