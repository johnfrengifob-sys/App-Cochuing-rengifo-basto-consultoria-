import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Plus,
  Trash2,
  FileText,
  UserCheck,
  Sparkles,
  Award,
  CheckCircle,
  Eye,
  Send,
  MessageSquare,
  Activity,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  CronogramaEvent,
  PostWorkshopQuestion,
  WorkshopWorkbookSubmission,
} from '../../../types';
import {
  generateWorkshopNotebookPdf,
  downloadWorkshopNotebookPdf,
} from '../../../services/notebookPdfGenerator';
import { OntologicalStore } from '../../../services/store';

interface EventEvaluationWorkbookSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
  onRefreshEvents?: () => void;
}

const DEFAULT_SAMPLE_QUESTIONS: PostWorkshopQuestion[] = [
  {
    id: 'pwq-1',
    question: '¿Cuál fue el quiebre, límite o comprensión principal que emergió durante esta sesión?',
    type: 'textarea',
    category: 'reflexion',
    required: true,
  },
  {
    id: 'pwq-2',
    question: '¿Qué sensación corporal o mensaje somático lograste decodificar con mayor claridad?',
    type: 'textarea',
    category: 'somatica',
    required: true,
  },
  {
    id: 'pwq-3',
    question: '¿Qué declaración de dignidad, basta o nuevo acuerdo te comprometes a sostener esta semana?',
    type: 'textarea',
    category: 'compromiso',
    required: true,
  },
  {
    id: 'pwq-4',
    question: '¿Cómo calificarías la profundidad y aplicabilidad de lo vivido en esta sesión (1 a 5)?',
    type: 'rating_scale',
    category: 'evaluacion',
    required: true,
  },
];

export const EventEvaluationWorkbookSection: React.FC<EventEvaluationWorkbookSectionProps> = ({
  event,
  onChange,
  onRefreshEvents,
}) => {
  const questions = event.postWorkshopQuestions && event.postWorkshopQuestions.length > 0
    ? event.postWorkshopQuestions
    : DEFAULT_SAMPLE_QUESTIONS;

  const submissions = event.workbookSubmissions || [];

  // Question builder state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'textarea' | 'text' | 'rating_scale'>('textarea');
  const [newQuestionCategory, setNewQuestionCategory] = useState<'reflexion' | 'somatica' | 'compromiso' | 'evaluacion'>('reflexion');

  // Simulation state to test participant submission
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState('Mariana Salazar');
  const [simEmail, setSimEmail] = useState('mariana.salazar@liderazgo.co');
  const [simPhone, setSimPhone] = useState('+57 300 456 7890');
  const [simAnswers, setSimAnswers] = useState<Record<string, string>>({
    'pwq-1': 'Descubrí que mi necesidad de control era un escudo contra el miedo a no ser suficiente.',
    'pwq-2': 'Sentí la apertura en mi pecho al respirar hondo y soltar la tensión de los hombros.',
    'pwq-3': 'Declaro que no asumiré tareas fuera del horario laboral pactado sin una conversación previa.',
    'pwq-4': '5',
  });

  // Selected submission preview
  const [selectedSubmission, setSelectedSubmission] = useState<WorkshopWorkbookSubmission | null>(null);

  // Handlers for questions
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: PostWorkshopQuestion = {
      id: 'pwq-' + Date.now(),
      question: newQuestionText.trim(),
      type: newQuestionType,
      category: newQuestionCategory,
      required: true,
    };

    onChange({ postWorkshopQuestions: [...questions, newQ] });
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (id: string) => {
    onChange({ postWorkshopQuestions: questions.filter((q) => q.id !== id) });
  };

  const handleResetDefaultQuestions = () => {
    onChange({ postWorkshopQuestions: DEFAULT_SAMPLE_QUESTIONS });
  };

  // Handler to download PDF template
  const handleDownloadBaseTemplatePdf = () => {
    if (!event.title) {
      alert('Por favor asegúrate de haber configurado el nombre del taller antes de descargar el cuaderno.');
      return;
    }
    downloadWorkshopNotebookPdf(event as CronogramaEvent, {
      includeAnswers: false,
    });
  };

  // Handler to download specific participant PDF
  const handleDownloadParticipantPdf = (sub: WorkshopWorkbookSubmission) => {
    downloadWorkshopNotebookPdf(event as CronogramaEvent, {
      participantSubmission: sub,
      includeAnswers: true,
    });
  };

  // Handler to simulate new submission
  const handleSaveSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) return;

    const newSub: WorkshopWorkbookSubmission = {
      id: 'sub-' + Date.now(),
      eventId: event.id || 'event-temp',
      participantName: simName.trim(),
      participantEmail: simEmail.trim(),
      participantPhone: simPhone.trim() || undefined,
      submittedAt: new Date().toISOString(),
      answers: simAnswers,
    };

    const updatedSubs = [newSub, ...submissions];
    onChange({ workbookSubmissions: updatedSubs });

    if (event.id) {
      OntologicalStore.updateCronogramaEvent(event.id, {
        workbookSubmissions: updatedSubs,
      });
      onRefreshEvents?.();
    }

    setShowSimulateModal(false);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'somatica':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-medium">
            Somática & Cuerpo
          </span>
        );
      case 'compromiso':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-medium">
            Compromiso & Basta
          </span>
        );
      case 'evaluacion':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-medium">
            Calificación
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-medium">
            Reflexión
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado descriptivo de la sección */}
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <FileCheck className="w-4 h-4" />
          <span>3. Evaluación y Generación de Cuaderno Descargable</span>
        </div>
        <h3 className="text-lg font-bold text-black dark:text-white mt-1">
          Cuestionario Posterior & Cuadernos de Memorias (PDF)
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
          Diseña el formulario de preguntas dinámicas sobre lo aprendido en la sesión y genera automáticamente el cuaderno consolidado en PDF para los participantes.
        </p>
      </div>

      {/* ACCIÓN PRINCIPAL DESTACADA: DESCARGA DE CUADERNO */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-black dark:text-white">
              Generador Automático de Cuaderno de Memorias (PDF)
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-400 font-light leading-relaxed max-w-xl">
            Compila el temario oficial, preguntas guía, materiales de soporte y las reflexiones del cuestionario en un documento editorial con membrete y formato ejecutivo de RBC.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadBaseTemplatePdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Cuaderno Base (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Respuesta de Asistente</span>
          </button>
        </div>
      </div>

      {/* SUB-SECCIÓN A: DISEÑADOR DEL CUESTIONARIO POSTERIOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
              A
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Cuestionario Posterior Dinámico
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              ({questions.length} preguntas activas)
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetDefaultQuestions}
            className="text-[11px] text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restablecer preguntas estándar</span>
          </button>
        </div>

        {/* Lista de preguntas del cuestionario */}
        <div className="space-y-2.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(q.category)}
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      {q.type === 'textarea' ? 'Texto Reflexivo' : q.type === 'rating_scale' ? 'Escala 1-5' : 'Respuesta Breve'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-black dark:text-white">
                    {q.question}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-md cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Formulario para añadir nueva pregunta */}
        <form
          onSubmit={handleAddQuestion}
          className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 space-y-3"
        >
          <span className="text-xs font-bold text-black dark:text-white block">
            + Agregar Pregunta al Cuestionario Posterior
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                Texto de la Pregunta
              </label>
              <input
                type="text"
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Ej: ¿Qué nuevo acuerdo relacional pactaste en este encuentro?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                Categoría Ontológica
              </label>
              <select
                value={newQuestionCategory}
                onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
              >
                <option value="reflexion">Reflexión / Quiebre</option>
                <option value="somatica">Mensaje Somático / Cuerpo</option>
                <option value="compromiso">Compromiso / Soberanía</option>
                <option value="evaluacion">Evaluación / Escala</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500">Tipo de Respuesta:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewQuestionType('textarea')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg cursor-pointer ${
                    newQuestionType === 'textarea'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                  }`}
                >
                  Texto Extenso
                </button>
                <button
                  type="button"
                  onClick={() => setNewQuestionType('rating_scale')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg cursor-pointer ${
                    newQuestionType === 'rating_scale'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                  }`}
                >
                  Escala 1 a 5
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Pregunta</span>
            </button>
          </div>
        </form>
      </div>

      {/* SUB-SECCIÓN B: RESPUESTAS RECIBIDAS & COMPILACIÓN DE CUADERNOS */}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
              B
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Cuadernos Compilados por Participante
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              ({submissions.length} respuestas registradas)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Registrar Nueva Respuesta</span>
          </button>
        </div>

        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {sub.participantName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-black dark:text-white">
                        {sub.participantName}
                      </h5>
                      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        {sub.participantEmail} •{' '}
                        {new Date(sub.submittedAt).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(selectedSubmission?.id === sub.id ? null : sub)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-[11px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{selectedSubmission?.id === sub.id ? 'Ocultar' : 'Ver Respuestas'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadParticipantPdf(sub)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Cuaderno PDF</span>
                    </button>
                  </div>
                </div>

                {/* Vista previa desplegable de respuestas */}
                {selectedSubmission?.id === sub.id && (
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-950/50 border border-gray-100 dark:border-neutral-800 space-y-3 animate-fade-in">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block uppercase tracking-wider">
                      Respuestas Registradas en el Cuaderno:
                    </span>
                    {questions.map((q) => {
                      const ans = sub.answers?.[q.id] || sub.answers?.[q.question];
                      return (
                        <div key={q.id} className="text-xs space-y-1">
                          <p className="font-semibold text-gray-700 dark:text-neutral-300">
                            {q.question}
                          </p>
                          <p className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-black dark:text-neutral-200 font-light italic">
                            {ans !== undefined && ans !== null ? String(ans) : '(Sin respuesta registrada)'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-center space-y-3">
            <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-black dark:text-white">
                Aún no hay respuestas de participantes para este taller
              </p>
              <p className="text-[11px] text-gray-400 font-light max-w-md mx-auto">
                Puedes probar la generación del cuaderno inmediatamente haciendo clic en "Simular Respuesta de Asistente".
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular Respuesta Ahora</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL PARA SIMULAR RESPUESTA DE PARTICIPANTE */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  Registrar / Simular Respuesta de Asistente
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSimulation} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Nombre del Participante
                  </label>
                  <input
                    type="text"
                    required
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-black dark:text-white block">
                  Respuestas al Cuestionario:
                </span>
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-[11px] text-gray-700 dark:text-neutral-300 font-medium mb-1">
                      {q.question}
                    </label>
                    <textarea
                      rows={2}
                      value={simAnswers[q.id] || ''}
                      onChange={(e) =>
                        setSimAnswers({
                          ...simAnswers,
                          [q.id]: e.target.value,
                        })
                      }
                      placeholder="Escribe la respuesta del participante..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Guardar y Habilitar Cuaderno PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
