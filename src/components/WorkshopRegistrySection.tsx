import React, { useState } from 'react';
import {
  User,
  Session,
  FormSubmission,
  PostSessionForm,
  ProgramNodeInfo,
} from '../types';
import { PROGRAM_NODES } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import { WorkshopDetailsModal } from './WorkshopDetailsModal';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  FileDown,
  Headphones,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  Check,
  ChevronRight,
  Video,
  ExternalLink,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react';

interface WorkshopRegistrySectionProps {
  client: User;
  sessions: Session[];
  forms: FormSubmission[];
  postSessionForms: PostSessionForm[];
  workshopsViewed: number[];
  onToggleWorkshopViewed: (step: number) => void;
  onOpenSessionWorkbook: (session: Session | null) => void;
  onSelectWorkshopForForm: (step: number) => void;
  currentProgress: number;
}

export const WorkshopRegistrySection: React.FC<WorkshopRegistrySectionProps> = ({
  client,
  sessions,
  forms,
  postSessionForms,
  workshopsViewed,
  onToggleWorkshopViewed,
  onOpenSessionWorkbook,
  onSelectWorkshopForForm,
  currentProgress,
}) => {
  const [filter, setFilter] = useState<'all' | 'viewed' | 'pending'>('all');
  const [selectedNodeForModal, setSelectedNodeForModal] = useState<ProgramNodeInfo | null>(null);

  const viewedCount = workshopsViewed.length;
  const completedFormsCount = forms.length;

  const filteredNodes = PROGRAM_NODES.filter((node) => {
    const isViewed = workshopsViewed.includes(node.step);
    if (filter === 'viewed') return isViewed;
    if (filter === 'pending') return !isViewed;
    return true;
  });

  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="workshop-registry-section" className="space-y-6">
      {/* Informative Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-[#F7F7F8] to-[#F1F1F3] dark:from-[#18181B] dark:to-[#202024] border border-gray-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider">
                Programa de 12 Semanas
              </span>
              <span className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                6 Talleres Formativos & Sesiones Quincenales 1 a 1
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white">
              Registro de Talleres Vistos & Documentos Oficiales
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl">
              Si estás en proceso de sesiones 1 a 1, aquí puedes llevar el control de los talleres que has visto, consultar sus documentos de estudio, autodiagnósticos de quiebres y descargar tus cuadernos de trabajo en PDF.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-neutral-700 text-center min-w-[90px] shadow-2xs">
              <span className="text-xl font-extrabold text-black dark:text-white block">
                {viewedCount}/6
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Talleres Vistos
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-neutral-700 text-center min-w-[90px] shadow-2xs">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                {completedFormsCount}/6
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Cuestionarios
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-2 border-t border-gray-200/60 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Todos ({PROGRAM_NODES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('viewed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'viewed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Vistos ({viewedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({PROGRAM_NODES.length - viewedCount})</span>
            </button>
          </div>

          <span className="text-[11px] font-light text-gray-400">
            Haz clic en &ldquo;Marcar como Visto&rdquo; para actualizar tu registro personal
          </span>
        </div>
      </div>

      {/* Workshop Cards List */}
      <div className="space-y-4">
        {filteredNodes.map((node) => {
          const isViewed = workshopsViewed.includes(node.step);
          const form = forms.find((f) => f.sessionStep === node.step);
          const associatedSession = sessions.find((s) => s.sessionNumber === node.step);
          const postForm = postSessionForms.find(
            (p) => p.sessionNumber === node.step || (associatedSession && p.sessionId === associatedSession.id)
          );

          return (
            <div
              key={node.step}
              className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${
                isViewed
                  ? 'bg-white dark:bg-[#18181B] border-gray-200/90 dark:border-neutral-800 shadow-2xs'
                  : 'bg-white/80 dark:bg-[#151518] border-gray-200/60 dark:border-neutral-800/80'
              }`}
            >
              {/* Top Row: Badges, Title & Attendance Action */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider">
                      Taller {node.step} • {node.level}
                    </span>
                    <span className="text-xs font-light text-gray-400 dark:text-neutral-500">
                      {node.weekLabel}
                    </span>

                    {isViewed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Taller Visto</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>No registrado como visto</span>
                      </span>
                    )}

                    {/* Associated 1 a 1 indicator */}
                    {associatedSession && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>Sesión 1 a 1: {formattedDate(associatedSession.date)}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-black dark:text-white">
                    {node.sessionTitle}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">
                    {node.objective}
                  </p>
                </div>

                {/* Right Action: Toggle View Button */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleWorkshopViewed(node.step)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                      isViewed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                        : 'bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black'
                    }`}
                    title={isViewed ? 'Desmarcar taller visto' : 'Marcar este taller como visto'}
                  >
                    {isViewed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Visto ✓</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Marcar como Visto</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNodeForModal(node)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    title="Ver registro completo y detalles del taller"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Documents Tray for this Workshop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Cuaderno de Trabajo PDF */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Cuaderno Taller
                      </span>
                      {form && (
                        <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                          Listo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-light line-clamp-2">
                      {form
                        ? 'Generado con tus respuestas ontológicas de quiebre.'
                        : 'Plantilla ontológica del taller lista para descargar.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => PDFGenerator.generateLevelWorkbookPDF(node, client, form || undefined)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white text-black dark:text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3 h-3 text-emerald-600" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* 2. Cuestionario de Quiebres del Taller */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Cuestionario
                      </span>
                      {form ? (
                        <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">
                          Respondido
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-light line-clamp-2">
                      {form
                        ? `Quiebre: ${form.breakdownArea || 'Registrado'}`
                        : 'Diligencia tus 4 preguntas de autodiagnóstico.'}
                    </p>
                  </div>

                  {form ? (
                    <button
                      type="button"
                      onClick={() => setSelectedNodeForModal(node)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver Respuestas</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectWorkshopForForm(node.step)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-[11px] flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                      <span>✍️ Diligenciar</span>
                    </button>
                  )}
                </div>

                {/* 3. Guías & Matriz de Estudio */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Guías de Estudio
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {node.studyMaterials?.length || 2} Docs
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-light line-clamp-2">
                      {node.studyMaterials?.[0]?.title || 'Matriz de Mapeo y Diagnóstico Ontológico'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNodeForModal(node)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white text-gray-700 dark:text-neutral-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Consultar Guías</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </button>
                </div>

                {/* 4. Refuerzo Somático & Audio */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        Refuerzo Somático
                      </span>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400">
                        {node.reinforcementPack?.audioDuration || '8 min'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-light line-clamp-2">
                      {node.dailyMicroPractice?.title || 'Micro-Práctica Cotidiana y Protocolo'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => PDFGenerator.generateReinforcementPackPDF(node, client)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:border-purple-500 text-purple-700 dark:text-purple-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-purple-500" />
                    <span>Kit Somático PDF</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workshop Details Modal */}
      {selectedNodeForModal && (
        <WorkshopDetailsModal
          isOpen={Boolean(selectedNodeForModal)}
          onClose={() => setSelectedNodeForModal(null)}
          node={selectedNodeForModal}
          client={client}
          isViewed={workshopsViewed.includes(selectedNodeForModal.step)}
          onToggleViewed={() => onToggleWorkshopViewed(selectedNodeForModal.step)}
          form={forms.find((f) => f.sessionStep === selectedNodeForModal.step)}
          session={sessions.find((s) => s.sessionNumber === selectedNodeForModal.step)}
          onOpenForm={() => onSelectWorkshopForForm(selectedNodeForModal.step)}
        />
      )}
    </div>
  );
};
