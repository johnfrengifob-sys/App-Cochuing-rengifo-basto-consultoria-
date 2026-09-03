import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Activity,
  Compass,
} from 'lucide-react';
import { DynamicQuestionnaire, QuestionnaireQuestion, QuestionType } from '../../types';
import { OntologicalStore } from '../../services/store';

interface AdminQuestionnairesManagerProps {
  onRefresh?: () => void;
}

export const AdminQuestionnairesManager: React.FC<AdminQuestionnairesManagerProps> = ({ onRefresh }) => {
  const [questionnaires, setQuestionnaires] = useState<DynamicQuestionnaire[]>(() =>
    OntologicalStore.getQuestionnaires()
  );
  const [selectedId, setSelectedId] = useState<string>(
    () => questionnaires[0]?.id || 'questionnaire-step-1'
  );
  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeQuestionnaire =
    questionnaires.find((q) => q.id === selectedId) || questionnaires[0];
  const questions: QuestionnaireQuestion[] = activeQuestionnaire?.questions || [];

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const refreshList = () => {
    const fresh = OntologicalStore.getQuestionnaires();
    setQuestionnaires(fresh);
    if (onRefresh) onRefresh();
  };

  const handleOpenCreateQuestion = () => {
    setIsCreatingQuestion(true);
    setEditingQuestion({
      id: '',
      questionnaireId: activeQuestionnaire.id,
      label: '',
      type: 'textarea',
      category: 'lingüístico',
      placeholder: 'Escribe tu reflexión ontológica aquí...',
      helperText: 'Considera cómo este quiebre afecta tus acciones diarias.',
      required: true,
      order: questions.length + 1,
      options: [],
    });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (isCreatingQuestion) {
      OntologicalStore.addQuestionToQuestionnaire(activeQuestionnaire.id, {
        label: editingQuestion.label,
        type: editingQuestion.type,
        category: editingQuestion.category,
        placeholder: editingQuestion.placeholder,
        helperText: editingQuestion.helperText,
        required: editingQuestion.required,
        options: editingQuestion.options || [],
      });
      showNotification(`Pregunta agregada al cuestionario con éxito.`);
    } else {
      OntologicalStore.updateQuestionInQuestionnaire(
        activeQuestionnaire.id,
        editingQuestion.id,
        {
          label: editingQuestion.label,
          type: editingQuestion.type,
          category: editingQuestion.category,
          placeholder: editingQuestion.placeholder,
          helperText: editingQuestion.helperText,
          required: editingQuestion.required,
          options: editingQuestion.options || [],
        }
      );
      showNotification(`Pregunta actualizada.`);
    }

    setEditingQuestion(null);
    setIsCreatingQuestion(false);
    refreshList();
  };

  const handleDeleteQuestion = (questionId: string, label: string) => {
    if (window.confirm(`¿Eliminar la pregunta "${label.slice(0, 45)}..."?`)) {
      OntologicalStore.deleteQuestionFromQuestionnaire(activeQuestionnaire.id, questionId);
      refreshList();
      showNotification('Pregunta eliminada del cuestionario.');
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...questions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const ids = reordered.map((q) => q.id);
    OntologicalStore.reorderQuestionsInQuestionnaire(activeQuestionnaire.id, ids);
    refreshList();
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Restablecer todos los cuestionarios y preguntas a los valores de fábrica?')) {
      const fresh = OntologicalStore.resetQuestionnairesToDefault();
      setQuestionnaires(fresh);
      setSelectedId(fresh[0]?.id || 'questionnaire-step-1');
      if (onRefresh) onRefresh();
      showNotification('Cuestionarios y preguntas restablecidos al estándar original.');
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'somático':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      case 'lingüístico':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
      case 'emocional':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'acuerdos':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'textarea':
        return 'Texto Profundo (Párrafo)';
      case 'text':
        return 'Texto Corto (Línea)';
      case 'rating_scale':
        return 'Escala Numérica (1 a 10)';
      case 'select':
        return 'Selección Única / Opciones';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Gestor de Cuestionarios: Crear & Eliminar Preguntas</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
            Construye las preguntas de reflexión e indagación que los participantes completan en su Cuaderno Ontológico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
              previewMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700'
            }`}
          >
            {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Modo Editor' : 'Vista Previa'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold text-xs hover:bg-gray-200 cursor-pointer flex items-center gap-1.5"
            title="Restablecer preguntas estándar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateQuestion}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Pregunta</span>
          </button>
        </div>
      </div>

      {/* Questionnaire Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {questionnaires.map((q) => {
          const isSelected = q.id === selectedId;
          const count = (q.questions || []).length;
          return (
            <button
              key={q.id}
              onClick={() => setSelectedId(q.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#18181B] text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:border-gray-300'
              }`}
            >
              <span>{q.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                {count} {count === 1 ? 'pregunta' : 'preguntas'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questionnaire Context Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-black dark:text-white block text-sm">
            {activeQuestionnaire.title}
          </span>
          <p className="text-gray-500 dark:text-neutral-400 text-xs font-light mt-0.5">
            {activeQuestionnaire.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            {questions.length} Preguntas Activas
          </span>
          <button
            onClick={handleOpenCreateQuestion}
            className="px-3 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold cursor-pointer"
          >
            + Añadir
          </button>
        </div>
      </div>

      {/* PREVIEW MODE OR EDIT MODE */}
      {previewMode ? (
        /* Coachee Live Preview Mode */
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Simulación Vista del Coachee (Cuaderno Ontológico)</span>
            </span>
            <button
              onClick={() => setPreviewMode(false)}
              className="text-xs text-gray-400 hover:text-black dark:hover:text-white"
            >
              Volver al editor
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <label className="text-xs font-semibold text-black dark:text-white block">
                  {idx + 1}. {q.label} {q.required && <span className="text-rose-500">*</span>}
                </label>
                {q.helperText && (
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">{q.helperText}</p>
                )}

                {q.type === 'textarea' && (
                  <textarea
                    rows={3}
                    placeholder={q.placeholder || 'Respuesta reflexiva...'}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white"
                  />
                )}

                {q.type === 'text' && (
                  <input
                    type="text"
                    placeholder={q.placeholder || 'Escribe aquí...'}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white"
                  />
                )}

                {q.type === 'rating_scale' && (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-neutral-700 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'select' && (
                  <select className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white">
                    <option value="">Selecciona una opción...</option>
                    {(q.options || ['Opción A', 'Opción B']).map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Edit Mode: List of Questions with Create & Delete */
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#18181B] border border-dashed border-gray-200 dark:border-neutral-800 space-y-3">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500">Este cuestionario aún no tiene preguntas configuradas.</p>
              <button
                onClick={handleOpenCreateQuestion}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                + Crear Primera Pregunta
              </button>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-all text-xs"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {idx + 1}
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getCategoryColor(
                          q.category
                        )}`}
                      >
                        {q.category}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                        {getTypeLabel(q.type)}
                      </span>
                      {q.required ? (
                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                          Obligatoria
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Opcional</span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-black dark:text-white leading-snug">{q.label}</h4>

                    {q.helperText && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">{q.helperText}</p>
                    )}

                    {q.placeholder && (
                      <span className="text-[11px] text-gray-400 italic block">
                        Placeholder: "{q.placeholder}"
                      </span>
                    )}

                    {q.type === 'select' && q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-gray-400">Opciones:</span>
                        {q.options.map((opt, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Reorder, Edit, Delete */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Subir pregunta"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Bajar pregunta"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setEditingQuestion({ ...q });
                    }}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 cursor-pointer flex items-center gap-1 font-semibold text-xs px-2.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  {/* Delete button - User requirement */}
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id, q.label)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Crear / Editar Pregunta */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#18181B] w-full max-w-xl rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {isCreatingQuestion ? 'Crear Nueva Pregunta' : 'Editar Pregunta del Cuestionario'}
                </h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">
                  Para {activeQuestionnaire.title}
                </p>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Enunciado / Pregunta Ontológica *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.label}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  placeholder="Ej: ¿Qué juicio automático sobre tu capacidad apareció frente a este desafío?"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Tipo de Respuesta *
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        type: e.target.value as QuestionType,
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  >
                    <option value="textarea">Texto Profundo (Párrafo / Textarea)</option>
                    <option value="text">Texto Corto (Línea)</option>
                    <option value="rating_scale">Escala Numérica (1 a 10)</option>
                    <option value="select">Selección de Opciones</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Dimensión Ontológica *
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        category: e.target.value as QuestionnaireQuestion['category'],
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  >
                    <option value="somático">Somático (Cuerpo / Disposición)</option>
                    <option value="lingüístico">Lingüístico (Declaraciones / Juicios)</option>
                    <option value="emocional">Emocional (Estados de Ánimo)</option>
                    <option value="acuerdos">Acuerdos & Compromisos</option>
                    <option value="metodológico">Metodológico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Texto de Ayuda / Pauta Reflexiva (Helper Text)
                </label>
                <input
                  type="text"
                  value={editingQuestion.helperText || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, helperText: e.target.value })
                  }
                  placeholder="Ej: Recuerda distinguir entre los hechos comprobables y tu interpretación."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-neutral-300">
                  Placeholder / Texto de Ejemplo
                </label>
                <input
                  type="text"
                  value={editingQuestion.placeholder || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })
                  }
                  placeholder="Ej: Registro visceral, tensión muscular observada..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                />
              </div>

              {editingQuestion.type === 'select' && (
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-neutral-300">
                    Opciones de Selección (Separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={(editingQuestion.options || []).join(', ')}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Opción 1, Opción 2, Opción 3"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={editingQuestion.required}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, required: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="reqCheck" className="font-semibold text-black dark:text-white cursor-pointer">
                  Marcar como pregunta obligatoria para avanzar
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Pregunta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
